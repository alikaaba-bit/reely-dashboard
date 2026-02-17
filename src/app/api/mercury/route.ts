import { NextResponse } from 'next/server'
import { getAllAccountsWithHighbeam } from '@/lib/mercury'
import { mockMercuryData } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const hasMercuryKey = process.env.MERCURY_API_KEY &&
    !process.env.MERCURY_API_KEY.includes('placeholder')

  // Always include Highbeam from env var
  const highbeamBalance = parseFloat(process.env.HIGHBEAM_BALANCE || '29074.35')

  if (!hasMercuryKey) {
    // Mock mode: show placeholder Mercury + real Highbeam env var
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

    // Try to get transaction history from first Mercury account for sparkline
    let history = mockMercuryData.history
    const mercuryAccount = accounts.find(a => a.type === 'mercury' && a.accountId)
    if (mercuryAccount?.accountId) {
      try {
        const { getTransactions } = await import('@/lib/mercury')
        const transactions = await getTransactions(mercuryAccount.accountId, 30)

        if (transactions.length > 0) {
          // Build daily balance from transactions (running total)
          const dailyMap: Record<string, number> = {}
          let running = totalBalance
          const sorted = [...transactions].sort((a, b) => b.date.localeCompare(a.date))
          for (const t of sorted) {
            const day = t.date.split('T')[0]
            running -= t.amount
            dailyMap[day] = running
          }
          history = Object.entries(dailyMap)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, balance]) => ({ date, balance: Math.round(balance) }))
        }
      } catch {
        // Use mock history as fallback
      }
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

    // Partial fallback: Mercury failed but Highbeam still shows
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
