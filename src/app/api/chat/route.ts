import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { openai } from '@/lib/ai/openai'

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { message, chatbotId, conversationId, mode } = body

        console.log('🔍 Chat API Request:', { message, chatbotId, conversationId, mode })

        if (!message || !chatbotId) {
            return NextResponse.json({ error: 'Message ve chatbotId gerekli' }, { status: 400 })
        }

        // Chatbot'u getir - önce id ile, bulamazsa identifier ile ara
        let chatbot = await prisma.chatbot.findUnique({
            where: { id: chatbotId },
            include: {
                user: {
                    include: { subscription: true }
                }
            }
        })

        // ID ile bulunamadıysa identifier ile ara
        if (!chatbot) {
            chatbot = await prisma.chatbot.findFirst({
                where: { identifier: chatbotId },
                include: {
                    user: {
                        include: { subscription: true }
                    }
                }
            })
        }

        console.log('🔍 Chatbot search result:', {
            searchedId: chatbotId,
            found: !!chatbot,
            chatbotName: chatbot?.name
        })

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot bulunamadı' }, { status: 404 })
        }

        if (!chatbot.isActive) {
            return NextResponse.json({ error: 'Chatbot aktif değil' }, { status: 400 })
        }

        // Mode'a göre response oluştur (mode parameter'den ya da chatbot'tan)
        const activeMode = mode || chatbot.mode || 'education'
        let botResponse: string
        let sources: Array<{documentName: string, similarity: number}> = []
        let confidence: number = 0

        console.log('🔍 Active mode:', activeMode)

        if (activeMode === 'education') {
            // Education mode - scholarship/university questions
            botResponse = await handleEducationQuery(message, chatbot)
        } else {
            // Document mode - RAG ile cevap oluştur
            const ragResult = await handleDocumentQuery(message, chatbot)
            botResponse = ragResult.response
            sources = ragResult.sources
            confidence = ragResult.confidence
        }

        console.log('🔍 Generated response:', { botResponse, sources, confidence })

        // Conversation yönetimi
        let conversation
        if (conversationId && conversationId !== 'null') {
            conversation = await prisma.conversation.findUnique({
                where: { id: conversationId }
            })
        }

        if (!conversation) {
            conversation = await prisma.conversation.create({
                data: {
                    chatbotId,
                    visitorId: generateVisitorId(),
                    status: 'active'
                }
            })
        }

        // Message'ları kaydet (ConversationMessage modeli kullan)
        await prisma.$transaction([
            // User message
            prisma.conversationMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: 'user',
                    content: message
                }
            }),
            // Bot response
            prisma.conversationMessage.create({
                data: {
                    conversationId: conversation.id,
                    role: 'assistant',
                    content: botResponse,
                    aiModel: 'gpt-3.5-turbo',
                    confidence: confidence || null,
                    sources: sources.length > 0 ? sources : null
                }
            })
        ])

        console.log('✅ Messages saved to database')

        return NextResponse.json({
            success: true,
            response: botResponse,
            conversationId: conversation.id,
            sources,
            confidence,
            mode: activeMode
        })

    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json({
            error: 'Bir hata oluştu',
            details: error instanceof Error ? error.message : 'Bilinmeyen hata'
        }, { status: 500 })
    }
}

/**
 * Document-based RAG query handler (Enhanced)
 */
async function handleDocumentQuery(message: string, chatbot: any) {
    try {
        // Check for basic greetings and simple questions
        const isBasicGreeting = /^(merhaba|hello|hi|hey|selam|hola|bonjour|guten tag)$/i.test(message.trim())
        const isSimpleQuestion = /^(nasılsın|how are you|ne haber|what's up|iyisin|are you ok)$/i.test(message.trim())
        const isHelp = /(yardım|help|assistance|destek)/i.test(message)

        // For basic interactions, respond without requiring documents
        if (isBasicGreeting) {
            return {
                response: `Merhaba! Ben ${chatbot.botName || chatbot.name} chatbot'uyum. Size yüklediğiniz dokümanlar hakkında sorular sorabileceğiniz gibi, genel sorularınızı da yanıtlayabilirim. Nasıl yardımcı olabilirim?`,
                sources: [],
                confidence: 95
            }
        }

        if (isSimpleQuestion) {
            return {
                response: `İyiyim, teşekkür ederim! Dokümanlarınız hakkında sorular sormaya hazırım. Henüz doküman yüklemediyseniz, genel sorularınızı da yanıtlayabilirim.`,
                sources: [],
                confidence: 90
            }
        }

        if (isHelp) {
            return {
                response: `Elbette yardımcı olmaktan mutluluk duyarım! Size şu şekillerde yardımcı olabilirim:

📄 **Doküman Analizi**: Yüklediğiniz PDF, Word veya metin dosyalarını analiz ederim
💬 **Genel Sorular**: Doküman dışında genel sorularınızı da yanıtlarım  
🔍 **İçerik Arama**: Dokümanlarınızdan spesifik bilgileri bulabilirim

Ne konuda yardıma ihtiyacınız var?`,
                sources: [],
                confidence: 95
            }
        }

        // Check if there are any documents for this chatbot
        const documentCount = await prisma.document.count({
            where: {
                chatbotId: chatbot.id,
                status: 'ready'
            }
        })

        // If no documents and it's a complex question, suggest document upload
        const isComplexQuestion = message.length > 20 && !/^(ne|what|how|kim|when|where|why|neden|nasıl|nerede)/.test(message.toLowerCase())

        if (documentCount === 0) {
            if (isComplexQuestion) {
                return {
                    response: `Bu konuda size daha iyi yardımcı olabilmek için ilgili dokümanlarınızı yüklemenizi öneririm. 

Alternatif olarak, genel bir sorunuz varsa onu da yanıtlamaya çalışabilirim. Sorunuzu biraz daha açık şekilde belirtir misiniz?`,
                    sources: [],
                    confidence: 60
                }
            } else {
                // For simple questions, try to answer generally
                return await getGeneralResponse(message, chatbot)
            }
        }

        // TODO: Real RAG search will go here
        // For now, simulate document-based response
        return await getDocumentBasedResponse(message, chatbot, documentCount)

    } catch (error) {
        console.error('Document query error:', error)
        return {
            response: chatbot.fallbackMessage || 'Teknik bir sorun oluştu. Lütfen tekrar deneyin.',
            sources: [],
            confidence: 0
        }
    }
}

/**
 * Generate general response for simple questions
 */
async function getGeneralResponse(message: string, chatbot: any) {
    try {
        const systemMessage = `Sen ${chatbot.botName || chatbot.name} adında yardımcı bir asistansın. 
        Kullanıcının genel sorularını yanıtlıyorsun. Samimi ve yararlı ol.
        Türkçe sorulara Türkçe, İngilizce sorulara İngilizce cevap ver.`

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: message }
            ],
            max_tokens: 300,
            temperature: 0.7
        })

        const response = completion.choices[0]?.message?.content ||
            'Size nasıl yardımcı olabilirim?'

        return {
            response,
            sources: [],
            confidence: 80
        }
    } catch (error) {
        return {
            response: 'Genel bir sorunuz var mı? Size yardımcı olmaya çalışabilirim.',
            sources: [],
            confidence: 70
        }
    }
}

/**
 * Generate document-based response (placeholder for real RAG)
 */
async function getDocumentBasedResponse(message: string, chatbot: any, documentCount: number) {
    try {
        const systemMessage = `Sen ${chatbot.name || 'AI Asistan'} adında yardımcı bir asistansın. 
        Kullanıcının yüklediği ${documentCount} dokümana göre cevap veriyorsun. 
        Eğer dokümanlardan kesin bilgi bulamazsan, genel bilginle yardım et.`

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: message }
            ],
            max_tokens: 500,
            temperature: 0.7
        })

        const response = completion.choices[0]?.message?.content ||
            chatbot.fallbackMessage ||
            'Dokümanlarınızı inceliyorum...'

        return {
            response,
            sources: [{ documentName: `${documentCount} doküman`, similarity: 75 }],
            confidence: 85
        }

    } catch (error) {
        console.error('Document-based response error:', error)
        return {
            response: 'Dokümanlarınızı analiz etmeye çalışıyorum. Biraz daha spesifik soru sorabilir misiniz?',
            sources: [],
            confidence: 60
        }
    }
}

/**
 * Education mode query handler
 */
/**
 * Education mode query handler with visa support
 */
async function handleEducationQuery(message: string, chatbot: any) {
    try {
        console.log('🔍 Handling education query:', message)

        // Check query types
        const isVisaQuery = /vize|visa|vizesi|schengen|student visa|öğrenci vizesi|başvuru|konsolosluk/i.test(message)
        const isScholarshipQuery = /burs|scholarship|öğrenim|yardım|maddi|finansal/i.test(message)
        const isUniversityQuery = /üniversite|university|okul|eğitim|study|kampüs|college/i.test(message)

        console.log('🔍 Query type:', { isVisaQuery, isScholarshipQuery, isUniversityQuery })

        // Handle visa queries first (highest priority for detailed information)
        if (isVisaQuery) {
            return await handleVisaQuery(message, chatbot)
        }

        let systemMessage = `Sen ${chatbot.name || 'Eğitim Danışmanı'} adında bir eğitim danışmanısın. 
        Uluslararası öğrencilere üniversite, burs ve vize konularında yardım ediyorsun.
        Türkçe sorulara Türkçe, İngilizce sorulara İngilizce cevap veriyorsun.`

        let context = ''

        if (isScholarshipQuery) {
            try {
                // Get scholarship data
                const scholarships = await prisma.scholarship.findMany({
                    where: {
                        OR: [
                            { title: { contains: extractKeywords(message), mode: 'insensitive' } },
                            { description: { contains: extractKeywords(message), mode: 'insensitive' } },
                            { country: { contains: extractKeywords(message), mode: 'insensitive' } }
                        ]
                    },
                    take: 3,
                    select: {
                        title: true,
                        country: true,
                        amount: true,
                        description: true,
                        requirements: true,
                        applicationUrl: true
                    }
                })

                console.log('🔍 Found scholarships:', scholarships.length)

                if (scholarships.length > 0) {
                    context = '\n\nİlgili Burs Fırsatları:\n' +
                        scholarships.map(s =>
                            `- ${s.title} (${s.country})\n  Miktar: ${s.amount || 'Belirtilmemiş'}\n  ${s.description?.slice(0, 200)}...`
                        ).join('\n\n')
                }
            } catch (error) {
                console.error('Scholarship search error:', error)
            }
        }

        if (isUniversityQuery) {
            try {
                // Get university data
                const universities = await prisma.university.findMany({
                    where: {
                        OR: [
                            { name: { contains: extractKeywords(message), mode: 'insensitive' } },
                            { country: { contains: extractKeywords(message), mode: 'insensitive' } },
                            { city: { contains: extractKeywords(message), mode: 'insensitive' } }
                        ]
                    },
                    take: 3,
                    select: {
                        name: true,
                        country: true,
                        city: true,
                        ranking: true,
                        tuitionMin: true,
                        tuitionMax: true,
                        programs: true
                    }
                })

                console.log('🔍 Found universities:', universities.length)

                if (universities.length > 0) {
                    context += '\n\nİlgili Üniversiteler:\n' +
                        universities.map(u =>
                            `- ${u.name} (${u.city}, ${u.country})\n  Sıralama: ${u.ranking || 'N/A'}\n  Programlar: ${u.programs?.slice(0, 3)?.join(', ')}`
                        ).join('\n\n')
                }
            } catch (error) {
                console.error('University search error:', error)
            }
        }

        if (context) {
            systemMessage += context + '\n\nBu bilgileri kullanarak soruyu yanıtla.'
        } else {
            systemMessage += '\n\nGenel eğitim danışmanlığı yap ve mümkün olduğunca yardımcı ol.'
        }

        console.log('🔍 Calling OpenAI with system message length:', systemMessage.length)

        // OpenAI ile response oluştur
        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: message }
            ],
            max_tokens: 500,
            temperature: 0.7
        })

        const response = completion.choices[0]?.message?.content ||
            chatbot.fallbackMessage ||
            'Eğitim konusunda size nasıl yardımcı olabilirim?'

        console.log('🔍 OpenAI response received, length:', response.length)

        return response

    } catch (error) {
        console.error('Education query error:', error)

        // Enhanced fallback responses based on query type
        if (/vize|visa/i.test(message)) {
            return `Vize konusunda size yardımcı olmaktan mutluluk duyarım! 

🛂 **Öğrenci Vizesi Genel Bilgileri:**
📋 Gerekli belgeler: Kabul mektubu, mali durum, pasaport, sağlık sigortası
⏰ Başvuru süreci: 2-8 hafta (ülkeye göre değişir)
💰 Ücretler: $160-300 arası (ülkeye göre değişir)

Hangi ülke için vize bilgisine ihtiyacınız var? Size daha detaylı bilgi verebilirim.`
        }

        if (/burs|scholarship/i.test(message)) {
            return `Burs konusunda size yardımcı olabilirim!

💰 **Popüler Burs Programları:**
🇹🇷 Türkiye Bursları - Tam burslu
🇺🇸 Fulbright - Lisansüstü programlar  
🇩🇪 DAAD - Almanya'da eğitim
🏛️ Erasmus+ - Avrupa üniversiteleri

Hangi seviyede (lisans/master/doktora) ve hangi ülkede eğitim almak istiyorsunuz?`
        }

        if (/üniversite|university/i.test(message)) {
            return `Üniversite seçiminde size yardımcı olmaktan mutluluk duyarım!

🎓 **Popüler Destinasyonlar:**
🇺🇸 Amerika - MIT, Harvard, Stanford
🇬🇧 İngiltere - Oxford, Cambridge, Imperial  
🇩🇪 Almanya - TU Munich, Heidelberg
🇨🇦 Kanada - Toronto, UBC, McGill

Hangi alanda ve hangi ülkede okumak istiyorsunuz? Size uygun üniversiteleri önerebilirim.`
        }

        return chatbot.fallbackMessage || 'Teknik bir sorun oluştu. Lütfen tekrar deneyin.'
    }
}

/**
 * Handle visa-related queries
 */
async function handleVisaQuery(message: string, chatbot: any) {
    try {
        console.log('🛂 Handling visa query:', message)

        // Extract country from message
        const countries = extractCountriesFromMessage(message)
        const visaType = extractVisaType(message)

        console.log('🔍 Extracted:', { countries, visaType })

        let context = ''

        if (countries.length > 0) {
            try {
                // Search for visa information
                const visaInfos = await prisma.visaInfo.findMany({
                    where: {
                        country: {
                            in: countries,
                            mode: 'insensitive'
                        },
                        ...(visaType && {
                            visaType: {
                                contains: visaType,
                                mode: 'insensitive'
                            }
                        })
                    },
                    take: 3
                })

                console.log('🛂 Found visa infos:', visaInfos.length)

                if (visaInfos.length > 0) {
                    context = '\n\nVize Bilgileri:\n' +
                        visaInfos.map(visa =>
                            `🛂 **${visa.country} - ${visa.visaType}**\n` +
                            `⏰ Süre: ${visa.duration}\n` +
                            `💰 Ücret: ${visa.cost ? `$${visa.cost}` : 'Değişken'}\n` +
                            `⚡ İşlem Süresi: ${visa.processingTime}\n` +
                            `📋 Gereksinimler: ${formatRequirements(visa.requirements)}\n` +
                            `${visa.website ? `🔗 Website: ${visa.website}\n` : ''}` +
                            `${visa.description ? `ℹ️ ${visa.description.slice(0, 200)}...\n` : ''}`
                        ).join('\n')
                }
            } catch (error) {
                console.error('Visa DB search error:', error)
                // Continue with general response
            }
        }

        // Generate AI response with visa context
        const systemMessage = `Sen ${chatbot.name || 'Eğitim Danışmanı'} adında bir eğitim danışmanısın.
        Öğrenci vizesi konusunda uzmanısın.
        Türkçe sorulara Türkçe, İngilizce sorulara İngilizce cevap ver.
        
        ${context ? context + '\n\nBu vize bilgilerini kullanarak soruyu yanıtla.' :
            '\n\nGenel vize danışmanlığı yap ve doğru kaynaklara yönlendir.'}`

        const completion = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: systemMessage },
                { role: 'user', content: message }
            ],
            max_tokens: 600,
            temperature: 0.7
        })

        return completion.choices[0]?.message?.content ||
            'Vize konusunda size yardımcı olmaktan mutluluk duyarım. Hangi ülke için vize bilgisine ihtiyacınız var?'

    } catch (error) {
        console.error('Visa query error:', error)
        return generateVisaFallbackResponse(message)
    }
}

/**
 * Extract countries from message
 */
function extractCountriesFromMessage(message: string): string[] {
    const countryMap: Record<string, string[]> = {
        'USA': ['amerika', 'usa', 'united states', 'abd'],
        'Germany': ['almanya', 'germany', 'deutschland'],
        'UK': ['ingiltere', 'uk', 'united kingdom', 'britain', 'england'],
        'Canada': ['kanada', 'canada'],
        'Australia': ['avustralya', 'australia'],
        'France': ['fransa', 'france'],
        'Netherlands': ['hollanda', 'netherlands'],
        'Italy': ['italya', 'italy'],
        'Spain': ['ispanya', 'spain'],
        'Sweden': ['isvec', 'sweden'],
        'Norway': ['norvec', 'norway'],
        'Denmark': ['danimarka', 'denmark'],
        'Finland': ['finlandiya', 'finland'],
        'Switzerland': ['isvicre', 'switzerland'],
        'Austria': ['avusturya', 'austria'],
        'Belgium': ['belcika', 'belgium'],
        'Ireland': ['irlanda', 'ireland'],
        'New Zealand': ['yeni zelanda', 'new zealand'],
        'Japan': ['japonya', 'japan'],
        'South Korea': ['guney kore', 'south korea', 'korea'],
        'Singapore': ['singapur', 'singapore'],
        'Poland': ['polonya', 'poland'],
        'Czech Republic': ['cek cumhuriyeti', 'czech republic', 'czechia'],
        'Hungary': ['macaristan', 'hungary'],
        'Portugal': ['portekiz', 'portugal']
    }

    const foundCountries: string[] = []
    const messageLower = message.toLowerCase()

    for (const [country, aliases] of Object.entries(countryMap)) {
        if (aliases.some(alias => messageLower.includes(alias))) {
            foundCountries.push(country)
        }
    }

    return foundCountries
}

/**
 * Extract visa type from message
 */
function extractVisaType(message: string): string | null {
    const messageLower = message.toLowerCase()

    if (/student|öğrenci|study|eğitim/.test(messageLower)) return 'Student'
    if (/tourist|turist|visit|ziyaret/.test(messageLower)) return 'Tourist'
    if (/work|çalışma|employment/.test(messageLower)) return 'Work'
    if (/transit|geçiş/.test(messageLower)) return 'Transit'

    return null
}

/**
 * Format requirements from JSON
 */
function formatRequirements(requirements: any): string {
    if (!requirements) return 'Belirtilmemiş'

    if (typeof requirements === 'string') return requirements

    if (Array.isArray(requirements)) {
        return requirements.join(', ')
    }

    if (typeof requirements === 'object') {
        return Object.entries(requirements)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ')
    }

    return 'Detaylar için resmi kaynaklara başvurun'
}

/**
 * Generate fallback response for visa queries
 */
function generateVisaFallbackResponse(message: string): string {
    const countries = extractCountriesFromMessage(message)

    if (countries.length > 0) {
        const country = countries[0]
        return `${country} öğrenci vizesi hakkında size yardımcı olmak isterim. 

Genel olarak öğrenci vizesi için şunlar gereklidir:
📋 Kabul mektubu
💰 Mali durum belgesi  
📄 Pasaport
🏥 Sağlık sigortası
📝 Vize başvuru formu

${country} için güncel ve detaylı bilgi almak için:
• Resmi konsolosluk web sitesini ziyaret edin
• Eğitim danışmanınızla konuşun
• Başvuracağınız üniversitenin international office'ine danışın

Başka hangi konularda yardıma ihtiyacınız var?`
    }

    return `Vize başvuru süreçleri ülkeye göre değişir. Hangi ülke için vize bilgisine ihtiyacınız var?

🌍 Popüler öğrenci vize destinasyonları:
• 🇺🇸 Amerika (F-1 Visa)
• 🇩🇪 Almanya (National Visa)  
• 🇬🇧 İngiltere (Student Visa)
• 🇨🇦 Kanada (Study Permit)
• 🇦🇺 Avustralya (Student Visa)

Hangi ülke sizi ilgilendiriyor?`
}