import createIntlMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'

// Supported locales — keep in sync with src/locales/*.json
const locales = ['en', 'tr', 'de', 'fr', 'es'] as const
const defaultLocale = 'en'

const intlMiddleware = createIntlMiddleware({
    locales,
    defaultLocale,
    localePrefix: 'always',
})

export default function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl

    // ── API routes pass through completely untouched ───────────────────────
    // This is critical for the Xero OAuth callback: any rewrite or redirect
    // here would change the domain/path and cause the state cookie to be
    // dropped, producing the "Security check failed" error.
    if (pathname.startsWith('/api/')) {
        return NextResponse.next()
    }

    // ── All other routes go through next-intl for locale handling ─────────
    return intlMiddleware(req)
}

export const config = {
    // Match everything except Next.js internals and static files.
    // Note: /api/ is matched here so the guard above runs, then returns next().
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
