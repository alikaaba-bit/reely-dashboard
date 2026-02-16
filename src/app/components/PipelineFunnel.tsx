'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Target, ChevronRight, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface PipelineStage {
  name: string
  deals: any[]
  totalValue: number
  count: number
}

interface PipelineData {
  stages: PipelineStage[]
  summary: {
    totalPipelineValue: number
    totalDeals: number
    wonValue: number
    wonCount: number
    lostValue: number
    lostCount: number
    winRate: number
  }
}

const stageColors: Record<string, string> = {
  'Prospecting': 'from-amber-500 to-orange-500',
  'Proposal Sent': 'from-blue-500 to-cyan-500',
  'Negotiation': 'from-purple-500 to-pink-500',
  'Closed Won': 'from-emerald-500 to-green-500',
  'Closed Lost': 'from-red-500 to-rose-500',
}

export default function PipelineFunnel() {
  const [data, setData] = useState<PipelineData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clickup')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-96 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const summary = data?.summary
  const stages = data?.stages || []
  const maxValue = Math.max(...stages.map(s => s.totalValue), 1)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg shadow-purple-500/25">
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">Deal Pipeline</h3>
            <p className="text-xs text-[#64748B]">ClickUp</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{formatCurrency(summary?.totalPipelineValue || 0)}</p>
          <p className="text-xs text-[#64748B]">Total Pipeline</p>
        </div>
      </div>

      {/* Funnel */}
      <div className="space-y-3 mb-6">
        {stages.filter(s => s.name !== 'Closed Lost').map((stage, index) => {
          const width = stage.totalValue > 0 ? (stage.totalValue / maxValue) * 100 : 20
          const gradient = stageColors[stage.name] || 'from-gray-500 to-gray-600'
          
          return (
            <motion.div 
              key={stage.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-center gap-3">
                <div className="w-28 text-sm text-[#94A3B8] font-medium">{stage.name}</div>
                <div className="flex-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(width, 15)}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.5 }}
                    className={`h-12 bg-gradient-to-r ${gradient} rounded-xl flex items-center px-4 shadow-lg`}
                  >
                    <span className="text-white font-semibold text-sm">
                      {stage.count} deals
                    </span>
                  </motion.div>
                </div>
                <div className="w-24 text-right">
                  <p className="font-bold text-white">{formatCurrency(stage.totalValue)}</p>
                </div>
              </div>
              {index < stages.length - 2 && (
                <div className="flex justify-center my-2">
                  <ChevronRight className="w-5 h-5 text-[#334155] rotate-90" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 pt-6 border-t border-[#334155]/30">
        <div className="text-center p-4 bg-gradient-to-br from-emerald-500/10 to-transparent rounded-xl border border-emerald-500/20">
          <p className="text-2xl font-bold text-emerald-400">{summary?.wonCount || 0}</p>
          <p className="text-xs text-[#64748B]">Closed Won</p>
          <p className="text-sm font-semibold text-white mt-1">{formatCurrency(summary?.wonValue || 0)}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-500/10 to-transparent rounded-xl border border-blue-500/20">
          <p className="text-2xl font-bold text-blue-400">{summary?.totalDeals || 0}</p>
          <p className="text-xs text-[#64748B]">Total Deals</p>
          <p className="text-sm font-semibold text-white mt-1">{formatCurrency(summary?.totalPipelineValue || 0)}</p>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-purple-500/10 to-transparent rounded-xl border border-purple-500/20">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            <p className="text-2xl font-bold text-purple-400">{(summary?.winRate || 0).toFixed(0)}%</p>
          </div>
          <p className="text-xs text-[#64748B]">Win Rate</p>
          <p className="text-sm font-semibold text-white mt-1">YTD</p>
        </div>
      </div>
    </motion.div>
  )
}
