import createMiddleware from 'next-intl/middleware'

export default createMiddleware({
    locales: ['tr', 'en', 'de', 'fr', 'es'],
    defaultLocale: 'tr',
    localeDetection: false  // ← EKLE (otomatik dil algılama kapalı)
})

export const config = {
    matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}