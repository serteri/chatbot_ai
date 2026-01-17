import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Public API for chatbot widget to search properties
// No authentication required - uses chatbot identifier

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)

        // Required: chatbot identifier
        const identifier = searchParams.get('identifier')
        if (!identifier) {
            return NextResponse.json({ error: 'Chatbot identifier is required' }, { status: 400 })
        }

        // Find chatbot by identifier
        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Parse search parameters
        const propertyType = searchParams.get('propertyType')
        const listingType = searchParams.get('listingType') || 'sale'
        const purpose = searchParams.get('purpose') // investment, residence
        const city = searchParams.get('city')
        const district = searchParams.get('district')
        const minPrice = searchParams.get('minPrice')
        const maxPrice = searchParams.get('maxPrice')
        const rooms = searchParams.get('rooms')
        const bedrooms = searchParams.get('bedrooms')
        const bathrooms = searchParams.get('bathrooms')
        const minArea = searchParams.get('minArea')
        const maxArea = searchParams.get('maxArea')
        const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 20)

        // Build filter
        const where: any = {
            chatbotId: chatbot.id,
            status: 'active'
        }

        if (propertyType) where.propertyType = propertyType
        if (listingType) where.listingType = listingType
        if (city) where.city = { contains: city, mode: 'insensitive' }
        if (district) where.district = { contains: district, mode: 'insensitive' }
        if (rooms) where.rooms = rooms

        // Add bedrooms/bathrooms filters
        if (bedrooms) {
            const bedroomNum = parseInt(bedrooms)
            if (!isNaN(bedroomNum)) {
                where.bedrooms = bedrooms.includes('+')
                    ? { gte: bedroomNum }
                    : bedroomNum
            }
        }
        if (bathrooms) {
            const bathroomNum = parseInt(bathrooms)
            if (!isNaN(bathroomNum)) {
                where.bathrooms = bathrooms.includes('+')
                    ? { gte: bathroomNum }
                    : bathroomNum
            }
        }

        // Price filter
        if (minPrice || maxPrice) {
            where.price = {}
            if (minPrice) where.price.gte = parseFloat(minPrice)
            if (maxPrice) where.price.lte = parseFloat(maxPrice)
        }

        // Area filter
        if (minArea || maxArea) {
            where.area = {}
            if (minArea) where.area.gte = parseFloat(minArea)
            if (maxArea) where.area.lte = parseFloat(maxArea)
        }

        // Determine ordering based on purpose
        let orderBy: any = { createdAt: 'desc' }
        if (purpose === 'investment') {
            // For investment, prioritize high ROI
            orderBy = [
                { estimatedRoi: 'desc' },
                { rentalYield: 'desc' },
                { createdAt: 'desc' }
            ]
        } else if (purpose === 'residence') {
            // For residence, prioritize featured and larger areas
            orderBy = [
                { isFeatured: 'desc' },
                { area: 'desc' },
                { createdAt: 'desc' }
            ]
        }

        // Fetch properties
        const properties = await prisma.property.findMany({
            where,
            orderBy,
            take: limit,
            select: {
                id: true,
                title: true,
                propertyType: true,
                listingType: true,
                price: true,
                currency: true,
                city: true,
                district: true,
                rooms: true,
                area: true,
                images: true,
                isFeatured: true,
                monthlyRent: true,
                estimatedRoi: true,
                rentalYield: true,
                bedrooms: true,
                bathrooms: true,
                hasGarage: true,
                hasPool: true,
                hasGarden: true,
                hasBalcony: true,
                sourceUrl: true,
            }
        })

        // Format response for widget consumption
        const formattedProperties = properties.map(prop => ({
            id: prop.id,
            title: prop.title,
            price: formatPrice(prop.price, prop.currency),
            priceRaw: prop.price,
            location: prop.district ? `${prop.district}, ${prop.city}` : prop.city,
            rooms: prop.rooms || `${prop.bedrooms || 0}+1`,
            bedrooms: prop.bedrooms,
            bathrooms: prop.bathrooms,
            area: prop.area ? `${prop.area} m²` : null,
            image: prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
            badge: getBadge(prop),
            monthlyRent: prop.monthlyRent ? formatPrice(prop.monthlyRent, prop.currency) + '/ay' : null,
            roi: prop.estimatedRoi ? `%${prop.estimatedRoi.toFixed(1)} Getiri` : null,
            features: getFeatures(prop),
            sourceUrl: prop.sourceUrl || null
        }))

        // Increment view count for returned properties
        const propertyIds = properties.map(p => p.id)
        if (propertyIds.length > 0) {
            await prisma.property.updateMany({
                where: { id: { in: propertyIds } },
                data: { viewCount: { increment: 1 } }
            })
        }

        return NextResponse.json({
            properties: formattedProperties,
            total: formattedProperties.length,
            filters: {
                propertyType,
                listingType,
                purpose,
                city,
                district,
                priceRange: minPrice || maxPrice ? { min: minPrice, max: maxPrice } : null,
                rooms
            }
        })
    } catch (error) {
        console.error('Error searching properties:', error)
        return NextResponse.json({ error: 'Failed to search properties' }, { status: 500 })
    }
}

function formatPrice(price: number, currency: string): string {
    if (currency === 'TRY' || currency === 'TL') {
        if (price >= 1000000) {
            return `${(price / 1000000).toFixed(1)} Milyon TL`
        }
        return `${price.toLocaleString('tr-TR')} TL`
    }

    if (currency === 'USD' || currency === '$') {
        if (price >= 1000000) {
            return `$${(price / 1000000).toFixed(1)}M`
        }
        return `$${price.toLocaleString('en-US')}`
    }

    if (currency === 'EUR' || currency === '€') {
        if (price >= 1000000) {
            return `€${(price / 1000000).toFixed(1)}M`
        }
        return `€${price.toLocaleString('de-DE')}`
    }

    return `${price.toLocaleString()} ${currency}`
}

function getBadge(prop: any): string | null {
    if (prop.isFeatured) return 'Öne Çıkan'
    if (prop.estimatedRoi && prop.estimatedRoi > 8) return 'Yüksek Getiri'
    if (prop.monthlyRent) return 'Yatırımlık'
    return null
}

function getFeatures(prop: any): string[] {
    const features: string[] = []
    if (prop.hasGarage) features.push('Garaj')
    if (prop.hasPool) features.push('Havuz')
    if (prop.hasGarden) features.push('Bahçe')
    if (prop.hasBalcony) features.push('Balkon')
    return features.slice(0, 3)
}

// POST - Natural language search (for AI-powered filtering)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { identifier, query, preferences } = body

        if (!identifier) {
            return NextResponse.json({ error: 'Chatbot identifier is required' }, { status: 400 })
        }

        // Find chatbot
        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Parse preferences into search parameters
        const searchParams: any = {
            chatbotId: chatbot.id,
            status: 'active'
        }

        if (preferences) {
            if (preferences.propertyType) searchParams.propertyType = preferences.propertyType
            if (preferences.listingType) searchParams.listingType = preferences.listingType
            if (preferences.city) searchParams.city = { contains: preferences.city, mode: 'insensitive' }
            if (preferences.district) searchParams.district = { contains: preferences.district, mode: 'insensitive' }
            if (preferences.rooms) searchParams.rooms = preferences.rooms

            if (preferences.budgetMin || preferences.budgetMax) {
                searchParams.price = {}
                if (preferences.budgetMin) searchParams.price.gte = preferences.budgetMin
                if (preferences.budgetMax) searchParams.price.lte = preferences.budgetMax
            }
        }

        // Determine ordering based on purpose
        let orderBy: any = { createdAt: 'desc' }
        if (preferences?.purpose === 'investment') {
            orderBy = [{ estimatedRoi: 'desc' }, { rentalYield: 'desc' }]
        }

        const properties = await prisma.property.findMany({
            where: searchParams,
            orderBy,
            take: 6,
            select: {
                id: true,
                title: true,
                propertyType: true,
                price: true,
                currency: true,
                city: true,
                district: true,
                rooms: true,
                area: true,
                images: true,
                monthlyRent: true,
                estimatedRoi: true,
            }
        })

        const formattedProperties = properties.map(prop => ({
            id: prop.id,
            title: prop.title,
            price: formatPrice(prop.price, prop.currency),
            location: prop.district ? `${prop.district}, ${prop.city}` : prop.city,
            rooms: prop.rooms,
            area: prop.area ? `${prop.area} m²` : null,
            image: prop.images?.[0] || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
            monthlyRent: prop.monthlyRent ? formatPrice(prop.monthlyRent, prop.currency) + '/ay' : null,
            roi: prop.estimatedRoi ? `%${prop.estimatedRoi.toFixed(1)} Getiri` : null,
        }))

        return NextResponse.json({
            properties: formattedProperties,
            total: formattedProperties.length,
            message: formattedProperties.length > 0
                ? `${formattedProperties.length} ilan bulundu`
                : 'Kriterlere uygun ilan bulunamadı'
        })
    } catch (error) {
        console.error('Error in natural language search:', error)
        return NextResponse.json({ error: 'Search failed' }, { status: 500 })
    }
}
