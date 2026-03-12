const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Starting Verifier NDIS Claims Seeder...')

    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('No users found in the database.')
        return
    }

    console.log(`Linking claims to User: ${user.email} (${user.id})`)

    const supportItems = [
        { code: '01_011_0107_1_1', price: 67.56 },
        { code: '04_104_0125_6_1', price: 193.99 }
    ]

    const names = ['John Citizen', 'Jane Doe', 'Alice Walker', 'Bob Vance', 'Charlie Day']

    const mockClaims = names.map((name, index) => {
        const item = supportItems[index % supportItems.length]
        const qty = Math.floor(Math.random() * 10) + 1
        return {
            userId: user.id,
            participantName: name,
            participantNdisNumber: `NDIS-${100000 + index}`,
            supportItemNumber: item.code,
            supportDeliveredDate: new Date(),
            quantityDelivered: qty,
            unitPrice: item.price,
            totalClaimAmount: qty * item.price,
            status: 'draft'
        }
    })

    let insertedCount = 0
    for (const claim of mockClaims) {
        await prisma.claim.create({
            data: claim
        })
        insertedCount++
    }

    console.log(`Successfully seeded ${insertedCount} NDIS claims for verification!`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
