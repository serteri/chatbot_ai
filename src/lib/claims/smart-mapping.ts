/**
 * Smart Mapping — suggests support item codes and unit prices from
 * a participant's verified claim history, so providers never have to
 * re-enter the same line-item code for returning participants.
 *
 * Query is lightning-fast thanks to the compound index on
 * (participantNdisNumber, status) added to the Claim table.
 */

import { prisma } from '@/lib/db/prisma'

export interface SmartMappingSuggestion {
    /** NDIS line-item code from the most recent verified claim */
    supportItemNumber: string
    /** AUD unit price from the most recent verified claim */
    unitPrice: number
    /** DB id of the source claim — useful for audit trails */
    sourceClaimId: string
    /** When the source claim was last verified */
    sourceClaimDate: Date
}

/**
 * Returns the most recent VERIFIED claim's supportItemNumber + unitPrice
 * for a given participant, scoped to the authenticated user's org.
 *
 * Returns null when:
 *  - ndisNumber is empty / not provided
 *  - no VERIFIED claims exist yet for this participant
 */
export async function getSmartMappingSuggestion(
    participantNdisNumber: string,
    userId: string
): Promise<SmartMappingSuggestion | null> {
    const ndis = participantNdisNumber?.trim()
    if (!ndis || !userId) return null

    const match = await prisma.claim.findFirst({
        where: {
            userId,
            participantNdisNumber: ndis,
            status: 'VERIFIED',
        },
        orderBy: { updatedAt: 'desc' },
        select: {
            id: true,
            supportItemNumber: true,
            unitPrice: true,
            updatedAt: true,
        },
    })

    if (!match) return null

    return {
        supportItemNumber: match.supportItemNumber,
        unitPrice: match.unitPrice,
        sourceClaimId: match.id,
        sourceClaimDate: match.updatedAt,
    }
}
