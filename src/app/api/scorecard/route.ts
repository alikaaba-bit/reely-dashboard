import { NextResponse } from 'next/server'
import { mockScorecardData } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const quarter = searchParams.get('quarter') || 'Q1'
  const year = parseInt(searchParams.get('year') || '2026')

  // Always return mock data for now (until real data is connected)
  return NextResponse.json({
    ...mockScorecardData,
    quarter,
    year,
    mockMode: true,
  })
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    
    // In mock mode, just return success
    return NextResponse.json({ 
      success: true,
      mockMode: true,
      message: 'Scorecard updated (mock mode)'
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
