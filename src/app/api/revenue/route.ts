import { NextResponse } from 'next/server'
import { realClients, realMRR, mockMrrHistory } from '@/lib/mock-data'
import { getSyncedData } from '../sync/route'

export const dynamic = 'force-dynamic'

export async function GET() {
  const synced = getSyncedData()

  const currentMRR = synced ? synced.mrr : realMRR.mrr
  const activeClients = synced ? synced.activeClients : realMRR.active_clients
  const clients = synced ? synced.clients.map(c => ({
    company: c.company,
    status: c.status,
    monthly_rate: c.monthly_rate,
    additional: c.additional || 0,
  })) : realClients

  const history = mockMrrHistory
  const prevMonthEntry = history.length > 1 ? history[history.length - 2] : null
  const previousMRR = prevMonthEntry?.mrr || currentMRR
  const growth = previousMRR > 0 ? ((currentMRR - previousMRR) / previousMRR) * 100 : 0

  return NextResponse.json({
    clients,
    currentMRR,
    previousMRR,
    growth: Math.round(growth * 10) / 10,
    activeClients,
    avgRevenuePerClient: activeClients > 0 ? Math.round(currentMRR / activeClients) : 0,
    oneOffTotal: synced?.oneOffTotal || 0,
    oneOffProjects: synced?.oneOffProjects || [],
    history: history.map(h => ({
      date: h.date,
      mrr: h.mrr,
      activeClients: h.active_clients,
    })),
    source: synced ? 'synced' : 'mock',
    timestamp: new Date().toISOString(),
  })
}
