import { NextResponse } from 'next/server'
import { getPipelineData } from '@/lib/clickup'
import { supabaseAdmin } from '@/lib/supabase'
import { mockClickUpData } from '@/lib/mock-data'

export async function GET() {
  // Check if using mock data (placeholder API key)
  const isMockMode = !process.env.CLICKUP_API_KEY || 
    process.env.CLICKUP_API_KEY.includes('placeholder')

  if (isMockMode) {
    console.log('ClickUp API: Using mock data')
    return NextResponse.json({
      ...mockClickUpData,
      mockMode: true,
    })
  }

  try {
    const stages = await getPipelineData()
    
    const totalPipelineValue = stages
      .filter(s => s.name !== 'Closed Lost')
      .reduce((sum, stage) => sum + stage.totalValue, 0)
    
    const totalDeals = stages.reduce((sum, stage) => sum + stage.count, 0)
    
    const wonValue = stages.find(s => s.name === 'Closed Won')?.totalValue || 0
    const wonCount = stages.find(s => s.name === 'Closed Won')?.count || 0
    
    const lostValue = stages.find(s => s.name === 'Closed Lost')?.totalValue || 0
    const lostCount = stages.find(s => s.name === 'Closed Lost')?.count || 0
    
    const winRate = wonCount + lostCount > 0 
      ? (wonCount / (wonCount + lostCount)) * 100 
      : 0

    return NextResponse.json({
      stages,
      summary: {
        totalPipelineValue,
        totalDeals,
        wonValue,
        wonCount,
        lostValue,
        lostCount,
        winRate,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('ClickUp API error:', error)
    
    const { data: deals } = await supabaseAdmin
      .from('pipeline_deals')
      .select('*')

    return NextResponse.json({
      stages: [],
      summary: {
        totalPipelineValue: 0,
        totalDeals: deals?.length || 0,
        wonValue: 0,
        wonCount: 0,
        lostValue: 0,
        lostCount: 0,
        winRate: 0,
      },
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 200 })
  }
}
