import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { notifyHotLead } from '@/lib/sms/notifications'
import { sendLeadNotificationToAgent } from '@/lib/email/notifications'
import { forwardLeadToCRM } from '@/lib/crm/webhook'

// Validation schema for lead
const leadSchema = z.object({
    identifier: z.string(), // Chatbot identifier (for public API)
    chatbotId: z.string().optional(),
    conversationId: z.string().optional(),
    propertyId: z.string().optional(),
    name: z.string().min(1, 'Name is required'),
    email: z.string().email().optional().or(z.literal('')),
    phone: z.string().min(1, 'Phone is required'),
    intent: z.enum(['buy', 'rent', 'sell', 'value', 'tenant']).optional(),
    propertyType: z.string().optional(),
    purpose: z.enum(['investment', 'residence']).optional(),
    budget: z.string().optional(),
    budgetMin: z.number().optional(),
    budgetMax: z.number().optional(),
    location: z.string().optional(),
    timeline: z.string().optional(),
    hasPreApproval: z.boolean().optional(),
    score: z.number().int().min(0).max(100).optional(),
    category: z.enum(['hot', 'warm', 'cold']).optional(),
    notes: z.string().optional(),
    requirements: z.any().optional(),
    source: z.string().default('chatbot'),
})

// Calculate lead score based on qualification data
function calculateLeadScore(data: any): { score: number; category: 'hot' | 'warm' | 'cold' } {
    let score = 0

    // Timeline scoring (most important)
    if (data.timeline) {
        const timeline = data.timeline.toLowerCase()
        if (timeline.includes('hemen') || timeline.includes('immediately') || timeline.includes('bu ay')) {
            score += 40
        } else if (timeline.includes('1-3') || timeline.includes('soon')) {
            score += 25
        } else if (timeline.includes('3-6') || timeline.includes('later')) {
            score += 10
        }
        // "browsing" gets 0
    }

    // Pre-approval scoring
    if (data.hasPreApproval === true) {
        score += 30
    } else if (data.hasPreApproval === false) {
        score += 5
    }

    // Budget scoring
    if (data.budgetMax) {
        if (data.budgetMax >= 10000000) score += 20 // 10M+ TL
        else if (data.budgetMax >= 5000000) score += 15 // 5M+ TL
        else if (data.budgetMax >= 3000000) score += 10 // 3M+ TL
        else score += 5
    }

    // Contact info quality
    if (data.phone) score += 5
    if (data.email) score += 5

    // Intent scoring
    if (data.intent === 'buy') score += 5
    else if (data.intent === 'sell') score += 10 // Sellers are valuable

    // Determine category
    let category: 'hot' | 'warm' | 'cold'
    if (score >= 70) category = 'hot'
    else if (score >= 40) category = 'warm'
    else category = 'cold'

    return { score, category }
}

// POST - Create new lead (public API for widget)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        // Validate input
        const validatedData = leadSchema.parse(body)

        // Find chatbot by identifier
        let chatbotId = validatedData.chatbotId
        let chatbot: any = null

        if (!chatbotId && validatedData.identifier) {
            chatbot = await prisma.chatbot.findUnique({
                where: { identifier: validatedData.identifier }
            })

            if (!chatbot) {
                return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
            }
            chatbotId = chatbot.id
        }

        if (!chatbotId) {
            return NextResponse.json({ error: 'Chatbot identifier is required' }, { status: 400 })
        }

        // Calculate score if not provided
        let { score, category } = validatedData.score !== undefined
            ? { score: validatedData.score, category: validatedData.category || 'cold' }
            : calculateLeadScore(validatedData)

        // Check for duplicate (same phone in last 24 hours)
        const existingLead = await prisma.lead.findFirst({
            where: {
                chatbotId,
                phone: validatedData.phone,
                createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
                }
            }
        })

        if (existingLead) {
            // Update existing lead and recalculate score/category with combined data
            const combinedData = {
                ...existingLead,
                ...validatedData,
                // Keep the better values
                budgetMax: Math.max(validatedData.budgetMax || 0, existingLead.budgetMax || 0) || undefined,
                hasPreApproval: validatedData.hasPreApproval ?? existingLead.hasPreApproval
            }
            const recalculated = calculateLeadScore(combinedData)
            const finalScore = Math.max(recalculated.score, existingLead.score)
            const finalCategory = recalculated.score >= existingLead.score ? recalculated.category : existingLead.category

            const updatedLead = await prisma.lead.update({
                where: { id: existingLead.id },
                data: {
                    email: validatedData.email || existingLead.email,
                    intent: validatedData.intent || existingLead.intent,
                    propertyType: validatedData.propertyType || existingLead.propertyType,
                    purpose: validatedData.purpose || existingLead.purpose,
                    budget: validatedData.budget || existingLead.budget,
                    budgetMin: validatedData.budgetMin || existingLead.budgetMin,
                    budgetMax: validatedData.budgetMax || existingLead.budgetMax,
                    location: validatedData.location || existingLead.location,
                    timeline: validatedData.timeline || existingLead.timeline,
                    hasPreApproval: validatedData.hasPreApproval ?? existingLead.hasPreApproval,
                    score: finalScore,
                    category: finalCategory,
                    notes: validatedData.notes ? `${existingLead.notes || ''}\n${validatedData.notes}` : existingLead.notes,
                    updatedAt: new Date()
                }
            })

            // Send email notification for updated leads with new/better info
            if (score > existingLead.score || validatedData.email || validatedData.name !== existingLead.name) {
                sendLeadNotificationToAgent({
                    leadId: updatedLead.id,
                    chatbotId,
                    name: updatedLead.name,
                    phone: updatedLead.phone,
                    email: updatedLead.email || undefined,
                    intent: updatedLead.intent || undefined,
                    propertyType: updatedLead.propertyType || undefined,
                    budget: updatedLead.budget || undefined,
                    timeline: updatedLead.timeline || undefined,
                    hasPreApproval: updatedLead.hasPreApproval || undefined,
                    score: finalScore,
                    category: finalCategory as 'hot' | 'warm' | 'cold',
                    location: updatedLead.location || undefined,
                    requirements: updatedLead.requirements as any || undefined
                }).catch(err => console.error('Failed to send updated lead email notification:', err))
            }

            // Forward updated lead to CRM
            if (chatbot) {
                forwardLeadToCRM({
                    id: updatedLead.id,
                    name: updatedLead.name,
                    phone: updatedLead.phone,
                    email: updatedLead.email,
                    intent: updatedLead.intent,
                    propertyType: updatedLead.propertyType,
                    purpose: updatedLead.purpose,
                    budget: updatedLead.budget,
                    budgetMin: updatedLead.budgetMin,
                    budgetMax: updatedLead.budgetMax,
                    location: updatedLead.location,
                    timeline: updatedLead.timeline,
                    hasPreApproval: updatedLead.hasPreApproval,
                    score: finalScore,
                    category: finalCategory,
                    requirements: updatedLead.requirements as any,
                    source: updatedLead.source || 'chatbot',
                    createdAt: updatedLead.createdAt,
                }, chatbot).catch(err => console.error('CRM forwarding failed for updated lead:', err))
            }

            return NextResponse.json({
                lead: updatedLead,
                isNew: false,
                message: 'Lead updated'
            })
        }

        // Create new lead
        const lead = await prisma.lead.create({
            data: {
                chatbotId,
                conversationId: validatedData.conversationId,
                propertyId: validatedData.propertyId,
                name: validatedData.name,
                email: validatedData.email || null,
                phone: validatedData.phone,
                intent: validatedData.intent,
                propertyType: validatedData.propertyType,
                purpose: validatedData.purpose,
                budget: validatedData.budget,
                budgetMin: validatedData.budgetMin,
                budgetMax: validatedData.budgetMax,
                location: validatedData.location,
                timeline: validatedData.timeline,
                hasPreApproval: validatedData.hasPreApproval,
                score,
                category,
                notes: validatedData.notes,
                requirements: validatedData.requirements,
                source: validatedData.source,
                status: 'new'
            }
        })

        // Send email notification to agent for ALL leads
        sendLeadNotificationToAgent({
            leadId: lead.id,
            chatbotId,
            name: lead.name,
            phone: lead.phone,
            email: lead.email || undefined,
            intent: lead.intent || undefined,
            propertyType: lead.propertyType || undefined,
            budget: lead.budget || undefined,
            timeline: lead.timeline || undefined,
            hasPreApproval: lead.hasPreApproval || undefined,
            score,
            category,
            location: lead.location || undefined,
            requirements: lead.requirements as any || undefined
        }).catch(err => console.error('Failed to send lead email notification:', err))

        // If hot lead, ALSO trigger SMS notification for urgency
        if (category === 'hot') {
            console.log(`🔥 HOT LEAD: ${lead.name} - ${lead.phone} - Score: ${score}`)
            // Send SMS notification to agent (async, don't await to avoid blocking response)
            notifyHotLead(lead.id, chatbotId).catch(err =>
                console.error('Failed to send hot lead SMS notification:', err)
            )
        }

        // Forward new lead to CRM
        if (chatbot) {
            forwardLeadToCRM({
                id: lead.id,
                name: lead.name,
                phone: lead.phone,
                email: lead.email,
                intent: lead.intent,
                propertyType: lead.propertyType,
                purpose: lead.purpose,
                budget: lead.budget,
                budgetMin: lead.budgetMin,
                budgetMax: lead.budgetMax,
                location: lead.location,
                timeline: lead.timeline,
                hasPreApproval: lead.hasPreApproval,
                score,
                category,
                requirements: lead.requirements as any,
                source: lead.source || 'chatbot',
                createdAt: lead.createdAt,
            }, chatbot).catch(err => console.error('CRM forwarding failed for new lead:', err))
        }

        return NextResponse.json({
            lead,
            isNew: true,
            score,
            category,
            message: category === 'hot' ? 'Hot lead captured!' : 'Lead captured successfully'
        }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
        }
        console.error('Error creating lead:', error)
        return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }
}

// GET - List leads (authenticated)
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const chatbotId = searchParams.get('chatbotId')
        const category = searchParams.get('category')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        if (!chatbotId) {
            return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 })
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

        // Build filter
        const where: any = { chatbotId }
        if (category) where.category = category
        if (status) where.status = status

        const [leads, total] = await Promise.all([
            prisma.lead.findMany({
                where,
                orderBy: [
                    { category: 'asc' }, // hot first
                    { score: 'desc' },
                    { createdAt: 'desc' }
                ],
                skip: (page - 1) * limit,
                take: limit,
                include: {
                    property: {
                        select: {
                            id: true,
                            title: true,
                            price: true
                        }
                    }
                }
            }),
            prisma.lead.count({ where })
        ])

        // Calculate category counts
        const categoryCounts = await prisma.lead.groupBy({
            by: ['category'],
            where: { chatbotId },
            _count: true
        })

        return NextResponse.json({
            leads,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            },
            stats: {
                hot: categoryCounts.find(c => c.category === 'hot')?._count || 0,
                warm: categoryCounts.find(c => c.category === 'warm')?._count || 0,
                cold: categoryCounts.find(c => c.category === 'cold')?._count || 0,
            }
        })
    } catch (error) {
        console.error('Error fetching leads:', error)
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }
}

// PUT - Update lead status
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, status, notes, appointmentDate, appointmentTime, appointmentNote } = body

        if (!id) {
            return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
        }

        // Verify ownership
        const lead = await prisma.lead.findFirst({
            where: { id },
            include: { chatbot: true }
        })

        if (!lead || lead.chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 })
        }

        const updateData: any = { updatedAt: new Date() }

        if (status) {
            updateData.status = status
            if (status === 'contacted') updateData.contactedAt = new Date()
            if (status === 'converted') updateData.convertedAt = new Date()
        }

        if (notes) updateData.notes = notes
        if (appointmentDate) updateData.appointmentDate = new Date(appointmentDate)
        if (appointmentTime) updateData.appointmentTime = appointmentTime
        if (appointmentNote) updateData.appointmentNote = appointmentNote

        const updatedLead = await prisma.lead.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({ lead: updatedLead })
    } catch (error) {
        console.error('Error updating lead:', error)
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }
}
