/**
 * One-time seed script: upsert test participant and verify sync matching logic.
 * Run: npx tsx scripts/seed-participant.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // ── 1. Find the first user (the account owner) ─────────────────────────
    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'asc' },
        select:  { id: true, email: true, name: true },
    })

    if (!user) {
        throw new Error('No user found in the database. Make sure you have logged in at least once.')
    }

    console.log(`\nUsing account: ${user.email} (${user.id})`)

    // ── 2. Upsert the test participant ─────────────────────────────────────
    const participant = await prisma.participant.upsert({
        where: {
            // Unique constraint: userId + ndisNumber combo via findFirst fallback
            // Prisma requires a unique field for `where` — we use a compound approach:
            id: (await prisma.participant.findFirst({
                where: { userId: user.id, ndisNumber: '431000123' },
                select: { id: true },
            }))?.id ?? 'create-new', // triggers create branch
        },
        create: {
            userId:     user.id,
            fullName:   'serter test',
            ndisNumber: '431000123',
            status:     'ACTIVE',
        },
        update: {
            fullName: 'serter test',
            status:   'ACTIVE',
        },
    })

    console.log(`\nParticipant upserted:`)
    console.log(`  id:         ${participant.id}`)
    console.log(`  fullName:   ${participant.fullName}`)
    console.log(`  ndisNumber: ${participant.ndisNumber}`)
    console.log(`  status:     ${participant.status}`)

    // ── 3. Verify sync matching logic ──────────────────────────────────────
    console.log('\n── Sync Matching Verification ──────────────────────────────')

    // Simulate: ContactNumber = '431000123'  →  should hit ndisNumber match
    const byNdis = await prisma.participant.findFirst({
        where: { userId: user.id, ndisNumber: '431000123' },
        select: { id: true, fullName: true },
    })
    console.log(`  ContactNumber '431000123' → ndisNumber match: ${byNdis ? `✅ "${byNdis.fullName}"` : '❌ NOT FOUND'}`)

    // Simulate: Contact.Name = 'Serter Test'  →  case-insensitive name match
    const byName = await prisma.participant.findFirst({
        where: {
            userId: user.id,
            fullName: { equals: 'Serter Test', mode: 'insensitive' },
        },
        select: { id: true, fullName: true },
    })
    console.log(`  Contact.Name 'Serter Test' → name match:      ${byName ? `✅ "${byName.fullName}"` : '❌ NOT FOUND'}`)

    console.log('\n✅ Participant \'serter test\' (431000123) is now in the database.')
}

main()
    .catch(err => { console.error(err); process.exit(1) })
    .finally(() => prisma.$disconnect())
