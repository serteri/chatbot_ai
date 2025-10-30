import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// GET - Chatbot detayını getir
export async function GET(
  req: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatbot = await prisma.chatbot.findUnique({
      where: { id: params.chatbotId },
      include: {
        documents: {
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            documents: true,
            conversations: true,
          }
        }
      }
    })

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot bulunamadı' }, { status: 404 })
    }

    if (chatbot.userId !== session.user.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    return NextResponse.json({ chatbot })

  } catch (error) {
    console.error('Chatbot get error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

// PATCH - Chatbot güncelle
export async function PATCH(
  req: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatbot = await prisma.chatbot.findUnique({
      where: { id: params.chatbotId }
    })

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot bulunamadı' }, { status: 404 })
    }

    if (chatbot.userId !== session.user.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    const body = await req.json()

    const updatedChatbot = await prisma.chatbot.update({
      where: { id: params.chatbotId },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.language !== undefined && { language: body.language }),
        ...(body.aiModel !== undefined && { aiModel: body.aiModel }),
        ...(body.primaryColor !== undefined && { primaryColor: body.primaryColor }),
        ...(body.secondaryColor !== undefined && { secondaryColor: body.secondaryColor }),
        ...(body.botAvatar !== undefined && { botAvatar: body.botAvatar }),
        ...(body.botName !== undefined && { botName: body.botName }),
        ...(body.welcomeMessage !== undefined && { welcomeMessage: body.welcomeMessage }),
        ...(body.placeholderText !== undefined && { placeholderText: body.placeholderText }),
        ...(body.fallbackMessage !== undefined && { fallbackMessage: body.fallbackMessage }),
        ...(body.temperature !== undefined && { temperature: body.temperature }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.enableLiveChat !== undefined && { enableLiveChat: body.enableLiveChat }),
        ...(body.enableEmailCapture !== undefined && { enableEmailCapture: body.enableEmailCapture }),
        ...(body.allowedDomains !== undefined && { allowedDomains: body.allowedDomains }),
      }
    })

    return NextResponse.json({ chatbot: updatedChatbot })

  } catch (error) {
    console.error('Chatbot update error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}

// DELETE - Chatbot sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: { chatbotId: string } }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const chatbot = await prisma.chatbot.findUnique({
      where: { id: params.chatbotId }
    })

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot bulunamadı' }, { status: 404 })
    }

    if (chatbot.userId !== session.user.id) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
    }

    await prisma.chatbot.delete({
      where: { id: params.chatbotId }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Chatbot delete error:', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}