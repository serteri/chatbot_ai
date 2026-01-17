'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AddPropertyDialog } from './AddPropertyDialog'
import {
    Home,
    Plus,
    FileSpreadsheet,
    Upload,
    Link2,
    TrendingUp,
    Clock
} from 'lucide-react'

// Local translations for component-specific strings
const localTranslations = {
    tr: {
        soon: 'Yakında',
        connect: 'Bağlan',
        howItWorks: 'Nasıl Çalışır?',
        howItWorksDesc: 'realestate.com.au veya domain.com.au\'dan ilan URL\'si yapıştırın. Sistem otomatik olarak fotoğrafları, fiyatı, oda sayısını ve adresi çeker. Müşteri "Albion\'da 3 odalı ev istiyorum" dediğinde chatbot otomatik eşleşen ilanları carousel\'de gösterir.',
        cardDescription: 'İlanlarınızı yükleyin, chatbot müşteri tercihlerine göre otomatik eşleştirme yapsın',
        createChatbotFirst: 'Önce bir emlak chatbotu oluşturun'
    },
    en: {
        soon: 'Soon',
        connect: 'Connect',
        howItWorks: 'How It Works?',
        howItWorksDesc: 'Paste a listing URL from realestate.com.au or domain.com.au. The system automatically extracts photos, price, bedrooms, and address. When a customer asks "I want a 3-bedroom house in Albion", the chatbot shows matching listings in a carousel.',
        cardDescription: 'Upload your listings, chatbot will automatically match based on customer preferences',
        createChatbotFirst: 'Create a real estate chatbot first'
    },
    de: {
        soon: 'Bald verfügbar',
        connect: 'Verbinden',
        howItWorks: 'Wie funktioniert es?',
        howItWorksDesc: 'Fügen Sie eine Immobilien-URL von realestate.com.au oder domain.com.au ein. Das System extrahiert automatisch Fotos, Preis, Schlafzimmer und Adresse. Wenn ein Kunde fragt "Ich möchte ein 3-Zimmer-Haus in Albion", zeigt der Chatbot passende Angebote in einem Karussell.',
        cardDescription: 'Laden Sie Ihre Angebote hoch, der Chatbot passt automatisch basierend auf Kundenpräferenzen an',
        createChatbotFirst: 'Erstellen Sie zuerst einen Immobilien-Chatbot'
    },
    fr: {
        soon: 'Bientôt',
        connect: 'Connecter',
        howItWorks: 'Comment ça marche ?',
        howItWorksDesc: 'Collez une URL d\'annonce de realestate.com.au ou domain.com.au. Le système extrait automatiquement les photos, le prix, les chambres et l\'adresse. Quand un client demande "Je veux une maison de 3 chambres à Albion", le chatbot affiche les annonces correspondantes dans un carrousel.',
        cardDescription: 'Téléchargez vos annonces, le chatbot associera automatiquement selon les préférences des clients',
        createChatbotFirst: 'Créez d\'abord un chatbot immobilier'
    },
    es: {
        soon: 'Próximamente',
        connect: 'Conectar',
        howItWorks: '¿Cómo funciona?',
        howItWorksDesc: 'Pegue una URL de anuncio de realestate.com.au o domain.com.au. El sistema extrae automáticamente fotos, precio, habitaciones y dirección. Cuando un cliente pregunta "Quiero una casa de 3 habitaciones en Albion", el chatbot muestra los anuncios coincidentes en un carrusel.',
        cardDescription: 'Suba sus anuncios, el chatbot asociará automáticamente según las preferencias del cliente',
        createChatbotFirst: 'Primero cree un chatbot inmobiliario'
    }
}

interface PropertyImportSectionProps {
    locale: string
    chatbots: Array<{
        id: string
        name: string
    }>
    translations: {
        importOptions: {
            title: string
            manual: string
            manualDesc: string
            xml: string
            xmlDesc: string
            api: string
            apiDesc: string
        }
        addProperty: string
        importProperties: string
    }
}

export function PropertyImportSection({ locale, chatbots, translations: rt }: PropertyImportSectionProps) {
    const [selectedChatbotId, setSelectedChatbotId] = useState<string>(chatbots[0]?.id || '')
    const lt = localTranslations[locale as keyof typeof localTranslations] || localTranslations.en

    const hasNoChatbots = chatbots.length === 0

    return (
        <Card className="mb-8 border-t-4 border-t-blue-500">
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <Home className="h-5 w-5 text-blue-600" />
                        <CardTitle>{rt.importOptions.title}</CardTitle>
                    </div>
                    {chatbots.length > 1 && (
                        <select
                            value={selectedChatbotId}
                            onChange={(e) => setSelectedChatbotId(e.target.value)}
                            className="text-sm border rounded-md px-3 py-1.5 bg-white"
                        >
                            {chatbots.map((bot) => (
                                <option key={bot.id} value={bot.id}>
                                    {bot.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>
                <CardDescription>{lt.cardDescription}</CardDescription>
            </CardHeader>
            <CardContent>
                {hasNoChatbots ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Home className="h-12 w-12 mx-auto mb-3 text-slate-200" />
                        <p className="text-sm mb-2">{lt.createChatbotFirst}</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* Manual Entry - URL Scraping */}
                            <div className="p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Plus className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">{rt.importOptions.manual}</h4>
                                        <p className="text-xs text-muted-foreground">{rt.importOptions.manualDesc}</p>
                                    </div>
                                </div>
                                <AddPropertyDialog
                                    chatbotId={selectedChatbotId}
                                    locale={locale}
                                    trigger={
                                        <Button variant="outline" className="w-full">
                                            <Plus className="mr-2 h-4 w-4" />
                                            {rt.addProperty}
                                        </Button>
                                    }
                                />
                            </div>

                            {/* XML Import - Coming Soon */}
                            <div className="p-4 border rounded-lg opacity-60">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                        <FileSpreadsheet className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {rt.importOptions.xml}
                                            <Badge variant="secondary" className="text-xs">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {lt.soon}
                                            </Badge>
                                        </h4>
                                        <p className="text-xs text-muted-foreground">{rt.importOptions.xmlDesc}</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" disabled>
                                    <Upload className="mr-2 h-4 w-4" />
                                    {rt.importProperties}
                                </Button>
                            </div>

                            {/* Bookmarklet - Magic Buutton */}
                            <div className="p-4 border rounded-lg hover:border-purple-300 hover:bg-purple-50/50 transition-colors">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <TrendingUp className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {locale === 'tr' ? 'Sihirli Buton' : 'Magic Button'}
                                            <Badge variant="default" className="text-xs bg-purple-600 hover:bg-purple-700">
                                                {locale === 'tr' ? 'Yeni' : 'New'}
                                            </Badge>
                                        </h4>
                                        <p className="text-xs text-muted-foreground">
                                            {locale === 'tr'
                                                ? 'Tarayıcınıza ekleyin, ilanı tek tıkla kaydedin'
                                                : 'Add to browser, save listing with one click'}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white cursor-move"
                                    draggable
                                    onDragStart={(e) => {
                                        // Bookmarklet code
                                        const code = `javascript:(function(){
                                            const chatbotId = '${selectedChatbotId}';
                                            const apiEndpoint = '${window.location.origin}/api/properties/create-from-bookmarklet';
                                            
                                            const script = document.createElement('script');
                                            script.src = '${window.location.origin}/bookmarklet-script.js?t=' + Date.now();
                                            script.dataset.chatbotId = chatbotId;
                                            script.dataset.apiEndpoint = apiEndpoint;
                                            document.body.appendChild(script);
                                        })();`
                                        e.dataTransfer.setData('text/plain', code);
                                        e.dataTransfer.setData('application/x-bookmark', code);
                                    }}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        alert(locale === 'tr'
                                            ? 'Bu butonu tarayıcınızın yer imleri çubuğuna SÜRÜKLEYİN. Sonra ilan sayfasındayken tıklayın.'
                                            : 'DRAG this button to your bookmarks bar. Then click it when you are on a listing page.');
                                    }}
                                >
                                    <Link2 className="mr-2 h-4 w-4" />
                                    {locale === 'tr' ? 'İlan Kaydedici (Sürükle)' : 'Listing Saver (Drag Me)'}
                                </Button>
                            </div>
                        </div>

                        {/* How it works note */}
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {lt.howItWorks}
                            </h4>
                            <p className="text-sm text-amber-700">{lt.howItWorksDesc}</p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
