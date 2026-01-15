'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl' // ✅ Çeviri hook'ları
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Bot, GraduationCap, ShoppingCart, ArrowLeft, TestTube, Building2 } from 'lucide-react'
import ChatWidget from '@/components/ChatWidget'
import { RealEstateWidget } from '@/components/widget/RealEstateWidget'
import { EducationWidget } from '@/components/widget/EducationWidget'
import { EcommerceWidget } from '@/components/widget/EcommerceWidget'

// Tip tanımları
type ChatbotMode = 'document' | 'education' | 'ecommerce' | 'hybrid' | 'general' | string;

export default function WidgetTestPage() {
    const t = useTranslations('WidgetTest') // ✅ Çeviri namespace'i
    const locale = useLocale() // ✅ Aktif dili al (tr, en, de...)
    const searchParams = useSearchParams()

    const [chatbotId, setChatbotId] = useState('')
    const [mode, setMode] = useState<ChatbotMode>('general')
    const [chatKey, setChatKey] = useState(0)

    // URL'den ID ve Mode'u yakala
    useEffect(() => {
        const idFromUrl = searchParams.get('chatbotId')
        const modeFromUrl = searchParams.get('mode') as ChatbotMode

        if (idFromUrl) {
            setChatbotId(idFromUrl)
            setChatKey(prev => prev + 1)
        }

        if (modeFromUrl) {
            setMode(modeFromUrl)
        } else {
            setMode('general');
        }
    }, [searchParams])

    // Sektöre özel çeviri ve ikonları döndüren yardımcı fonksiyon
    const getSectorInfo = (currentMode: ChatbotMode) => {
        // Varsayılan (General)
        let title = t('modes.general.title');
        let desc = t('modes.general.desc');
        let icon = <Bot className="w-8 h-8 text-gray-600" />;
        let colorClass = 'text-gray-600';
        let suggestions = (
            <div className="space-y-3 text-sm">
                <div className="p-3 bg-gray-100 rounded">
                    <strong>{t('suggestions.general.topic1')}:</strong>
                    <p className="text-gray-700 mt-1">"{t('suggestions.general.question1')}"</p>
                </div>
            </div>
        );

        // EDUCATION (Eğitim)
        if (currentMode === 'education' || currentMode === 'university') {
            title = t('modes.education.title');
            desc = t('modes.education.desc');
            icon = <GraduationCap className="w-8 h-8 text-blue-600" />;
            colorClass = 'text-blue-600';
            suggestions = (
                <div className="space-y-3 text-sm">
                    <div className="p-3 bg-blue-50 rounded">
                        <strong>{t('suggestions.education.topic1')}:</strong>
                        <p className="text-gray-700 mt-1">"{t('suggestions.education.question1')}"</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                        <strong>{t('suggestions.education.topic2')}:</strong>
                        <p className="text-gray-700 mt-1">"{t('suggestions.education.question2')}"</p>
                    </div>
                </div>
            );
        }
        // E-COMMERCE (E-ticaret)
        else if (currentMode === 'ecommerce') {
            title = t('modes.ecommerce.title');
            desc = t('modes.ecommerce.desc');
            icon = <ShoppingCart className="w-8 h-8 text-green-600" />;
            colorClass = 'text-green-600';
            suggestions = (
                <div className="space-y-3 text-sm">
                    <div className="p-3 bg-green-50 rounded">
                        <strong>{t('suggestions.ecommerce.topic1')}:</strong>
                        <p className="text-gray-700 mt-1">"{t('suggestions.ecommerce.question1')}"</p>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded">
                        <strong>{t('suggestions.ecommerce.topic2')}:</strong>
                        <p className="text-gray-700 mt-1">"{t('suggestions.ecommerce.question2')}"</p>
                    </div>
                </div>
            );
        }

        return { title, desc, icon, suggestions, colorClass };
    }

    const { title, desc, icon, suggestions, colorClass } = getSectorInfo(mode);

    // Widget'ı manuel olarak sıfırlama
    const refreshWidget = () => {
        if (!chatbotId) {
            alert(t('errors.noId'));
            return;
        }
        setChatKey(prev => prev + 1);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    {/* ✅ Link artık dinamik locale kullanıyor */}
                    <Link href={`/${locale}/dashboard/chatbots/${chatbotId}`} className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        {t('backToDetail')}
                    </Link>
                    <h1 className="text-4xl font-bold flex items-center justify-center gap-3" style={{ color: colorClass }}>
                        {icon}
                        {title}
                    </h1>
                    <p className="text-gray-600 text-lg">
                        {desc}
                    </p>
                </div>

                {/* Canlı Görünüm ve Test Alanı */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TestTube className={`w-5 h-5 ${colorClass}`} />
                            {t('interactionArea')}
                        </CardTitle>
                        <CardDescription>
                            {t('interactionDesc')}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg border items-center">
                            <Input
                                type="text"
                                placeholder={t('chatbotIdPlaceholder')}
                                value={chatbotId}
                                className="flex-1 font-mono text-sm bg-white"
                                readOnly
                            />
                            <Badge variant="secondary" className="bg-white">{t('modeLabel')}: {mode}</Badge>
                            <Button
                                onClick={refreshWidget}
                                variant="outline"
                                disabled={!chatbotId}
                            >
                                {t('resetChat')}
                            </Button>
                        </div>

                        {/* Widget Display */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Widget */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Bot className="w-5 h-5 text-blue-500" />
                                    {t('widgetInterface')}
                                </h2>
                                <div className="flex justify-center">
                                    {chatbotId ? (
                                        <ChatWidget
                                            key={chatKey} // ID/Refresh durumunda sıfırlar
                                            chatbotId={chatbotId}
                                            mode={mode}
                                        />
                                    ) : (
                                        <div className="p-16 bg-gray-100 rounded text-center text-gray-500">
                                            {t('errors.waitingId')}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Test Suggestions */}
                            <div className="space-y-4">
                                <h2 className="text-xl font-semibold">{t('testSuggestionsTitle')} ({mode})</h2>
                                <p className="text-sm text-gray-600">
                                    {t('testSuggestionsDesc')}
                                </p>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg">{t('exampleQuestions')}:</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        {/* Dinamik öneriler */}
                                        {suggestions}

                                        <div className="text-xs text-yellow-700 mt-2">
                                            {t('processingNote')}
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Floating WhatsApp-style Widget based on mode */}
            {chatbotId && mode === 'realestate' && (
                <RealEstateWidget
                    locale={locale as 'tr' | 'en'}
                    chatbotIdentifier={chatbotId}
                />
            )}
            {chatbotId && (mode === 'education' || mode === 'university') && (
                <EducationWidget locale={locale as 'tr' | 'en'} chatbotId={chatbotId} />
            )}
            {chatbotId && mode === 'ecommerce' && (
                <EcommerceWidget locale={locale as 'tr' | 'en'} chatbotId={chatbotId} />
            )}
        </div>
    )
}