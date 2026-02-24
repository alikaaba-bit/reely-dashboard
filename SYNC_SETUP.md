# Google Sheets Sync Setup

## Overview

The Reely Dashboard syncs data from your Google Sheet to keep financials up-to-date. Click the "Sync Clients" button in the header to pull the latest data.

## What Gets Synced

1. **Clients Tab** (gid=1208786387)
   - Company names
   - Status (Active/Inactive)
   - Monthly rates
   - Additional fees
   - One-off project revenue
   - → Updates: MRR, Active Client Count, Revenue metrics

2. **Expenses Tab** (gid=2075199276)
   - Expense categories
   - Monthly amounts
   - → Updates: Overhead breakdown, Net Profit calculations

## How It Works

### Manual Sync
1. Click the **"Sync Clients"** button in the dashboard header
2. System fetches latest data from both tabs
3. Dashboard refreshes automatically with updated numbers

### Automatic Sync (Weekly)
GitHub Actions runs every **Friday at 5pm PST** to sync automatically.

## Sheet Format Requirements

### Clients Tab
Expected columns (in order):
1. Company Name
2. Status (Active/Inactive)
3. Monthly Rate ($)
4. Additional Fees ($)
5. One-Off Projects ($)

Example:
```
Company Name       | Status  | Monthly Rate | Additional | One-Off Project
Body Restore       | Active  | 3499         | 0          | 0
People Finders     | Active  | 1999         | 0          | 5000
```

### Expenses Tab
Expected columns (in order):
1. Category Name
2. Amount ($)

Example:
```
Category              | Amount
Payroll               | 14718
Software & Marketing  | 5609
Office & Facilities   | 186
```

## Google Sheet URLs

- **Main Sheet**: https://docs.google.com/spreadsheets/d/1GIDvoOpWFFAeLljQ_2XiJk92r1F-907_/edit
- **Clients Tab**: ?gid=1208786387
- **Expenses Tab**: ?gid=2075199276

## Technical Details

### Data Storage
- Synced data is stored in-memory on the server
- Persists across requests during server lifetime
- Resets on Railway redeployment (click Sync again)
- Falls back to static data if no sync has occurred

### Security
- Google Sheet must be publicly viewable (CSV export access)
- No authentication required for public sheets
- Data is fetched read-only, never written back

### Adding New Tabs

To sync additional tabs (e.g., Scorecard metrics):

1. Get the gid from the tab URL
2. Add it to `/src/app/api/sync/route.ts`:
   ```typescript
   const SCORECARD_GID = 'YOUR_GID_HERE'
   ```
3. Add fetch call in POST handler
4. Parse and store in syncedData object

## Troubleshooting

### Sync Button Shows Error
- Check that Google Sheet is publicly viewable
- Verify gid numbers are correct
- Check Railway logs for detailed errors

### Numbers Not Updating
- Make sure you clicked Sync after changing the sheet
- Refresh the page after sync completes
- Check that sheet format matches expected columns

### Old Data Showing After Sync
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Clear browser cache if issue persists

## Future Enhancements

- Real-time sync via webhooks
- Sync status indicator in dashboard
- Sync history and audit log
- Conflict resolution for concurrent edits
