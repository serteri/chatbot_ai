import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { buildXeroAuthUrl, DEBUG_SCOPES } from '@/lib/xero/client'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

/**
 * GET /api/integrations/xero/auth
 * Initiates the Xero OAuth 2.0 flow.
 * Stores a CSRF state token in an httpOnly cookie then redirects to Xero.
 *
 * Cookie is set with domain=.ndisshield.com.au (leading dot) so it is sent
 * regardless of whether the user is on www or the apex domain — preventing
 * the "state_mismatch / Security check failed" error caused by www ↔ apex
 * redirects stripping the cookie.
 */
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Debug logging — visible in Vercel function logs ────────────────────
    console.log('SENDING SCOPES:', DEBUG_SCOPES.join(' '))
    console.log('CLIENT ID:', process.env.XERO_CLIENT_ID?.substring(0, 5) + '...')
    console.log('XERO_REDIRECT_URI:', process.env.XERO_REDIRECT_URI)
    console.log('Request host:', req.headers.get('host'))

    // Generate a secure random state for CSRF protection
    const state = randomBytes(24).toString('hex')

    // Derive cookie domain from the incoming hostname so it works on both
    // www.ndisshield.com.au and ndisshield.com.au. In dev, no domain is set
    // (undefined means the cookie scopes to localhost automatically).
    const host = req.headers.get('host') ?? ''
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieDomain = isProduction
        ? '.' + host.replace(/^www\./, '') // .ndisshield.com.au — covers www + apex
        : undefined

    console.log('STATE COOKIE DOMAIN:', cookieDomain ?? '(localhost — no domain set)')

    const cookieStore = await cookies()
    cookieStore.set('xero_oauth_state', state, {
        httpOnly: true,
        secure:   isProduction,
        sameSite: 'lax',
        maxAge:   60 * 10, // 10 minutes
        path:     '/',
        ...(cookieDomain ? { domain: cookieDomain } : {}),
    })

    const authUrl = buildXeroAuthUrl(state)
    console.log('XERO AUTH URL:', authUrl)
    return NextResponse.redirect(authUrl)
}
