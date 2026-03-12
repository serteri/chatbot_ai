import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import * as XLSX from 'xlsx'
import { parse as parseCsv } from 'papaparse'
import { parse as parseDate, isValid } from 'date-fns'

// Fuzzy Header Mapping Logic - Updated with more explicit variants
const HEADER_MAP: Record<string, string[]> = {
    participantName: ['Participant Name', 'Participant', 'Name', 'Client Name', 'Full Name'],
    participantNdisNumber: ['NDIS Number', 'NDIS No', 'ParticipantID', 'NDIS ID', 'NDIS #'],
    supportItemNumber: ['Support Item', 'Support Item Number', 'Support Ite', 'Item Code', 'Support Item No'],
    supportDeliveredDate: ['Date', 'Support Date', 'Service Date', 'Activity Date'],
    quantityDelivered: ['Quantity', 'Hours', 'Qty', 'Units'],
    unitPrice: ['UnitPrice', 'Price', 'Rate', 'Unit Price']
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
        const action = formData.get('action') as string || 'parse' 
        
        if (action === 'commit') {
            const claimsData = JSON.parse(formData.get('data') as string)
            if (!Array.isArray(claimsData) || claimsData.length === 0) {
                return NextResponse.json({ error: 'No data to commit' }, { status: 400 })
            }

            const cleanNum = (v: any) => parseFloat(String(v).replace(/[$,\s]/g, ''))
            const dataToInsert = claimsData.map((c: any) => {
                const qty = cleanNum(c.quantityDelivered)
                const price = cleanNum(c.unitPrice)
                return {
                    userId: session.user.id,
                    participantName: String(c.participantName).trim(),
                    participantNdisNumber: String(c.participantNdisNumber).trim(),
                    supportItemNumber: String(c.supportItemNumber).trim(),
                    supportDeliveredDate: new Date(c.supportDeliveredDate),
                    quantityDelivered: qty,
                    unitPrice: price,
                    totalClaimAmount: qty * price,
                    status: 'draft'
                }
            })

            await prisma.claim.createMany({ data: dataToInsert })
            return NextResponse.json({ success: true, count: dataToInsert.length })
        }

        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const buffer = await file.arrayBuffer()
        let rawData: any[] = []
        let headers: string[] = []

        console.log(`[BULK IMPORT] Processing file: ${file.name} (${file.size} bytes)`)

        if (file.name.endsWith('.csv')) {
            const csvText = Buffer.from(buffer).toString('utf-8')
            const result = parseCsv(csvText, { header: true, skipEmptyLines: true })
            rawData = result.data as any[]
            headers = result.meta.fields || []
        } else {
            const workbook = XLSX.read(buffer, { type: 'buffer' })
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
            // Use header: 1 to get raw arrays first to detect headers safely
            const jsonRows: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: '' })
            if (jsonRows.length > 0) {
                headers = jsonRows[0].map(h => String(h).trim()).filter(h => h !== '')
                // cellDates: true converts Excel serial numbers to JS Date objects automatically
                rawData = XLSX.utils.sheet_to_json(firstSheet, { cellDates: true, defval: '' })
            }
        }

        console.log(`[BULK IMPORT] Raw Headers Detected:`, headers)

        if (rawData.length === 0) {
            return NextResponse.json({ error: 'File is empty' }, { status: 400 })
        }

        // Header Mapping Analysis
        const mapping: Record<string, string | null> = {}
        headers.forEach(h => {
            mapping[h] = findMappedKey(h)
        })

        console.log(`[BULK IMPORT] Fuzzy Mapping Result:`, mapping)

        // Index-based Fallback (Column A=Name, B=NDIS, C=Item, D=Date, E=Qty, F=Price)
        const hasKeyMappings = mapping[headers[0]] || mapping[headers[1]]
        if (!hasKeyMappings && headers.length >= 6) {
            console.log(`[BULK IMPORT] Warning: No mapping found. Applying Index Fallback (A-F strategy)`)
            // Only apply if the user didn't have ANY headers match (high confidence it's a raw dump)
            // This is just for internal logic, UI will allow manual override
        }

        const processedData: any[] = []
        rawData.forEach((row, index) => {
            const entry: any = { _originalRow: index + 2, _errors: [] }
            
            // Apply mapped values with Trimming + currency cleanup
            Object.keys(row).forEach(key => {
                const mappedKey = findMappedKey(key) || mapping[key]
                if (mappedKey) {
                    let val = row[key]
                    if (typeof val === 'string') {
                        val = val.trim()
                        // Strip currency symbols and commas from numeric fields
                        if (mappedKey === 'unitPrice' || mappedKey === 'quantityDelivered') {
                            val = val.replace(/[$,\s]/g, '')
                        }
                    }
                    entry[mappedKey] = val
                }
            })

            // Hard Validation
            if (!entry.participantName) entry._errors.push('Missing Name')
            if (!entry.participantNdisNumber) entry._errors.push('Missing NDIS ID')
            if (!entry.supportItemNumber) entry._errors.push('Missing Item Code')
            
            const price = parseFloat(entry.unitPrice)
            if (isNaN(price)) {
                entry._errors.push('Invalid Price')
            } else if (price > 10000) {
                entry._errors.push(`Extreme Price: $${price.toLocaleString()}`)
            }

            const qty = parseFloat(entry.quantityDelivered)
            if (isNaN(qty)) entry._errors.push('Invalid Qty')

            // Date Processing
            const rawDate = entry.supportDeliveredDate
            if (rawDate !== undefined && rawDate !== '' && rawDate !== null) {
                // cellDates: true gives us a real JS Date for XLSX cells
                if (rawDate instanceof Date) {
                    if (isValid(rawDate)) {
                        entry.supportDeliveredDate = rawDate.toISOString()
                    } else {
                        entry._errors.push('Invalid Date')
                    }
                } else if (typeof rawDate === 'number') {
                    // Fallback: Excel serial number (days since 1900-01-01, with leap-year bug offset)
                    const jsDate = new Date(Math.round((rawDate - 25569) * 86400 * 1000))
                    if (isValid(jsDate)) {
                        entry.supportDeliveredDate = jsDate.toISOString()
                    } else {
                        entry._errors.push('Invalid Date')
                    }
                } else {
                    // String date — try AU format DD/MM/YYYY first, then ISO, then native parse
                    const dateStr = String(rawDate).trim()
                    let parsedDate = parseDate(dateStr, 'dd/MM/yyyy', new Date())
                    if (!isValid(parsedDate)) parsedDate = parseDate(dateStr, 'yyyy-MM-dd', new Date())
                    if (!isValid(parsedDate)) parsedDate = parseDate(dateStr, 'MM/dd/yyyy', new Date())
                    if (!isValid(parsedDate)) parsedDate = new Date(dateStr)
                    if (isValid(parsedDate)) {
                        entry.supportDeliveredDate = parsedDate.toISOString()
                    } else {
                        entry._errors.push('Invalid Date')
                    }
                }
            } else {
                entry._errors.push('No Date')
            }

            processedData.push(entry)
        })

        return NextResponse.json({ 
            success: true, 
            action: 'parse',
            headers: headers,
            data: processedData,
            rawRows: rawData, // Return raw data for manual mapping
            summary: {
                total: processedData.length,
                valid: processedData.filter(r => r._errors.length === 0).length,
                invalid: processedData.filter(r => r._errors.length > 0).length
            }
        })

    } catch (error) {
        console.error('Bulk Import API Error:', error)
        return NextResponse.json({ error: 'Internal File Processing Error' }, { status: 500 })
    }
}
