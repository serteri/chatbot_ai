'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    MessageCircle,
    Phone,
    Clock,
    CheckCircle,
    Crown,
    Send,
    X,
    ExternalLink
} from 'lucide-react'

interface WhatsAppChatWidgetProps {
    locale: string
    userName: string
    userEmail: string
    companyName?: string
    phoneNumber?: string
}

const translations: Record<string, Record<string, string>> = {
    en: {
        title: '24/7 WhatsApp Support',
        subtitle: 'Connect instantly with our Enterprise support team',
        available: 'Available 24/7',
        responseTime: 'Response within 1 hour',
        startChat: 'Start WhatsApp Chat',
        prefilledMessage: 'Hello! I am an Enterprise customer and need support.',
        yourMessage: 'Your message (optional)',
        messagePlaceholder: 'Describe your issue or question...',
        nameLabel: 'Your Name',
        emailLabel: 'Your Email',
        openWhatsApp: 'Open WhatsApp',
        benefits: [
            'Priority Enterprise Support',
            'Dedicated Support Agent',
            'Response within 1 hour',
            'Available 24/7'
        ],
        directCall: 'Or call directly:',
        whatsAppWeb: 'Opens in WhatsApp Web or App'
    },
    tr: {
        title: '7/24 WhatsApp Destek',
        subtitle: 'Enterprise destek ekibimize aninda baglanti',
        available: '7/24 Musait',
        responseTime: '1 saat icinde yanit',
        startChat: 'WhatsApp Sohbeti Baslat',
        prefilledMessage: 'Merhaba! Enterprise musteriyim ve destege ihtiyacim var.',
        yourMessage: 'Mesajiniz (opsiyonel)',
        messagePlaceholder: 'Sorununuzu veya sorunuzu aciklayin...',
        nameLabel: 'Adiniz',
        emailLabel: 'E-posta',
        openWhatsApp: "WhatsApp'i Ac",
        benefits: [
            'Oncelikli Enterprise Destek',
            'Ozel Destek Temsilcisi',
            '1 saat icinde yanit',
            '7/24 Musait'
        ],
        directCall: 'Veya dogrudan arayin:',
        whatsAppWeb: "WhatsApp Web veya Uygulamada acilir"
    },
    de: {
        title: '24/7 WhatsApp Support',
        subtitle: 'Verbinden Sie sich sofort mit unserem Enterprise-Support-Team',
        available: '24/7 Verfugbar',
        responseTime: 'Antwort innerhalb 1 Stunde',
        startChat: 'WhatsApp-Chat starten',
        prefilledMessage: 'Hallo! Ich bin Enterprise-Kunde und benotige Unterstutzung.',
        yourMessage: 'Ihre Nachricht (optional)',
        messagePlaceholder: 'Beschreiben Sie Ihr Problem oder Ihre Frage...',
        nameLabel: 'Ihr Name',
        emailLabel: 'Ihre E-Mail',
        openWhatsApp: 'WhatsApp offnen',
        benefits: [
            'Prioritats-Enterprise-Support',
            'Dedizierter Support-Agent',
            'Antwort innerhalb 1 Stunde',
            '24/7 Verfugbar'
        ],
        directCall: 'Oder direkt anrufen:',
        whatsAppWeb: 'Offnet sich in WhatsApp Web oder App'
    },
    es: {
        title: 'Soporte WhatsApp 24/7',
        subtitle: 'Conecta al instante con nuestro equipo de soporte Enterprise',
        available: 'Disponible 24/7',
        responseTime: 'Respuesta en 1 hora',
        startChat: 'Iniciar Chat de WhatsApp',
        prefilledMessage: 'Hola! Soy cliente Enterprise y necesito soporte.',
        yourMessage: 'Tu mensaje (opcional)',
        messagePlaceholder: 'Describe tu problema o pregunta...',
        nameLabel: 'Tu Nombre',
        emailLabel: 'Tu Email',
        openWhatsApp: 'Abrir WhatsApp',
        benefits: [
            'Soporte Enterprise Prioritario',
            'Agente de Soporte Dedicado',
            'Respuesta en 1 hora',
            'Disponible 24/7'
        ],
        directCall: 'O llama directamente:',
        whatsAppWeb: 'Se abre en WhatsApp Web o App'
    },
    fr: {
        title: 'Support WhatsApp 24/7',
        subtitle: 'Connectez-vous instantanement avec notre equipe de support Enterprise',
        available: 'Disponible 24/7',
        responseTime: 'Reponse dans 1 heure',
        startChat: 'Demarrer le Chat WhatsApp',
        prefilledMessage: 'Bonjour! Je suis un client Enterprise et jai besoin dassistance.',
        yourMessage: 'Votre message (optionnel)',
        messagePlaceholder: 'Decrivez votre probleme ou question...',
        nameLabel: 'Votre Nom',
        emailLabel: 'Votre Email',
        openWhatsApp: 'Ouvrir WhatsApp',
        benefits: [
            'Support Enterprise Prioritaire',
            'Agent de Support Dedie',
            'Reponse dans 1 heure',
            'Disponible 24/7'
        ],
        directCall: 'Ou appelez directement:',
        whatsAppWeb: "Souvre dans WhatsApp Web ou l'App"
    }
}

// PylonChat Support WhatsApp Number (can be configured)
const WHATSAPP_NUMBER = '61432672696' // Australia format without +

export function WhatsAppChatWidget({
    locale,
    userName,
    userEmail,
    companyName = 'PylonChat',
    phoneNumber = WHATSAPP_NUMBER
}: WhatsAppChatWidgetProps) {
    const t = translations[locale] || translations.en
    const [customMessage, setCustomMessage] = useState('')
    const [isExpanded, setIsExpanded] = useState(true)

    const generateWhatsAppLink = () => {
        // Create a pre-filled message with user info
        let message = t.prefilledMessage
        message += `\n\n---\nName: ${userName}\nEmail: ${userEmail}`

        if (customMessage.trim()) {
            message += `\n\nMessage:\n${customMessage.trim()}`
        }

        // Encode the message for URL
        const encodedMessage = encodeURIComponent(message)

        // WhatsApp Click-to-Chat URL
        return `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    }

    const handleStartChat = () => {
        const whatsappUrl = generateWhatsAppLink()
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-green-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                            <MessageCircle className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{t.title}</h3>
                            <p className="text-green-100 text-sm">{t.subtitle}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-full">
                        <span className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></span>
                        <span className="text-sm font-medium">{t.available}</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-5">
                {/* Benefits */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                    {(t.benefits as string[]).map((benefit: string, index: number) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                            <span>{benefit}</span>
                        </div>
                    ))}
                </div>

                {/* User Info (Pre-filled) */}
                <div className="space-y-3 mb-5">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">{t.nameLabel}</label>
                        <Input
                            value={userName}
                            disabled
                            className="bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">{t.emailLabel}</label>
                        <Input
                            value={userEmail}
                            disabled
                            className="bg-gray-50"
                        />
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 block">{t.yourMessage}</label>
                        <Textarea
                            value={customMessage}
                            onChange={(e) => setCustomMessage(e.target.value)}
                            placeholder={t.messagePlaceholder}
                            rows={3}
                            className="resize-none"
                        />
                    </div>
                </div>

                {/* CTA Button */}
                <Button
                    onClick={handleStartChat}
                    className="w-full bg-green-500 hover:bg-green-600 text-white h-12 text-base font-semibold"
                >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    {t.openWhatsApp}
                    <ExternalLink className="h-4 w-4 ml-2" />
                </Button>
                <p className="text-xs text-gray-500 text-center mt-2">{t.whatsAppWeb}</p>

                {/* Direct Call Option */}
                <div className="mt-5 pt-5 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{t.directCall}</span>
                        <a
                            href={`tel:+${phoneNumber}`}
                            className="flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
                        >
                            <Phone className="h-4 w-4" />
                            +{phoneNumber.slice(0, 2)} {phoneNumber.slice(2, 5)} {phoneNumber.slice(5, 8)} {phoneNumber.slice(8)}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Floating WhatsApp Button Component for Enterprise users
export function FloatingWhatsAppButton({
    locale,
    phoneNumber = WHATSAPP_NUMBER
}: {
    locale: string
    phoneNumber?: string
}) {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false)

    const tooltips: Record<string, string> = {
        en: '24/7 Enterprise Support',
        tr: '7/24 Enterprise Destek',
        de: '24/7 Enterprise Support',
        es: 'Soporte Enterprise 24/7',
        fr: 'Support Enterprise 24/7'
    }

    const tooltip = tooltips[locale] || tooltips.en

    const handleClick = () => {
        const message = encodeURIComponent('Hello! I am an Enterprise customer and need support.')
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank', 'noopener,noreferrer')
    }

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {/* Tooltip */}
            {isTooltipVisible && (
                <div className="absolute bottom-full right-0 mb-2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg whitespace-nowrap shadow-lg">
                    {tooltip}
                    <div className="absolute bottom-0 right-4 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                </div>
            )}

            {/* WhatsApp Button */}
            <button
                onClick={handleClick}
                onMouseEnter={() => setIsTooltipVisible(true)}
                onMouseLeave={() => setIsTooltipVisible(false)}
                className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
                aria-label="WhatsApp Support"
            >
                <MessageCircle className="h-7 w-7 text-white" />

                {/* Enterprise Badge */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow">
                    <Crown className="h-3 w-3 text-white" />
                </div>

                {/* Pulse Animation */}
                <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-25"></span>
            </button>
        </div>
    )
}