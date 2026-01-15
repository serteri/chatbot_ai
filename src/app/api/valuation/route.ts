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

// Suburb baseline prices by property type (3bed/2bath, January 2025)
// Sources: realestate.com.au, domain.com.au, propertyvalue.com.au
interface SuburbPrices {
    house: number
    apartment: number
    townhouse: number
}

const SUBURB_PRICES: Record<string, SuburbPrices> = {
    // Brisbane Inner - Premium
    'new farm': { house: 2800000, apartment: 1200000, townhouse: 1800000 },
    'teneriffe': { house: 2500000, apartment: 1100000, townhouse: 1600000 },
    'ascot': { house: 2600000, apartment: 950000, townhouse: 1700000 },
    'hamilton': { house: 2300000, apartment: 900000, townhouse: 1500000 },
    'bulimba': { house: 2000000, apartment: 850000, townhouse: 1400000 },
    'hawthorne': { house: 1900000, apartment: 800000, townhouse: 1300000 },
    'clayfield': { house: 1800000, apartment: 750000, townhouse: 1200000 },

    // Brisbane Inner - Mid
    'paddington': { house: 1700000, apartment: 700000, townhouse: 1100000 },
    'west end': { house: 1500000, apartment: 750000, townhouse: 1000000 },
    'newstead': { house: 1600000, apartment: 850000, townhouse: 1100000 },
    'albion': { house: 1150000, apartment: 700000, townhouse: 950000 },
    'fortitude valley': { house: 1200000, apartment: 650000, townhouse: 900000 },
    'kangaroo point': { house: 1300000, apartment: 700000, townhouse: 950000 },
    'windsor': { house: 1400000, apartment: 650000, townhouse: 950000 },
    'wilston': { house: 1600000, apartment: 650000, townhouse: 1000000 },
    'red hill': { house: 1700000, apartment: 700000, townhouse: 1100000 },
    'kelvin grove': { house: 1200000, apartment: 550000, townhouse: 850000 },
    'spring hill': { house: 1100000, apartment: 550000, townhouse: 800000 },

    // Brisbane Middle Ring
    'toowong': { house: 1500000, apartment: 600000, townhouse: 950000 },
    'indooroopilly': { house: 1600000, apartment: 550000, townhouse: 1000000 },
    'st lucia': { house: 1700000, apartment: 600000, townhouse: 1100000 },
    'coorparoo': { house: 1400000, apartment: 600000, townhouse: 900000 },
    'camp hill': { house: 1500000, apartment: 600000, townhouse: 950000 },
    'norman park': { house: 1500000, apartment: 650000, townhouse: 950000 },
    'morningside': { house: 1350000, apartment: 600000, townhouse: 900000 },
    'nundah': { house: 1100000, apartment: 550000, townhouse: 800000 },
    'chermside': { house: 950000, apartment: 500000, townhouse: 700000 },
    'woolloongabba': { house: 1200000, apartment: 600000, townhouse: 850000 },
    'annerley': { house: 1100000, apartment: 500000, townhouse: 750000 },
    'greenslopes': { house: 1150000, apartment: 550000, townhouse: 800000 },

    // Sydney - Premium
    'vaucluse': { house: 8000000, apartment: 2500000, townhouse: 4500000 },
    'point piper': { house: 15000000, apartment: 4000000, townhouse: 8000000 },
    'double bay': { house: 5500000, apartment: 1800000, townhouse: 3500000 },
    'mosman': { house: 5000000, apartment: 1500000, townhouse: 3000000 },
    'paddington nsw': { house: 3200000, apartment: 1200000, townhouse: 2200000 },
    'woollahra': { house: 4000000, apartment: 1400000, townhouse: 2800000 },
    'bellevue hill': { house: 5000000, apartment: 1600000, townhouse: 3200000 },

    // Sydney - Inner
    'surry hills': { house: 2200000, apartment: 1100000, townhouse: 1700000 },
    'newtown': { house: 2000000, apartment: 900000, townhouse: 1500000 },
    'balmain': { house: 2500000, apartment: 1100000, townhouse: 1800000 },
    'bondi beach': { house: 4000000, apartment: 1400000, townhouse: 2500000 },
    'bondi': { house: 3500000, apartment: 1200000, townhouse: 2200000 },
    'manly': { house: 4200000, apartment: 1500000, townhouse: 2800000 },
    'coogee': { house: 3500000, apartment: 1200000, townhouse: 2300000 },

    // Melbourne - Premium
    'toorak': { house: 5500000, apartment: 1200000, townhouse: 2800000 },
    'brighton': { house: 3200000, apartment: 950000, townhouse: 1800000 },
    'south yarra': { house: 2800000, apartment: 850000, townhouse: 1600000 },
    'armadale': { house: 2500000, apartment: 800000, townhouse: 1500000 },

    // Melbourne - Inner
    'richmond': { house: 1800000, apartment: 650000, townhouse: 1100000 },
    'fitzroy': { house: 1900000, apartment: 700000, townhouse: 1200000 },
    'carlton': { house: 1600000, apartment: 600000, townhouse: 1000000 },
    'st kilda': { house: 1700000, apartment: 650000, townhouse: 1100000 },
    'brunswick': { house: 1400000, apartment: 550000, townhouse: 900000 },
    'northcote': { house: 1600000, apartment: 600000, townhouse: 1000000 },
    'hawthorn': { house: 2200000, apartment: 700000, townhouse: 1400000 },

    // Perth
    'cottesloe': { house: 3000000, apartment: 900000, townhouse: 1600000 },
    'dalkeith': { house: 3500000, apartment: 950000, townhouse: 1800000 },
    'peppermint grove': { house: 5000000, apartment: 1200000, townhouse: 2500000 },
    'city beach': { house: 2500000, apartment: 800000, townhouse: 1400000 },
    'subiaco': { house: 1800000, apartment: 650000, townhouse: 1100000 },
    'fremantle': { house: 1400000, apartment: 600000, townhouse: 950000 },

    // Adelaide
    'unley': { house: 1600000, apartment: 550000, townhouse: 950000 },
    'norwood': { house: 1400000, apartment: 500000, townhouse: 850000 },
    'north adelaide': { house: 1500000, apartment: 550000, townhouse: 900000 },
    'glenelg': { house: 1300000, apartment: 550000, townhouse: 850000 },

    // Gold Coast
    'main beach': { house: 2500000, apartment: 1100000, townhouse: 1600000 },
    'surfers paradise': { house: 1800000, apartment: 850000, townhouse: 1200000 },
    'burleigh heads': { house: 1600000, apartment: 900000, townhouse: 1100000 },
    'broadbeach': { house: 1500000, apartment: 800000, townhouse: 1000000 },
}

// City default prices by property type
const CITY_DEFAULTS: Record<string, SuburbPrices> = {
    'brisbane': { house: 950000, apartment: 550000, townhouse: 700000 },
    'qld': { house: 850000, apartment: 500000, townhouse: 650000 },
    'sydney': { house: 1500000, apartment: 850000, townhouse: 1100000 },
    'nsw': { house: 1200000, apartment: 700000, townhouse: 900000 },
    'melbourne': { house: 1100000, apartment: 600000, townhouse: 800000 },
    'vic': { house: 900000, apartment: 500000, townhouse: 650000 },
    'perth': { house: 750000, apartment: 450000, townhouse: 550000 },
    'wa': { house: 650000, apartment: 400000, townhouse: 500000 },
    'adelaide': { house: 800000, apartment: 450000, townhouse: 550000 },
    'sa': { house: 700000, apartment: 400000, townhouse: 500000 },
    'gold coast': { house: 1000000, apartment: 650000, townhouse: 800000 },
    'canberra': { house: 950000, apartment: 550000, townhouse: 700000 },
    'act': { house: 950000, apartment: 550000, townhouse: 700000 },
    'hobart': { house: 700000, apartment: 450000, townhouse: 550000 },
    'tas': { house: 600000, apartment: 400000, townhouse: 480000 },
    'darwin': { house: 550000, apartment: 350000, townhouse: 450000 },
    'nt': { house: 500000, apartment: 320000, townhouse: 400000 },
}

// Bedroom multipliers (baseline is 3 bed)
const BEDROOM_MULTIPLIERS: Record<number, number> = {
    1: 0.55, 2: 0.78, 3: 1.00, 4: 1.18, 5: 1.35, 6: 1.50
}

// Bathroom multipliers (baseline is 2 bath)
const BATHROOM_MULTIPLIERS: Record<number, number> = {
    1: 0.94, 2: 1.00, 3: 1.05, 4: 1.10
}

function getPropertyTypeKey(propertyType: string): keyof SuburbPrices {
    const type = propertyType.toLowerCase()
    if (type === 'house' || type === 'land') return 'house'
    if (type === 'townhouse') return 'townhouse'
    return 'apartment' // apartment, unit, etc.
}

function calculateValuation(data: ValuationRequest): { min: number; max: number; median: number } {
    const suburbLower = data.suburb.toLowerCase()
    const propertyTypeKey = getPropertyTypeKey(data.propertyType)

    // Default fallback prices
    let suburbPrices: SuburbPrices = { house: 900000, apartment: 550000, townhouse: 700000 }

    // Try exact suburb match
    for (const [suburb, prices] of Object.entries(SUBURB_PRICES)) {
        if (suburbLower.includes(suburb)) {
            suburbPrices = prices
            break
        }
    }

    // If still default, try city/state match
    if (suburbPrices.house === 900000) {
        for (const [city, prices] of Object.entries(CITY_DEFAULTS)) {
            if (suburbLower.includes(city)) {
                suburbPrices = prices
                break
            }
        }
    }

    // Get baseline for this property type (this is for 3bed/2bath)
    const baseline = suburbPrices[propertyTypeKey]

    // Apply bedroom multiplier
    const bedrooms = Math.min(Math.max(data.bedrooms, 1), 6)
    const bedroomMult = BEDROOM_MULTIPLIERS[bedrooms] || 1.00

    // Apply bathroom multiplier
    const bathrooms = Math.min(Math.max(data.bathrooms, 1), 4)
    const bathroomMult = BATHROOM_MULTIPLIERS[bathrooms] || 1.00

    // Calculate final values
    const median = Math.round(baseline * bedroomMult * bathroomMult)
    const min = Math.round(median * 0.88)
    const max = Math.round(median * 1.12)

    return { min, max, median }
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

        // Calculate valuation using our formula (NOT OpenAI)
        const calculatedValue = calculateValuation(body)

        // Check for OpenAI API key - use for generating text only
        const openaiApiKey = process.env.OPENAI_API_KEY
        if (!openaiApiKey) {
            return NextResponse.json(getMockValuation(body, calculatedValue))
        }

        const openai = new OpenAI({ apiKey: openaiApiKey })

        // Only ask OpenAI for reasoning and insights, NOT the numbers
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an Australian property market expert. Provide market analysis and insights only. Do NOT calculate prices - those are provided separately apply.`
                },
                {
                    role: 'user',
                    content: `Provide market analysis for this property in JSON format:

Location: ${body.suburb}, Australia
Property Type: ${body.propertyType}
Bedrooms: ${body.bedrooms}
Bathrooms: ${body.bathrooms}
Calculated Value: $${calculatedValue.median.toLocaleString()} (range: $${calculatedValue.min.toLocaleString()} - $${calculatedValue.max.toLocaleString()})

Respond with this exact JSON structure:
{
  "confidence": "high" or "medium" or "low",
  "reasoning": "2-3 sentences explaining why this valuation makes sense for this suburb and property type",
  "factors": [
    {"factor": "Location", "impact": "positive/negative/neutral", "description": "brief explanation"},
    {"factor": "Property Size", "impact": "positive/negative/neutral", "description": "brief explanation"},
    {"factor": "Market Demand", "impact": "positive/negative/neutral", "description": "brief explanation"}
  ],
  "marketInsights": "1-2 sentences about current market trends in this area"
}`
                }
            ],
            response_format: { type: 'json_object' }
        })

        const responseText = completion.choices[0]?.message?.content
        let aiResponse = {
            confidence: 'medium' as const,
            reasoning: `Based on comparable ${body.bedrooms} bedroom ${body.propertyType} properties in ${body.suburb}.`,
            factors: [
                { factor: 'Location', impact: 'positive' as const, description: 'Desirable suburb' },
                { factor: 'Property Size', impact: 'neutral' as const, description: `${body.bedrooms} bedrooms` },
            ],
            marketInsights: 'Market conditions are stable.'
        }

        if (responseText) {
            try {
                aiResponse = JSON.parse(responseText)
            } catch {
                // Use default if parsing fails
            }
        }

        // Combine calculated values with AI-generated text
        const valuation: ValuationResponse = {
            estimatedValue: calculatedValue,
            confidence: aiResponse.confidence || 'medium',
            currency: 'AUD',
            reasoning: aiResponse.reasoning,
            factors: aiResponse.factors || [],
            marketInsights: aiResponse.marketInsights,
            disclaimer: 'This is an AI-generated estimate based on 2025 market data. Actual values may vary. Consult a licensed valuer for accurate valuations.'
        }

        return NextResponse.json(valuation)

    } catch (error) {
        console.error('Valuation error:', error)
        return NextResponse.json(
            { error: 'Failed to generate valuation' },
            { status: 500 }
        )
    }
}

function getMockValuation(data: ValuationRequest, calculatedValue: { min: number; max: number; median: number }): ValuationResponse {
    return {
        estimatedValue: calculatedValue,
        confidence: 'medium',
        currency: 'AUD',
        reasoning: `Based on comparable ${data.bedrooms} bedroom ${data.propertyType} properties in ${data.suburb}, the estimated value reflects current 2025 market conditions.`,
        factors: [
            {
                factor: 'Location',
                impact: 'positive',
                description: `${data.suburb} is a desirable suburb with good amenities`
            },
            {
                factor: 'Bedrooms',
                impact: data.bedrooms >= 4 ? 'positive' : 'neutral',
                description: `${data.bedrooms} bedrooms appeals to ${data.bedrooms >= 4 ? 'families' : 'various household sizes'}`
            },
            {
                factor: 'Property Type',
                impact: data.propertyType === 'house' ? 'positive' : 'neutral',
                description: `${data.propertyType}s in this area have steady demand`
            }
        ],
        marketInsights: `The ${data.suburb} property market shows strong activity with steady demand for ${data.propertyType} properties.`,
        disclaimer: 'This is an estimate based on 2025 market data. Actual values may vary. Consult a licensed valuer for accurate valuations.'
    }
}
