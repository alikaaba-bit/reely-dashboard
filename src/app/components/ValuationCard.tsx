'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface ValuationData {
  mrr: number
  arr: number
  valuations: {
    conservative: number  // 4x ARR
    market: number        // 5x ARR
    aggressive: number    // 6x ARR
  }
}

export default function ValuationCard() {
  const [data, setData] = useState<ValuationData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scorecard?type=valuation')
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

  const arr = data?.arr || 0
  const valuations = data?.valuations || { conservative: 0, market: 0, aggressive: 0 }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/25">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">Company Valuation</h3>
            <p className="text-xs text-[#64748B]">SaaS Multiple Estimates</p>
          </div>
        </div>
      </div>

      {/* ARR */}
      <div className="mb-6">
        <p className="text-sm text-[#64748B] mb-1">Annual Recurring Revenue</p>
        <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(arr)}</p>
      </div>

      {/* Valuation Estimates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-xl border border-[#334155]/30">
          <div>
            <p className="text-xs text-[#64748B]">Conservative (4× ARR)</p>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(valuations.conservative)}</p>
          </div>
          <div className="text-xs text-[#64748B]">Low risk</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
          <div>
            <p className="text-xs text-[#94A3B8]">Market (5× ARR)</p>
            <p className="text-xl font-bold text-blue-400">{formatCurrency(valuations.market)}</p>
          </div>
          <div className="text-xs text-[#94A3B8]">Industry avg</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-xl border border-[#334155]/30">
          <div>
            <p className="text-xs text-[#64748B]">Aggressive (6× ARR)</p>
            <p className="text-lg font-bold text-amber-400">{formatCurrency(valuations.aggressive)}</p>
          </div>
          <div className="text-xs text-[#64748B]">High growth</div>
        </div>
      </div>

      <p className="text-xs text-[#475569] mt-4 border-t border-[#334155]/20 pt-3">
        Valuations based on standard SaaS/agency multiples. Actual value depends on growth, churn, and market conditions.
      </p>
    </motion.div>
  )
}
