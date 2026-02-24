'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface ValuationData {
  mrr: number
  arr: number
  ebitda: number
  ebitdaMargin: number
  valuations: {
    conservative: number  // 4x EBITDA
    market: number        // 5.5x EBITDA
    premium: number       // 7x EBITDA
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
  const ebitda = data?.ebitda || 0
  const margin = data?.ebitdaMargin || 0
  const valuations = data?.valuations || { conservative: 0, market: 0, premium: 0 }

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
            <p className="text-xs text-[#64748B]">Agency EBITDA Multiples</p>
          </div>
        </div>
      </div>

      {/* EBITDA */}
      <div className="mb-6">
        <p className="text-sm text-[#64748B] mb-1">Annual EBITDA (Profit)</p>
        <p className="text-3xl font-bold text-white tracking-tight">{formatCurrency(ebitda)}</p>
        <p className="text-xs text-emerald-400 mt-1">{margin.toFixed(1)}% margin · ARR {formatCurrency(arr)}</p>
      </div>

      {/* Valuation Estimates */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-xl border border-[#334155]/30">
          <div>
            <p className="text-xs text-[#64748B]">Conservative (4× EBITDA)</p>
            <p className="text-lg font-bold text-emerald-400">{formatCurrency(valuations.conservative)}</p>
          </div>
          <div className="text-xs text-[#64748B]">Typical agency</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/30">
          <div>
            <p className="text-xs text-[#94A3B8]">Market (5.5× EBITDA)</p>
            <p className="text-xl font-bold text-blue-400">{formatCurrency(valuations.market)}</p>
          </div>
          <div className="text-xs text-[#94A3B8]">Recurring rev</div>
        </div>

        <div className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-xl border border-[#334155]/30">
          <div>
            <p className="text-xs text-[#64748B]">Premium (7× EBITDA)</p>
            <p className="text-lg font-bold text-amber-400">{formatCurrency(valuations.premium)}</p>
          </div>
          <div className="text-xs text-[#64748B]">High margin</div>
        </div>
      </div>

      <p className="text-xs text-[#475569] mt-4 border-t border-[#334155]/20 pt-3">
        Agency valuations based on EBITDA multiples (3-7x). Premium multiple applies to agencies with {'>'}40% margins and recurring revenue.
      </p>
    </motion.div>
  )
}
