import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'

// ==================== XML PARSERS ====================

function getTagContent(xml: string, tag: string): string {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i')
    const match = xml.match(regex)
    return match ? match[1].trim() : ''
}

function getAttributeValue(xml: string, tag: string, attr: string): string {
    const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i')
    const match = xml.match(regex)
    return match ? match[1] : ''
}

// Parse REAXML format (Australian real estate standard)
function parseREAXML(xmlString: string): any[] {
    const properties: any[] = []

    // Find all property types: residential, rental, commercial, land, rural, business
    const propertyTypes = ['residential', 'rental', 'commercial', 'commercialLand', 'land', 'rural', 'business', 'holidayRental']

    for (const pType of propertyTypes) {
        const regex = new RegExp(`<${pType}[^>]*>[\\s\\S]*?</${pType}>`, 'gi')
        const items = xmlString.match(regex) || []

        for (const item of items) {
            try {
                // Get status attribute
                const status = getAttributeValue(item, pType, 'status')
                if (status === 'withdrawn' || status === 'offmarket') continue

                // Address
                const address = getTagContent(item, 'address')
                const streetNumber = getTagContent(address, 'streetNumber')
                const street = getTagContent(address, 'street')
                const suburb = getTagContent(address, 'suburb')
                const state = getTagContent(address, 'state')
                const postcode = getTagContent(address, 'postcode')
                const subNumber = getTagContent(address, 'subNumber')

                // Full address
                const fullAddress = [
                    subNumber ? `Unit ${subNumber}` : '',
                    streetNumber,
                    street
                ].filter(Boolean).join(' ')

                // Features
                const features = getTagContent(item, 'features')
                const bedrooms = parseInt(getTagContent(features, 'bedrooms')) || 0
                const bathrooms = parseInt(getTagContent(features, 'bathrooms')) || 0
                const garages = parseInt(getTagContent(features, 'garages')) || 0
                const carports = parseInt(getTagContent(features, 'carports')) || 0

                // Price
                const priceTag = getTagContent(item, 'price')
                const priceDisplay = getAttributeValue(item, 'price', 'display')
                const priceValue = parseFloat(priceTag.replace(/[^0-9.]/g, '')) || 0
                const priceView = getTagContent(item, 'priceView')

                // Land/Building details
                const landDetails = getTagContent(item, 'landDetails')
                const landArea = parseFloat(getTagContent(landDetails, 'area').replace(/[^0-9.]/g, '')) || 0

                const buildingDetails = getTagContent(item, 'buildingDetails')
                const buildingArea = parseFloat(getTagContent(buildingDetails, 'area').replace(/[^0-9.]/g, '')) || 0

                // Images
                const images: string[] = []
                const objectsSection = getTagContent(item, 'objects')
                const imgMatches = objectsSection.match(/<img[^>]*id="[^"]*"[^>]*url="([^"]+)"/gi) || []
                for (const imgMatch of imgMatches) {
                    const urlMatch = imgMatch.match(/url="([^"]+)"/)
                    if (urlMatch && urlMatch[1]) {
                        images.push(urlMatch[1])
                    }
                }

                // Also try file attribute
                const fileMatches = objectsSection.match(/<img[^>]*file="([^"]+)"/gi) || []
                for (const fileMatch of fileMatches) {
                    const urlMatch = fileMatch.match(/file="([^"]+)"/)
                    if (urlMatch && urlMatch[1] && urlMatch[1].startsWith('http')) {
                        images.push(urlMatch[1])
                    }
                }

                // Description
                const description = getTagContent(item, 'description')
                    .replace(/<!\[CDATA\[/g, '')
                    .replace(/\]\]>/g, '')
                    .trim()

                // Headline/Title
                const headline = getTagContent(item, 'headline')
                    .replace(/<!\[CDATA\[/g, '')
                    .replace(/\]\]>/g, '')
                    .trim()

                // External ID
                const uniqueID = getAttributeValue(item, pType, 'modTime') + '-' + suburb + '-' + streetNumber
                const agentID = getTagContent(item, 'agentID')

                // Listing type (sale or rent)
                const listingType = pType === 'rental' || pType === 'holidayRental' ? 'rent' : 'sale'

                // Property type mapping
                let propertyType = 'house'
                const category = getTagContent(item, 'category')?.toLowerCase() || ''
                if (category.includes('apartment') || category.includes('unit') || category.includes('flat')) {
                    propertyType = 'apartment'
                } else if (category.includes('land') || pType === 'land' || pType === 'commercialLand') {
                    propertyType = 'land'
                } else if (pType === 'commercial' || pType === 'business') {
                    propertyType = 'commercial'
                } else if (category.includes('villa')) {
                    propertyType = 'villa'
                }

                const property = {
                    externalId: agentID || uniqueID,
                    title: headline || `${bedrooms} Bed ${propertyType} in ${suburb}`,
                    description,
                    propertyType,
                    listingType,
                    price: priceValue,
                    priceText: priceView || priceTag,
                    currency: 'AUD',
                    address: fullAddress,
                    suburb,
                    city: state,
                    state,
                    postcode,
                    country: 'Australia',
                    bedrooms,
                    bathrooms,
                    parking: garages + carports,
                    landArea,
                    buildingArea: buildingArea || undefined,
                    images: images.slice(0, 10),
                    status: status === 'sold' ? 'sold' : status === 'leased' ? 'rented' : 'active'
                }

                // Clean up undefined values
                Object.keys(property).forEach(key => {
                    if (property[key as keyof typeof property] === undefined ||
                        property[key as keyof typeof property] === '' ||
                        (typeof property[key as keyof typeof property] === 'number' && isNaN(property[key as keyof typeof property] as number))) {
                        delete property[key as keyof typeof property]
                    }
                })

                if (property.title && suburb) {
                    properties.push(property)
                }
            } catch (e) {
                console.error('Error parsing REAXML property:', e)
            }
        }
    }

    return properties
}

// Parse Turkish formats (sahibinden, hepsiemlak, emlakjet)
function parseTurkishXML(xmlString: string, format: string): any[] {
    const properties: any[] = []

    const itemRegex = /<(property|listing|ilan|item)[^>]*>[\s\S]*?<\/\1>/gi
    const items = xmlString.match(itemRegex) || []

    for (const item of items) {
        try {
            let property: any = {}

            if (format === 'sahibinden' || format === 'generic') {
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
                    area: parseFloat(getTagContent(item, 'area') || getTagContent(item, 'm2') || '0'),
                    images: extractImages(item),
                }
            } else if (format === 'hepsiemlak') {
                property = {
                    externalId: getTagContent(item, 'listing_id'),
                    title: getTagContent(item, 'listing_title'),
                    description: getTagContent(item, 'listing_description'),
                    propertyType: mapPropertyType(getTagContent(item, 'property_type')),
                    listingType: mapListingType(getTagContent(item, 'listing_type')),
                    price: parseFloat(getTagContent(item, 'price') || '0'),
                    currency: 'TRY',
                    city: getTagContent(item, 'city'),
                    district: getTagContent(item, 'county'),
                    rooms: getTagContent(item, 'room_count'),
                    area: parseFloat(getTagContent(item, 'gross_area') || '0'),
                    images: extractImages(item),
                }
            } else if (format === 'emlakjet') {
                property = {
                    externalId: getTagContent(item, 'advert_id'),
                    title: getTagContent(item, 'advert_title'),
                    description: getTagContent(item, 'advert_text'),
                    propertyType: mapPropertyType(getTagContent(item, 'estate_type')),
                    listingType: mapListingType(getTagContent(item, 'advert_type')),
                    price: parseFloat(getTagContent(item, 'price') || '0'),
                    currency: 'TRY',
                    city: getTagContent(item, 'city_name'),
                    district: getTagContent(item, 'district_name'),
                    rooms: getTagContent(item, 'room'),
                    area: parseFloat(getTagContent(item, 'square_meter') || '0'),
                    images: extractImages(item),
                }
            }

            // Clean up
            Object.keys(property).forEach(key => {
                if (property[key] === undefined || property[key] === '' ||
                    (typeof property[key] === 'number' && isNaN(property[key]))) {
                    delete property[key]
                }
            })

            if (property.title && property.price > 0 && property.city) {
                properties.push(property)
            }
        } catch (e) {
            console.error('Error parsing Turkish XML property:', e)
        }
    }

    return properties
}

function extractImages(xml: string): string[] {
    const images: string[] = []
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

    return images.slice(0, 10)
}

function mapPropertyType(type: string): string {
    const typeMap: Record<string, string> = {
        'daire': 'apartment', 'apartment': 'apartment', 'flat': 'apartment', 'unit': 'apartment',
        'villa': 'villa',
        'ev': 'house', 'house': 'house', 'mustakil': 'house',
        'arsa': 'land', 'land': 'land', 'tarla': 'land',
        'isyeri': 'commercial', 'commercial': 'commercial', 'ofis': 'commercial', 'office': 'commercial',
    }
    return typeMap[type?.toLowerCase()] || 'apartment'
}

function mapListingType(type: string): string {
    const typeMap: Record<string, string> = {
        'satilik': 'sale', 'sale': 'sale', 'sell': 'sale',
        'kiralik': 'rent', 'rent': 'rent', 'rental': 'rent',
    }
    return typeMap[type?.toLowerCase()] || 'sale'
}

// ==================== WORDPRESS WP-JSON ====================

async function fetchWordPressProperties(wpUrl: string, postType: string = 'property'): Promise<any[]> {
    const properties: any[] = []

    try {
        // Try common WP REST API endpoints
        const endpoints = [
            `${wpUrl}/wp-json/wp/v2/${postType}`,
            `${wpUrl}/wp-json/wp/v2/posts?categories=property`,
            `${wpUrl}/wp-json/wp/v2/wpsight-listing`, // WPCasa
            `${wpUrl}/wp-json/developer_developer/v1/developer`, // Developer theme
        ]

        for (const endpoint of endpoints) {
            try {
                const response = await fetch(`${endpoint}?per_page=100`, {
                    headers: { 'Accept': 'application/json' }
                })

                if (response.ok) {
                    const data = await response.json()
                    if (Array.isArray(data) && data.length > 0) {
                        for (const item of data) {
                            const property = mapWordPressProperty(item)
                            if (property) {
                                properties.push(property)
                            }
                        }
                        break // Found properties, stop trying other endpoints
                    }
                }
            } catch (e) {
                // Try next endpoint
            }
        }
    } catch (error) {
        console.error('WordPress fetch error:', error)
    }

    return properties
}

function mapWordPressProperty(item: any): any | null {
    try {
        // Handle different WP property plugin structures
        const meta = item.meta || item.acf || {}

        // Try to get title
        const title = item.title?.rendered ||
            item.title ||
            meta.property_title ||
            meta._property_title ||
            ''

        if (!title) return null

        // Try to get price
        const price = parseFloat(
            meta.price ||
            meta._price ||
            meta.property_price ||
            meta._property_price ||
            item.price ||
            '0'
        )

        // Try to get address/location
        const address = meta.address ||
            meta._address ||
            meta.property_address ||
            meta._property_address ||
            item.address ||
            ''

        const suburb = meta.suburb ||
            meta._suburb ||
            meta.location ||
            meta._location ||
            ''

        const city = meta.city ||
            meta._city ||
            meta.property_city ||
            ''

        // Try to get bedrooms/bathrooms
        const bedrooms = parseInt(meta.bedrooms || meta._bedrooms || meta.property_bedrooms || '0')
        const bathrooms = parseInt(meta.bathrooms || meta._bathrooms || meta.property_bathrooms || '0')

        // Try to get images
        const images: string[] = []
        if (item._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
            images.push(item._embedded['wp:featuredmedia'][0].source_url)
        }
        if (meta.images && Array.isArray(meta.images)) {
            images.push(...meta.images.map((img: any) => img.url || img).filter(Boolean))
        }
        if (meta.gallery && Array.isArray(meta.gallery)) {
            images.push(...meta.gallery.map((img: any) => img.url || img).filter(Boolean))
        }

        // Property type
        const propertyType = mapPropertyType(
            meta.property_type ||
            meta._property_type ||
            item.property_type ||
            'house'
        )

        // Listing type
        const listingType = mapListingType(
            meta.listing_type ||
            meta._listing_type ||
            item.listing_type ||
            'sale'
        )

        return {
            externalId: `wp-${item.id}`,
            title: title.replace(/<[^>]+>/g, ''), // Strip HTML
            description: item.content?.rendered?.replace(/<[^>]+>/g, '') || item.excerpt?.rendered?.replace(/<[^>]+>/g, '') || '',
            propertyType,
            listingType,
            price,
            currency: meta.currency || 'AUD',
            address,
            suburb,
            city,
            bedrooms,
            bathrooms,
            images: images.slice(0, 10),
            sourceUrl: item.link
        }
    } catch (e) {
        return null
    }
}

// ==================== MAIN API ====================

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const contentType = request.headers.get('content-type') || ''
        let parsedProperties: any[] = []
        let chatbotId: string
        let format: string = 'generic'
        let sourceUrl: string | undefined
        let sourceType: string = 'xml'

        if (contentType.includes('multipart/form-data')) {
            const formData = await request.formData()
            const file = formData.get('file') as File
            chatbotId = formData.get('chatbotId') as string
            format = (formData.get('format') as string) || 'generic'
            sourceUrl = formData.get('sourceUrl') as string

            if (!file) {
                return NextResponse.json({ error: 'No file provided' }, { status: 400 })
            }

            const xmlString = await file.text()

            // Detect format
            if (xmlString.includes('propertyList') || xmlString.includes('<residential') || xmlString.includes('<rental')) {
                parsedProperties = parseREAXML(xmlString)
                sourceType = 'reaxml'
            } else {
                parsedProperties = parseTurkishXML(xmlString, format)
                sourceType = 'xml'
            }
        } else if (contentType.includes('application/json')) {
            const body = await request.json()
            chatbotId = body.chatbotId
            format = body.format || 'generic'
            sourceUrl = body.sourceUrl

            // WordPress WP-JSON
            if (body.wordpressUrl) {
                parsedProperties = await fetchWordPressProperties(body.wordpressUrl, body.postType)
                sourceUrl = body.wordpressUrl
                sourceType = 'wordpress'
            }
            // XML URL
            else if (body.xmlUrl) {
                const response = await fetch(body.xmlUrl)
                if (!response.ok) {
                    return NextResponse.json({ error: 'Failed to fetch XML from URL' }, { status: 400 })
                }
                const xmlString = await response.text()
                sourceUrl = body.xmlUrl

                // Auto-detect format
                if (xmlString.includes('propertyList') || xmlString.includes('<residential') || xmlString.includes('<rental')) {
                    parsedProperties = parseREAXML(xmlString)
                    sourceType = 'reaxml'
                } else {
                    parsedProperties = parseTurkishXML(xmlString, format)
                    sourceType = 'xml'
                }
            }
            // XML content string
            else if (body.xmlContent) {
                const xmlString = body.xmlContent

                if (xmlString.includes('propertyList') || xmlString.includes('<residential') || xmlString.includes('<rental')) {
                    parsedProperties = parseREAXML(xmlString)
                    sourceType = 'reaxml'
                } else {
                    parsedProperties = parseTurkishXML(xmlString, format)
                    sourceType = 'xml'
                }
            } else {
                return NextResponse.json({ error: 'No XML content, URL, or WordPress URL provided' }, { status: 400 })
            }
        } else {
            return NextResponse.json({ error: 'Unsupported content type' }, { status: 400 })
        }

        if (!chatbotId) {
            return NextResponse.json({ error: 'chatbotId is required' }, { status: 400 })
        }

        // Verify chatbot ownership
        const chatbot = await prisma.chatbot.findFirst({
            where: { id: chatbotId, userId: session.user.id }
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 })
        }

        if (parsedProperties.length === 0) {
            return NextResponse.json({
                error: 'No valid properties found',
                hint: sourceType === 'wordpress'
                    ? 'Make sure WordPress REST API is enabled and property posts exist'
                    : 'Make sure XML contains valid property elements'
            }, { status: 400 })
        }

        // Import properties
        const results = {
            imported: 0,
            updated: 0,
            skipped: 0,
            errors: [] as string[],
            sourceType
        }

        for (const prop of parsedProperties) {
            try {
                if (prop.externalId) {
                    const existing = await prisma.property.findFirst({
                        where: { chatbotId, externalId: prop.externalId }
                    })

                    if (existing) {
                        await prisma.property.update({
                            where: { id: existing.id },
                            data: { ...prop, source: sourceType, sourceUrl, updatedAt: new Date() }
                        })
                        results.updated++
                        continue
                    }
                }

                await prisma.property.create({
                    data: {
                        chatbotId,
                        ...prop,
                        propertyType: prop.propertyType || 'apartment',
                        listingType: prop.listingType || 'sale',
                        country: prop.country || (sourceType === 'reaxml' ? 'Australia' : 'Turkey'),
                        source: sourceType,
                        sourceUrl,
                        status: prop.status || 'active'
                    }
                })
                results.imported++
            } catch (e: any) {
                results.errors.push(`Failed: ${prop.title} - ${e.message}`)
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
