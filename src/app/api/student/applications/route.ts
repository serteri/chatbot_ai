import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// GET - Fetch all applications
export async function GET(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get student profile first
        const profile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!profile) {
            return NextResponse.json({ applications: [] })
        }

        const applications = await prisma.application.findMany({
            where: { studentId: profile.id },
            include: {
                university: {
                    select: {
                        id: true,
                        name: true,
                        country: true,
                        city: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ applications })
    } catch (error) {
        console.error('Applications fetch error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}

// POST - Create new application
export async function POST(req: NextRequest) {
    try {
        const session = await auth()

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const data = await req.json()

        // Get or create student profile
        let profile = await prisma.studentProfile.findUnique({
            where: { userId: session.user.id }
        })

        if (!profile) {
            // Create basic profile if doesn't exist
            const nameParts = session.user.name?.split(' ') || []
            profile = await prisma.studentProfile.create({
                data: {
                    userId: session.user.id,
                    firstName: nameParts[0] || 'Student',
                    lastName: nameParts.slice(1).join(' ') || '',
                    preferredCountries: [],
                    preferredFields: []
                }
            })
        }

        const application = await prisma.application.create({
            data: {
                studentId: profile.id,
                universityId: data.universityId,
                program: data.program,
                degree: data.degree,
                intake: data.intake,
                deadline: data.deadline ? new Date(data.deadline) : null,
                notes: data.notes,
                status: 'draft'
            },
            include: {
                university: true
            }
        })

        return NextResponse.json({ application })
    } catch (error) {
        console.error('Application create error:', error)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
    }
}