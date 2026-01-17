'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Home,
    FileSpreadsheet,
    Plus,
    ArrowRight,
    Building2
} from 'lucide-react'
import Link from 'next/link'

const localTranslations = {
    tr: {
        cardDescription: 'Ilanlarinizi ekleyin, chatbot musteri tercihlerine gore otomatik eslestirme yapsin',
        createChatbotFirst: 'Once bir emlak chatbotu olusturun',
        manageProperties: 'Ilanlari Yonet',
        managePropertiesDesc: 'Ilan ekle, duzenle, sil',
        goToProperties: 'Ilan Sayfasina Git',
        xmlImport: 'XML Iceri Aktar',
        xmlImportDesc: 'Toplu ilan yukle'
    },
    en: {
        cardDescription: 'Add your listings, chatbot will automatically match based on customer preferences',
        createChatbotFirst: 'Create a real estate chatbot first',
        manageProperties: 'Manage Properties',
        managePropertiesDesc: 'Add, edit, delete properties',
        goToProperties: 'Go to Properties',
        xmlImport: 'XML Import',
        xmlImportDesc: 'Bulk upload listings'
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
    const lt = localTranslations[locale as keyof typeof localTranslations] || localTranslations.en
    const hasNoChatbots = chatbots.length === 0

    return (
        <Card className="mb-8 border-t-4 border-t-blue-500">
            <CardHeader>
                <div className="flex items-center space-x-2">
                    <Home className="h-5 w-5 text-blue-600" />
                    <CardTitle>{rt.importOptions.title}</CardTitle>
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
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Go to Properties Page - Primary Action */}
                        <Link href={`/${locale}/dashboard/realestate/properties`} className="flex-1">
                            <div className="h-full p-6 border-2 border-blue-200 rounded-xl bg-gradient-to-br from-blue-50 to-white hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Building2 className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg flex items-center gap-2">
                                            {lt.manageProperties}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {lt.managePropertiesDesc}
                                        </p>
                                    </div>
                                </div>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 group-hover:translate-x-1 transition-transform">
                                    <Plus className="mr-2 h-4 w-4" />
                                    {lt.goToProperties}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </Link>

                        {/* XML Import - Secondary */}
                        <Link href={`/${locale}/dashboard/realestate/properties`} className="flex-1">
                            <div className="h-full p-6 border rounded-xl hover:border-green-300 hover:bg-green-50/50 transition-all cursor-pointer group">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileSpreadsheet className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-lg">
                                            {lt.xmlImport}
                                        </h4>
                                        <p className="text-sm text-muted-foreground">
                                            {lt.xmlImportDesc}
                                        </p>
                                    </div>
                                </div>
                                <Button variant="outline" className="w-full group-hover:border-green-400 group-hover:text-green-700">
                                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                                    {rt.importProperties}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </div>
                        </Link>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
