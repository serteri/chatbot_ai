// Script to fix conversationsUsed to match actual conversation count
// Run with: npx tsx scripts/fix-conversations-used.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixConversationsUsed() {
    console.log('🔧 Starting conversationsUsed fix...')

    // Get all subscriptions
    const subscriptions = await prisma.subscription.findMany({
        include: {
            user: {
                select: {
                    email: true,
                    chatbots: {
                        select: {
                            id: true,
                            _count: {
                                select: { conversations: true }
                            }
                        }
                    }
                }
            }
        }
    })

    console.log(`📊 Found ${subscriptions.length} subscriptions to check`)

    for (const sub of subscriptions) {
        // Calculate actual conversation count from all chatbots
        const actualConversations = sub.user.chatbots.reduce(
            (sum, bot) => sum + bot._count.conversations,
            0
        )

        if (sub.conversationsUsed !== actualConversations) {
            console.log(`  - Fixing: ${sub.user.email}`)
            console.log(`    Old: ${sub.conversationsUsed} → New: ${actualConversations}`)

            await prisma.subscription.update({
                where: { id: sub.id },
                data: { conversationsUsed: actualConversations }
            })
        }
    }

    console.log('✅ All conversationsUsed counts fixed!')
}

fixConversationsUsed()
    .then(() => {
        console.log('✅ Done!')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Error:', error)
        process.exit(1)
    })
    .finally(() => {
        prisma.$disconnect()
    })
