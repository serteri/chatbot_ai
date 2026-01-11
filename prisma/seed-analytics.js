
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding analytics data...');

    // İlk chatbot'u bul
    const chatbot = await prisma.chatbot.findFirst();

    if (!chatbot) {
        console.log('❌ Chatbot not found. Please create a chatbot first.');
        return;
    }

    const countries = [
        { name: 'United States', code: 'US', count: 12 },
        { name: 'Germany', code: 'DE', count: 8 },
        { name: 'United Kingdom', code: 'GB', count: 6 },
        { name: 'France', code: 'FR', count: 5 },
        { name: 'Turkey', code: 'TR', count: 15 },
        { name: 'Italy', code: 'IT', count: 3 },
        { name: 'Spain', code: 'ES', count: 4 },
        { name: 'Japan', code: 'JP', count: 2 },
    ];

    for (const country of countries) {
        for (let i = 0; i < country.count; i++) {
            // Rastgele bir tarih (son 30 gün içinde)
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            await prisma.conversation.create({
                data: {
                    chatbotId: chatbot.id,
                    visitorId: `visitor_${country.code}_${i}`,
                    status: 'closed',
                    country: country.name,
                    ipAddress: '192.168.1.1', // Fake IP
                    createdAt: date,
                    updatedAt: date,
                    messages: {
                        create: [
                            {
                                role: 'user',
                                content: 'Hello, I need help.',
                                createdAt: date
                            },
                            {
                                role: 'assistant',
                                content: 'Hi! How can I help you today?',
                                createdAt: date
                            }
                        ]
                    }
                }
            });
        }
    }

    console.log('✅ Analytics data seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
