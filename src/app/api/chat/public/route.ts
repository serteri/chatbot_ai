import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';
import { searchProperties } from '@/lib/chat/actions';

// OpenAI kütüphanesini kullanmak isterseniz: npm install openai
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  dangerouslyAllowBrowser: true // Sadece server-side çalıştığı için sorun yok ama Next.js bazen uyarı verir
});

// Tool Definitions
const tools: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "search_properties",
      description: "Search for real estate properties/listings based on criteria like city, price, bedrooms, etc.",
      parameters: {
        type: "object",
        properties: {
          city: {
            type: "string",
            description: "The city or location to search in (e.g., Istanbul, Albion)"
          },
          minPrice: {
            type: "number",
            description: "Minimum price budget"
          },
          maxPrice: {
            type: "number",
            description: "Maximum price budget"
          },
          bedrooms: {
            type: "number",
            description: "Minimum number of bedrooms required"
          },
          listingType: {
            type: "string",
            enum: ["sale", "rent"],
            description: "Whether looking to buy (sale) or rent"
          },
          propertyType: {
            type: "string",
            description: "Type of property (apartment, house, villa, land)"
          }
        },
        required: []
      }
    }
  }
];

export async function POST(req: NextRequest) {
  // Rate limiting for public API
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
  const rateLimitResult = await checkRateLimit(ip, 'ip', 'free');

  if (!rateLimitResult.allowed) {
    return rateLimitExceededResponse(rateLimitResult.retryAfter);
  }

  try {
    const body = await req.json();
    const { chatbotId, message, conversationHistory } = body;

    if (!chatbotId || !message) {
      return new NextResponse('Eksik bilgi', { status: 400 });
    }

    // 1. Chatbot'u doğrula
    const chatbot = await prisma.chatbot.findFirst({
      where: {
        OR: [{ id: chatbotId }, { identifier: chatbotId }],
        isActive: true
      }
    });

    if (!chatbot) {
      return new NextResponse('Chatbot bulunamadı veya pasif', { status: 404 });
    }

    // 2. OpenAI veya Yapay Zeka Servisine Bağlan
    // Eğer API Key varsa OpenAI'dan cevap al, yoksa "demo" cevabı dön.
    let aiResponse = "";

    if (process.env.OPENAI_API_KEY) {
      try {
        // Construct messages array
        const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
          {
            role: "system",
            content: `You are a helpful real estate assistant for ${chatbot.name || 'our agency'}. 
            Use the available tools to search for properties when a user asks about them. 
            If you find properties, summarize them nicely. 
            Currency is usually the local currency of the property.`
          }
        ];

        // Add history if provided (optional)
        if (conversationHistory && Array.isArray(conversationHistory)) {
          // Basic implementation: limiting to last few messages to save context
          // logic to be added if conversationHistory structure matches OpenAI
        }

        messages.push({ role: "user", content: message });

        // First Call: Check if tool is needed
        const runner = await openai.chat.completions.create({
          messages,
          model: "gpt-3.5-turbo",
          tools: tools,
          tool_choice: "auto",
        });

        const responseMessage = runner.choices[0].message;

        // Check format of response
        if (responseMessage.tool_calls) {
          // Add the model's response to history
          messages.push(responseMessage);

          // Execute each tool
          for (const toolCall of responseMessage.tool_calls) {
            if (toolCall.function.name === 'search_properties') {
              const args = JSON.parse(toolCall.function.arguments);
              console.log('Searching properties with args:', args);

              // Execute search
              const properties = await searchProperties(args, chatbot.id);

              // Add result to messages
              messages.push({
                role: "tool",
                tool_call_id: toolCall.id,
                content: JSON.stringify(properties)
              });
            }
          }

          // Second Call: Get final text response using tool outputs
          const finalResponse = await openai.chat.completions.create({
            messages,
            model: "gpt-3.5-turbo",
          });

          aiResponse = finalResponse.choices[0].message.content || "Bir hata oluştu.";
        } else {
          // No tool called, just return text
          aiResponse = responseMessage.content || "Bir hata oluştu.";
        }

      } catch (error) {
        console.error("OpenAI Hatası:", error);
        aiResponse = "Üzgünüm, yapay zeka servisine şu an erişilemiyor.";
      }
    } else {
      // API KEY YOKSA ÇALIŞACAK DEMO MANTIĞI
      aiResponse = `[Demo Modu] Mesajınızı aldım: "${message}". OpenAI API anahtarı eklediğinizde burada gerçek yapay zeka cevabı görünecek. (Tool calling active)`;
    }

    // 3. (Opsiyonel) Konuşmayı Veritabanına Kaydet
    // await prisma.conversation.create(...) işlemleri burada yapılabilir.

    return NextResponse.json({ reply: aiResponse });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new NextResponse('Sunucu hatası', { status: 500 });
  }
}
