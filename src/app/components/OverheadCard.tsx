'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Receipt, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface ExpenseCategory {
  category: string
  amount: number
  color: string
}

interface OverheadData {
  categories: ExpenseCategory[]
  totalOverhead: number
  month: string
  note?: string
}

export default function OverheadCard() {
  const [data, setData] = useState<OverheadData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/scorecard?type=overhead')
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

  const categories = data?.categories || []
  const total = data?.totalOverhead || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      className="relative overflow-hidden bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0F172A] rounded-2xl shadow-2xl border border-[#334155]/50 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/25">
            <Receipt className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-[#F8FAFC]">Overheads</h3>
            <p className="text-xs text-[#64748B]">Monthly Expenses</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 justify-end">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <p className="text-2xl font-bold text-white">{formatCurrency(total)}</p>
          </div>
          <p className="text-xs text-[#64748B]">per month</p>
        </div>
      </div>

      <div className="h-44 mb-5">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categories}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={75}
              paddingAngle={4}
              dataKey="amount"
            >
              {categories.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: number, name: string) => [formatCurrency(value), name]}
              nameKey="category"
              contentStyle={{
                backgroundColor: '#1E293B',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#F8FAFC',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-2.5">
        {categories.map((item, index) => (
          <motion.div
            key={item.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-xl border border-[#334155]/30"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-[#94A3B8]">{item.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">{formatCurrency(item.amount)}</span>
              <span className="text-xs text-[#64748B] w-10 text-right">
                {total > 0 ? ((item.amount / total) * 100).toFixed(0) : 0}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {data?.note && (
        <p className="text-xs text-[#475569] mt-4 border-t border-[#334155]/20 pt-3">{data.note}</p>
      )}
    </motion.div>
  )
}
