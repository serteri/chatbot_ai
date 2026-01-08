import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Clock, Briefcase, Globe, Users, ArrowRight } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function CareersPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'careers' })

    const positions = [
        {
            id: 1,
            title: t('positions.pos1.title'),
            department: t('positions.pos1.dept'),
            location: "San Francisco, CA / Remote",
            type: t('positions.pos1.type'),
            posted: "2 days ago"
        },
        {
            id: 2,
            title: t('positions.pos2.title'),
            department: t('positions.pos2.dept'),
            location: "London, UK / Remote",
            type: t('positions.pos2.type'),
            posted: "1 week ago"
        },
        {
            id: 3,
            title: t('positions.pos3.title'),
            department: t('positions.pos3.dept'),
            location: "New York, NY / Remote",
            type: t('positions.pos3.type'),
            posted: "2 weeks ago"
        },
        {
            id: 4,
            title: t('positions.pos4.title'),
            department: t('positions.pos4.dept'),
            location: "Remote (Global)",
            type: t('positions.pos4.type'),
            posted: "3 weeks ago"
        }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1">
                {/* Hero Section */}
                <div className="bg-blue-600 text-white py-20 lg:py-32 relative overflow-hidden">
                    <div className="absolute inset-0 bg-blue-600/50 backdrop-blur-sm z-0"></div>
                    <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl mx-auto">
                        <Badge className="mb-6 bg-blue-500/50 hover:bg-blue-500/60 border-blue-400 text-blue-100 px-4 py-1 text-sm uppercase tracking-wide">
                            {t('title')}
                        </Badge>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                            {t('title')}
                        </h1>
                        <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mx-auto mb-10 leading-relaxed">
                            {t('subtitle')}
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <div className="flex items-center space-x-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md">
                                <Globe className="h-5 w-5 text-blue-200" />
                                <span className="font-medium">{t('remoteFriendly')}</span>
                            </div>
                            <div className="flex items-center space-x-2 bg-white/10 px-6 py-3 rounded-full backdrop-blur-md">
                                <Users className="h-5 w-5 text-blue-200" />
                                <span className="font-medium">4.9/5 {t('glassdoorRating')}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Open Positions */}
                <div className="container mx-auto px-4 py-20 -mt-10 relative z-20">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-900">{t('openPositions')}</h2>
                    </div>

                    <div className="max-w-5xl mx-auto space-y-4">
                        {positions.map((position) => (
                            <Card key={position.id} className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-transparent hover:border-l-blue-600 group cursor-pointer">
                                <CardContent className="p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="space-y-3">
                                        <div className="flex items-start justify-between md:justify-start gap-4">
                                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                {position.title}
                                            </h3>
                                            <Badge variant="secondary" className="md:hidden">
                                                {position.type}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-gray-500 text-sm md:text-base">
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-2 text-blue-500" />
                                                {position.department}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                                                {position.location}
                                            </div>
                                            <div className="flex items-center">
                                                <Briefcase className="h-4 w-4 mr-2 text-blue-500" />
                                                {position.type}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between md:justify-end gap-4 mt-2 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">
                                        <div className="flex items-center text-gray-400 text-sm">
                                            <Clock className="h-4 w-4 mr-1.5" />
                                            {position.posted}
                                        </div>
                                        <Button className="group-hover:translate-x-1 transition-transform bg-blue-600 hover:bg-blue-700">
                                            {t('applyNow')} <ArrowRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* No Role CTA */}
                    <div className="mt-16 text-center bg-gray-100 rounded-2xl p-10 max-w-3xl mx-auto">
                        <h3 className="text-2xl font-bold text-gray-900 mb-3">{t('noRole')}</h3>
                        <p className="text-gray-600 mb-6">{t('sendResume')}</p>
                        <Button variant="outline" size="lg" className="bg-white hover:bg-gray-50">
                            careers@pylonchat.com
                        </Button>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
