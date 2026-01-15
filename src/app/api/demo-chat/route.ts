import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// GET: Get current demo chat usage
// Query params:
// - chatbotId: If provided, use chatbot owner's subscription limits
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const chatbotId = searchParams.get('chatbotId')

        const session = await auth()

        // If chatbotId provided, use chatbot owner's subscription
        if (chatbotId) {
            const chatbot = await prisma.chatbot.findUnique({
                where: { id: chatbotId },
                select: {
                    userId: true,
                    user: {
                        select: {
                            subscription: {
                                select: {
                                    demoChatUsed: true,
                                    maxDemoChat: true,
                                    planType: true
                                }
                            }
                        }
                    }
                }
            })

            if (!chatbot) {
                return NextResponse.json({
                    authenticated: false,
                    used: 0,
                    limit: 5,
                    remaining: 5,
                    message: 'Chatbot not found, using default limits'
                })
            }

            const subscription = chatbot.user?.subscription
            if (!subscription) {
                return NextResponse.json({
                    authenticated: false,
                    used: 0,
                    limit: 5,
                    remaining: 5
                })
            }

            return NextResponse.json({
                authenticated: false, // For widget-test, we use chatbot owner's limits but don't require auth
                used: subscription.demoChatUsed,
                limit: subscription.maxDemoChat,
                remaining: subscription.maxDemoChat === -1 ? -1 : Math.max(0, subscription.maxDemoChat - subscription.demoChatUsed),
                planType: subscription.planType,
                chatbotOwnerId: chatbot.userId
            })
        }

        // No chatbotId - use current user's subscription or localStorage
        if (!session?.user?.id) {
            return NextResponse.json({
                authenticated: false,
                used: 0,
                limit: 5,
                remaining: 5,
                message: 'Please use localStorage for tracking'
            })
        }

        const subscription = await prisma.subscription.findUnique({
            where: { userId: session.user.id },
            select: {
                demoChatUsed: true,
                maxDemoChat: true,
                planType: true
            }
        })

        if (!subscription) {
            return NextResponse.json({
                authenticated: true,
                used: 0,
                limit: 5,
                remaining: 5
            })
        }

        const limit = subscription.maxDemoChat
        const used = subscription.demoChatUsed
        const remaining = limit === -1 ? -1 : Math.max(0, limit - used)

        return NextResponse.json({
            authenticated: true,
            used,
            limit,
            remaining,
            planType: subscription.planType
        })
    } catch (error) {
        console.error('Demo chat usage check error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}

// POST: Send message and increment usage
// Body params:
// - chatbotId: If provided, increment chatbot owner's usage
// - demoType: Type of demo (realestate, education, ecommerce) - for future per-type tracking
export async function POST(request: NextRequest) {
    try {
        const body = await request.json().catch(() => ({}))
        const chatbotId = body.chatbotId

        const session = await auth()

        // If chatbotId provided, increment chatbot owner's usage
        if (chatbotId) {
            const chatbot = await prisma.chatbot.findUnique({
                where: { id: chatbotId },
                select: {
                    userId: true,
                    user: {
                        select: {
                            subscription: {
                                select: {
                                    id: true,
                                    demoChatUsed: true,
                                    maxDemoChat: true,
                                    planType: true
                                }
                            }
                        }
                    }
                }
            })

            if (!chatbot || !chatbot.user?.subscription) {
                return NextResponse.json({
                    authenticated: false,
                    success: true,
                    message: 'Chatbot not found, client should track locally'
                })
            }

            const subscription = chatbot.user.subscription

            // Check limit
            if (subscription.maxDemoChat !== -1 && subscription.demoChatUsed >= subscription.maxDemoChat) {
                return NextResponse.json({
                    authenticated: false,
                    success: false,
                    error: 'limit_reached',
                    used: subscription.demoChatUsed,
                    limit: subscription.maxDemoChat,
                    remaining: 0,
                    message: 'Demo chat limit reached for this chatbot.'
                }, { status: 403 })
            }

            // Increment usage
            const updated = await prisma.subscription.update({
                where: { id: subscription.id },
                data: {
                    demoChatUsed: { increment: 1 }
                }
            })

            return NextResponse.json({
                authenticated: false,
                success: true,
                used: updated.demoChatUsed,
                limit: updated.maxDemoChat,
                remaining: updated.maxDemoChat === -1 ? -1 : Math.max(0, updated.maxDemoChat - updated.demoChatUsed)
            })
        }

        // No chatbotId - use current user's subscription
        if (!session?.user?.id) {
            return NextResponse.json({
                authenticated: false,
                success: true,
                message: 'Client should track usage in localStorage'
            })
        }

        const subscription = await prisma.subscription.findUnique({
            where: { userId: session.user.id },
            select: {
                id: true,
                demoChatUsed: true,
                maxDemoChat: true,
                planType: true
            }
        })

        if (!subscription) {
            const newSub = await prisma.subscription.create({
                data: {
                    userId: session.user.id,
                    planType: 'free',
                    demoChatUsed: 1,
                    maxDemoChat: 5
                }
            })
            return NextResponse.json({
                authenticated: true,
                success: true,
                used: 1,
                limit: 5,
                remaining: 4
            })
        }

        // Check limit
        if (subscription.maxDemoChat !== -1 && subscription.demoChatUsed >= subscription.maxDemoChat) {
            return NextResponse.json({
                authenticated: true,
                success: false,
                error: 'limit_reached',
                used: subscription.demoChatUsed,
                limit: subscription.maxDemoChat,
                remaining: 0,
                message: 'Demo chat limit reached. Please upgrade your plan.'
            }, { status: 403 })
        }

        // Increment usage
        const updated = await prisma.subscription.update({
            where: { id: subscription.id },
            data: {
                demoChatUsed: { increment: 1 }
            }
        })

        const newUsed = updated.demoChatUsed
        const limit = updated.maxDemoChat
        const remaining = limit === -1 ? -1 : Math.max(0, limit - newUsed)

        return NextResponse.json({
            authenticated: true,
            success: true,
            used: newUsed,
            limit,
            remaining
        })
    } catch (error) {
        console.error('Demo chat message error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
