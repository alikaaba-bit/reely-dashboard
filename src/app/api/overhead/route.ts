import { NextResponse } from 'next/server'
import { mockExpenses } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export async function GET() {
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
