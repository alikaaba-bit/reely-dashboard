const MERCURY_API_BASE = 'https://api.mercury.com/api/v1'

export interface MercuryAccount {
  id: string
  name: string
  type: string
  currentBalance: number
  availableBalance: number
  currency: string
}

export interface AccountSummary {
  name: string
  balance: number
  type: 'mercury' | 'highbeam'
  accountId?: string
}

export interface MercuryTransaction {
  id: string
  amount: number
  description: string
  date: string
  type: 'debit' | 'credit'
}

export async function getMercuryAccounts(): Promise<MercuryAccount[]> {
  const apiKey = process.env.MERCURY_API_KEY
  if (!apiKey) throw new Error('MERCURY_API_KEY not configured')

  const response = await fetch(`${MERCURY_API_BASE}/accounts`, {
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
  })

  if (!response.ok) throw new Error(`Mercury API error: ${response.status} ${response.statusText}`)

  const data = await response.json()
  return data.accounts || []
}

export async function getAllAccountsWithHighbeam(): Promise<AccountSummary[]> {
  const accounts: AccountSummary[] = []

  try {
    const mercuryAccounts = await getMercuryAccounts()
    for (const acc of mercuryAccounts) {
      accounts.push({
        name: acc.name || 'Mercury Checking',
        balance: acc.currentBalance || 0,
        type: 'mercury',
        accountId: acc.id,
      })
    }
  } catch (err) {
    console.error('Mercury fetch failed:', err)
  }

  // Always add Highbeam from env var (no public API available)
  const highbeamBalance = parseFloat(process.env.HIGHBEAM_BALANCE || '29074.35')
  accounts.push({ name: 'Highbeam', balance: highbeamBalance, type: 'highbeam' })

  return accounts
}

export async function getTotalBalance(): Promise<number> {
  const accounts = await getAllAccountsWithHighbeam()
  return accounts.reduce((sum, acc) => sum + acc.balance, 0)
}

export async function getTransactions(accountId: string, days: number = 30): Promise<MercuryTransaction[]> {
  const apiKey = process.env.MERCURY_API_KEY
  if (!apiKey) throw new Error('MERCURY_API_KEY not configured')

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const response = await fetch(
    `${MERCURY_API_BASE}/account/${accountId}/transactions?` +
    `start=${startDate.toISOString().split('T')[0]}&end=${endDate.toISOString().split('T')[0]}`,
    { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
  )

  if (!response.ok) throw new Error(`Mercury transaction error: ${response.statusText}`)

  const data = await response.json()
  return data.transactions || []
}
