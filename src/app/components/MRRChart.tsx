'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Users, TrendingUp, DollarSign, Building2 } from 'lucide-react'
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'

interface RevenueData {
  clients: { company: string; status: string; monthly_rate: number; additional: number }[]
  currentMRR: number
  previousMRR: number
  growth: number
  activeClients: number
  avgRevenuePerClient: number
  history: { date: string; mrr: number; activeClients: number }[]
  note?: string
}

export default function MRRChart() {
  const [data, setData] = useState<RevenueData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scorecard?type=revenue')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-96 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const currentMRR = data?.currentMRR || 0
  const growth = data?.growth || 0
  const clients = data?.clients || []
  const history = data?.history || []

  const chartData = history.map(h => ({
    month: new Date(h.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' }),
    mrr: h.mrr,
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl shadow-lg shadow-emerald-500/25">
            <DollarSign className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">MRR & Revenue</h3>
            <p className="text-xs text-[#64748B]">{data?.activeClients || 0} Active Clients</p>
          </div>
        </div>
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
          growth >= 0 ? 'text-emerald-400 bg-emerald-400/10' : 'text-red-400 bg-red-400/10'
        }`}>
          <TrendingUp className="w-4 h-4" />
          {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
        </div>
      </div>

      <div className="mb-6">
        <p className="text-4xl font-bold text-white tracking-tight">{formatCurrency(currentMRR)}</p>
        <p className="text-sm text-[#64748B] mt-1">Monthly Recurring Revenue</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-4 border border-[#334155]/30">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[#64748B]">Active Clients</span>
          </div>
          <p className="text-2xl font-bold text-white">{data?.activeClients || 0}</p>
        </div>
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-4 border border-[#334155]/30">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-[#64748B]">Avg/Client</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(data?.avgRevenuePerClient || 0)}</p>
        </div>
      </div>

      {/* Client list */}
      <div className="mb-5 max-h-44 overflow-y-auto">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Active Clients</p>
        <div className="space-y-1.5">
          {clients.filter(c => c.status === 'Active').map((client, index) => (
            <motion.div
              key={client.company}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.04 }}
              className="flex items-center justify-between px-3 py-2 bg-[#1E293B]/30 rounded-lg"
            >
              <span className="text-sm text-[#94A3B8] truncate max-w-[150px]">{client.company}</span>
              <span className="text-sm font-medium text-white shrink-0">
                {formatCurrency(client.monthly_rate + client.additional)}/mo
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* MRR history chart */}
      {chartData.length > 0 && (
        <div className="h-28">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#64748B' }}
              />
              <Tooltip
                formatter={(value: number) => [formatCurrency(value), 'MRR']}
                contentStyle={{
                  backgroundColor: '#1E293B',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                }}
              />
              <Bar dataKey="mrr" radius={[5, 5, 0, 0]}>
                {chartData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={index === chartData.length - 1 ? '#10B981' : '#3B82F6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {data?.note && (
        <p className="text-xs text-[#475569] mt-3 border-t border-[#334155]/20 pt-3">{data.note}</p>
      )}
    </motion.div>
  )
}
