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
    dataSource?: string
}

interface SuburbData {
    medianHouse: number
    medianUnit: number
    medianTownhouse?: number
    source: string
    lastUpdated: string
}

// Bedroom multipliers (baseline is 3 bed)
const BEDROOM_MULTIPLIERS: Record<number, number> = {
    1: 0.55, 2: 0.78, 3: 1.00, 4: 1.18, 5: 1.35, 6: 1.50
}

// Bathroom multipliers (baseline is 2 bath)
const BATHROOM_MULTIPLIERS: Record<number, number> = {
    1: 0.94, 2: 1.00, 3: 1.05, 4: 1.10
}

// Use OpenAI to get current market prices
async function fetchFromOpenAI(openai: OpenAI, suburb: string, propertyType: string): Promise<SuburbData | null> {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an Australian property market data expert. Provide current median property prices based on the latest available market data. Return ONLY valid JSON, no other text.`
                },
                {
                    role: 'user',
                    content: `What are the current median property prices in ${suburb}, Australia?

Return JSON in this exact format (prices in AUD as integers):
{
  "medianHouse": 1200000,
  "medianUnit": 650000,
  "medianTownhouse": 850000,
  "dataDate": "January 2025",
  "confidence": "high"
}

Base your estimates on recent sales data and market trends. Be realistic and accurate.`
                }
            ],
            response_format: { type: 'json_object' }
        })

        const responseText = completion.choices[0]?.message?.content
        if (!responseText) return null

        const data = JSON.parse(responseText)
        return {
            medianHouse: data.medianHouse || 900000,
            medianUnit: data.medianUnit || 500000,
            medianTownhouse: data.medianTownhouse || 700000,
            source: `AI Estimate (${data.dataDate || 'Current'})`,
            lastUpdated: new Date().toISOString()
        }
    } catch {
        return null
    }
}

function calculateValuation(
    suburbData: SuburbData,
    propertyType: string,
    bedrooms: number,
    bathrooms: number
): { min: number; max: number; median: number } {
    // Get baseline for property type
    const type = propertyType.toLowerCase()
    let baseline: number

    if (type === 'house' || type === 'land') {
        baseline = suburbData.medianHouse
    } else if (type === 'townhouse') {
        baseline = suburbData.medianTownhouse || Math.round(suburbData.medianHouse * 0.75)
    } else {
        baseline = suburbData.medianUnit
    }

    // Apply bedroom multiplier
    const bedroomCount = Math.min(Math.max(bedrooms, 1), 6)
    const bedroomMult = BEDROOM_MULTIPLIERS[bedroomCount] || 1.00

    // Apply bathroom multiplier
    const bathroomCount = Math.min(Math.max(bathrooms, 1), 4)
    const bathroomMult = BATHROOM_MULTIPLIERS[bathroomCount] || 1.00

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

        const openaiApiKey = process.env.OPENAI_API_KEY
        const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null

        // Get real-time suburb data from OpenAI
        let suburbData: SuburbData | null = null

        if (openai) {
            suburbData = await fetchFromOpenAI(openai, body.suburb, body.propertyType)
        }

        // Fallback to basic defaults if nothing works
        if (!suburbData) {
            suburbData = {
                medianHouse: 900000,
                medianUnit: 500000,
                medianTownhouse: 700000,
                source: 'Default estimates',
                lastUpdated: new Date().toISOString()
            }
        }

        // Step 2: Calculate valuation using fetched data
        const calculatedValue = calculateValuation(
            suburbData,
            body.propertyType,
            body.bedrooms,
            body.bathrooms
        )

        // Step 3: Get AI-generated insights
        let aiResponse = {
            confidence: 'medium' as const,
            reasoning: `Based on comparable ${body.bedrooms} bedroom ${body.propertyType} properties in ${body.suburb}.`,
            factors: [
                { factor: 'Location', impact: 'positive' as const, description: 'Desirable suburb' },
                { factor: 'Property Size', impact: 'neutral' as const, description: `${body.bedrooms} bedrooms` },
            ],
            marketInsights: 'Market conditions are stable.'
        }

        if (openai) {
            try {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: `You are an Australian property market expert. Analyze the property and provide insights.`
                        },
                        {
                            role: 'user',
                            content: `Provide market analysis for this property in JSON format:

Location: ${body.suburb}, Australia
Property Type: ${body.propertyType}
Bedrooms: ${body.bedrooms}
Bathrooms: ${body.bathrooms}
Median ${body.propertyType} price in area: $${calculatedValue.median.toLocaleString()}
Data Source: ${suburbData.source}

Respond with JSON:
{
  "confidence": "high" or "medium" or "low",
  "reasoning": "2-3 sentences explaining the valuation",
  "factors": [
    {"factor": "Location", "impact": "positive/negative/neutral", "description": "brief explanation"},
    {"factor": "Property Type", "impact": "positive/negative/neutral", "description": "brief explanation"},
    {"factor": "Market Conditions", "impact": "positive/negative/neutral", "description": "brief explanation"}
  ],
  "marketInsights": "1-2 sentences about current market trends"
}`
                        }
                    ],
                    response_format: { type: 'json_object' }
                })

                const responseText = completion.choices[0]?.message?.content
                if (responseText) {
                    aiResponse = JSON.parse(responseText)
                }
            } catch {
                // Use default if AI call fails
            }
        }

        // Combine everything into response
        const valuation: ValuationResponse = {
            estimatedValue: calculatedValue,
            confidence: aiResponse.confidence || 'medium',
            currency: 'AUD',
            reasoning: aiResponse.reasoning,
            factors: aiResponse.factors || [],
            marketInsights: aiResponse.marketInsights,
            disclaimer: `This is an AI-generated estimate. Data source: ${suburbData.source}. Actual values may vary. Consult a licensed valuer for accurate valuations.`,
            dataSource: suburbData.source
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
