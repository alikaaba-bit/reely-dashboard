import { NextResponse } from 'next/server'
import { getAllAccountsWithHighbeam, getBalanceHistory } from '@/lib/mercury'
import { mockMercuryData } from '@/lib/mock-data'
import { createClient } from '@supabase/supabase-js'
import { getBankBalances, isXeroConnected } from '@/lib/xero'

export const dynamic = 'force-dynamic'

async function getHighbeamBalance(): Promise<{ balance: number; source: string }> {
  // 1. Try Xero first — if connected, pull live bank balances
  try {
    const connected = await isXeroConnected()
    if (connected) {
      const { accounts } = await getBankBalances()
      // Look for Highbeam account (match by name, case-insensitive)
      const highbeamAccount = accounts.find(a =>
        a.name.toLowerCase().includes('highbeam')
      )
      if (highbeamAccount && highbeamAccount.balance !== 0) {
        console.log('Highbeam balance from Xero:', highbeamAccount.balance)
        return { balance: highbeamAccount.balance, source: 'xero' }
      }
      // If Xero returned accounts but none matched "highbeam", try any bank account
      // that isn't Mercury (Highbeam might be named differently in Xero)
      if (accounts.length > 0) {
        const nonMercury = accounts.filter(a =>
          !a.name.toLowerCase().includes('mercury')
        )
        if (nonMercury.length === 1 && nonMercury[0].balance !== 0) {
          console.log('Highbeam balance from Xero (non-Mercury match):', nonMercury[0].balance, '- account:', nonMercury[0].name)
          return { balance: nonMercury[0].balance, source: 'xero' }
        }
      }
      console.log('Xero connected but no Highbeam account found or balance is 0. Accounts:', accounts.map(a => `${a.name}: ${a.balance}`))
    }
  } catch (err) {
    console.error('Xero Highbeam fetch failed, falling back:', err)
  }

  // 2. Try Supabase manual_balances
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
      return { balance: parseFloat(data.balance), source: 'supabase' }
    }
  } catch {
    // fall through
  }

  // 3. Fall back to env var
  return { balance: parseFloat(process.env.HIGHBEAM_BALANCE || '49498.53'), source: 'env' }
}

export async function GET() {
  const { balance: highbeamBalance, source: highbeamSource } = await getHighbeamBalance()

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
      highbeamSource,
      timestamp: new Date().toISOString(),
    })
  }

  try {
    const accounts = await getAllAccountsWithHighbeam()
    // Override Highbeam balance with best available value
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
      highbeamSource,
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
      highbeamSource,
      timestamp: new Date().toISOString(),
    })
  }
}
