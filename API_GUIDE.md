# 🔌 API Integration Guide

## Overview
Connect your real data sources to make the dashboard live.

---

## 1️⃣ Mercury Bank API

### Get Your API Key
1. Login to mercury.com
2. Go to **Settings** → **API**
3. Click **Create API Key**
4. Select **Read-only** permissions
5. Copy the key (starts with `mercury_`)

### What Data You'll See
- Real-time account balance
- Transaction history
- Cash flow trends
- Burn rate calculation

### Set Environment Variable
```bash
MERCURY_API_KEY=mercury_your_key_here
```

### Test Connection
```bash
curl -H "Authorization: Bearer $MERCURY_API_KEY" \
  https://api.mercury.com/api/v1/accounts
```

---

## 2️⃣ ClickUp API

### Get Your API Token
1. Login to clickup.com
2. Go to **Settings** (gear icon) → **Apps**
3. Click **Generate** under API Token
4. Copy the token (starts with `pk_`)

### Find Your Team ID
1. Look at your ClickUp URL
2. Format: `app.clickup.com/{TEAM_ID}/...`
3. Copy the number

### Find Your Pipeline List ID
1. Go to your Deals/CRM space
2. Open the Pipeline list
3. Look at URL: `.../li/{LIST_ID}`
4. Copy the list ID

### Set Environment Variables
```bash
CLICKUP_API_KEY=pk_your_token_here
CLICKUP_TEAM_ID=12345678
CLICKUP_PIPELINE_LIST_ID=9876543210
```

### Map Your Pipeline Stages
Edit `src/lib/clickup.ts`:

```typescript
const stages: PipelineStage[] = [
  { name: 'Lead', statusId: 'lead_status_id' },
  { name: 'Qualified', statusId: 'qualified_status_id' },
  { name: 'Proposal', statusId: 'proposal_status_id' },
  { name: 'Negotiation', statusId: 'negotiation_status_id' },
  { name: 'Closed Won', statusId: 'closed_won_status_id' },
  { name: 'Closed Lost', statusId: 'closed_lost_status_id' },
]
```

### Test Connection
```bash
curl -H "Authorization: $CLICKUP_API_KEY" \
  "https://api.clickup.com/api/v2/team/$CLICKUP_TEAM_ID/space"
```

---

## 3️⃣ Excel Sync (Already Working!)

### What It Does
- Reads your `Clients` tab
- Calculates total MRR
- Syncs to Supabase

### Run Manually
```bash
cd /Users/ali/reely-dashboard
python3 scripts/sync_excel.py
```

### Automate Daily
Add to crontab:
```bash
0 9 * * * cd /Users/ali/reely-dashboard && python3 scripts/sync_excel.py
```

Or use GitHub Actions (see `.github/workflows/sync.yml`)

---

## 4️⃣ Supabase (Database)

### Already Configured
✅ Database schema created  
✅ Tables: cash_position, mrr_metrics, pipeline_deals, scorecard_goals  
✅ Ready for live data

### Get Your Keys
1. Go to supabase.com
2. Open your project
3. Settings → API
4. Copy:
   - Project URL
   - anon public key
   - service_role key

### Set Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Push Schema
```bash
supabase db push
```

---

## 5️⃣ Slack Notifications (Optional)

### Create Slack App
1. Go to api.slack.com/apps
2. Create New App → From scratch
3. Add **Incoming Webhooks**
4. Copy Webhook URL

### Set Environment Variable
```bash
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
```

### Configure Alerts
Edit `src/lib/alerts.ts`:
- Cash below $50K
- MRR drops by 10%
- New deal > $20K won
- Daily summary at 9am

---

## 6️⃣ Email Alerts (Optional)

### Using SendGrid
```bash
SENDGRID_API_KEY=SG.xxx
ALERT_EMAIL=you@reely.studio
```

### Configure
Edit `src/lib/alerts.ts` with your email preferences.

---

## Testing Your Setup

### 1. Test All APIs
```bash
npm run test:apis
```

### 2. Sync Data
```bash
npm run sync
```

### 3. Check Dashboard
- Cash should show Mercury balance
- Pipeline should show ClickUp deals
- MRR should show Excel data

---

## Common Issues

### "Mercury API error"
- Check key is read-only (not admin)
- Verify account has API access
- Check rate limits

### "ClickUp API error"
- Token may have expired (regenerate)
- Check Team ID is correct
- Verify list permissions

### "Excel sync error"
- Check file path is correct
- Ensure 'Clients' tab exists
- Verify Supabase credentials

### "No data showing"
- Check browser console for errors
- Verify environment variables loaded
- Try hard refresh (Cmd+Shift+R)

---

## Security Best Practices

✅ **Never commit API keys**  
✅ **Use environment variables only**  
✅ **Rotate keys quarterly**  
✅ **Use read-only where possible**  
✅ **Monitor API usage**  

---

## Environment Variables Summary

```bash
# Required
MERCURY_API_KEY=
CLICKUP_API_KEY=
CLICKUP_TEAM_ID=
CLICKUP_PIPELINE_LIST_ID=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Optional
SLACK_WEBHOOK_URL=
SENDGRID_API_KEY=
ALERT_EMAIL=
```

---

## Next Steps

1. ✅ Get all API keys
2. ✅ Set environment variables
3. ✅ Run sync script
4. ✅ Deploy to Railway
5. ✅ Test live data
6. ✅ Set up alerts

**Questions?** Check `QUICKSTART.md` or run `npm run test:connection`
