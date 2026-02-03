import type { MetadataRoute } from 'next'
import { DEFAULT_LOCALE, getSiteUrl, SUPPORTED_LOCALES } from '@/lib/seo'

const PUBLIC_PATHS = [
    '',
    '/about',
    '/pricing',
    '/blog',
    '/contact',
    '/faq',
    '/docs',
    '/docs/api',
    '/help',
    '/careers',
    '/status',
    '/terms',
    '/privacy',
    '/cookies',
    '/gdpr',
    '/demo',
    '/demo/education',
    '/demo/ecommerce',
    '/demo/realestate',
    '/demo/general'
]

function buildPath(prefix: string, path: string): string {
    if (!path) {
        return prefix || '/'
    }

    return `${prefix}${path}`
}

export default function sitemap(): MetadataRoute.Sitemap {
    const siteUrl = getSiteUrl()
    const now = new Date()
    const entries: MetadataRoute.Sitemap = []

    for (const locale of SUPPORTED_LOCALES) {
        const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`

        for (const path of PUBLIC_PATHS) {
            const fullPath = buildPath(prefix, path)
            const isHome = path === ''

            entries.push({
                url: new URL(fullPath, siteUrl).toString(),
                lastModified: now,
                changeFrequency: isHome ? 'daily' : 'weekly',
                priority: isHome ? 1 : 0.7
            })
        }
    }

    return entries
}
