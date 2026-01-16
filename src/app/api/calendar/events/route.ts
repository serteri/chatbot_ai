import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { google } from 'googleapis'
import { sendAppointmentConfirmation } from '@/lib/sms/notifications'

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

// POST - Create appointment event in Google Calendar
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { identifier, date, time, name, phone, email, notes, type } = body

        if (!identifier || !date || !time || !name || !phone) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // Find chatbot
        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier },
            select: {
                id: true,
                userId: true,
                name: true,
                calendarConnected: true,
                googleCalendarId: true,
                customSettings: true,
                user: {
                    select: { name: true }
                }
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Parse date and time
        let appointmentDate: Date

        // Handle both dd/mm/yyyy and yyyy-mm-dd formats
        if (date.includes('/')) {
            const [day, month, year] = date.split('/')
            appointmentDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
        } else {
            appointmentDate = new Date(date)
        }

        const [hours, minutes] = time.split(':')
        appointmentDate.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        const endDate = new Date(appointmentDate)
        endDate.setHours(endDate.getHours() + 1) // 1 hour appointment

        let googleEventId = null

        // Create event in Google Calendar if connected
        if (chatbot.calendarConnected && chatbot.googleCalendarId) {
            const oauth2Client = await getAuthenticatedClient(chatbot.userId)

            if (oauth2Client) {
                try {
                    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

                    const event = await calendar.events.insert({
                        calendarId: chatbot.googleCalendarId,
                        requestBody: {
                            summary: `Mülk Görüntüleme - ${name}`,
                            description: `Müşteri: ${name}\nTelefon: ${phone}\n${email ? `Email: ${email}\n` : ''}${notes ? `Not: ${notes}` : ''}\n\nRandevu Türü: ${type || 'viewing'}\nChatbot: ${chatbot.name}`,
                            start: {
                                dateTime: appointmentDate.toISOString(),
                                timeZone: 'Europe/Istanbul'
                            },
                            end: {
                                dateTime: endDate.toISOString(),
                                timeZone: 'Europe/Istanbul'
                            },
                            attendees: email ? [{ email }] : undefined,
                            reminders: {
                                useDefault: false,
                                overrides: [
                                    { method: 'email', minutes: 60 },
                                    { method: 'popup', minutes: 30 }
                                ]
                            }
                        }
                    })

                    googleEventId = event.data.id
                } catch (calendarError) {
                    console.error('Failed to create Google Calendar event:', calendarError)
                    // Continue without calendar event
                }
            }
        }

        // Create or update lead
        let lead = await prisma.lead.findFirst({
            where: {
                chatbotId: chatbot.id,
                phone,
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
            }
        })

        if (lead) {
            lead = await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    appointmentDate,
                    appointmentTime: time,
                    appointmentNote: notes || `${type || 'viewing'} appointment`,
                    status: 'appointment-scheduled',
                    name,
                    email: email || lead.email
                }
            })
        } else {
            lead = await prisma.lead.create({
                data: {
                    chatbotId: chatbot.id,
                    name,
                    phone,
                    email: email || null,
                    intent: 'buy',
                    score: 70,
                    category: 'warm',
                    source: 'appointment-booking',
                    status: 'appointment-scheduled',
                    appointmentDate,
                    appointmentTime: time,
                    appointmentNote: notes || `${type || 'viewing'} appointment`
                }
            })
        }

        // Format date for SMS (dd/mm/yyyy)
        const formattedDate = `${appointmentDate.getDate().toString().padStart(2, '0')}/${(appointmentDate.getMonth() + 1).toString().padStart(2, '0')}/${appointmentDate.getFullYear()}`

        const settings = (chatbot.customSettings as any) || {}
        const agentName = settings.agentName || chatbot.user?.name || 'Danışmanımız'

        // Send SMS confirmation
        await sendAppointmentConfirmation(
            phone,
            name,
            formattedDate,
            time,
            agentName,
            chatbot.id
        ).catch(err => console.error('Failed to send SMS:', err))

        return NextResponse.json({
            success: true,
            appointment: {
                leadId: lead.id,
                date: formattedDate,
                time,
                type: type || 'viewing',
                googleEventId
            },
            message: 'Randevu başarıyla oluşturuldu'
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating calendar event:', error)
        return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }
}
