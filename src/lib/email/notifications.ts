import { Resend } from 'resend'
import { prisma } from '@/lib/db/prisma'

const resend = new Resend(process.env.RESEND_API_KEY)

// ─── Translation Maps ────────────────────────────────────────────────────

const emailTranslations: Record<string, Record<string, string>> = {
    tr: {
        // Lead notification (to agent)
        hotLead: 'SICAK LEAD',
        warmLead: 'ILGIN LEAD',
        coldLead: 'Yeni Lead',
        priorityHot: 'ACİL - Hemen iletişime geçin!',
        priorityWarm: 'Bugün içinde arayın',
        priorityCold: 'Takip listesine ekleyin',
        priority: 'Öncelik',
        customerInfo: 'Müşteri Bilgileri',
        fullName: 'Ad Soyad',
        phone: 'Telefon',
        email: 'Email',
        locationPref: 'Lokasyon Tercihi',
        requestDetails: 'Talep Detayları',
        interest: 'İlgi Alanı',
        propertyType: 'Mülk Tipi',
        budgetRange: 'Bütçe Aralığı',
        bedrooms: 'Oda Sayısı',
        bathrooms: 'Banyo Sayısı',
        timeline: 'Zaman Çizelgesi',
        preApproval: 'Kredi Ön Onayı',
        preApprovalYes: '✅ Var',
        preApprovalNo: '❌ Yok',
        financialAnalysis: 'Finansal Analiz',
        monthlyIncome: 'Aylık Gelir',
        monthlyExpenses: 'Aylık Gider',
        downPayment: 'Peşinat',
        calculatedMaxBudget: 'Hesaplanan Max Bütçe',
        callNow: 'Hemen Ara',
        autoEmail: 'Bu email PylonChat tarafından otomatik gönderilmiştir.',
        intentBuy: 'Satın Alma',
        intentRent: 'Kiralama',
        intentSell: 'Satış',
        intentValue: 'Değerleme',
        intentTenant: 'Kiracı',
        // Appointment (to agent)
        newAppointment: 'Yeni Randevu Oluşturuldu!',
        time: 'Saat',
        type: 'Tür',
        propertyViewing: 'Mülk Görüntüleme',
        call: 'Ara',
        sendEmail: 'Email Gönder',
        calendarAutoAdded: 'Bu randevu takviminize otomatik olarak eklenmiştir.',
        // Appointment confirmation (to customer)
        appointmentConfirmed: 'Randevunuz Onaylandı!',
        thankYou: 'Teşekkür ederiz',
        appointmentCreated: 'Randevunuz başarıyla oluşturuldu!',
        yourConsultant: 'Danışmanınız',
        reminder: 'Hatırlatma',
        reminderText: 'Randevudan 1 saat önce adres ve detay bilgileri SMS ile tarafınıza gönderilecektir. Lütfen telefonunuzu açık tutun.',
        cancelOrChange: 'Randevunuzu iptal etmek veya değiştirmek için aşağıdaki linke tıklayın.',
        cancelAppointment: 'Randevuyu İptal Et',
        haveAGoodDay: 'İyi günler dileriz! 🏡',
        subjectAppointmentConfirmed: 'Randevunuz Onaylandı',
        subjectNewAppointment: 'Yeni Randevu',
        // Cancellation
        appointmentCancelled: 'Randevu İptal Edildi',
        appointmentCancelledDesc: 'Aşağıdaki randevu iptal edilmiştir.',
        cancelledBy: 'Müşteri tarafından iptal edildi',
        cancelledAppointmentDetails: 'İptal Edilen Randevu',
    },
    en: {
        hotLead: 'HOT LEAD',
        warmLead: 'WARM LEAD',
        coldLead: 'New Lead',
        priorityHot: 'URGENT - Contact immediately!',
        priorityWarm: 'Call today',
        priorityCold: 'Add to follow-up list',
        priority: 'Priority',
        customerInfo: 'Customer Information',
        fullName: 'Full Name',
        phone: 'Phone',
        email: 'Email',
        locationPref: 'Location Preference',
        requestDetails: 'Request Details',
        interest: 'Interest',
        propertyType: 'Property Type',
        budgetRange: 'Budget Range',
        bedrooms: 'Bedrooms',
        bathrooms: 'Bathrooms',
        timeline: 'Timeline',
        preApproval: 'Mortgage Pre-Approval',
        preApprovalYes: '✅ Yes',
        preApprovalNo: '❌ No',
        financialAnalysis: 'Financial Analysis',
        monthlyIncome: 'Monthly Income',
        monthlyExpenses: 'Monthly Expenses',
        downPayment: 'Down Payment',
        calculatedMaxBudget: 'Calculated Max Budget',
        callNow: 'Call Now',
        autoEmail: 'This email was automatically sent by PylonChat.',
        intentBuy: 'Purchase',
        intentRent: 'Rental',
        intentSell: 'Sale',
        intentValue: 'Valuation',
        intentTenant: 'Tenant',
        newAppointment: 'New Appointment Created!',
        time: 'Time',
        type: 'Type',
        propertyViewing: 'Property Viewing',
        call: 'Call',
        sendEmail: 'Send Email',
        calendarAutoAdded: 'This appointment has been automatically added to your calendar.',
        appointmentConfirmed: 'Your Appointment is Confirmed!',
        thankYou: 'Thank you',
        appointmentCreated: 'Your appointment has been successfully created!',
        yourConsultant: 'Your Consultant',
        reminder: 'Reminder',
        reminderText: 'Address and detail information will be sent to you via SMS 1 hour before the appointment. Please keep your phone available.',
        cancelOrChange: 'Click the link below to cancel or change your appointment.',
        cancelAppointment: 'Cancel Appointment',
        haveAGoodDay: 'Have a great day! 🏡',
        subjectAppointmentConfirmed: 'Your Appointment is Confirmed',
        subjectNewAppointment: 'New Appointment',
        appointmentCancelled: 'Appointment Cancelled',
        appointmentCancelledDesc: 'The following appointment has been cancelled.',
        cancelledBy: 'Cancelled by customer',
        cancelledAppointmentDetails: 'Cancelled Appointment',
    }
}

function t(locale: string, key: string): string {
    return emailTranslations[locale]?.[key] || emailTranslations['en'][key] || key
}

// ─── Interfaces ──────────────────────────────────────────────────────────

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
    location?: string
    locale?: string
    requirements?: {
        bedrooms?: string
        bathrooms?: string
        monthlyIncome?: number
        monthlyExpenses?: number
        downPayment?: number
        calculatedMaxBudget?: number
        housingType?: string
    }
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
    locale?: string
    cancellationToken?: string
}

// ─── Lead Notification (to Agent) ────────────────────────────────────────

export async function sendLeadNotificationToAgent(data: LeadEmailData): Promise<{ success: boolean; error?: string }> {
    try {
        console.log('📧 sendLeadNotificationToAgent called with:', { chatbotId: data.chatbotId, name: data.name, category: data.category })

        const chatbot = await prisma.chatbot.findUnique({
            where: { id: data.chatbotId },
            select: {
                name: true,
                customSettings: true,
                language: true,
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
            return { success: false, error: 'No agent email configured' }
        }

        if (chatbot.user.emailNotifications === false) {
            return { success: false, error: 'Email notifications disabled' }
        }

        const settings = (chatbot.customSettings as any) || {}
        const notificationEmail = settings.notificationEmail || chatbot.user.email

        // Agent email uses chatbot language, NOT customer locale
        const lang = chatbot.language || 'tr'

        const categoryEmoji = data.category === 'hot' ? '🔥' : data.category === 'warm' ? '🌤️' : '❄️'
        const categoryText = t(lang, data.category === 'hot' ? 'hotLead' : data.category === 'warm' ? 'warmLead' : 'coldLead')
        const priorityText = t(lang, data.category === 'hot' ? 'priorityHot' : data.category === 'warm' ? 'priorityWarm' : 'priorityCold')

        const intentKey = `intent${(data.intent || 'buy').charAt(0).toUpperCase() + (data.intent || 'buy').slice(1)}` as string
        const intentText = t(lang, intentKey) || data.intent

        const formatMoney = (amount?: number) => {
            if (!amount) return '-'
            return new Intl.NumberFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { style: 'currency', currency: lang === 'tr' ? 'TRY' : 'USD', maximumFractionDigits: 0 }).format(amount)
        }

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
                <strong>⚡ ${t(lang, 'priority')}:</strong> ${priorityText}
            </div>

            <div class="info-card">
                <h3 style="margin-top: 0; color: #111827;">📋 ${t(lang, 'customerInfo')}</h3>
                <div class="info-row">
                    <span class="label">${t(lang, 'fullName')}</span>
                    <span class="value">${data.name}</span>
                </div>
                <div class="info-row">
                    <span class="label">${t(lang, 'phone')}</span>
                    <span class="value"><a href="tel:${data.phone}" style="color: #d97706; text-decoration: none;">${data.phone}</a></span>
                </div>
                ${data.email ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'email')}</span>
                    <span class="value"><a href="mailto:${data.email}" style="color: #d97706; text-decoration: none;">${data.email}</a></span>
                </div>
                ` : ''}
                ${data.location ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'locationPref')}</span>
                    <span class="value">${data.location}</span>
                </div>
                ` : ''}
            </div>

            <div class="info-card">
                <h3 style="margin-top: 0; color: #111827;">🏠 ${t(lang, 'requestDetails')}</h3>
                ${data.intent ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'interest')}</span>
                    <span class="value">${intentText}</span>
                </div>
                ` : ''}
                ${data.propertyType ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'propertyType')}</span>
                    <span class="value">${data.propertyType}</span>
                </div>
                ` : ''}
                ${data.budget ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'budgetRange')}</span>
                    <span class="value">${data.budget}</span>
                </div>
                ` : ''}
                ${data.requirements?.bedrooms ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'bedrooms')}</span>
                    <span class="value">${data.requirements.bedrooms}</span>
                </div>
                ` : ''}
                ${data.requirements?.bathrooms ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'bathrooms')}</span>
                    <span class="value">${data.requirements.bathrooms}</span>
                </div>
                ` : ''}
                ${data.timeline ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'timeline')}</span>
                    <span class="value">${data.timeline}</span>
                </div>
                ` : ''}
                ${data.hasPreApproval !== undefined ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'preApproval')}</span>
                    <span class="value" style="color: ${data.hasPreApproval ? '#16a34a' : '#6b7280'};">${data.hasPreApproval ? t(lang, 'preApprovalYes') : t(lang, 'preApprovalNo')}</span>
                </div>
                ` : ''}
            </div>

            ${data.requirements && (data.requirements.monthlyIncome || data.requirements.calculatedMaxBudget) ? `
            <div class="info-card">
                <h3 style="margin-top: 0; color: #111827;">💰 ${t(lang, 'financialAnalysis')}</h3>
                ${data.requirements.monthlyIncome ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'monthlyIncome')}</span>
                    <span class="value">${formatMoney(data.requirements.monthlyIncome)}</span>
                </div>
                ` : ''}
                ${data.requirements.monthlyExpenses ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'monthlyExpenses')}</span>
                    <span class="value">${formatMoney(data.requirements.monthlyExpenses)}</span>
                </div>
                ` : ''}
                ${data.requirements.downPayment ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'downPayment')}</span>
                    <span class="value">${formatMoney(data.requirements.downPayment)}</span>
                </div>
                ` : ''}
                ${data.requirements.calculatedMaxBudget ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'calculatedMaxBudget')}</span>
                    <span class="value" style="color: #059669;">${formatMoney(data.requirements.calculatedMaxBudget)}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}

            <div style="text-align: center;">
                <a href="tel:${data.phone}" class="cta">📞 ${t(lang, 'callNow')}</a>
            </div>
        </div>
        <div class="footer">
            <p>${t(lang, 'autoEmail')}</p>
            <p>© ${new Date().getFullYear()} PylonChat</p>
        </div>
    </div>
</body>
</html>
`

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'PylonChat <noreply@pylonchat.com>',
            to: notificationEmail,
            subject: `${categoryEmoji} ${categoryText} - ${data.name} (${lang === 'tr' ? 'Puan' : 'Score'}: ${data.score})`,
            html
        })

        if (result.error) {
            console.error('❌ Resend API error:', result.error)
            return { success: false, error: result.error.message }
        }

        console.log(`✅ Lead notification email sent to ${notificationEmail}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error sending lead notification email:', error)
        return { success: false, error: error?.message }
    }
}

// ─── Appointment Email to Agent ──────────────────────────────────────────

export async function sendAppointmentEmailToAgent(data: AppointmentEmailData, agentEmail: string, agentLocale?: string): Promise<{ success: boolean; error?: string }> {
    try {
        const lang = agentLocale || 'tr'
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
            <h1>📅 ${t(lang, 'newAppointment')}</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">${data.chatbotName}</p>
        </div>
        <div class="body">
            <div class="appointment-card">
                <div style="font-size: 48px;">🗓️</div>
                <div class="date-time">${data.appointmentDate}</div>
                <div style="font-size: 24px; color: #6b7280;">${t(lang, 'time')}: ${data.appointmentTime}</div>
                <div style="margin-top: 10px; color: #6b7280;">${t(lang, 'type')}: ${data.type || t(lang, 'propertyViewing')}</div>
            </div>

            <div class="info-card">
                <h3 style="margin-top: 0;">👤 ${t(lang, 'customerInfo')}</h3>
                <div class="info-row">
                    <span class="label">${t(lang, 'fullName')}</span>
                    <span class="value">${data.leadName}</span>
                </div>
                <div class="info-row">
                    <span class="label">${t(lang, 'phone')}</span>
                    <span class="value"><a href="tel:${data.leadPhone}" style="color: #d97706;">${data.leadPhone}</a></span>
                </div>
                ${data.leadEmail ? `
                <div class="info-row">
                    <span class="label">${t(lang, 'email')}</span>
                    <span class="value"><a href="mailto:${data.leadEmail}" style="color: #d97706;">${data.leadEmail}</a></span>
                </div>
                ` : ''}
            </div>

            <div style="text-align: center; margin-top: 20px;">
                <a href="tel:${data.leadPhone}" class="cta">📞 ${t(lang, 'call')}</a>
                ${data.leadEmail ? `<a href="mailto:${data.leadEmail}" class="cta" style="background: #3b82f6;">✉️ ${t(lang, 'sendEmail')}</a>` : ''}
            </div>
        </div>
        <div class="footer">
            <p>${t(lang, 'calendarAutoAdded')}</p>
            <p>© ${new Date().getFullYear()} PylonChat</p>
        </div>
    </div>
</body>
</html>
`

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'PylonChat <noreply@pylonchat.com>',
            to: agentEmail,
            subject: `📅 ${t(lang, 'subjectNewAppointment')}: ${data.leadName} - ${data.appointmentDate} ${data.appointmentTime}`,
            html
        })

        console.log(`Appointment notification email sent to agent: ${agentEmail}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error sending appointment email to agent:', error)
        return { success: false, error: error?.message }
    }
}

// ─── Appointment Confirmation (to Customer) ──────────────────────────────

export async function sendAppointmentEmailToCustomer(data: AppointmentEmailData, customerEmail: string): Promise<{ success: boolean; error?: string }> {
    try {
        // Customer email uses the FORM LOCALE (whatever language the user filled the chat in)
        const lang = data.locale || 'en'
        const appUrl = process.env.NEXTAUTH_URL || 'https://www.pylonchat.com'
        const cancelLink = data.cancellationToken
            ? `${appUrl}/appointment/cancel?token=${data.cancellationToken}`
            : ''

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
        .cancel-link { display: inline-block; margin-top: 15px; color: #dc2626; font-size: 13px; text-decoration: underline; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>✅ ${t(lang, 'appointmentConfirmed')}</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">${t(lang, 'thankYou')}, ${data.leadName}!</p>
        </div>
        <div class="body">
            <div class="success-badge">
                🎉 ${t(lang, 'appointmentCreated')}
            </div>

            <div class="appointment-card">
                <div class="icon">🏠</div>
                <div class="date">📅 ${data.appointmentDate}</div>
                <div class="time">🕐 ${t(lang, 'time')}: ${data.appointmentTime}</div>

                <div class="agent-info">
                    <p style="margin: 0; color: #6b7280;">${t(lang, 'yourConsultant')}</p>
                    <p style="margin: 5px 0 0; font-size: 18px; font-weight: 600; color: #111827;">👤 ${data.agentName}</p>
                </div>
            </div>

            <div class="note">
                <strong>📌 ${t(lang, 'reminder')}:</strong><br>
                ${t(lang, 'reminderText')}
            </div>

            <div class="footer">
                ${cancelLink ? `
                <p>${t(lang, 'cancelOrChange')}</p>
                <a href="${cancelLink}" class="cancel-link">❌ ${t(lang, 'cancelAppointment')}</a>
                ` : `
                <p>${t(lang, 'cancelOrChange')}</p>
                `}
                <p style="margin-top: 15px;">${t(lang, 'haveAGoodDay')}</p>
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
            subject: `✅ ${t(lang, 'subjectAppointmentConfirmed')} - ${data.appointmentDate} ${data.appointmentTime}`,
            html
        })

        console.log(`Appointment confirmation email sent to customer: ${customerEmail}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error sending appointment email to customer:', error)
        return { success: false, error: error?.message }
    }
}

// ─── Cancellation Email (to Agent) ───────────────────────────────────────

export async function sendCancellationEmailToAgent(data: AppointmentEmailData, agentEmail: string, agentLocale?: string): Promise<{ success: boolean; error?: string }> {
    try {
        const lang = agentLocale || 'tr'
        const html = `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .body { background: #f9fafb; padding: 30px; border-radius: 0 0 12px 12px; }
        .cancel-card { background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 20px; }
        .info-card { background: white; border-radius: 8px; padding: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f3f4f6; }
        .info-row:last-child { border-bottom: none; }
        .label { color: #6b7280; }
        .value { font-weight: 600; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>❌ ${t(lang, 'appointmentCancelled')}</h1>
            <p style="margin: 10px 0 0; opacity: 0.9;">${data.chatbotName}</p>
        </div>
        <div class="body">
            <div class="cancel-card">
                <div style="font-size: 48px;">🗓️❌</div>
                <p style="font-size: 18px; font-weight: bold; color: #dc2626; margin: 15px 0 5px;">${t(lang, 'cancelledAppointmentDetails')}</p>
                <p style="color: #6b7280; margin: 0;">${data.appointmentDate} - ${data.appointmentTime}</p>
                <p style="color: #9ca3af; font-size: 13px; margin-top: 10px;">${t(lang, 'cancelledBy')}</p>
            </div>

            <div class="info-card">
                <h3 style="margin-top: 0;">👤 ${t(lang, 'customerInfo')}</h3>
                <div class="info-row">
                    <span class="label">${t(lang, 'fullName')}</span>
                    <span class="value">${data.leadName}</span>
                </div>
                <div class="info-row">
                    <span class="label">${t(lang, 'phone')}</span>
                    <span class="value"><a href="tel:${data.leadPhone}" style="color: #d97706;">${data.leadPhone}</a></span>
                </div>
            </div>
        </div>
        <div class="footer">
            <p>© ${new Date().getFullYear()} PylonChat</p>
        </div>
    </div>
</body>
</html>
`

        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'PylonChat <noreply@pylonchat.com>',
            to: agentEmail,
            subject: `❌ ${t(lang, 'appointmentCancelled')}: ${data.leadName} - ${data.appointmentDate}`,
            html
        })

        console.log(`Cancellation email sent to agent: ${agentEmail}`)
        return { success: true }

    } catch (error: any) {
        console.error('Error sending cancellation email:', error)
        return { success: false, error: error?.message }
    }
}