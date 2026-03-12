import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { parse } from 'papaparse'
import { parse as parseDate } from 'date-fns'

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const file = formData.get('file') as File
        
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const csvText = await file.text()
        
        const results = parse(csvText, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim()
        })

        if (results.errors.length > 0) {
            console.error('CSV Parsing Errors:', results.errors)
            return NextResponse.json({ error: 'Failed to parse CSV file' }, { status: 400 })
        }

        const claimsData = results.data as any[]
        const createdClaims = []

        for (const row of claimsData) {
            // Mapping logic
            const participantName = row['Participant Name']
            const ndisNumber = row['NDIS Number']
            const supportItem = row['Support Item']
            const dateStr = row['Date']
            const quantity = parseFloat(row['Quantity'])
            const unitPrice = parseFloat(row['UnitPrice'])

            if (!participantName || !ndisNumber || !supportItem || isNaN(quantity) || isNaN(unitPrice)) {
                continue // Skip invalid rows
            }

            // Simple date parsing (expecting DD/MM/YYYY)
            let supportDate: Date
            try {
                supportDate = parseDate(dateStr, 'dd/MM/yyyy', new Date())
                if (isNaN(supportDate.getTime())) throw new Error()
            } catch {
                supportDate = new Date(dateStr) // Fallback to native parsing
            }

            const totalAmount = quantity * unitPrice

            createdClaims.push({
                userId: session.user.id,
                participantName,
                participantNdisNumber: ndisNumber,
                supportItemNumber: supportItem,
                supportDeliveredDate: supportDate,
                quantityDelivered: quantity,
                unitPrice: unitPrice,
                totalClaimAmount: totalAmount,
                status: 'draft'
            })
        }

        if (createdClaims.length === 0) {
            return NextResponse.json({ error: 'No valid claims found in CSV' }, { status: 400 })
        }

        // Bulk create in Prisma
        await prisma.claim.createMany({
            data: createdClaims
        })

        return NextResponse.json({ 
            success: true, 
            message: `Successfully imported ${createdClaims.length} claims.` 
        })

    } catch (error) {
        console.error('Error in bulk claims import:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
