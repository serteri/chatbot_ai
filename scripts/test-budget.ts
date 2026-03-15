/**
 * Test: set serter test budget = $100, then simulate a $1 invoice deduction.
 * Run: npx tsx scripts/test-budget.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    // ── 1. Find the participant ─────────────────────────────────────────────
    const participant = await prisma.participant.findFirst({
        where: { ndisNumber: '431000123' },
    })
    if (!participant) throw new Error('Participant not found. Run seed-participant.ts first.')

    console.log(`\nParticipant found: ${participant.fullName} (${participant.ndisNumber})`)

    // ── 2. Set budget to $100 ──────────────────────────────────────────────
    const reset = await prisma.participant.update({
        where: { id: participant.id },
        data:  { totalBudget: 100, remainingBudget: 100 },
    })
    console.log(`\nBudget set → totalBudget: $${reset.totalBudget}, remainingBudget: $${reset.remainingBudget}`)

    // Reset any existing deductions so we can re-test
    await prisma.xeroInvoice.updateMany({
        where: { participantId: participant.id },
        data:  { budgetDeducted: false },
    })

    // ── 3. Simulate a $1 invoice deduction via transaction ─────────────────
    const testInvoice = await prisma.xeroInvoice.findFirst({
        where:   { participantId: participant.id },
        orderBy: { createdAt: 'desc' },
        select:  { id: true, invoiceNumber: true, total: true, budgetDeducted: true },
    })

    if (!testInvoice) {
        console.log('\n⚠️  No synced invoices found for this participant yet.')
        console.log('   Run a Xero sync first, or insert a test invoice manually.')
        return
    }

    console.log(`\nTest invoice: #${testInvoice.invoiceNumber ?? 'N/A'} | $${testInvoice.total} | deducted: ${testInvoice.budgetDeducted}`)

    // Simulate the deduction (same logic as sync route)
    const result = await prisma.$transaction(async (tx) => {
        const inv = await tx.xeroInvoice.findUnique({
            where:  { id: testInvoice.id },
            select: { budgetDeducted: true },
        })
        if (!inv || inv.budgetDeducted) {
            return { skipped: true, remainingBudget: reset.remainingBudget }
        }

        const updated = await tx.participant.update({
            where:  { id: participant.id },
            data:   { remainingBudget: { decrement: testInvoice.total } },
            select: { remainingBudget: true },
        })

        await tx.xeroInvoice.update({
            where: { id: testInvoice.id },
            data:  { budgetDeducted: true },
        })

        return { skipped: false, remainingBudget: updated.remainingBudget }
    })

    // ── 4. Report ──────────────────────────────────────────────────────────
    console.log(`\n── Budget Deduction Test ─────────────────────────────────────`)
    console.log(`  Invoice amount:   $${testInvoice.total.toFixed(2)}`)
    console.log(`  Budget before:    $100.00`)
    console.log(`  Budget after:     $${result.remainingBudget.toFixed(2)}`)
    console.log(`  Deduction:        ${result.skipped ? 'SKIPPED (already deducted)' : '✅ Applied'}`)
    console.log(`  Expected:         $${(100 - testInvoice.total).toFixed(2)}`)
    const pass = Math.abs(result.remainingBudget - (100 - testInvoice.total)) < 0.001
    console.log(`\n  Test result:      ${pass ? '✅ PASS' : '❌ FAIL'}`)

    // ── 5. Idempotency check — run again, budget should NOT change ─────────
    const before2 = result.remainingBudget
    const result2 = await prisma.$transaction(async (tx) => {
        const inv = await tx.xeroInvoice.findUnique({
            where:  { id: testInvoice.id },
            select: { budgetDeducted: true },
        })
        if (!inv || inv.budgetDeducted) {
            const p = await tx.participant.findUnique({ where: { id: participant.id }, select: { remainingBudget: true } })
            return { skipped: true, remainingBudget: p?.remainingBudget ?? 0 }
        }
        const updated = await tx.participant.update({
            where:  { id: participant.id },
            data:   { remainingBudget: { decrement: testInvoice.total } },
            select: { remainingBudget: true },
        })
        await tx.xeroInvoice.update({ where: { id: testInvoice.id }, data: { budgetDeducted: true } })
        return { skipped: false, remainingBudget: updated.remainingBudget }
    })

    console.log(`\n── Idempotency Check (re-sync simulation) ────────────────────`)
    console.log(`  Budget before 2nd run: $${before2.toFixed(2)}`)
    console.log(`  Budget after 2nd run:  $${result2.remainingBudget.toFixed(2)}`)
    console.log(`  Second deduction:      ${result2.skipped ? '✅ SKIPPED (idempotent — correct!)' : '❌ APPLIED AGAIN (bug!)'}`)
}

main()
    .catch(err => { console.error(err); process.exit(1) })
    .finally(() => prisma.$disconnect())
