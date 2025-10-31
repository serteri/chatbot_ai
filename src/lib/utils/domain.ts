/**
 * Domain Validation Utilities
 */

export function isDomainAllowed(
    origin: string | null,
    allowedDomains: string[],
    isDevelopment: boolean = process.env.NODE_ENV === 'development'
): boolean {
    if (isDevelopment) {
        if (!origin ||
            origin.includes('localhost') ||
            origin.includes('127.0.0.1')) {
            return true
        }
    }

    if (!origin) return false

    try {
        const url = new URL(origin)
        const hostname = url.hostname

        if (allowedDomains.length === 0) return true

        return allowedDomains.some(allowed => {
            const normalizedAllowed = allowed.toLowerCase().trim()
            const normalizedHostname = hostname.toLowerCase()

            if (normalizedHostname === normalizedAllowed) return true

            if (normalizedAllowed.startsWith('*.')) {
                const domain = normalizedAllowed.slice(2)
                return normalizedHostname.endsWith(`.${domain}`) ||
                    normalizedHostname === domain
            }

            return normalizedHostname.endsWith(`.${normalizedAllowed}`)
        })
    } catch {
        return false
    }
}

export function validateDomainFormat(domain: string): {
    valid: boolean
    error?: string
} {
    if (!domain || !domain.trim()) {
        return { valid: false, error: 'Domain boş olamaz' }
    }

    const normalized = domain.toLowerCase().trim()

    if (normalized.includes('://')) {
        return { valid: false, error: 'Protocol eklemeyin' }
    }

    if (normalized.includes(':')) {
        return { valid: false, error: 'Port numarası eklemeyin' }
    }

    const domainRegex = /^(\*\.)?([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/

    if (!domainRegex.test(normalized)) {
        return { valid: false, error: 'Geçersiz domain formatı' }
    }

    return { valid: true }
}