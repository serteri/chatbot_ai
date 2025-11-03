import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { ToastProvider } from '@/components/providers/ToastProvider'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'ChatbotAI - AI Destekli Müşteri Destek Chatbot',
    description: 'Kendi dokümanlarınızdan öğrenen akıllı chatbot oluşturun',
}

export function generateStaticParams() {
    return [
        { locale: 'tr' },
        { locale: 'en' },
        { locale: 'de' },
        { locale: 'fr' },
        { locale: 'es' }
    ]
}

export default async function LocaleLayout({
                                               children,
                                               params
                                           }: {
    children: React.ReactNode
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const messages = await getMessages({ locale })

    return (
        <html lang={locale}>
        <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
            {children}
            <ToastProvider />
        </NextIntlClientProvider>
        </body>
        </html>
    )
}