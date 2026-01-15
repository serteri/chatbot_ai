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



// Use OpenAI to get current market prices for the SPECIFIC property configuration
async function fetchPropertyValuation(
    openai: OpenAI,
    suburb: string,
    propertyType: string,
    bedrooms: number,
    bathrooms: number
): Promise<{ min: number; max: number; median: number; source: string; confidence: string } | null> {
    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `You are an Australian property market data expert with access to current 2025-2026 real estate data. 
Provide accurate property price estimates based on recent sales data from realestate.com.au, domain.com.au, and CoreLogic.
Return ONLY valid JSON, no other text.

IMPORTANT GUIDELINES:
- Use actual 2025-2026 market data for Australian suburbs
- Consider the suburb's location relative to the CBD (inner suburbs are more expensive)
- Account for the specific bedroom and bathroom configuration
- Brisbane inner suburbs (like Albion, Ascot, Bulimba, Paddington) have median house prices well over $1 million
- Sydney inner suburbs typically have even higher prices
- Melbourne inner suburbs are similar to Brisbane or higher
- Be accurate based on real market conditions`
                },
                {
                    role: 'user',
                    content: `What is the estimated market value for a ${bedrooms}-bedroom, ${bathrooms}-bathroom ${propertyType} in ${suburb}, Australia?

Return JSON in this exact format (prices in AUD as integers, no decimals):
{
  "medianPrice": 1300000,
  "minPrice": 1150000,
  "maxPrice": 1500000,
  "dataDate": "January 2026",
  "confidence": "high"
}

Guidelines:
- medianPrice = most likely sale price for a ${bedrooms} bed / ${bathrooms} bath ${propertyType} in ${suburb}
- minPrice = lower bound of the price range (typically 10-15% below median)
- maxPrice = upper bound of the price range (typically 10-15% above median)
- Use recent sales data (2025-2026) for comparable properties
- Consider the suburb's desirability and proximity to the city center
- ${bedrooms} bedroom ${propertyType}s with ${bathrooms} bathroom(s) - be specific to this configuration`
                }
            ],
            response_format: { type: 'json_object' }
        })

        const responseText = completion.choices[0]?.message?.content
        if (!responseText) return null

        const data = JSON.parse(responseText)
        return {
            median: data.medianPrice || 900000,
            min: data.minPrice || Math.round((data.medianPrice || 900000) * 0.88),
            max: data.maxPrice || Math.round((data.medianPrice || 900000) * 1.12),
            source: `AI Estimate (${data.dataDate || 'Current'})`,
            confidence: data.confidence || 'medium'
        }
    } catch (error) {
        console.error('OpenAI valuation error:', error)
        return null
    }
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

        // Get valuation directly from OpenAI for the specific property configuration
        let valuationResult: { min: number; max: number; median: number; source: string; confidence: string } | null = null

        if (openai) {
            valuationResult = await fetchPropertyValuation(
                openai,
                body.suburb,
                body.propertyType,
                body.bedrooms,
                body.bathrooms
            )
        }

        // Fallback to basic defaults if OpenAI fails
        if (!valuationResult) {
            valuationResult = {
                min: 800000,
                max: 1100000,
                median: 950000,
                source: 'Default estimates',
                confidence: 'low'
            }
        }

        // Get AI-generated insights
        let aiResponse = {
            confidence: valuationResult.confidence as 'high' | 'medium' | 'low',
            reasoning: `Based on comparable ${body.bedrooms} bedroom, ${body.bathrooms} bathroom ${body.propertyType} properties in ${body.suburb}.`,
            factors: [
                { factor: 'Location', impact: 'positive' as const, description: `${body.suburb} suburb characteristics` },
                { factor: 'Property Size', impact: 'neutral' as const, description: `${body.bedrooms} bedrooms, ${body.bathrooms} bathrooms` },
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
                            content: `You are an Australian property market expert. Analyze the property and provide detailed insights.`
                        },
                        {
                            role: 'user',
                            content: `Provide market analysis for this property in JSON format:

Location: ${body.suburb}, Australia
Property Type: ${body.propertyType}
Bedrooms: ${body.bedrooms}
Bathrooms: ${body.bathrooms}
Estimated Value: $${valuationResult.median.toLocaleString()} (range: $${valuationResult.min.toLocaleString()} - $${valuationResult.max.toLocaleString()})
Data Source: ${valuationResult.source}

Respond with JSON:
{
  "confidence": "high" or "medium" or "low",
  "reasoning": "2-3 sentences explaining why this valuation is appropriate for this specific ${body.bedrooms} bed / ${body.bathrooms} bath ${body.propertyType} in ${body.suburb}",
  "factors": [
    {"factor": "Location", "impact": "positive/negative/neutral", "description": "brief explanation about ${body.suburb}"},
    {"factor": "Property Configuration", "impact": "positive/negative/neutral", "description": "analysis of ${body.bedrooms} bed / ${body.bathrooms} bath layout"},
    {"factor": "Market Conditions", "impact": "positive/negative/neutral", "description": "current 2025-2026 market trends"}
  ],
  "marketInsights": "1-2 sentences about current market trends for ${body.propertyType}s in this area"
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
            estimatedValue: { min: valuationResult.min, max: valuationResult.max, median: valuationResult.median },
            confidence: aiResponse.confidence || 'medium',
            currency: 'AUD',
            reasoning: aiResponse.reasoning,
            factors: aiResponse.factors || [],
            marketInsights: aiResponse.marketInsights,
            disclaimer: `This is an AI-generated estimate based on ${valuationResult.source}. Actual values may vary. Consult a licensed valuer for accurate valuations.`,
            dataSource: valuationResult.source
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


