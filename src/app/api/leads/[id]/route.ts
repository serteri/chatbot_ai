import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export const dynamic = 'force-dynamic'

// GET - Fetch lead by ID with conversation messages
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

        // Fetch lead with conversation and messages
        const lead = await prisma.lead.findUnique({
            where: { id },
            include: {
                chatbot: {
                    select: {
                        id: true,
                        name: true,
                        userId: true
                    }
                },
                conversation: {
                    include: {
                        messages: {
                            orderBy: { createdAt: 'asc' },
                            take: 100
                        }
                    }
                },
                property: {
                    select: {
                        id: true,
                        title: true,
                        price: true,
                        location: true
                    }
                }
            }
        })

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }

        // Verify ownership
        if (lead.chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        return NextResponse.json({ lead })
    } catch (error) {
        console.error('Error fetching lead:', error)
        return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 })
    }
}
