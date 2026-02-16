# Reely Dashboard - Project Rules

**Project:** Reely Studio Mission Command Center  
**Location:** `/Users/ali/reely-dashboard/`  
**Brand:** Reely (reely.studio) - Digital agency

---

## Brand Guidelines (REELY - Not Petra)

### Visual Identity (Placeholder - Update with Reely's actual brand)
- **Primary Color:** `#0F172A` (Dark slate - professional/agency feel)
- **Secondary Color:** `#3B82F6` (Blue - trust/tech)
- **Accent Color:** `#10B981` (Green - growth/money)
- **Dark Theme Base:** `#020617` (Near black)
- **Card Background:** `#0F172A` (Dark slate)

### Typography
- Clean, modern sans-serif
- Professional but approachable
- Dashboard-focused readability

---

## API Keys (Placeholders)

All API keys use placeholder values. Replace in production:

```bash
# Mercury Bank
MERCURY_API_KEY=mercury_api_key_placeholder

# ClickUp
CLICKUP_API_KEY=clickup_api_key_placeholder
CLICKUP_TEAM_ID=your_team_id
CLICKUP_PIPELINE_LIST_ID=your_list_id

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=supabase_anon_key_placeholder
SUPABASE_SERVICE_ROLE_KEY=supabase_service_role_key_placeholder

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Note:** Never commit real API keys. Use `.env.local` only.

---

## Project Structure

```
reely-dashboard/
├── app/
│   ├── api/           # API routes for data sources
│   ├── components/    # Dashboard widgets
│   ├── lib/           # Utilities & API clients
│   └── page.tsx       # Main dashboard
├── supabase/          # Database migrations
├── scripts/           # Sync scripts
└── .env.local         # API keys (not committed)
```

---

## Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with real API keys

# Run database migration
supabase db push

# Start dev server
npm run dev
```

---

## Data Sources

1. **Mercury Bank** - Cash position, transactions
2. **ClickUp** - Deal pipeline stages
3. **Excel Scorecard** - MRR, goals (via sync script)

---

## Deployment

```bash
# Deploy to Railway
railway login
railway link
railway up
```

---

## Notes

- This is a REELY project, not Petra Brands holding co
- Brand colors should be updated to match Reely's actual branding
- All sensitive data in `.env.local` only
