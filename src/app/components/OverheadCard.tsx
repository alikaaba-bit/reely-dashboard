'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Receipt, TrendingDown } from 'lucide-react'
import { motion } from 'framer-motion'

interface ExpenseData {
  category: string
  amount: number
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']

const mockExpenses = [
  { category: 'Labour', amount: 18500 },
  { category: 'Software & Tools', amount: 850 },
  { category: 'Marketing', amount: 4500 },
  { category: 'Overheads', amount: 2200 },
]

export default function OverheadCard() {
  const [data, setData] = useState<ExpenseData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setData(mockExpenses)
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-2xl shadow-2xl border border-[#334155]/50 p-6 animate-pulse">
        <div className="h-80 bg-[#1E293B]/50 rounded-xl" />
      </div>
    )
  }

  const totalExpenses = data.reduce((sum, d) => sum + d.amount, 0)

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
            <p className="text-xs text-[#64748B]">Monthly Burn</p>
          </div>
        </div>
        <div className="text-right">
          <div className="flex items-center gap-2 text-red-400">
            <TrendingDown className="w-4 h-4" />
            <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
          </div>
          <p className="text-xs text-[#64748B]">per month</p>
        </div>
      </div>

      <div className="h-48 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="amount"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{ 
                backgroundColor: '#1E293B', 
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#F8FAFC'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="space-y-3">
        {data.map((item, index) => (
          <motion.div 
            key={item.category}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center justify-between p-3 bg-[#1E293B]/50 rounded-xl border border-[#334155]/30"
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm text-[#94A3B8]">{item.category}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-white">
                {formatCurrency(item.amount)}
              </span>
              <span className="text-xs text-[#64748B] w-10 text-right">
                {((item.amount / totalExpenses) * 100).toFixed(0)}%
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
