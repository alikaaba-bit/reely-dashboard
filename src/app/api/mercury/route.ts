import { NextResponse } from 'next/server'
import { getAllAccountsWithHighbeam, getBalanceHistory } from '@/lib/mercury'
import { getBankBalances, isXeroConnected } from '@/lib/xero'
import { mockMercuryData } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const highbeamBalance = parseFloat(process.env.HIGHBEAM_BALANCE || '29074.35')

  // Try Xero first for both Mercury and Highbeam balances
  try {
    const xeroConnected = await isXeroConnected()
    if (xeroConnected) {
      const xeroData = await getBankBalances()
      if (xeroData.accounts.length > 0) {
        // Map Xero bank accounts to our format
        const accounts = xeroData.accounts.map(acc => {
          const nameLower = acc.name.toLowerCase()
          const type = nameLower.includes('mercury') ? 'mercury' as const
            : nameLower.includes('highbeam') ? 'highbeam' as const
            : 'mercury' as const // Default to mercury for unknown bank accounts
          return {
            name: acc.name,
            balance: acc.balance,
            type,
          }
        })

        const totalBalance = accounts.reduce((s, a) => s + a.balance, 0)

        // Try to get balance history from Mercury API for sparkline
        let history = mockMercuryData.history
        const hasMercuryKey = process.env.MERCURY_API_KEY &&
          !process.env.MERCURY_API_KEY.includes('placeholder')
        if (hasMercuryKey) {
          try {
            const mercuryAccounts = await getAllAccountsWithHighbeam()
            const mercuryHistory = await getBalanceHistory(mercuryAccounts, 30)
            if (mercuryHistory.length > 0) {
              history = mercuryHistory
            }
          } catch (histErr) {
            console.error('Mercury history fetch error:', histErr)
          }
        }

        return NextResponse.json({
          accounts,
          totalBalance,
          balance: totalBalance,
          history,
          source: 'xero',
          timestamp: new Date().toISOString(),
        })
      }
    }
  } catch (xeroErr) {
    console.error('Xero bank balance fetch failed, falling back to Mercury:', xeroErr)
  }

  // Fallback: Mercury API + Highbeam env var
  const hasMercuryKey = process.env.MERCURY_API_KEY &&
    !process.env.MERCURY_API_KEY.includes('placeholder')

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
      source: 'mock',
      timestamp: new Date().toISOString(),
    })
  }

  try {
    const accounts = await getAllAccountsWithHighbeam()
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

    let history = mockMercuryData.history
    try {
      const mercuryHistory = await getBalanceHistory(accounts, 30)
      if (mercuryHistory.length > 0) {
        history = mercuryHistory.map(h => ({
          date: h.date,
          balance: Math.round((h.balance + highbeamBalance) * 100) / 100,
        }))
      }
    } catch (histErr) {
      console.error('Balance history error:', histErr)
    }

    return NextResponse.json({
      accounts,
      totalBalance,
      balance: totalBalance,
      history,
      source: 'mercury',
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
      source: 'fallback',
      timestamp: new Date().toISOString(),
    })
  }
}
