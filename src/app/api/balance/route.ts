import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
}

// GET — fetch manual balances
export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('manual_balances')
    .select('*')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const balances: Record<string, { balance: number; updated_at: string }> = {}
  for (const row of data || []) {
    balances[row.account_name] = {
      balance: parseFloat(row.balance),
      updated_at: row.updated_at,
    }
  }

  return NextResponse.json({ balances })
}

// POST — update a manual balance
export async function POST(request: Request) {
  const { account_name, balance } = await request.json()

  if (!account_name || balance === undefined || isNaN(Number(balance))) {
    return NextResponse.json({ error: 'account_name and balance required' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { error } = await supabase
    .from('manual_balances')
    .upsert({
      account_name,
      balance: Number(balance),
      updated_at: new Date().toISOString(),
    })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, account_name, balance: Number(balance) })
}
