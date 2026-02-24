# Railway Environment Variables Setup

Add this environment variable to Railway:

## Required for Google Sheets Sync

1. Go to your Google Sheet: https://docs.google.com/spreadsheets/d/1GIDvoOpWFFAeLljQ_2XiJk92r1F-907_/edit
2. Click on the "Clients" tab
3. Copy the `gid` value from the URL (looks like `#gid=123456789`)
4. In Railway, add this environment variable:

```
GOOGLE_SHEET_CLIENTS_GID=<paste the gid here>
```

5. Redeploy the service

## Verify Sync Works

After setting the env var:
1. Click the "Sync Clients" button in the dashboard header
2. Should see "✓ Synced X clients" message
3. Dashboard will auto-refresh with updated data

## Automated Friday Sync

The GitHub Action `.github/workflows/sync-clients.yml` will automatically sync every Friday at 5pm PST.
