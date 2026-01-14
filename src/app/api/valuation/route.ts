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
                    content: `You are a property valuation calculator. You MUST use the exact formula below.

BASELINE PRICES (3bed/2bath HOUSE, January 2025):
Brisbane: Albion=1400000, New Farm=2800000, Teneriffe=2500000, Ascot=2600000, Hamilton=2300000, Bulimba=2000000, Paddington=1700000, West End=1500000, Newstead=1600000, Windsor=1500000, Toowong=1500000, default=1100000
Sydney: Vaucluse=8000000, Double Bay=5500000, Mosman=5000000, Bondi=4000000, Surry Hills=2200000, default=1600000
Melbourne: Toorak=5500000, Brighton=3200000, South Yarra=2800000, Richmond=1800000, Fitzroy=1900000, default=1150000
Perth: Cottesloe=3000000, Dalkeith=3500000, default=850000
Adelaide: Unley=1600000, Norwood=1400000, default=850000
Gold Coast: Surfers Paradise=1800000, Burleigh=1600000, default=1050000

===== CALCULATION FORMULA (MUST FOLLOW) =====

STEP 1 - Get baseline for suburb (or use city default)

STEP 2 - Bedroom multiplier:
1bed=0.45, 2bed=0.70, 3bed=1.00, 4bed=1.15, 5bed=1.30, 6+bed=1.45

STEP 3 - Bathroom multiplier:
1bath=0.92, 2bath=1.00, 3bath=1.06, 4+bath=1.12

STEP 4 - Property type multiplier:
house=1.00, townhouse=0.75, apartment=0.50, unit=0.50

STEP 5 - Calculate:
median = baseline × bedroom_mult × bathroom_mult × type_mult
min = median × 0.88
max = median × 1.12

===== EXAMPLES =====

Albion, 1bed, 1bath, apartment:
1400000 × 0.45 × 0.92 × 0.50 = 289800
Result: min=255000, median=290000, max=325000

Albion, 3bed, 2bath, house:
1400000 × 1.00 × 1.00 × 1.00 = 1400000
Result: min=1232000, median=1400000, max=1568000

Albion, 4bed, 2bath, house:
1400000 × 1.15 × 1.00 × 1.00 = 1610000
Result: min=1417000, median=1610000, max=1803000

New Farm, 5bed, 3bath, house:
2800000 × 1.30 × 1.06 × 1.00 = 3858400
Result: min=3395000, median=3858000, max=4321000

IMPORTANT: Return values as plain integers (1400000 not "$1.4M"). Show calculation in reasoning.`
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
