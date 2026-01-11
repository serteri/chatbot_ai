import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ChatInterface from '@/components/chatbot/ChatInterface';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

type Props = {
    params: Promise<{ domain: string }>;
    searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata(props: Props): Promise<Metadata> {
    const params = await props.params;
    const { domain } = params;

    // Decode domain if needed (though rewrite usually keeps it clean)
    const decodedDomain = decodeURIComponent(domain);

    const chatbot = await prisma.chatbot.findUnique({
        where: { customDomain: decodedDomain },
        select: { name: true }
    });

    return {
        title: chatbot ? `${chatbot.name} | AI Asistan` : 'Chatbot',
        robots: { index: false, follow: false }
    };
}

export default async function CustomDomainPage(props: Props) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const { domain } = params;
    const { lang } = searchParams;

    const decodedDomain = decodeURIComponent(domain);

    // Language logic reusing the same fallback
    const locale = lang === 'en' ? 'en' : 'tr';

    // Reusing the same manual translations from ChatbotPage for consistency
    // Ideally this should be a shared constant or use next-intl if configured for this route (but middleware rewrites might affect intl context)
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

    const t = localTranslations[locale as keyof typeof localTranslations];

    const chatbot = await prisma.chatbot.findUnique({
        where: { customDomain: decodedDomain },
        select: {
            id: true,
            name: true,
            welcomeMessage: true,
            widgetPrimaryColor: true,
            widgetButtonColor: true,
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
