import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ChatInterface from '@/components/chatbot/ChatInterface';
import { Metadata } from 'next';
import { getTranslations, Locale } from '@/lib/i18n';

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
            widgetTextColor: true,
            enableLiveChat: true,
            liveSupportUrl: true,
            whatsappNumber: true,
            language: true, // Dil ayarını da çekiyoruz
        }
    });

    if (!chatbot) return notFound();

    // Dil seçimi:
    // 1. URL'de geçerli bir dil var mı?
    // 2. Chatbot'un varsayılan dili geçerli mi?
    // 3. Hiçbiri yoksa 'en' olsun.
    const validLangs = ['tr', 'en', 'de', 'fr', 'es'];
    let locale: Locale = 'en';

    if (lang && validLangs.includes(lang as string)) {
        locale = lang as Locale;
    } else if (chatbot.language && validLangs.includes(chatbot.language)) {
        locale = chatbot.language as Locale;
    }

    // Çevirileri getir
    const fullTranslations = getTranslations(locale);

    // ChatInterface için formatla
    const t = {
        displayName: fullTranslations.ChatWidget.aiPowered,
        subTitle: fullTranslations.ChatWidget.online,
        placeholder: fullTranslations.ChatWidget.placeholderGeneral,
        clearChat: fullTranslations.ChatWidget.clearChat,
        today: fullTranslations.ChatWidget.today,
        you: fullTranslations.ChatWidget.you,
        assistant: fullTranslations.ChatWidget.assistant,
        errorReply: fullTranslations.ChatWidget.errors.reply,
        errorConnection: fullTranslations.ChatWidget.errors.network,
        poweredBy: fullTranslations.ChatWidget.poweredBy,
        changeLanguage: fullTranslations.ChatWidget.changeLanguage
    };

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