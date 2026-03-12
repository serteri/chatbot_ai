import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { InternalClaim } from '@/types/proda'
import { transformClaimsToCsvData, generateProdaCsvString } from '@/lib/proda-utils'

// No longer relying on mocks, querying live Prisma database

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

        const registrationNumber = dbUser?.ndisProviderNumber || 'SET_IN_SETTINGS'

        // 1. Fetch data from Prisma Database natively ensuring only their account claims are retrieved
        const rawClaims = await prisma.claim.findMany({
            where: {
                id: { in: claimIds },
                userId: session.user.id
            }
        })

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
