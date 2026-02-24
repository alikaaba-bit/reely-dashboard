# Xero API Integration Setup

## Step 1: Create Xero App

1. Go to https://developer.xero.com/myapps
2. Click "New app"
3. Fill in the details:
   - **App name**: Reely Financial Dashboard
   - **Integration type**: Web app
   - **Company or application URL**: https://reely-dashboard-production-6bcc.up.railway.app
   - **OAuth 2.0 redirect URI**: https://reely-dashboard-production-6bcc.up.railway.app/api/xero/callback

4. After creating, note down:
   - **Client ID**
   - **Client Secret**

## Step 2: Configure Railway Environment Variables

Add these environment variables in Railway:

```
XERO_CLIENT_ID=your_client_id_here
XERO_CLIENT_SECRET=your_client_secret_here
```

## Step 3: Connect Xero Account

1. Visit: https://reely-dashboard-production-6bcc.up.railway.app/api/xero/connect
2. You'll be redirected to Xero login
3. Authorize the app
4. You'll be redirected back to the dashboard

## Step 4: Test the Integration

Once connected, the dashboard will be able to:
- Pull real revenue data from Xero invoices
- Sync expense categories
- Track accounts receivable
- Calculate accurate profit margins

## OAuth 2.0 Redirect URI

Use this exact URI when configuring your Xero app:

```
https://reely-dashboard-production-6bcc.up.railway.app/api/xero/callback
```

## API Scopes Requested

- `offline_access` - Refresh tokens for long-term access
- `accounting.transactions` - Read invoices, bills, payments
- `accounting.contacts` - Read client/supplier information
- `accounting.settings` - Read account settings

## Security Notes

- Tokens will be stored securely (implement Supabase storage or encrypted sessions)
- Access tokens expire after 30 minutes
- Refresh tokens are used to get new access tokens automatically
- Always use HTTPS in production

## Troubleshooting

If OAuth fails:
1. Check that XERO_CLIENT_ID and XERO_CLIENT_SECRET are set correctly
2. Verify the redirect URI matches exactly in Xero app settings
3. Check Railway logs for detailed error messages

## Next Steps After Connection

After successful OAuth connection, you can:
1. Fetch real-time revenue data from Xero invoices
2. Replace mock expense data with Xero categories
3. Track accounts receivable and payable
4. Generate automated financial reports
