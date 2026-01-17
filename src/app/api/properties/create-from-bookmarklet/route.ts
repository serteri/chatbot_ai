import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function OPTIONS() {
    return NextResponse.json({}, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { chatbotId, ...data } = body

        if (!chatbotId) {
            return NextResponse.json(
                { error: 'Chatbot ID is required' },
                {
                    status: 400,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                }
            )
        }

        // Verify chatbot exists
        const chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId }
        })

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot not found' },
                {
                    status: 404,
                    headers: { 'Access-Control-Allow-Origin': '*' }
                }
            )
        }

        // Check if property already exists
        const existingProperty = await prisma.property.findFirst({
            where: {
                chatbotId,
                sourceUrl: data.sourceUrl
            }
        })

        if (existingProperty) {
            // Update existing property
            const updated = await prisma.property.update({
                where: { id: existingProperty.id },
                data: {
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    bedrooms: data.bedrooms,
                    bathrooms: data.bathrooms,
                    propertyType: data.propertyType,
                    listingType: data.listingType,
                    address: data.address,
                    district: data.suburb,
                    city: data.city,
                    images: data.images,
                    updatedAt: new Date()
                }
            })

            return NextResponse.json({
                success: true,
                property: updated,
                action: 'updated'
            }, {
                headers: { 'Access-Control-Allow-Origin': '*' }
            })
        }

        // Create new property
        const property = await prisma.property.create({
            data: {
                chatbotId,
                title: data.title,
                description: data.description,
                price: data.price,
                bedrooms: data.bedrooms,
                bathrooms: data.bathrooms,
                propertyType: data.propertyType,
                listingType: data.listingType,
                address: data.address,
                district: data.suburb,
                city: data.city,
                country: 'Australia',
                currency: 'AUD',
                images: data.images,
                source: 'scrape-bookmarklet',
                sourceUrl: data.sourceUrl,
                status: 'active'
            }
        })

        return NextResponse.json({
            success: true,
            property,
            action: 'created'
        }, {
            headers: { 'Access-Control-Allow-Origin': '*' }
        })

    } catch (error: any) {
        console.error('Bookmarklet import error:', error)
        return NextResponse.json(
            { error: error.message || 'Failed to import property' },
            {
                status: 500,
                headers: { 'Access-Control-Allow-Origin': '*' }
            }
        )
    }
}
