import { Resend } from 'resend'
import { prisma } from '@/lib/db/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

interface LeadEmailData {
    leadId: string
    chatbotId: string
    name: string
    phone: string
    email?: string
    intent?: string
    propertyType?: string
    budget?: string
    timeline?: string
    hasPreApproval?: boolean
    score: number
    category: 'hot' | 'warm' | 'cold'
}

interface AppointmentEmailData {
    leadName: string
    leadPhone: string
    leadEmail?: string
    appointmentDate: string
    appointmentTime: string
    agentName: string
    chatbotName: string
    type?: string
}

/**
 * Send new lead notification email to agent/realtor
 */
export async function sendLeadNotificationToAgent(data: LeadEmailData): Promise<{ success: boolean; error?: string }> {
    try {
        // Get chatbot owner's email
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: data.chatbotId },
            select: {
                name: true,
                customSettings: true,
                user: {
                    select: {
                        email: true,
                        name: true,
                        emailNotifications: true
                    }
                }
            }
        })

        if (!chatbot?.user?.email) {
            console.log('No agent email found for chatbot:', data.chatbotId)
            return { success: false, error: 'No agent email configured' }
        }

        // Check if email notifications are enabled
        if (!chatbot.user.emailNotifications) {
            console.log('Email notifications disabled for user')
            return { success: false, error: 'Email notifications disabled' }
        }

        const settings = (chatbot.customSettings as any) || {}
        const notificationEmail = settings.notificationEmail || chatbot.user.email

        // Determine email urgency based on category
        const categoryEmoji = data.category === 'hot' ? '🔥' : data.category === 'warm' ? '🌤️' : '❄️'
        const categoryText = data.category === 'hot' ? 'SICAK LEAD' : data.category === 'warm' ? 'ILGIN LEAD' : 'Yeni Lead'
        const priorityText = data.category === 'hot' ? 'ACİL - Hemen iletişime geçin!' : data.category === 'warm' ? 'Bugün içinde arayın' : 'Takip listesine ekleyin'

        const intentText = {
            'buy': 'Satın Alma',
            'rent': 'Kiralama',
            'sell': 'Satış',
            'value': 'Değerleme',
            'tenant': 'Kiracı'
        }[data.intent || 'buy'] || data.intent

        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: ${data.category === 'hot' ? 'linear-gradient(135deg, #dc2626, #f97316)' : data.category === 'warm' ? 'linear-gradient(135deg, #f97316, #eab308)' : 'linear-gradient(135deg, #3b82f6, #06b6d4)'}; color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .header .score { font-size: 48px; font-weight: bold; margin: 10px 0; }
        .body { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .info-card { background: white; border-radius: 8px; padding: 20px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #6b7280; font-size: 14px; }
        .value { font-weight: 600; color: #111827; }
        .cta { display: inline-block; background: #d97706; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin-top: 15px; }
        .priority { background: ${data.category === 'hot' ? '#fef2f2' : data.category === 'warm' ? '#fff7ed' : '#eff6ff'}; border-left: 4px solid ${data.category === 'hot' ? '#dc2626' : data.category === 'warm' ? '#f97316' : '#3b82f6'}; padding: 15px; margin-bottom: 20px; border-radius: 0 8px 8px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${categoryEmoji} ${categoryText}</h1>
            <div class="score">${data.score}/100</div>
            <p style="margin: 0; opacity: 0.9;">PylonChat - ${chatbot.name}</p>
        </div>
        <div class="body">
            <div class="priority">
                <strong>⚡ Öncelik:</strong> ${priorityText}
            </div>

            <div class="info-card">
                <h3 style="margin-top: 0; color: #111827;">📋 Müşteri Bilgileri</h3>
                <div class="info-row">
                    <span class="label">Ad Soyad</span>
                    <span class="value">${data.name}</span>
                </div>
                <div class="info-row">
                    <span class="label">Telefon</span>
                    <span class="value"><a href="tel:${data.phone}" style="color: #d97706; text-decoration: none;">${data.phone}</a></span>
                </div>
                ${data.email ? `
                <div class="info-row">
                    <span class="label">Email</span>
                    <span class="value"><a href="mailto:${data.email}" style="color: #d97706; text-decoration: none;">${data.email}</a></span>
                </div>
                ` : ''}
            </div>

            <div class="info-card">
                <h3 style="margin-top: 0; color: #111827;">🏠 Talep Detayları</h3>
                ${data.intent ? `
                <div class="info-row">
                    <span class="label">İlgi Alanı</span>
                    <span class="value">${intentText}</span>
                </div>
                ` : ''}
                ${data.propertyType ? `
                <div class="info-row">
                    <span class="label">Mülk Tipi</span>
                    <span class="value">${data.propertyType}</span>
                </div>
                ` : ''}
                ${data.budget ? `
                <div class="info-row">
                    <span class="label">Bütçe</span>
                    <span class="value">${data.budget}</span>
                </div>
                ` : ''}
                ${data.timeline ? `
                <div class="info-row">
                    <span class="label">Zaman Çizelgesi</span>
                    <span class="value">${data.timeline}</span>
                </div>
                ` : ''}
                ${data.hasPreApproval !== undefined ? `
                <div class="info-row">
                    <span class="label">Kredi Ön Onayı</span>
                    <span class="value" style="color: ${data.hasPreApproval ? '#16a34a' : '#6b7280'};">${data.hasPreApproval ? '✅ Var' : '❌ Yok'}</span>
                </div>
                ` : ''}
            </div>

            <div style="text-align: center;">
                <a href="tel:${data.phone}" class="cta">📞 Hemen Ara</a>
            </div>
        </div>
        <div class="footer">
            <p>Bu email PylonChat tarafından otomatik gönderilmiştir.</p>
            <p>© ${new Date().getFullYear()} PylonChat</p>
        </div>
    </div>
</body>
</html>
`

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'PylonChat <noreply@pylonchat.com>',
            to: notificationEmail,
            subject: `${categoryEmoji} ${categoryText} - ${data.name} (Puan: ${data.score})`,
            html
        })

        console.log(`Lead notification email sent to ${notificationEmail}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error sending lead notification email:', error)
        return { success: false, error: error?.message }
    }
}

/**
 * Send appointment confirmation email to agent/realtor
 */
export async function sendAppointmentEmailToAgent(data: AppointmentEmailData, agentEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .appointment-card { background: white; border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .date-time { font-size: 28px; font-weight: bold; color: #059669; margin: 15px 0; }
        .info-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #6b7280; }
        .value { font-weight: 600; }
        .cta { display: inline-block; background: #d97706; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 10px 5px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📅 Yeni Randevu Oluşturuldu!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">${data.chatbotName}</p>
        </div>
        <div class="body">
            <div class="appointment-card">
                <div style="font-size: 48px;">🗓️</div>
                <div class="date-time">${data.appointmentDate}</div>
                <div style="font-size: 24px; color: #6b7280;">Saat: ${data.appointmentTime}</div>
                <div style="margin-top: 10px; color: #6b7280;">Tür: ${data.type || 'Mülk Görüntüleme'}</div>
            </div>

            <div class="info-card">
                <h3 style="margin-top: 0;">👤 Müşteri Bilgileri</h3>
                <div class="info-row">
                    <span class="label">Ad Soyad</span>
                    <span class="value">${data.leadName}</span>
                </div>
                <div class="info-row">
                    <span class="label">Telefon</span>
                    <span class="value"><a href="tel:${data.leadPhone}" style="color: #d97706;">${data.leadPhone}</a></span>
                </div>
                ${data.leadEmail ? `
                <div class="info-row">
                    <span class="label">Email</span>
                    <span class="value"><a href="mailto:${data.leadEmail}" style="color: #d97706;">${data.leadEmail}</a></span>
                </div>
                ` : ''}
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <a href="tel:${data.leadPhone}" class="cta">📞 Ara</a>
                ${data.leadEmail ? `<a href="mailto:${data.leadEmail}" class="cta" style="background: #3b82f6;">✉️ Email Gönder</a>` : ''}
            </div>
        </div>
        <div class="footer">
            <p>Bu randevu takviminize otomatik olarak eklenmiştir.</p>
            <p>© ${new Date().getFullYear()} PylonChat</p>
        </div>
    </div>
</body>
</html>
`

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'PylonChat <noreply@pylonchat.com>',
            to: agentEmail,
            subject: `📅 Yeni Randevu: ${data.leadName} - ${data.appointmentDate} ${data.appointmentTime}`,
            html
        })

        console.log(`Appointment notification email sent to agent: ${agentEmail}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error sending appointment email to agent:', error)
        return { success: false, error: error?.message }
    }
}

/**
 * Send appointment confirmation email to customer
 */
export async function sendAppointmentEmailToCustomer(data: AppointmentEmailData, customerEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #d97706, #f59e0b); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .success-badge { background: #dcfce7; color: #166534; padding: 15px; border-radius: 8px; text-align: center; margin-bottom: 20px; font-weight: 600; }
        .appointment-card { background: white; border-radius: 12px; padding: 30px; text-align: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .icon { font-size: 64px; margin-bottom: 15px; }
        .date { font-size: 28px; font-weight: bold; color: #d97706; margin: 10px 0; }
        .time { font-size: 20px; color: #6b7280; }
        .agent-info { margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
        .footer { text-align: center; margin-top: 25px; color: #6b7280; font-size: 13px; }
        .note { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ Randevunuz Onaylandı!</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">Teşekkür ederiz, ${data.leadName}!</p>
        </div>
        <div class="body">
            <div class="success-badge">
                🎉 Randevunuz başarıyla oluşturuldu!
            </div>

            <div class="appointment-card">
                <div class="icon">🏠</div>
                <div class="date">📅 ${data.appointmentDate}</div>
                <div class="time">🕐 Saat: ${data.appointmentTime}</div>

                <div class="agent-info">
                    <p style="margin: 0; color: #6b7280;">Danışmanınız</p>
                    <p style="margin: 5px 0 0; font-size: 18px; font-weight: 600; color: #111827;">👤 ${data.agentName}</p>
                </div>
            </div>

            <div class="note">
                <strong>📌 Hatırlatma:</strong><br>
                Randevudan 1 saat önce adres ve detay bilgileri SMS ile tarafınıza gönderilecektir. Lütfen telefonunuzu açık tutun.
            </div>

            <div class="footer">
                <p>Randevunuzu iptal etmek veya değiştirmek için lütfen bizimle iletişime geçin.</p>
                <p style="margin-top: 15px;">İyi günler dileriz! 🏡</p>
                <p style="margin-top: 20px; color: #9ca3af; font-size: 11px;">© ${new Date().getFullYear()} PylonChat</p>
            </div>
        </div>
    </div>
</body>
</html>
`

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'PylonChat <noreply@pylonchat.com>',
            to: customerEmail,
            subject: `✅ Randevunuz Onaylandı - ${data.appointmentDate} ${data.appointmentTime}`,
            html
        })

        console.log(`Appointment confirmation email sent to customer: ${customerEmail}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error sending appointment email to customer:', error)
        return { success: false, error: error?.message }
    }
}