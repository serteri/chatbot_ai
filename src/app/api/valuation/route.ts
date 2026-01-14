import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import OpenAI from 'openai'

interface ValuationRequest {
    suburb: string
    state?: string
    propertyType: string  // house, apartment, townhouse, land
    bedrooms: number
    bathrooms: number
    carSpaces?: number
    landArea?: number     // sqm
    buildingArea?: number // sqm
    features?: string[]   // pool, garage, renovated, etc.
    condition?: string    // excellent, good, fair, needs-work
}

interface ValuationResponse {
    estimatedValue: {
        min: number
        max: number
        median: number
    }
    confidence: 'high' | 'medium' | 'low'
    currency: string
    reasoning: string
    factors: {
        factor: string
        impact: 'positive' | 'negative' | 'neutral'
        description: string
    }[]
    marketInsights: string
    disclaimer: string
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json() as ValuationRequest

        // Validate required fields
        if (!body.suburb || !body.propertyType || body.bedrooms === undefined) {
            return NextResponse.json({
                error: 'Missing required fields: suburb, propertyType, bedrooms'
            }, { status: 400 })
        }

        // Check for OpenAI API key
        const openaiApiKey = process.env.OPENAI_API_KEY
        if (!openaiApiKey) {
            // Return mock data if no API key
            return NextResponse.json(getMockValuation(body))
        }

        const openai = new OpenAI({ apiKey: openaiApiKey })

        const prompt = buildValuationPrompt(body)

        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an expert Australian property valuer with deep knowledge of January 2025 market conditions.

CRITICAL: Use these ACCURATE January 2025 median HOUSE prices. These have increased significantly in 2024-2025:

BRISBANE (QLD) - Median House: $1,100,000 | Unit: $620,000
Premium (blue chip):
- New Farm: $2.8M, Teneriffe: $2.5M, Ascot: $2.6M, Hamilton: $2.3M
- Bulimba: $2.0M, Hawthorne: $1.9M, Clayfield: $1.8M

Inner-city (5km from CBD):
- Paddington: $1.7M, West End: $1.5M, Newstead: $1.6M
- Albion: $1.4M, Fortitude Valley: $1.2M, Kangaroo Point: $1.3M
- Windsor: $1.5M, Wilston: $1.6M, Red Hill: $1.7M

Middle ring (5-10km):
- Toowong: $1.5M, Indooroopilly: $1.6M, St Lucia: $1.7M
- Coorparoo: $1.4M, Camp Hill: $1.5M, Norman Park: $1.5M

SYDNEY (NSW) - Median House: $1,600,000 | Unit: $880,000
Premium:
- Vaucluse: $8M+, Point Piper: $15M+, Double Bay: $5.5M, Mosman: $5M
- Paddington NSW: $3.2M, Woollahra: $4M, Bellevue Hill: $5M

Inner-city:
- Surry Hills: $2.2M, Newtown: $2.0M, Balmain: $2.5M
- Bondi Beach: $4M, Manly: $4.2M, Coogee: $3.5M

MELBOURNE (VIC) - Median House: $1,150,000 | Unit: $620,000
Premium:
- Toorak: $5.5M, Brighton: $3.2M, South Yarra: $2.8M, Armadale: $2.5M

Inner-city:
- Richmond: $1.8M, Fitzroy: $1.9M, Carlton: $1.6M, St Kilda: $1.7M
- Brunswick: $1.4M, Northcote: $1.6M, Hawthorn: $2.2M

PERTH (WA) - Median House: $850,000 | Unit: $520,000
Premium:
- Cottesloe: $3M, Dalkeith: $3.5M, Peppermint Grove: $5M+, City Beach: $2.5M

ADELAIDE (SA) - Median House: $850,000 | Unit: $480,000
Premium:
- Unley: $1.6M, Norwood: $1.4M, North Adelaide: $1.5M

GOLD COAST (QLD) - Median House: $1,050,000
- Main Beach: $2.5M, Surfers Paradise: $1.8M, Burleigh Heads: $1.6M

VALUATION RULES:
1. These are MINIMUM baseline prices for standard 3bed/2bath houses
2. Each bedroom above 3 adds 12-18% to value
3. Each bathroom above 2 adds 5-8% to value
4. Houses with land are typically 50-70% more valuable than units
5. Properties under 500sqm land subtract 10-15%
6. Renovated/modern adds 10-20%, dated/needs work subtract 15-25%
7. Provide ranges: min should be ~12% below median, max ~12% above
8. Always respond in valid JSON format only.`
                },
                {
                    role: 'user',
                    content: prompt
                }
            ],
            response_format: { type: 'json_object' }
        })

        const responseText = completion.choices[0]?.message?.content
        if (!responseText) {
            throw new Error('No response from AI')
        }

        const valuation = JSON.parse(responseText) as ValuationResponse
        valuation.disclaimer = 'This is an AI-generated estimate based on 2025 market projections. Actual values may vary.'
        valuation.currency = 'AUD'

        return NextResponse.json(valuation)

    } catch (error) {
        console.error('Valuation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate valuation' },
            { status: 500 }
        )
    }
}

function buildValuationPrompt(data: ValuationRequest): string {
    return `Provide a property valuation estimate in JSON format based on 2025 market data for:

Location: ${data.suburb}${data.state ? `, ${data.state}` : ''}, Australia
Property Type: ${data.propertyType}
Bedrooms: ${data.bedrooms}
Bathrooms: ${data.bathrooms}
${data.carSpaces ? `Car Spaces: ${data.carSpaces}` : ''}
${data.landArea ? `Land Area: ${data.landArea} sqm` : ''}
${data.buildingArea ? `Building Area: ${data.buildingArea} sqm` : ''}
${data.features?.length ? `Features: ${data.features.join(', ')}` : ''}
${data.condition ? `Condition: ${data.condition}` : ''}

IMPORTANT: All monetary values MUST be plain integers WITHOUT any formatting, symbols, or abbreviations.
- CORRECT: 1400000
- WRONG: "$1.4M", "1,400,000", "$1,400,000", "1.4M"

Respond with this exact JSON structure:
{
  "estimatedValue": {
    "min": 1232000,
    "max": 1568000,
    "median": 1400000
  },
  "confidence": "high",
  "reasoning": "2-3 sentences explaining the valuation",
  "factors": [
    {
      "factor": "factor name",
      "impact": "positive|negative|neutral",
      "description": "brief explanation"
    }
  ],
  "marketInsights": "1-2 sentences about the local market"
}`
}

function getMockValuation(data: ValuationRequest): ValuationResponse {
    // Simple mock calculation for demo purposes
    const basePrice = getBasePrice(data.propertyType, data.suburb)
    const bedroomMultiplier = 1 + (data.bedrooms - 3) * 0.15
    const bathroomMultiplier = 1 + (data.bathrooms - 1) * 0.05

    const median = Math.round(basePrice * bedroomMultiplier * bathroomMultiplier)
    const min = Math.round(median * 0.85)
    const max = Math.round(median * 1.15)

    return {
        estimatedValue: { min, max, median },
        confidence: 'medium',
        currency: 'AUD',
        reasoning: `Based on comparable ${data.bedrooms} bedroom ${data.propertyType} properties in ${data.suburb}, the estimated value range reflects current market conditions. This estimate considers property type, size, and local market trends.`,
        factors: [
            {
                factor: 'Location',
                impact: 'positive',
                description: `${data.suburb} is a desirable suburb with good amenities`
            },
            {
                factor: 'Bedrooms',
                impact: data.bedrooms >= 4 ? 'positive' : 'neutral',
                description: `${data.bedrooms} bedrooms appeals to ${data.bedrooms >= 4 ? 'families' : 'small households'}`
            },
            {
                factor: 'Property Type',
                impact: data.propertyType === 'house' ? 'positive' : 'neutral',
                description: `${data.propertyType}s in this area have steady demand`
            }
        ],
        marketInsights: `The ${data.suburb} property market shows moderate activity with steady demand for ${data.propertyType} properties.`,
        disclaimer: 'This is an AI-generated estimate for informational purposes only. Actual property values may vary significantly. We recommend consulting with a licensed valuer for accurate valuations.'
    }
}

function getBasePrice(propertyType: string, suburb: string): number {
    // Realistic 2024 Brisbane metro base prices (AUD)
    // Brisbane median house price is around $900k, inner-city suburbs much higher
    const basePrices: Record<string, number> = {
        house: 1100000,      // Brisbane metro average
        apartment: 650000,
        townhouse: 850000,
        unit: 520000,
        land: 550000
    }

    // Inner-city Brisbane suburbs - higher prices
    const innerCitySuburbs = [
        'albion', 'newstead', 'fortitude valley', 'new farm', 'teneriffe',
        'bulimba', 'hawthorne', 'ascot', 'hamilton', 'paddington',
        'red hill', 'kelvin grove', 'spring hill', 'west end', 'highgate hill'
    ]

    // Premium suburbs - highest prices
    const premiumSuburbs = [
        'ascot', 'hamilton', 'new farm', 'teneriffe', 'bulimba',
        'mosman', 'toorak', 'cottesloe', 'double bay', 'vaucluse'
    ]

    const suburbLower = suburb.toLowerCase()
    const isPremium = premiumSuburbs.some(s => suburbLower.includes(s))
    const isInnerCity = innerCitySuburbs.some(s => suburbLower.includes(s))

    const base = basePrices[propertyType.toLowerCase()] || 900000

    if (isPremium) {
        return base * 1.8  // Premium suburbs 80% higher
    } else if (isInnerCity) {
        return base * 1.4  // Inner-city 40% higher
    }

    return base
}
