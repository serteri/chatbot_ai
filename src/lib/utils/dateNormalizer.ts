import { parse, isValid, format } from 'date-fns'

/**
 * Normalizes common NDIS date string formats into an ISO string.
 * Handled formats:
 * - DD/MM/YYYY
 * - YYYY-MM-DD
 * - DD MMMM YYYY
 */
export function normalizeToISO(dateString: string | null | undefined): string | null {
    if (!dateString) return null

    const cleanDate = dateString.trim()

    // 1. Try native parsing (handles YYYY-MM-DD well)
    const nativeDate = new Date(cleanDate)
    if (isValid(nativeDate) && cleanDate.includes('-')) {
        return nativeDate.toISOString()
    }

    // 2. Try DD/MM/YYYY
    const ddMmYyyy = parse(cleanDate, 'dd/MM/yyyy', new Date())
    if (isValid(ddMmYyyy)) {
        return ddMmYyyy.toISOString()
    }

    // 3. Try DD MMMM YYYY (e.g., 15 January 2025)
    const ddMmmmYyyy = parse(cleanDate, 'dd MMMM yyyy', new Date())
    if (isValid(ddMmmmYyyy)) {
        return ddMmmmYyyy.toISOString()
    }

    // If all fail, return null to avoid DB corruption
    return null
}
