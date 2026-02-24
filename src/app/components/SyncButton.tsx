'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'

export default function SyncButton() {
  const [syncing, setSyncing] = useState(false)
  const [message, setMessage] = useState('')

  const handleSync = async () => {
    setSyncing(true)
    setMessage('')

    try {
      const res = await fetch('/api/sync', { method: 'POST' })
      const data = await res.json()

      if (data.success) {
        setMessage(`✓ Synced ${data.clients} clients`)
        setTimeout(() => window.location.reload(), 1500)
      } else {
        setMessage(`✗ ${data.error || 'Sync failed'}`)
      }
    } catch (error) {
      setMessage(`✗ Network error`)
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {message && (
        <span className="text-xs text-[#94A3B8]">{message}</span>
      )}
      <button
        onClick={handleSync}
        disabled={syncing}
        className="flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] border border-[#334155]/50 rounded-lg text-xs text-[#94A3B8] hover:text-white transition-colors disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : 'Sync Clients'}
      </button>
    </div>
  )
}
