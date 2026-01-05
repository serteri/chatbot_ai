import { Resend } from 'resend';
import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        // 1. Oturum Kontrolü
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Request Body
        const { userId, subject, html, type } = await req.json();

        // 3. Kullanıcının Email Tercihlerini Kontrol Et
        const user = await prisma.user.findUnique({
            where: { id: userId || session.user.id },
            select: {
                email: true,
                emailNotifications: true,
                customSettings: true
            }
        });

        if (!user || !user.email) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const settings = (user.customSettings as any) || {};

        // 4. Email Türüne Göre İzin Kontrolü
        const canSendEmail = checkEmailPermission(user, settings, type);

        if (!canSendEmail) {
            return NextResponse.json({
                success: false,
                message: 'User has disabled this type of email notification'
            }, { status: 200 });
        }

        // 5. Email Gönder
        const result = await resend.emails.send({
            from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
            to: user.email,
            subject: subject,
            html: html
        });

        return NextResponse.json({
            success: true,
            emailId: result.data?.id,
            message: 'Email sent successfully'
        });

    } catch (error: any) {
        console.error('Email sending error:', error);
        return NextResponse.json({
            error: 'Failed to send email',
            details: error?.message
        }, { status: 500 });
    }
}

// Email Türüne Göre İzin Kontrolü
function checkEmailPermission(user: any, settings: any, type: string): boolean {
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
            // Kritik emailler için sadece genel bildirim izni yeterli
            return true;

        default:
            // Belirsiz türler için genel bildirim izni yeterli
            return true;
    }
}
