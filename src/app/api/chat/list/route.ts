import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Kullanıcının chatbot'larını getir
    const chatbots = await prisma.chatbot.findMany({
      where: {
        userId: session.user.id
      },
      include: {
        _count: {
          select: {
            documents: true,
            conversations: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset,
    })

    const total = await prisma.chatbot.count({
      where: {
        userId: session.user.id
      }
    })

    return NextResponse.json({
      chatbots,
      pagination: {
        total,
        limit,
        offset,
      }
    })

  } catch (error) {
    console.error('Chatbot list error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}