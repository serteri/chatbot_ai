import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { exchangeXeroCode, getXeroTenants } from '@/lib/xero/client'
import { prisma } from '@/lib/db/prisma'
import { cookies } from 'next/headers'

/**
 * GET /api/integrations/xero/callback
 * Xero redirects here after the user grants access.
 */
export async function GET(req: NextRequest) {
    // Always derive BASE_URL from the actual request origin (handles www ↔ apex)
    const BASE_URL = req.nextUrl.origin || process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const settingsUrl = `${BASE_URL}/en/dashboard/settings`

    function fail(reason: string) {
        console.error(`[XERO CALLBACK] FAILED — reason: ${reason}`)
        return NextResponse.redirect(`${settingsUrl}?xero=error&error=xero_failed&reason=${reason}`, { status: 307 })
    }

    console.log('[XERO CALLBACK] Invoked — origin:', BASE_URL)

    const session = await auth()
    if (!session?.user?.id) {
        return fail('unauthorized')
    }

    const { searchParams } = new URL(req.url)
    const code  = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    console.log('[XERO CALLBACK] code present:', !!code)
    console.log('[XERO CALLBACK] state prefix:', state?.substring(0, 8) ?? 'MISSING')

    if (error) return fail(error)
    if (!code || !state) return fail('missing_params')

    // ── CSRF state validation ──────────────────────────────────────────────
    const cookieStore = await cookies()
    const storedState = cookieStore.get('xero_oauth_state')?.value
    const cookieKeys  = cookieStore.getAll().map(c => c.name)

    console.log('[XERO CALLBACK] Cookies present:', cookieKeys)
    console.log('[XERO CALLBACK] Stored state prefix:', storedState?.substring(0, 8) ?? 'MISSING')

    if (!storedState) {
        console.error('[XERO STATE MISMATCH] xero_oauth_state cookie is MISSING')
        return fail('state_cookie_missing')
    }

    if (storedState !== state) {
        console.error('[XERO STATE MISMATCH] Values differ', { stored: storedState, received: state })
        return fail('state_mismatch')
    }

    // Clear validated state cookie immediately
    cookieStore.delete('xero_oauth_state')

    try {
        const tokens = await exchangeXeroCode(code)
        console.log('[XERO CALLBACK] Token exchange OK, expires_in:', tokens.expires_in)

        const tenants = await getXeroTenants(tokens.access_token)
        if (!tenants?.length) return fail('no_tenants')

        const primaryTenant = tenants[0]
        console.log('[XERO CALLBACK] Tenant:', primaryTenant.tenantName)

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

        console.log('[XERO CALLBACK] ✅ Saved token for user', session.user.id)
        return NextResponse.redirect(`${settingsUrl}?xero=connected`, { status: 307 })

    } catch (err) {
        console.error('[XERO CALLBACK] Exception:', err)
        return fail('token_exchange_failed')
    }
}
