import { InternalClaim, ProdaCsvRow } from '@/types/proda'
import { format } from 'date-fns'

/**
 * Transforms an array of internal database claims directly into the PRODA CSV mapped array.
 * Enforces strict NDIS currency standard (always 2 decimals) and Date format rules.
 */
export function transformClaimsToCsvData(claims: InternalClaim[]): ProdaCsvRow[] {
    return claims.map(claim => ({
        RegistrationNumber: claim.agencyRegistrationNumber,
        ParticipantNumber: String(claim.participantNdisNumber).padStart(9, '0'), // NDIS numbers are 9 digits
        SupportNumber: claim.supportItemNumber,
        // NDIS conventionally requires YYYY-MM-DD for their bulk CSV ingestion
        SupportStartDate: format(claim.supportDeliveredDate, 'yyyy-MM-dd'),
        SupportEndDate: format(claim.supportDeliveredDate, 'yyyy-MM-dd'),
        ClaimReference: \`INV-\${claim.id.substring(0, 8).toUpperCase()}\`, // Simple hash for agency cross-referencing
        Quantity: Number(claim.quantityDelivered).toFixed(2),
        UnitPrice: Number(claim.unitPrice).toFixed(2),
        CappedPrice: '',
        ClaimAmount: Number(claim.totalClaimAmount).toFixed(2),
        GSTCode: 'P2', // Assuming GST Free NDIS Support by default
        CancellationReason: claim.cancellationReason || ''
    }))
}

/**
 * Utility to convert an array of JSON objects (ProdaCsvRow) strictly into a comma separated value string.
 * Escapes necessary quotes and builds the headers dynamically.
 */
export function generateProdaCsvString(data: ProdaCsvRow[]): string {
    if (!data || data.length === 0) {
        return ''
    }

    // Extract headers dynamically from the first valid type mapped object structure
    const headers = Object.keys(data[0]) as (keyof ProdaCsvRow)[]
    
    const csvRows = []
    // 1. Push CSV Header Row
    csvRows.push(headers.join(','))

    // 2. Map the data rows securely
    for (const row of data) {
        const values = headers.map(header => {
            const rawValue = row[header]
            // We must escape quotes inherently so PRODA parses successfully if user inputs random quotes
            const escaped = String(rawValue).replace(/"/g, '""')
            // If the field contains a comma or quote naturally string wrap it
            return escaped.includes(',') || escaped.includes('"') ? \`"\${escaped}"\` : escaped
        })
        csvRows.push(values.join(','))
    }

    // Standard string array join with Carriage Return Line Feed `\r\n` necessary for legacy Windows PRODA ingestion
    return csvRows.join('\r\n')
}
