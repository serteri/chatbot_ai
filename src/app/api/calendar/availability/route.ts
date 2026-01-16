import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { google } from 'googleapis'

// Helper to get OAuth2 client with tokens
async function getAuthenticatedClient(userId: string) {
    const account = await prisma.account.findFirst({
        where: {
            userId,
            provider: 'google-calendar'
        }
    })

    if (!account?.access_token) {
        return null
    }

    const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET
    )

    oauth2Client.setCredentials({
        access_token: account.access_token,
        refresh_token: account.refresh_token,
        expiry_date: account.expires_at ? account.expires_at * 1000 : undefined
    })

    // Handle token refresh
    oauth2Client.on('tokens', async (tokens) => {
        if (tokens.access_token) {
            await prisma.account.update({
                where: { id: account.id },
                data: {
                    access_token: tokens.access_token,
                    expires_at: tokens.expiry_date ? Math.floor(tokens.expiry_date / 1000) : null
                }
            })
        }
    })

    return oauth2Client
}

// GET - Get available time slots from Google Calendar
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const identifier = searchParams.get('identifier')
        const daysAhead = parseInt(searchParams.get('days') || '7')

        if (!identifier) {
            return NextResponse.json({ error: 'Chatbot identifier required' }, { status: 400 })
        }

        // Find chatbot and owner
        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier },
            select: {
                id: true,
                userId: true,
                calendarConnected: true,
                googleCalendarId: true,
                customSettings: true
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // If calendar not connected, return hardcoded slots
        if (!chatbot.calendarConnected || !chatbot.googleCalendarId) {
            return NextResponse.json({
                slots: generateDefaultSlots(daysAhead),
                source: 'default'
            })
        }

        // Get authenticated client
        const oauth2Client = await getAuthenticatedClient(chatbot.userId)
        if (!oauth2Client) {
            return NextResponse.json({
                slots: generateDefaultSlots(daysAhead),
                source: 'default'
            })
        }

        // Query Google Calendar for free/busy
        const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

        const now = new Date()
        const timeMin = new Date(now)
        timeMin.setHours(0, 0, 0, 0)
        timeMin.setDate(timeMin.getDate() + 1) // Start from tomorrow

        const timeMax = new Date(timeMin)
        timeMax.setDate(timeMax.getDate() + daysAhead)

        const freeBusyResponse = await calendar.freebusy.query({
            requestBody: {
                timeMin: timeMin.toISOString(),
                timeMax: timeMax.toISOString(),
                timeZone: 'Europe/Istanbul', // TODO: Make configurable
                items: [{ id: chatbot.googleCalendarId }]
            }
        })

        const busySlots = freeBusyResponse.data.calendars?.[chatbot.googleCalendarId]?.busy || []

        // Get business hours from settings or use defaults
        const settings = (chatbot.customSettings as any) || {}
        const businessHours = settings.businessHours || {
            start: 9,  // 09:00
            end: 18,   // 18:00
            slotDuration: 60 // 60 minutes
        }

        // Generate available slots
        const availableSlots = generateAvailableSlots(
            timeMin,
            timeMax,
            busySlots,
            businessHours
        )

        return NextResponse.json({
            slots: availableSlots,
            source: 'google-calendar'
        })

    } catch (error) {
        console.error('Error fetching calendar availability:', error)
        // Fallback to default slots on error
        return NextResponse.json({
            slots: generateDefaultSlots(7),
            source: 'default',
            error: 'Calendar unavailable'
        })
    }
}

// Generate default slots when calendar is not connected
function generateDefaultSlots(daysAhead: number) {
    const slots: any[] = []
    const today = new Date()

    for (let i = 1; i <= daysAhead; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() + i)

        const dayOfWeek = date.getDay()

        // Skip Sunday
        if (dayOfWeek === 0) continue

        const dateStr = formatDateTurkish(date)
        const isoDate = date.toISOString().split('T')[0]

        if (dayOfWeek === 6) {
            // Saturday - limited hours
            slots.push(
                { date: dateStr, isoDate, time: '10:00', label: 'Sabah', type: 'viewing', available: true },
                { date: dateStr, isoDate, time: '11:00', label: 'Sabah', type: 'viewing', available: true },
                { date: dateStr, isoDate, time: '14:00', label: 'Öğleden Sonra', type: 'viewing', available: true }
            )
        } else {
            // Weekdays
            slots.push(
                { date: dateStr, isoDate, time: '10:00', label: 'Sabah', type: 'viewing', available: true },
                { date: dateStr, isoDate, time: '11:00', label: 'Sabah', type: 'viewing', available: true },
                { date: dateStr, isoDate, time: '14:00', label: 'Öğleden Sonra', type: 'viewing', available: true },
                { date: dateStr, isoDate, time: '15:00', label: 'Öğleden Sonra', type: 'viewing', available: true },
                { date: dateStr, isoDate, time: '16:00', label: 'Akşam', type: 'viewing', available: true }
            )
        }
    }

    return slots
}

// Generate available slots based on free/busy data
function generateAvailableSlots(
    startDate: Date,
    endDate: Date,
    busySlots: Array<{ start?: string | null; end?: string | null }>,
    businessHours: { start: number; end: number; slotDuration: number }
) {
    const slots: any[] = []
    const current = new Date(startDate)

    while (current < endDate) {
        const dayOfWeek = current.getDay()

        // Skip Sunday
        if (dayOfWeek !== 0) {
            const dateStr = formatDateTurkish(current)
            const isoDate = current.toISOString().split('T')[0]

            // Generate slots for business hours
            for (let hour = businessHours.start; hour < businessHours.end; hour++) {
                const slotStart = new Date(current)
                slotStart.setHours(hour, 0, 0, 0)

                const slotEnd = new Date(slotStart)
                slotEnd.setMinutes(slotEnd.getMinutes() + businessHours.slotDuration)

                // Check if slot conflicts with busy times
                const isAvailable = !busySlots.some(busy => {
                    if (!busy.start || !busy.end) return false
                    const busyStart = new Date(busy.start)
                    const busyEnd = new Date(busy.end)
                    return slotStart < busyEnd && slotEnd > busyStart
                })

                if (isAvailable) {
                    const timeStr = `${hour.toString().padStart(2, '0')}:00`
                    let label = 'Öğleden Sonra'
                    if (hour < 12) label = 'Sabah'
                    else if (hour >= 17) label = 'Akşam'

                    slots.push({
                        date: dateStr,
                        isoDate,
                        time: timeStr,
                        label,
                        type: 'viewing',
                        available: true
                    })
                }
            }
        }

        current.setDate(current.getDate() + 1)
    }

    return slots
}

// Format date as dd/mm/yyyy for Turkish locale
function formatDateTurkish(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
}
