import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ChatInterface from '@/components/chatbot/ChatInterface';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ chatbotId: string }>;
    searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const { chatbotId } = params;
    
    const chatbot = await prisma.chatbot.findFirst({
        where: { OR: [{ id: chatbotId }, { identifier: chatbotId }] },
        select: { name: true }
    });

    return {
        title: chatbot ? `${chatbot.name} | AI Asistan` : 'Chatbot',
        robots: { index: false, follow: false } // Widget olduğu için Google indekslememeli
    };
}

export default async function ChatbotPage(props: Props) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    
    const { chatbotId } = params;
    const { lang } = searchParams;

    // Dil seçimi: URL'de ?lang=en varsa onu kullan, yoksa 'tr'
    const locale = lang === 'en' ? 'en' : 'tr';
    
    // Geçici Çeviriler (MISSING_MESSAGE hatasını önlemek için burada tutuyoruz)
    const localTranslations = {
        tr: {
            displayName: "AI Asistan",
            subTitle: "Genellikle hemen yanıt verir",
            placeholder: "Mesajınızı buraya yazın...",
            clearChat: "Sohbeti Temizle",
            today: "Bugün",
            you: "Siz",
            assistant: "Asistan",
            errorReply: "Cevap alınamadı.",
            errorConnection: "Bağlantı hatası.",
            poweredBy: "Powered by AI",
            changeLanguage: "Dili Değiştir"
        },
        en: {
            displayName: "AI Assistant",
            subTitle: "Usually replies instantly",
            placeholder: "Type your message...",
            clearChat: "Clear Chat",
            today: "Today",
            you: "You",
            assistant: "Assistant",
            errorReply: "No reply received.",
            errorConnection: "Connection error.",
            poweredBy: "Powered by AI",
            changeLanguage: "Change Language"
        }
    };

    // Aktif dilin çevirilerini seç
    const t = localTranslations[locale as keyof typeof localTranslations];

    // Veritabanından Chatbot'u çek
    const chatbot = await prisma.chatbot.findFirst({
        where: { 
             OR: [
                { id: chatbotId },
                { identifier: chatbotId }
            ]
        },
        select: {
            id: true,
            name: true,
            welcomeMessage: true,
            widgetPrimaryColor: true,
            widgetButtonColor: true,
            // HATA DÜZELTME: 'type' ve 'industry' alanları şemada olmadığı için kaldırıldı.
        }
    });

    if (!chatbot) return notFound();

    return (
        <div className="h-[100dvh] w-full overflow-hidden bg-white">
            <ChatInterface 
                chatbot={chatbot} 
                translations={t} 
                language={locale} 
            />
        </div>
    );
}