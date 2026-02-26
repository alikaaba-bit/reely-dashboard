'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, Pencil, Check, X } from 'lucide-react'
import { motion } from 'framer-motion'

interface AccountSummary {
  name: string
  balance: number
  type: 'mercury' | 'highbeam'
}

interface CashData {
  accounts: AccountSummary[]
  totalBalance: number
  balance: number
  history: { date: string; balance: number }[]
  mockMode?: boolean
}

interface ProfitData {
  netProfit: number
  revenue: number
  expenses: number
}

export default function CashCard() {
  const [data, setData] = useState<CashData | null>(null)
  const [profitData, setProfitData] = useState<ProfitData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)

  const fetchData = () => {
    Promise.all([
      fetch('/api/mercury').then(res => res.json()),
      fetch('/api/scorecard?type=profit').then(res => res.json())
    ])
      .then(([mercury, profit]) => {
        setData(mercury)
        setProfitData(profit)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEdit = (acc: AccountSummary) => {
    setEditing(acc.name)
    setEditValue(acc.balance.toString())
  }

  const handleSave = async () => {
    if (!editing || !editValue) return
    setSaving(true)
    try {
      await fetch('/api/balance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_name: editing, balance: parseFloat(editValue) }),
      })
      setEditing(null)
      fetchData()
    } catch (err) {
      console.error('Save failed:', err)
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setEditing(null)
    setEditValue('')
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-48 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const totalBalance = data?.totalBalance ?? data?.balance ?? 0
  const accounts = data?.accounts || []
  const history = data?.history || []

  const monthlyProfit = profitData?.netProfit || 0
  const runway = monthlyProfit < 0 ? Math.floor(totalBalance / Math.abs(monthlyProfit)) : Infinity

  const lastWeekBalance = history.length > 7 ? history[history.length - 8].balance : totalBalance
  const weeklyChange = totalBalance - lastWeekBalance
  const weeklyChangePct = lastWeekBalance > 0 ? (weeklyChange / lastWeekBalance) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F8FAFC]">Cash Position</h3>
              <p className="text-xs text-[#64748B]">All accounts combined</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>

        {/* Total balance */}
        <div className="mb-5">
          <p className="text-4xl font-bold text-white tracking-tight">{formatCurrency(totalBalance)}</p>
          <div className="flex items-center gap-2 mt-2">
            {weeklyChange >= 0
              ? <TrendingUp className="w-5 h-5 text-emerald-400" />
              : <TrendingDown className="w-5 h-5 text-red-400" />
            }
            <span className={`text-sm font-medium ${weeklyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {weeklyChange >= 0 ? '+' : ''}{formatCurrency(weeklyChange)}
            </span>
            <span className="text-sm text-[#64748B]">
              ({weeklyChangePct >= 0 ? '+' : ''}{weeklyChangePct.toFixed(1)}%) vs last week
            </span>
          </div>
        </div>

        {/* Account breakdown */}
        {accounts.length > 0 && (
          <div className="space-y-2 mb-5">
            {accounts.map((acc, i) => (
              <motion.div
                key={acc.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-center justify-between px-4 py-2.5 bg-[#1E293B]/50 rounded-xl border border-[#334155]/30"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm text-[#94A3B8]">{acc.name}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    acc.type === 'mercury'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-amber-500/20 text-amber-400'
                  }`}>
                    {acc.type === 'mercury' ? 'Mercury' : 'Highbeam'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {editing === acc.name ? (
                    <>
                      <span className="text-sm text-[#64748B]">$</span>
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSave()}
                        className="w-28 bg-[#0F172A] border border-[#334155] rounded px-2 py-1 text-sm text-white text-right focus:outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleCancel}
                        className="p-1 text-[#64748B] hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="text-sm font-semibold text-white">{formatCurrency(acc.balance)}</span>
                      {acc.type === 'highbeam' && (
                        <button
                          onClick={() => handleEdit(acc)}
                          className="p-1 text-[#475569] hover:text-amber-400 transition-colors"
                          title="Update balance"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Burn / Runway */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-[#1E293B]/50 rounded-xl p-4 border border-[#334155]/30">
            <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium">Monthly Profit</p>
            <p className={`text-xl font-bold mt-1 ${monthlyProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {monthlyProfit >= 0 ? '+' : ''}{formatCurrency(monthlyProfit)}
            </p>
          </div>
          <div className="bg-[#1E293B]/50 rounded-xl p-4 border border-[#334155]/30">
            <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium">Runway</p>
            <p className="text-xl font-bold mt-1 text-amber-400">
              {runway === Infinity ? '∞' : `${Math.floor(runway)} months`}
            </p>
          </div>
        </div>

        {/* Sparkline */}
        {history.length > 1 && (
          <div className="h-14 flex items-end gap-0.5">
            {history.slice(-30).map((h, i) => {
              const slice = history.slice(-30)
              const max = Math.max(...slice.map(x => x.balance))
              const min = Math.min(...slice.map(x => x.balance))
              const range = max - min || 1
              const height = ((h.balance - min) / range) * 100
              return (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(height, 5)}%` }}
                  transition={{ delay: i * 0.02, duration: 0.5 }}
                  className="flex-1 bg-gradient-to-t from-blue-500 to-cyan-400 rounded-t-sm"
                  style={{ opacity: 0.4 + (i / 30) * 0.6 }}
                />
              )
            })}
          </div>
        )}
      </div>
    </motion.div>
  )
}
