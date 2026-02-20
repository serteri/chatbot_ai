import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sendCancellationEmailToAgent } from '@/lib/email/notifications'

// POST - Cancel appointment
export async function POST(request: NextRequest) {
    try {
        const { token } = await request.json()

        if (!token) {
            return NextResponse.json({ error: 'Missing cancellation token' }, { status: 400 })
        }

        // Find the lead with this cancellation token
        // Token is stored in requirements.cancellationToken
        const leads = await prisma.lead.findMany({
            where: {
                appointmentDate: { not: null },
                status: {
                    notIn: ['appointment-cancelled', 'lost']
                }
            },
            include: {
                chatbot: {
                    select: {
                        name: true,
                        language: true,
                        customSettings: true,
                        userId: true,
                        calendarConnected: true,
                        googleCalendarId: true,
                        user: {
                            select: {
                                email: true,
                                name: true,
                                emailNotifications: true
                            }
                        }
                    }
                }
            }
        })

        // Find the matching lead by checking requirements.cancellationToken
        const lead = leads.find(l => {
            const req = l.requirements as any
            return req?.cancellationToken === token
        })

        if (!lead) {
            return NextResponse.json({
                error: 'Invalid or expired cancellation token'
            }, { status: 404 })
        }

        const requirements = lead.requirements as any
        const locale = requirements?.locale || 'en'
        const agentLocale = lead.chatbot?.language || 'tr'

        // Format date for display
        const formattedDate = lead.appointmentDate
            ? `${lead.appointmentDate.getDate().toString().padStart(2, '0')}/${(lead.appointmentDate.getMonth() + 1).toString().padStart(2, '0')}/${lead.appointmentDate.getFullYear()}`
            : ''

        // Cancel the appointment
        await prisma.lead.update({
            where: { id: lead.id },
            data: {
                appointmentDate: null,
                appointmentTime: null,
                status: 'appointment-cancelled',
                appointmentNote: `${lead.appointmentNote || ''} [Cancelled by customer on ${new Date().toISOString()}]`,
                requirements: {
                    ...(lead.requirements as any),
                    cancellationToken: null // Invalidate token
                }
            }
        })

        // Delete Google Calendar event if connected
        if (lead.chatbot.calendarConnected && requirements?.googleEventId) {
            try {
                // Import dynamically to avoid issues
                const { google } = require('googleapis')
                const account = await prisma.account.findFirst({
                    where: {
                        userId: lead.chatbot.userId,
                        provider: 'google-calendar'
                    }
                })

                if (account?.access_token && lead.chatbot.googleCalendarId) {
                    const oauth2Client = new google.auth.OAuth2(
                        process.env.GOOGLE_CLIENT_ID,
                        process.env.GOOGLE_CLIENT_SECRET
                    )
                    oauth2Client.setCredentials({
                        access_token: account.access_token,
                        refresh_token: account.refresh_token
                    })
                    const calendar = google.calendar({ version: 'v3', auth: oauth2Client })
                    await calendar.events.delete({
                        calendarId: lead.chatbot.googleCalendarId,
                        eventId: requirements.googleEventId
                    })
                    console.log(`📅 Deleted Google Calendar event: ${requirements.googleEventId}`)
                }
            } catch (err) {
                console.error('Failed to delete Google Calendar event:', err)
            }
        }

        // Send cancellation email to agent
        if (lead.chatbot.user?.email && lead.chatbot.user?.emailNotifications !== false) {
            const settings = (lead.chatbot.customSettings as any) || {}
            const agentEmail = settings.notificationEmail || lead.chatbot.user.email
            const agentName = settings.agentName || lead.chatbot.user?.name || 'Agent'

            sendCancellationEmailToAgent({
                leadName: lead.name,
                leadPhone: lead.phone,
                leadEmail: lead.email || undefined,
                appointmentDate: formattedDate,
                appointmentTime: lead.appointmentTime || '',
                agentName,
                chatbotName: lead.chatbot.name
            }, agentEmail, agentLocale).catch(err =>
                console.error('Failed to send cancellation email:', err)
            )
        }

        return NextResponse.json({
            success: true,
            message: locale === 'tr' ? 'Randevunuz başarıyla iptal edildi.' : 'Your appointment has been cancelled successfully.',
            appointment: {
                name: lead.name,
                date: formattedDate,
                time: lead.appointmentTime
            }
        })

    } catch (error) {
        console.error('Error cancelling appointment:', error)
        return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 })
    }
}

// GET - Get appointment details by cancellation token
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const token = searchParams.get('token')

        if (!token) {
            return NextResponse.json({ error: 'Missing token' }, { status: 400 })
        }

        const leads = await prisma.lead.findMany({
            where: {
                appointmentDate: { not: null },
                status: {
                    notIn: ['appointment-cancelled', 'lost']
                }
            },
            include: {
                chatbot: {
                    select: {
                        name: true,
                        customSettings: true
                    }
                }
            }
        })

        const lead = leads.find(l => {
            const req = l.requirements as any
            return req?.cancellationToken === token
        })

        if (!lead) {
            return NextResponse.json({
                error: 'Invalid or expired cancellation token'
            }, { status: 404 })
        }

        const requirements = lead.requirements as any
        const settings = (lead.chatbot.customSettings as any) || {}
        const agentName = settings.agentName || 'Agent'

        const formattedDate = lead.appointmentDate
            ? `${lead.appointmentDate.getDate().toString().padStart(2, '0')}/${(lead.appointmentDate.getMonth() + 1).toString().padStart(2, '0')}/${lead.appointmentDate.getFullYear()}`
            : ''

        return NextResponse.json({
            appointment: {
                name: lead.name,
                date: formattedDate,
                time: lead.appointmentTime,
                agentName,
                chatbotName: lead.chatbot.name
            },
            locale: requirements?.locale || 'en'
        })

    } catch (error) {
        console.error('Error fetching appointment:', error)
        return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 })
    }
}
