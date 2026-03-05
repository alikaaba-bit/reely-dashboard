import { NextResponse } from 'next/server'
import { getAllAccountsWithHighbeam, getBalanceHistory } from '@/lib/mercury'
import { mockMercuryData } from '@/lib/mock-data'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

async function getHighbeamBalance(): Promise<number> {
  // 1. Try Supabase manual_balances
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
    const { data } = await supabase
      .from('manual_balances')
      .select('balance')
      .eq('account_name', 'Highbeam')
      .single()

    if (data?.balance) {
      return parseFloat(data.balance)
    }
  } catch {
    // fall through
  }

  // 2. Fall back to env var
  return parseFloat(process.env.HIGHBEAM_BALANCE || '55082.51')
}

export async function GET() {
  const highbeamBalance = await getHighbeamBalance()

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
    for (const acc of accounts) {
      if (acc.type === 'highbeam') {
        acc.balance = highbeamBalance
        acc.name = 'Highbeam'
      }
    }
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
      source: 'mercury+highbeam',
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
