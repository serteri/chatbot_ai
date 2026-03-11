import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { InternalClaim } from '@/types/proda'
import { transformClaimsToCsvData, generateProdaCsvString } from '@/lib/proda-utils'

// Mock Data Source - In a real system, this would be fetched via Prisma 'prisma.claim.findMany({ where: { id: { in: claimIds } } })'
const MOCK_CLAIMS_DATABASE: InternalClaim[] = [
    {
        id: 'clm_001A9F',
        agencyRegistrationNumber: '4050012345',
        participantNdisNumber: '431009876',
        supportItemNumber: '01_011_0107_1_1',
        supportDeliveredDate: new Date('2025-10-15T09:00:00.000Z'),
        quantityDelivered: 4.5,
        unitPrice: 65.47,
        totalClaimAmount: 294.615
    },
    {
        id: 'clm_002B8E',
        agencyRegistrationNumber: '4050012345',
        participantNdisNumber: '431009876',
        supportItemNumber: '04_104_0125_6_1',
        supportDeliveredDate: new Date('2025-10-16T14:30:00.000Z'),
        quantityDelivered: 2,
        unitPrice: 21.50,
        totalClaimAmount: 43.00
    },
    {
        id: 'clm_003C7D',
        agencyRegistrationNumber: '4050012345',
        participantNdisNumber: '431001111',
        supportItemNumber: '15_056_0128_1_3',
        supportDeliveredDate: new Date('2025-10-18T10:00:00.000Z'),
        quantityDelivered: 1,
        unitPrice: 193.99,
        totalClaimAmount: 193.99
    }
]

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { claimIds } = body

        if (!Array.isArray(claimIds) || claimIds.length === 0) {
            return NextResponse.json({ error: 'No claim IDs provided' }, { status: 400 })
        }

        // Fetch User Identity from Prisma
        const dbUser = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { ndisProviderNumber: true }
        })

        const registrationNumber = dbUser?.ndisProviderNumber || 'MISSING_PROVIDER_ID'

        // 1. Fetch data from Mock DB (Substitute for Prisma later)
        const rawClaims = MOCK_CLAIMS_DATABASE.filter(claim => claimIds.includes(claim.id))

        if (rawClaims.length === 0) {
            return NextResponse.json({ error: 'No matching claims found' }, { status: 404 })
        }

        // Inject dynamic registration identity over mock templates
        const selectedClaims = rawClaims.map(claim => ({
            ...claim,
            agencyRegistrationNumber: registrationNumber
        }))

        // 2. Transform the raw Data using the previously built PRODA engines
        const prodaCsvData = transformClaimsToCsvData(selectedClaims)

        // 3. Generate raw CSV string string
        const csvString = generateProdaCsvString(prodaCsvData)

        // 4. Send back as standard generic browser-downloadable File format Blob
        return new NextResponse(csvString, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': 'attachment; filename="proda_claims.csv"'
            }
        })

    } catch (error) {
        console.error('Error generating PRODA bulk export:', error)
        return NextResponse.json({ error: 'Failed to generate PRODA Bulk Export' }, { status: 500 })
    }
}
