import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import * as XLSX from 'xlsx'
import { parse as parseCsv } from 'papaparse'
import { parse as parseDate, isValid } from 'date-fns'

// Fuzzy Header Mapping Logic
const HEADER_MAP: Record<string, string[]> = {
    participantName: ['Participant Name', 'Participant', 'Name', 'Client Name'],
    participantNdisNumber: ['NDIS Number', 'NDIS No', 'ParticipantID', 'NDIS ID'],
    supportItemNumber: ['Support Item', 'Support Item Number', 'Support Ite', 'Item Code'],
    supportDeliveredDate: ['Date', 'Support Date', 'Service Date'],
    quantityDelivered: ['Quantity', 'Hours', 'Qty'],
    unitPrice: ['UnitPrice', 'Price', 'Rate']
}

function findMappedKey(header: string): string | null {
    const normalized = header.trim().toLowerCase()
    for (const [key, aliases] of Object.entries(HEADER_MAP)) {
        if (aliases.some(alias => normalized === alias.toLowerCase())) {
            return key
        }
    }
    return null
}

export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const action = formData.get('action') as string || 'parse' // 'parse' or 'commit'
        
        if (action === 'commit') {
            const claimsData = JSON.parse(formData.get('data') as string)
            if (!Array.isArray(claimsData) || claimsData.length === 0) {
                return NextResponse.json({ error: 'No data to commit' }, { status: 400 })
            }

            // Prepare for Prisma creation
            const dataToInsert = claimsData.map((c: any) => ({
                userId: session.user.id,
                participantName: c.participantName,
                participantNdisNumber: c.participantNdisNumber,
                supportItemNumber: c.supportItemNumber,
                supportDeliveredDate: new Date(c.supportDeliveredDate),
                quantityDelivered: parseFloat(c.quantityDelivered),
                unitPrice: parseFloat(c.unitPrice),
                totalClaimAmount: parseFloat(c.quantityDelivered) * parseFloat(c.unitPrice),
                status: 'draft'
            }))

            await prisma.claim.createMany({ data: dataToInsert })
            return NextResponse.json({ success: true, count: dataToInsert.length })
        }

        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        let rawData: any[] = []

        if (file.name.endsWith('.csv')) {
            const csvText = Buffer.from(buffer).toString('utf-8')
            const result = parseCsv(csvText, { header: true, skipEmptyLines: true })
            rawData = result.data as any[]
        } else {
            const workbook = XLSX.read(buffer, { type: 'buffer' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            rawData = XLSX.utils.sheet_to_json(firstSheet)
        }

        if (rawData.length === 0) {
            return NextResponse.json({ error: 'File is empty' }, { status: 400 })
        }

        // Processing & Fuzzy Mapping
        const mappedData: any[] = []
        const errors: string[] = []

        rawData.forEach((row, index) => {
            const mappedEntry: any = { _originalRow: index + 2, _errors: [] }
            const rowKeys = Object.keys(row)
            
            rowKeys.forEach(originalHeader => {
                const mappedKey = findMappedKey(originalHeader)
                if (mappedKey) {
                    mappedEntry[mappedKey] = row[originalHeader]
                }
            })

            // Validation
            if (!mappedEntry.participantName) mappedEntry._errors.push('Missing Name')
            if (!mappedEntry.participantNdisNumber) mappedEntry._errors.push('Missing NDIS ID')
            if (!mappedEntry.supportItemNumber) mappedEntry._errors.push('Missing Item Code')
            
            // Price Validation (Guard against $1M test)
            const price = parseFloat(mappedEntry.unitPrice)
            if (isNaN(price)) {
                mappedEntry._errors.push('Invalid Price')
            } else if (price > 10000) {
                mappedEntry._errors.push(`Extreme Price Warning: $${price.toLocaleString()}`)
            }

            // Date Parsing
            if (mappedEntry.supportDeliveredDate) {
                const dateStr = String(mappedEntry.supportDeliveredDate)
                let parsedDate = parseDate(dateStr, 'dd/MM/yyyy', new Date())
                if (!isValid(parsedDate)) {
                    parsedDate = new Date(dateStr)
                }
                if (isValid(parsedDate)) {
                    mappedEntry.supportDeliveredDate = parsedDate.toISOString()
                } else {
                    mappedEntry._errors.push('Invalid Date Format')
                }
            } else {
                mappedEntry._errors.push('Missing Date')
            }

            mappedData.push(mappedEntry)
        })

        return NextResponse.json({ 
            success: true, 
            action: 'parse',
            data: mappedData,
            summary: {
                total: mappedData.length,
                valid: mappedData.filter(r => r._errors.length === 0).length,
                invalid: mappedData.filter(r => r._errors.length > 0).length
            }
        })

    } catch (error) {
        console.error('Bulk Import API Error:', error)
        return NextResponse.json({ error: 'Failed to process file' }, { status: 500 })
    }
}
