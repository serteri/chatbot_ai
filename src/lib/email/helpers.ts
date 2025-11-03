import { resend, EMAIL_FROM } from './resend'
import { NewMessageEmail, DailyReportEmail, WelcomeEmail } from './templates'

/**
 * Yeni mesaj bildirimi gönder
 */
export async function sendNewMessageNotification({
                                                     to,
                                                     chatbotName,
                                                     visitorId,
                                                     message,
                                                     conversationId,
                                                 }: {
    to: string
    chatbotName: string
    visitorId: string
    message: string
    conversationId: string
}) {
    try {
        const conversationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/conversations/${conversationId}`

        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `💬 Yeni mesaj: ${chatbotName}`,
            html: NewMessageEmail({
                chatbotName,
                visitorId,
                message: message.substring(0, 200), // İlk 200 karakter
                conversationUrl
            })
        })

        if (error) {
            console.error('Email send error:', error)
            return { success: false, error }
        }

        console.log('Email sent:', data)
        return { success: true, data }
    } catch (error) {
        console.error('Email send error:', error)
        return { success: false, error }
    }
}

/**
 * Günlük rapor gönder
 */
export async function sendDailyReport({
                                          to,
                                          userName,
                                          totalConversations,
                                          totalMessages,
                                          topChatbot,
                                      }: {
    to: string
    userName: string
    totalConversations: number
    totalMessages: number
    topChatbot: { name: string; conversations: number } | null
}) {
    try {
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: `📊 Günlük Rapor - ${new Date().toLocaleDateString('tr-TR')}`,
            html: DailyReportEmail({
                userName,
                totalConversations,
                totalMessages,
                topChatbot,
                dashboardUrl
            })
        })

        if (error) {
            console.error('Daily report email error:', error)
            return { success: false, error }
        }

        console.log('Daily report sent:', data)
        return { success: true, data }
    } catch (error) {
        console.error('Daily report email error:', error)
        return { success: false, error }
    }
}

/**
 * Hoş geldin email'i gönder
 */
export async function sendWelcomeEmail({
                                           to,
                                           userName,
                                       }: {
    to: string
    userName: string
}) {
    try {
        const dashboardUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`

        const { data, error } = await resend.emails.send({
            from: EMAIL_FROM,
            to,
            subject: '🎉 ChatbotAI\'ya Hoş Geldiniz!',
            html: WelcomeEmail({
                userName,
                dashboardUrl
            })
        })

        if (error) {
            console.error('Welcome email error:', error)
            return { success: false, error }
        }

        console.log('Welcome email sent:', data)
        return { success: true, data }
    } catch (error) {
        console.error('Welcome email error:', error)
        return { success: false, error }
    }
}