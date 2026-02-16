// Mercury Bank API Client
const MERCURY_API_BASE = 'https://api.mercury.com/api/v1'

export interface MercuryAccount {
  id: string
  name: string
  type: string
  currentBalance: number
  availableBalance: number
  currency: string
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
  if (!apiKey) {
    throw new Error('MERCURY_API_KEY not configured')
  }

  const response = await fetch(`${MERCURY_API_BASE}/accounts`, {
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Mercury API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.accounts || []
}

export async function getTotalBalance(): Promise<number> {
  const accounts = await getMercuryAccounts()
  return accounts.reduce((sum, acc) => sum + (acc.currentBalance || 0), 0)
}

export async function getTransactions(accountId: string, days: number = 30): Promise<MercuryTransaction[]> {
  const apiKey = process.env.MERCURY_API_KEY
  if (!apiKey) {
    throw new Error('MERCURY_API_KEY not configured')
  }

  const endDate = new Date()
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const response = await fetch(
    `${MERCURY_API_BASE}/account/${accountId}/transactions?` +
    `start=${startDate.toISOString().split('T')[0]}&` +
    `end=${endDate.toISOString().split('T')[0]}`,
    {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!response.ok) {
    throw new Error(`Mercury API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.transactions || []
}
