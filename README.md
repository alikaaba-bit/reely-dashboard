# Reely Dashboard - Mission Command Center

## 🎯 Overview
Live financial dashboard for Reely Studio leadership. Auto-syncs with:
- **Mercury Bank** → Cash position & runway
- **ClickUp** → Deal pipeline
- **Excel Scorecard** → MRR & client metrics

## 🏗️ Architecture

### Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Charts**: Recharts
- **Database**: Supabase (PostgreSQL + Realtime)
- **Hosting**: Railway
- **Sync**: Cron jobs + API routes

### Data Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Mercury    │───→│  Supabase   │←───│   ClickUp   │
│    API      │    │  (Source of │    │    API      │
└─────────────┘    │   Truth)    │    └─────────────┘
                   └──────┬──────┘
                          │
                   ┌──────▼──────┐
                   │  Next.js    │
                   │  Dashboard  │
                   └─────────────┘
```

## 📊 Dashboard Sections

### 1. Financial Health
- Cash position (Mercury)
- Burn rate calculation
- Runway projection
- MRR trend

### 2. Pipeline
- Deal stages from ClickUp
- Pipeline value
- Win rate
- Average deal size

### 3. Scorecard
- Q1/Q2 goals vs actual
- Individual employee metrics
- Progress bars

## 🚀 Deployment

### 1. Set Environment Variables
```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
MERCURY_API_KEY=
CLICKUP_API_KEY=
CLICKUP_TEAM_ID=
```

### 2. Run Database Migration
```bash
npx supabase db push
```

### 3. Deploy to Railway
```bash
railway login
railway link
railway up
```

## 📁 Project Structure

```
reely-dashboard/
├── app/
│   ├── api/
│   │   ├── mercury/
│   │   │   └── route.ts      # Mercury balance endpoint
│   │   ├── clickup/
│   │   │   └── route.ts      # Pipeline endpoint
│   │   ├── scorecard/
│   │   │   └── route.ts      # Excel sync endpoint
│   │   └── sync/
│   │       └── route.ts      # Manual sync trigger
│   ├── components/
│   │   ├── CashCard.tsx      # Cash position widget
│   │   ├── MRRChart.tsx      # MRR trend chart
│   │   ├── PipelineFunnel.tsx # Pipeline visualization
│   │   ├── OverheadCard.tsx  # Expenses breakdown
│   │   ├── ScorecardGrid.tsx # Goals vs actual
│   │   └── Layout.tsx        # Dashboard layout
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client
│   │   ├── mercury.ts        # Mercury API
│   │   ├── clickup.ts        # ClickUp API
│   │   └── utils.ts          # Utilities
│   ├── page.tsx              # Main dashboard
│   └── layout.tsx            # Root layout
├── supabase/
│   └── migrations/           # Database migrations
├── scripts/
│   └── sync-scorecard.ts     # Excel sync job
└── package.json
```

## 🔌 API Endpoints

### GET /api/mercury
Returns current cash balance from Mercury.

### GET /api/clickup/pipeline
Returns deal pipeline from ClickUp.

### GET /api/scorecard
Returns latest scorecard data from Supabase.

### POST /api/sync
Triggers manual sync of all data sources.

## 📝 TODO

- [ ] Set up Supabase schema
- [ ] Create Mercury API integration
- [ ] Create ClickUp API integration
- [ ] Build dashboard UI components
- [ ] Set up cron jobs for sync
- [ ] Add authentication (optional)
- [ ] Mobile responsiveness
- [ ] Alert system for thresholds
