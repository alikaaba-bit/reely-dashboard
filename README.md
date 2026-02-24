# Reely Studio - Mission Command Center 🚀

**Live Financial Dashboard** for Reely Studio leadership team. Real-time view of cash, revenue, pipeline, and profitability.

🔗 **Live Dashboard**: https://reely-dashboard-production-6bcc.up.railway.app

---

## 📊 Dashboard Overview

### Key Metrics Displayed

1. **Cash Position** - Live balance from Mercury Bank + Highbeam
2. **MRR Growth** - Monthly Recurring Revenue trend chart
3. **Monthly Goal Tracker** - Progress toward revenue targets (80-100% thresholds)
4. **Overheads** - Expense breakdown by category
5. **Net Profit** - Revenue - Expenses with margin %
6. **Company Valuation** - Agency EBITDA multiples (4x, 5.5x, 7x)
7. **Financial Metrics** - ARR, run rate, profit margin, runway
8. **Sales Pipeline** - Deal stages from ClickUp CRM

---

## 🏗️ Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animation**: Framer Motion
- **Hosting**: Railway
- **APIs**: Mercury, ClickUp, Google Sheets, Xero (OAuth)

---

## 🔌 Integrations

### 1. Mercury Bank API
- **Purpose**: Live cash balance and transaction history
- **Endpoint**: `/api/mercury`
- **Data**: Account balances, 30-day transaction history
- **Refresh**: Real-time on page load

### 2. ClickUp CRM
- **Purpose**: Sales pipeline and deal tracking
- **Endpoint**: `/api/clickup/pipeline`
- **Data**: 180 leads across 12 pipeline stages
- **Metrics**: Total pipeline value, deal count, win rate

### 3. Google Sheets Sync
- **Purpose**: Client roster, expenses, monthly goals
- **Endpoint**: `/api/sync` (POST)
- **Tabs Synced**:
  - **Clients** (gid=1208786387): 12 active clients, MRR $36,342
  - **Expenses** (gid=2075199276): Monthly overhead breakdown
  - **Scorecard** (gid=0): Monthly revenue goals by month
- **Trigger**: Manual via "Sync Clients" button or weekly cron (Friday 5pm PST)

### 4. Xero Accounting (OAuth)
- **Purpose**: Real invoice revenue and expense tracking
- **Setup**: Click "Connect Xero" button in dashboard header
- **OAuth Flow**: Redirects to Xero login → authorize → callback
- **Future**: Replace Google Sheets with live Xero data

---

## ⚙️ Environment Variables

Add these to Railway or `.env.local`:

```bash
# Mercury Bank API
MERCURY_API_KEY=secret-token:mercury_production_xxx

# ClickUp CRM
CLICKUP_API_KEY=pk_89480279_xxx

# Highbeam Account (fallback cash balance)
HIGHBEAM_BALANCE=29074.35

# Xero OAuth (for future invoice sync)
XERO_CLIENT_ID=D1796EDCB5844121AFA71BB16BDB26A6
XERO_CLIENT_SECRET=8IBmbxZXtow5ncVQn8gMPR84TLHeEJOLpn3W1qicm8WYWZmy

# App URL (for Xero OAuth redirect)
NEXT_PUBLIC_APP_URL=https://reely-dashboard-production-6bcc.up.railway.app
```

---

## 🚀 Deployment

### Deploy to Railway

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and link project
railway login
railway link

# Set environment variables (already set)
railway variables

# Deploy
git push origin main  # Auto-deploys via GitHub integration
# OR
railway up  # Manual deploy from CLI
```

Railway auto-builds from GitHub on every push to `main`.

### Local Development

```bash
# Install dependencies
npm install

# Create .env.local with environment variables
cp .env.example .env.local

# Run dev server
npm run dev

# Open http://localhost:3000
```

---

## 📁 Project Structure

```
reely-dashboard/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── mercury/route.ts          # Cash balance + transactions
│   │   │   ├── clickup/
│   │   │   │   └── pipeline/route.ts     # CRM pipeline data
│   │   │   ├── scorecard/route.ts        # Financial metrics aggregator
│   │   │   ├── sync/route.ts             # Google Sheets sync endpoint
│   │   │   ├── sync-debug/route.ts       # Debug CSV parsing
│   │   │   └── xero/
│   │   │       ├── connect/route.ts      # OAuth initiation
│   │   │       └── callback/route.ts     # OAuth callback handler
│   │   ├── components/
│   │   │   ├── CashCard.tsx              # Cash position + runway
│   │   │   ├── MRRChart.tsx              # MRR trend over time
│   │   │   ├── GoalTrackerCard.tsx       # Monthly goal progress
│   │   │   ├── OverheadCard.tsx          # Expense breakdown
│   │   │   ├── ProfitCard.tsx            # Net profit + dividends
│   │   │   ├── ValuationCard.tsx         # Company valuation (EBITDA multiples)
│   │   │   ├── MetricsCard.tsx           # ARR, run rate, runway
│   │   │   ├── PipelineFunnel.tsx        # Sales pipeline visualization
│   │   │   ├── SyncButton.tsx            # Google Sheets sync trigger
│   │   │   ├── XeroConnectButton.tsx     # Xero OAuth trigger
│   │   │   └── DashboardActions.tsx      # Export, print, alerts
│   │   ├── page.tsx                      # Main dashboard page
│   │   └── layout.tsx                    # Root layout
│   ├── lib/
│   │   ├── mercury.ts                    # Mercury API client
│   │   ├── mock-data.ts                  # Client roster, expenses data
│   │   └── utils.ts                      # Formatting utilities
├── .github/workflows/
│   └── sync-clients.yml                  # Weekly Google Sheets sync cron
├── Dockerfile                            # Railway deployment config
├── SYNC_SETUP.md                         # Google Sheets sync documentation
├── XERO_SETUP.md                         # Xero OAuth documentation
└── package.json
```

---

## 🔗 API Endpoints

### GET `/api/mercury`
Returns live cash position and transaction history.

**Response:**
```json
{
  "totalBalance": 42417,
  "accounts": [
    { "name": "Mercury Checking", "balance": 13342, "type": "mercury" },
    { "name": "Highbeam", "balance": 29074, "type": "highbeam" }
  ],
  "history": [
    { "date": "2026-02-24", "balance": 42417 }
  ]
}
```

### GET `/api/clickup/pipeline`
Returns CRM pipeline with deal stages.

**Response:**
```json
{
  "stages": [
    {
      "name": "Prospecting",
      "deals": [{ "id": "1", "name": "Acme Corp", "value": 15000 }],
      "totalValue": 40000,
      "count": 2
    }
  ],
  "summary": {
    "totalPipelineValue": 136000,
    "totalDeals": 5,
    "winRate": 100
  }
}
```

### GET `/api/scorecard?type={type}`
Aggregated financial metrics endpoint.

**Query Parameters:**
- `type=goal` - Monthly goal progress
- `type=valuation` - Company valuation (EBITDA multiples)
- `type=metrics` - Financial health (ARR, runway, profit margin)
- `type=profit` - Net profit calculation
- `type=overhead` - Expense breakdown
- `type=revenue` - MRR + client list
- `type=weekly` - Weekly scorecard metrics

**Example Response** (`type=valuation`):
```json
{
  "mrr": 36342,
  "arr": 436104,
  "ebitda": 188112,
  "ebitdaMargin": 51.7,
  "valuations": {
    "conservative": 752448,    // 4x EBITDA
    "market": 1034616,         // 5.5x EBITDA
    "premium": 1316784         // 7x EBITDA
  }
}
```

### POST `/api/sync`
Syncs data from Google Sheets (clients, expenses, monthly goals).

**Response:**
```json
{
  "success": true,
  "clients": 12,
  "mrr": 36342,
  "expenses": 20,
  "total_expenses": 20666,
  "monthly_goals": 12,
  "message": "Synced 14 clients (12 active), 20 expenses, 12 monthly goals"
}
```

### GET `/api/xero/connect`
Initiates Xero OAuth flow. Redirects to Xero login.

### GET `/api/xero/callback`
OAuth callback handler. Receives authorization code and exchanges for access token.

---

## 📋 Google Sheets Sync Setup

The dashboard syncs from this Google Sheet:
**https://docs.google.com/spreadsheets/d/1GIDvoOpWFFAeLljQ_2XiJk92r1F-907_/edit**

### Tabs Synced

1. **Clients Tab** (gid=1208786387)
   - Columns: Client, Status, Monthly Rate, Notes, One-Off Projects
   - Expected: 12 active clients, MRR $36,342

2. **Expenses Tab** (gid=2075199276)
   - Columns: Category, Amount
   - Expected: Payroll, Software & Marketing, Office, Accounting

3. **Scorecard Tab** (gid=0)
   - Columns: Month, Goal
   - Expected: Monthly revenue goals (February: $50k, March: $55k, etc.)

### How to Sync

1. **Manual**: Click "Sync Clients" button in dashboard header
2. **Automatic**: GitHub Actions runs every Friday at 5pm PST

### Sheet Format Requirements

**Clients Tab:**
```
| (empty) | Client          | Status | Monthly Rate | Notes | ... | One-Off Project |
|---------|-----------------|--------|--------------|-------|-----|-----------------|
|         | Koi             | Active | $5,499       |       |     | $0              |
|         | Brandon Agency  | Active | $3,499       |       |     | $0              |
```

**Expenses Tab:**
```
| Category              | Amount   |
|-----------------------|----------|
| Payroll               | $14,718  |
| Software & Marketing  | $5,609   |
```

**Sheet Permissions:**
- Must be set to "Anyone with the link can view" for CSV export access

See `SYNC_SETUP.md` for detailed documentation.

---

## 🔐 Xero OAuth Setup

### 1. Create Xero App

1. Go to https://developer.xero.com/myapps
2. Click "New app" → Web app
3. **OAuth 2.0 redirect URI**:
   `https://reely-dashboard-production-6bcc.up.railway.app/api/xero/callback`
4. Copy **Client ID** and **Client Secret**

### 2. Add to Railway

Already configured:
```bash
XERO_CLIENT_ID=D1796EDCB5844121AFA71BB16BDB26A6
XERO_CLIENT_SECRET=8IBmbxZXtow5ncVQn8gMPR84TLHeEJOLpn3W1qicm8WYWZmy
```

### 3. Connect Xero Account

1. Click **"Connect Xero"** button in dashboard header
2. Login to Xero and authorize
3. Redirected back to dashboard with green checkmark

### 4. What Xero Enables

- Pull real revenue from invoices
- Sync expense categories automatically
- Track accounts receivable
- Replace manual Google Sheets updates

See `XERO_SETUP.md` for detailed documentation.

---

## 📊 Dashboard Components

### Cash Position Card
- **Data Source**: Mercury API + Highbeam balance
- **Shows**: Total cash, account breakdown, 7-day change, monthly profit
- **Refresh**: On page load

### MRR Chart
- **Data Source**: `mock-data.ts` (historical) + Google Sheets sync (current)
- **Shows**: 6-month MRR trend, active client count, growth %
- **Updates**: Click "Sync Clients" button

### Goal Tracker Card
- **Data Source**: Google Sheets scorecard tab
- **Shows**: Current MRR vs monthly goal
- **Status**:
  - 🟢 **On Track** (≥100%)
  - 🟡 **At Risk** (80-99%)
  - 🔴 **Off Track** (<80%)

### Overhead Card
- **Data Source**: Google Sheets expenses tab
- **Shows**: Pie chart breakdown by category
- **Total**: $20,666/month

### Profit Card
- **Formula**: Revenue - Expenses = Net Profit
- **Shows**: Net profit, margin %, dividend distribution (25% each to 4 owners)
- **Current**: $15,676/month (43.1% margin)

### Valuation Card
- **Method**: Agency EBITDA multiples (not SaaS ARR multiples)
- **Multiples**:
  - **Conservative** (4x): $752K
  - **Market** (5.5x): $1.03M
  - **Premium** (7x): $1.32M
- **Based on**: Annual EBITDA of $188K

### Metrics Card
- **Shows**: ARR ($436K), run rate, profit margin, runway
- **Runway**: ∞ (profitable, not burning cash)

### Pipeline Funnel
- **Data Source**: ClickUp CRM (List ID: 901414162468)
- **Shows**: 180 leads across 12 stages, $136K pipeline value, 100% win rate

---

## 🛠️ Development

### Key Files to Edit

**Add New Component:**
```typescript
// src/app/components/NewCard.tsx
'use client'
import { useEffect, useState } from 'react'

export default function NewCard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/new-endpoint')
      .then(res => res.json())
      .then(setData)
  }, [])

  return <div>{/* Your component */}</div>
}
```

**Add New API Endpoint:**
```typescript
// src/app/api/new-endpoint/route.ts
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  return NextResponse.json({ data: 'value' })
}
```

**Add to Dashboard:**
```typescript
// src/app/page.tsx
import NewCard from './components/NewCard'

export default function Dashboard() {
  return (
    <div className="grid grid-cols-2 gap-6">
      <NewCard />
    </div>
  )
}
```

### Styling

Uses Tailwind CSS with custom dark theme:
- Primary: `#0F172A` (dark blue)
- Secondary: `#1E293B` (slate)
- Accent: `#3B82F6` (blue), `#8B5CF6` (purple)
- Text: `#F8FAFC` (white), `#64748B` (gray)

### Testing

```bash
# Run locally
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for TypeScript errors
npm run type-check
```

---

## 🐛 Troubleshooting

### Sync Button Returns 0 Clients

**Issue**: Google Sheet not publicly accessible for CSV export

**Fix**:
1. Open Google Sheet
2. Click "Share" → Change to "Anyone with the link can view"
3. Try sync again

### Valuation Showing Wrong Numbers

**Issue**: Using SaaS multiples instead of agency EBITDA multiples

**Fix**: Dashboard uses agency-appropriate 4-7x EBITDA multiples (not 4-6x ARR)

### Mercury API Returns 401 Unauthorized

**Issue**: API key invalid or expired

**Fix**: Check `MERCURY_API_KEY` in Railway environment variables

### Xero Connect Button Goes to 404

**Issue**: OAuth routes not deployed

**Fix**: Push latest code to GitHub, Railway auto-deploys

### Dashboard Shows Old Data After Sync

**Issue**: Browser cache

**Fix**: Hard refresh (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)

---

## 📈 Future Enhancements

- [ ] Real-time Xero invoice sync (replace Google Sheets)
- [ ] Expense auto-categorization from Mercury transactions
- [ ] Cash flow projections (30/60/90 day forecast)
- [ ] Alert system (email/Slack when metrics hit thresholds)
- [ ] Team member access controls (view-only for non-owners)
- [ ] Mobile app version
- [ ] Export to PDF for board meetings
- [ ] Historical data archive (more than 6 months)

---

## 📄 License

Private repository for Reely Studio internal use.

---

## 👥 Team

Built with Claude Code for Reely Studio leadership team.

**Need help?** Check the documentation:
- `SYNC_SETUP.md` - Google Sheets sync guide
- `XERO_SETUP.md` - Xero OAuth guide
- `RAILWAY_ENV_SETUP.md` - Environment variable setup

**Questions?** Contact the dev team or check Railway logs:
```bash
railway logs
```
