'use client'

import { useEffect, useState } from 'react'
import { TrendingUp, AlertTriangle } from 'lucide-react'
import { motion } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

interface ExpenseItem {
  category: string
  amount: number
}

interface ProfitData {
  revenue: number
  oneOffTotal?: number
  totalRevenue?: number
  expenses: number
  expenseBreakdown: ExpenseItem[]
  netProfit: number
  margin: number
  month: string
}

interface MercuryData {
  totalBalance: number
  balance: number
}

const RESERVE = 30000
const SHAREHOLDERS = [
  { name: 'Geoff', pct: 25 },
  { name: 'Mursal', pct: 25 },
  { name: 'Ali', pct: 25 },
  { name: 'Micah', pct: 25 },
]

export default function ProfitCard() {
  const [profit, setProfit] = useState<ProfitData | null>(null)
  const [cashBalance, setCashBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/scorecard?type=profit').then(r => r.json()),
      fetch('/api/mercury').then(r => r.json()),
    ])
      .then(([profitData, mercuryData]: [ProfitData, MercuryData]) => {
        setProfit(profitData)
        setCashBalance(mercuryData.totalBalance ?? mercuryData.balance ?? null)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-72 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const available = cashBalance !== null ? cashBalance - RESERVE : null
  const perShareholder = available !== null && available > 0 ? available / 4 : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="p-3 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl shadow-lg shadow-emerald-500/25">
          <TrendingUp className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-semibold text-[#F8FAFC]">Net Profit & Dividends</h3>
          <p className="text-xs text-[#64748B]">{profit?.month || 'Current Month'}</p>
        </div>
      </div>

      {/* Revenue & Expenses */}
      <div className="space-y-2 mb-4">
        {/* MRR Revenue */}
        <div className="flex items-center justify-between py-2 px-3 bg-[#1E293B]/40 rounded-lg">
          <span className="text-sm text-[#94A3B8]">MRR Revenue</span>
          <span className="text-sm font-semibold text-[#F8FAFC]">
            {profit ? formatCurrency(profit.revenue) : '—'}
          </span>
        </div>

        {/* One-Off Projects */}
        {profit && (profit.oneOffTotal || 0) > 0 && (
          <div className="flex items-center justify-between py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
            <span className="text-sm text-amber-300">One-Off Projects (YTD)</span>
            <span className="text-sm font-semibold text-amber-300">
              {formatCurrency(profit.oneOffTotal || 0)}
            </span>
          </div>
        )}

        {/* Expenses with breakdown */}
        <div className="py-2 px-3 bg-[#1E293B]/40 rounded-lg">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm text-[#94A3B8]">Total Expenses</span>
            <span className="text-sm font-semibold text-red-400">
              {profit ? `(${formatCurrency(profit.expenses)})` : '—'}
            </span>
          </div>
          {profit?.expenseBreakdown && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 pl-2">
              {profit.expenseBreakdown.map(e => (
                <div key={e.category} className="flex items-center justify-between">
                  <span className="text-xs text-[#475569]">{e.category}</span>
                  <span className="text-xs text-[#64748B]">{formatCurrency(e.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-[#334155]/50 mb-4" />

      {/* Net Profit — big number */}
      <div className="flex items-end justify-between mb-5">
        <div>
          <p className="text-xs text-[#64748B] uppercase tracking-wider mb-1">Net Profit</p>
          <p className="text-3xl font-bold text-emerald-400">
            {profit ? formatCurrency(profit.netProfit) : '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-[#64748B]">Margin</p>
          <p className="text-xl font-bold text-emerald-300">
            {profit ? `${profit.margin}%` : '—'}
          </p>
        </div>
      </div>

      {/* Dividends Section */}
      <div className="bg-[#0F172A]/60 rounded-xl border border-[#334155]/30 p-4">
        <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider mb-3">
          Dividends Available
        </p>

        {/* Cash balance breakdown */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Cash Balance</span>
            <span className="text-xs font-medium text-[#F8FAFC]">
              {cashBalance !== null ? formatCurrency(cashBalance) : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#94A3B8]">Reserve</span>
            <span className="text-xs font-medium text-red-400">({formatCurrency(RESERVE)})</span>
          </div>
          <div className="border-t border-[#334155]/30 pt-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#CBD5E1]">Available</span>
            <span className={`text-xs font-bold ${
              available !== null && available > 0 ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {available !== null ? formatCurrency(available) : '—'}
            </span>
          </div>
        </div>

        {/* Warning if below reserve */}
        {available !== null && available <= 0 && (
          <div className="flex items-center gap-2 py-2 px-3 bg-amber-500/10 border border-amber-500/20 rounded-lg mb-3">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="text-xs text-amber-300">Retain earnings — below reserve</span>
          </div>
        )}

        {/* Shareholders */}
        {available !== null && available > 0 && (
          <div className="space-y-1.5 pt-1 border-t border-[#334155]/20">
            {SHAREHOLDERS.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 inline-block" />
                  <span className="text-xs text-[#94A3B8]">{s.name}</span>
                  <span className="text-xs text-[#475569]">{s.pct}%</span>
                </div>
                <span className="text-xs font-semibold text-[#F8FAFC]">
                  {perShareholder !== null ? formatCurrency(perShareholder) : '—'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* When below reserve, still show shareholders at zero */}
        {(available === null || available <= 0) && (
          <div className="space-y-1.5 pt-1 border-t border-[#334155]/20">
            {SHAREHOLDERS.map(s => (
              <div key={s.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#334155] inline-block" />
                  <span className="text-xs text-[#475569]">{s.name}</span>
                  <span className="text-xs text-[#334155]">{s.pct}%</span>
                </div>
                <span className="text-xs text-[#475569]">$0</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  )
}
