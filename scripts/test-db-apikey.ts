
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Test basliyor...');
    try {
        // 1. Kullanıcı bul
        const user = await prisma.user.findFirst();
        if (!user) {
            console.log('HATA: Hic kullanici bulunamadi.');
            return;
        }
        console.log('Kullanici bulundu:', user.email);

        // 2. Chatbot bul
        const chatbot = await prisma.chatbot.findFirst({
            where: { userId: user.id }
        });

        if (!chatbot) {
            console.log('HATA: Bu kullanicinin chatbotu yok.');
            // Chatbot olusturmayi dene
            const newChatbot = await prisma.chatbot.create({
                data: {
                    name: 'Test Chatbot',
                    userId: user.id,
                    source: 'manual'
                }
            });
            console.log('Yeni chatbot olusturuldu:', newChatbot.id);
            await createKey(newChatbot.id);
            return;
        }
        console.log('Chatbot bulundu:', chatbot.id);
        await createKey(chatbot.id);

    } catch (e) {
        console.error('GENEL HATA:', e);
    } finally {
        await prisma.$disconnect();
    }
}

async function createKey(chatbotId: string) {
    try {
        const key = await prisma.apiKey.create({
            data: {
                name: 'Test Key CLI',
                chatbotId: chatbotId,
                key: 'sk_test_' + Math.random().toString(36).substring(7),
                allowedIps: [],
                scopes: ['chat:read'],
                rateLimit: 60
            }
        });

        console.log('BASARILI! API Key olusturuldu:', key.id);
        console.log('Key:', key.key);

        // Temizle
        await prisma.apiKey.delete({ where: { id: key.id } });
        console.log('Temizlik yapildi, key silindi.');

    } catch (error) {
        console.error('API KEY OLUSTURMA HATASI:', error);
    }
}

main();
