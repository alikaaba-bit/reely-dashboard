import { NextResponse } from 'next/server'
import { getValidToken } from '@/lib/xero'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const { access_token, tenant_id } = await getValidToken()

    // Fetch raw BankSummary report
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
      const err = await response.text()
      return NextResponse.json({ error: err, status: response.status }, { status: 500 })
    }

    const raw = await response.json()
    return NextResponse.json(raw)
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
