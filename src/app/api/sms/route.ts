import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// Twilio SMS Client
// Note: Install twilio package: npm install twilio
let twilioClient: any = null

function getTwilioClient() {
    if (!twilioClient) {
        const accountSid = process.env.TWILIO_ACCOUNT_SID
        const authToken = process.env.TWILIO_AUTH_TOKEN

        if (!accountSid || !authToken) {
            console.warn('Twilio credentials not configured')
            return null
        }

        try {
            // Dynamic import to avoid build errors if twilio is not installed
            const twilio = require('twilio')
            twilioClient = twilio(accountSid, authToken)
        } catch (error) {
            console.error('Failed to initialize Twilio client:', error)
            return null
        }
    }
    return twilioClient
}

// SMS types for tracking
type SmsType = 'hot-lead' | 'warm-lead' | 'appointment-reminder' | 'appointment-confirmation' | 'general'

interface SendSmsRequest {
    to: string
    message: string
    type: SmsType
    leadId?: string
    chatbotId?: string
}

// POST - Send SMS (authenticated, for internal use)
export async function POST(request: NextRequest) {
    try {
        // Check if this is an internal server call or authenticated request
        const internalKey = request.headers.get('x-internal-key')
        // Allow internal calls if key matches OR if no key is configured (development mode)
        const isInternalCall = internalKey && (internalKey === process.env.INTERNAL_API_KEY || !process.env.INTERNAL_API_KEY)

        if (!isInternalCall) {
            const session = await auth()
            if (!session?.user?.id) {
                console.log('❌ SMS API: Unauthorized - no session and not internal call')
                return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
            }
        }

        console.log('📱 SMS API called:', { to: (await request.clone().json()).to, isInternalCall })

        const body: SendSmsRequest = await request.json()
        const { to, message, type, leadId, chatbotId } = body

        if (!to || !message) {
            return NextResponse.json({ error: 'Phone number and message are required' }, { status: 400 })
        }

        // Check if SMS is enabled for this chatbot
        if (chatbotId) {
            const chatbot = await prisma.chatbot.findUnique({
                where: { id: chatbotId },
                select: { customSettings: true }
            })

            const settings = (chatbot?.customSettings as any) || {}
            // Only block if SMS notifications are explicitly disabled
            if (settings.smsNotifications === false) {
                return NextResponse.json({
                    success: false,
                    message: 'SMS notifications are disabled for this chatbot'
                }, { status: 200 })
            }
        }

        // Get Twilio client
        const client = getTwilioClient()

        if (!client) {
            // Log the attempt even if Twilio is not configured
            console.log(`[SMS MOCK] To: ${to}, Type: ${type}, Message: ${message}`)

            return NextResponse.json({
                success: false,
                message: 'SMS service not configured. Message logged.',
                mockSent: true,
                details: { to, type, message: message.substring(0, 50) + '...' }
            }, { status: 200 })
        }

        // Format phone number (add country code if missing)
        let formattedPhone = to.replace(/\s/g, '')
        if (!formattedPhone.startsWith('+')) {
            // Default to Turkey (+90) or Australia (+61) based on format
            if (formattedPhone.startsWith('0')) {
                formattedPhone = '+90' + formattedPhone.substring(1) // Turkey
            } else if (formattedPhone.startsWith('4')) {
                formattedPhone = '+61' + formattedPhone // Australia mobile
            } else {
                formattedPhone = '+' + formattedPhone
            }
        }

        // Send SMS via Twilio
        const twilioMessage = await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedPhone
        })

        console.log(`[SMS SENT] SID: ${twilioMessage.sid}, To: ${formattedPhone}, Type: ${type}`)

        // Update lead if this is a lead-related SMS
        if (leadId) {
            await prisma.lead.update({
                where: { id: leadId },
                data: {
                    notes: {
                        set: `SMS sent (${type}): ${new Date().toISOString()}`
                    }
                }
            }).catch(err => console.error('Failed to update lead notes:', err))
        }

        return NextResponse.json({
            success: true,
            messageId: twilioMessage.sid,
            status: twilioMessage.status,
            to: formattedPhone
        })

    } catch (error: any) {
        console.error('SMS sending error:', error)

        // Handle Twilio-specific errors
        if (error.code) {
            return NextResponse.json({
                error: 'SMS sending failed',
                code: error.code,
                details: error.message
            }, { status: 400 })
        }

        return NextResponse.json({
            error: 'Failed to send SMS',
            details: error?.message
        }, { status: 500 })
    }
}

// GET - Check SMS configuration status
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const hasTwilioConfig = !!(
            process.env.TWILIO_ACCOUNT_SID &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_PHONE_NUMBER
        )

        return NextResponse.json({
            configured: hasTwilioConfig,
            provider: 'twilio',
            features: {
                hotLeadAlerts: hasTwilioConfig,
                appointmentReminders: hasTwilioConfig,
                customMessages: hasTwilioConfig
            }
        })

    } catch (error) {
        console.error('Error checking SMS config:', error)
        return NextResponse.json({ error: 'Failed to check SMS configuration' }, { status: 500 })
    }
}
