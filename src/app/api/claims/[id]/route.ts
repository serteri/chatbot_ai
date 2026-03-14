import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { 
            status, 
            participantName, 
            participantNdisNumber, 
            supportItemNumber, 
            totalClaimAmount 
        } = await req.json()
        const claimId = id


        console.log('📝 Update Claim Request:', { claimId, status, totalClaimAmount })

        // Ensure claim belongs to user
        const claim = await prisma.claim.findUnique({
            where: { id: claimId }
        })

        if (!claim || claim.userId !== session.user.id) {
            console.error('❌ Claim not found or unauthorized:', { claimId, userId: session.user.id })
            return NextResponse.json({ error: 'Claim not found or unauthorized' }, { status: 404 })
        }

        const updatedClaim = await prisma.claim.update({
            where: { id: claimId.toString() }, // Explicitly ensure string
            data: {
                status: 'VERIFIED' as any, // Enforce exact Enum value
                participantName,
                participantNdisNumber,
                supportItemNumber,
                totalAmount: typeof totalClaimAmount === 'number' ? totalClaimAmount : parseFloat(totalClaimAmount?.toString() || '0'), // Map to schema field if renamed, but usually totalClaimAmount
                totalClaimAmount: typeof totalClaimAmount === 'number' ? totalClaimAmount : parseFloat(totalClaimAmount?.toString() || '0'), 
                updatedBy: session.user.id || session.user.email, // Use unique ID for audit trail
                updatedAt: new Date(),
            }
        })

        console.log('✅ Claim Updated successfully:', updatedClaim.id)
        return NextResponse.json(updatedClaim)
    } catch (error) {
        console.error('❌ Failed to update claim:', error)
        return NextResponse.json({ 
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id: claimId } = await context.params
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Ensure claim belongs to user
        const claim = await prisma.claim.findUnique({
            where: { id: claimId }
        })


        if (!claim || claim.userId !== session.user.id) {
            return NextResponse.json({ error: 'Claim not found or unauthorized' }, { status: 404 })
        }

        await prisma.claim.delete({
            where: { id: claimId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Failed to delete claim:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
