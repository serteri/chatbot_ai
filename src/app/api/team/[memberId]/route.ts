import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function DELETE(
    request: NextRequest,
    { params }: { params: { memberId: string } }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { memberId } = params

        // Silmeye çalıştığımız üye bizim tarafımızdan mı eklenmiş?
        const member = await prisma.teamMember.findUnique({
            where: { id: memberId },
            select: { invitedBy: true }
        })

        if (!member) {
            return NextResponse.json({ error: 'Member not found' }, { status: 404 })
        }

        if (member.invitedBy !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        await prisma.teamMember.delete({
            where: { id: memberId }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Delete Team Member Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
