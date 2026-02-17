'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Target, TrendingUp, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface PipelineStage {
  name: string
  deals: any[]
  totalValue: number
  count: number
  color: string
}

interface LeadSource {
  source: string
  count: number
  color: string
}

interface PipelineData {
  stages: PipelineStage[]
  leadSources: LeadSource[]
  summary: {
    totalPipelineValue: number
    totalActiveDeals: number
    totalDeals: number
    wonValue: number
    wonCount: number
    lostCount: number
    winRate: number
  }
  mockMode?: boolean
}

const STAGE_GRADIENT: Record<string, string> = {
  'Prospecting': 'from-slate-500 to-slate-400',
  'Engaged': 'from-amber-500 to-orange-400',
  'Call Booked': 'from-blue-500 to-cyan-400',
}

export default function PipelineFunnel() {
  const [data, setData] = useState<PipelineData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/clickup')
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

  const summary = data?.summary
  const allStages = data?.stages || []
  const activeFunnel = allStages.filter(s => ['Prospecting', 'Engaged', 'Call Booked'].includes(s.name))
  const wonStage = allStages.find(s => s.name === 'Closed Won')
  const lostStage = allStages.find(s => s.name === 'Closed Lost')
  const leadSources = (data?.leadSources || []).slice(0, 5)
  const maxCount = Math.max(...activeFunnel.map(s => s.count), 1)
  const maxSourceCount = Math.max(...leadSources.map(s => s.count), 1)

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
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">Deal Pipeline</h3>
            <p className="text-xs text-[#64748B]">ClickUp CRM · $2,997 avg deal</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-white">{formatCurrency(summary?.totalPipelineValue || 0)}</p>
          <p className="text-xs text-[#64748B]">{summary?.totalActiveDeals || 0} active leads</p>
        </div>
      </div>

      {/* Funnel */}
      <div className="space-y-2 mb-5">
        {activeFunnel.map((stage, index) => {
          const widthPct = stage.count > 0 ? (stage.count / maxCount) * 100 : 8
          const gradient = STAGE_GRADIENT[stage.name] || 'from-gray-500 to-gray-400'
          return (
            <motion.div key={stage.name} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}>
              <div className="flex items-center gap-3">
                <div className="w-24 text-sm text-[#94A3B8] font-medium shrink-0">{stage.name}</div>
                <div className="flex-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(widthPct, 12)}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
                    className={`h-10 bg-gradient-to-r ${gradient} rounded-xl flex items-center px-4 shadow-lg`}
                  >
                    <span className="text-white font-semibold text-sm whitespace-nowrap">
                      {stage.count} lead{stage.count !== 1 ? 's' : ''}
                    </span>
                  </motion.div>
                </div>
                <div className="w-20 text-right shrink-0">
                  <p className="font-bold text-white text-sm">{formatCurrency(stage.totalValue)}</p>
                </div>
              </div>
              {index < activeFunnel.length - 1 && (
                <div className="flex justify-start pl-[5.5rem] my-0.5">
                  <ChevronDown className="w-4 h-4 text-[#334155]" />
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Won / Lost / Win Rate */}
      <div className="grid grid-cols-3 gap-3 mb-5 pt-4 border-t border-[#334155]/30">
        <div className="text-center p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
          <p className="text-xl font-bold text-emerald-400">{wonStage?.count || 0}</p>
          <p className="text-xs text-[#64748B] mt-0.5">Closed Won</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(wonStage?.totalValue || 0)}</p>
        </div>
        <div className="text-center p-3 bg-red-500/10 rounded-xl border border-red-500/20">
          <p className="text-xl font-bold text-red-400">{lostStage?.count || 0}</p>
          <p className="text-xs text-[#64748B] mt-0.5">Closed Lost</p>
          <p className="text-sm font-semibold text-white">{formatCurrency(lostStage?.totalValue || 0)}</p>
        </div>
        <div className="text-center p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
          <div className="flex items-center justify-center gap-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <p className="text-xl font-bold text-purple-400">{(summary?.winRate || 0).toFixed(0)}%</p>
          </div>
          <p className="text-xs text-[#64748B] mt-0.5">Win Rate</p>
          <p className="text-sm font-semibold text-white">All time</p>
        </div>
      </div>

      {/* Lead Sources */}
      {leadSources.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">Lead Sources</p>
          <div className="space-y-2">
            {leadSources.map((src, i) => (
              <motion.div
                key={src.source}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 + i * 0.06 }}
                className="flex items-center gap-3"
              >
                <span className="text-xs text-[#94A3B8] w-28 shrink-0 truncate">{src.source}</span>
                <div className="flex-1 h-2 bg-[#1E293B] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(src.count / maxSourceCount) * 100}%` }}
                    transition={{ delay: 0.7 + i * 0.06, duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: src.color }}
                  />
                </div>
                <span className="text-xs font-medium text-white w-6 text-right shrink-0">{src.count}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
