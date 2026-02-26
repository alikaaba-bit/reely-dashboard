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

  console.log('Xero tokens stored, expires at:', expiresAt)
}

/**
 * Get a valid access token, refreshing if expired
 */
export async function getValidToken(): Promise<{ access_token: string; tenant_id: string }> {
  // Check in-memory cache first (still valid with 2min buffer)
  if (cachedToken && cachedToken.expires_at > Date.now() + 120_000) {
    console.log('Xero: Using cached token, expires in', Math.round((cachedToken.expires_at - Date.now()) / 1000), 'seconds')
    return { access_token: cachedToken.access_token, tenant_id: cachedToken.tenant_id }
  }

  console.log('Xero: Cache miss or expired, checking DB...')
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('xero_tokens')
    .select('*')
    .eq('id', 'default')
    .single()

  if (error || !data) {
    console.error('Xero: No tokens in DB:', error)
    throw new Error('No Xero tokens found. Please connect Xero first.')
  }

  const tokens = data as XeroTokens
  const expiresAt = new Date(tokens.expires_at).getTime()
  const now = Date.now()

  console.log('Xero: Token from DB, expires_at:', tokens.expires_at, '| now:', new Date(now).toISOString(), '| expired:', expiresAt <= now + 120_000)

  // If token is still valid (with 2min buffer), use it
  if (expiresAt > now + 120_000) {
    cachedToken = {
      access_token: tokens.access_token,
      tenant_id: tokens.tenant_id || '',
      expires_at: expiresAt,
    }
    return { access_token: tokens.access_token, tenant_id: tokens.tenant_id || '' }
  }

  // Token expired — refresh it
  console.log('Xero: Access token expired, refreshing with refresh_token...')
  return await refreshAccessToken(tokens.refresh_token, tokens.tenant_id || '')
}

/**
 * Force a token refresh (used when API returns 401 despite valid-looking token)
 */
export async function forceRefreshToken(): Promise<{ access_token: string; tenant_id: string }> {
  console.log('Xero: Force refreshing token...')
  cachedToken = null // Clear cache

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
  return await refreshAccessToken(tokens.refresh_token, tokens.tenant_id || '')
}

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(
  refreshToken: string,
  tenantId: string
): Promise<{ access_token: string; tenant_id: string }> {
  console.log('Xero: Calling token endpoint with refresh_token (length:', refreshToken.length, ')')

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
    console.error('Xero token refresh failed (status:', response.status, '):', errText)
    throw new Error('Xero token refresh failed. Please reconnect Xero.')
  }

  const tokenData = await response.json()
  console.log('Xero: Token refresh successful, new expires_in:', tokenData.expires_in)

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
    const errText = await response.text()
    console.error('Xero connections failed:', errText)
    throw new Error('Failed to fetch Xero connections')
  }

  const connections = await response.json()
  console.log('Xero: Found', connections.length, 'connected organizations')

  if (!connections.length) {
    throw new Error('No Xero organizations connected')
  }

  return connections[0].tenantId
}

/**
 * Make an authenticated Xero API call with automatic retry on 401
 */
async function xeroApiCall(url: string, retried = false): Promise<Response> {
  const { access_token, tenant_id } = await getValidToken()

  if (!tenant_id) {
    throw new Error('No Xero tenant ID. Please reconnect Xero.')
  }

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${access_token}`,
      'Xero-Tenant-Id': tenant_id,
      'Accept': 'application/json',
    },
  })

  // On 401, force refresh and retry once
  if (response.status === 401 && !retried) {
    console.log('Xero: Got 401, forcing token refresh and retrying...')
    await forceRefreshToken()
    return xeroApiCall(url, true)
  }

  return response
}

/**
 * Fetch bank account balances from Xero
 * Tries BankSummary report first, falls back to Accounts endpoint
 */
export async function getBankBalances(): Promise<{
  accounts: { name: string; balance: number; accountId: string }[]
  totalBalance: number
}> {
  // Try BankSummary report first (most accurate for balances)
  try {
    const response = await xeroApiCall('https://api.xero.com/api.xro/2.0/Reports/BankSummary')

    if (response.ok) {
      const data = await response.json()
      const accounts = parseBankSummary(data)
      if (accounts.length > 0) {
        const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)
        console.log('Xero: BankSummary returned', accounts.length, 'accounts, total:', totalBalance)
        return { accounts, totalBalance }
      }
    } else {
      const errText = await response.text()
      console.error('Xero BankSummary failed (status:', response.status, '):', errText)
    }
  } catch (err) {
    console.error('Xero BankSummary error:', err)
  }

  // Fallback: Use Accounts endpoint for bank accounts
  console.log('Xero: Falling back to Accounts endpoint...')
  const response = await xeroApiCall(
    'https://api.xero.com/api.xro/2.0/Accounts?where=Type%3D%3D%22BANK%22'
  )

  if (!response.ok) {
    const errText = await response.text()
    console.error('Xero Accounts failed:', errText)
    throw new Error(`Xero API error: ${response.status}`)
  }

  const data = await response.json()
  const accounts = (data.Accounts || []).map((acc: { Name: string; AccountID: string; BankAccountNumber?: string }) => ({
    name: acc.Name || 'Unknown',
    balance: 0, // Accounts endpoint doesn't return live balances
    accountId: acc.AccountID || '',
  }))

  // If Accounts endpoint worked but has no balances, try to get balances from bank transactions
  // For now, return what we have
  const totalBalance = accounts.reduce((sum: number, a: { balance: number }) => sum + a.balance, 0)
  console.log('Xero: Accounts endpoint returned', accounts.length, 'bank accounts')
  return { accounts, totalBalance }
}

/**
 * Parse the BankSummary report structure
 * Columns: [0] Account Name, [1] Opening Balance, [2] Cash Received, [3] Cash Spent, [4] Closing Balance
 */
function parseBankSummary(data: Record<string, unknown>): { name: string; balance: number; accountId: string }[] {
  const accounts: { name: string; balance: number; accountId: string }[] = []
  const reports = data.Reports as Array<{ Rows?: Array<{ RowType: string; Rows?: Array<{ RowType: string; Cells?: Array<{ Value?: string; Attributes?: Array<{ Value?: string }> }> }> }> }> | undefined

  const report = reports?.[0]
  if (!report?.Rows) return accounts

  for (const section of report.Rows) {
    if (section.RowType === 'Section' && section.Rows) {
      for (const row of section.Rows) {
        if (row.RowType === 'Row' && row.Cells) {
          const name = row.Cells[0]?.Value || 'Unknown'
          // Column 4 = Closing Balance (not column 1 which is Opening Balance)
          const balance = parseFloat(row.Cells[4]?.Value || row.Cells[1]?.Value || '0')
          const accountId = row.Cells[0]?.Attributes?.[0]?.Value || ''
          if (name && !isNaN(balance)) {
            accounts.push({ name, balance, accountId })
          }
        }
      }
    }
  }

  return accounts
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
