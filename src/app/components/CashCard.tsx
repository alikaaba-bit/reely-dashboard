'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, calculateBurnRate, calculateRunway } from '@/lib/utils'
import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from 'lucide-react'
import { motion } from 'framer-motion'

interface CashData {
  balance: number
  history: { date: string; balance: number }[]
  mockMode?: boolean
}

export default function CashCard() {
  const [data, setData] = useState<CashData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/mercury')
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-48 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const balance = data?.balance || 0
  const history = data?.history || []
  
  const balances = history.map(h => h.balance)
  const burnRate = calculateBurnRate(balances)
  const runway = calculateRunway(balance, burnRate)

  const lastWeekBalance = history.length > 7 ? history[history.length - 8].balance : balance
  const weeklyChange = balance - lastWeekBalance
  const weeklyChangePercent = lastWeekBalance > 0 ? (weeklyChange / lastWeekBalance) * 100 : 0

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 group"
    >
      {/* Glow effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-[#F8FAFC]">Cash Position</h3>
              <p className="text-xs text-[#64748B]">Mercury Bank</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-sm font-medium">Live</span>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-4xl font-bold text-white tracking-tight">
              {formatCurrency(balance)}
            </p>
            <div className="flex items-center gap-2 mt-2">
              {weeklyChange >= 0 ? (
                <TrendingUp className="w-5 h-5 text-emerald-400" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-400" />
              )}
              <span className={`text-sm font-medium ${weeklyChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {weeklyChange >= 0 ? '+' : ''}{formatCurrency(weeklyChange)}
              </span>
              <span className="text-sm text-[#64748B]">
                ({weeklyChangePercent >= 0 ? '+' : ''}{weeklyChangePercent.toFixed(1)}%) vs last week
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1E293B]/50 rounded-xl p-4 border border-[#334155]/30">
              <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium">Monthly Burn</p>
              <p className={`text-xl font-bold mt-1 ${burnRate < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {burnRate < 0 ? '-' : '+'}{formatCurrency(Math.abs(burnRate))}
              </p>
            </div>
            <div className="bg-[#1E293B]/50 rounded-xl p-4 border border-[#334155]/30">
              <p className="text-xs text-[#64748B] uppercase tracking-wider font-medium">Runway</p>
              <p className="text-xl font-bold mt-1 text-amber-400">
                {runway === Infinity ? '∞' : `${Math.floor(runway)} months`}
              </p>
            </div>
          </div>

          {/* Sparkline with gradient */}
          {history.length > 1 && (
            <div className="h-16 flex items-end gap-1 pt-4">
              {history.slice(-30).map((h, i) => {
                const max = Math.max(...history.slice(-30).map(x => x.balance))
                const min = Math.min(...history.slice(-30).map(x => x.balance))
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
      </div>
    </motion.div>
  )
}
