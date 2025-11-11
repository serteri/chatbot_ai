import OpenAI from 'openai'

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
})

export type IntentType =
    | 'university_recommendation'
    | 'scholarship_inquiry'
    | 'visa_information'        // 🆕 Vize bilgisi
    | 'language_school_inquiry'  // 🆕 Dil okulu
    | 'cost_of_living'          // 🆕 Yaşam maliyeti
    | 'application_guide'       // 🆕 Başvuru rehberi
    | 'language_exam'           // Dil sınavları (TOEFL, IELTS)
    | 'live_support_request'
    | 'general_question'

export interface IntentResult {
    intent: IntentType
    confidence: number
    entities: {
        country?: string
        city?: string
        field?: string
        budget?: number
        examType?: string
        language?: string
    }
    needsLiveSupport: boolean
}

/**
 * OpenAI ile kullanıcı mesajından intent algıla
 */
export async function detectIntent(message: string): Promise<IntentResult> {
    const systemPrompt = `You are an intent classifier for an international education chatbot.

Classify user messages into ONE of these intents:
1. university_recommendation - User asks for university suggestions/recommendations
2. scholarship_inquiry - User asks about scholarships, funding, or financial aid
3. visa_information - User asks about visa requirements, visa process, visa documents
4. language_school_inquiry - User asks about language courses, language schools
5. cost_of_living - User asks about living costs, rent, expenses, monthly budget
6. application_guide - User asks about application process, deadlines, how to apply
7. language_exam - User asks about TOEFL, IELTS, TestDaF scores or exam preparation
8. live_support_request - User explicitly wants human help
9. general_question - General questions about studying abroad

Extract entities (if mentioned):
- country: USA, Germany, Canada, UK, France, Spain (use English names)
- city: Toronto, Munich, Boston, Berlin (use English spelling: "Münih" → "Munich", "Münich" → "Munich")
- field: Computer Science, Engineering, Medicine, Business
- language: English, German, French, Spanish
- examType: TOEFL, IELTS, TestDaF, GRE, GMAT

CRITICAL: Always use standard ENGLISH city spellings (Munich not Münih, Vienna not Wien, etc.)

Respond ONLY with valid JSON format:
{
  "intent": "intent_name",
  "confidence": 0.85,
  "entities": {
    "country": "Germany",
    "city": "Munich",
    "field": "Computer Science"
  },
  "needsLiveSupport": false
}`

    const userPrompt = `Analyze this student question: "${message}"`

    try {
        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 300,
        })

        const content = response.choices[0].message.content
        if (!content) {
            throw new Error('Empty response from OpenAI')
        }

        const result: IntentResult = JSON.parse(content)

        // Düşük confidence → canlı destek öner
        if (result.confidence < 0.6) {
            result.needsLiveSupport = true
        }

        return result
    } catch (error) {
        console.error('Intent detection error:', error)
        return {
            intent: 'general_question',
            confidence: 0.5,
            entities: {},
            needsLiveSupport: false
        }
    }
}

/**
 * Üniversite önerisi için özel prompt oluştur
 */
export function buildUniversityPrompt(entities: IntentResult['entities'], universityContext: string): string {
    return `You are an expert international education advisor. Recommend suitable universities based on the student's requirements.

Student Requirements:
${entities.country ? `- Target country: ${entities.country}` : '- No specific country preference'}
${entities.field ? `- Field of study: ${entities.field}` : '- Field not specified'}
${entities.budget ? `- Budget: $${entities.budget}/year` : '- Budget not specified'}

Available Universities:
${universityContext}

Provide 3-5 university recommendations with:
1. University name and location
2. Why it's a good fit for the student
3. Estimated tuition costs
4. Key requirements (TOEFL/IELTS, GPA, SAT if applicable)

Be encouraging and helpful. Use bullet points for clarity. Respond in Turkish if the question was in Turkish, otherwise in English.`
}

/**
 * Burs önerisi için özel prompt
 */
export function buildScholarshipPrompt(entities: IntentResult['entities'], scholarshipContext: string): string {
    return `You are a scholarship advisor helping students find funding opportunities.

Student Profile:
${entities.country ? `- Target country: ${entities.country}` : '- Country not specified'}
${entities.field ? `- Field of study: ${entities.field}` : '- Field not specified'}

Available Scholarships:
${scholarshipContext}

List relevant scholarships with:
1. Scholarship name and coverage (amount or percentage)
2. Eligibility criteria
3. Application deadline
4. Brief application process

Be specific and encouraging. Use bullet points. Respond in Turkish if the question was in Turkish, otherwise in English.`
}

/**
 * Vize bilgisi için özel prompt
 */
export function buildVisaPrompt(entities: IntentResult['entities'], visaContext: string): string {
    return `You are a visa consultant for international students.

Student Query:
${entities.country ? `- Target country: ${entities.country}` : '- Country not specified'}

Visa Information Available:
${visaContext}

Provide clear information about:
1. Visa type required for students
2. Key requirements and documents needed
3. Processing time and cost
4. Important tips or considerations

Be clear and structured. Use bullet points. Respond in Turkish if the question was in Turkish, otherwise in English.`
}

/**
 * Dil okulu önerisi için prompt
 */
export function buildLanguageSchoolPrompt(entities: IntentResult['entities'], schoolContext: string): string {
    return `You are a language education consultant.

Student Requirements:
${entities.country ? `- Preferred country: ${entities.country}` : '- Country not specified'}
${entities.city ? `- Preferred city: ${entities.city}` : '- City not specified'}
${entities.language ? `- Language to learn: ${entities.language}` : '- Language not specified'}
${entities.examType ? `- Exam preparation: ${entities.examType}` : '- No specific exam mentioned'}

Available Language Schools:
${schoolContext}

Recommend language schools with:
1. School name and location
2. Course types and duration
3. Price per week
4. Exam preparation offered (TOEFL, IELTS, etc.)
5. Accommodation availability

Be helpful and specific. Use bullet points. Respond in Turkish if the question was in Turkish, otherwise in English.`
}

/**
 * Yaşam maliyeti bilgisi için prompt
 */
export function buildCostOfLivingPrompt(entities: IntentResult['entities'], costContext: string): string {
    return `You are a student budget advisor.

Student Query:
${entities.country ? `- Target country: ${entities.country}` : '- Country not specified'}
${entities.city ? `- City: ${entities.city}` : '- City not specified'}

Cost of Living Data:
${costContext}

Provide a breakdown of monthly costs:
1. Rent (student accommodation)
2. Food and groceries
3. Transportation
4. Utilities
5. Health insurance
6. Miscellaneous expenses
7. Total monthly budget

Add practical tips for saving money. Be realistic and helpful. Use bullet points. Respond in Turkish if the question was in Turkish, otherwise in English.`
}

/**
 * Başvuru rehberi için prompt
 */
export function buildApplicationGuidePrompt(entities: IntentResult['entities'], guideContext: string): string {
    return `You are an application process consultant for international students.

Student Query:
${entities.country ? `- Target country: ${entities.country}` : '- Country not specified'}

Application Guide:
${guideContext}

Provide a step-by-step application guide:
1. Timeline (when to start)
2. Required documents
3. Application steps in order
4. Important deadlines
5. Key tips for success

Be clear and actionable. Use numbered steps. Respond in Turkish if the question was in Turkish, otherwise in English.`
}

/**
 * Canlı destek mesajı oluştur
 */
export function buildLiveSupportMessage(
    whatsappNumber?: string,
    supportEmail?: string,
    liveSupportUrl?: string
): string {
    let message = `I understand you need personalized assistance. Here are ways to reach our education advisors:\n\n`

    if (whatsappNumber) {
        message += `📱 **WhatsApp:** ${whatsappNumber}\n`
    }

    if (supportEmail) {
        message += `📧 **Email:** ${supportEmail}\n`
    }

    if (liveSupportUrl) {
        message += `💬 **Live Chat:** [Click here](${liveSupportUrl})\n`
    }

    message += `\nOur advisors typically respond within 24 hours. How else can I help you today?`

    return message
}