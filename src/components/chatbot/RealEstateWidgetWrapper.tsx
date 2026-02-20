'use client'

import { NextIntlClientProvider } from 'next-intl'
import { RealEstateWidget } from '@/components/widget/RealEstateWidget'

interface RealEstateWidgetWrapperProps {
    locale: string
    messages: Record<string, any>
    chatbotIdentifier: string
    calendlyUrl?: string | null
    primaryColor?: string
    agentName?: string
    position?: 'bottom-right' | 'bottom-left'
}

/**
 * Wrapper component for RealEstateWidget that provides next-intl context.
 * Used in the /chatbot/[id] page which is outside the [locale] route.
 */
export default function RealEstateWidgetWrapper({
    locale,
    messages,
    chatbotIdentifier,
    calendlyUrl,
    primaryColor = '#D97706',
    agentName,
    position = 'bottom-right'
}: RealEstateWidgetWrapperProps) {
    return (
        <NextIntlClientProvider messages={messages} locale={locale}>
            <div className="h-full w-full flex flex-col">
                <RealEstateWidget
                    locale={locale}
                    chatbotIdentifier={chatbotIdentifier}
                    calendlyUrl={calendlyUrl || undefined}
                    primaryColor={primaryColor}
                    agentName={agentName || undefined}
                    position={position === 'bottom-left' ? 'bottom-left' : 'bottom-right'}
                    embedded={true}
                />
            </div>
        </NextIntlClientProvider>
    )
}
