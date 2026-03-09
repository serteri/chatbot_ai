import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import QueryProvider from '@/components/providers/QueryProvider'
import { ToastProvider } from '@/components/providers/ToastProvider'
import {
    DEFAULT_LOCALE,
    getSiteUrl,
    SITE_DESCRIPTION,
    SITE_NAME,
    SITE_OG_IMAGE,
    SITE_TWITTER_HANDLE,
    SUPPORTED_LOCALES
} from '@/lib/seo'
import "../globals.css";

interface LocaleLayoutProps {
    children: ReactNode
    params: Promise<{ locale: string }>
}

const OG_LOCALE_MAP: Record<string, string> = {
    en: 'en_US',
    tr: 'tr_TR',
    de: 'de_DE',
    fr: 'fr_FR',
    es: 'es_ES'
}

export async function generateMetadata({
    params
}: LocaleLayoutProps): Promise<Metadata> {
    const { locale } = await params
    const siteUrl = getSiteUrl()
    const ogLocale = OG_LOCALE_MAP[locale] || locale
    const ogImage = SITE_OG_IMAGE.startsWith('http')
        ? SITE_OG_IMAGE
        : new URL(SITE_OG_IMAGE, siteUrl).toString()

    // Read the actual request path injected by middleware so the canonical
    // reflects this specific page, not just the locale root.
    const headersList = await headers()
    const pathname = headersList.get('x-pathname') || '/'
    const canonical = new URL(pathname, siteUrl)

    // hreflang alternates: swap the locale prefix to point each language
    // version at the equivalent path on its own locale.
    const languages: Record<string, string> = {}
    for (const supportedLocale of SUPPORTED_LOCALES) {
        const defaultPrefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
        const targetPrefix = supportedLocale === DEFAULT_LOCALE ? '' : `/${supportedLocale}`
        // Replace the current locale prefix with the target locale prefix.
        const equivalentPath = defaultPrefix
            ? pathname.replace(new RegExp(`^/${locale}`), targetPrefix) || targetPrefix || '/'
            : `${targetPrefix}${pathname}`
        languages[supportedLocale] = new URL(equivalentPath || '/', siteUrl).toString()
    }

    return {
        metadataBase: siteUrl,
        title: {
            default: SITE_NAME,
            template: `%s | ${SITE_NAME}`
        },
        description: SITE_DESCRIPTION,
        alternates: {
            canonical: canonical.toString(),
            languages
        },
        openGraph: {
            type: 'website',
            url: canonical.toString(),
            title: SITE_NAME,
            description: SITE_DESCRIPTION,
            siteName: SITE_NAME,
            locale: ogLocale,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: SITE_NAME
                }
            ]
        },
        twitter: {
            card: 'summary_large_image',
            title: SITE_NAME,
            description: SITE_DESCRIPTION,
            images: [ogImage],
            creator: SITE_TWITTER_HANDLE || undefined
        }
    }
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
    const { locale } = await params

    // DÜZELTME BURADA: Parantez içine { locale } yazdık.
    // Bu sayede sistem "Hangi dildeyim?" diye şaşırmaz, URL'deki dili (en/tr) zorla yükler.
    const messages = await getMessages({ locale })

    return (
        <html lang={locale}>
            <body className="min-h-screen bg-background font-sans antialiased">
                {/* locale prop'unu buraya da ekledik */}
                <NextIntlClientProvider messages={messages} locale={locale}>
                    <QueryProvider>
                        <ToastProvider />
                        {children}
                    </QueryProvider>
                </NextIntlClientProvider>
            </body>
        </html>
    )
}
