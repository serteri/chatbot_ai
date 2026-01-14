import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import { prisma } from '@/lib/db/prisma'
import * as cheerio from 'cheerio'

interface ScrapedProperty {
    title: string
    description: string
    price: number
    bedrooms: number
    bathrooms: number
    parking: number
    propertyType: string
    listingType: string
    address: string
    suburb: string
    city: string
    images: string[]
    sourceUrl: string
}

// Parse realestate.com.au URL
async function scrapeRealEstateDotComAu(url: string): Promise<ScrapedProperty | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-AU,en;q=0.9',
            }
        })

        if (!response.ok) {
            console.error('Failed to fetch URL:', response.status)
            return null
        }

        const html = await response.text()
        const $ = cheerio.load(html)

        // Extract property details from realestate.com.au
        const title = $('h1').first().text().trim() ||
            $('[data-testid="listing-details__summary-title"]').text().trim()

        // Price parsing
        const priceText = $('[data-testid="listing-details__summary-price"]').text().trim() ||
            $('.property-price').text().trim() ||
            $('[class*="price"]').first().text().trim()
        const price = parsePrice(priceText)

        // Property features
        const bedroomsText = $('[data-testid="property-features-text-container"]').find('[aria-label*="Bed"]').text() ||
            $('[class*="bedroom"]').text() ||
            $('span:contains("Bed")').parent().text()
        const bedrooms = parseInt(bedroomsText) || extractNumber(bedroomsText) || 0

        const bathroomsText = $('[data-testid="property-features-text-container"]').find('[aria-label*="Bath"]').text() ||
            $('[class*="bathroom"]').text()
        const bathrooms = parseInt(bathroomsText) || extractNumber(bathroomsText) || 0

        const parkingText = $('[data-testid="property-features-text-container"]').find('[aria-label*="Car"]').text() ||
            $('[class*="parking"]').text()
        const parking = parseInt(parkingText) || extractNumber(parkingText) || 0

        // Description
        const description = $('[data-testid="listing-details__description"]').text().trim() ||
            $('.property-description').text().trim() ||
            $('[class*="description"]').first().text().trim()

        // Address
        const address = $('[data-testid="listing-details__button-copy-address"]').text().trim() ||
            $('h1').first().text().trim() ||
            $('.property-address').text().trim()

        // Extract suburb from URL or address
        const urlParts = url.split('/')
        const suburb = extractSuburb(urlParts, address)

        // Property type from URL
        const propertyType = url.includes('property-house') ? 'house' :
            url.includes('property-unit') ? 'apartment' :
                url.includes('property-townhouse') ? 'townhouse' :
                    url.includes('property-land') ? 'land' : 'house'

        // Listing type
        const listingType = url.includes('/rent/') ? 'rent' : 'sale'

        // Images
        const images: string[] = []
        $('img[data-testid*="gallery"]').each((_, el) => {
            const src = $(el).attr('src') || $(el).attr('data-src')
            if (src && !src.includes('logo') && !src.includes('icon')) {
                images.push(src)
            }
        })
        // Fallback for other image selectors
        if (images.length === 0) {
            $('[class*="gallery"] img, [class*="carousel"] img').each((_, el) => {
                const src = $(el).attr('src') || $(el).attr('data-src')
                if (src && src.includes('property') && images.length < 10) {
                    images.push(src)
                }
            })
        }

        return {
            title: title || `${bedrooms} Bedroom ${propertyType} in ${suburb}`,
            description: description.substring(0, 2000),
            price,
            bedrooms,
            bathrooms,
            parking,
            propertyType,
            listingType,
            address,
            suburb,
            city: extractCity(address) || 'VIC',
            images: images.slice(0, 10),
            sourceUrl: url
        }
    } catch (error) {
        console.error('Scraping error:', error)
        return null
    }
}

// Parse Domain.com.au URL
async function scrapeDomainDotComAu(url: string): Promise<ScrapedProperty | null> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml',
            }
        })

        if (!response.ok) return null

        const html = await response.text()
        const $ = cheerio.load(html)

        const title = $('h1').first().text().trim()
        const priceText = $('[data-testid="listing-details__summary-price"]').text() ||
            $('[class*="price"]').first().text()
        const price = parsePrice(priceText)

        const bedrooms = parseInt($('[data-testid="property-features-beds"]').text()) || 0
        const bathrooms = parseInt($('[data-testid="property-features-baths"]').text()) || 0
        const parking = parseInt($('[data-testid="property-features-parking"]').text()) || 0

        const description = $('[data-testid="listing-details__description"]').text().trim()
        const address = $('[data-testid="address-line1"]').text().trim()

        const images: string[] = []
        $('[data-testid*="gallery"] img').each((_, el) => {
            const src = $(el).attr('src')
            if (src) images.push(src)
        })

        return {
            title,
            description,
            price,
            bedrooms,
            bathrooms,
            parking,
            propertyType: 'house',
            listingType: url.includes('/rent') ? 'rent' : 'sale',
            address,
            suburb: extractSuburb(url.split('/'), address),
            city: 'VIC',
            images,
            sourceUrl: url
        }
    } catch (error) {
        console.error('Domain scraping error:', error)
        return null
    }
}

// Helper functions
function parsePrice(priceText: string): number {
    if (!priceText) return 0

    // Remove non-numeric characters except decimals
    const cleaned = priceText.replace(/[^0-9.]/g, '')
    const price = parseFloat(cleaned)

    // Handle "1.2m" format
    if (priceText.toLowerCase().includes('m') && price < 100) {
        return price * 1000000
    }

    return price || 0
}

function extractNumber(text: string): number {
    const match = text.match(/\d+/)
    return match ? parseInt(match[0]) : 0
}

function extractSuburb(urlParts: string[], address: string): string {
    // Try to get suburb from URL
    for (const part of urlParts) {
        if (part.includes('-') && !part.includes('property')) {
            const suburb = part.split('-').slice(-2, -1)[0]
            if (suburb && suburb.length > 2) {
                return suburb.charAt(0).toUpperCase() + suburb.slice(1)
            }
        }
    }

    // Fall back to address parsing
    const addressParts = address.split(',')
    if (addressParts.length >= 2) {
        return addressParts[addressParts.length - 2].trim()
    }

    return 'Unknown'
}

function extractCity(address: string): string {
    const states = ['VIC', 'NSW', 'QLD', 'WA', 'SA', 'TAS', 'NT', 'ACT']
    for (const state of states) {
        if (address.toUpperCase().includes(state)) {
            return state
        }
    }
    return 'VIC'
}

// POST: Scrape property from URL
export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        const { url, chatbotId } = body

        if (!url || !chatbotId) {
            return NextResponse.json(
                { error: 'URL and chatbotId are required' },
                { status: 400 }
            )
        }

        // Verify chatbot ownership
        const chatbot = await prisma.chatbot.findFirst({
            where: {
                id: chatbotId,
                userId: session.user.id
            }
        })

        if (!chatbot) {
            return NextResponse.json(
                { error: 'Chatbot not found or unauthorized' },
                { status: 404 }
            )
        }

        // Determine which scraper to use
        let scrapedData: ScrapedProperty | null = null

        if (url.includes('realestate.com.au')) {
            scrapedData = await scrapeRealEstateDotComAu(url)
        } else if (url.includes('domain.com.au')) {
            scrapedData = await scrapeDomainDotComAu(url)
        } else {
            return NextResponse.json(
                { error: 'Unsupported website. Currently supports: realestate.com.au, domain.com.au' },
                { status: 400 }
            )
        }

        if (!scrapedData) {
            return NextResponse.json(
                { error: 'Failed to scrape property data. Please check the URL.' },
                { status: 400 }
            )
        }

        // Check if property already exists
        const existingProperty = await prisma.property.findFirst({
            where: {
                chatbotId,
                sourceUrl: url
            }
        })

        if (existingProperty) {
            // Update existing property
            const updated = await prisma.property.update({
                where: { id: existingProperty.id },
                data: {
                    title: scrapedData.title,
                    description: scrapedData.description,
                    price: scrapedData.price,
                    bedrooms: scrapedData.bedrooms,
                    bathrooms: scrapedData.bathrooms,
                    propertyType: scrapedData.propertyType,
                    listingType: scrapedData.listingType,
                    address: scrapedData.address,
                    district: scrapedData.suburb,
                    city: scrapedData.city,
                    country: 'Australia',
                    currency: 'AUD',
                    images: scrapedData.images,
                    source: 'scrape',
                    updatedAt: new Date()
                }
            })

            return NextResponse.json({
                success: true,
                property: updated,
                action: 'updated'
            })
        }

        // Create new property
        const property = await prisma.property.create({
            data: {
                chatbotId,
                title: scrapedData.title,
                description: scrapedData.description,
                price: scrapedData.price,
                bedrooms: scrapedData.bedrooms,
                bathrooms: scrapedData.bathrooms,
                propertyType: scrapedData.propertyType,
                listingType: scrapedData.listingType,
                address: scrapedData.address,
                district: scrapedData.suburb,
                city: scrapedData.city,
                country: 'Australia',
                currency: 'AUD',
                images: scrapedData.images,
                source: 'scrape',
                sourceUrl: url,
                status: 'active'
            }
        })

        return NextResponse.json({
            success: true,
            property,
            action: 'created'
        })

    } catch (error) {
        console.error('Property scrape error:', error)
        return NextResponse.json(
            { error: 'Failed to process property URL' },
            { status: 500 }
        )
    }
}

// GET: Preview scrape without saving
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const url = searchParams.get('url')

        if (!url) {
            return NextResponse.json(
                { error: 'URL parameter required' },
                { status: 400 }
            )
        }

        let scrapedData: ScrapedProperty | null = null

        if (url.includes('realestate.com.au')) {
            scrapedData = await scrapeRealEstateDotComAu(url)
        } else if (url.includes('domain.com.au')) {
            scrapedData = await scrapeDomainDotComAu(url)
        } else {
            return NextResponse.json(
                { error: 'Unsupported website' },
                { status: 400 }
            )
        }

        if (!scrapedData) {
            return NextResponse.json(
                { error: 'Failed to scrape property' },
                { status: 400 }
            )
        }

        return NextResponse.json({
            success: true,
            preview: scrapedData
        })

    } catch (error) {
        console.error('Preview error:', error)
        return NextResponse.json(
            { error: 'Failed to preview property' },
            { status: 500 }
        )
    }
}
