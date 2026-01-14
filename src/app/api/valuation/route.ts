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
                    content: `You are an expert Australian property valuer with deep knowledge of January 2025 market conditions. Use these ACCURATE 2025 median prices as reference:

BRISBANE (QLD) - Median House: $950,000 | Unit: $550,000
- Premium: New Farm ($2.1M), Teneriffe ($1.9M), Ascot ($2.0M), Hamilton ($1.8M), Bulimba ($1.6M)
- Inner-city: Paddington ($1.4M), West End ($1.2M), Newstead ($1.1M), Albion QLD ($1.0M), Fortitude Valley ($900K)
- Middle ring: Toowong ($1.1M), Indooroopilly ($1.2M), St Lucia ($1.3M), Clayfield ($1.3M)

SYDNEY (NSW) - Median House: $1,450,000 | Unit: $820,000
- Premium: Vaucluse ($6M+), Double Bay ($4.5M), Mosman ($4M), Paddington NSW ($2.8M)
- Inner-city: Surry Hills ($1.9M), Newtown ($1.7M), Bondi Beach ($3.2M), Manly ($3.5M)

MELBOURNE (VIC) - Median House: $1,050,000 | Unit: $580,000
- Premium: Toorak ($4.5M), Brighton ($2.8M), South Yarra ($2.2M)
- Inner-city: Richmond ($1.5M), Fitzroy ($1.6M), Carlton ($1.3M), St Kilda ($1.4M)

PERTH (WA) - Median House: $750,000 | Unit: $480,000
- Premium: Cottesloe ($2.5M), Dalkeith ($3M), Peppermint Grove ($4M+)

ADELAIDE (SA) - Median House: $780,000 | Unit: $450,000
- Premium: Unley ($1.4M), Norwood ($1.2M), Glenelg ($1.1M)

RULES:
1. Use the reference prices above as anchors - adjust based on bedrooms, bathrooms, property type
2. Each bedroom above 3 adds ~10-15% to value
3. Houses are typically 40-60% more valuable than units in the same area
4. Townhouses are between house and unit prices
5. Provide realistic ranges (min/max should be ~15% below/above median)
6. Be confident in well-known suburbs, lower confidence for obscure areas
7. Always respond in valid JSON format only.`
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

Respond with this exact JSON structure:
{
  "estimatedValue": {
    "min": <number - lowest reasonable estimate in AUD>,
    "max": <number - highest reasonable estimate in AUD>,
    "median": <number - most likely value in AUD>
  },
  "confidence": "<high|medium|low>",
  "reasoning": "<2-3 sentences explaining the valuation>",
  "factors": [
    {
      "factor": "<factor name>",
      "impact": "<positive|negative|neutral>",
      "description": "<brief explanation>"
    }
  ],
  "marketInsights": "<1-2 sentences about the local market>"
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
