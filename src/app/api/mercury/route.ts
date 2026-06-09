import { NextResponse } from 'next/server'
import { getAllAccountsWithHighbeam, getBalanceHistory, type AccountSummary } from '@/lib/mercury'
import { mockMercuryData } from '@/lib/mock-data'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

interface ManualBalances {
  highbeam: number
  wise: number
}

// Manual (non-API) cash accounts the user fills in from the dashboard.
async function getManualBalances(): Promise<ManualBalances> {
  const highbeamFallback = parseFloat(process.env.HIGHBEAM_BALANCE || '55082.51')
  const balances: ManualBalances = { highbeam: highbeamFallback, wise: 0 }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    const { data } = await supabase
      .from('manual_balances')
      .select('account_name, balance')

    for (const row of data || []) {
      const value = parseFloat(row.balance)
      if (isNaN(value)) continue
      if (row.account_name === 'Highbeam') balances.highbeam = value
      if (row.account_name === 'Wise') balances.wise = value
    }
  } catch {
    // fall through to fallbacks
  }

  return balances
}

function manualAccounts({ highbeam, wise }: ManualBalances): AccountSummary[] {
  return [
    { name: 'Highbeam', balance: highbeam, type: 'highbeam' },
    { name: 'Wise', balance: wise, type: 'wise' },
  ]
}

export async function GET() {
  const manual = await getManualBalances()
  const manualTotal = manual.highbeam + manual.wise

  const hasMercuryKey = process.env.MERCURY_API_KEY &&
    !process.env.MERCURY_API_KEY.includes('placeholder')

  if (!hasMercuryKey) {
    const mockAccounts: AccountSummary[] = [
      { name: 'Mercury Checking', balance: 47832, type: 'mercury' },
      ...manualAccounts(manual),
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
    // getAllAccountsWithHighbeam appends its own env-based Highbeam — drop it
    // and use the live manual balances instead.
    const mercuryAccounts = (await getAllAccountsWithHighbeam())
      .filter(acc => acc.type === 'mercury')
    const accounts: AccountSummary[] = [...mercuryAccounts, ...manualAccounts(manual)]
    const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0)

    let history = mockMercuryData.history
    try {
      const mercuryHistory = await getBalanceHistory(mercuryAccounts, 30)
      if (mercuryHistory.length > 0) {
        history = mercuryHistory.map(h => ({
          date: h.date,
          balance: Math.round((h.balance + manualTotal) * 100) / 100,
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
      source: 'mercury+manual',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Mercury API error:', error)
    const fallbackAccounts = manualAccounts(manual)
    return NextResponse.json({
      accounts: fallbackAccounts,
      totalBalance: manualTotal,
      balance: manualTotal,
      history: mockMercuryData.history,
      error: String(error),
      mockMode: true,
      source: 'fallback',
      timestamp: new Date().toISOString(),
    })
  }
}
