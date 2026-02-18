'use client'

import { useEffect, useState } from 'react'
import { Trophy, Pencil, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface WeeklyMetric {
  id: string
  name: string
  weeklyGoal: number
  unit: 'currency' | 'number'
  weeks: { w1: number | null; w2: number | null; w3: number | null; w4: number | null }
}

interface WeeklyData {
  month: string
  monthLabel: string
  metrics: WeeklyMetric[]
}

type WeekKey = 'w1' | 'w2' | 'w3' | 'w4'
const WEEK_KEYS: WeekKey[] = ['w1', 'w2', 'w3', 'w4']
const WEEK_LABELS = ['W1', 'W2', 'W3', 'W4']

function fmtVal(value: number | null, unit: WeeklyMetric['unit']): string {
  if (value === null || value === undefined) return '—'
  if (unit === 'currency') return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  return value.toLocaleString()
}

function fmtTotal(value: number, unit: WeeklyMetric['unit']): string {
  if (unit === 'currency') return formatCurrency(value)
  return value.toLocaleString()
}

function getTotal(metric: WeeklyMetric): number {
  return WEEK_KEYS.reduce((sum, k) => sum + (metric.weeks[k] ?? 0), 0)
}

// Returns pct of weekly goal achieved (null if no value entered)
function weekPct(val: number | null, goal: number): number | null {
  if (val === null) return null
  if (goal === 0) return null
  return Math.round((val / goal) * 100)
}

function cellColor(pct: number | null): string {
  if (pct === null) return 'text-[#475569]'
  if (pct >= 100) return 'text-emerald-400'
  if (pct >= 50) return 'text-amber-400'
  return 'text-red-400'
}

function MiniBar({ pct }: { pct: number | null }) {
  if (pct === null) return <div className="h-1 bg-[#1E293B] rounded-full mt-1" />
  const clamped = Math.min(pct, 100)
  const barColor = pct >= 100 ? 'bg-emerald-400' : pct >= 50 ? 'bg-amber-400' : 'bg-red-400'
  return (
    <div className="h-1 bg-[#1E293B] rounded-full mt-1 overflow-hidden">
      <div className={`h-full ${barColor} rounded-full transition-all duration-500`} style={{ width: `${clamped}%` }} />
    </div>
  )
}

export default function ScorecardGrid() {
  const [data, setData] = useState<WeeklyData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<WeeklyMetric[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/scorecard?type=weekly')
      .then(res => res.json())
      .then((d: WeeklyData) => {
        setData(d)
        setDraft(JSON.parse(JSON.stringify(d.metrics || [])))
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const onEdit = () => {
    setDraft(JSON.parse(JSON.stringify(data?.metrics || [])))
    setEditing(true)
  }

  const onCancel = () => setEditing(false)

  const onSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'weekly', metrics: draft, month: data?.month }),
      })
      const saved: WeeklyData = await res.json()
      setData(prev => prev ? { ...prev, metrics: saved.metrics } : prev)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const updateDraft = (id: string, week: WeekKey, raw: string) => {
    const val = raw === '' ? null : parseFloat(raw.replace(/[^0-9.]/g, ''))
    const numVal = val === null || isNaN(val) ? null : val
    setDraft(prev =>
      prev.map(m =>
        m.id === id ? { ...m, weeks: { ...m.weeks, [week]: numVal } } : m
      )
    )
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-96 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const metrics = editing ? draft : (data?.metrics || [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">Weekly Scorecard</h3>
            <p className="text-xs text-[#64748B]">{data?.monthLabel || 'Current Month'} · Agency KPIs</p>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white bg-[#1E293B] hover:bg-[#334155] px-3 py-1.5 rounded-lg border border-[#334155]/50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={onCancel}
              className="flex items-center gap-1 text-xs text-[#94A3B8] hover:text-white bg-[#1E293B] px-3 py-1.5 rounded-lg border border-[#334155]/50 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Cancel
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="flex items-center gap-1 text-xs text-white bg-indigo-600 hover:bg-indigo-500 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" /> {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        )}
      </div>

      {/* Edit hint */}
      {editing && (
        <div className="mb-4 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-[#94A3B8]">
          Enter actuals for each week. Leave blank if the week hasn't happened yet.
        </div>
      )}

      {/* Table — scrollable on small screens */}
      <div className="overflow-x-auto -mx-1">
        <table className="w-full min-w-[480px] text-sm border-collapse">
          <thead>
            <tr className="border-b border-[#334155]/30">
              <th className="text-left py-2 px-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider w-[35%]">
                Metric
              </th>
              {WEEK_LABELS.map(label => (
                <th key={label} className="text-center py-2 px-1 text-xs font-semibold text-[#64748B] uppercase tracking-wider w-[12%]">
                  {label}
                </th>
              ))}
              <th className="text-right py-2 px-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric, index) => {
              const total = getTotal(metric)
              const monthlyGoal = metric.weeklyGoal * 4
              const totalPct = weekPct(total, monthlyGoal)

              return (
                <motion.tr
                  key={metric.id}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-[#334155]/20 last:border-0 hover:bg-[#1E293B]/20 transition-colors"
                >
                  {/* Metric name + goal */}
                  <td className="py-3 px-2">
                    <p className="text-[#F8FAFC] font-medium text-xs leading-tight">{metric.name}</p>
                    <p className="text-[10px] text-[#475569] mt-0.5">
                      Goal: {fmtVal(metric.weeklyGoal, metric.unit)}/wk
                    </p>
                  </td>

                  {/* Week cells */}
                  {WEEK_KEYS.map(wk => {
                    const val = metric.weeks[wk]
                    const pct = weekPct(val, metric.weeklyGoal)
                    return (
                      <td key={wk} className="py-2 px-1 text-center align-top">
                        {editing ? (
                          <input
                            type="text"
                            inputMode="numeric"
                            defaultValue={val !== null ? String(val) : ''}
                            onChange={e => updateDraft(metric.id, wk, e.target.value)}
                            placeholder="—"
                            className="w-full text-center text-xs bg-[#1E293B] border border-[#334155] rounded-md px-1 py-1.5 text-white placeholder-[#475569] focus:outline-none focus:border-indigo-500"
                          />
                        ) : (
                          <div>
                            <span className={`text-xs font-semibold ${cellColor(pct)}`}>
                              {fmtVal(val, metric.unit)}
                            </span>
                            <MiniBar pct={pct} />
                          </div>
                        )}
                      </td>
                    )
                  })}

                  {/* Total / MTD */}
                  <td className="py-2 px-2 text-right align-top">
                    <span className={`text-xs font-bold ${cellColor(totalPct)}`}>
                      {fmtTotal(total, metric.unit)}
                    </span>
                    <MiniBar pct={totalPct} />
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      {!editing && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#334155]/30 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> On target (≥100%)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Close (50–99%)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Off track (&lt;50%)
          </div>
        </div>
      )}
    </motion.div>
  )
}
