# Reely Dashboard - Discovery Phase

## Project Brief
Build a live mission command center dashboard for Reely Studio (agency) that auto-syncs with:
- Mercury Bank (cash position)
- ClickUp (deal pipeline)
- Excel Scorecard (MRR & goals)

## Key Questions & Answers

### 1. What's the primary purpose?
Leadership command center to see:
- Financial health (cash, MRR, burn)
- Sales pipeline status
- Team goal progress

### 2. Who's the audience?
- Ali Kaaba (Founder) - primary user
- Leadership team
- Daily check-ins, weekly reviews

### 3. Data Sources
- **Mercury Bank**: Cash balance, transactions (via API)
- **ClickUp**: Deal pipeline stages (via API)
- **Excel Scorecard**: MRR from Client tab, Q1 goals

### 4. Critical Metrics
- Cash position & runway
- MRR with trend
- Active clients
- Pipeline value by stage
- Overhead breakdown
- Goal completion %

### 5. Design Requirements
- Brand colors: Petra Purple #251F5C, Gold #C9A84C
- Dark theme preferred for dashboard (#0C0A14 base)
- Mobile responsive
- Real-time or near real-time updates

### 6. Tech Stack (Per SOP)
- Next.js 14 + TypeScript
- Tailwind CSS
- Supabase (PostgreSQL)
- Recharts for visualizations
- Railway hosting

### 7. Sync Frequency
- Mercury: Hourly
- ClickUp: Every 30 min
- Excel: Daily or manual

### 8. Access Control
- Internal use only (no auth needed for MVP)
- API keys in .env only (security rule)

## Discovery Complete ✅
Ready for planning phase.
