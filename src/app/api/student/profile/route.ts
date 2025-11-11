import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// GET - Fetch student profile
export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const profile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id },
            include: {
                wishlist: {
                    include: { university: true }
                },
                applications: {
                    include: { university: true }
                }
            }
        })

        return NextResponse.json({ profile })
    } catch (error) {
        console.error('Student profile error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// POST - Create/Update student profile
export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()

        const profile = await prisma.studentProfile.upsert({
            where: { userId: session.user.id },
            create: {
                userId: session.user.id,
                ...data
            },
            update: data
        })

        return NextResponse.json({ profile })
    } catch (error) {
        console.error('Student profile error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}