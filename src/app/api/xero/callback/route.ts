import { NextResponse } from 'next/server'
import { storeTokens, fetchTenantId } from '@/lib/xero'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    console.error('Xero OAuth error:', error)
    return NextResponse.redirect(new URL('/?xero=error', 'https://reely-dashboard-production-6bcc.up.railway.app'))
  }

  if (!code) {
    console.error('No authorization code received from Xero')
    return NextResponse.redirect(new URL('/?xero=missing-code', 'https://reely-dashboard-production-6bcc.up.railway.app'))
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/xero/callback`
    console.log('Xero OAuth: Exchanging code for token')

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://identity.xero.com/connect/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
      }).toString(),
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Xero token exchange failed:', errorData)
      return NextResponse.redirect(new URL('/?xero=token-error', 'https://reely-dashboard-production-6bcc.up.railway.app'))
    }

    const tokenData = await tokenResponse.json()
    console.log('Xero OAuth: Token received, fetching tenant ID...')

    // Fetch the connected organization's tenant ID
    const tenantId = await fetchTenantId(tokenData.access_token)
    console.log('Xero OAuth: Tenant ID:', tenantId)

    // Store tokens + tenant ID in Supabase
    await storeTokens(
      tokenData.access_token,
      tokenData.refresh_token,
      tokenData.expires_in,
      tenantId
    )

    console.log('Xero OAuth: Tokens stored successfully')

    const response = NextResponse.redirect(
      new URL('/?xero=connected', 'https://reely-dashboard-production-6bcc.up.railway.app'),
      302
    )
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate')
    return response
  } catch (err) {
    console.error('Xero OAuth callback error:', err)
    return NextResponse.redirect(
      new URL('/?xero=error', 'https://reely-dashboard-production-6bcc.up.railway.app'),
      302
    )
  }
}
