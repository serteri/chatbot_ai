import { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import "../globals.css";

interface LocaleLayoutProps {
    children: ReactNode
    params: Promise<{ locale: string }>
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
            {children}
        </NextIntlClientProvider>
        </body>
        </html>
    )
}