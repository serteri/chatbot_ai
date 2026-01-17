'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {
    Home,
    FileSpreadsheet,
    Upload,
    Link2,
    TrendingUp,
    Clock,
    CheckCircle,
    Copy,
    ExternalLink
} from 'lucide-react'
import { toast } from 'react-hot-toast'

const localTranslations = {
    tr: {
        soon: 'Yakinda',
        connect: 'Baglan',
        howItWorks: 'Nasil Calisiyor?',
        howItWorksDesc: 'realestate.com.au veya domain.com.au\'dan ilan URL\'si yapistiryorsunuz. Sistem otomatik olarak fotograflari, fiyati, oda sayisini ve adresi ceker. Musteri "Albion\'da 3 odali ev istiyorum" dediginde chatbot otomatik eslesen ilanlari carousel\'de gosterir.',
        cardDescription: 'Ilanlarinizi yukleyin, chatbot musteri tercihlerine gore otomatik eslestirme yapsin',
        createChatbotFirst: 'Once bir emlak chatbotu olusturun',
        magicButtonTitle: 'Sihirli Buton Nasil Kullanilir?',
        magicButtonStep1: '1. Asagidaki kodu kopyalayin',
        magicButtonStep2: '2. Tarayicinizda yeni bir yer imi olusturun',
        magicButtonStep3: '3. Yer iminin URL kismina kodu yapisitirin',
        magicButtonStep4: '4. realestate.com.au\'da ilan sayfasindayken yer imine tiklayin',
        copied: 'Kod kopyalandi!',
        copyCode: 'Kodu Kopyala'
    },
    en: {
        soon: 'Soon',
        connect: 'Connect',
        howItWorks: 'How It Works?',
        howItWorksDesc: 'Paste a listing URL from realestate.com.au or domain.com.au. The system automatically extracts photos, price, bedrooms, and address. When a customer asks "I want a 3-bedroom house in Albion", the chatbot shows matching listings in a carousel.',
        cardDescription: 'Upload your listings, chatbot will automatically match based on customer preferences',
        createChatbotFirst: 'Create a real estate chatbot first',
        magicButtonTitle: 'How to Use Magic Button?',
        magicButtonStep1: '1. Copy the code below',
        magicButtonStep2: '2. Create a new bookmark in your browser',
        magicButtonStep3: '3. Paste the code as the bookmark URL',
        magicButtonStep4: '4. Click the bookmark when on a property page on realestate.com.au',
        copied: 'Code copied!',
        copyCode: 'Copy Code'
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
    const [showMagicDialog, setShowMagicDialog] = useState(false)
    const [copied, setCopied] = useState(false)
    const lt = localTranslations[locale as keyof typeof localTranslations] || localTranslations.en

    const hasNoChatbots = chatbots.length === 0

    const bookmarkletCode = `javascript:(function(){var d=document;var msg=function(t,c){var e=d.createElement('div');e.style.cssText='position:fixed;top:20px;right:20px;z-index:999999;padding:12px 20px;background:'+c+';color:white;border-radius:8px;font-family:sans-serif;box-shadow:0 10px 15px -3px rgba(0,0,0,0.1);font-weight:600;font-size:14px';e.textContent=t;d.body.appendChild(e);setTimeout(function(){e.remove()},4000)};msg('🏠 Saving property...','%233b82f6');var get=function(s){var e=d.querySelector(s);return e?e.innerText.trim():''};var getClean=function(s){var t=get(s);return t.replace(/[^0-9.]/g,'')};var num=function(s){var m=get(s).match(/(\\d+)/);return m?parseInt(m[0]):0};var u=window.location.href;var data={sourceUrl:u,listingType:u.includes('rent')?'rent':'sale',images:[]};try{if(u.includes('realestate.com.au')){data.title=get('h1')||get('.property-address');data.price=parseFloat(getClean('[data-testid="listing-details__summary-price"]')||getClean('.property-price'))||0;data.description=get('[data-testid="listing-details__description"]')||get('.property-description');data.address=get('[data-testid="listing-details__button-copy-address"]')||data.title;data.bedrooms=num('[data-testid*="features"] [aria-label*="Bed"]')||num('.bedrooms')||0;data.bathrooms=num('[data-testid*="features"] [aria-label*="Bath"]')||num('.bathrooms')||0;d.querySelectorAll('img').forEach(function(i){if(i.src&&i.src.includes('bucket-api')&&!i.src.includes('agent')&&data.images.length<5)data.images.push(i.src)});var parts=u.split('-');var stIdx=parts.findIndex(function(p){return['qld','nsw','vic','wa','sa','tas','act','nt'].includes(p)});if(stIdx!==-1){data.city=parts[stIdx].toUpperCase();data.suburb=parts[stIdx+1]||'';if(data.suburb)data.suburb=data.suburb.charAt(0).toUpperCase()+data.suburb.slice(1)}data.propertyType=u.includes('apartment')||u.includes('unit')?'apartment':'house'}else if(u.includes('domain.com.au')){data.title=get('h1');data.price=parseFloat(getClean('[data-testid="listing-details__summary-price"]'))||0;data.address=get('h1');data.description=get('[data-testid="listing-details__description"]');data.bedrooms=num('[data-testid*="features-beds"]');data.bathrooms=num('[data-testid*="features-baths"]');data.propertyType='house';data.city='VIC';d.querySelectorAll('[data-testid*="gallery"] img').forEach(function(i){if(i.src&&data.images.length<5)data.images.push(i.src)})}else{throw new Error('Site not supported')}fetch('https://www.pylonchat.com/api/properties/create-from-bookmarklet',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({chatbotId:'${selectedChatbotId}',...data})}).then(function(r){return r.json()}).then(function(r){if(r.success)msg('✅ Property saved!','%2310b981');else msg('❌ Error: '+(r.error||'Unknown'),'%23ef4444')}).catch(function(e){msg('❌ Network Error','%23ef4444');console.error(e)})}catch(e){msg('❌ '+e.message,'%23ef4444');console.error(e)}})();void(0)`

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(bookmarkletCode)
            setCopied(true)
            toast.success(lt.copied)
            setTimeout(() => setCopied(false), 3000)
        } catch {
            // Fallback for older browsers
            const textArea = document.createElement('textarea')
            textArea.value = bookmarkletCode
            document.body.appendChild(textArea)
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            setCopied(true)
            toast.success(lt.copied)
            setTimeout(() => setCopied(false), 3000)
        }
    }

    return (
        <>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Magic Button - Primary */}
                                <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50/50 hover:border-purple-400 transition-colors">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-white" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-2">
                                                {locale === 'tr' ? 'Sihirli Buton' : 'Magic Button'}
                                                <Badge variant="default" className="text-xs bg-purple-600 hover:bg-purple-700">
                                                    {locale === 'tr' ? 'Onerilen' : 'Recommended'}
                                                </Badge>
                                            </h4>
                                            <p className="text-xs text-muted-foreground">
                                                {locale === 'tr'
                                                    ? 'Tarayiciniza ekleyin, ilani tek tikla kaydedin'
                                                    : 'Add to browser, save listing with one click'}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                                        onClick={() => setShowMagicDialog(true)}
                                    >
                                        <Link2 className="mr-2 h-4 w-4" />
                                        {locale === 'tr' ? 'Kurulum Talimatlarini Gor' : 'View Setup Instructions'}
                                    </Button>
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

            {/* Magic Button Instructions Dialog */}
            <Dialog open={showMagicDialog} onOpenChange={setShowMagicDialog}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-purple-600" />
                            {lt.magicButtonTitle}
                        </DialogTitle>
                        <DialogDescription>
                            {locale === 'tr'
                                ? 'Bu yer imi ile realestate.com.au\'dan tek tikla ilan ekleyebilirsiniz.'
                                : 'With this bookmark, you can add properties from realestate.com.au with one click.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        <div className="space-y-3">
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center flex-shrink-0">1</div>
                                <p className="text-sm">{lt.magicButtonStep1}</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center flex-shrink-0">2</div>
                                <p className="text-sm">{lt.magicButtonStep2}</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center flex-shrink-0">3</div>
                                <p className="text-sm">{lt.magicButtonStep3}</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                                <div className="w-6 h-6 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center flex-shrink-0">4</div>
                                <p className="text-sm">{lt.magicButtonStep4}</p>
                            </div>
                        </div>

                        <div className="p-3 bg-gray-100 rounded-lg">
                            <p className="text-xs text-gray-500 mb-2 font-medium">
                                {locale === 'tr' ? 'Yer Imi Kodu:' : 'Bookmark Code:'}
                            </p>
                            <div className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto max-h-20 overflow-y-auto">
                                {bookmarkletCode.substring(0, 100)}...
                            </div>
                        </div>

                        <Button
                            className="w-full bg-purple-600 hover:bg-purple-700"
                            onClick={handleCopyCode}
                        >
                            {copied ? (
                                <>
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {lt.copied}
                                </>
                            ) : (
                                <>
                                    <Copy className="mr-2 h-4 w-4" />
                                    {lt.copyCode}
                                </>
                            )}
                        </Button>

                        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                            <ExternalLink className="h-3 w-3" />
                            <span>
                                {locale === 'tr'
                                    ? 'Desteklenen: realestate.com.au, domain.com.au'
                                    : 'Supported: realestate.com.au, domain.com.au'}
                            </span>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
