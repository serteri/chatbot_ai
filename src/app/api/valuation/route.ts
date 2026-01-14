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

// Suburb baseline prices (3bed/2bath house, January 2025)
const SUBURB_PRICES: Record<string, number> = {
    // Brisbane
    'new farm': 2800000, 'teneriffe': 2500000, 'ascot': 2600000, 'hamilton': 2300000,
    'bulimba': 2000000, 'hawthorne': 1900000, 'clayfield': 1800000,
    'paddington': 1700000, 'west end': 1500000, 'newstead': 1600000,
    'albion': 1400000, 'fortitude valley': 1200000, 'kangaroo point': 1300000,
    'windsor': 1500000, 'wilston': 1600000, 'red hill': 1700000,
    'toowong': 1500000, 'indooroopilly': 1600000, 'st lucia': 1700000,
    'coorparoo': 1400000, 'camp hill': 1500000, 'norman park': 1500000,
    'morningside': 1350000, 'nundah': 1100000, 'chermside': 950000,
    // Sydney
    'vaucluse': 8000000, 'point piper': 15000000, 'double bay': 5500000, 'mosman': 5000000,
    'paddington nsw': 3200000, 'woollahra': 4000000, 'bellevue hill': 5000000,
    'surry hills': 2200000, 'newtown': 2000000, 'balmain': 2500000,
    'bondi beach': 4000000, 'bondi': 3500000, 'manly': 4200000, 'coogee': 3500000,
    // Melbourne
    'toorak': 5500000, 'brighton': 3200000, 'south yarra': 2800000, 'armadale': 2500000,
    'richmond': 1800000, 'fitzroy': 1900000, 'carlton': 1600000, 'st kilda': 1700000,
    'brunswick': 1400000, 'northcote': 1600000, 'hawthorn': 2200000,
    // Perth
    'cottesloe': 3000000, 'dalkeith': 3500000, 'peppermint grove': 5000000, 'city beach': 2500000,
    // Adelaide
    'unley': 1600000, 'norwood': 1400000, 'north adelaide': 1500000,
    // Gold Coast
    'main beach': 2500000, 'surfers paradise': 1800000, 'burleigh heads': 1600000,
}

// City default prices
const CITY_DEFAULTS: Record<string, number> = {
    'brisbane': 1100000, 'qld': 1100000,
    'sydney': 1600000, 'nsw': 1600000,
    'melbourne': 1150000, 'vic': 1150000,
    'perth': 850000, 'wa': 850000,
    'adelaide': 850000, 'sa': 850000,
    'gold coast': 1050000,
    'canberra': 950000, 'act': 950000,
    'hobart': 750000, 'tas': 750000,
    'darwin': 550000, 'nt': 550000,
}

// Bedroom multipliers
const BEDROOM_MULTIPLIERS: Record<number, number> = {
    1: 0.45, 2: 0.70, 3: 1.00, 4: 1.15, 5: 1.30, 6: 1.45
}

// Bathroom multipliers
const BATHROOM_MULTIPLIERS: Record<number, number> = {
    1: 0.92, 2: 1.00, 3: 1.06, 4: 1.12
}

// Property type multipliers
const TYPE_MULTIPLIERS: Record<string, number> = {
    'house': 1.00,
    'townhouse': 0.75,
    'apartment': 0.50,
    'unit': 0.50,
    'land': 0.40
}

function calculateValuation(data: ValuationRequest): { min: number; max: number; median: number } {
    // Step 1: Get baseline price for suburb
    const suburbLower = data.suburb.toLowerCase()
    let baseline = 1000000 // fallback

    // Try exact suburb match
    for (const [suburb, price] of Object.entries(SUBURB_PRICES)) {
        if (suburbLower.includes(suburb)) {
            baseline = price
            break
        }
    }

    // If no suburb match, try city/state default
    if (baseline === 1000000) {
        for (const [city, price] of Object.entries(CITY_DEFAULTS)) {
            if (suburbLower.includes(city)) {
                baseline = price
                break
            }
        }
    }

    // Step 2: Apply bedroom multiplier
    const bedrooms = Math.min(Math.max(data.bedrooms, 1), 6)
    const bedroomMult = BEDROOM_MULTIPLIERS[bedrooms] || 1.00

    // Step 3: Apply bathroom multiplier
    const bathrooms = Math.min(Math.max(data.bathrooms, 1), 4)
    const bathroomMult = BATHROOM_MULTIPLIERS[bathrooms] || 1.00

    // Step 4: Apply property type multiplier
    const typeMult = TYPE_MULTIPLIERS[data.propertyType.toLowerCase()] || 1.00

    // Step 5: Calculate final values
    const median = Math.round(baseline * bedroomMult * bathroomMult * typeMult)
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
