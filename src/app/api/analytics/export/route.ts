import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const chatbotId = searchParams.get('chatbotId')
        const format = searchParams.get('format') || 'csv'
        const range = searchParams.get('range') || '30d'

        if (!chatbotId) {
            return NextResponse.json({ error: 'Chatbot ID required' }, { status: 400 })
        }

        // Verify ownership
        const chatbot = await prisma.chatbot.findFirst({
            where: {
                id: chatbotId,
                userId: session.user.id
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Check if user has advanced analytics access
        const subscription = await prisma.subscription.findUnique({
            where: { userId: session.user.id },
            select: { hasAdvancedAnalytics: true, planType: true }
        })

        if (!subscription?.hasAdvancedAnalytics && subscription?.planType !== 'enterprise') {
            return NextResponse.json({ error: 'Advanced Analytics requires Enterprise plan' }, { status: 403 })
        }

        // Calculate date range
        const now = new Date()
        let startDate: Date
        switch (range) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                break
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
                break
            case 'year':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
                break
            default: // 30d
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        }

        // Fetch conversations with messages
        const conversations = await prisma.conversation.findMany({
            where: {
                chatbotId,
                createdAt: { gte: startDate }
            },
            include: {
                messages: {
                    select: {
                        role: true,
                        content: true,
                        createdAt: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Prepare CSV data
        const csvRows: string[] = []
        csvRows.push('Date,Conversation ID,Visitor ID,Messages,Rating,Status,Duration (min)')

        for (const conv of conversations) {
            const duration = conv.endedAt
                ? Math.round((conv.endedAt.getTime() - conv.createdAt.getTime()) / 60000)
                : 0

            csvRows.push([
                conv.createdAt.toISOString().split('T')[0],
                conv.id,
                conv.visitorId,
                conv.messages.length.toString(),
                conv.rating?.toString() || '',
                conv.status,
                duration.toString()
            ].join(','))
        }

        const csvContent = csvRows.join('\n')

        if (format === 'excel') {
            // For Excel, we'll return CSV with proper headers
            // In production, you'd use a library like xlsx
            return new NextResponse(csvContent, {
                headers: {
                    'Content-Type': 'application/vnd.ms-excel',
                    'Content-Disposition': `attachment; filename="analytics-${chatbotId}.xlsx"`
                }
            })
        }

        // CSV format
        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="analytics-${chatbotId}.csv"`
            }
        })
    } catch (error) {
        console.error('Analytics export error:', error)
        return NextResponse.json({ error: 'Export failed' }, { status: 500 })
    }
}
