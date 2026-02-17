import { NextResponse } from 'next/server'
import { getPipelineData, getLeadSourceBreakdown, getClickUpTasks, CRM_LEADS_LIST_ID } from '@/lib/clickup'
import { mockClickUpData } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

const MOCK_LEAD_SOURCES = [
  { source: 'Hypergen', count: 45, color: '#8B5CF6' },
  { source: 'Instagram', count: 32, color: '#EC4899' },
  { source: 'Referral', count: 18, color: '#10B981' },
  { source: 'Email Marketing', count: 12, color: '#3B82F6' },
  { source: 'Unknown', count: 8, color: '#64748B' },
]

export async function GET() {
  const isMockMode = !process.env.CLICKUP_API_KEY ||
    process.env.CLICKUP_API_KEY.includes('placeholder')

  if (isMockMode) {
    return NextResponse.json({ ...mockClickUpData, leadSources: MOCK_LEAD_SOURCES, mockMode: true })
  }

  try {
    const allTasks = await getClickUpTasks(CRM_LEADS_LIST_ID)
    const stages = await getPipelineData()
    const leadSources = getLeadSourceBreakdown(allTasks)

    const activePipeline = stages.filter(s => s.name !== 'Closed Lost')
    const totalPipelineValue = activePipeline.reduce((sum, s) => sum + s.totalValue, 0)
    const totalActiveDeals = activePipeline.reduce((sum, s) => sum + s.count, 0)

    const wonStage = stages.find(s => s.name === 'Closed Won')
    const lostStage = stages.find(s => s.name === 'Closed Lost')
    const wonCount = wonStage?.count || 0
    const lostCount = lostStage?.count || 0
    const winRate = wonCount + lostCount > 0 ? (wonCount / (wonCount + lostCount)) * 100 : 0

    return NextResponse.json({
      stages,
      leadSources,
      summary: {
        totalPipelineValue,
        totalActiveDeals,
        totalDeals: stages.reduce((sum, s) => sum + s.count, 0),
        wonValue: wonStage?.totalValue || 0,
        wonCount,
        lostCount,
        winRate: Math.round(winRate * 10) / 10,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('ClickUp error:', error)
    return NextResponse.json({
      ...mockClickUpData,
      leadSources: MOCK_LEAD_SOURCES,
      error: String(error),
      mockMode: true,
    })
  }
}
