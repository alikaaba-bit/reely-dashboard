import CashCard from './components/CashCard'
import MRRChart from './components/MRRChart'
import PipelineFunnel from './components/PipelineFunnel'
import OverheadCard from './components/OverheadCard'
import ProfitCard from './components/ProfitCard'
import SyncButton from './components/SyncButton'
import XeroConnectButton from './components/XeroConnectButton'
import DashboardActions from './components/DashboardActions'
import ValuationCard from './components/ValuationCard'
import MetricsCard from './components/MetricsCard'
import GoalTrackerCard from './components/GoalTrackerCard'
import { formatDistanceToNow } from '@/lib/utils'

export default function Dashboard() {
  const lastUpdated = new Date()

  return (
    <main className="min-h-screen bg-[#020617] safe-area-inset">
      {/* Header */}
      <header className="bg-[#0F172A] border-b border-[#1E293B] sticky top-0 z-10 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-[#3B82F6] to-[#8B5CF6] rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#F8FAFC]">Reely Studio</h1>
                <p className="text-xs sm:text-sm text-[#64748B]">Mission Command Center</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <DashboardActions />
              <XeroConnectButton />
              <SyncButton />
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Last Updated - Mobile Optimized */}
        <div className="flex items-center justify-between mb-4 text-xs sm:text-sm text-[#64748B]">
          <span>
            Last updated: {formatDistanceToNow(lastUpdated)} ago
          </span>
          <span className="hidden sm:inline">
            Auto-refresh: 30 min
          </span>
        </div>

        {/* Top Row - Cash + MRR */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-6 card-grid">
          <CashCard />
          <MRRChart />
        </div>

        {/* Goal Progress Tracker */}
        <div className="mb-6">
          <GoalTrackerCard />
        </div>

        {/* Financial Summary Row - Overhead + Profit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 card-grid">
          <OverheadCard />
          <ProfitCard />
        </div>

        {/* SaaS Metrics Row - Valuation + Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 card-grid">
          <ValuationCard />
          <MetricsCard />
        </div>

        {/* Pipeline Section */}
        <div className="mb-6">
          <PipelineFunnel />
        </div>

        {/* Footer */}
        <footer className="mt-8 sm:mt-12 text-center text-xs sm:text-sm text-[#64748B]">
          <p>Reely Dashboard • Auto-syncs with Mercury, ClickUp & Scorecards</p>
          <p className="mt-2 text-[#334155]">
            © {new Date().getFullYear()} Reely Studio
          </p>
        </footer>
      </div>
    </main>
  )
}
