import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { google } from 'googleapis'

// OAuth2 client setup
function getOAuth2Client() {
    return new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        `${process.env.NEXTAUTH_URL}/api/calendar/callback`
    )
}

// GET - Get calendar connection status and generate OAuth URL
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const chatbotId = searchParams.get('chatbotId')

        if (!chatbotId) {
            return NextResponse.json({ error: 'Chatbot ID required' }, { status: 400 })
        }

        // Check if user owns this chatbot
        const chatbot = await prisma.chatbot.findFirst({
            where: { id: chatbotId, userId: session.user.id },
            select: {
                id: true,
                calendarConnected: true,
                googleCalendarId: true,
                name: true
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Generate OAuth URL for connecting
        const oauth2Client = getOAuth2Client()
        const authUrl = oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/calendar.readonly',
                'https://www.googleapis.com/auth/calendar.events'
            ],
            state: chatbotId, // Pass chatbot ID in state
            prompt: 'consent'
        })

        return NextResponse.json({
            connected: chatbot.calendarConnected,
            calendarId: chatbot.googleCalendarId,
            authUrl
        })

    } catch (error) {
        console.error('Error getting calendar status:', error)
        return NextResponse.json({ error: 'Failed to get calendar status' }, { status: 500 })
    }
}

// POST - Connect calendar (save tokens after OAuth callback)
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { chatbotId, code } = await request.json()

        if (!chatbotId || !code) {
            return NextResponse.json({ error: 'Chatbot ID and code required' }, { status: 400 })
        }

        // Check if user owns this chatbot
        const chatbot = await prisma.chatbot.findFirst({
            where: { id: chatbotId, userId: session.user.id }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Exchange code for tokens
        const oauth2Client = getOAuth2Client()
        const { tokens } = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens)

        // Get user's primary calendar
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
        const calendarList = await calendar.calendarList.list()
        const primaryCalendar = calendarList.data.items?.find(c => c.primary) || calendarList.data.items?.[0]

        if (!primaryCalendar) {
            return NextResponse.json({ error: 'No calendars found' }, { status: 400 })
        }

        // Store tokens in Account table (associated with user)
        // First check if calendar account exists
        const existingAccount = await prisma.account.findFirst({
            where: {
                userId: session.user.id,
                provider: 'google-calendar'
            }
        })

        if (existingAccount) {
            await prisma.account.update({
                where: { id: existingAccount.id },
                data: {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token || existingAccount.refresh_token,
                    expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
                    scope: tokens.scope
                }
            })
        } else {
            await prisma.account.create({
                data: {
                    userId: session.user.id,
                    type: 'oauth',
                    provider: 'google-calendar',
                    providerAccountId: primaryCalendar.id || 'primary',
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null,
                    scope: tokens.scope
                }
            })
        }

        // Update chatbot with calendar info
        await prisma.chatbot.update({
            where: { id: chatbotId },
            data: {
                calendarConnected: true,
                googleCalendarId: primaryCalendar.id
            }
        })

        return NextResponse.json({
            success: true,
            calendarId: primaryCalendar.id,
            calendarName: primaryCalendar.summary
        })

    } catch (error) {
        console.error('Error connecting calendar:', error)
        return NextResponse.json({ error: 'Failed to connect calendar' }, { status: 500 })
    }
}

// DELETE - Disconnect calendar
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const chatbotId = searchParams.get('chatbotId')

        if (!chatbotId) {
            return NextResponse.json({ error: 'Chatbot ID required' }, { status: 400 })
        }

        // Check if user owns this chatbot
        const chatbot = await prisma.chatbot.findFirst({
            where: { id: chatbotId, userId: session.user.id }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Update chatbot to disconnect
        await prisma.chatbot.update({
            where: { id: chatbotId },
            data: {
                calendarConnected: false,
                googleCalendarId: null
            }
        })

        return NextResponse.json({ success: true })

    } catch (error) {
        console.error('Error disconnecting calendar:', error)
        return NextResponse.json({ error: 'Failed to disconnect calendar' }, { status: 500 })
    }
}
