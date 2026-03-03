'use server'

import { createAuditLog } from '@/lib/services/audit'
import { auth } from '@/lib/auth/auth'

export async function logValidatorPageView() {
    const session = await auth()
    if (!session?.user?.id) return
    await createAuditLog({
        action: 'VALIDATOR_PAGE_VIEWED',
        actorId: session.user.id,
    })
}

export async function logDocumentUploadAttempt(fileName: string) {
    const session = await auth()
    if (!session?.user?.id) return
    await createAuditLog({
        action: 'DOCUMENT_UPLOAD_ATTEMPT',
        actorId: session.user.id,
        metadata: { fileName },
    })
}
