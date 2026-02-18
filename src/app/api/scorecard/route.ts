import { NextResponse } from 'next/server'
import { mockExpenses, realClients, realMRR, mockMrrHistory } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export interface ScorecardMetric {
  id: string
  name: string
  goal: number | null
  actual: number | null
  unit: 'currency' | 'number' | 'percent'
}

export interface WeeklyMetric {
  id: string
  name: string
  weeklyGoal: number
  unit: 'currency' | 'number'
  weeks: { w1: number | null; w2: number | null; w3: number | null; w4: number | null }
}

// In-memory store — persists for server lifetime, resets on redeploy
// Replace with Supabase when credentials are added
const store: Record<string, ScorecardMetric[]> = {}
const weeklyStore: Record<string, WeeklyMetric[]> = {}

function defaultWeeklyMetrics(): WeeklyMetric[] {
  return [
    { id: 'leads', name: 'New Leads', weeklyGoal: 10, unit: 'number', weeks: { w1: null, w2: null, w3: null, w4: null } },
    { id: 'calls', name: 'Discovery Calls', weeklyGoal: 5, unit: 'number', weeks: { w1: null, w2: null, w3: null, w4: null } },
    { id: 'proposals', name: 'Proposals Sent', weeklyGoal: 3, unit: 'number', weeks: { w1: null, w2: null, w3: null, w4: null } },
    { id: 'clients', name: 'New Clients Signed', weeklyGoal: 1, unit: 'number', weeks: { w1: null, w2: null, w3: null, w4: null } },
    { id: 'revenue', name: 'Revenue Collected', weeklyGoal: 8460, unit: 'currency', weeks: { w1: null, w2: null, w3: null, w4: null } },
    { id: 'content', name: 'Content Delivered', weeklyGoal: 20, unit: 'number', weeks: { w1: null, w2: null, w3: null, w4: null } },
  ]
}

function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7)
}

function getMonthLabel(month: string): string {
  const [year, m] = month.split('-')
  const date = new Date(parseInt(year), parseInt(m) - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

function defaultMetrics(): ScorecardMetric[] {
  return [
    { id: 'revenue', name: 'Monthly Revenue', goal: null, actual: null, unit: 'currency' },
    { id: 'new_clients', name: 'New Clients', goal: null, actual: null, unit: 'number' },
    { id: 'leads', name: 'Leads Generated', goal: null, actual: null, unit: 'number' },
    { id: 'pipeline', name: 'Pipeline Value', goal: null, actual: null, unit: 'currency' },
    { id: 'win_rate', name: 'Win Rate', goal: null, actual: null, unit: 'percent' },
    { id: 'cash', name: 'Cash Position', goal: null, actual: null, unit: 'currency' },
  ]
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  // Profit data handler
  if (type === 'profit') {
    const revenue = realMRR.mrr
    const expenses = mockExpenses.reduce((s, e) => s + e.amount, 0)
    const netProfit = revenue - expenses
    const margin = revenue > 0 ? (netProfit / revenue) * 100 : 0
    return NextResponse.json({
      revenue,
      expenses,
      expenseBreakdown: mockExpenses,
      netProfit,
      margin: Math.round(margin * 10) / 10,
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    })
  }

  // Weekly scorecard handler
  if (type === 'weekly') {
    const month = getCurrentMonth()
    const metrics = weeklyStore[`weekly_${month}`] || defaultWeeklyMetrics()
    return NextResponse.json({
      month,
      monthLabel: getMonthLabel(month),
      metrics,
      lastUpdated: new Date().toISOString(),
    })
  }

  // Overhead data handler
  if (type === 'overhead') {
    const categories = mockExpenses.map((e, i) => ({
      ...e,
      color: ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'][i % 6],
    }))
    const total = categories.reduce((sum, c) => sum + c.amount, 0)
    return NextResponse.json({
      categories,
      totalOverhead: total,
      month: new Date().toISOString().slice(0, 7),
      note: 'Connect Mercury API to auto-categorize transactions.',
      timestamp: new Date().toISOString(),
    })
  }

  // Revenue / MRR data handler
  if (type === 'revenue') {
    const currentMRR = realMRR.mrr
    const history = mockMrrHistory
    const prevMonthEntry = history.length > 1 ? history[history.length - 2] : null
    const previousMRR = prevMonthEntry?.mrr || currentMRR
    const growth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0
    return NextResponse.json({
      clients: realClients,
      currentMRR,
      previousMRR,
      growth: Math.round(growth * 10) / 10,
      activeClients: realMRR.active_clients,
      avgRevenuePerClient: Math.round(realMRR.avg_revenue_per_client),
      history: history.map(h => ({ date: h.date, mrr: h.mrr, activeClients: h.active_clients })),
      note: 'Xero integration coming soon. Current data reflects active retainer clients.',
      timestamp: new Date().toISOString(),
    })
  }

  const month = searchParams.get('month') || getCurrentMonth()

  // Support legacy scorecard format
  const { mockScorecardData } = await import('@/lib/mock-data')
  const legacy = searchParams.get('quarter')
  if (legacy) {
    return NextResponse.json(mockScorecardData)
  }

  const metrics = store[month] || defaultMetrics()

  return NextResponse.json({
    month,
    monthLabel: getMonthLabel(month),
    metrics,
    lastUpdated: new Date().toISOString(),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const month = body.month || getCurrentMonth()

    // Weekly scorecard save
    if (body.type === 'weekly') {
      const metrics: WeeklyMetric[] = body.metrics
      if (!Array.isArray(metrics)) {
        return NextResponse.json({ error: 'metrics must be an array' }, { status: 400 })
      }
      weeklyStore[`weekly_${month}`] = metrics
      return NextResponse.json({
        success: true,
        month,
        monthLabel: getMonthLabel(month),
        metrics,
        savedAt: new Date().toISOString(),
      })
    }

    // Legacy monthly scorecard save
    const metrics: ScorecardMetric[] = body.metrics

    if (!Array.isArray(metrics)) {
      return NextResponse.json({ error: 'metrics must be an array' }, { status: 400 })
    }

    store[month] = metrics

    return NextResponse.json({
      success: true,
      month,
      monthLabel: getMonthLabel(month),
      metrics,
      savedAt: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
