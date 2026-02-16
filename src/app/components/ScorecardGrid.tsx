'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { Target, CheckCircle2, Circle, AlertCircle, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'

interface Goal {
  id: string
  metric_name: string
  good_target: number
  better_target: number
  best_target: number
  actual_value: number
  unit: string
}

interface Employee {
  id: string
  employee_name: string
  metric_name: string
  target_value: number
  actual_value: number
}

interface ScorecardData {
  quarter: string
  year: number
  goals: Goal[]
  employees: Employee[]
}

function getProgressColor(actual: number, good: number, better: number, best: number): string {
  if (actual >= best) return 'from-emerald-500 to-green-500'
  if (actual >= better) return 'from-blue-500 to-cyan-500'
  if (actual >= good) return 'from-amber-500 to-yellow-500'
  return 'from-red-500 to-rose-500'
}

function getProgressWidth(actual: number, target: number): number {
  if (target === 0) return 0
  return Math.min((actual / target) * 100, 100)
}

export default function ScorecardGrid() {
  const [data, setData] = useState<ScorecardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scorecard?quarter=Q1&year=2026')
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

  const goals = data?.goals || []
  const employees = data?.employees || []

  const employeeGroups = employees.reduce((acc, emp) => {
    if (!acc[emp.employee_name]) acc[emp.employee_name] = []
    acc[emp.employee_name].push(emp)
    return acc
  }, {} as Record<string, Employee[]>)

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">Q1 2026 Scorecard</h3>
            <p className="text-xs text-[#64748B]">Goals vs Actual</p>
          </div>
        </div>
      </div>

      {/* Goals */}
      <div className="mb-8">
        <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
          Company Goals
        </h4>
        <div className="space-y-4">
          {goals.slice(0, 3).map((goal, index) => {
            const progress = getProgressWidth(goal.actual_value || 0, goal.best_target || goal.better_target || goal.good_target)
            const gradient = getProgressColor(
              goal.actual_value || 0,
              goal.good_target || 0,
              goal.better_target || 0,
              goal.best_target || 0
            )
            
            return (
              <motion.div 
                key={goal.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[#F8FAFC]">{goal.metric_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">
                      {goal.unit === 'dollar' ? formatCurrency(goal.actual_value || 0) : goal.actual_value || 0}
                    </span>
                    <span className="text-xs text-[#64748B]">
                      / {goal.unit === 'dollar' ? formatCurrency(goal.best_target || 0) : goal.best_target || 0}
                    </span>
                  </div>
                </div>
                <div className="h-3 bg-[#1E293B] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                    className={`h-full bg-gradient-to-r ${gradient} rounded-full`}
                  />
                </div>
                <div className="flex justify-between mt-1 text-xs text-[#64748B]">
                  <span>Good: {goal.unit === 'dollar' ? formatCurrency(goal.good_target || 0) : goal.good_target}</span>
                  <span>Best: {goal.unit === 'dollar' ? formatCurrency(goal.best_target || 0) : goal.best_target}</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Employee Scorecards */}
      {Object.keys(employeeGroups).length > 0 && (
        <div>
          <h4 className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-4">
            Team Performance
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(employeeGroups).slice(0, 4).map(([name, metrics], index) => {
              const completed = metrics.filter(m => (m.actual_value || 0) >= (m.target_value || 0)).length
              const total = metrics.length
              
              return (
                <motion.div 
                  key={name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-xl border border-[#334155]/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    {completed === total ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : completed > 0 ? (
                      <Circle className="w-5 h-5 text-amber-400" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-[#64748B]" />
                    )}
                    <span className="font-medium text-[#F8FAFC]">{name}</span>
                  </div>
                  <div className="text-xs text-[#64748B]">
                    {completed}/{total} goals on track
                  </div>
                  <div className="mt-2 h-1.5 bg-[#334155]/30 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
                      style={{ width: `${(completed / total) * 100}%` }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}
