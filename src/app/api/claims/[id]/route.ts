import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { status } = await req.json()
        const claimId = params.id

        // Ensure claim belongs to user
        const claim = await prisma.claim.findUnique({
            where: { id: claimId }
        })

        if (!claim || claim.userId !== session.user.id) {
            return NextResponse.json({ error: 'Claim not found or unauthorized' }, { status: 404 })
        }

        const updatedClaim = await prisma.claim.update({
            where: { id: claimId },
            data: {
                status,
                updatedBy: session.user.name || session.user.email,
                updatedAt: new Date(),
            }
        })

        return NextResponse.json(updatedClaim)
    } catch (error) {
        console.error('Failed to update claim:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const claimId = params.id

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
