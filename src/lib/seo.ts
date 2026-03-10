const DEFAULT_SITE_URL = 'https://www.ndisshield.com.au'
const DEFAULT_SITE_NAME = 'NDIS Shield'
const DEFAULT_SITE_DESCRIPTION = 'AI-powered NDIS Service Agreement Validator and Audit Compliance toolkit.'

export const SITE_URL =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    DEFAULT_SITE_URL
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || DEFAULT_SITE_NAME
export const SITE_DESCRIPTION =
    process.env.NEXT_PUBLIC_SITE_DESCRIPTION || DEFAULT_SITE_DESCRIPTION
export const SITE_TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || ''
export const SITE_OG_IMAGE = process.env.NEXT_PUBLIC_OG_IMAGE || '/og.png'

export const SUPPORTED_LOCALES = ['en', 'tr', 'de', 'fr', 'es'] as const
export const DEFAULT_LOCALE = 'en'

export function getSiteUrl(): URL {
    try {
        const url = new URL(SITE_URL)
        // Production ortamında her zaman HTTPS kullanmaya zorla
        if (process.env.NODE_ENV === 'production' && url.protocol !== 'https:') {
            url.protocol = 'https:'
        }
        return url
    } catch {
        return new URL(DEFAULT_SITE_URL)
    }
}
