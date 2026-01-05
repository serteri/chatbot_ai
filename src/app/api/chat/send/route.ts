import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { createSystemPrompt } from '@/lib/ai/service'
import { AIModel } from '@/types'
import { streamText } from 'ai'
import { createOpenAI } from '@ai-sdk/openai'
import { createAnthropic } from '@ai-sdk/anthropic'

export const runtime = 'edge'

// Lazy initialize to avoid build-time env checks
const getOpenAI = () => createOpenAI({ apiKey: process.env.OPENAI_API_KEY! })
const getAnthropic = () => createAnthropic({ apiKey: process.env.ANTHROPIC_API_KEY! })

export async function POST(req: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { chatId, message, model, language } = await req.json()

    if (!chatId || !message) {
      return NextResponse.json(
        { error: 'Chat ID ve mesaj gerekli' },
        { status: 400 }
      )
    }

    // Chat'in kullanıcıya ait olduğunu kontrol et
    const chat = await prisma.chat.findUnique({
      where: { id: chatId },
      include: { messages: true }
    })

    if (!chat || chat.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Chat bulunamadı' },
        { status: 404 }
      )
    }

    // Subscription kontrolü
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id }
    })

    if (subscription) {
      if (subscription.messageLimit !== -1) {
        if (subscription.messagesUsed >= subscription.messageLimit) {
          return NextResponse.json(
            { error: 'Mesaj limitiniz doldu. Plan yükseltin.' },
            { status: 403 }
          )
        }
      }
    }

    // Kullanıcı mesajını kaydet
    const userMessage = await prisma.message.create({
      data: {
        chatId,
        role: 'user',
        content: message,
        language: language || 'tr',
      }
    })

    // Chat mesaj geçmişini al
    const messages = [
      { role: 'system' as const, content: createSystemPrompt(language || 'tr') },
      ...chat.messages.map(m => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content
      })),
      { role: 'user' as const, content: message }
    ]

    // AI'dan yanıt al (streaming)
    const selectedModel = (model || chat.model) as AIModel

    // Model'e göre provider seç
    const isClaudeModel = selectedModel.startsWith('claude-')
    const aiModel = isClaudeModel
      ? getAnthropic()(selectedModel)
      : getOpenAI()(selectedModel)

    const result = await streamText({
      model: aiModel,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      })),
      temperature: 0.7,
      async onFinish({ text }) {
        // AI yanıtını veritabanına kaydet
        await prisma.message.create({
          data: {
            chatId,
            role: 'assistant',
            content: text,
            model: selectedModel,
            language: language || 'tr',
          }
        })

        // Chat başlığını güncelle (ilk mesajsa)
        if (chat.messages.length === 0) {
          await prisma.chat.update({
            where: { id: chatId },
            data: {
              title: message.slice(0, 50) + (message.length > 50 ? '...' : ''),
              updatedAt: new Date()
            }
          })
        } else {
          await prisma.chat.update({
            where: { id: chatId },
            data: { updatedAt: new Date() }
          })
        }

        // Subscription usage güncelle
        if (subscription && session.user?.id) {
          await prisma.subscription.update({
            where: { userId: session.user.id },
            data: {
              messagesUsed: { increment: 1 }
            }
          })
        }
      }
    })

    return result.toTextStreamResponse()

  } catch (error) {
    console.error('Chat send error:', error)
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    )
  }
}