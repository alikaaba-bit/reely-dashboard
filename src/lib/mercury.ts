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
  type: 'mercury' | 'highbeam' | 'wise'
  accountId?: string
}

export interface DailyBalance {
  date: string
  balance: number
}

function getAuthHeader() {
  const apiKey = process.env.MERCURY_API_KEY
  if (!apiKey) throw new Error('MERCURY_API_KEY not configured')
  return { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
}

export async function getMercuryAccounts(): Promise<MercuryAccount[]> {
  const response = await fetch(`${MERCURY_API_BASE}/accounts`, {
    headers: getAuthHeader(),
  })
  if (!response.ok) throw new Error(`Mercury API error: ${response.statusText}`)
  const data = await response.json()
  return data.accounts || []
}

export async function getAllAccountsWithHighbeam(): Promise<AccountSummary[]> {
  const accounts: AccountSummary[] = []

  try {
    const mercuryAccounts = await getMercuryAccounts()
    for (const acc of mercuryAccounts) {
      accounts.push({
        name: acc.name || 'Mercury Account',
        balance: acc.currentBalance || 0,
        type: 'mercury',
        accountId: acc.id,
      })
    }
  } catch (err) {
    console.error('Mercury fetch failed:', err)
  }

  const highbeamBalance = parseFloat(process.env.HIGHBEAM_BALANCE || '29074.35')
  accounts.push({ name: 'Highbeam', balance: highbeamBalance, type: 'highbeam' })

  return accounts
}

export async function getBalanceHistory(
  mercuryAccounts: AccountSummary[],
  days: number = 30
): Promise<DailyBalance[]> {
  const apiKey = process.env.MERCURY_API_KEY
  if (!apiKey) return []

  const end = new Date()
  const start = new Date()
  start.setDate(start.getDate() - days)

  const startStr = start.toISOString().split('T')[0]
  const endStr = end.toISOString().split('T')[0]

  const response = await fetch(
    `${MERCURY_API_BASE}/transactions?limit=500&start=${startStr}&end=${endStr}`,
    { headers: getAuthHeader() }
  )
  if (!response.ok) throw new Error(`Mercury transactions error: ${response.statusText}`)

  const data = await response.json()
  const allTxns: { amount: number; postedAt: string; accountId: string; status: string }[] = data.transactions || []

  // Only include bank account transactions (not credit card), only successful ones
  const bankAccountIds = new Set(mercuryAccounts.filter(a => a.type === 'mercury').map(a => a.accountId))
  const txns = allTxns.filter(t => bankAccountIds.has(t.accountId) && t.status === 'sent')

  // Current Mercury total balance (as of right now)
  const mercuryTotal = mercuryAccounts
    .filter(a => a.type === 'mercury')
    .reduce((sum, a) => sum + a.balance, 0)

  // Group transactions by date
  const byDate: Record<string, number> = {}
  for (const t of txns) {
    const day = t.postedAt.split('T')[0]
    byDate[day] = (byDate[day] || 0) + t.amount
  }

  // Build daily balance working backwards from today
  // balance[date] = balance at END of that date
  const result: DailyBalance[] = []
  let running = mercuryTotal

  // Generate last N days
  for (let i = 0; i <= days; i++) {
    const d = new Date(end)
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]

    result.unshift({ date: dateStr, balance: Math.round(running * 100) / 100 })

    // Go back one more day: undo the transactions that happened on this date
    if (byDate[dateStr]) {
      running -= byDate[dateStr]
    }
  }

  return result
}
