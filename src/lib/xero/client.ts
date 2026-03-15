/**
 * Xero OAuth 2.0 helpers — serverless-safe (no in-memory state)
 * xero-node is used for accounting API calls only; the auth flow is handled
 * manually so it works correctly across serverless/edge invocations.
 */

import { XeroClient } from 'xero-node'
import { prisma } from '@/lib/db/prisma'

// ---------------------------------------------------------------------------
// Scopes — Xero Web App valid scope names.
// NOTE: .write suffix does NOT exist in Xero's catalog.
//       Use base scope (no suffix) for read+write access.
// ---------------------------------------------------------------------------
export const XERO_SCOPES = [
    'openid',
    'profile',
    'email',
    'offline_access',
    'accounting.transactions',   // read + write (NOT .write — that's invalid)
    'accounting.contacts',       // read + write (NOT .write — that's invalid)
]

// ---------------------------------------------------------------------------
// Singleton xero-node client (accounting API calls only — not used for auth)
// ---------------------------------------------------------------------------
export const xero = new XeroClient({
    clientId:     process.env.XERO_CLIENT_ID!,
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
    // Single space between each scope — no commas, no other separators.
    const scopeStr = XERO_SCOPES.join(' ')

    const params = new URLSearchParams({
        response_type: 'code',
        client_id:     process.env.XERO_CLIENT_ID!,
        redirect_uri:  process.env.XERO_REDIRECT_URI!,
        scope:         scopeStr,
        state,
        prompt:        'select_account',
    })

    // Spaces must be %20, not +
    const xeroUrl = `${XERO_AUTH_BASE}?${params.toString().replace(/\+/g, '%20')}`

    console.log('XERO_URL_LOG:', xeroUrl)

    return xeroUrl
}

function basicAuth(): string {
    return Buffer.from(
        `${process.env.XERO_CLIENT_ID}:${process.env.XERO_CLIENT_SECRET}`
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
