import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { checkRateLimit, rateLimitExceededResponse } from '@/lib/rate-limit';

// OpenAI kütüphanesini kullanmak isterseniz: npm install openai
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy-key',
  dangerouslyAllowBrowser: true // Sadece server-side çalıştığı için sorun yok ama Next.js bazen uyarı verir
});

export async function POST(req: NextRequest) {
  // Rate limiting for public API
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || req.headers.get('x-real-ip') || '127.0.0.1';
  const rateLimitResult = await checkRateLimit(ip, 'ip', 'free');

  if (!rateLimitResult.allowed) {
    return rateLimitExceededResponse(rateLimitResult.retryAfter);
  }

  try {
    const body = await req.json();
    const { chatbotId, message } = body;

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
        const completion = await openai.chat.completions.create({
          messages: [
            { role: "system", content: "Sen yardımsever bir asistansın." },
            { role: "user", content: message }
          ],
          model: "gpt-3.5-turbo",
        });
        aiResponse = completion.choices[0].message.content || "Bir hata oluştu.";
      } catch (error) {
        console.error("OpenAI Hatası:", error);
        aiResponse = "Üzgünüm, yapay zeka servisine şu an erişilemiyor.";
      }
    } else {
      // API KEY YOKSA ÇALIŞACAK DEMO MANTIĞI
      aiResponse = `[Demo Modu] Mesajınızı aldım: "${message}". OpenAI API anahtarı eklediğinizde burada gerçek yapay zeka cevabı görünecek.`;
    }

    // 3. (Opsiyonel) Konuşmayı Veritabanına Kaydet
    // await prisma.conversation.create(...) işlemleri burada yapılabilir.

    return NextResponse.json({ reply: aiResponse });

  } catch (error) {
    console.error('Chat API Error:', error);
    return new NextResponse('Sunucu hatası', { status: 500 });
  }
}