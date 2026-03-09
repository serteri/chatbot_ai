/**
 * Central Resend email client for PylonChat.
 *
 * FROM addresses (all verified on resend.dev domain):
 *   info@pylonchat.com      — user-facing welcome / transactional
 *   no-reply@pylonchat.com  — system alerts and admin notifications
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
    info: 'PylonChat <info@pylonchat.com>',
    /** System alerts, admin notifications */
    noReply: 'PylonChat <no-reply@pylonchat.com>',
} as const

// ── Constants ─────────────────────────────────────────────────────────────────

export const ADMIN_EMAIL = 'serteri@gmail.com'
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.pylonchat.com'
