'use client'

import { AlertCircle } from 'lucide-react'

export default function MockBanner() {
  return (
    <div className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border border-amber-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <p className="text-sm font-medium text-amber-300">
            Demo Mode Active
          </p>
          <p className="text-xs text-amber-400/80">
            Showing sample data. Connect Mercury & ClickUp APIs for live data.
          </p>
        </div>
      </div>
    </div>
  )
}
