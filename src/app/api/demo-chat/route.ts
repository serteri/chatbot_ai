import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// GET: Get current demo chat usage
export async function GET() {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            // Not logged in - return localStorage-based limit info
            return NextResponse.json({
                authenticated: false,
                used: 0, // Client should track this in localStorage
                limit: 5,
                remaining: 5,
                message: 'Please use localStorage for tracking'
            })
        }

        // Get subscription
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
export async function POST(request: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            // Not logged in - client handles localStorage tracking
            return NextResponse.json({
                authenticated: false,
                success: true,
                message: 'Client should track usage in localStorage'
            })
        }

        // Get subscription
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
            // Create default subscription
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

        // Check limit (-1 means unlimited)
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
