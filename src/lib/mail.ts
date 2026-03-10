/**
 * Central Resend email client for NDIS Shield Hub.
 *
 * FROM addresses (all verified on resend.dev domain):
 *   info@ndisshield.com.au      — user-facing welcome / transactional
 *   no-reply@ndisshield.com.au  — system alerts and admin notifications
 */

import { Resend } from 'resend'

// ── Singleton client ──────────────────────────────────────────────────────────

let _client: Resend | null = null

export function getResend(): Resend {
    if (!_client) {
        const key = process.env.RESEND_API_KEY
        if (!key) throw new Error('RESEND_API_KEY is not set')
        _client = new Resend(key)
    }
    return _client
}

// ── Named from-addresses ──────────────────────────────────────────────────────

export const FROM = {
    /** Welcome emails, receipts, transactional messages */
    info: 'NDIS Shield Hub Support <info@ndisshield.com.au>',
    /** System alerts, admin notifications */
    noReply: 'NDIS Shield Hub Support <no-reply@ndisshield.com.au>',
} as const

// ── Constants ─────────────────────────────────────────────────────────────────

export const ADMIN_EMAIL = 'serteri@gmail.com'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ndisshield.com.au'
