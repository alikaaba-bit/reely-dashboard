'use client'

import { useEffect, useState } from 'react'
import { Trophy, Pencil, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface ScorecardMetric {
  id: string
  name: string
  goal: number | null
  actual: number | null
  unit: 'currency' | 'number' | 'percent'
}

interface ScorecardData {
  month: string
  monthLabel: string
  metrics: ScorecardMetric[]
}

function fmt(value: number | null, unit: ScorecardMetric['unit']): string {
  if (value === null || value === undefined) return '—'
  if (unit === 'currency') return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
  if (unit === 'percent') return value.toFixed(1) + '%'
  return value.toLocaleString()
}

function getPct(actual: number | null, goal: number | null): number | null {
  if (actual === null || goal === null || goal === 0) return null
  return Math.round((actual / goal) * 100)
}

function StatusDot({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="w-2.5 h-2.5 rounded-full bg-[#334155] inline-block" />
  if (pct >= 100) return <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-sm shadow-emerald-400/50" />
  if (pct >= 70) return <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block shadow-sm shadow-amber-400/50" />
  return <span className="w-2.5 h-2.5 rounded-full bg-red-400 inline-block shadow-sm shadow-red-400/50" />
}

function PctBadge({ pct }: { pct: number | null }) {
  if (pct === null) return <span className="text-xs text-[#64748B]">—</span>
  const color = pct >= 100 ? 'text-emerald-400' : pct >= 70 ? 'text-amber-400' : 'text-red-400'
  return <span className={`text-xs font-semibold ${color}`}>{pct}%</span>
}

export default function ScorecardGrid() {
  const [data, setData] = useState<ScorecardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState<ScorecardMetric[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/scorecard')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setDraft(d.metrics || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const onEdit = () => {
    setDraft(data?.metrics ? JSON.parse(JSON.stringify(data.metrics)) : [])
    setEditing(true)
  }

  const onCancel = () => setEditing(false)

  const onSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/scorecard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metrics: draft, month: data?.month }),
      })
      const saved = await res.json()
      setData(prev => prev ? { ...prev, metrics: saved.metrics } : prev)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const updateDraft = (id: string, field: 'goal' | 'actual', raw: string) => {
    const val = raw === '' ? null : parseFloat(raw.replace(/[^0-9.]/g, ''))
    setDraft(prev => prev.map(m => m.id === id ? { ...m, [field]: isNaN(val as number) ? null : val } : m))
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-96 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const metrics = editing ? draft : (data?.metrics || [])
  const onTrack = metrics.filter(m => {
    const pct = getPct(m.actual, m.goal)
    return pct !== null && pct >= 100
  }).length
  const hasData = metrics.some(m => m.goal !== null || m.actual !== null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/25">
            <Trophy className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">Monthly Scorecard</h3>
            <p className="text-xs text-[#64748B]">{data?.monthLabel || 'Current Month'} · Ryan Deiss Method</p>
          </div>
        </div>
        {!editing ? (
          <button
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs text-[#94A3B8] hover:text-white bg-[#1E293B] hover:bg-[#334155] px-3 py-1.5 rounded-lg border border-[#334155]/50 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit Goals
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

      {/* Summary bar */}
      {hasData && !editing && (
        <div className="flex items-center gap-2 mb-4 px-1">
          <div className="flex gap-1">
            {[...Array(metrics.length)].map((_, i) => {
              const m = metrics[i]
              const pct = getPct(m.actual, m.goal)
              return <StatusDot key={m.id} pct={pct} />
            })}
          </div>
          <span className="text-xs text-[#64748B]">
            {onTrack}/{metrics.length} metrics on track
          </span>
        </div>
      )}

      {/* Legend (only in edit mode) */}
      {editing && (
        <div className="mb-4 p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs text-[#94A3B8]">
          Enter your monthly goals and where you currently stand. Leave blank if not tracking yet.
        </div>
      )}

      {/* Table */}
      <div className="space-y-0">
        {/* Header row */}
        <div className="grid grid-cols-[1fr_90px_90px_60px_24px] gap-2 px-3 pb-2 text-xs font-semibold text-[#64748B] uppercase tracking-wider border-b border-[#334155]/30">
          <span>Metric</span>
          <span className="text-right">Goal</span>
          <span className="text-right">Actual</span>
          <span className="text-right">% Goal</span>
          <span />
        </div>

        {metrics.map((metric, index) => {
          const pct = getPct(metric.actual, metric.goal)
          return (
            <motion.div
              key={metric.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="grid grid-cols-[1fr_90px_90px_60px_24px] gap-2 items-center px-3 py-3 border-b border-[#334155]/20 last:border-0 hover:bg-[#1E293B]/30 rounded-lg transition-colors"
            >
              <span className="text-sm text-[#F8FAFC] font-medium truncate">{metric.name}</span>

              {/* Goal */}
              {editing ? (
                <input
                  type="text"
                  defaultValue={metric.goal !== null ? String(metric.goal) : ''}
                  onChange={e => updateDraft(metric.id, 'goal', e.target.value)}
                  placeholder="—"
                  className="text-right text-sm bg-[#1E293B] border border-[#334155] rounded-lg px-2 py-1 text-white placeholder-[#475569] focus:outline-none focus:border-indigo-500 w-full"
                />
              ) : (
                <span className="text-sm text-right text-[#94A3B8]">{fmt(metric.goal, metric.unit)}</span>
              )}

              {/* Actual */}
              {editing ? (
                <input
                  type="text"
                  defaultValue={metric.actual !== null ? String(metric.actual) : ''}
                  onChange={e => updateDraft(metric.id, 'actual', e.target.value)}
                  placeholder="—"
                  className="text-right text-sm bg-[#1E293B] border border-[#334155] rounded-lg px-2 py-1 text-white placeholder-[#475569] focus:outline-none focus:border-indigo-500 w-full"
                />
              ) : (
                <span className={`text-sm text-right font-semibold ${
                  pct !== null && pct >= 100 ? 'text-emerald-400' :
                  pct !== null && pct >= 70 ? 'text-amber-400' :
                  pct !== null ? 'text-red-400' : 'text-[#94A3B8]'
                }`}>{fmt(metric.actual, metric.unit)}</span>
              )}

              <div className="text-right"><PctBadge pct={pct} /></div>
              <div className="flex justify-center"><StatusDot pct={pct} /></div>
            </motion.div>
          )
        })}
      </div>

      {/* Legend */}
      {!editing && (
        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-[#334155]/30">
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> On track (≥100%)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> Behind (70–99%)
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" /> Off track (&lt;70%)
          </div>
        </div>
      )}
    </motion.div>
  )
}
