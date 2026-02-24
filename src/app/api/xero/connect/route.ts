import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const clientId = process.env.XERO_CLIENT_ID
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/xero/callback`

  if (!clientId) {
    return NextResponse.json({ error: 'XERO_CLIENT_ID not configured' }, { status: 500 })
  }

  // Xero OAuth 2.0 authorization URL
  const authUrl = new URL('https://login.xero.com/identity/connect/authorize')
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('client_id', clientId)
  authUrl.searchParams.set('redirect_uri', redirectUri)
  authUrl.searchParams.set('scope', 'offline_access accounting.transactions accounting.contacts accounting.settings')
  authUrl.searchParams.set('state', Math.random().toString(36).substring(7))

  return NextResponse.redirect(authUrl.toString())
}
