import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { sendAppointmentConfirmation } from '@/lib/sms/notifications'

// Validation schema for appointment
const appointmentSchema = z.object({
    identifier: z.string(), // Chatbot identifier (for public API)
    leadId: z.string().optional(),
    propertyId: z.string().optional(),
    date: z.string(), // ISO date string
    time: z.string(), // HH:MM format
    name: z.string().min(1),
    phone: z.string().min(1),
    email: z.string().email().optional().or(z.literal('')),
    notes: z.string().optional(),
    type: z.enum(['viewing', 'open-house', 'consultation', 'valuation']).default('viewing')
})

// POST - Create appointment (public API for widget)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const validatedData = appointmentSchema.parse(body)

        // Find chatbot by identifier
        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier: validatedData.identifier },
            select: {
                id: true,
                name: true,
                customSettings: true,
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Find or create lead
        let leadId = validatedData.leadId

        if (!leadId) {
            // Check if lead exists with same phone in last 7 days
            const existingLead = await prisma.lead.findFirst({
                where: {
                    chatbotId: chatbot.id,
                    phone: validatedData.phone,
                    createdAt: {
                        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    }
                }
            })

            if (existingLead) {
                leadId = existingLead.id
            } else {
                // Create new lead
                const newLead = await prisma.lead.create({
                    data: {
                        chatbotId: chatbot.id,
                        name: validatedData.name,
                        phone: validatedData.phone,
                        email: validatedData.email || null,
                        intent: 'buy',
                        score: 50, // Warm lead (took action to book)
                        category: 'warm',
                        source: 'appointment-booking',
                        status: 'new'
                    }
                })
                leadId = newLead.id
            }
        }

        // Parse date
        const appointmentDate = new Date(validatedData.date)

        // Update lead with appointment info
        const updatedLead = await prisma.lead.update({
            where: { id: leadId },
            data: {
                appointmentDate,
                appointmentTime: validatedData.time,
                appointmentNote: validatedData.notes || `${validatedData.type} appointment`,
                status: 'appointment-scheduled',
                updatedAt: new Date()
            }
        })

        // Send confirmation SMS to customer
        const settings = (chatbot.customSettings as any) || {}
        const agentName = settings.agentName || chatbot.user?.name || 'Danışmanımız'

        const dateStr = appointmentDate.toLocaleDateString('tr-TR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long'
        })

        await sendAppointmentConfirmation(
            validatedData.phone,
            validatedData.name,
            dateStr,
            validatedData.time,
            agentName,
            chatbot.id
        ).catch(err => console.error('Failed to send appointment confirmation:', err))

        return NextResponse.json({
            success: true,
            appointment: {
                leadId: updatedLead.id,
                date: appointmentDate,
                time: validatedData.time,
                type: validatedData.type,
                status: 'confirmed'
            },
            message: 'Appointment booked successfully'
        }, { status: 201 })

    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
        }
        console.error('Error creating appointment:', error)
        return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }
}

// GET - Get available slots for a chatbot
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const identifier = searchParams.get('identifier')
        const date = searchParams.get('date') // Optional: specific date

        if (!identifier) {
            return NextResponse.json({ error: 'Chatbot identifier is required' }, { status: 400 })
        }

        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier },
            select: {
                id: true,
                customSettings: true
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        const settings = (chatbot.customSettings as any) || {}

        // Get configured slots or use defaults
        const defaultSlots = generateDefaultSlots()
        const configuredSlots = settings.appointmentSlots || defaultSlots

        // Get booked appointments to filter out
        const startDate = date ? new Date(date) : new Date()
        const endDate = new Date(startDate)
        endDate.setDate(endDate.getDate() + 7) // Next 7 days

        const bookedAppointments = await prisma.lead.findMany({
            where: {
                chatbotId: chatbot.id,
                appointmentDate: {
                    gte: startDate,
                    lte: endDate
                },
                status: { in: ['appointment-scheduled', 'contacted'] }
            },
            select: {
                appointmentDate: true,
                appointmentTime: true
            }
        })

        // Filter out booked slots
        const bookedSet = new Set(
            bookedAppointments.map(a =>
                `${a.appointmentDate?.toISOString().split('T')[0]}_${a.appointmentTime}`
            )
        )

        const availableSlots = configuredSlots
            .map((slot: any) => ({
                ...slot,
                available: !bookedSet.has(`${slot.date}_${slot.time}`)
            }))
            .filter((slot: any) => new Date(slot.date) >= new Date())

        return NextResponse.json({
            slots: availableSlots,
            settings: {
                allowInstantBooking: settings.allowInstantBooking ?? true,
                requireApproval: settings.requireAppointmentApproval ?? false,
                maxAdvanceDays: settings.maxAdvanceDays ?? 14
            }
        })

    } catch (error) {
        console.error('Error fetching available slots:', error)
        return NextResponse.json({ error: 'Failed to fetch available slots' }, { status: 500 })
    }
}

// Generate default appointment slots for the next 7 days
function generateDefaultSlots() {
    const slots = []
    const today = new Date()

    for (let i = 0; i < 7; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() + i)

        const dayOfWeek = date.getDay()
        const dateStr = date.toISOString().split('T')[0]

        // Different slots for different days
        if (dayOfWeek === 0) {
            // Sunday - no appointments
            continue
        } else if (dayOfWeek === 6) {
            // Saturday - Open House slots
            slots.push(
                { date: dateStr, time: '10:00', label: 'Open House', type: 'open-house' },
                { date: dateStr, time: '11:00', label: 'Open House', type: 'open-house' },
                { date: dateStr, time: '14:00', label: 'Özel Gösterim', type: 'viewing' },
                { date: dateStr, time: '15:00', label: 'Özel Gösterim', type: 'viewing' }
            )
        } else {
            // Weekdays
            slots.push(
                { date: dateStr, time: '10:00', label: 'Sabah', type: 'viewing' },
                { date: dateStr, time: '11:00', label: 'Sabah', type: 'viewing' },
                { date: dateStr, time: '14:00', label: 'Öğleden Sonra', type: 'viewing' },
                { date: dateStr, time: '15:00', label: 'Öğleden Sonra', type: 'viewing' },
                { date: dateStr, time: '16:00', label: 'Akşam', type: 'viewing' }
            )
        }
    }

    return slots
}
