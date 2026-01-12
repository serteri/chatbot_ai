import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import OpenAI from 'openai'
import { checkRateLimit, rateLimitExceededResponse, getRateLimitHeaders, type PlanType } from '@/lib/rate-limit'

// OpenAI İstemcisi
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Prisma Client uyumluluğu için Node.js runtime kullanıyoruz
export const runtime = 'nodejs';

// ---------------------------------------------------------------------------
// ✅ YEDEK PLAN: KELİME BAZLI ARAMA (Keyword Search)
// Vektör veritabanı çalışmazsa veya sonuçlar yetersizse devreye girer.
// ---------------------------------------------------------------------------
async function performKeywordSearch(query: string, chatbotId: string): Promise<{ context: string, sources: string[] } | null> {
    try {
        // Fallback: Keyword-based search

        // ✅ GÜNCELLEME: Çok dilli Stop Words listesi (TR, EN, DE, FR, ES)
        const stopWords = [
            // Türkçe
            'nedir', 'nelerdir', 'neler', 'hakkında', 'bilgi', 'ver', 'nasıl', 'kimdir', 'mi', 'mu', 'mı', 'mü', 'için', 've', 'veya',
            // İngilizce
            'what', 'where', 'how', 'who', 'when', 'which', 'is', 'are', 'about', 'tell', 'me', 'give', 'info', 'information', 'for', 'and', 'or',
            // Almanca
            'was', 'wo', 'wie', 'wer', 'wann', 'welche', 'ist', 'sind', 'über', 'gib', 'mir', 'informationen', 'und', 'oder', 'für',
            // Fransızca
            'qu', 'est-ce', 'que', 'qui', 'comment', 'où', 'quand', 'quel', 'est', 'sont', 'sur', 'donne', 'moi', 'infos', 'et', 'ou', 'pour',
            // İspanyolca
            'que', 'donde', 'como', 'quien', 'cuando', 'cual', 'es', 'son', 'sobre', 'dame', 'informacion', 'y', 'o', 'para'
        ];

        const rawTerms = query.trim().toLowerCase().split(/\s+/);

        // Terimleri temizle
        const terms = rawTerms
            .map(t => t.replace(/[?.,!;:()"]/g, '')) // Noktalama işaretlerini kaldır
            .filter(t => t.length > 2) // 2 harften uzun kelimeleri al
            .filter(t => !stopWords.includes(t)); // Stop words listesindekileri at

        if (terms.length === 0) return null;

        // Veritabanında kelime bazlı arama yap (OR mantığıyla herhangi biri geçiyorsa)
        const chunks = await prisma.documentChunk.findMany({
            where: {
                document: { chatbotId: chatbotId, status: 'ready' },
                OR: terms.map(term => ({
                    content: { contains: term, mode: 'insensitive' }
                }))
            },
            take: 5,
            select: { content: true }
        });

        if (!chunks || chunks.length === 0) {
            return null;
        }

        // Score chunks based on keyword matches

        // Basit Puanlama (En çok kelime geçen en üste)
        const scoredChunks = chunks.map(chunk => {
            let score = 0;
            const lowerContent = chunk.content.toLowerCase();
            terms.forEach(term => {
                if (lowerContent.includes(term)) score += 1;
            });
            return { content: chunk.content, score };
        });

        scoredChunks.sort((a, b) => b.score - a.score);
        const topChunks = scoredChunks.filter(c => c.score > 0).slice(0, 3);

        if (topChunks.length === 0) return null;

        const contextText = topChunks.map(c => c.content).join('\n---\n');
        return { context: contextText, sources: ["Dokümanlar (Kelime Eşleşmesi)"] };

    } catch (error) {
        console.error("Keyword Search Error:", error);
        return null;
    }
}

// ---------------------------------------------------------------------------
// ✅ ANA PLAN: VEKTÖR ARAMA (Semantic Search)
// ---------------------------------------------------------------------------
async function performVectorSearch(query: string, chatbotId: string): Promise<{ context: string, sources: string[] } | null> {
    if (!openai) return null;

    try {
        // Vector-based semantic search

        const embeddingResponse = await openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: query.replace(/\n/g, ' '),
        });

        const embedding = embeddingResponse.data[0].embedding;
        const vectorQuery = `[${embedding.join(',')}]`;

        const chunks: any[] = await prisma.$queryRaw`
            SELECT content, 
                   1 - (embedding <=> ${vectorQuery}::vector) as similarity
            FROM "DocumentChunk"
            WHERE "documentId" IN (
                SELECT id FROM "Document" 
                WHERE "chatbotId" = ${chatbotId} 
                AND status = 'ready'
            )
            ORDER BY similarity DESC
            LIMIT 5;
        `;

        if (!chunks || chunks.length === 0) {
            return await performKeywordSearch(query, chatbotId);
        }

        // Similarity threshold check
        const relevantChunks = chunks.filter(chunk => chunk.similarity > 0.10);

        if (relevantChunks.length === 0) {
            return await performKeywordSearch(query, chatbotId);
        }

        const contextText = relevantChunks.map(c => c.content).join('\n---\n');
        return { context: contextText, sources: ["Dokümanlar (Vektör)"] };

    } catch (error: any) {
        console.error("Vektör Arama Hatası:", error.message);
        // Hata durumunda Keyword Search'e düş
        return await performKeywordSearch(query, chatbotId);
    }
}

// ---------------------------------------------------------------------------
// ✅ API HANDLE
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
    let ragContext: string | null = null;
    let dataSourcesUsed: string[] = [];
    let finalMode = 'general';

    // Rate limiting check
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
    const rateLimitResult = await checkRateLimit(ip, 'ip', 'free');

    if (!rateLimitResult.allowed) {
        return rateLimitExceededResponse(rateLimitResult.retryAfter);
    }

    try {
        const body = await req.json();

        let messageContent = "";
        let conversationHistory = [];

        if (body.messages && Array.isArray(body.messages)) {
            const lastMsg = body.messages[body.messages.length - 1];
            messageContent = lastMsg.content;
            conversationHistory = body.messages.slice(0, -1);
        } else if (body.message) {
            messageContent = body.message;
            conversationHistory = body.conversationHistory || [];
        } else {
            return NextResponse.json({ error: "Mesaj bulunamadı" }, { status: 400 });
        }

        const chatbotId = body.chatbotId;
        finalMode = body.mode || 'education';

        if (!chatbotId || !openai) {
            return NextResponse.json({ error: "Eksik parametreler" }, { status: 400 });
        }

        const chatbot = await prisma.chatbot.findFirst({
            where: { OR: [{ id: chatbotId }, { identifier: chatbotId }] },
            select: { id: true, name: true, welcomeMessage: true, userId: true }
        });

        if (!chatbot) {
            return NextResponse.json({ error: "Chatbot bulunamadı" }, { status: 404 });
        }

        // Conversation ID'yi al veya yeni oluştur
        const existingConversationId = body.conversationId;
        let conversation;
        let isNewConversation = false;
        const visitorId = body.visitorId || `visitor_${Date.now()}`;

        if (existingConversationId) {
            conversation = await prisma.conversation.findUnique({
                where: { id: existingConversationId }
            });
        }

        if (!conversation) {
            isNewConversation = true;

            // Coğrafi Veri Toplama (Vercel/Next.js Headers)
            const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1';
            const countryCode = req.headers.get('x-vercel-ip-country'); // Vercel Edge'den gelir

            let countryName = null;

            // Localhost kontrolü (Kullanıcı Avustralya'da)
            if (ip === '127.0.0.1' || ip === '::1') {
                countryName = 'Australia';
            } else if (countryCode) {
                try {
                    const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });
                    countryName = regionNames.of(countryCode);
                } catch (e) {
                    countryName = countryCode;
                }
            }

            conversation = await prisma.conversation.create({
                data: {
                    chatbotId: chatbot.id,
                    visitorId: visitorId,
                    status: 'active',
                    ipAddress: ip,
                    country: countryName
                }
            });
        }

        // Kullanıcı mesajını kaydet
        await prisma.conversationMessage.create({
            data: {
                conversationId: conversation.id,
                role: 'user',
                content: messageContent,
            }
        });

        // --- RAG ARAMASI ---
        const searchResult = await performVectorSearch(messageContent, chatbot.id);
        ragContext = searchResult?.context || null;

        if (ragContext) {
            dataSourcesUsed.push('documents');
        }

        // --- SYSTEM PROMPT ---
        const systemPrompt = `Sen "${chatbot.name}" adında profesyonel bir eğitim asistanısın.
        
TALİMATLAR:
1. Kullanıcının sorusunu ÖNCELİKLE aşağıdaki [DOKÜMAN BİLGİSİ] kısmını kullanarak yanıtla.
2. [DOKÜMAN BİLGİSİ] içinde sorunun cevabı varsa, net ve anlaşılır bir şekilde açıkla.
3. Cevaplarını kullanıcının sorduğu dilde ver (Soru İngilizce ise İngilizce, Türkçe ise Türkçe cevapla).
4. Eğer dokümanda bilgi yoksa ve soru genel bir eğitim sorusuysa (örn: "merhaba"), nazikçe cevap ver.
5. Dokümanda olmayan spesifik bir bilgi sorulursa, "Yüklenen dokümanlarda bu bilgiye rastlayamadım." diye belirt.
6. Asla uydurma bilgi verme.

[DOKÜMAN BİLGİSİ]
${ragContext || "Şu an için ilgili bir doküman parçası bulunamadı."}
[DOKÜMAN BİLGİSİ SONU]
`;

        const response = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            stream: false,
            messages: [
                { role: 'system', content: systemPrompt },
                ...conversationHistory.slice(-3),
                { role: 'user', content: messageContent }
            ],
            temperature: 0.3,
        });

        const aiResponse = response.choices[0].message.content || "Cevap üretilemedi.";

        // AI yanıtını kaydet
        await prisma.conversationMessage.create({
            data: {
                conversationId: conversation.id,
                role: 'assistant',
                content: aiResponse,
            }
        });

        // İstatistikleri güncelle
        await prisma.chatbot.update({
            where: { id: chatbot.id },
            data: {
                totalMessages: { increment: 2 },
            }
        });

        return NextResponse.json({
            success: true,
            response: aiResponse,
            conversationId: conversation.id,
            context: {
                mode: finalMode,
                dataSourcesUsed: Array.from(new Set(dataSourcesUsed)),
                resultsCount: ragContext ? 1 : 0
            }
        });

    } catch (error: any) {
        console.error('Chat API Error:', error);
        return NextResponse.json({
            success: false,
            response: "Sistemsel bir hata oluştu.",
            error: error.message
        }, { status: 500 });
    }
}