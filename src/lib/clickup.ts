const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2'
export const CRM_LEADS_LIST_ID = '901414162468'
export const DEFAULT_DEAL_VALUE = 2997

export interface ClickUpDeal {
  id: string
  name: string
  value: number
  status: string
  leadSource?: string
}

export interface PipelineStage {
  name: string
  deals: ClickUpDeal[]
  totalValue: number
  count: number
  color: string
}

export interface LeadSourceData {
  source: string
  count: number
  color: string
}

// Maps ClickUp status → pipeline stage name
const STATUS_STAGE_MAP: Record<string, string> = {
  'new lead': 'Prospecting',
  'cold outreach': 'Prospecting',
  'engaged': 'Engaged',
  'hot lead': 'Engaged',
  'nurture (priority)': 'Engaged',
  'call booked': 'Call Booked',
  'won': 'Closed Won',
  'unqualified': 'Closed Lost',
  'lost': 'Closed Lost',
  'closed': 'Closed Lost',
  // Excluded from funnel: nurture (later), cold
}

const LEAD_SOURCE_COLORS: Record<string, string> = {
  'Hypergen': '#8B5CF6',
  'Instagram': '#EC4899',
  'Referral': '#10B981',
  'Email Marketing': '#3B82F6',
  'Paid Advertising': '#F59E0B',
  'Website Contact': '#06B6D4',
  'Event': '#F97316',
  'Unknown': '#64748B',
}

export async function getClickUpTasks(listId: string): Promise<any[]> {
  const apiKey = process.env.CLICKUP_API_KEY
  if (!apiKey) throw new Error('CLICKUP_API_KEY not configured')

  let allTasks: any[] = []
  let page = 0

  while (true) {
    const response = await fetch(
      `${CLICKUP_API_BASE}/list/${listId}/task?page=${page}&subtasks=false&include_closed=true`,
      { headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' } }
    )
    if (!response.ok) throw new Error(`ClickUp API error: ${response.status}`)

    const data = await response.json()
    const tasks = data.tasks || []
    allTasks = allTasks.concat(tasks)

    if (tasks.length < 100) break
    page++
  }

  return allTasks
}

function extractLeadSource(task: any): string {
  const field = task.custom_fields?.find((f: any) =>
    f.name?.toLowerCase().includes('lead source')
  )
  if (!field?.value && field?.value !== 0) return 'Unknown'

  // Dropdown: value is an option object or an index
  if (typeof field.value === 'object' && field.value?.name) return field.value.name
  if (typeof field.value === 'number' && field.type_config?.options) {
    return field.type_config.options[field.value]?.name || 'Unknown'
  }
  if (typeof field.value === 'string') return field.value
  return 'Unknown'
}

export function getLeadSourceBreakdown(tasks: any[]): LeadSourceData[] {
  const counts: Record<string, number> = {}
  for (const task of tasks) {
    const source = extractLeadSource(task)
    counts[source] = (counts[source] || 0) + 1
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .map(([source, count]) => ({
      source,
      count,
      color: LEAD_SOURCE_COLORS[source] || '#64748B',
    }))
}

export async function getPipelineData(): Promise<PipelineStage[]> {
  const tasks = await getClickUpTasks(CRM_LEADS_LIST_ID)

  const stages: Record<string, PipelineStage> = {
    'Prospecting': { name: 'Prospecting', deals: [], totalValue: 0, count: 0, color: '#64748B' },
    'Engaged': { name: 'Engaged', deals: [], totalValue: 0, count: 0, color: '#F59E0B' },
    'Call Booked': { name: 'Call Booked', deals: [], totalValue: 0, count: 0, color: '#3B82F6' },
    'Closed Won': { name: 'Closed Won', deals: [], totalValue: 0, count: 0, color: '#10B981' },
    'Closed Lost': { name: 'Closed Lost', deals: [], totalValue: 0, count: 0, color: '#EF4444' },
  }

  for (const task of tasks) {
    const statusName = (task.status?.status || '').toLowerCase().trim()
    const stageName = STATUS_STAGE_MAP[statusName]
    if (!stageName) continue

    const deal: ClickUpDeal = {
      id: task.id,
      name: task.name,
      value: DEFAULT_DEAL_VALUE,
      status: task.status?.status || '',
      leadSource: extractLeadSource(task),
    }

    stages[stageName].deals.push(deal)
    stages[stageName].count++
    stages[stageName].totalValue += DEFAULT_DEAL_VALUE
  }

  return Object.values(stages)
}

export function parseDealValue(task: any): number {
  const valueField = task.custom_fields?.find(
    (f: any) => f.name?.toLowerCase().includes('value') || f.name?.toLowerCase().includes('amount')
  )
  return valueField?.value ? parseFloat(valueField.value) || DEFAULT_DEAL_VALUE : DEFAULT_DEAL_VALUE
}
