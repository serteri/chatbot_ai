import { Resend } from 'resend';
import { prisma } from '@/lib/db/prisma';

const resend = new Resend(process.env.RESEND_API_KEY);

export type EmailType = 'marketing' | 'newsletter' | 'transactional' | 'security' | 'critical' | 'general';

interface SendEmailOptions {
    userId: string;
    subject: string;
    html: string;
    type?: EmailType;
}

/**
 * Email gönderme fonksiyonu - Kullanıcı tercihlerini otomatik kontrol eder
 * @param options Email gönderme seçenekleri
 * @returns Email gönderildi mi?
 */
export async function sendEmail(options: SendEmailOptions): Promise<{ success: boolean; message?: string; emailId?: string }> {
    const { userId, subject, html, type = 'general' } = options;

    try {
        // 1. Kullanıcıyı Bul
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                email: true,
                emailNotifications: true,
                customSettings: true,
            },
        });

        if (!user || !user.email) {
            return {
                success: false,
                message: 'User not found or no email address',
            };
        }

        // 2. Email Tercihlerini Kontrol Et
        const canSend = checkEmailPermission(user, type);

        if (!canSend) {
            return {
                success: false,
                message: `User has disabled ${type} emails`,
            };
        }

        // 3. Email Gönder
        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: user.email,
            subject: subject,
            html: html,
        });

        return {
            success: true,
            message: 'Email sent successfully',
            emailId: result.data?.id,
        };
    } catch (error: any) {
        console.error('Email sending error:', error);
        return {
            success: false,
            message: error?.message || 'Failed to send email',
        };
    }
}

/**
 * Kullanıcının email tercihlerini kontrol eder
 */
function checkEmailPermission(user: any, type: EmailType): boolean {
    const settings = (user.customSettings as any) || {};

    // Email bildirimleri tamamen kapalıysa
    if (!user.emailNotifications) {
        return false;
    }

    // Email türüne göre kontrol
    switch (type) {
        case 'marketing':
        case 'newsletter':
            // Pazarlama emailleri için özel izin gerekli
            return settings?.marketingEmails === true;

        case 'transactional':
        case 'security':
        case 'critical':
            // Kritik emailler her zaman gönderilir
            return true;

        case 'general':
        default:
            // Genel emailler için emailNotifications yeterli
            return true;
    }
}

/**
 * Toplu email gönderme - Birden fazla kullanıcıya aynı anda
 */
export async function sendBulkEmail(userIds: string[], subject: string, html: string, type: EmailType = 'newsletter'): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    for (const userId of userIds) {
        const result = await sendEmail({ userId, subject, html, type });
        if (result.success) {
            sent++;
        } else {
            failed++;
        }
    }

    return { sent, failed };
}
