'use client'

import { Download, Printer, Bell, Share2 } from 'lucide-react'
import { useState } from 'react'

export default function DashboardActions() {
  const [showAlerts, setShowAlerts] = useState(false)

  const handleExport = () => {
    // Generate CSV with current data
    const data = [
      ['Metric', 'Value'],
      ['Cash Balance', '$42,417'],
      ['MRR', '$33,842'],
      ['Active Clients', '11'],
      ['Monthly Profit', '$13,176'],
      ['Total Expenses', '$20,666'],
      ['Pipeline Value', '$136,000'],
    ]
    
    const csv = data.map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reely-dashboard-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex items-center gap-2">
      <button 
        onClick={handleExport}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded-lg transition-colors"
        title="Export CSV"
      >
        <Download className="w-4 h-4" />
        <span className="hidden sm:inline">Export</span>
      </button>
      
      <button 
        onClick={handlePrint}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded-lg transition-colors"
        title="Print"
      >
        <Printer className="w-4 h-4" />
        <span className="hidden sm:inline">Print</span>
      </button>
      
      <button 
        onClick={() => setShowAlerts(!showAlerts)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[#94A3B8] hover:text-white hover:bg-[#1E293B] rounded-lg transition-colors relative"
        title="Alerts"
      >
        <Bell className="w-4 h-4" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        <span className="hidden sm:inline">Alerts</span>
      </button>

      {showAlerts && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-[#0F172A] border border-[#334155] rounded-xl shadow-2xl p-4 z-50">
          <h4 className="font-semibold text-white mb-3">Alert Settings</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">Cash below $50K</span>
              <input type="checkbox" className="w-4 h-4 accent-blue-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">MRR drops</span>
              <input type="checkbox" className="w-4 h-4 accent-blue-500" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[#94A3B8]">New deal won</span>
              <input type="checkbox" className="w-4 h-4 accent-blue-500" defaultChecked />
            </div>
            <div className="pt-3 border-t border-[#334155]">
              <button className="w-full py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">
                Save Alerts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
