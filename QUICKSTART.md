# 🚀 Reely Dashboard - Quick Start Guide

## What You Built
A live Mission Command Center that tracks:
- 💰 Cash position (Mercury Bank)
- 💵 MRR & revenue (from your Excel)
- 🎯 Deal pipeline (ClickUp)
- 📊 Q1 2026 scorecard goals

---

## Current Status
✅ **Dashboard built with premium UI**  
✅ **Real MRR data loaded** ($33,842 from 11 clients)  
✅ **Scorecard targets from Excel**  
⏳ **Waiting for API keys** to go live

---

## Your Real Data (From Excel)

### 💵 MRR Breakdown
| Client | Monthly Rate |
|--------|-------------|
| Koi | $5,499 |
| Body Restore | $3,499 |
| Brandon Agency | $3,499 |
| 51 Labs | $3,499 |
| Infinite Agency | $3,499 |
| Freshly Pressed | $3,350 |
| Hydra Fab | $3,200 |
| People Finders | $1,999 |
| Kalm | $1,999 |
| Good Moose | $1,999 |
| Curve Communications | $1,800 |
| **TOTAL** | **$33,842** |

### 🎯 Q1 2026 Goals
- **Revenue**: $33,842 / $60,000 (56% complete)
- **Labour**: $10,565 / $10,000 (6% over budget ⚠️)

---

## To Go Live

### Step 1: Get API Keys

**Mercury Bank:**
1. Go to mercury.com → Settings → API
2. Create read-only API key
3. Copy key

**ClickUp:**
1. Go to clickup.com → Settings → Apps
2. Generate personal API token
3. Find your Team ID (in URL: app.clickup.com/{TEAM_ID}/...)
4. Find your Pipeline List ID

### Step 2: Deploy

```bash
cd /Users/ali/reely-dashboard

# Option A: Railway (recommended)
railway login
railway link
railway up

# Option B: Docker
docker build -t reely-dashboard .
docker run -p 3000:3000 reely-dashboard
```

### Step 3: Set Environment Variables

```bash
# Mercury
MERCURY_API_KEY=your_key_here

# ClickUp
CLICKUP_API_KEY=your_token_here
CLICKUP_TEAM_ID=your_team_id
CLICKUP_PIPELINE_LIST_ID=your_list_id

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

---

## Features

### 📱 Mobile Optimized
- Responsive grid (stacks on phone)
- Touch-friendly buttons (44px min)
- Swipe gestures ready

### 🖨️ Print-Friendly
- Clean white layout when printing
- No buttons/animations
- All charts visible

### 📊 Export Options
- **CSV Export**: Click "Export" button
- **Print**: Click "Print" button
- **Share**: URL-based sharing

### 🔔 Alerts (Coming Soon)
- Cash below threshold
- MRR drops
- New deals won
- Slack/email notifications

---

## File Locations

```
/Users/ali/reely-dashboard/
├── src/
│   ├── app/
│   │   ├── components/     # Dashboard widgets
│   │   ├── api/           # API routes
│   │   ├── page.tsx       # Main dashboard
│   │   └── globals.css    # Styling
│   └── lib/
│       ├── mock-data.ts   # Your real data
│       └── utils.ts       # Helpers
├── scripts/
│   └── sync_excel.py      # Excel → Supabase sync
├── supabase/
│   └── migrations/        # Database schema
├── Dockerfile             # Container deploy
└── README.md             # This file
```

---

## Data Flow

```
Excel Clients Tab
       ↓
Python Sync Script
       ↓
Supabase (PostgreSQL)
       ↓
Next.js Dashboard
       ↓
Your Phone/Browser
```

---

## Troubleshooting

### "npm install fails"
Try: `npm install --production` or use Docker

### "Build fails"
Check Node version: `node --version` (need 18+)

### "Supabase connection error"
Verify credentials in `.env.local`

### "Data not showing"
Run sync script: `python3 scripts/sync_excel.py`

---

## Next Steps

1. **Deploy now** → Get live URL
2. **Connect APIs** → See real-time data
3. **Add team** → Share dashboard URL
4. **Set alerts** → Get notified
5. **Automate** → Daily Excel sync

---

## Support

Questions? Check:
- `DEPLOY.md` - Detailed deployment guide
- `CLAUDE.md` - Project rules & context
- Preview: Open `preview.html` in browser

**Ready to deploy?** Run `railway up` and you'll have a live URL in 2 minutes! 🚀
