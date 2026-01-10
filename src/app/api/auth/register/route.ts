import { NextRequest, NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir email adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalı'),
  companyName: z.string().optional(),
  website: z.string().url('Geçerli bir URL girin').optional().or(z.literal('')),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate input
    const validatedData = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu email adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hash(validatedData.password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        companyName: validatedData.companyName,
        website: validatedData.website || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
      }
    })

    // Create default subscription (Free plan)
    await prisma.subscription.create({
      data: {
        userId: user.id,
        planType: 'free',
        status: 'active',
        maxChatbots: 1,
        maxDocuments: 3,
        maxConversations: 50,
        conversationsUsed: 0,
        storageLimit: 100,
        storageUsed: 0,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      }
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Hesabınız oluşturuldu! Şimdi giriş yapabilirsiniz.',
        user
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Register error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  }
}