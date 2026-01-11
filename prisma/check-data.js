
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkRecentConversations() {
    const recents = await prisma.conversation.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            country: true,
            ipAddress: true,
            createdAt: true,
            visitorId: true
        }
    });

    console.log('Son 5 Konuşma:', JSON.stringify(recents, null, 2));
}

checkRecentConversations()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
