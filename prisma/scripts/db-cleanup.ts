/**
 * Production database cleanup script.
 * Run with: npx tsx prisma/scripts/db-cleanup.ts
 *
 * - Deletes maximilianmikus@gmail.com and any account whose name
 *   contains "Maximilian" as a safety net.
 * - Sets companyName = "NDIS Shield Hub Australia" for serteri@gmail.com.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // 1. Delete by exact email
    const byEmail = await prisma.user.deleteMany({
        where: { email: 'maximilianmikus@gmail.com' },
    })
    console.log(`[cleanup] Deleted ${byEmail.count} user(s) with email maximilianmikus@gmail.com`)

    // 2. Safety net — any remaining "Maximilian" accounts
    const byName = await prisma.user.deleteMany({
        where: {
            name: { contains: 'Maximilian', mode: 'insensitive' },
        },
    })
    console.log(`[cleanup] Deleted ${byName.count} additional user(s) whose name contains "Maximilian"`)

    // 3. Update admin account with new company name
    const updated = await prisma.user.updateMany({
        where: { email: 'serteri@gmail.com' },
        data: { companyName: 'NDIS Shield Hub Australia' },
    })
    console.log(`[cleanup] Set companyName="NDIS Shield Hub Australia" for ${updated.count} account(s)`)
}

main()
    .catch((err) => {
        console.error('[cleanup] Error:', err)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
