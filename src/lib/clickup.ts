// ClickUp API Client
const CLICKUP_API_BASE = 'https://api.clickup.com/api/v2'

export interface ClickUpDeal {
  id: string
  name: string
  value: number
  status: string
  assignee?: string
  dueDate?: string
  customFields: Record<string, any>
}

export interface PipelineStage {
  name: string
  deals: ClickUpDeal[]
  totalValue: number
  count: number
}

export async function getClickUpTasks(listId: string): Promise<any[]> {
  const apiKey = process.env.CLICKUP_API_KEY
  if (!apiKey) {
    throw new Error('CLICKUP_API_KEY not configured')
  }

  const response = await fetch(`${CLICKUP_API_BASE}/list/${listId}/task`, {
    headers: {
      'Authorization': apiKey,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${response.statusText}`)
  }

  const data = await response.json()
  return data.tasks || []
}

export async function getPipelineData(): Promise<PipelineStage[]> {
  // Map ClickUp statuses to pipeline stages
  // You'll need to configure this based on your ClickUp setup
  const stages: PipelineStage[] = [
    { name: 'Prospecting', deals: [], totalValue: 0, count: 0 },
    { name: 'Proposal Sent', deals: [], totalValue: 0, count: 0 },
    { name: 'Negotiation', deals: [], totalValue: 0, count: 0 },
    { name: 'Closed Won', deals: [], totalValue: 0, count: 0 },
    { name: 'Closed Lost', deals: [], totalValue: 0, count: 0 },
  ]

  // TODO: Implement actual ClickUp fetching based on your list structure
  // This is a placeholder that you'll customize

  return stages
}

export function parseDealValue(task: any): number {
  // Extract deal value from custom fields
  // Adjust field names based on your ClickUp setup
  const valueField = task.custom_fields?.find(
    (f: any) => f.name.toLowerCase().includes('value') || 
                f.name.toLowerCase().includes('amount')
  )
  return valueField?.value || 0
}
