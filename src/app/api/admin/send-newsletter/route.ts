import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Resend } from 'resend'; // Örnek olarak Resend kütüphanesi (npm install resend)

// Resend kurulumu (API Key .env dosyasında olmalı)
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    try {
        // 1. ADIM: Bildirimleri AÇIK olan kullanıcıları bul
        const subscribedUsers = await prisma.user.findMany({
            where: {
                emailNotifications: true, // Sadece izni olanları çekiyoruz
                email: { not: null }      // E-postası olanları garantiye al
            },
            select: {
                email: true,
                name: true
            }
        });

        if (subscribedUsers.length === 0) {
            return NextResponse.json({ message: "Gönderilecek kullanıcı bulunamadı." });
        }

        // 2. ADIM: Bu kullanıcılara e-posta gönder
        // (Not: Gerçek hayatta bunu döngüye sokmak yerine 'batch' gönderim yapılır)

        const emailPromises = subscribedUsers.map(user => {
            return resend.emails.send({
                from: 'ChatbotAI <noreply@sizin-domaininiz.com>',
                to: user.email!, // Kullanıcının e-postası
                subject: 'Haftalık Bülten - Yeni Özellikler!',
                html: `
                    <h1>Merhaba ${user.name || 'Kullanıcı'},</h1>
                    <p>Bu e-postayı, bildirim ayarlarınız açık olduğu için alıyorsunuz.</p>
                    <p>İşte bu haftanın güncellemeleri...</p>
                    <br />
                    <a href="https://sizin-siteniz.com/dashboard/settings">Abonelikten Çık</a>
                `
            });
        });

        // Tüm maillerin gönderilmesini bekle
        await Promise.all(emailPromises);

        return NextResponse.json({
            success: true,
            message: `${subscribedUsers.length} kişiye e-posta gönderildi.`
        });

    } catch (error) {
        console.error("Mail gönderme hatası:", error);
        return NextResponse.json({ error: "İşlem başarısız oldu" }, { status: 500 });
    }
}