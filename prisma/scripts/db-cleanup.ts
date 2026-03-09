/**
 * One-time database cleanup script.
 * Run with: npx tsx prisma/scripts/db-cleanup.ts
 *
 * - Deletes user "Maximilian Götz-Mikus" if present
 * - Sets companyName = "PylonChat" for serteri@gmail.com
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Remove Maximilian Götz-Mikus (match by name, case-insensitive)
    const deleted = await prisma.user.deleteMany({
        where: {
            name: {
                contains: 'Maximilian',
                mode: 'insensitive',
            },
        },
    })
    console.log(`[cleanup] Deleted ${deleted.count} user(s) matching "Maximilian"`)

    // 2. Set companyName for admin account
    const updated = await prisma.user.updateMany({
        where: { email: 'serteri@gmail.com' },
        data: { companyName: 'PylonChat' },
    })
    console.log(`[cleanup] Updated companyName to "PylonChat" for ${updated.count} account(s)`)
}

main()
    .catch((err) => {
        console.error('[cleanup] Error:', err)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
