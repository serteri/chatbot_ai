import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import { z } from 'zod'

// Validation schema for property
const propertySchema = z.object({
    chatbotId: z.string(),
    externalId: z.string().optional(),
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    propertyType: z.enum(['apartment', 'villa', 'house', 'land', 'commercial']),
    listingType: z.enum(['sale', 'rent']),
    price: z.number().positive('Price must be positive'),
    currency: z.string().default('TRY'),
    pricePerSqm: z.number().optional(),
    monthlyRent: z.number().optional(),
    address: z.string().optional(),
    district: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    country: z.string().default('Turkey'),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    rooms: z.string().optional(),
    bedrooms: z.number().int().optional(),
    bathrooms: z.number().int().optional(),
    area: z.number().optional(),
    floorNumber: z.number().int().optional(),
    totalFloors: z.number().int().optional(),
    buildingAge: z.number().int().optional(),
    hasGarage: z.boolean().default(false),
    hasPool: z.boolean().default(false),
    hasGarden: z.boolean().default(false),
    hasBalcony: z.boolean().default(false),
    hasElevator: z.boolean().default(false),
    hasSecurity: z.boolean().default(false),
    isFurnished: z.boolean().default(false),
    heatingType: z.string().optional(),
    estimatedRoi: z.number().optional(),
    rentalYield: z.number().optional(),
    images: z.array(z.string()).default([]),
    videoUrl: z.string().optional(),
    virtualTourUrl: z.string().optional(),
    status: z.enum(['active', 'sold', 'rented', 'inactive']).default('active'),
    isFeatured: z.boolean().default(false),
    source: z.enum(['manual', 'xml', 'api']).default('manual'),
    sourceUrl: z.string().optional(),
})

// GET - List properties for a chatbot
export async function GET(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const chatbotId = searchParams.get('chatbotId')
        const propertyType = searchParams.get('propertyType')
        const listingType = searchParams.get('listingType')
        const city = searchParams.get('city')
        const district = searchParams.get('district')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const rooms = searchParams.get('rooms')
        const status = searchParams.get('status')
        const page = parseInt(searchParams.get('page') || '1')
        const limit = parseInt(searchParams.get('limit') || '20')

        if (!chatbotId) {
            return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 })
        }

        // Verify ownership
        const chatbot = await prisma.chatbot.findFirst({
            where: {
                id: chatbotId,
                userId: session.user.id
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Build filter
        const where: any = { chatbotId }

        if (propertyType) where.propertyType = propertyType
        if (listingType) where.listingType = listingType
        if (city) where.city = { contains: city, mode: 'insensitive' }
        if (district) where.district = { contains: district, mode: 'insensitive' }
        if (rooms) where.rooms = rooms
        if (status) where.status = status
        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = parseFloat(minPrice)
            if (maxPrice) where.price.lte = parseFloat(maxPrice)
        }

        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip: (page - 1) * limit,
                take: limit,
            }),
            prisma.property.count({ where })
        ])

        return NextResponse.json({
            properties,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Error fetching properties:', error)
        return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 })
    }
}

// POST - Create new property
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const validatedData = propertySchema.parse(body)

        // Verify chatbot ownership
        const chatbot = await prisma.chatbot.findFirst({
            where: {
                id: validatedData.chatbotId,
                userId: session.user.id
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Calculate price per sqm if area is provided
        if (validatedData.area && validatedData.area > 0) {
            validatedData.pricePerSqm = validatedData.price / validatedData.area
        }

        const property = await prisma.property.create({
            data: validatedData
        })

        return NextResponse.json({ property }, { status: 201 })
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 })
        }
        console.error('Error creating property:', error)
        return NextResponse.json({ error: 'Failed to create property' }, { status: 500 })
    }
}

// PUT - Update property
export async function PUT(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { id, ...updateData } = body

        if (!id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
        }

        // Verify ownership through chatbot
        const existingProperty = await prisma.property.findFirst({
            where: { id },
            include: { chatbot: true }
        })

        if (!existingProperty || existingProperty.chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        // Recalculate price per sqm if needed
        if (updateData.area && updateData.price) {
            updateData.pricePerSqm = updateData.price / updateData.area
        }

        const property = await prisma.property.update({
            where: { id },
            data: updateData
        })

        return NextResponse.json({ property })
    } catch (error) {
        console.error('Error updating property:', error)
        return NextResponse.json({ error: 'Failed to update property' }, { status: 500 })
    }
}

// DELETE - Delete property
export async function DELETE(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 })
        }

        // Verify ownership
        const property = await prisma.property.findFirst({
            where: { id },
            include: { chatbot: true }
        })

        if (!property || property.chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 })
        }

        await prisma.property.delete({ where: { id } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting property:', error)
        return NextResponse.json({ error: 'Failed to delete property' }, { status: 500 })
    }
}
