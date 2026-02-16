'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false)

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      if (res.ok) {
        window.location.reload()
      }
    } catch (error) {
      console.error('Sync failed:', error)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <button
      onClick={handleSync}
      disabled={syncing}
      className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-white rounded-lg hover:bg-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
    >
      <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
      {syncing ? 'Syncing...' : 'Sync Data'}
    </button>
  )
}
