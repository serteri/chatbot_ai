import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { testCRMConnection } from '@/lib/crm/webhook'

// GET - Fetch CRM settings for a chatbot
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ chatbotId: string }> }
) {
    try {
        const session = await auth()
        const { chatbotId } = await params

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId },
            select: { userId: true, customSettings: true }
        })

        if (!chatbot || chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const settings = (chatbot.customSettings as any) || {}
        return NextResponse.json({
            crmIntegration: settings.crmIntegration || {
                enabled: false,
                provider: 'generic',
                webhookUrl: '',
                apiKey: '',
            }
        })
    } catch (error) {
        console.error('CRM settings GET error:', error)
        return NextResponse.json({ error: 'Failed to fetch CRM settings' }, { status: 500 })
    }
}

// POST - Update CRM settings
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ chatbotId: string }> }
) {
    try {
        const session = await auth()
        const { chatbotId } = await params

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId },
            select: { userId: true, customSettings: true }
        })

        if (!chatbot || chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const body = await request.json()
        const { crmIntegration } = body

        // Validate required fields based on provider
        if (crmIntegration?.enabled) {
            if (crmIntegration.provider === 'generic' && !crmIntegration.webhookUrl) {
                return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 })
            }
            if (crmIntegration.provider === 'rex') {
                if (!crmIntegration.rexConfig?.subdomain || !crmIntegration.rexConfig?.token) {
                    return NextResponse.json({ error: 'Rex subdomain and token are required' }, { status: 400 })
                }
            }
            if (crmIntegration.provider === 'reapit') {
                const rc = crmIntegration.reapitConfig
                if (!rc?.clientId || !rc?.clientSecret || !rc?.customerId) {
                    return NextResponse.json({ error: 'Reapit client ID, secret, and customer ID are required' }, { status: 400 })
                }
            }
        }

        // Merge with existing customSettings
        const existingSettings = (chatbot.customSettings as any) || {}
        const updatedSettings = {
            ...existingSettings,
            crmIntegration
        }

        await prisma.chatbot.update({
            where: { id: chatbotId },
            data: { customSettings: updatedSettings }
        })

        return NextResponse.json({ success: true, crmIntegration })
    } catch (error) {
        console.error('CRM settings POST error:', error)
        return NextResponse.json({ error: 'Failed to save CRM settings' }, { status: 500 })
    }
}

// PUT - Test CRM connection
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ chatbotId: string }> }
) {
    try {
        const session = await auth()
        const { chatbotId } = await params

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId },
            select: { userId: true, customSettings: true }
        })

        if (!chatbot || chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Not found' }, { status: 404 })
        }

        const result = await testCRMConnection(chatbot)
        return NextResponse.json(result)
    } catch (error) {
        console.error('CRM test error:', error)
        return NextResponse.json({ error: 'Test failed' }, { status: 500 })
    }
}
