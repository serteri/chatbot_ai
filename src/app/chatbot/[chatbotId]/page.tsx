import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import ChatInterface from '@/components/chatbot/ChatInterface';
import RealEstateWidgetWrapper from '@/components/chatbot/RealEstateWidgetWrapper';
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
            widgetPosition: true,
            hideBranding: true,
            enableLiveChat: true,
            liveSupportUrl: true,
            whatsappNumber: true,
            industry: true,
            calendlyUrl: true,
            agentName: true,
            identifier: true,
            // Dil ayarını da çekiyoruz
            language: true,
            botNameTr: true,
            botNameEn: true,
            botNameDe: true,
            botNameFr: true,
            botNameEs: true,
            welcomeMessageTr: true,
            welcomeMessageEn: true,
            welcomeMessageDe: true,
            welcomeMessageFr: true,
            welcomeMessageEs: true
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

    // Localized Values Resolution
    let localizedName = chatbot.name;
    let localizedWelcome = chatbot.welcomeMessage;

    if (locale === 'tr') {
        localizedName = chatbot.botNameTr || chatbot.name;
        localizedWelcome = chatbot.welcomeMessageTr || chatbot.welcomeMessage;
    } else if (locale === 'en') {
        localizedName = chatbot.botNameEn || chatbot.name;
        localizedWelcome = chatbot.welcomeMessageEn || chatbot.welcomeMessage;
    } else if (locale === 'de') {
        localizedName = chatbot.botNameDe || chatbot.name;
        localizedWelcome = chatbot.welcomeMessageDe || chatbot.welcomeMessage;
    } else if (locale === 'fr') {
        localizedName = chatbot.botNameFr || chatbot.name;
        localizedWelcome = chatbot.welcomeMessageFr || chatbot.welcomeMessage;
    } else if (locale === 'es') {
        localizedName = chatbot.botNameEs || chatbot.name;
        localizedWelcome = chatbot.welcomeMessageEs || chatbot.welcomeMessage;
    }

    // Override chatbot object with localized values for display
    const displayChatbot = {
        ...chatbot,
        name: localizedName,
        welcomeMessage: localizedWelcome
    };

    // Çevirileri getir
    const fullTranslations = getTranslations(locale);

    // ChatInterface için formatla
    const t = {
        displayName: displayChatbot.name,
        subTitle: fullTranslations.ChatWidget.online,
        placeholder: fullTranslations.ChatWidget.placeholderGeneral,
        clearChat: fullTranslations.ChatWidget.clearChat,
        today: fullTranslations.ChatWidget.today,
        you: fullTranslations.ChatWidget.you,
        assistant: fullTranslations.ChatWidget.assistant,
        errorReply: fullTranslations.ChatWidget.errors.reply,
        errorConnection: fullTranslations.ChatWidget.errors.network,
        poweredBy: fullTranslations.ChatWidget.poweredBy,
        aiPowered: fullTranslations.ChatWidget.aiPowered,
        changeLanguage: fullTranslations.ChatWidget.changeLanguage
    };

    // If this is a real estate chatbot, render the RealEstateWidget in embedded mode
    if (chatbot.industry === 'realestate') {
        // Load next-intl messages for the RealEstateWidget
        const { getMessages } = await import('next-intl/server');
        const messages = await getMessages({ locale });

        return (
            <div className="h-[100dvh] w-full overflow-hidden bg-white">
                <RealEstateWidgetWrapper
                    locale={locale}
                    messages={messages as Record<string, any>}
                    chatbotIdentifier={chatbot.identifier || chatbot.id}
                    calendlyUrl={chatbot.calendlyUrl}
                    primaryColor={chatbot.widgetPrimaryColor}
                    agentName={chatbot.agentName || displayChatbot.name}
                    position={chatbot.widgetPosition === 'bottom-left' ? 'bottom-left' : 'bottom-right'}
                />
            </div>
        );
    }

    return (
        <div className="h-[100dvh] w-full overflow-hidden bg-white">
            <ChatInterface
                chatbot={displayChatbot}
                translations={t}
                language={locale}
            />
        </div>
    );
}