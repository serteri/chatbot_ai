import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { buildXeroAuthUrl, DEBUG_SCOPES } from '@/lib/xero/client'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'

/**
 * GET /api/integrations/xero/auth
 * Initiates the Xero OAuth 2.0 flow.
 * Stores a CSRF state token in an httpOnly cookie then redirects to Xero.
 */
export async function GET() {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // ── Debug logging — check Vercel function logs after clicking Connect ──
    console.log('SENDING SCOPES:', DEBUG_SCOPES.join(' '))
    console.log('CLIENT ID:', process.env.XERO_CLIENT_ID?.substring(0, 5) + '...')

    // Generate a secure random state for CSRF protection
    const state = randomBytes(24).toString('hex')

    const cookieStore = await cookies()
    cookieStore.set('xero_oauth_state', state, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 10, // 10 minutes
        path: '/',
    })

    const authUrl = buildXeroAuthUrl(state)
    console.log('XERO AUTH URL:', authUrl)
    return NextResponse.redirect(authUrl)
}
