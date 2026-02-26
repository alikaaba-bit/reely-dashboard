import { NextResponse } from 'next/server'
import { getValidToken } from '@/lib/xero'

export const dynamic = 'force-dynamic'

async function xeroFetch(url: string, accessToken: string, tenantId: string) {
  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Xero-Tenant-Id': tenantId,
      'Accept': 'application/json',
    },
  })
  if (!response.ok) {
    return { error: await response.text(), status: response.status }
  }
  return await response.json()
}

export async function GET(request: Request) {
  try {
    const { access_token, tenant_id } = await getValidToken()

    // Try multiple endpoints to find live bank balances
    const [bankSummary, statements, accounts] = await Promise.all([
      // 1. BankSummary report (accounting/reconciled balances)
      xeroFetch('https://api.xero.com/api.xro/2.0/Reports/BankSummary', access_token, tenant_id),
      // 2. Statements endpoint (bank feed statement balances - the LIVE balance)
      xeroFetch('https://api.xero.com/api.xro/2.0/Statements', access_token, tenant_id),
      // 3. Accounts with Type=BANK (account list, no balances)
      xeroFetch('https://api.xero.com/api.xro/2.0/Accounts?where=Type%3D%3D%22BANK%22', access_token, tenant_id),
    ])

    return NextResponse.json({
      bankSummary,
      statements,
      accounts,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
