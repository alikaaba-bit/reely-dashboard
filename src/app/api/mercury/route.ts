import { NextResponse } from 'next/server'
import { getAllAccountsWithHighbeam, getBalanceHistory } from '@/lib/mercury'
import { mockMercuryData } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasMercuryKey = process.env.MERCURY_API_KEY &&
    !process.env.MERCURY_API_KEY.includes('placeholder')

  const highbeamBalance = parseFloat(process.env.HIGHBEAM_BALANCE || '29074.35')

  if (!hasMercuryKey) {
    const mockAccounts = [
      { name: 'Mercury Checking', balance: 47832, type: 'mercury' as const },
      { name: 'Highbeam', balance: highbeamBalance, type: 'highbeam' as const },
    ]
    return NextResponse.json({
      accounts: mockAccounts,
      totalBalance: mockAccounts.reduce((s, a) => s + a.balance, 0),
      balance: mockAccounts.reduce((s, a) => s + a.balance, 0),
      history: mockMercuryData.history,
      mockMode: true,
      timestamp: new Date().toISOString(),
    })
  }

  try {
    const accounts = await getAllAccountsWithHighbeam()
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

    // Build real balance history from Mercury transactions
    let history = mockMercuryData.history
    try {
      const mercuryHistory = await getBalanceHistory(accounts, 30)
      if (mercuryHistory.length > 0) {
        // Add Highbeam balance to each Mercury data point for combined total
        history = mercuryHistory.map(h => ({
          date: h.date,
          balance: Math.round((h.balance + highbeamBalance) * 100) / 100,
        }))
      }
    } catch (histErr) {
      console.error('Balance history error:', histErr)
      // Fall through to mock history
    }

    return NextResponse.json({
      accounts,
      totalBalance,
      balance: totalBalance,
      history,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Mercury API error:', error)
    const fallbackAccounts = [
      { name: 'Highbeam', balance: highbeamBalance, type: 'highbeam' as const },
    ]
    return NextResponse.json({
      accounts: fallbackAccounts,
      totalBalance: highbeamBalance,
      balance: highbeamBalance,
      history: mockMercuryData.history,
      error: String(error),
      mockMode: true,
      timestamp: new Date().toISOString(),
    })
  }
}
