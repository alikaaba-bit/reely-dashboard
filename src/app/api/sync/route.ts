import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST() {
  const syncLog = await supabaseAdmin
    .from('sync_log')
    .insert({ source: 'manual', status: 'running' })
    .select()
    .single()

  const logId = syncLog.data?.id

  try {
    // Trigger all syncs
    const results = await Promise.allSettled([
      syncMercury(),
      syncClickUp(),
      syncScorecard(),
    ])

    const completed = results.filter(r => r.status === 'fulfilled').length
    const errors = results
      .filter(r => r.status === 'rejected')
      .map(r => (r as PromiseRejectedResult).reason)

    await supabaseAdmin
      .from('sync_log')
      .update({
        status: errors.length === 0 ? 'success' : 'partial',
        records_synced: completed,
        error_message: errors.length > 0 ? errors.join(', ') : null,
        completed_at: new Date().toISOString(),
      })
      .eq('id', logId)

    return NextResponse.json({
      success: errors.length === 0,
      completed,
      errors,
    })
  } catch (error) {
    await supabaseAdmin
      .from('sync_log')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Unknown error',
        completed_at: new Date().toISOString(),
      })
      .eq('id', logId)

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function syncMercury() {
  // Mercury sync logic
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/mercury`)
  if (!response.ok) throw new Error('Mercury sync failed')
  return response.json()
}

async function syncClickUp() {
  // ClickUp sync logic
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/clickup`)
  if (!response.ok) throw new Error('ClickUp sync failed')
  return response.json()
}

async function syncScorecard() {
  // Scorecard sync from Excel (would need additional implementation)
  return { status: 'not_implemented' }
}
