import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { exchangeXeroCode, getXeroTenants } from '@/lib/xero'
import { prisma } from '@/lib/db/prisma'
import { cookies } from 'next/headers'

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

/**
 * GET /api/integrations/xero/callback
 * Xero redirects here after the user grants access.
 * Validates CSRF state → exchanges code for tokens → persists to XeroToken.
 */
export async function GET(req: NextRequest) {
    const session = await auth()
    if (!session?.user?.id) {
        return NextResponse.redirect(`${BASE_URL}/dashboard/settings?xero=error&reason=unauthorized`)
    }

    const { searchParams } = new URL(req.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
        console.error('Xero OAuth error:', error)
        return NextResponse.redirect(`${BASE_URL}/dashboard/settings?xero=error&reason=${error}`)
    }

    if (!code || !state) {
        return NextResponse.redirect(`${BASE_URL}/dashboard/settings?xero=error&reason=missing_params`)
    }

    // Validate CSRF state
    const cookieStore = await cookies()
    const storedState = cookieStore.get('xero_oauth_state')?.value
    if (!storedState || storedState !== state) {
        console.error('Xero OAuth state mismatch')
        return NextResponse.redirect(`${BASE_URL}/dashboard/settings?xero=error&reason=state_mismatch`)
    }

    // Clear state cookie immediately
    cookieStore.delete('xero_oauth_state')

    try {
        // Exchange authorization code for tokens
        const tokens = await exchangeXeroCode(code)

        // Fetch connected Xero organisations (tenants)
        const tenants = await getXeroTenants(tokens.access_token)
        if (!tenants || tenants.length === 0) {
            return NextResponse.redirect(`${BASE_URL}/dashboard/settings?xero=error&reason=no_tenants`)
        }

        // Use the first (primary) tenant
        const primaryTenant = tenants[0]

        await prisma.xeroToken.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
                tenantId: primaryTenant.tenantId,
                tenantName: primaryTenant.tenantName ?? null,
            },
            update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
                tenantId: primaryTenant.tenantId,
                tenantName: primaryTenant.tenantName ?? null,
            },
        })

        console.log(`✅ Xero connected for user ${session.user.id} → org: ${primaryTenant.tenantName}`)
        return NextResponse.redirect(`${BASE_URL}/dashboard/settings?xero=connected`)
    } catch (err) {
        console.error('Xero callback error:', err)
        return NextResponse.redirect(`${BASE_URL}/dashboard/settings?xero=error&reason=token_exchange_failed`)
    }
}
