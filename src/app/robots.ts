import type { MetadataRoute } from 'next'
import { DEFAULT_LOCALE, getSiteUrl, SUPPORTED_LOCALES } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
    const siteUrl = getSiteUrl()
    const localePrefixes = new Set<string>()

    for (const locale of SUPPORTED_LOCALES) {
        localePrefixes.add(locale === DEFAULT_LOCALE ? '' : `/${locale}`)
        localePrefixes.add(`/${locale}`)
    }

    const disallowPrefixes = Array.from(localePrefixes).flatMap((prefix) => [
        `${prefix}/admin/`,
        `${prefix}/dashboard/`,
        `${prefix}/auth/`
    ])

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', ...disallowPrefixes]
            }
        ],
        sitemap: new URL('/sitemap.xml', siteUrl).toString(),
        host: siteUrl.toString().replace(/\/$/, '')
    }
}
