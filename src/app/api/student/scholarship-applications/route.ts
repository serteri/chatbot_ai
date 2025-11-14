// src/app/api/student/scholarship-applications/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const applications = await prisma.scholarshipApplication.findMany({
            where: { userId: session.user.id },
            include: {
                scholarship: {
                    select: {
                        id: true,
                        title: true,
                        provider: true,
                        amount: true,
                        deadline: true,
                        country: true,
                        city: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        return NextResponse.json({ applications })

    } catch (error) {
        console.error('Get scholarship applications error:', error)
        return NextResponse.json(
            { error: 'Başvurular getirilemedi' },
            { status: 500 }
        )
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { scholarshipId, personalStatement, documents, notes } = body

        if (!scholarshipId) {
            return NextResponse.json(
                { error: 'Burs ID gerekli' },
                { status: 400 }
            )
        }

        // Check if scholarship exists and is active
        const scholarship = await prisma.scholarship.findUnique({
            where: { id: scholarshipId }
        })

        if (!scholarship) {
            return NextResponse.json(
                { error: 'Burs bulunamadı' },
                { status: 404 }
            )
        }

        if (!scholarship.isActive) {
            return NextResponse.json(
                { error: 'Bu burs artık aktif değil' },
                { status: 400 }
            )
        }

        if (new Date() > scholarship.deadline) {
            return NextResponse.json(
                { error: 'Başvuru süresi dolmuş' },
                { status: 400 }
            )
        }

        // Check if already applied
        const existingApplication = await prisma.scholarshipApplication.findUnique({
            where: {
                userId_scholarshipId: {
                    userId: session.user.id,
                    scholarshipId
                }
            }
        })

        if (existingApplication) {
            return NextResponse.json(
                { error: 'Bu bursa zaten başvurdunuz' },
                { status: 400 }
            )
        }

        // Create application
        const application = await prisma.scholarshipApplication.create({
            data: {
                userId: session.user.id,
                scholarshipId,
                personalStatement,
                documents,
                notes,
                status: 'draft',
                milestones: [
                    {
                        date: new Date().toISOString(),
                        event: 'Başvuru oluşturuldu'
                    }
                ]
            },
            include: {
                scholarship: {
                    select: {
                        title: true,
                        provider: true,
                        amount: true
                    }
                }
            }
        })

        return NextResponse.json({ application })

    } catch (error) {
        console.error('Create scholarship application error:', error)
        return NextResponse.json(
            { error: 'Başvuru oluşturulamadı' },
            { status: 500 }
        )
    }
}