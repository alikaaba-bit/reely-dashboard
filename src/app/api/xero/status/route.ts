import { NextResponse } from 'next/server'
import { isXeroConnected } from '@/lib/xero'

export const dynamic = 'force-dynamic'

export async function GET() {
  const connected = await isXeroConnected()
  return NextResponse.json({ connected })
}
