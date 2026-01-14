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

/**
 * Send SMS notification via the SMS API
 * This is a utility function for internal use
 */
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

/**
 * Send hot lead alert to agent
 */
export async function notifyHotLead(leadId: string, chatbotId: string): Promise<void> {
    try {
        const [lead, chatbot] = await Promise.all([
            prisma.lead.findUnique({ where: { id: leadId } }),
            prisma.chatbot.findUnique({
                where: { id: chatbotId },
                select: {
                    name: true,
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

        if (!chatbotSettings.smsNotifications) {
            console.log('SMS notifications disabled for chatbot:', chatbot.name)
            return
        }

        const message = `🔥 SICAK MÜŞTERİ!

Ad: ${lead.name}
Tel: ${lead.phone}
${lead.email ? `Email: ${lead.email}` : ''}
${lead.intent ? `İlgi: ${lead.intent === 'buy' ? 'Satın alma' : lead.intent === 'rent' ? 'Kiralama' : lead.intent}` : ''}
${lead.budget ? `Bütçe: ${lead.budget}` : ''}
${lead.hasPreApproval ? '✅ Kredi Ön Onayı VAR' : ''}

Puan: ${lead.score}/100
Chatbot: ${chatbot.name}

Hemen iletişime geçin!`

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

/**
 * Send appointment reminder SMS
 */
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
                        customSettings: true
                    }
                }
            }
        })

        if (!lead || !lead.phone) {
            console.warn('Lead or phone not found for appointment reminder')
            return
        }

        const dateStr = appointmentDate.toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })

        const message = `📅 Randevu Hatırlatma

${lead.name} Bey/Hanım,

Yarınki randevunuz: ${dateStr} saat ${appointmentTime}
${propertyTitle ? `Mülk: ${propertyTitle}` : ''}

Görüşmek üzere!
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

/**
 * Send appointment confirmation SMS to customer
 */
export async function sendAppointmentConfirmation(
    leadPhone: string,
    leadName: string,
    appointmentDate: string,
    appointmentTime: string,
    agentName: string,
    chatbotId: string
): Promise<void> {
    const message = `✅ Randevu Onayı

${leadName} Bey/Hanım,

Randevunuz onaylandı:
📅 ${appointmentDate}
🕐 ${appointmentTime}
👤 Danışman: ${agentName}

Adres ve detaylar randevudan 1 saat önce SMS ile gönderilecektir.

Sorularınız için bizi arayabilirsiniz.`

    await sendSmsNotification({
        to: leadPhone,
        message,
        type: 'appointment-confirmation',
        chatbotId
    })
}
