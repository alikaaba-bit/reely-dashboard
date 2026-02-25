'use client'

import { useState, useEffect } from 'react'
import { ExternalLink, Check } from 'lucide-react'

export default function XeroConnectButton() {
  const [isConnected, setIsConnected] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // Check localStorage for persisted connection state
    const stored = localStorage.getItem('xero_connected')
    if (stored === 'true') {
      setIsConnected(true)
      setIsChecking(false)
      return
    }

    // Check URL params for connection status
    const params = new URLSearchParams(window.location.search)
    const xeroStatus = params.get('xero')

    if (xeroStatus === 'connected') {
      setIsConnected(true)
      localStorage.setItem('xero_connected', 'true')
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (xeroStatus === 'error' || xeroStatus === 'token-error') {
      alert('Xero connection failed. Please try again.')
    }

    setIsChecking(false)
  }, [])

  const handleConnect = () => {
    window.location.href = '/api/xero/connect'
  }

  const handleDisconnect = () => {
    localStorage.removeItem('xero_connected')
    setIsConnected(false)
  }

  if (isChecking) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1E293B] border border-[#334155]/50 rounded-lg text-xs text-[#64748B]">
        <div className="w-3.5 h-3.5 border-2 border-[#64748B] border-t-transparent rounded-full animate-spin" />
        Checking...
      </div>
    )
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-400">
          <Check className="w-3.5 h-3.5" />
          Xero Connected
        </div>
        <button
          onClick={handleDisconnect}
          className="px-2 py-1.5 text-xs text-[#64748B] hover:text-red-400 transition-colors"
          title="Disconnect Xero"
        >
          ✕
        </button>
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
