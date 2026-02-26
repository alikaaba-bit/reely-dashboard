import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const clientId = process.env.XERO_CLIENT_ID
  // Hardcode production URL to avoid any localhost issues
  const redirectUri = 'https://reely-dashboard-production-6bcc.up.railway.app/api/xero/callback'

  if (!clientId) {
    return NextResponse.json({ error: 'XERO_CLIENT_ID not configured' }, { status: 500 })
  }

  console.log('Xero OAuth: Initiating with redirect_uri:', redirectUri)

  // Xero OAuth 2.0 authorization URL
  const authUrl = new URL('https://login.xero.com/identity/connect/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'offline_access accounting.transactions accounting.contacts accounting.settings accounting.reports.read')
  authUrl.searchParams.set('state', Math.random().toString(36).substring(7))

  return NextResponse.redirect(authUrl.toString())
}
