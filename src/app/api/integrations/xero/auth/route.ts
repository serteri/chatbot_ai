import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { buildXeroAuthUrl, XERO_SCOPES } from '@/lib/xero/client'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

/**
 * GET /api/integrations/xero/auth
 * Always initiates a FRESH redirect to Xero — no token checks, no early exits.
 */
export async function GET(req: NextRequest) {
    // Session check — must be logged in to start the OAuth flow
    const session = await auth()
    if (!session?.user?.id) {
        console.error('[XERO AUTH] No session — cannot initiate OAuth')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('[XERO AUTH] Session OK for user:', session.user.id)
    console.log('[XERO AUTH] SENDING SCOPES:', XERO_SCOPES.join(' '))
    console.log('[XERO AUTH] CLIENT ID:', process.env.XERO_CLIENT_ID?.substring(0, 8) + '...')
    console.log('[XERO AUTH] XERO_REDIRECT_URI:', process.env.XERO_REDIRECT_URI)
    console.log('[XERO AUTH] Request host:', req.headers.get('host'))

    const cookieStore = await cookies()

    // ── Clear any stale state cookie before creating a fresh one ──────────
    // A leftover cookie from a previous interrupted flow causes state_mismatch.
    cookieStore.delete('xero_oauth_state')

    // Generate a fresh CSRF state
    const state = randomBytes(24).toString('hex')

    // Cookie domain: leading dot covers both www and apex in production.
    const host = req.headers.get('host') ?? ''
    const isProduction = process.env.NODE_ENV === 'production'
    const cookieDomain = isProduction
        ? '.' + host.replace(/^www\./, '')
        : undefined

    console.log('[XERO AUTH] STATE COOKIE DOMAIN:', cookieDomain ?? '(localhost)')

    cookieStore.set('xero_oauth_state', state, {
        httpOnly: true,
        secure:   isProduction,
        sameSite: 'lax',
        maxAge:   60 * 10, // 10 minutes
        path:     '/',
        ...(cookieDomain ? { domain: cookieDomain } : {}),
    })

    // Build the Xero authorize URL and redirect — always, unconditionally
    const xeroUrl = buildXeroAuthUrl(state)
    console.log('INITIATING XERO REDIRECT TO:', xeroUrl)

    // Use 307 (Temporary Redirect) to guarantee the browser follows the redirect
    // as a GET to Xero without caching the response.
    return NextResponse.redirect(xeroUrl, { status: 307 })
}
