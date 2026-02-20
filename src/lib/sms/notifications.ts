import { prisma } from '@/lib/db/prisma'

// SMS notification types
type SmsType = 'hot-lead' | 'warm-lead' | 'appointment-reminder' | 'appointment-confirmation'

interface SmsPayload {
    to: string
    message: string
    type: SmsType
    leadId?: string
    chatbotId?: string
}

// ─── SMS Translation Maps ────────────────────────────────────────────────

const smsTranslations: Record<string, Record<string, string>> = {
    tr: {
        hotLeadTitle: '🔥 SICAK MÜŞTERİ!',
        name: 'Ad',
        phone: 'Tel',
        email: 'Email',
        interest: 'İlgi',
        intentBuy: 'Satın alma',
        intentRent: 'Kiralama',
        budget: 'Bütçe',
        preApprovalYes: '✅ Kredi Ön Onayı VAR',
        score: 'Puan',
        chatbot: 'Chatbot',
        contactNow: 'Hemen iletişime geçin!',
        reminderTitle: '📅 Randevu Hatırlatma',
        dear: 'Bey/Hanım',
        tomorrowAppt: 'Yarınki randevunuz',
        at: 'saat',
        property: 'Mülk',
        seeYou: 'Görüşmek üzere!',
        confirmTitle: '✅ Randevu Onaylandı!',
        hi: 'Merhaba',
        appointmentConfirmed: 'Randevunuz onaylandı:',
        date: 'Tarih',
        time: 'Saat',
        agent: 'Danışman',
        addressInfo: 'Randevudan 1 saat önce adres ve detay bilgileri SMS ile gönderilecektir.',
        contactUs: 'Sorularınız için bize ulaşın.',
    },
    en: {
        hotLeadTitle: '🔥 HOT LEAD!',
        name: 'Name',
        phone: 'Phone',
        email: 'Email',
        interest: 'Interest',
        intentBuy: 'Purchase',
        intentRent: 'Rental',
        budget: 'Budget',
        preApprovalYes: '✅ Has Pre-Approval',
        score: 'Score',
        chatbot: 'Chatbot',
        contactNow: 'Contact immediately!',
        reminderTitle: '📅 Appointment Reminder',
        dear: '',
        tomorrowAppt: 'Your appointment tomorrow',
        at: 'at',
        property: 'Property',
        seeYou: 'See you there!',
        confirmTitle: '✅ Appointment Confirmed!',
        hi: 'Hi',
        appointmentConfirmed: 'Your appointment is confirmed:',
        date: 'Date',
        time: 'Time',
        agent: 'Agent',
        addressInfo: 'Address details will be sent 1 hour before your appointment.',
        contactUs: 'Contact us if you have any questions.',
    }
}

function t(locale: string, key: string): string {
    return smsTranslations[locale]?.[key] || smsTranslations['en'][key] || key
}

// ─── Core SMS Sender ─────────────────────────────────────────────────────

export async function sendSmsNotification(payload: SmsPayload): Promise<{ success: boolean; messageId?: string }> {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'

    try {
        const response = await fetch(`${baseUrl}/api/sms`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-key': process.env.INTERNAL_API_KEY || ''
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        return {
            success: data.success || false,
            messageId: data.messageId
        }
    } catch (error) {
        console.error('Error sending SMS notification:', error)
        return { success: false }
    }
}

// ─── Hot Lead Alert (to Agent) ───────────────────────────────────────────

export async function notifyHotLead(leadId: string, chatbotId: string): Promise<void> {
    try {
        const [lead, chatbot] = await Promise.all([
            prisma.lead.findUnique({ where: { id: leadId } }),
            prisma.chatbot.findUnique({
                where: { id: chatbotId },
                select: {
                    name: true,
                    language: true,
                    customSettings: true,
                    user: {
                        select: {
                            customSettings: true
                        }
                    }
                }
            })
        ])

        if (!lead || !chatbot) {
            console.warn('Lead or chatbot not found for hot lead notification')
            return
        }

        const chatbotSettings = (chatbot.customSettings as any) || {}
        const notificationPhone = chatbotSettings.notificationPhone

        if (!notificationPhone) {
            console.log('No notification phone configured for chatbot:', chatbot.name)
            return
        }

        if (chatbotSettings.smsNotifications === false) {
            console.log('SMS notifications disabled for chatbot:', chatbot.name)
            return
        }

        // Agent SMS uses chatbot language
        const lang = chatbot.language || 'tr'
        const intentText = lead.intent === 'buy' ? t(lang, 'intentBuy') : lead.intent === 'rent' ? t(lang, 'intentRent') : lead.intent || ''

        const message = `${t(lang, 'hotLeadTitle')}

${t(lang, 'name')}: ${lead.name}
${t(lang, 'phone')}: ${lead.phone}
${lead.email ? `${t(lang, 'email')}: ${lead.email}` : ''}
${lead.intent ? `${t(lang, 'interest')}: ${intentText}` : ''}
${lead.budget ? `${t(lang, 'budget')}: ${lead.budget}` : ''}
${lead.hasPreApproval ? t(lang, 'preApprovalYes') : ''}

${t(lang, 'score')}: ${lead.score}/100
${t(lang, 'chatbot')}: ${chatbot.name}

${t(lang, 'contactNow')}`

        await sendSmsNotification({
            to: notificationPhone,
            message,
            type: 'hot-lead',
            leadId,
            chatbotId
        })

        console.log(`Hot lead notification sent for lead: ${leadId}`)

    } catch (error) {
        console.error('Error notifying hot lead:', error)
    }
}

// ─── Appointment Reminder (to Customer, 1hr Before) ──────────────────────

export async function sendAppointmentReminder(
    leadId: string,
    appointmentDate: Date,
    appointmentTime: string,
    propertyTitle?: string
): Promise<void> {
    try {
        const lead = await prisma.lead.findUnique({
            where: { id: leadId },
            include: {
                chatbot: {
                    select: {
                        name: true,
                        language: true,
                        customSettings: true
                    }
                }
            }
        })

        if (!lead || !lead.phone) {
            console.warn('Lead or phone not found for appointment reminder')
            return
        }

        // Reminder SMS uses the lead's locale if stored, otherwise chatbot language
        const settings = (lead.chatbot.customSettings as any) || {}
        const lang = (lead.requirements as any)?.locale || lead.chatbot.language || 'en'

        const dateStr = appointmentDate.toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })

        const message = `${t(lang, 'reminderTitle')}

${lead.name}${lang === 'tr' ? ` ${t(lang, 'dear')}` : ''},

${t(lang, 'tomorrowAppt')}: ${dateStr} ${t(lang, 'at')} ${appointmentTime}
${propertyTitle ? `${t(lang, 'property')}: ${propertyTitle}` : ''}

${t(lang, 'seeYou')}
${lead.chatbot.name}`

        await sendSmsNotification({
            to: lead.phone,
            message,
            type: 'appointment-reminder',
            leadId,
            chatbotId: lead.chatbotId
        })

        console.log(`Appointment reminder sent for lead: ${leadId}`)

    } catch (error) {
        console.error('Error sending appointment reminder:', error)
    }
}

// ─── Appointment Confirmation (to Customer) ──────────────────────────────

export async function sendAppointmentConfirmation(
    leadPhone: string,
    leadName: string,
    appointmentDate: string,
    appointmentTime: string,
    agentName: string,
    chatbotId: string,
    locale?: string
): Promise<void> {
    // Customer SMS uses the form locale
    const lang = locale || 'en'

    const message = `${t(lang, 'confirmTitle')}

${t(lang, 'hi')} ${leadName},

${t(lang, 'appointmentConfirmed')}
${t(lang, 'date')}: ${appointmentDate}
${t(lang, 'time')}: ${appointmentTime}
${t(lang, 'agent')}: ${agentName}

${t(lang, 'addressInfo')}

${t(lang, 'contactUs')}`

    await sendSmsNotification({
        to: leadPhone,
        message,
        type: 'appointment-confirmation',
        chatbotId
    })
}
