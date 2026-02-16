# Reely Dashboard - Deployment Guide

## 🚀 Quick Deploy (5 minutes)

### 1. Supabase Setup

```bash
# Install Supabase CLI if not already installed
brew install supabase/tap/supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

Or manually run the SQL in `supabase/migrations/001_initial_schema.sql` in the Supabase SQL editor.

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in:

```bash
# Supabase (from your Supabase project settings)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Mercury Bank (from Mercury dashboard → API)
MERCURY_API_KEY=mercury_...

# ClickUp (from ClickUp settings → Apps)
CLICKUP_API_KEY=pk_...
CLICKUP_TEAM_ID=123456
```

### 3. Railway Deploy

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Deploy
railway up
```

### 4. Set Environment Variables in Railway

```bash
railway variables set NEXT_PUBLIC_SUPABASE_URL="..."
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
railway variables set SUPABASE_SERVICE_ROLE_KEY="..."
railway variables set MERCURY_API_KEY="..."
railway variables set CLICKUP_API_KEY="..."
railway variables set CLICKUP_TEAM_ID="..."
railway variables set NEXT_PUBLIC_APP_URL="https://your-app.up.railway.app"
```

## 📊 Dashboard Features

### Live Metrics
- **Cash Position**: Mercury balance with burn rate & runway
- **MRR**: Monthly recurring revenue with trend chart
- **Pipeline**: ClickUp deal funnel with win rates
- **Overheads**: Expense breakdown by category
- **Scorecard**: Q1 goals vs actual with team metrics

### Auto-Sync
- Mercury: Every hour (cron job)
- ClickUp: Every 30 minutes
- Scorecard: Manual or scheduled

## 🔧 Customization

### To sync your Excel scorecard:

1. **Share the Excel file** with me or upload to Google Sheets
2. I'll add the sync script to pull MRR from the "Clients" tab
3. The script will run daily and update Supabase

### To customize ClickUp pipeline:

Edit `src/lib/clickup.ts`:

```typescript
// Map your ClickUp statuses to pipeline stages
const stages: PipelineStage[] = [
  { name: 'Lead', deals: [], totalValue: 0, count: 0 },      // Your status
  { name: 'Qualified', deals: [], totalValue: 0, count: 0 }, // Your status
  { name: 'Proposal', deals: [], totalValue: 0, count: 0 },  // Your status
  { name: 'Closed Won', deals: [], totalValue: 0, count: 0 },
]
```

## 📝 API Keys Needed

1. **Mercury API Key**: 
   - Go to mercury.com → Settings → API
   - Generate read-only key

2. **ClickUp API Key**:
   - Go to clickup.com → Settings → Apps
   - Generate personal token

3. **Supabase**:
   - Project already set up
   - Keys in Settings → API

## 🔄 Manual Sync

Click the **"Sync Data"** button in the dashboard header to manually refresh all data.

## 🛠️ Local Development

```bash
cd /Users/ali/reely-dashboard

# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## 📱 Mobile Access

The dashboard is fully responsive and works on mobile devices.

## 🚨 Troubleshooting

### "Mercury API error"
- Check API key is valid
- Ensure key has read permissions

### "ClickUp API error"
- Verify team ID is correct
- Check list IDs match your setup

### "Supabase connection error"
- Verify URL and anon key
- Check database has been migrated

## 📊 Next Steps

1. **Deploy now** using steps above
2. **Share your Excel file** so I can add the MRR sync
3. **Test the dashboard** - all components are live
4. **Add alerts** - I can add Slack/email notifications for thresholds

Want me to help with any of these steps?
