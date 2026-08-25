// Single source of truth for expense grouping.
//
// Previously /api/overhead and /api/scorecard?type=profit each had their own
// keyword table and disagreed on the same rows (Google Workspace landed in
// Office in one and Software in the other). Both now call this.
//
// Grouping follows the sheet's own section headers ("Marketing", "AI
// Services", ...) rather than guessing from the line-item name.

export interface ExpenseLike {
  category: string
  amount: number
  section?: string
}

export interface CategoryTotal {
  category: string
  amount: number
  color: string
}

const SECTION_COLORS: Record<string, string> = {
  'Payroll': '#3B82F6',
  'Software & IT Tools': '#8B5CF6',
  'Marketing': '#EC4899',
  'AI Services': '#06B6D4',
  'Office & Facilities': '#10B981',
  'Accounting & Banking': '#F59E0B',
}

const FALLBACK_COLORS = ['#8B5CF6', '#EC4899', '#06B6D4', '#10B981', '#F59E0B', '#3B82F6']

export function colorFor(section: string): string {
  const known = SECTION_COLORS[section]
  if (known) return known

  // Stable colour for any section the sheet adds later — same name always
  // maps to the same swatch, so the chart does not reshuffle between syncs.
  let hash = 0
  for (let i = 0; i < section.length; i++) hash = (hash * 31 + section.charCodeAt(i)) | 0
  return FALLBACK_COLORS[Math.abs(hash) % FALLBACK_COLORS.length]
}

export function categorizeBySection(expenses: ExpenseLike[]): CategoryTotal[] {
  const grouped: Record<string, number> = {}

  for (const expense of expenses) {
    // Defensive: a non-finite amount would turn its whole bucket into NaN and
    // silently drop that slice from the card.
    if (!Number.isFinite(expense.amount)) continue

    // Mock rows carry no section — their `category` is already the group name.
    const section = expense.section?.trim() || expense.category?.trim()
    if (!section) continue

    grouped[section] = (grouped[section] || 0) + expense.amount
  }

  return Object.entries(grouped)
    .filter(([, amount]) => amount > 0)
    .sort(([, a], [, b]) => b - a)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      color: colorFor(category),
    }))
}
