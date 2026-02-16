import { NextResponse } from 'next/server'
import { getTotalBalance } from '@/lib/mercury'
import { supabaseAdmin } from '@/lib/supabase'
import { mockMercuryData } from '@/lib/mock-data'

export async function GET() {
  // Check if using mock data (placeholder API key)
  const isMockMode = !process.env.MERCURY_API_KEY || 
    process.env.MERCURY_API_KEY.includes('placeholder')

  if (isMockMode) {
    console.log('Mercury API: Using mock data')
    return NextResponse.json({
      ...mockMercuryData,
      mockMode: true,
    })
  }

  try {
    const balance = await getTotalBalance()
    
    await supabaseAdmin.from('cash_position').upsert({
      date: new Date().toISOString().split('T')[0],
      balance: balance,
    }, { onConflict: 'date' })

    const { data: history } = await supabaseAdmin
      .from('cash_position')
      .select('*')
      .order('date', { ascending: true })
      .limit(30)

    return NextResponse.json({
      balance,
      history: history || [],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Mercury API error:', error)
    
    const { data: latest } = await supabaseAdmin
      .from('cash_position')
      .select('*')
      .order('date', { ascending: false })
      .limit(1)
      .single()

    return NextResponse.json({
      balance: latest?.balance || 0,
      history: [],
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
    }, { status: 200 })
  }
}
