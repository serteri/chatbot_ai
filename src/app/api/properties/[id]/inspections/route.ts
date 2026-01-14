import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

interface InspectionTime {
    id: string
    date: string        // YYYY-MM-DD
    startTime: string   // HH:mm
    endTime: string     // HH:mm
    notes?: string
}

// GET - Fetch inspection times for a property
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        const property = await prisma.property.findUnique({
            where: { id },
            select: {
                id: true,
                title: true,
                inspectionTimes: true,
                nextInspection: true,
                chatbot: {
                    select: { userId: true }
                }
            }
        })

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        // Check ownership
        if (property.chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        return NextResponse.json({
            inspectionTimes: property.inspectionTimes || [],
            nextInspection: property.nextInspection
        })
    } catch (error) {
        console.error('Error fetching inspections:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// POST - Add or update inspection times
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { inspectionTimes } = body as { inspectionTimes: InspectionTime[] }

        // Validate input
        if (!Array.isArray(inspectionTimes)) {
            return NextResponse.json({ error: 'inspectionTimes must be an array' }, { status: 400 })
        }

        // Validate each inspection time
        for (const time of inspectionTimes) {
            if (!time.date || !time.startTime || !time.endTime) {
                return NextResponse.json({ error: 'Each inspection must have date, startTime, and endTime' }, { status: 400 })
            }
        }

        const property = await prisma.property.findUnique({
            where: { id },
            select: {
                id: true,
                chatbot: { select: { userId: true } }
            }
        })

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        if (property.chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        // Calculate next inspection (first upcoming date)
        const now = new Date()
        let nextInspection: Date | null = null

        for (const time of inspectionTimes) {
            const inspectionDate = new Date(`${time.date}T${time.startTime}:00`)
            if (inspectionDate > now) {
                if (!nextInspection || inspectionDate < nextInspection) {
                    nextInspection = inspectionDate
                }
            }
        }

        // Add IDs to inspection times if not present
        const inspectionTimesWithIds = inspectionTimes.map((time, index) => ({
            ...time,
            id: time.id || `insp_${Date.now()}_${index}`
        }))

        const updatedProperty = await prisma.property.update({
            where: { id },
            data: {
                inspectionTimes: inspectionTimesWithIds,
                nextInspection
            },
            select: {
                id: true,
                inspectionTimes: true,
                nextInspection: true
            }
        })

        return NextResponse.json({
            success: true,
            inspectionTimes: updatedProperty.inspectionTimes,
            nextInspection: updatedProperty.nextInspection
        })
    } catch (error) {
        console.error('Error updating inspections:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}

// DELETE - Remove an inspection time
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const { searchParams } = new URL(request.url)
        const inspectionId = searchParams.get('inspectionId')

        if (!inspectionId) {
            return NextResponse.json({ error: 'inspectionId is required' }, { status: 400 })
        }

        const property = await prisma.property.findUnique({
            where: { id },
            select: {
                id: true,
                inspectionTimes: true,
                chatbot: { select: { userId: true } }
            }
        })

        if (!property) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        if (property.chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const currentTimes = (property.inspectionTimes as InspectionTime[]) || []
        const filteredTimes = currentTimes.filter(t => t.id !== inspectionId)

        // Recalculate next inspection
        const now = new Date()
        let nextInspection: Date | null = null

        for (const time of filteredTimes) {
            const inspectionDate = new Date(`${time.date}T${time.startTime}:00`)
            if (inspectionDate > now) {
                if (!nextInspection || inspectionDate < nextInspection) {
                    nextInspection = inspectionDate
                }
            }
        }

        await prisma.property.update({
            where: { id },
            data: {
                inspectionTimes: filteredTimes,
                nextInspection
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting inspection:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
