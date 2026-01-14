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
                <CardDescription>
                    {locale === 'tr'
                        ? 'İlanlarınızı yükleyin, chatbot müşteri tercihlerine göre otomatik eşleştirme yapsın'
                        : 'Upload your listings, chatbot will automatically match based on customer preferences'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {hasNoChatbots ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <Home className="h-12 w-12 mx-auto mb-3 text-slate-200" />
                        <p className="text-sm mb-2">
                            {locale === 'tr'
                                ? 'Önce bir emlak chatbotu oluşturun'
                                : 'Create a real estate chatbot first'}
                        </p>
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
                                                {locale === 'tr' ? 'Yakında' : 'Soon'}
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

                            {/* API Integration - Coming Soon */}
                            <div className="p-4 border rounded-lg opacity-60">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                        <Link2 className="h-5 w-5 text-purple-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold flex items-center gap-2">
                                            {rt.importOptions.api}
                                            <Badge variant="secondary" className="text-xs">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {locale === 'tr' ? 'Yakında' : 'Soon'}
                                            </Badge>
                                        </h4>
                                        <p className="text-xs text-muted-foreground">{rt.importOptions.apiDesc}</p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full" disabled>
                                    <Link2 className="mr-2 h-4 w-4" />
                                    {locale === 'tr' ? 'Bağlan' : 'Connect'}
                                </Button>
                            </div>
                        </div>

                        {/* How it works note */}
                        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                            <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4" />
                                {locale === 'tr' ? 'Nasıl Çalışır?' : 'How It Works?'}
                            </h4>
                            <p className="text-sm text-amber-700">
                                {locale === 'tr'
                                    ? 'realestate.com.au veya domain.com.au\'dan ilan URL\'si yapıştırın. Sistem otomatik olarak fotoğrafları, fiyatı, oda sayısını ve adresi çeker. Müşteri "Albion\'da 3 odalı ev istiyorum" dediğinde chatbot otomatik eşleşen ilanları carousel\'de gösterir.'
                                    : 'Paste a listing URL from realestate.com.au or domain.com.au. The system automatically extracts photos, price, bedrooms, and address. When a customer asks "I want a 3-bedroom house in Albion", the chatbot shows matching listings in a carousel.'}
                            </p>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    )
}
