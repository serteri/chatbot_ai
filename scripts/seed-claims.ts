const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('Starting NDIS Claims Seeder...')

    // Find the first user in the database to attach these claims to (assuming it's the developer's account)
    const user = await prisma.user.findFirst()

    if (!user) {
        console.error('No users found in the database. Please sign in to create an account first.')
        return
    }

    console.log(`Linking claims to User: ${user.email} (${user.id})`)

    const mockClaims = [
        {
            userId: user.id,
            participantName: 'Alice Johnson',
            participantNdisNumber: '431009876',
            supportItemNumber: '01_011_0107_1_1',
            supportDeliveredDate: new Date('2025-10-15T09:00:00.000Z'),
            quantityDelivered: 4.5,
            unitPrice: 65.47,
            totalClaimAmount: 294.615,
            status: 'draft'
        },
        {
            userId: user.id,
            participantName: 'Bob Smith',
            participantNdisNumber: '431001111',
            supportItemNumber: '04_104_0125_6_1',
            supportDeliveredDate: new Date('2025-10-16T14:30:00.000Z'),
            quantityDelivered: 2,
            unitPrice: 21.50,
            totalClaimAmount: 43.00,
            status: 'draft'
        },
        {
            userId: user.id,
            participantName: 'Charlie Brown',
            participantNdisNumber: '431002222',
            supportItemNumber: '15_056_0128_1_3',
            supportDeliveredDate: new Date('2025-10-18T10:00:00.000Z'),
            quantityDelivered: 1,
            unitPrice: 193.99,
            totalClaimAmount: 193.99,
            status: 'draft'
        },
        {
            userId: user.id,
            participantName: 'Diana Prince',
            participantNdisNumber: '431003333',
            supportItemNumber: '01_015_0107_1_1',
            supportDeliveredDate: new Date('2025-10-20T11:00:00.000Z'),
            quantityDelivered: 3.5,
            unitPrice: 65.47,
            totalClaimAmount: 229.145,
            status: 'draft'
        },
        {
            userId: user.id,
            participantName: 'Ethan Hunt',
            participantNdisNumber: '431004444',
            supportItemNumber: '09_008_0116_6_3',
            supportDeliveredDate: new Date('2025-10-22T13:00:00.000Z'),
            quantityDelivered: 1,
            unitPrice: 500.00,
            totalClaimAmount: 500.00,
            status: 'draft'
        }
    ]

    let insertedCount = 0
    for (const claim of mockClaims) {
        await prisma.claim.create({
            data: claim
        })
        insertedCount++
    }

    console.log(`Successfully seeded ${insertedCount} NDIS claims!`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
