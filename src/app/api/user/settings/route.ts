import { auth } from '@/lib/auth/auth';
import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export async function PATCH(req: Request) {
    try {
        // 1. Oturum Kontrolü
        const session = await auth();

        if (!session?.user?.id) {
            return new NextResponse(JSON.stringify({ error: 'Oturum açmanız gerekiyor' }), { status: 401 });
        }

        // 2. Gelen Veriyi Al
        const body = await req.json();
        const { emailNotifications, marketingEmails, name } = body;

        // 3. Güncellenecek Veriyi Hazırla
        const updateData: any = {};

        // İsim değişikliği varsa ekle
        if (name !== undefined) updateData.name = name;

        // Email Bildirimleri (Veritabanında doğrudan sütun var)
        if (typeof emailNotifications === 'boolean') {
            updateData.emailNotifications = emailNotifications;
        }

        // Pazarlama Bildirimleri (Şemaya eklediğimiz JSON 'customSettings' alanı)
        if (typeof marketingEmails === 'boolean') {
            // Önce mevcut customSettings verisini çekmemiz lazım ki eski ayarlar silinmesin
            const currentUser = await prisma.user.findUnique({
                where: { id: session.user.id },
                select: { customSettings: true }
            });

            const currentSettings = (currentUser?.customSettings as any) || {};

            // Mevcut ayarların üzerine yenisini (marketingEmails) ekle
            updateData.customSettings = {
                ...currentSettings,
                marketingEmails: marketingEmails
            };
        }

        // 4. Veritabanını Güncelle
        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        // Başarılı yanıt (Hata mesajı yok, temiz JSON)
        return NextResponse.json({ success: true, message: 'Ayarlar güncellendi' });

    } catch (error) {
        console.error('Ayarlar API Hatası:', error);
        // Kullanıcıya teknik detay yerine düzgün bir mesaj göster
        return new NextResponse(JSON.stringify({ error: 'Sunucu tarafında bir hata oluştu.' }), { status: 500 });
    }
}