// Script to fix subscription limits for existing free users
// Run with: npx ts-node scripts/fix-free-subscriptions.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixFreeSubscriptions() {
    console.log('🔧 Starting subscription fix...')

    // Find all free subscriptions with wrong limits
    const freeSubscriptions = await prisma.subscription.findMany({
        where: {
            planType: 'free',
            OR: [
                { maxChatbots: { not: 1 } },
                { maxDocuments: { not: 3 } },
                { maxConversations: { not: 50 } }
            ]
        },
        include: {
            user: { select: { email: true } }
        }
    })

    console.log(`📊 Found ${freeSubscriptions.length} free subscriptions with incorrect limits`)

    for (const sub of freeSubscriptions) {
        console.log(`  - Fixing: ${sub.user.email} (was: ${sub.maxChatbots}/${sub.maxDocuments}/${sub.maxConversations})`)

        await prisma.subscription.update({
            where: { id: sub.id },
            data: {
                maxChatbots: 1,
                maxDocuments: 3,
                maxConversations: 50
            }
        })
    }

    console.log('✅ All free subscriptions fixed!')
    console.log('')
    console.log('New limits:')
    console.log('  - maxChatbots: 1')
    console.log('  - maxDocuments: 3')
    console.log('  - maxConversations: 50')
}

fixFreeSubscriptions()
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
