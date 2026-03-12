import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import * as XLSX from 'xlsx'
import { parse as parseDate, isValid } from 'date-fns'

// ─── Header aliases ────────────────────────────────────────────────────────────
const HEADER_MAP: Record<string, string[]> = {
    participantName:        ['participant name', 'participant', 'name', 'client name', 'full name'],
    participantNdisNumber:  ['ndis number', 'ndis no', 'participantid', 'ndis id', 'ndis #', 'ndis'],
    supportItemNumber:      ['support item', 'support item number', 'support item no', 'item code', 'support ite'],
    supportDeliveredDate:   ['date', 'support date', 'service date', 'activity date'],
    quantityDelivered:      ['quantity', 'hours', 'qty', 'units'],
    unitPrice:              ['unitprice', 'unit price', 'price', 'rate'],
}

// Positional fallback: columns A-F when zero headers matched
const INDEX_FALLBACK = [
    'participantName',
    'participantNdisNumber',
    'supportItemNumber',
    'supportDeliveredDate',
    'quantityDelivered',
    'unitPrice',
]

/**
 * Aggressively normalise a raw cell header so BOM, non-breaking spaces,
 * and random punctuation never cause a mismatch.
 */
function normaliseHeader(raw: any): string {
    return String(raw)
        .replace(/^\uFEFF/, '')          // strip BOM
        .replace(/[\u00A0\u200B\u202F]/g, ' ')  // non-breaking / zero-width spaces → regular space
        .replace(/[^a-zA-Z0-9 ]/g, ' ') // anything that is not alphanumeric or space → space
        .replace(/\s+/g, ' ')           // collapse multiple spaces
        .trim()
        .toLowerCase()
}

function findMappedKey(normalisedHeader: string): string | null {
    for (const [field, aliases] of Object.entries(HEADER_MAP)) {
        if (aliases.includes(normalisedHeader)) return field
    }
    return null
}

function cleanNumber(v: any): number {
    return parseFloat(String(v ?? '').replace(/[$,\s]/g, ''))
}

function parseAnyDate(v: any): string | null {
    if (v instanceof Date) {
        return isValid(v) ? v.toISOString() : null
    }
    if (typeof v === 'number') {
        // Excel serial date
        const d = new Date(Math.round((v - 25569) * 86400 * 1000))
        return isValid(d) ? d.toISOString() : null
    }
    const s = String(v).trim()
    const formats = ['dd/MM/yyyy', 'yyyy-MM-dd', 'MM/dd/yyyy', 'd/M/yyyy', 'dd-MM-yyyy']
    for (const fmt of formats) {
        const p = parseDate(s, fmt, new Date())
        if (isValid(p)) return p.toISOString()
    }
    const fallback = new Date(s)
    return isValid(fallback) ? fallback.toISOString() : null
}

// ─── POST ──────────────────────────────────────────────────────────────────────
export async function POST(req: Request) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await req.formData()
        const action = (formData.get('action') as string) || 'parse'

        // ── COMMIT ────────────────────────────────────────────────────────────
        if (action === 'commit') {
            const claimsData = JSON.parse(formData.get('data') as string)
            if (!Array.isArray(claimsData) || claimsData.length === 0) {
                return NextResponse.json({ error: 'No data to commit' }, { status: 400 })
            }

            const dataToInsert = claimsData.map((c: any) => {
                const qty   = cleanNumber(c.quantityDelivered)
                const price = cleanNumber(c.unitPrice)
                return {
                    userId:                session.user.id,
                    participantName:       String(c.participantName).trim(),
                    participantNdisNumber: String(c.participantNdisNumber).trim(),
                    supportItemNumber:     String(c.supportItemNumber).trim(),
                    supportDeliveredDate:  new Date(c.supportDeliveredDate),
                    quantityDelivered:     qty,
                    unitPrice:             price,
                    totalClaimAmount:      qty * price,
                    status:                'draft',
                }
            })

            await prisma.claim.createMany({ data: dataToInsert })
            return NextResponse.json({ success: true, count: dataToInsert.length })
        }

        // ── PARSE ─────────────────────────────────────────────────────────────
        const file = formData.get('file') as File
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        console.log(`[BULK IMPORT] File received: "${file.name}" (${file.size} bytes)`)

        const buffer = await file.arrayBuffer()

        // Always use XLSX — it handles real CSV, UTF-16 CSV, XLS, and XLSX.
        // Never use file.text() for binary formats from WPS/Excel.
        const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: true })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]

        // Step 1: read everything as raw arrays so we control key normalisation
        const allRows: any[][] = XLSX.utils.sheet_to_json(firstSheet, {
            header:   1,
            defval:   '',
            cellDates: true,
        })

        console.log(`[BULK IMPORT] Total rows in sheet (incl. header): ${allRows.length}`)
        console.log('RAW HEADERS FOUND:', allRows[0])

        if (allRows.length < 2) {
            return NextResponse.json({ error: 'File is empty or has no data rows' }, { status: 400 })
        }

        // Step 2: normalise headers — this is the single source of truth for ALL key lookups
        const rawHeaderRow: any[]  = allRows[0]
        const headers: string[]    = rawHeaderRow
            .map(normaliseHeader)
            .filter(h => h !== '')

        console.log(`[BULK IMPORT] Normalised headers:`, headers)

        // Step 3: build rawData rows with the same normalised keys
        // This guarantees row[header] lookups always succeed on the frontend too.
        const rawData: any[] = allRows.slice(1).map(rowArr => {
            const obj: any = {}
            rawHeaderRow.forEach((origKey: any, i: number) => {
                const normKey = normaliseHeader(String(origKey))
                if (normKey) obj[normKey] = rowArr[i]
            })
            return obj
        }).filter(row =>
            // drop entirely empty rows
            Object.values(row).some(v => v !== '' && v !== null && v !== undefined)
        )

        console.log(`[BULK IMPORT] Data rows after empty-row filter: ${rawData.length}`)

        if (rawData.length === 0) {
            return NextResponse.json({ error: 'File has no data rows' }, { status: 400 })
        }

        // Step 4: auto-map normalised headers to field keys
        const autoMapping: Record<string, string> = {}  // field → normalisedHeader
        headers.forEach(h => {
            const field = findMappedKey(h)
            if (field && !autoMapping[field]) autoMapping[field] = h
        })

        console.log(`[BULK IMPORT] Auto-mapping result:`, autoMapping)

        // Step 5: decide whether to use index fallback
        const mappedFieldCount = Object.keys(autoMapping).length
        const useIndexFallback  = mappedFieldCount === 0 && headers.length >= 6
        if (useIndexFallback) {
            console.log(`[BULK IMPORT] No headers matched — applying A-F index fallback`)
        }

        // Step 6: build returnMapping (normalisedHeader → fieldKey) for consistent frontend init
        const headerToField: Record<string, string> = {}
        Object.entries(autoMapping).forEach(([field, header]) => {
            headerToField[header] = field
        })

        // Step 7: process each row
        const processedData: any[] = rawData.map((row, index) => {
            const entry: any = { _originalRow: index + 2, _errors: [] }

            if (useIndexFallback) {
                // Positional mapping: column 0 = Name, 1 = NDIS, …, 5 = Price
                const rowValues = Object.values(row)
                INDEX_FALLBACK.forEach((field, i) => {
                    if (i < rowValues.length) {
                        let val: any = rowValues[i]
                        if (typeof val === 'string') val = val.trim()
                        if (field === 'unitPrice' || field === 'quantityDelivered') {
                            if (typeof val === 'string') val = val.replace(/[$,\s]/g, '')
                        }
                        entry[field] = val
                    }
                })
            } else {
                Object.entries(autoMapping).forEach(([field, normHeader]) => {
                    let val = row[normHeader]
                    if (typeof val === 'string') {
                        val = val.trim()
                        if (field === 'unitPrice' || field === 'quantityDelivered') {
                            val = val.replace(/[$,\s]/g, '')
                        }
                    }
                    entry[field] = val
                })
            }

            // ── Validation ───────────────────────────────────────────────────
            if (!entry.participantName)       entry._errors.push('Missing Name')
            if (!entry.participantNdisNumber) entry._errors.push('Missing NDIS ID')
            if (!entry.supportItemNumber)     entry._errors.push('Missing Item Code')

            const price = cleanNumber(entry.unitPrice)
            if (isNaN(price)) {
                entry._errors.push('Invalid Price')
            } else if (price > 10000) {
                entry._errors.push(`Extreme Price: $${price.toLocaleString()}`)
            }

            const qty = cleanNumber(entry.quantityDelivered)
            if (isNaN(qty)) entry._errors.push('Invalid Qty')

            // ── Date ─────────────────────────────────────────────────────────
            const iso = parseAnyDate(entry.supportDeliveredDate)
            if (iso) {
                entry.supportDeliveredDate = iso
            } else if (entry.supportDeliveredDate !== undefined && entry.supportDeliveredDate !== '') {
                entry._errors.push('Invalid Date')
            } else {
                entry._errors.push('No Date')
            }

            return entry
        })

        const summary = {
            total:   processedData.length,
            valid:   processedData.filter(r => r._errors.length === 0).length,
            invalid: processedData.filter(r => r._errors.length > 0).length,
        }

        console.log(`[BULK IMPORT] Summary:`, summary)

        return NextResponse.json({
            success: true,
            action:  'parse',
            headers,          // normalised — safe for dropdown display
            autoMapping,      // field → normalisedHeader (for frontend initial selection)
            data:     processedData,
            rawRows:  rawData, // rows with normalised keys — safe for re-mapping on client
            summary,
        })

    } catch (error) {
        console.error('[BULK IMPORT] Fatal error:', error)
        return NextResponse.json({ error: 'Internal file processing error' }, { status: 500 })
    }
}
