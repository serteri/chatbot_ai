import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'
import { nanoid } from 'nanoid'

const createChatbotSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  language: z.string().default('en'),
  aiModel: z.string().default('gpt-3.5-turbo'),
  primaryColor: z.string().default('#3b82f6'),
  botName: z.string().default('AI Assistant'),
  welcomeMessage: z.string().optional().default('Hello! How can I help you today?'),
  placeholderText: z.string().default('Type your message...'),
  fallbackMessage: z.string().default('I couldn\'t find an answer. Would you like to speak with a human?'),
  industry: z.string().default('general')
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please login' },
        { status: 401 }
      )
    }

    // Subscription kontrolü - yoksa default free plan oluştur
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    })

    // Subscription yoksa, bir tane oluştur (free tier)
    if (!subscription) {
      subscription = await prisma.subscription.create({
        data: {
          userId: session.user.id,
          plan: 'free',
          status: 'active',
          maxChatbots: 2,
          maxDocuments: 5,
          maxConversations: 100,
        }
      })
    }

    // Chatbot limit kontrolü
    const currentChatbotCount = await prisma.chatbot.count({
      where: { userId: session.user.id }
    })

    if (subscription.maxChatbots !== -1 && currentChatbotCount >= subscription.maxChatbots) {
      return NextResponse.json(
        { error: `Maximum ${subscription.maxChatbots} chatbots allowed. Please upgrade your plan.` },
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
        welcomeMessage: validatedData.welcomeMessage || 'Hello! How can I help you today?',
        placeholderText: validatedData.placeholderText,
        fallbackMessage: validatedData.fallbackMessage,
        isActive: false, // Başlangıçta pasif
        isPublished: false,
        industry: validatedData.industry
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
      { error: 'An error occurred while creating the chatbot' },
      { status: 500 }
    )
  }
}