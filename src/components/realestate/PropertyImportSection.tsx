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
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                    onClick={() => {
                                        const bookmarkletCode = `javascript:(function(){var d=document;var msg=function(t,c){var e=d.createElement('div');e.style.cssText='position:fixed;top:20px;right:20px;z-index:999999;padding:12px 20px;background:'+c+';color:white;border-radius:8px;font-family:sans-serif;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);font-weight:600;font-size:14px';e.textContent=t;d.body.appendChild(e);setTimeout(function(){e.remove()},4000)};msg('🏠 Saving property...','%233b82f6');var get=function(s){var e=d.querySelector(s);return e?e.innerText.trim():''};var getClean=function(s){var t=get(s);return t.replace(/[^0-9.]/g,'')};var num=function(s){var m=get(s).match(/(\\d+)/);return m?parseInt(m[0]):0};var u=window.location.href;var data={sourceUrl:u,listingType:u.includes('rent')?'rent':'sale',images:[]};try{if(u.includes('realestate.com.au')){data.title=get('h1')||get('.property-address');data.price=parseFloat(getClean('[data-testid="listing-details__summary-price"]')||getClean('.property-price'))||0;data.description=get('[data-testid="listing-details__description"]')||get('.property-description');data.address=get('[data-testid="listing-details__button-copy-address"]')||data.title;data.bedrooms=num('[data-testid*="features"] [aria-label*="Bed"]')||num('.bedrooms')||0;data.bathrooms=num('[data-testid*="features"] [aria-label*="Bath"]')||num('.bathrooms')||0;d.querySelectorAll('img').forEach(function(i){if(i.src&&i.src.includes('bucket-api')&&!i.src.includes('agent')&&data.images.length<5)data.images.push(i.src)});var parts=u.split('-');var stIdx=parts.findIndex(function(p){return['qld','nsw','vic','wa','sa','tas','act','nt'].includes(p)});if(stIdx!==-1){data.city=parts[stIdx].toUpperCase();data.suburb=parts[stIdx+1]||'';if(data.suburb)data.suburb=data.suburb.charAt(0).toUpperCase()+data.suburb.slice(1)}data.propertyType=u.includes('apartment')||u.includes('unit')?'apartment':'house'}else if(u.includes('domain.com.au')){data.title=get('h1');data.price=parseFloat(getClean('[data-testid="listing-details__summary-price"]'))||0;data.address=get('h1');data.description=get('[data-testid="listing-details__description"]');data.bedrooms=num('[data-testid*="features-beds"]');data.bathrooms=num('[data-testid*="features-baths"]');data.propertyType='house';data.city='VIC';d.querySelectorAll('[data-testid*="gallery"] img').forEach(function(i){if(i.src&&data.images.length<5)data.images.push(i.src)})}else{throw new Error('Site not supported')}fetch('${typeof window !== 'undefined' ? window.location.origin : 'https://www.pylonchat.com'}/api/properties/create-from-bookmarklet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chatbotId:'${selectedChatbotId}',...data})}).then(function(r){return r.json()}).then(function(r){if(r.success)msg('✅ Property saved!','%2310b981');else msg('❌ Error: '+(r.error||'Unknown'),'%23ef4444')}).catch(function(e){msg('❌ Network Error','%23ef4444');console.error(e)})}catch(e){msg('❌ '+e.message,'%23ef4444');console.error(e)}})();void(0)`;

                                        navigator.clipboard.writeText(bookmarkletCode).then(() => {
                                            alert(locale === 'tr'
                                                ? '✅ Kod panoya kopyalandı!\n\nKullanım:\n1. Yeni bir yer imi oluşturun\n2. İsim: "İlan Kaydet"\n3. URL kısmına yapıştırın\n4. realestate.com.au\'da ilan sayfasındayken tıklayın'
                                                : '✅ Code copied to clipboard!\n\nHow to use:\n1. Create a new bookmark\n2. Name: "Save Property"\n3. Paste code in URL field\n4. Click it when on a property page on realestate.com.au');
                                        }).catch(() => {
                                            // Fallback: show in prompt
                                            prompt(
                                                locale === 'tr'
                                                    ? 'Kodu kopyalayın ve yeni bir yer iminin URL kısmına yapıştırın:'
                                                    : 'Copy this code and paste it as URL for a new bookmark:',
                                                bookmarkletCode
                                            );
                                        });
                                    }}
                                >
                                    <Link2 className="mr-2 h-4 w-4" />
                                    {locale === 'tr' ? 'Kodu Kopyala (Yer İmi İçin)' : 'Copy Code (For Bookmark)'}
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
