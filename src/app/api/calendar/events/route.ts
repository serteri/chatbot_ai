import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { google, calendar_v3 } from 'googleapis'
import { sendAppointmentConfirmation } from '@/lib/sms/notifications'
import { sendAppointmentEmailToAgent, sendAppointmentEmailToCustomer } from '@/lib/email/notifications'
import crypto from 'crypto'

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
        const { identifier, date, time, name, phone, email, notes, type, locale } = body

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
                language: true,
                calendarConnected: true,
                googleCalendarId: true,
                customSettings: true,
                user: {
                    select: {
                        name: true,
                        email: true,
                        emailNotifications: true
                    }
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

        // Check for existing appointment at the same time (slot blocking)
        const existingAppointment = await prisma.lead.findFirst({
            where: {
                chatbotId: chatbot.id,
                appointmentDate: {
                    gte: appointmentDate,
                    lt: endDate
                },
                status: {
                    notIn: ['appointment-cancelled', 'lost']
                }
            }
        })

        if (existingAppointment) {
            return NextResponse.json({
                error: 'Time slot is already booked',
                message: locale === 'tr'
                    ? 'Bu saat dilimi zaten dolu. Lütfen başka bir saat seçin.'
                    : 'This time slot is already booked. Please select a different time.'
            }, { status: 409 })
        }

        // Generate cancellation token
        const cancellationToken = crypto.randomBytes(32).toString('hex')

        let googleEventId = null

        // Create event in Google Calendar if connected
        if (chatbot.calendarConnected && chatbot.googleCalendarId) {
            const oauth2Client = await getAuthenticatedClient(chatbot.userId)

            if (oauth2Client) {
                try {
                    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

                    const summaryText = locale === 'tr' ? `Mülk Görüntüleme - ${name}` : `Property Viewing - ${name}`
                    const descText = locale === 'tr'
                        ? `Müşteri: ${name}\nTelefon: ${phone}\n${email ? `Email: ${email}\n` : ''}${notes ? `Not: ${notes}` : ''}\n\nRandevu Türü: ${type || 'viewing'}\nChatbot: ${chatbot.name}`
                        : `Customer: ${name}\nPhone: ${phone}\n${email ? `Email: ${email}\n` : ''}${notes ? `Notes: ${notes}` : ''}\n\nAppointment Type: ${type || 'viewing'}\nChatbot: ${chatbot.name}`

                    const event = await calendar.events.insert({
                        calendarId: chatbot.googleCalendarId,
                        requestBody: {
                            summary: summaryText,
                            description: descText,
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

        // Store locale + cancellation token in requirements JSON
        const requirementsData = lead?.requirements
            ? { ...(lead.requirements as any), locale: locale || 'en', cancellationToken, googleEventId }
            : { locale: locale || 'en', cancellationToken, googleEventId }

        if (lead) {
            lead = await prisma.lead.update({
                where: { id: lead.id },
                data: {
                    appointmentDate,
                    appointmentTime: time,
                    appointmentNote: notes || `${type || 'viewing'} appointment`,
                    status: 'appointment-scheduled',
                    name,
                    email: email || lead.email,
                    requirements: requirementsData
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
                    appointmentNote: notes || `${type || 'viewing'} appointment`,
                    requirements: requirementsData
                }
            })
        }

        // Format date for SMS (dd/mm/yyyy)
        const formattedDate = `${appointmentDate.getDate().toString().padStart(2, '0')}/${(appointmentDate.getMonth() + 1).toString().padStart(2, '0')}/${appointmentDate.getFullYear()}`

        const settings = (chatbot.customSettings as any) || {}
        const agentName = settings.agentName || chatbot.user?.name || (locale === 'tr' ? 'Danışmanımız' : 'Our Consultant')

        // Customer locale for customer-facing messages
        const customerLocale = locale || 'en'
        // Agent locale from chatbot language
        const agentLocale = chatbot.language || 'tr'

        // Send SMS confirmation to customer (in CUSTOMER language)
        console.log('📱 Sending SMS to customer:', { phone, name, locale: customerLocale })
        await sendAppointmentConfirmation(
            phone,
            name,
            formattedDate,
            time,
            agentName,
            chatbot.id,
            customerLocale
        ).then(() => console.log('✅ SMS sent to customer:', phone))
            .catch(err => console.error('❌ Failed to send SMS:', err))

        // Prepare appointment email data
        const appointmentEmailData = {
            leadName: name,
            leadPhone: phone,
            leadEmail: email || undefined,
            appointmentDate: formattedDate,
            appointmentTime: time,
            agentName,
            chatbotName: chatbot.name,
            type: type || (customerLocale === 'tr' ? 'Mülk Görüntüleme' : 'Property Viewing'),
            locale: customerLocale,
            cancellationToken
        }

        // Send email notification to agent (in AGENT language)
        if (chatbot.user?.email && chatbot.user?.emailNotifications !== false) {
            const agentEmail = settings.notificationEmail || chatbot.user.email
            console.log('📧 Sending appointment email to agent:', agentEmail)
            sendAppointmentEmailToAgent(appointmentEmailData, agentEmail, agentLocale)
                .then(() => console.log('✅ Appointment email sent to agent'))
                .catch(err => console.error('❌ Failed to send appointment email to agent:', err))
        }

        // Send email confirmation to customer (in CUSTOMER language)
        console.log('📧 Customer email provided:', email ? email : 'NO EMAIL PROVIDED')
        if (email) {
            console.log('📧 Sending appointment email to customer:', email, 'locale:', customerLocale)
            sendAppointmentEmailToCustomer(appointmentEmailData, email)
                .then(() => console.log('✅ Appointment email sent to customer:', email))
                .catch(err => console.error('❌ Failed to send appointment email to customer:', err))
        } else {
            console.log('⚠️ No customer email provided, skipping customer email notification')
        }

        return NextResponse.json({
            success: true,
            appointment: {
                leadId: lead.id,
                date: formattedDate,
                time,
                type: type || 'viewing',
                googleEventId
            },
            message: customerLocale === 'tr' ? 'Randevu başarıyla oluşturuldu' : 'Appointment created successfully'
        }, { status: 201 })

    } catch (error) {
        console.error('Error creating calendar event:', error)
        return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }
}

// GET - Fetch appointments from Google Calendar and sync with database
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const identifier = searchParams.get('identifier')
        const sync = searchParams.get('sync') === 'true'

        if (!identifier) {
            return NextResponse.json({ error: 'Missing identifier' }, { status: 400 })
        }

        // Find chatbot
        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier },
            select: {
                id: true,
                userId: true,
                calendarConnected: true,
                googleCalendarId: true
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Get appointments from database
        const dbAppointments = await prisma.lead.findMany({
            where: {
                chatbotId: chatbot.id,
                appointmentDate: { not: null }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                appointmentDate: true,
                appointmentTime: true,
                appointmentNote: true,
                status: true
            },
            orderBy: { appointmentDate: 'asc' }
        })

        // If calendar is connected and sync is requested, fetch from Google Calendar
        if (chatbot.calendarConnected && chatbot.googleCalendarId && sync) {
            const oauth2Client = await getAuthenticatedClient(chatbot.userId)

            if (oauth2Client) {
                try {
                    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

                    // Fetch events from the last 30 days to 30 days in future
                    const now = new Date()
                    const timeMin = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
                    const timeMax = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

                    const response = await calendar.events.list({
                        calendarId: chatbot.googleCalendarId,
                        timeMin: timeMin.toISOString(),
                        timeMax: timeMax.toISOString(),
                        singleEvents: true,
                        orderBy: 'startTime',
                        maxResults: 100
                    })

                    const googleEvents = response.data.items || []

                    // Build a map of Google event IDs that are still active (not cancelled)
                    const activeGoogleEventIds = new Set<string>()
                    const cancelledEventIds = new Set<string>()

                    googleEvents.forEach((event: calendar_v3.Schema$Event) => {
                        if (event.id) {
                            if (event.status === 'cancelled') {
                                cancelledEventIds.add(event.id)
                            } else {
                                activeGoogleEventIds.add(event.id)
                            }
                        }
                    })

                    // Sync: Clear appointments that no longer exist in Google Calendar
                    for (const dbAppt of dbAppointments) {
                        if (dbAppt.appointmentDate) {
                            const apptDate = new Date(dbAppt.appointmentDate)

                            // Only check appointments within our sync time range
                            if (apptDate >= timeMin && apptDate <= timeMax) {
                                const hasMatchingEvent = googleEvents.some((event: calendar_v3.Schema$Event) => {
                                    if (!event.start?.dateTime) return false
                                    const eventDate = new Date(event.start.dateTime)
                                    const timeDiff = Math.abs(eventDate.getTime() - apptDate.getTime())
                                    return timeDiff < 60 * 60 * 1000 && event.status !== 'cancelled'
                                })

                                if (!hasMatchingEvent) {
                                    await prisma.lead.update({
                                        where: { id: dbAppt.id },
                                        data: {
                                            appointmentDate: null,
                                            appointmentTime: null,
                                            status: 'appointment-cancelled',
                                            appointmentNote: `${dbAppt.appointmentNote || ''} [Cancelled from Google Calendar]`
                                        }
                                    })
                                    console.log(`📅 Appointment cancelled for lead ${dbAppt.id} - not found in Google Calendar`)
                                }
                            }
                        }
                    }

                    // Return synced appointments (refresh from database)
                    const syncedAppointments = await prisma.lead.findMany({
                        where: {
                            chatbotId: chatbot.id,
                            appointmentDate: { not: null }
                        },
                        select: {
                            id: true,
                            name: true,
                            phone: true,
                            email: true,
                            appointmentDate: true,
                            appointmentTime: true,
                            appointmentNote: true,
                            status: true
                        },
                        orderBy: { appointmentDate: 'asc' }
                    })

                    return NextResponse.json({
                        appointments: syncedAppointments,
                        synced: true,
                        googleEventsCount: googleEvents.filter((e: calendar_v3.Schema$Event) => e.status !== 'cancelled').length,
                        message: 'Appointments synced with Google Calendar'
                    })

                } catch (calendarError) {
                    console.error('Failed to fetch Google Calendar events:', calendarError)
                    return NextResponse.json({
                        appointments: dbAppointments,
                        synced: false,
                        error: 'Failed to sync with Google Calendar'
                    })
                }
            }
        }

        // Return database appointments without sync
        return NextResponse.json({
            appointments: dbAppointments,
            synced: false,
            count: dbAppointments.length
        })

    } catch (error) {
        console.error('Error fetching calendar events:', error)
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
    }
}
