// overhead route v2
import { NextResponse } from 'next/server'
import { mockExpenses } from '@/lib/mock-data'
import { getSyncedData } from '../sync/route'

export const dynamic = 'force-dynamic'

const EXPENSE_CATEGORIES: Record<string, string[]> = {
  'Payroll': ['payroll', 'salary', 'salaries', 'wages', 'contractor', 'freelance', 'employee', 'compensation', 'bonus', 'labour', 'labor', 'staffing', 'staff', 'benefits', 'insurance', 'stipend'],
  'Software & Marketing': ['software', 'marketing', 'advertising', 'ads', 'ad spend', 'subscription', 'saas', 'tools', 'platform', 'hosting', 'domain', 'cloud', 'license', 'clickup', 'slack', 'zoom', 'canva', 'figma', 'crm', 'content', 'creative', 'branding', 'design', 'digital', 'media', 'pr', 'campaign', 'seo'],
  'Office & Facilities': ['office', 'rent', 'lease', 'facilities', 'utilities', 'electricity', 'internet', 'phone', 'supplies', 'equipment', 'furniture', 'coworking', 'travel', 'meals', 'shipping', 'storage'],
  'Bank & Accounting': ['bank', 'banking', 'accounting', 'accountant', 'cpa', 'bookkeeping', 'legal', 'lawyer', 'tax', 'compliance', 'audit', 'fee', 'fees', 'transaction', 'stripe', 'paypal', 'quickbooks', 'xero', 'filing'],
}

const CATEGORY_COLORS: Record<string, string> = {
  'Payroll': '#3B82F6',
  'Software & Marketing': '#8B5CF6',
  'Office & Facilities': '#10B981',
  'Bank & Accounting': '#F59E0B',
}

function categorizeExpenses(expenses: { category: string; amount: number }[]) {
  const grouped: Record<string, number> = { 'Payroll': 0, 'Software & Marketing': 0, 'Office & Facilities': 0, 'Bank & Accounting': 0 }

  for (const expense of expenses) {
    const name = expense.category.toLowerCase().trim()
    let matched = false
    for (const parentCategory of Object.keys(EXPENSE_CATEGORIES)) {
      if (name === parentCategory.toLowerCase()) { grouped[parentCategory] += expense.amount; matched = true; break }
    }
    if (!matched) {
      for (const [parentCategory, keywords] of Object.entries(EXPENSE_CATEGORIES)) {
        if (keywords.some(k => name.includes(k))) { grouped[parentCategory] += expense.amount; matched = true; break }
      }
    }
    if (!matched) grouped['Software & Marketing'] += expense.amount
  }

  return Object.entries(grouped)
    .filter(([, amount]) => amount > 0)
    .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100, color: CATEGORY_COLORS[category] || '#64748B' }))
}

export async function GET() {
  // Use synced data if available, otherwise fall back to mock
  const synced = getSyncedData()
  const rawExpenses = synced && synced.expenses.length > 0 ? synced.expenses : mockExpenses

  // Always categorize expenses into 4 parent buckets for consistent display
  const categories = categorizeExpenses(rawExpenses)

  const total = categories.reduce((sum, c) => sum + c.amount, 0)

  return NextResponse.json({
    categories,
    totalOverhead: total,
    month: new Date().toISOString().slice(0, 7),
    source: synced ? 'synced' : 'mock',
    timestamp: new Date().toISOString(),
  })
}
