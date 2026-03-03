import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

// ---------------------------------------------------------------------------
// NDIS Audit Trail Engine
// ---------------------------------------------------------------------------
// Server-side only. Every sensitive action in the platform is logged to the
// AuditLog table for NDIA compliance. This function is designed to NEVER
// crash the calling operation — errors are caught and logged to console.
// ---------------------------------------------------------------------------

/** Supported audit actions. Extend as the platform grows. */
export type AuditAction =
    | 'LOGIN'
    | 'LOGOUT'
    | 'CHAT_SESSION_STARTED'
    | 'CHAT_SESSION_ENDED'
    | 'PROMPT_EXECUTED'
    | 'DOCUMENT_UPLOADED'
    | 'DOCUMENT_VIEWED'
    | 'DOCUMENT_DELETED'
    | 'VIEW_PATIENT_DATA'
    | 'EXPORT_REPORT'
    | 'DATA_EXPORT'
    | 'LEAD_CREATED'
    | 'LEAD_UPDATED'
    | 'SETTINGS_CHANGED'
    | 'USER_INVITED'
    | 'SUBSCRIPTION_CHANGED'

/** Resource types that can be referenced in an audit log entry. */
export type AuditResourceType =
    | 'Conversation'
    | 'ConversationMessage'
    | 'Document'
    | 'Chatbot'
    | 'Lead'
    | 'User'
    | 'Subscription'

/** Options accepted by `createAuditLog`. */
export interface CreateAuditLogOptions {
    /** The type of event being recorded. */
    action: AuditAction | string
    /** The ID of the authenticated user performing the action. */
    actorId: string
    /** Optional — the ID of the resource being acted upon. */
    resourceId?: string
    /** Optional — the model/type of the resource (e.g. "Conversation"). */
    resourceType?: AuditResourceType | string
    /** Optional — arbitrary JSON context (patient name, query used, etc.). */
    metadata?: Record<string, unknown>
}

/**
 * Creates an audit log entry in the database.
 *
 * Automatically extracts `ipAddress` and `userAgent` from the incoming
 * request via Next.js `headers()`. Fails silently so downstream operations
 * are never interrupted by an audit write failure.
 *
 * @example
 * ```ts
 * await createAuditLog({
 *   action: 'DOCUMENT_VIEWED',
 *   actorId: session.user.id,
 *   resourceId: document.id,
 *   resourceType: 'Document',
 *   metadata: { documentName: 'NDIS_Plan_2026.pdf' },
 * })
 * ```
 */
export async function createAuditLog(options: CreateAuditLogOptions): Promise<void> {
    const { action, actorId, resourceId, resourceType, metadata } = options

    try {
        // Extract IP and User-Agent from the incoming request headers.
        // `headers()` is async in Next.js 15+/16.
        const headersList = await headers()
        const ipAddress =
            headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            headersList.get('x-real-ip') ??
            null
        const userAgent = headersList.get('user-agent') ?? null

        await prisma.auditLog.create({
            data: {
                action,
                actorId,
                resourceId: resourceId ?? null,
                resourceType: resourceType ?? null,
                metadata: metadata ?? undefined,
                ipAddress,
                userAgent,
            },
        })
    } catch (error) {
        // ⚠️ NEVER throw — audit failures must not crash user operations.
        console.error(
            `[AuditLog] Failed to write audit entry: action=${action} actor=${actorId}`,
            error instanceof Error ? error.message : error
        )
    }
}

/**
 * Batch-create multiple audit log entries in a single transaction.
 * Useful when a single user action triggers multiple auditable events.
 */
export async function createAuditLogBatch(entries: CreateAuditLogOptions[]): Promise<void> {
    try {
        const headersList = await headers()
        const ipAddress =
            headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ??
            headersList.get('x-real-ip') ??
            null
        const userAgent = headersList.get('user-agent') ?? null

        await prisma.$transaction(
            entries.map((entry) =>
                prisma.auditLog.create({
                    data: {
                        action: entry.action,
                        actorId: entry.actorId,
                        resourceId: entry.resourceId ?? null,
                        resourceType: entry.resourceType ?? null,
                        metadata: entry.metadata ?? undefined,
                        ipAddress,
                        userAgent,
                    },
                })
            )
        )
    } catch (error) {
        console.error(
            `[AuditLog] Failed to write batch audit entries (${entries.length} entries)`,
            error instanceof Error ? error.message : error
        )
    }
}
