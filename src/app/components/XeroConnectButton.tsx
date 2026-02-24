'use client'

import { useState } from 'react'
import { ExternalLink, Check } from 'lucide-react'

export default function XeroConnectButton() {
  const [isConnected, setIsConnected] = useState(false)

  // Check URL params for connection status
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search)
    if (params.get('xero') === 'connected' && !isConnected) {
      setIsConnected(true)
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }

  const handleConnect = () => {
    window.location.href = '/api/xero/connect'
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
        <Check className="w-3.5 h-3.5" />
        Xero Connected
      </div>
    )
  }

  return (
    <button
      onClick={handleConnect}
      className="flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] hover:bg-[#334155] border border-[#334155]/50 rounded-lg text-xs text-[#94A3B8] hover:text-white transition-colors"
    >
      <ExternalLink className="w-3.5 h-3.5" />
      Connect Xero
    </button>
  )
}
