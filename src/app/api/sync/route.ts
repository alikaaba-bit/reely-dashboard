import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

const SHEET_ID = '1GIDvoOpWFFAeLljQ_2XiJk92r1F-907_'
const CLIENTS_GID = '1208786387' // Clients tab
const EXPENSES_GID = '2075199276' // Expenses tab
const SCORECARD_GID = '0' // Main scorecard tab (usually first tab, gid=0)

interface ClientRow {
  company: string
  status: string
  monthly_rate: number
  additional: number
  one_off_project?: number
}

interface ExpenseRow {
  category: string
  amount: number
}

interface MonthlyGoal {
  month: string // Format: "2026-03" for March 2026
  goal: number
}

// In-memory store for synced data (persists during server lifetime)
let syncedData: {
  clients: ClientRow[]
  mrr: number
  activeClients: number
  oneOffProjects: number
  expenses: ExpenseRow[]
  totalExpenses: number
  monthlyGoals: MonthlyGoal[]
  lastSync: string
} | null = null

// Export function to get synced data
export function getSyncedData() {
  return syncedData
}

export async function POST(request: Request) {
  try {
    // Fetch all tabs in parallel
    const [clientsRes, expensesRes, scorecardRes] = await Promise.all([
      fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${CLIENTS_GID}`),
      fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${EXPENSES_GID}`),
      fetch(`https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SCORECARD_GID}`)
    ])

    if (!clientsRes.ok || !expensesRes.ok) {
      return NextResponse.json({
        error: 'Failed to fetch Google Sheet',
        clientsStatus: clientsRes.status,
        expensesStatus: expensesRes.status,
        scorecardStatus: scorecardRes.status,
      }, { status: 500 })
    }

    // Parse Clients Tab
    const clientsCsv = await clientsRes.text()
    const clientLines = clientsCsv.trim().split('\n')

    const clients: ClientRow[] = []
    let totalMRR = 0
    let activeCount = 0
    let totalOneOff = 0

    for (let i = 1; i < clientLines.length; i++) {
      const cols = clientLines[i].split(',').map(c => c.trim().replace(/"/g, ''))
      if (cols.length < 3) continue

      const company = cols[0]
      const status = cols[1] || 'Active'
      const monthlyRate = parseFloat(cols[2]?.replace(/[$,]/g, '') || '0')
      const additional = parseFloat(cols[3]?.replace(/[$,]/g, '') || '0')
      const oneOff = parseFloat(cols[4]?.replace(/[$,]/g, '') || '0')

      if (!company || company.toLowerCase().includes('total')) continue

      clients.push({ company, status, monthly_rate: monthlyRate, additional, one_off_project: oneOff })

      if (status.toLowerCase() === 'active') {
        totalMRR += monthlyRate + additional
        activeCount++
        totalOneOff += oneOff || 0
      }
    }

    // Parse Expenses Tab
    const expensesCsv = await expensesRes.text()
    const expenseLines = expensesCsv.trim().split('\n')

    const expenses: ExpenseRow[] = []
    let totalExpenses = 0

    for (let i = 1; i < expenseLines.length; i++) {
      const cols = expenseLines[i].split(',').map(c => c.trim().replace(/"/g, ''))
      if (cols.length < 2) continue

      const category = cols[0]
      const amount = parseFloat(cols[1]?.replace(/[$,]/g, '') || '0')

      if (!category || category.toLowerCase().includes('total') || amount === 0) continue

      expenses.push({ category, amount })
      totalExpenses += amount
    }

    // Parse Scorecard Tab (Monthly Goals)
    const scorecardCsv = await scorecardRes.text()
    const scorecardLines = scorecardCsv.trim().split('\n')

    const monthlyGoals: MonthlyGoal[] = []
    const monthMap: Record<string, number> = {
      'january': 1, 'jan': 1,
      'february': 2, 'feb': 2,
      'march': 3, 'mar': 3,
      'april': 4, 'apr': 4,
      'may': 5,
      'june': 6, 'jun': 6,
      'july': 7, 'jul': 7,
      'august': 8, 'aug': 8,
      'september': 9, 'sep': 9, 'sept': 9,
      'october': 10, 'oct': 10,
      'november': 11, 'nov': 11,
      'december': 12, 'dec': 12,
    }

    const currentYear = new Date().getFullYear()

    // Parse scorecard looking for month + goal columns
    for (let i = 1; i < scorecardLines.length; i++) {
      const cols = scorecardLines[i].split(',').map(c => c.trim().replace(/"/g, ''))
      if (cols.length < 2) continue

      // Look for month name in first column
      const monthStr = cols[0]?.toLowerCase() || ''
      const goalValue = parseFloat(cols[1]?.replace(/[$,]/g, '') || '0')

      // Find month number
      let monthNum = 0
      for (const [key, num] of Object.entries(monthMap)) {
        if (monthStr.includes(key)) {
          monthNum = num
          break
        }
      }

      if (monthNum > 0 && goalValue > 0) {
        const monthKey = `${currentYear}-${String(monthNum).padStart(2, '0')}`
        monthlyGoals.push({ month: monthKey, goal: goalValue })
      }
    }

    // Store in memory
    syncedData = {
      clients,
      mrr: totalMRR,
      activeClients: activeCount,
      oneOffProjects: totalOneOff,
      expenses,
      totalExpenses,
      monthlyGoals,
      lastSync: new Date().toISOString(),
    }

    return NextResponse.json({
      success: true,
      synced_at: new Date().toISOString(),
      clients: activeCount,
      mrr: totalMRR,
      one_off_projects: totalOneOff,
      expenses: expenses.length,
      total_expenses: totalExpenses,
      monthly_goals: monthlyGoals.length,
      message: `Synced ${clients.length} clients (${activeCount} active), ${expenses.length} expenses, ${monthlyGoals.length} monthly goals`,
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Sync failed',
      details: String(error)
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST to trigger sync',
    sheet_id: SHEET_ID,
    clients_gid: CLIENTS_GID,
    expenses_gid: EXPENSES_GID,
    scorecard_gid: SCORECARD_GID,
    last_sync: syncedData?.lastSync || 'Never synced',
    synced_data: syncedData ? {
      clients: syncedData.activeClients,
      mrr: syncedData.mrr,
      expenses_count: syncedData.expenses.length,
      total_expenses: syncedData.totalExpenses,
      monthly_goals_count: syncedData.monthlyGoals.length,
    } : null
  })
}
