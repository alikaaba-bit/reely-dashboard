import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export interface ScorecardMetric {
  id: string
  name: string
  goal: number | null
  actual: number | null
  unit: 'currency' | 'number' | 'percent'
}

// In-memory store — persists for server lifetime, resets on redeploy
// Replace with Supabase when credentials are added
const store: Record<string, ScorecardMetric[]> = {}

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
  const month = searchParams.get('month') || getCurrentMonth()

  // Support legacy scorecard format for MRRChart
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
