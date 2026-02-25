import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')
  const error = searchParams.get('error')

  // Handle OAuth error
  if (error) {
    console.error('Xero OAuth error:', error)
    return NextResponse.redirect(new URL('/?xero=error', request.url))
  }

  // Handle missing code
  if (!code) {
    console.error('No authorization code received from Xero')
    return NextResponse.redirect(new URL('/?xero=missing-code', request.url))
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/xero/callback`
    console.log('Xero OAuth: Exchanging code for token with redirect_uri:', redirectUri)

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
      return NextResponse.redirect(new URL('/?xero=token-error', request.url))
    }

    const tokenData = await tokenResponse.json()

    // TODO: Store tokens securely (use Supabase or encrypted session storage)
    // For now, we'll just log success
    console.log('Xero OAuth successful, received tokens:', {
      access_token: tokenData.access_token ? 'present' : 'missing',
      refresh_token: tokenData.refresh_token ? 'present' : 'missing',
      expires_in: tokenData.expires_in,
    })

    // Build absolute redirect URL - hardcode production URL to avoid localhost issues
    const baseUrl = 'https://reely-dashboard-production-6bcc.up.railway.app'
    const redirectUrl = `${baseUrl}/?xero=connected`
    console.log('Xero OAuth: Redirecting to:', redirectUrl)

    // Redirect back to dashboard with success message
    return NextResponse.redirect(redirectUrl)
  } catch (err) {
    console.error('Xero OAuth callback error:', err)
    const baseUrl = 'https://reely-dashboard-production-6bcc.up.railway.app'
    return NextResponse.redirect(`${baseUrl}/?xero=error`)
  }
}
