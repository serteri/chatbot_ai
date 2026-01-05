'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
    GraduationCap,
    ShoppingCart,
    ArrowRight,
    Sparkles,
    Users,
    Globe,
    BookOpen,
    Package,
    CreditCard,
    MessageSquare,
    CheckCircle
} from 'lucide-react'

export default function ChatbotSelectionPage() {
    const params = useParams()
    const locale = (params?.locale as string) || 'tr'

    const [selectedType, setSelectedType] = useState<'education' | 'ecommerce' | null>(null)

    const chatbotTypes = [
        {
            id: 'education',
            title: 'Eğitim Chatbot',
            description: 'Yurtdışı eğitim, vize işlemleri ve dil okulu danışmanlığı',
            icon: GraduationCap,
            color: 'from-blue-500 to-purple-600',
            href: `/${locale}/dashboard/education`,
            features: [
                { icon: Globe, text: 'Vize danışmanlığı (70+ ülke)' },
                { icon: BookOpen, text: 'Dil okulu veritabanı (150+ okul)' },
                { icon: Sparkles, text: 'Burs fırsatları (500+ aktif)' },
                { icon: Users, text: 'Üniversite başvuru rehberi' }
            ],
            stats: {
                universities: '10,000+ Üniversite',
                countries: '70+ Ülke',
                scholarships: '500+ Burs',
                schools: '150+ Dil Okulu'
            }
        },
        {
            id: 'ecommerce',
            title: 'E-ticaret Chatbot',
            description: 'Online mağaza müşteri hizmetleri ve satış asistanı',
            icon: ShoppingCart,
            color: 'from-green-500 to-emerald-600',
            href: `/${locale}/dashboard/ecommerce`,
            features: [
                { icon: Package, text: 'Ürün önerileri ve katalog' },
                { icon: Users, text: 'Müşteri hizmetleri 7/24' },
                { icon: CreditCard, text: 'Sipariş takibi ve ödeme' },
                { icon: Sparkles, text: 'Akıllı satış asistanı' }
            ],
            stats: {
                orders: 'Sipariş Takibi',
                products: 'Ürün Katalogu',
                support: '7/24 Destek',
                sales: 'Satış Asistanı'
            }
        }
    ]

    return (
        <div className="container mx-auto px-6 py-8">
            {/* Header */}
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Chatbot Türünü Seçin
                </h1>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                    Hangi alanda AI chatbot kullanmak istiyorsunuz? Size uygun chatbot türünü seçin ve hemen başlayın.
                </p>
            </div>

            {/* Chatbot Selection Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {chatbotTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = selectedType === type.id

                    return (
                        <Card
                            key={type.id}
                            className={`relative overflow-hidden transition-all duration-300 cursor-pointer transform hover:scale-105 ${
                                isSelected ? 'ring-2 ring-blue-500 shadow-xl' : 'hover:shadow-lg'
                            }`}
                            onClick={() => setSelectedType(type.id as 'education' | 'ecommerce')}
                        >
                            {/* Background Gradient */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${type.color} opacity-5`} />

                            <CardHeader className="relative pb-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${type.color} flex items-center justify-center`}>
                                        <Icon className="h-7 w-7 text-white" />
                                    </div>
                                    {isSelected && (
                                        <Badge variant="default" className="bg-blue-600">
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Seçildi
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900">
                                    {type.title}
                                </CardTitle>
                                <CardDescription className="text-gray-600 text-base">
                                    {type.description}
                                </CardDescription>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {/* Features */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900 flex items-center">
                                        <Sparkles className="h-4 w-4 mr-2 text-purple-500" />
                                        Özellikler
                                    </h4>
                                    <div className="grid grid-cols-1 gap-2">
                                        {type.features.map((feature, index) => {
                                            const FeatureIcon = feature.icon
                                            return (
                                                <div key={index} className="flex items-center space-x-3 text-sm">
                                                    <FeatureIcon className="h-4 w-4 text-gray-500" />
                                                    <span>{feature.text}</span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="space-y-3">
                                    <h4 className="font-semibold text-gray-900 flex items-center">
                                        <MessageSquare className="h-4 w-4 mr-2 text-blue-500" />
                                        Kapsamı
                                    </h4>
                                    <div className="grid grid-cols-2 gap-3">
                                        {Object.entries(type.stats).map(([key, value]) => (
                                            <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                                                <div className="text-sm font-medium text-gray-900">{value}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="pt-4">
                                    <Link href={type.href}>
                                        <Button
                                            className={`w-full bg-gradient-to-r ${type.color} hover:opacity-90 transition-all transform hover:scale-105`}
                                            size="lg"
                                        >
                                            {type.title} Başla
                                            <ArrowRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {/* Comparison Table */}
            <div className="mt-16 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
                    Özellik Karşılaştırması
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse bg-white rounded-lg shadow-lg overflow-hidden">
                        <thead>
                        <tr className="bg-gray-50">
                            <th className="px-6 py-4 text-left font-semibold text-gray-900">Özellik</th>
                            <th className="px-6 py-4 text-center font-semibold text-blue-600">
                                <GraduationCap className="h-5 w-5 mx-auto mb-1" />
                                Eğitim
                            </th>
                            <th className="px-6 py-4 text-center font-semibold text-green-600">
                                <ShoppingCart className="h-5 w-5 mx-auto mb-1" />
                                E-ticaret
                            </th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        <tr>
                            <td className="px-6 py-4 font-medium">Temel İşlev</td>
                            <td className="px-6 py-4 text-center">Eğitim danışmanlığı</td>
                            <td className="px-6 py-4 text-center">Müşteri hizmetleri</td>
                        </tr>
                        <tr className="bg-gray-50">
                            <td className="px-6 py-4 font-medium">Veri Kaynağı</td>
                            <td className="px-6 py-4 text-center">Üniversite & Vize DB</td>
                            <td className="px-6 py-4 text-center">Ürün katalogu & Siparişler</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium">Hedef Kitle</td>
                            <td className="px-6 py-4 text-center">Öğrenciler</td>
                            <td className="px-6 py-4 text-center">Online müşteriler</td>
                        </tr>
                        <tr className="bg-gray-50">
                            <td className="px-6 py-4 font-medium">Entegrasyonlar</td>
                            <td className="px-6 py-4 text-center">Vize sistemleri</td>
                            <td className="px-6 py-4 text-center">E-ticaret platformları</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-medium">Dosya Yükleme</td>
                            <td className="px-6 py-4 text-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Help Section */}
            <div className="mt-12 text-center">
                <div className="bg-blue-50 rounded-xl p-8 max-w-2xl mx-auto">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">
                        Hangisini seçeceğinize karar veremiyor musunuz?
                    </h3>
                    <p className="text-blue-700 mb-6">
                        İki chatbot türünü de deneyebilir ve ihtiyacınıza en uygun olanı belirleyebilirsiniz.
                    </p>
                    <div className="space-x-4">
                        <Link href={`/${locale}/demo/education`}>
                            <Button variant="outline" className="border-blue-600 text-blue-600">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Eğitim Demo
                            </Button>
                        </Link>
                        <Link href={`/${locale}/demo/ecommerce`}>
                            <Button variant="outline" className="border-green-600 text-green-600">
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                E-ticaret Demo
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}