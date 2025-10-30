import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const createChatbotSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  language: z.string().default('tr'),
  aiModel: z.string().default('gpt-3.5-turbo'),
  primaryColor: z.string().default('#3b82f6'),
  botName: z.string().default('AI Assistant'),
  welcomeMessage: z.string().default('Hello! How can I help you today?'),
  placeholderText: z.string().default('Type your message...'),
  fallbackMessage: z.string().default('I couldn\'t find an answer. Would you like to speak with a human?'),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Subscription kontrolü
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription bulunamadı' },
        { status: 404 }
      )
    }

    // Chatbot limit kontrolü
    const currentChatbotCount = await prisma.chatbot.count({
      where: { userId: session.user.id }
    })

    if (subscription.maxChatbots !== -1 && currentChatbotCount >= subscription.maxChatbots) {
      return NextResponse.json(
        { error: `Maksimum ${subscription.maxChatbots} chatbot oluşturabilirsiniz. Plan yükseltin.` },
        { status: 403 }
      )
    }

    const body = await req.json()
    const validatedData = createChatbotSchema.parse(body)

    // Unique identifier oluştur
    const identifier = nanoid(12)

    // Chatbot oluştur
    const chatbot = await prisma.chatbot.create({
      data: {
        userId: session.user.id,
        name: validatedData.name,
        identifier,
        language: validatedData.language,
        aiModel: validatedData.aiModel,
        primaryColor: validatedData.primaryColor,
        botName: validatedData.botName,
        welcomeMessage: validatedData.welcomeMessage,
        placeholderText: validatedData.placeholderText,
        fallbackMessage: validatedData.fallbackMessage,
        isActive: false, // Başlangıçta pasif
        isPublished: false,
      },
      include: {
        _count: {
          select: {
            documents: true,
            conversations: true,
          }
        }
      }
    })

    return NextResponse.json(
      {
        success: true,
        chatbot
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Chatbot create error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}