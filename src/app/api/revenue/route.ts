import { NextResponse } from 'next/server'
import { realClients, realMRR, mockMrrHistory } from '@/lib/mock-data'

export const dynamic = 'force-dynamic'

export async function GET() {
  const currentMRR = realMRR.mrr
  const history = mockMrrHistory
  const prevMonthEntry = history.length > 1 ? history[history.length - 2] : null
  const previousMRR = prevMonthEntry?.mrr || currentMRR
  const growth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0

  return NextResponse.json({
    clients: realClients,
    currentMRR,
    previousMRR,
    growth: Math.round(growth * 10) / 10,
    activeClients: realMRR.active_clients,
    avgRevenuePerClient: Math.round(realMRR.avg_revenue_per_client),
    history: history.map(h => ({
      date: h.date,
      mrr: h.mrr,
      activeClients: h.active_clients,
    })),
    note: 'Xero integration coming soon. Current data reflects active retainer clients.',
    timestamp: new Date().toISOString(),
  })
}
