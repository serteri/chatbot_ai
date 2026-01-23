'use client'

import { FloatingWhatsAppButton } from './WhatsAppChatWidget'

interface EnterpriseWhatsAppSupportProps {
    planType: string
    locale: string
}

export function EnterpriseWhatsAppSupport({ planType, locale }: EnterpriseWhatsAppSupportProps) {
    // Only show for Enterprise plan users
    if (planType !== 'enterprise') {
        return null
    }

    return <FloatingWhatsAppButton locale={locale} />
}
