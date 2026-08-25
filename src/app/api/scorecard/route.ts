import { NextResponse } from 'next/server'
import { mockExpenses, realClients, realMRR, mockMrrHistory } from '@/lib/mock-data'
import { getSyncedData } from '../sync/route'

export const dynamic = 'force-dynamic'

// Expense categorization: map individual line items into 4 parent categories
const EXPENSE_CATEGORIES: Record<string, string[]> = {
  'Payroll': [
    'payroll', 'salary', 'salaries', 'wages', 'contractor', 'contractors',
    'freelance', 'freelancer', 'employee', 'compensation', 'bonus', 'bonuses',
    'labour', 'labor', 'staffing', 'staff', 'team', 'hiring', 'recruitment',
    'benefits', 'insurance', 'health insurance', 'stipend',
  ],
  'Software & Marketing': [
    'software', 'marketing', 'advertising', 'ads', 'ad spend', 'google ads',
    'meta ads', 'facebook ads', 'tiktok', 'social media', 'seo', 'sem',
    'subscription', 'subscriptions', 'saas', 'tools', 'platform', 'hosting',
    'domain', 'cloud', 'aws', 'api', 'license', 'licenses', 'app',
    'clickup', 'slack', 'zoom', 'canva', 'figma', 'hubspot', 'crm',
    'email marketing', 'mailchimp', 'content', 'creative', 'branding',
    'design', 'website', 'digital', 'media', 'pr', 'influencer',
    'campaign', 'promotion', 'lead gen',
  ],
  'Office & Facilities': [
    'office', 'rent', 'lease', 'facilities', 'utilities', 'utility',
    'electricity', 'internet', 'wifi', 'phone', 'mobile', 'supplies',
    'equipment', 'furniture', 'maintenance', 'cleaning', 'security',
    'coworking', 'co-working', 'space', 'travel', 'meals', 'food',
    'entertainment', 'shipping', 'postage', 'courier', 'storage',
  ],
  'Bank & Accounting': [
    'bank', 'banking', 'accounting', 'accountant', 'cpa', 'bookkeeping',
    'bookkeeper', 'legal', 'lawyer', 'attorney', 'tax', 'taxes',
    'compliance', 'audit', 'fee', 'fees', 'transaction', 'wire',
    'transfer', 'interest', 'merchant', 'payment processing', 'stripe',
    'paypal', 'quickbooks', 'xero', 'incorporation', 'filing',
    'registration', 'permits', 'insurance',
  ],
}

const CATEGORY_COLORS: Record<string, string> = {
  'Payroll': '#3B82F6',
  'Software & Marketing': '#8B5CF6',
  'Office & Facilities': '#10B981',
  'Bank & Accounting': '#F59E0B',
}

function categorizeExpenses(expenses: { category: string; amount: number }[]): { category: string; amount: number; color: string }[] {
  const grouped: Record<string, number> = {
    'Payroll': 0,
    'Software & Marketing': 0,
    'Office & Facilities': 0,
    'Bank & Accounting': 0,
  }

  for (const expense of expenses) {
    const name = expense.category.toLowerCase().trim()
    let matched = false

    // Check if the expense name already matches a parent category exactly
    for (const parentCategory of Object.keys(EXPENSE_CATEGORIES)) {
      if (name === parentCategory.toLowerCase()) {
        grouped[parentCategory] += expense.amount
        matched = true
        break
      }
    }

    if (!matched) {
      // Try keyword matching
      for (const [parentCategory, keywords] of Object.entries(EXPENSE_CATEGORIES)) {
        if (keywords.some(keyword => name.includes(keyword))) {
          grouped[parentCategory] += expense.amount
          matched = true
          break
        }
      }
    }

    if (!matched) {
      // Default unmatched expenses to "Software & Marketing" (operational catch-all)
      grouped['Software & Marketing'] += expense.amount
    }
  }

  // Return only categories with non-zero amounts
  return Object.entries(grouped)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      color: CATEGORY_COLORS[category] || '#64748B',
    }))
}

// Get live data from sync or fall back to mock
function getLiveData() {
  const synced = getSyncedData()
  if (synced) {
    return {
      mrr: synced.mrr,
      activeClients: synced.activeClients,
      avgRevenuePerClient: synced.activeClients > 0 ? synced.mrr / synced.activeClients : 0,
      clients: synced.clients.map(c => ({
        company: c.company,
        status: c.status,
        monthly_rate: c.monthly_rate,
        additional: c.additional || 0,
      })),
      expenses: synced.expenses.length > 0 ? synced.expenses : mockExpenses,
      totalExpenses: synced.totalExpenses > 0 ? synced.totalExpenses : mockExpenses.reduce((s, e) => s + e.amount, 0),
      oneOffProjects: synced.oneOffProjects,
      oneOffTotal: synced.oneOffTotal,
      source: 'synced' as const,
    }
  }
  return {
    mrr: realMRR.mrr,
    activeClients: realMRR.active_clients,
    avgRevenuePerClient: realMRR.avg_revenue_per_client,
    clients: realClients,
    expenses: mockExpenses,
    totalExpenses: mockExpenses.reduce((s, e) => s + e.amount, 0),
    oneOffProjects: [],
    oneOffTotal: 0,
    source: 'mock' as const,
  }
}

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

// MRR targets by month (YYYY-MM). The Google Sheet's Scorecard tab currently
// parses to zero monthly goals, so these are the effective targets on the
// dashboard. A synced sheet goal, if one ever appears, still wins.
// Months outside this range clamp to the nearest end (before Sept 2026 -> 65k,
// after Dec 2026 -> 95k).
const MONTHLY_TARGETS: Record<string, number> = {
  '2026-09': 65000,
  '2026-10': 75000,
  '2026-11': 90000,
  '2026-12': 95000,
}

function getMonthlyTarget(month: string): number {
  const explicit = MONTHLY_TARGETS[month]
  if (explicit) return explicit

  const keys = Object.keys(MONTHLY_TARGETS).sort()
  const first = keys[0]
  const last = keys[keys.length - 1]
  if (month < first) return MONTHLY_TARGETS[first]
  return MONTHLY_TARGETS[last]
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

  // Monthly goal tracking
  if (type === 'goal') {
    const live = getLiveData()
    const currentMRR = live.mrr

    // Synced sheet goal wins; otherwise use the month's target
    const currentMonth = getCurrentMonth()
    let monthlyGoal = getMonthlyTarget(currentMonth)
    const synced = getSyncedData()
    if (synced?.monthlyGoals) {
      const monthGoal = synced.monthlyGoals.find(g => g.month === currentMonth)
      if (monthGoal) monthlyGoal = monthGoal.goal
    }

    const gap = monthlyGoal - currentMRR
    const percentOfGoal = (currentMRR / monthlyGoal) * 100

    let status: 'on-track' | 'at-risk' | 'off-track'
    if (percentOfGoal >= 100) status = 'on-track'
    else if (percentOfGoal >= 80) status = 'at-risk'
    else status = 'off-track'

    return NextResponse.json({
      currentMRR,
      monthlyGoal,
      gap,
      percentOfGoal,
      status,
      month: new Date().toLocaleDateString('en-US', { month: 'long' }),
      source: live.source,
      timestamp: new Date().toISOString(),
    })
  }

  // Valuation data handler
  if (type === 'valuation') {
    const live = getLiveData()
    const arr = live.mrr * 12
    const monthlyEbitda = live.mrr - live.totalExpenses
    const annualEbitda = monthlyEbitda * 12
    const ebitdaMargin = live.mrr > 0 ? (monthlyEbitda / live.mrr) * 100 : 0

    return NextResponse.json({
      mrr: live.mrr,
      arr,
      ebitda: annualEbitda,
      ebitdaMargin,
      valuations: {
        conservative: Math.round(annualEbitda * 4),
        market: Math.round(annualEbitda * 5.5),
        premium: Math.round(annualEbitda * 7),
      },
      source: live.source,
      timestamp: new Date().toISOString(),
    })
  }

  // Financial metrics handler
  if (type === 'metrics') {
    const live = getLiveData()
    const revenue = live.mrr
    const monthlyProfit = revenue - live.totalExpenses
    const margin = revenue > 0 ? (monthlyProfit / revenue) * 100 : 0
    const runRate = revenue * 12

    // Fetch cash balance from mercury
    let cashBalance = 42417 // fallback
    try {
      const mercuryRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mercury`)
      const mercuryData = await mercuryRes.json()
      cashBalance = mercuryData.totalBalance || cashBalance
    } catch {}

    const runway = monthlyProfit < 0 ? Math.floor(cashBalance / Math.abs(monthlyProfit)) : 0

    return NextResponse.json({
      runRate,
      monthlyProfit,
      profitMargin: margin,
      cashBalance,
      runway,
      burnRate: monthlyProfit < 0 ? Math.abs(monthlyProfit) : 0,
      source: live.source,
      timestamp: new Date().toISOString(),
    })
  }

  // Profit data handler
  if (type === 'profit') {
    const live = getLiveData()
    const revenue = live.mrr
    const netProfit = revenue - live.totalExpenses
    const totalRevenue = revenue + live.oneOffTotal
    const totalNetProfit = totalRevenue - live.totalExpenses
    const margin = totalRevenue > 0 ? (totalNetProfit / totalRevenue) * 100 : 0

    // Group expense breakdown into clean categories — always categorize
    const rawExpenses = live.expenses
    const expenseBreakdown = categorizeExpenses(rawExpenses)

    return NextResponse.json({
      revenue,
      oneOffTotal: live.oneOffTotal,
      oneOffProjects: live.oneOffProjects,
      totalRevenue,
      expenses: live.totalExpenses,
      expenseBreakdown,
      netProfit: totalNetProfit,
      margin: Math.round(margin * 10) / 10,
      month: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      source: live.source,
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
    const live = getLiveData()
    // Always group expenses into the 4 parent categories for consistent display
    const rawExpenses = live.expenses
    const categories = categorizeExpenses(rawExpenses)

    const total = categories.reduce((sum, c) => sum + c.amount, 0)
    return NextResponse.json({
      categories,
      totalOverhead: total,
      month: new Date().toISOString().slice(0, 7),
      source: live.source,
      timestamp: new Date().toISOString(),
    })
  }

  // Revenue / MRR data handler
  if (type === 'revenue') {
    const live = getLiveData()
    const currentMRR = live.mrr
    const history = mockMrrHistory
    const prevMonthEntry = history.length > 1 ? history[history.length - 2] : null
    const previousMRR = prevMonthEntry?.mrr || currentMRR
    const growth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0
    return NextResponse.json({
      clients: live.clients,
      currentMRR,
      previousMRR,
      growth: Math.round(growth * 10) / 10,
      activeClients: live.activeClients,
      avgRevenuePerClient: Math.round(live.avgRevenuePerClient),
      oneOffTotal: live.oneOffTotal,
      oneOffProjects: live.oneOffProjects,
      history: history.map(h => ({ date: h.date, mrr: h.mrr, activeClients: h.active_clients })),
      source: live.source,
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
