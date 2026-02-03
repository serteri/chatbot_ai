import { ReactNode } from 'react'
import type { Metadata } from 'next'
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
    const localePrefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`
    const canonical = new URL(`${localePrefix}/`, siteUrl)
    const ogLocale = OG_LOCALE_MAP[locale] || locale
    const ogImage = SITE_OG_IMAGE.startsWith('http')
        ? SITE_OG_IMAGE
        : new URL(SITE_OG_IMAGE, siteUrl).toString()

    const languages: Record<string, string> = {}
    for (const supportedLocale of SUPPORTED_LOCALES) {
        const prefix = supportedLocale === DEFAULT_LOCALE ? '' : `/${supportedLocale}`
        languages[supportedLocale] = new URL(`${prefix}/`, siteUrl).toString()
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
