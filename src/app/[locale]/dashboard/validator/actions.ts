'use server'

import { createAuditLog } from '@/lib/services/audit'
import { auth } from '@/lib/auth/auth'

export async function logValidatorPageView() {
    try {
        const session = await auth()
        const actorId = session?.user?.id ?? 'anonymous'
        await createAuditLog({
            action: 'VALIDATOR_PAGE_VIEWED',
            actorId,
        })
    } catch {
        // Fail silently — audit must never block page render
    }
}

export async function logDocumentUploadAttempt(fileName: string) {
    try {
        const session = await auth()
        const actorId = session?.user?.id ?? 'anonymous'
        await createAuditLog({
            action: 'DOCUMENT_UPLOAD_ATTEMPT',
            actorId,
            metadata: { fileName },
        })
    } catch {
        // Fail silently
    }
}

export async function logPdfExport() {
    try {
        const session = await auth()
        const actorId = session?.user?.id ?? 'anonymous'
        await createAuditLog({
            action: 'PDF_DOCUMENT_EXPORTED', // Custom string OK since AuditAction takes string
            actorId,
            metadata: { format: 'PDF', sovereignty: 'AU-East' },
        })
    } catch {
        // Fail silently
    }
}
