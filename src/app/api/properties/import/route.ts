import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// XML Parser helper - simple implementation
function parseXMLToProperties(xmlString: string, format: string): any[] {
    const properties: any[] = []

    // Simple regex-based XML parsing (for production, use a proper XML parser like xml2js)
    const getTagContent = (xml: string, tag: string): string => {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
        const match = xml.match(regex)
        return match ? match[1].trim() : ''
    }

    const getAttributeValue = (xml: string, tag: string, attr: string): string => {
        const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i')
        const match = xml.match(regex)
        return match ? match[1] : ''
    }

    // Find all property/listing items
    const itemRegex = /<(property|listing|ilan|item)[^>]*>[\s\S]*?<\/\1>/gi
    const items = xmlString.match(itemRegex) || []

    for (const item of items) {
        try {
            let property: any = {}

            if (format === 'sahibinden' || format === 'generic') {
                // Sahibinden.com style format
                property = {
                    externalId: getTagContent(item, 'id') || getTagContent(item, 'ilan_no'),
                    title: getTagContent(item, 'title') || getTagContent(item, 'baslik'),
                    description: getTagContent(item, 'description') || getTagContent(item, 'aciklama'),
                    propertyType: mapPropertyType(getTagContent(item, 'category') || getTagContent(item, 'kategori')),
                    listingType: mapListingType(getTagContent(item, 'type') || getTagContent(item, 'ilan_tipi')),
                    price: parseFloat(getTagContent(item, 'price') || getTagContent(item, 'fiyat') || '0'),
                    currency: getTagContent(item, 'currency') || 'TRY',
                    city: getTagContent(item, 'city') || getTagContent(item, 'il') || getTagContent(item, 'sehir'),
                    district: getTagContent(item, 'district') || getTagContent(item, 'ilce'),
                    address: getTagContent(item, 'address') || getTagContent(item, 'adres'),
                    rooms: getTagContent(item, 'rooms') || getTagContent(item, 'oda_sayisi'),
                    area: parseFloat(getTagContent(item, 'area') || getTagContent(item, 'm2') || getTagContent(item, 'metrekare') || '0'),
                    floorNumber: parseInt(getTagContent(item, 'floor') || getTagContent(item, 'bulundugu_kat') || '0'),
                    totalFloors: parseInt(getTagContent(item, 'total_floors') || getTagContent(item, 'kat_sayisi') || '0'),
                    buildingAge: parseInt(getTagContent(item, 'building_age') || getTagContent(item, 'bina_yasi') || '0'),
                    images: extractImages(item),
                    latitude: parseFloat(getTagContent(item, 'latitude') || getTagContent(item, 'enlem') || '0') || undefined,
                    longitude: parseFloat(getTagContent(item, 'longitude') || getTagContent(item, 'boylam') || '0') || undefined,
                }
            } else if (format === 'hepsiemlak') {
                // Hepsiemlak style format
                property = {
                    externalId: getTagContent(item, 'listing_id'),
                    title: getTagContent(item, 'listing_title'),
                    description: getTagContent(item, 'listing_description'),
                    propertyType: mapPropertyType(getTagContent(item, 'property_type')),
                    listingType: mapListingType(getTagContent(item, 'listing_type')),
                    price: parseFloat(getTagContent(item, 'price') || '0'),
                    currency: getTagContent(item, 'currency') || 'TRY',
                    city: getTagContent(item, 'city'),
                    district: getTagContent(item, 'county'),
                    address: getTagContent(item, 'address'),
                    rooms: getTagContent(item, 'room_count'),
                    area: parseFloat(getTagContent(item, 'gross_area') || getTagContent(item, 'net_area') || '0'),
                    floorNumber: parseInt(getTagContent(item, 'floor_number') || '0'),
                    totalFloors: parseInt(getTagContent(item, 'floor_count') || '0'),
                    buildingAge: parseInt(getTagContent(item, 'building_age') || '0'),
                    images: extractImages(item),
                }
            } else if (format === 'emlakjet') {
                // EmlakJet style format
                property = {
                    externalId: getTagContent(item, 'advert_id'),
                    title: getTagContent(item, 'advert_title'),
                    description: getTagContent(item, 'advert_text'),
                    propertyType: mapPropertyType(getTagContent(item, 'estate_type')),
                    listingType: mapListingType(getTagContent(item, 'advert_type')),
                    price: parseFloat(getTagContent(item, 'price') || '0'),
                    currency: getTagContent(item, 'price_currency') || 'TRY',
                    city: getTagContent(item, 'city_name'),
                    district: getTagContent(item, 'district_name'),
                    rooms: getTagContent(item, 'room'),
                    area: parseFloat(getTagContent(item, 'square_meter') || '0'),
                    images: extractImages(item),
                }
            }

            // Clean up undefined/null values
            Object.keys(property).forEach(key => {
                if (property[key] === undefined || property[key] === null || property[key] === '' ||
                    (typeof property[key] === 'number' && isNaN(property[key]))) {
                    delete property[key]
                }
            })

            // Only add if we have essential fields
            if (property.title && property.price > 0 && property.city) {
                properties.push(property)
            }
        } catch (e) {
            console.error('Error parsing property item:', e)
        }
    }

    return properties
}

function extractImages(xml: string): string[] {
    const images: string[] = []

    // Try different image tag formats
    const patterns = [
        /<image[^>]*>([^<]+)<\/image>/gi,
        /<img[^>]*src="([^"]+)"/gi,
        /<photo[^>]*>([^<]+)<\/photo>/gi,
        /<resim[^>]*>([^<]+)<\/resim>/gi,
        /<url>([^<]+)<\/url>/gi,
    ]

    for (const pattern of patterns) {
        let match
        while ((match = pattern.exec(xml)) !== null) {
            const url = match[1].trim()
            if (url.startsWith('http') && !images.includes(url)) {
                images.push(url)
            }
        }
    }

    return images.slice(0, 10) // Max 10 images
}

function mapPropertyType(type: string): string {
    const typeMap: Record<string, string> = {
        'daire': 'apartment',
        'apartment': 'apartment',
        'flat': 'apartment',
        'villa': 'villa',
        'ev': 'house',
        'house': 'house',
        'mustakil': 'house',
        'arsa': 'land',
        'land': 'land',
        'tarla': 'land',
        'isyeri': 'commercial',
        'commercial': 'commercial',
        'ofis': 'commercial',
        'office': 'commercial',
        'dukkan': 'commercial',
        'shop': 'commercial',
    }
    return typeMap[type?.toLowerCase()] || 'apartment'
}

function mapListingType(type: string): string {
    const typeMap: Record<string, string> = {
        'satilik': 'sale',
        'sale': 'sale',
        'sell': 'sale',
        'kiralik': 'rent',
        'rent': 'rent',
        'rental': 'rent',
    }
    return typeMap[type?.toLowerCase()] || 'sale'
}

// POST - Import properties from XML
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const contentType = request.headers.get('content-type') || ''
        let xmlString: string
        let chatbotId: string
        let format: string = 'generic'
        let sourceUrl: string | undefined

        if (contentType.includes('multipart/form-data')) {
            // Handle file upload
            const formData = await request.formData()
            const file = formData.get('file') as File
            chatbotId = formData.get('chatbotId') as string
            format = (formData.get('format') as string) || 'generic'
            sourceUrl = formData.get('sourceUrl') as string

            if (!file) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 })
            }

            xmlString = await file.text()
        } else if (contentType.includes('application/json')) {
            // Handle JSON with XML string or URL
            const body = await request.json()
            chatbotId = body.chatbotId
            format = body.format || 'generic'
            sourceUrl = body.sourceUrl

            if (body.xmlUrl) {
                // Fetch XML from URL
                const response = await fetch(body.xmlUrl)
                if (!response.ok) {
                    return NextResponse.json({ error: 'Failed to fetch XML from URL' }, { status: 400 })
                }
                xmlString = await response.text()
                sourceUrl = body.xmlUrl
            } else if (body.xmlContent) {
                xmlString = body.xmlContent
            } else {
                return NextResponse.json({ error: 'No XML content or URL provided' }, { status: 400 })
            }
        } else {
            return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
        }

        if (!chatbotId) {
            return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 })
        }

        // Verify chatbot ownership
        const chatbot = await prisma.chatbot.findFirst({
            where: {
                id: chatbotId,
                userId: session.user.id
            }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        // Parse XML
        const parsedProperties = parseXMLToProperties(xmlString, format)

        if (parsedProperties.length === 0) {
            return NextResponse.json({
                error: 'No valid properties found in XML',
                hint: 'Make sure your XML contains property/listing elements with title, price, and city'
            }, { status: 400 })
        }

        // Import properties
        const results = {
            imported: 0,
            updated: 0,
            skipped: 0,
            errors: [] as string[]
        }

        for (const prop of parsedProperties) {
            try {
                // Check if property with same externalId exists
                if (prop.externalId) {
                    const existing = await prisma.property.findFirst({
                        where: {
                            chatbotId,
                            externalId: prop.externalId
                        }
                    })

                    if (existing) {
                        // Update existing
                        await prisma.property.update({
                            where: { id: existing.id },
                            data: {
                                ...prop,
                                source: 'xml',
                                sourceUrl,
                                updatedAt: new Date()
                            }
                        })
                        results.updated++
                        continue
                    }
                }

                // Create new property
                await prisma.property.create({
                    data: {
                        chatbotId,
                        ...prop,
                        propertyType: prop.propertyType || 'apartment',
                        listingType: prop.listingType || 'sale',
                        country: prop.country || 'Turkey',
                        source: 'xml',
                        sourceUrl,
                        status: 'active'
                    }
                })
                results.imported++
            } catch (e: any) {
                results.errors.push(`Failed to import: ${prop.title} - ${e.message}`)
                results.skipped++
            }
        }

        return NextResponse.json({
            success: true,
            message: `Import completed: ${results.imported} new, ${results.updated} updated, ${results.skipped} skipped`,
            results
        })
    } catch (error) {
        console.error('Error importing properties:', error)
        return NextResponse.json({ error: 'Failed to import properties' }, { status: 500 })
    }
}
