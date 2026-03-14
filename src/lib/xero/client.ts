/**
 * Xero OAuth 2.0 helpers — serverless-safe (no in-memory state)
 * xero-node is used for accounting API calls only; the auth flow is handled
 * manually so it works correctly across serverless/edge invocations.
 */

import { XeroClient } from 'xero-node'
import { prisma } from '@/lib/db/prisma'

// ---------------------------------------------------------------------------
// Scopes — driven entirely by XERO_SCOPES env var; hard fallback if missing
// ---------------------------------------------------------------------------
const SCOPE_FALLBACK =
    'openid profile email accounting.transactions.read accounting.transactions.write accounting.contacts.read accounting.contacts.write offline_access'

/**
 * Returns the resolved scope string.
 * Called at request time (not module load) so env vars are always available.
 */
export function getXeroScopes(): string {
    const fromEnv = (process.env.XERO_SCOPES ?? '').trim()
    return fromEnv.length > 0 ? fromEnv : SCOPE_FALLBACK
}

// ---------------------------------------------------------------------------
// Singleton xero-node client (accounting API calls only — not used for auth)
// ---------------------------------------------------------------------------
export const xero = new XeroClient({
    clientId:     process.env.XERO_CLIENT_ID!,
    clientSecret: process.env.XERO_CLIENT_SECRET!,
    redirectUris: [process.env.XERO_REDIRECT_URI!],
    scopes:       SCOPE_FALLBACK.split(' '), // SDK init — uses fallback list
})

// ---------------------------------------------------------------------------
// OAuth 2.0 — manual flow (serverless-safe, no SDK state needed)
// ---------------------------------------------------------------------------
const XERO_AUTH_BASE   = 'https://login.xero.com/identity/connect/authorize'
const XERO_TOKEN_URL   = 'https://identity.xero.com/connect/token'
const XERO_TENANTS_URL = 'https://api.xero.com/connections'

export function buildXeroAuthUrl(state: string): string {
    // URLSearchParams encodes the scope value automatically (spaces → %20),
    // which is exactly what Xero expects.
    const params = new URLSearchParams({
        response_type: 'code',
        client_id:     process.env.XERO_CLIENT_ID!,
        redirect_uri:  process.env.XERO_REDIRECT_URI!,
        scope:         getXeroScopes(),
        state,
    })
    return `${XERO_AUTH_BASE}?${params.toString()}`
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
    if (!res.ok) throw new Error('Failed to fetch Xero tenants')
    return res.json()
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
