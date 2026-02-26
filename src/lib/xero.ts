import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

function getSupabase() {
  return createClient(supabaseUrl, supabaseKey)
}

interface XeroTokens {
  access_token: string
  refresh_token: string
  tenant_id: string | null
  expires_at: string
}

// In-memory cache for access token (avoid DB hit on every request)
let cachedToken: { access_token: string; tenant_id: string; expires_at: number } | null = null

/**
 * Store Xero tokens in Supabase after OAuth callback
 */
export async function storeTokens(
  accessToken: string,
  refreshToken: string,
  expiresIn: number,
  tenantId?: string
) {
  const supabase = getSupabase()
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  const { error } = await supabase
    .from('xero_tokens')
    .upsert({
      id: 'default',
      access_token: accessToken,
      refresh_token: refreshToken,
      tenant_id: tenantId || null,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error('Failed to store Xero tokens:', error)
    throw new Error('Token storage failed')
  }

  // Update in-memory cache
  cachedToken = {
    access_token: accessToken,
    tenant_id: tenantId || '',
    expires_at: Date.now() + expiresIn * 1000,
  }

  console.log('Xero tokens stored successfully, expires at:', expiresAt)
}

/**
 * Get a valid access token, refreshing if expired
 */
export async function getValidToken(): Promise<{ access_token: string; tenant_id: string }> {
  // Check in-memory cache first (still valid with 2min buffer)
  if (cachedToken && cachedToken.expires_at > Date.now() + 120_000) {
    return { access_token: cachedToken.access_token, tenant_id: cachedToken.tenant_id }
  }

  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('xero_tokens')
    .select('*')
    .eq('id', 'default')
    .single()

  if (error || !data) {
    throw new Error('No Xero tokens found. Please connect Xero first.')
  }

  const tokens = data as XeroTokens
  const expiresAt = new Date(tokens.expires_at).getTime()

  // If token is still valid (with 2min buffer), use it
  if (expiresAt > Date.now() + 120_000) {
    cachedToken = {
      access_token: tokens.access_token,
      tenant_id: tokens.tenant_id || '',
      expires_at: expiresAt,
    }
    return { access_token: tokens.access_token, tenant_id: tokens.tenant_id || '' }
  }

  // Token expired — refresh it
  console.log('Xero access token expired, refreshing...')
  return await refreshAccessToken(tokens.refresh_token, tokens.tenant_id || '')
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(
  refreshToken: string,
  tenantId: string
): Promise<{ access_token: string; tenant_id: string }> {
  const response = await fetch('https://identity.xero.com/connect/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(
        `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
      ).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    }).toString(),
  })

  if (!response.ok) {
    const errText = await response.text()
    console.error('Xero token refresh failed:', errText)
    throw new Error('Xero token refresh failed. Please reconnect Xero.')
  }

  const tokenData = await response.json()

  // Store the new tokens (refresh token rotates)
  await storeTokens(
    tokenData.access_token,
    tokenData.refresh_token,
    tokenData.expires_in,
    tenantId
  )

  return { access_token: tokenData.access_token, tenant_id: tenantId }
}

/**
 * Fetch the connected Xero tenant (organization) ID
 */
export async function fetchTenantId(accessToken: string): Promise<string> {
  const response = await fetch('https://api.xero.com/connections', {
    headers: { 'Authorization': `Bearer ${accessToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to fetch Xero connections')
  }

  const connections = await response.json()
  if (!connections.length) {
    throw new Error('No Xero organizations connected')
  }

  // Use the first connected org
  return connections[0].tenantId
}

/**
 * Fetch bank account balances from Xero BankSummary report
 */
export async function getBankBalances(): Promise<{
  accounts: { name: string; balance: number; accountId: string }[]
  totalBalance: number
}> {
  const { access_token, tenant_id } = await getValidToken()

  if (!tenant_id) {
    throw new Error('No Xero tenant ID. Please reconnect Xero.')
  }

  // Use the BankSummary report for live balances
  const response = await fetch(
    'https://api.xero.com/api.xro/2.0/Reports/BankSummary',
    {
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Xero-Tenant-Id': tenant_id,
        'Accept': 'application/json',
      },
    }
  )

  if (!response.ok) {
    const errText = await response.text()
    console.error('Xero BankSummary failed:', errText)
    throw new Error(`Xero API error: ${response.status}`)
  }

  const data = await response.json()
  const accounts: { name: string; balance: number; accountId: string }[] = []

  // Parse the BankSummary report structure
  // Reports have Rows, each row has Cells
  const report = data.Reports?.[0]
  if (report?.Rows) {
    for (const section of report.Rows) {
      if (section.RowType === 'Section' && section.Rows) {
        for (const row of section.Rows) {
          if (row.RowType === 'Row' && row.Cells) {
            const name = row.Cells[0]?.Value || 'Unknown'
            const balance = parseFloat(row.Cells[1]?.Value || '0')
            const accountId = row.Cells[0]?.Attributes?.[0]?.Value || ''
            if (name && !isNaN(balance)) {
              accounts.push({ name, balance, accountId })
            }
          }
        }
      }
    }
  }

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
  return { accounts, totalBalance }
}

/**
 * Check if Xero is connected (tokens exist in DB)
 */
export async function isXeroConnected(): Promise<boolean> {
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('xero_tokens')
      .select('id')
      .eq('id', 'default')
      .single()
    return !error && !!data
  } catch {
    return false
  }
}
