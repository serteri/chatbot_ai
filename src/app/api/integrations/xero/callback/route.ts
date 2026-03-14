import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { exchangeXeroCode, getXeroTenants } from '@/lib/xero/client'
import { prisma } from '@/lib/db/prisma'
import { cookies } from 'next/headers'

/**
 * GET /api/integrations/xero/callback
 * Xero redirects here after the user grants access.
 * Validates CSRF state → exchanges code for tokens → persists to XeroToken.
 *
 * BASE_URL is derived from the incoming request (not NEXTAUTH_URL) so that
 * the post-OAuth redirect always goes back to the same www/apex origin the
 * user arrived on, keeping session cookies intact.
 */
export async function GET(req: NextRequest) {
    // Derive base URL from actual request to handle www ↔ apex transparently
    const origin  = req.nextUrl.origin                        // e.g. https://www.ndisshield.com.au
    const BASE_URL = origin || process.env.NEXTAUTH_URL || 'http://localhost:3000'

    console.log('[XERO CALLBACK] origin:', origin, '| BASE_URL:', BASE_URL)

    const session = await auth()
    if (!session?.user?.id) {
        console.error('[XERO CALLBACK] No session — user not authenticated')
        return NextResponse.redirect(`${BASE_URL}/en/dashboard/settings?xero=error&reason=unauthorized`)
    }

    const { searchParams } = new URL(req.url)
    const code  = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('[XERO CALLBACK] code present:', !!code, '| state:', state?.substring(0, 8) + '...')

    if (error) {
        console.error('[XERO CALLBACK] Xero returned error param:', error)
        return NextResponse.redirect(`${BASE_URL}/en/dashboard/settings?xero=error&reason=${error}`)
    }

    if (!code || !state) {
        console.error('[XERO CALLBACK] Missing code or state in query params')
        return NextResponse.redirect(`${BASE_URL}/en/dashboard/settings?xero=error&reason=missing_params`)
    }

    // ── CSRF state validation ──────────────────────────────────────────────
    const cookieStore  = await cookies()
    const storedState  = cookieStore.get('xero_oauth_state')?.value
    const allCookieKeys = cookieStore.getAll().map(c => c.name)

    console.log('[XERO CALLBACK] Cookies present:', allCookieKeys)
    console.log('[XERO CALLBACK] stored state prefix:', storedState?.substring(0, 8) ?? 'MISSING')
    console.log('[XERO CALLBACK] Xero state prefix:  ', state.substring(0, 8))

    if (!storedState) {
        console.error('[XERO STATE MISMATCH] xero_oauth_state cookie is MISSING — likely a domain or sameSite issue')
        return NextResponse.redirect(`${BASE_URL}/en/dashboard/settings?xero=error&reason=state_mismatch`)
    }

    if (storedState !== state) {
        console.error('[XERO STATE MISMATCH] Cookie value does not match Xero state param', {
            stored: storedState,
            received: state,
        })
        return NextResponse.redirect(`${BASE_URL}/en/dashboard/settings?xero=error&reason=state_mismatch`)
    }

    // Clear state cookie immediately after successful validation
    cookieStore.delete('xero_oauth_state')

    try {
        // Exchange authorization code for tokens
        const tokens = await exchangeXeroCode(code)
        console.log('[XERO CALLBACK] Token exchange successful, expires_in:', tokens.expires_in)

        // Fetch connected Xero organisations (tenants)
        const tenants = await getXeroTenants(tokens.access_token)
        if (!tenants || tenants.length === 0) {
            console.error('[XERO CALLBACK] No tenants returned from Xero')
            return NextResponse.redirect(`${BASE_URL}/en/dashboard/settings?xero=error&reason=no_tenants`)
        }

        const primaryTenant = tenants[0]
        console.log('[XERO CALLBACK] Primary tenant:', primaryTenant.tenantName, '(', primaryTenant.tenantId, ')')

        const tokenPayload = {
            accessToken:  tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt:    new Date(Date.now() + tokens.expires_in * 1000),
            tenantId:     primaryTenant.tenantId,
            tenantName:   primaryTenant.tenantName ?? null,
            active:       true,
        }

        await prisma.xeroToken.upsert({
            where:  { userId: session.user.id },
            create: { userId: session.user.id, ...tokenPayload },
            update: tokenPayload,
        })

        console.log(`[XERO CALLBACK] ✅ Connected user ${session.user.id} → org: ${primaryTenant.tenantName}`)
        return NextResponse.redirect(`${BASE_URL}/en/dashboard/settings?xero=connected`)

    } catch (err) {
        console.error('[XERO CALLBACK] Token exchange/DB error:', err)
        return NextResponse.redirect(`${BASE_URL}/en/dashboard/settings?xero=error&reason=token_exchange_failed`)
    }
}
