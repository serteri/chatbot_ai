/**
 * Xero OAuth 2.0 helpers — serverless-safe (no in-memory state)
 * xero-node is used for accounting API calls only; the auth flow is handled
 * manually so it works correctly across serverless/edge invocations.
 */

import { XeroClient } from 'xero-node'
import { prisma } from '@/lib/db/prisma'

// ---------------------------------------------------------------------------
// Scopes — hardcoded, no env var dependency.
// offline_access is mandatory for /connections to return tenants.
// accounting.transactions.write does NOT exist in Xero — using base scope.
// ---------------------------------------------------------------------------
export const XERO_SCOPES = [
    'openid',
    'profile',
    'email',
    'accounting.transactions.read',
    'accounting.settings.read',
    'offline_access',
]

// ---------------------------------------------------------------------------
// Client ID — hardcoded directly, no env var.
// ---------------------------------------------------------------------------
const XERO_CLIENT_ID = '89327FFBCD374083BA0332B63C7939C7'

// ---------------------------------------------------------------------------
// Singleton xero-node client (accounting API calls only — not used for auth)
// ---------------------------------------------------------------------------
export const xero = new XeroClient({
    clientId:     XERO_CLIENT_ID,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
    redirectUris: [process.env.XERO_REDIRECT_URI!],
    scopes:       [...XERO_SCOPES],
})

// ---------------------------------------------------------------------------
// OAuth 2.0 — manual flow (serverless-safe, no SDK state needed)
// ---------------------------------------------------------------------------
const XERO_AUTH_BASE   = 'https://login.xero.com/identity/connect/authorize'
const XERO_TOKEN_URL   = 'https://identity.xero.com/connect/token'
const XERO_TENANTS_URL = 'https://api.xero.com/connections'

export function buildXeroAuthUrl(state: string): string {
    const scopeStr    = XERO_SCOPES.join(' ')
    const redirectUri = process.env.XERO_REDIRECT_URI ?? 'MISSING'

    // ── Full diagnostic dump — visible in Vercel logs ──────────────────────
    console.log('=== XERO AUTH BUILD ===')
    console.log('CLIENT_ID         :', XERO_CLIENT_ID)
    console.log('CLIENT_ID length  :', XERO_CLIENT_ID.length)
    console.log('REDIRECT_URI      :', redirectUri)
    console.log('REDIRECT_URI chars:', [...redirectUri].map(c => c.charCodeAt(0)))
    console.log('SCOPES            :', scopeStr)
    console.log('response_type     :', 'code')
    console.log('grant_type (later):', 'authorization_code')
    console.log('=======================')

    const params = new URLSearchParams({
        response_type: 'code',
        client_id:     XERO_CLIENT_ID,
        redirect_uri:  redirectUri,
        scope:         scopeStr,
        state,
        prompt:        'select_account',
    })

    const xeroUrl = `${XERO_AUTH_BASE}?${params.toString().replace(/\+/g, '%20')}`
    console.log('URL_CHECK:', xeroUrl)

    return xeroUrl
}

function basicAuth(): string {
    return Buffer.from(
        `${XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
    ).toString('base64')
}

export async function exchangeXeroCode(code: string) {
    const res = await fetch(XERO_TOKEN_URL, {
        method: 'POST',
        headers: {
            Authorization:  `Basic ${basicAuth()}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type:   'authorization_code',
            code,
            redirect_uri: process.env.XERO_REDIRECT_URI!,
        }),
    })
    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Xero token exchange failed: ${err}`)
    }
    return res.json() as Promise<{
        access_token:  string
        refresh_token: string
        expires_in:    number
        token_type:    string
    }>
}

export async function refreshXeroAccessToken(refreshToken: string) {
    const res = await fetch(XERO_TOKEN_URL, {
        method: 'POST',
        headers: {
            Authorization:  `Basic ${basicAuth()}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type:    'refresh_token',
            refresh_token: refreshToken,
        }),
    })
    if (!res.ok) {
        const err = await res.text()
        throw new Error(`Xero token refresh failed: ${err}`)
    }
    return res.json() as Promise<{
        access_token:  string
        refresh_token: string
        expires_in:    number
    }>
}

export async function getXeroTenants(
    accessToken: string
): Promise<Array<{ tenantId: string; tenantName: string }>> {
    const res = await fetch(XERO_TENANTS_URL, {
        headers: { Authorization: `Bearer ${accessToken}` },
    })

    const rawText = await res.text()
    console.log('[XERO TENANTS] HTTP status:', res.status)
    console.log('[XERO TENANTS] Raw response body:', rawText)

    if (!res.ok) {
        throw new Error(`Failed to fetch Xero tenants — ${res.status}: ${rawText}`)
    }

    let parsed: any
    try {
        parsed = JSON.parse(rawText)
    } catch {
        throw new Error(`Xero /connections returned non-JSON: ${rawText}`)
    }

    console.log('[XERO TENANTS] Parsed count:', Array.isArray(parsed) ? parsed.length : 'not an array')
    console.log('[XERO TENANTS] Parsed value:', JSON.stringify(parsed))

    return parsed
}

// ---------------------------------------------------------------------------
// Token management — auto-refresh if within 5 min of expiry
// ---------------------------------------------------------------------------
export async function getValidXeroToken(userId: string) {
    const token = await prisma.xeroToken.findUnique({
        where: { userId, active: true },
    })
    if (!token) return null

    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000)
    if (token.expiresAt <= fiveMinutesFromNow) {
        const fresh = await refreshXeroAccessToken(token.refreshToken)
        return prisma.xeroToken.update({
            where: { userId },
            data: {
                accessToken:  fresh.access_token,
                refreshToken: fresh.refresh_token,
                expiresAt:    new Date(Date.now() + fresh.expires_in * 1000),
            },
        })
    }

    return token
}
