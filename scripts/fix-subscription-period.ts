// Script to fix subscription period dates
// Run with: npx tsx scripts/fix-subscription-period.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixSubscriptionPeriod() {
    console.log('🔧 Starting subscription period fix...')

    const now = new Date()

    // Free users: set period to current month start -> next month
    const subscriptions = await prisma.subscription.findMany({
        include: {
            user: { select: { email: true } }
        }
    })

    console.log(`📊 Found ${subscriptions.length} subscriptions to check`)

    for (const sub of subscriptions) {
        // Check if currentPeriodEnd is in the past
        const periodEnd = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null

        if (!periodEnd || periodEnd < now) {
            console.log(`  - Fixing: ${sub.user.email}`)
            console.log(`    Old period end: ${periodEnd?.toISOString() || 'null'}`)

            // Free users: reset to next month
            // Paid users: should be handled by Stripe webhook
            if (sub.planType === 'free') {
                const newStart = new Date()
                const newEnd = new Date()
                newEnd.setMonth(newEnd.getMonth() + 1)

                await prisma.subscription.update({
                    where: { id: sub.id },
                    data: {
                        currentPeriodStart: newStart,
                        currentPeriodEnd: newEnd,
                        conversationsUsed: 0 // Reset for new period
                    }
                })

                console.log(`    New period: ${newStart.toISOString()} -> ${newEnd.toISOString()}`)
            }
        }
    }

    console.log('✅ All subscription periods fixed!')
}

fixSubscriptionPeriod()
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
