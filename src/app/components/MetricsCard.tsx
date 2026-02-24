'use client'

import { useEffect, useState } from 'react'
import { Activity, Clock, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface MetricsData {
  runRate: number
  monthlyProfit: number
  profitMargin: number
  cashBalance: number
  runway: number
  burnRate: number
}

export default function MetricsCard() {
  const [data, setData] = useState<MetricsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scorecard?type=metrics')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-80 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const runRate = data?.runRate || 0
  const profit = data?.monthlyProfit || 0
  const margin = data?.profitMargin || 0
  const runway = data?.runway || 0
  const isProfitable = profit > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl shadow-lg shadow-cyan-500/25">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">Financial Metrics</h3>
            <p className="text-xs text-[#64748B]">Run Rate & Health</p>
          </div>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isProfitable ? 'bg-emerald-400/10 text-emerald-400' : 'bg-red-400/10 text-red-400'
        }`}>
          {isProfitable ? 'Profitable' : 'Burning'}
        </div>
      </div>

      {/* Run Rate */}
      <div className="mb-6">
        <p className="text-sm text-[#64748B] mb-1">Annual Run Rate</p>
        <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(runRate)}</p>
        <p className="text-xs text-[#64748B] mt-1">Based on current monthly revenue</p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-4 border border-[#334155]/30">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-[#64748B]">Monthly Profit</span>
          </div>
          <p className={`text-xl font-bold ${profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(profit)}
          </p>
          <p className="text-xs text-[#64748B] mt-1">{margin.toFixed(1)}% margin</p>
        </div>

        <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl p-4 border border-[#334155]/30">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-[#64748B]">Runway</span>
          </div>
          <p className="text-xl font-bold text-white">{runway > 0 ? `${runway} mo` : '∞'}</p>
          <p className="text-xs text-[#64748B] mt-1">At current rate</p>
        </div>
      </div>

      <p className="text-xs text-[#475569] border-t border-[#334155]/20 pt-3">
        Run rate = monthly revenue × 12. Runway calculated from cash reserves ÷ monthly burn.
      </p>
    </motion.div>
  )
}
