import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// PATCH - Update application status
export async function PATCH(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()

        // Verify application belongs to user
        const profile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        const application = await prisma.application.findFirst({
            where: {
                id: id,
                studentId: profile.id
            }
        })

        if (!application) {
            return NextResponse.json({ error: 'Application not found' }, { status: 404 })
        }

        // Update application
        const updateData: any = {}

        if (data.status) {
            updateData.status = data.status

            // Set timestamps based on status
            if (data.status === 'submitted' && !application.appliedAt) {
                updateData.appliedAt = new Date()
            }

            if (['accepted', 'rejected', 'waitlisted'].includes(data.status) && !application.decidedAt) {
                updateData.decidedAt = new Date()
            }
        }

        if (data.notes !== undefined) {
            updateData.notes = data.notes
        }

        if (data.documents !== undefined) {
            updateData.documents = data.documents
        }

        const updatedApplication = await prisma.application.update({
            where: { id: id },
            data: updateData,
            include: {
                university: true
            }
        })

        return NextResponse.json({ application: updatedApplication })
    } catch (error) {
        console.error('Application update error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// DELETE - Delete application
export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
        }

        await prisma.application.deleteMany({
            where: {
                id: id,
                studentId: profile.id
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Application delete error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}