import { InternalClaim, ProdaCsvRow } from '@/types/proda'
import { format } from 'date-fns'
import Papa from 'papaparse'

/**
 * Designed for NDIS Audit Readiness.
 * Transforms an array of internal database claims directly into the rigid PRODA CSV mapping.
 * Enforces strict formatting per NDIS specifications (DD/MM/YYYY dates, no currency symbols).
 */
export function transformClaimsToCsvData(claims: InternalClaim[]): ProdaCsvRow[] {
    return claims.map(claim => ({
        RegistrationNumber: claim.agencyRegistrationNumber,
        ParticipantID: String(claim.participantNdisNumber).padStart(9, '0'),
        SupportItemNumber: claim.supportItemNumber,
        ClaimReference: `INV-${claim.id.substring(0, 8).toUpperCase()}`,
        SupportStartDate: format(claim.supportDeliveredDate, 'dd/MM/yyyy'),
        SupportEndDate: format(claim.supportDeliveredDate, 'dd/MM/yyyy'),
        ServiceBookingNumber: '', // Defaults to blank, normally populated from Service Agreements
        Quantity: Number(claim.quantityDelivered).toString(),
        UnitPrice: Number(claim.unitPrice).toFixed(2), // Strict 2 decimal NDIS format
        ClaimType: 'STAN' // Standard claim type by default
    }))
}

/**
 * Converts the validated array of PRODA objects into a raw CSV string using Papaparse.
 * Ensures strict carriage return line breaks and correct CSV string serialization.
 */
export function generateProdaCsvString(data: ProdaCsvRow[]): string {
    if (!data || data.length === 0) {
        return ''
    }

    // Utilize papaparse for robust, RFC 4180 compliant CSV string generation
    const csvString = Papa.unparse(data, {
        quotes: false,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ",",
        header: true,
        newline: "\r\n", // Windows legacy format often expected by government portals
        skipEmptyLines: false, // Maintain row integrity
        columns: [
            "RegistrationNumber",
            "ParticipantID",
            "SupportItemNumber",
            "ClaimReference",
            "SupportStartDate",
            "SupportEndDate",
            "ServiceBookingNumber",
            "Quantity",
            "UnitPrice",
            "ClaimType"
        ]
    })

    return csvString
}
