# 🎯 Reely Dashboard - Built & Ready

## ✅ What's Been Built

### Full Stack Application
- **Framework**: Next.js 14 + TypeScript + Tailwind CSS
- **Database**: Supabase (PostgreSQL + Realtime)
- **Charts**: Recharts (interactive, responsive)
- **Icons**: Lucide React
- **Hosting**: Railway (ready to deploy)

### Dashboard Components

1. **💰 Cash Card** (`CashCard.tsx`)
   - Live Mercury balance
   - Weekly change indicator
   - Burn rate calculation
   - Runway projection (months)
   - Sparkline chart (30-day trend)

2. **📈 MRR Chart** (`MRRChart.tsx`)
   - Current MRR display
   - Month-over-month growth %
   - Active client count
   - Average revenue per client
   - 6-month bar chart

3. **🎯 Pipeline Funnel** (`PipelineFunnel.tsx`)
   - Visual funnel by stage
   - Deal counts & values
   - Total pipeline value
   - Win rate calculation
   - Closed won/lost summary

4. **💸 Overhead Card** (`OverheadCard.tsx`)
   - Monthly burn total
   - Donut chart by category
   - Breakdown: Labour, Software, Marketing, Overheads
   - Percentage distribution

5. **🎯 Scorecard Grid** (`ScorecardGrid.tsx`)
   - Q1 2026 goals vs actual
   - Good/Better/Best progress bars
   - Individual employee tracking
   - Goal completion status

6. **🔄 Sync Button** (`SyncButton.tsx`)
   - Manual refresh trigger
   - Sync status indicator
   - Auto-reload on completion

### API Routes

1. **`/api/mercury`** - Fetches cash balance from Mercury Bank API
2. **`/api/clickup`** - Fetches deal pipeline from ClickUp
3. **`/api/scorecard`** - Gets goals & employee metrics from Supabase
4. **`/api/sync`** - Triggers manual sync of all data sources

### Database Schema

**Tables created**:
- `cash_position` - Daily cash snapshots
- `mrr_metrics` - Monthly recurring revenue
- `pipeline_deals` - Deal tracking
- `expenses` - Expense categories
- `scorecard_goals` - Company goals
- `employee_scorecards` - Individual metrics
- `sync_log` - Sync history

### Sync Scripts

1. **`scripts/sync_excel.py`** - Syncs MRR from your Excel Client tab
   - Reads active clients
   - Calculates total MRR
   - Updates Supabase daily

## 📁 Project Structure

```
reely-dashboard/
├── app/
│   ├── api/
│   │   ├── mercury/route.ts
│   │   ├── clickup/route.ts
│   │   ├── scorecard/route.ts
│   │   └── sync/route.ts
│   ├── components/
│   │   ├── CashCard.tsx
│   │   ├── MRRChart.tsx
│   │   ├── PipelineFunnel.tsx
│   │   ├── OverheadCard.tsx
│   │   ├── ScorecardGrid.tsx
│   │   └── SyncButton.tsx
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── mercury.ts
│   │   ├── clickup.ts
│   │   └── utils.ts
│   ├── page.tsx
│   ├── layout.tsx
│   └── globals.css
├── supabase/
│   └── migrations/001_initial_schema.sql
├── scripts/
│   └── sync_excel.py
├── .env.local.example
├── DEPLOY.md
└── README.md
```

## 🚀 Deployment Steps (5 minutes)

1. **Supabase** (1 min)
   ```bash
   supabase db push
   ```

2. **Environment Variables** (1 min)
   ```bash
   cp .env.local.example .env.local
   # Edit with your API keys
   ```

3. **Railway** (3 mins)
   ```bash
   railway login
   railway link
   railway up
   ```

## 🔑 API Keys You Need

1. **Mercury Bank API Key**
   - mercury.com → Settings → API → Generate Key

2. **ClickUp API Key**
   - clickup.com → Settings → Apps → Generate Token

3. **Supabase Keys**
   - Already in your project settings

## 📝 Next Steps

1. **Share your Excel file** so I can:
   - Map the Client tab columns correctly
   - Update `sync_excel.py` with exact cell references
   - Set up automated daily sync

2. **Configure ClickUp**
   - Get your team ID and list ID
   - Map your deal statuses to pipeline stages

3. **Test the dashboard**
   - Deploy to Railway
   - Verify all data sources connect
   - Check charts render correctly

4. **Add alerts (optional)**
   - Low cash threshold
   - Pipeline deal stagnation
   - Goal progress warnings
   - Slack/email notifications

## 🎨 Dashboard Preview

```
┌─────────────────────────────────────────────────────────────┐
│  REELY STUDIO                        [Sync Data]            │
│  Mission Command Center                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  💰 CASH       📈 MRR          💸 OVERHEADS                 │
│  $125,000      $45,000/mo      $25,000/mo                   │
│  ▲ +5%         ▲ +12%          Labour: 60%                  │
│  Runway: 5mo   12 clients      Marketing: 18%               │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 PIPELINE              🎯 SCORECARD                      │
│                                                           │
│  Prospecting     $150K    Revenue Goal    ████████░░ 80%   │
│  Proposal Sent   $280K    New Clients     █████░░░░░ 50%   │
│  Negotiation     $120K    Retention       ██████████ 100%  │
│                                                           │
│  Total: $550K    Win: 65%  Team: 5 on track               │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## 🆘 Need Help?

- **Mercury connection issues?** Check API key has read permissions
- **ClickUp not syncing?** Verify team ID and list permissions  
- **Excel sync failing?** Share the file and I'll map columns
- **Charts not loading?** Check Recharts is installed

**Ready to deploy?** Run the commands in DEPLOY.md or give me your API keys and I'll deploy it for you.
