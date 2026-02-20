import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { sendAppointmentReminder } from '@/lib/sms/notifications'

// Appointment Reminder Cron Job
//
// Runs every 15 minutes. Finds appointments happening within the next 60-75 minutes
// and sends SMS reminders to customers.
//
// Setup options:
// - Vercel Cron: Add to vercel.json crons with path "/api/cron/appointment-reminders" and schedule every 15 min
// - External cron: Point cron-job.org or GitHub Actions to this URL
export async function GET(request: NextRequest) {
    try {
        // Verify cron secret (prevent unauthorized calls)
        const authHeader = request.headers.get('authorization')
        const cronSecret = process.env.CRON_SECRET

        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const now = new Date()
        const reminderWindowStart = new Date(now.getTime() + 45 * 60 * 1000) // 45 min from now
        const reminderWindowEnd = new Date(now.getTime() + 75 * 60 * 1000)   // 75 min from now

        console.log(`⏰ Running appointment reminder cron at ${now.toISOString()}`)
        console.log(`   Window: ${reminderWindowStart.toISOString()} to ${reminderWindowEnd.toISOString()}`)

        // Find appointments in the reminder window that haven't sent reminders yet
        const upcomingAppointments = await prisma.lead.findMany({
            where: {
                appointmentDate: {
                    gte: reminderWindowStart,
                    lte: reminderWindowEnd
                },
                status: 'appointment-scheduled',
                phone: { not: '' }
            },
            include: {
                chatbot: {
                    select: {
                        name: true,
                        language: true,
                        customSettings: true
                    }
                }
            }
        })

        console.log(`   Found ${upcomingAppointments.length} appointments needing reminders`)

        let sent = 0
        let failed = 0

        for (const lead of upcomingAppointments) {
            // Check if reminder was already sent (stored in requirements.reminderSent)
            const requirements = (lead.requirements as any) || {}
            if (requirements.reminderSent) {
                console.log(`   ⏭️ Skipping ${lead.name} - reminder already sent`)
                continue
            }

            try {
                // Send SMS reminder
                await sendAppointmentReminder(
                    lead.id,
                    lead.appointmentDate!,
                    lead.appointmentTime || '10:00'
                )

                // Mark reminder as sent
                await prisma.lead.update({
                    where: { id: lead.id },
                    data: {
                        requirements: {
                            ...requirements,
                            reminderSent: true,
                            reminderSentAt: now.toISOString()
                        }
                    }
                })

                sent++
                console.log(`   ✅ Reminder sent to ${lead.name} (${lead.phone})`)
            } catch (error) {
                failed++
                console.error(`   ❌ Failed to send reminder to ${lead.name}:`, error)
            }
        }

        return NextResponse.json({
            success: true,
            timestamp: now.toISOString(),
            found: upcomingAppointments.length,
            sent,
            failed
        })

    } catch (error) {
        console.error('Error in appointment reminder cron:', error)
        return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
    }
}
