import { auth } from '@/lib/auth/auth';
import { NextResponse } from 'next/server';
import { sendEmail } from '@/lib/email/send-email';
import { WelcomeEmail } from '@/lib/email/templates';

/**
 * Test Email Endpoint
 * Kullanıcının kendisine test emaili gönderir
 */
export async function POST(req: Request) {
    try {
        // 1. Oturum Kontrolü
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 2. Request Body
        const body = await req.json();
        const { type = 'welcome' } = body;

        let subject = '';
        let html = '';

        // 3. Email Türüne Göre Template Seç
        switch (type) {
            case 'welcome':
                subject = '🎉 ChatbotAI\'a Hoş Geldiniz!';
                html = WelcomeEmail({
                    userName: session.user.name || 'Kullanıcı',
                    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL + '/dashboard',
                });
                break;

            case 'test':
                subject = '✅ Test Email - Sistem Çalışıyor!';
                html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✅ Test Email</h1>
    </div>

    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 25px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 15px 0; font-size: 16px;">
                Merhaba ${session.user.name || 'Kullanıcı'}! 👋
            </p>

            <p style="margin: 0 0 15px 0; font-size: 16px; color: #10b981; font-weight: bold;">
                🎉 Email sisteminiz başarıyla çalışıyor!
            </p>

            <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; margin: 20px 0;">
                <p style="margin: 0; color: #166534; font-size: 14px;">
                    <strong>✓</strong> Resend API bağlantısı başarılı<br>
                    <strong>✓</strong> Email template'leri çalışıyor<br>
                    <strong>✓</strong> Kullanıcı tercihleri kontrol ediliyor<br>
                    <strong>✓</strong> Email gönderme sistemi hazır!
                </p>
            </div>

            <p style="margin: 20px 0 0 0; font-size: 14px; color: #6b7280;">
                Gönderilme zamanı: ${new Date().toLocaleString('tr-TR')}
            </p>
        </div>

        <p style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
            Bu bir test emailidir. ChatbotAI tarafından gönderilmiştir.
        </p>
    </div>
</body>
</html>
                `;
                break;

            default:
                return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
        }

        // 4. Email Gönder
        const result = await sendEmail({
            userId: session.user.id,
            subject: subject,
            html: html,
            type: type === 'test' ? 'general' : 'transactional',
        });

        if (!result.success) {
            return NextResponse.json({
                success: false,
                error: result.message,
            }, { status: 400 });
        }

        return NextResponse.json({
            success: true,
            message: 'Test email sent successfully!',
            emailId: result.emailId,
        });

    } catch (error: any) {
        console.error('Test email error:', error);
        return NextResponse.json({
            error: 'Failed to send test email',
            details: error?.message,
        }, { status: 500 });
    }
}