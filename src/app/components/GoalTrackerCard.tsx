'use client'

import { useEffect, useState } from 'react'
import { Target, TrendingUp, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface GoalData {
  currentMRR: number
  monthlyGoal: number
  gap: number
  percentOfGoal: number
  status: 'on-track' | 'at-risk' | 'off-track'
  month: string
}

export default function GoalTrackerCard() {
  const [data, setData] = useState<GoalData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scorecard?type=goal')
      .then(res => res.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-32 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const current = data?.currentMRR || 0
  const goal = data?.monthlyGoal || 0
  const gap = data?.gap || 0
  const percent = data?.percentOfGoal || 0
  const status = data?.status || 'off-track'
  const month = data?.month || 'This Month'

  const statusConfig = {
    'on-track': {
      color: 'emerald',
      text: 'On Track',
      icon: TrendingUp,
      bg: 'bg-emerald-400/10',
      textColor: 'text-emerald-400',
      border: 'border-emerald-400/30'
    },
    'at-risk': {
      color: 'amber',
      text: 'At Risk',
      icon: AlertTriangle,
      bg: 'bg-amber-400/10',
      textColor: 'text-amber-400',
      border: 'border-amber-400/30'
    },
    'off-track': {
      color: 'red',
      text: 'Off Track',
      icon: AlertTriangle,
      bg: 'bg-red-400/10',
      textColor: 'text-red-400',
      border: 'border-red-400/30'
    },
  }

  const config = statusConfig[status]
  const StatusIcon = config.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className={`relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border ${config.border} p-6`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 bg-gradient-to-br from-${config.color}-500 to-${config.color}-600 rounded-xl shadow-lg shadow-${config.color}-500/25`}>
            <Target className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">{month} Goal Progress</h3>
            <p className="text-xs text-[#64748B]">Monthly MRR Target</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${config.bg} ${config.textColor} text-sm font-medium`}>
          <StatusIcon className="w-4 h-4" />
          {config.text}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-end justify-between mb-2">
          <div>
            <p className="text-2xl font-bold text-white">{formatCurrency(current)}</p>
            <p className="text-xs text-[#64748B]">Current MRR</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold text-[#94A3B8]">{formatCurrency(goal)}</p>
            <p className="text-xs text-[#64748B]">Goal</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3 bg-[#1E293B] rounded-full overflow-hidden border border-[#334155]/30">
          <div
            className={`h-full bg-gradient-to-r from-${config.color}-500 to-${config.color}-600 transition-all duration-500`}
            style={{ width: `${Math.min(percent, 100)}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-1">
          <p className={`text-sm font-medium ${config.textColor}`}>{percent.toFixed(0)}% of goal</p>
          {gap !== 0 && (
            <p className={`text-sm ${gap > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              {gap > 0 ? `${formatCurrency(gap)} behind` : `${formatCurrency(Math.abs(gap))} ahead`}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}
