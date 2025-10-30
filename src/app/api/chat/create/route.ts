import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { title, model, language } = await req.json()

    // Yeni chat oluştur
    const chat = await prisma.chat.create({
      data: {
        title: title || 'Yeni Sohbet',
        model: model || 'gpt-3.5-turbo',
        language: language || 'tr',
        userId: session.user.id,
      },
      include: {
        messages: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          }
        }
      }
    })

    return NextResponse.json({ chat }, { status: 201 })

  } catch (error) {
    console.error('Chat create error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}