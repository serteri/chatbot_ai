
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanAnalyticsData() {
    console.log('🧹 Cleaning analytics data...');

    // Sadece closed statüsündeki test verilerini sil (seed script 'closed' olarak eklemişti)
    // Veya tüm conversationları temizle (daha temiz başlangıç için)

    // DİKKAT: Kullanıcının gerçek verisi varsa silinmesin diye visitorId kontrolü yapabilirim
    // Seed script visitorId formatı: `visitor_${country.code}_${i}`

    const deleted = await prisma.conversation.deleteMany({
        where: {
            visitorId: {
                startsWith: 'visitor_'
            },
            country: {
                in: ['United States', 'Germany', 'United Kingdom', 'France', 'Turkey', 'Italy', 'Spain', 'Japan']
            }
        }
    });

    console.log(`✅ Deleted ${deleted.count} test conversations.`);
}

cleanAnalyticsData()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
