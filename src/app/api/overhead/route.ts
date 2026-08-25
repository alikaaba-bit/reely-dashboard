// overhead route v2
import { NextResponse } from 'next/server'
import { mockExpenses } from '@/lib/mock-data'
import { categorizeBySection, colorFor } from '@/lib/expense-categories'
import { getSyncedData } from '../sync/route'

export const dynamic = 'force-dynamic'

export async function GET() {
  // Use synced data if available, otherwise fall back to mock
  const synced = getSyncedData()
  const rawExpenses = synced && synced.expenses.length > 0 ? synced.expenses : mockExpenses

  // Group by the sheet's own section headers. Previously this keyword-matched
  // the line-item name, which collapsed 5 sheet sections into 2 buckets and
  // filed "Pak Budget" (rent + utilities) under Software & Marketing.
  const categories = categorizeBySection(rawExpenses)

  // Payroll lives in cols E-H of the same tab and was not being read at all,
  // hiding ~$17k/mo of cost. It is a category here so the card total equals
  // the sheet's "TOTAL MONTHLY COST (Expenses + Payroll)".
  if (synced && synced.totalPayroll > 0) {
    categories.push({ category: 'Payroll', amount: synced.totalPayroll, color: colorFor('Payroll') })
  }

  const total = categories.reduce((sum, c) => sum + c.amount, 0)

  return NextResponse.json({
    categories,
    totalOverhead: total,
    operatingExpenses: synced ? synced.totalExpenses : total,
    payroll: synced ? synced.totalPayroll : 0,
    payrollBreakdown: synced ? synced.payroll : [],
    month: new Date().toISOString().slice(0, 7),
    source: synced ? 'synced' : 'mock',
    timestamp: new Date().toISOString(),
  })
}
