import { NextResponse } from 'next/server'
import { getBankBalances, isXeroConnected } from '@/lib/xero'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const connected = await isXeroConnected()
    if (!connected) {
      return NextResponse.json(
        { error: 'Xero not connected', connected: false },
        { status: 401 }
      )
    }

    const { accounts, totalBalance } = await getBankBalances()

    return NextResponse.json({
      accounts,
      totalBalance,
      connected: true,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Xero bank accounts error:', error)
    return NextResponse.json(
      { error: String(error), connected: false },
      { status: 500 }
    )
  }
}
