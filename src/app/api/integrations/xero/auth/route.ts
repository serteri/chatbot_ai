import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { buildXeroAuthUrl } from '@/lib/xero'
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
    return NextResponse.redirect(authUrl)
}
