import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

const inviteSchema = z.object({
    email: z.string().email()
})

// GET: Takım üyelerini listele
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Benim davet ettiğim üyeler (Benim takımım)
        const members = await prisma.teamMember.findMany({
            where: {
                invitedBy: session.user.id
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            },
            orderBy: {
                joinedAt: 'desc'
            }
        })

        return NextResponse.json(members)
    } catch (error) {
        console.error('Team API Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

// POST: Yeni üye ekle
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Plan kontrolü (Sadece Business ve Enterprise)
        const subscription = await prisma.subscription.findUnique({
            where: { userId: session.user.id },
            select: { planType: true, hasTeamCollaboration: true }
        })

        // Feature flag veya plan kontrolü
        const hasAccess = subscription?.hasTeamCollaboration ||
            ['business', 'enterprise'].includes(subscription?.planType || '')

        if (!hasAccess) {
            return NextResponse.json({ error: 'Upgrade required for Team Collaboration' }, { status: 403 })
        }

        const body = await request.json()
        const result = inviteSchema.safeParse(body)

        if (!result.success) {
            return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
        }

        const { email } = result.data

        // 1. Kullanıcıyı bul
        const userToAdd = await prisma.user.findUnique({
            where: { email }
        })

        if (!userToAdd) {
            return NextResponse.json({
                error: 'User not found. They must sign up first.'
            }, { status: 404 })
        }

        if (userToAdd.id === session.user.id) {
            return NextResponse.json({ error: 'You cannot invite yourself' }, { status: 400 })
        }

        // 2. Zaten takımda mı?
        const existingMember = await prisma.teamMember.findFirst({
            where: {
                userId: userToAdd.id,
                invitedBy: session.user.id
            }
        })

        if (existingMember) {
            return NextResponse.json({ error: 'User is already in your team' }, { status: 400 })
        }

        // 3. Ekle
        const newMember = await prisma.teamMember.create({
            data: {
                userId: userToAdd.id,
                invitedBy: session.user.id,
                role: 'member'
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true
                    }
                }
            }
        })

        return NextResponse.json(newMember)

    } catch (error) {
        console.error('Team Invite Error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
