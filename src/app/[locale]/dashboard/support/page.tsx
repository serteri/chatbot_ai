import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    HeadphonesIcon,
    MessageSquare,
    Mail,
    Clock,
    Zap,
    Star,
    FileText,
    ExternalLink,
    CheckCircle,
    Crown,
    Sparkles
} from 'lucide-react'
import Link from 'next/link'
import { WhatsAppChatWidget } from '@/components/support/WhatsAppChatWidget'

export default async function SupportPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'support' })
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
    })

    const planType = user?.subscription?.planType || 'free'

    // Redirect free users to pricing page
    if (planType === 'free') {
        redirect(`/${locale}/dashboard/pricing`)
    }

    // Determine support level based on plan
    const supportLevel = planType === 'enterprise' ? '24/7' :
                         planType === 'business' || planType === 'pro' ? 'priority' : 'basic'

    const hasPrioritySupport = supportLevel === 'priority' || supportLevel === '24/7'
    const isEnterprise = supportLevel === '24/7'

    // Support options based on plan
    const supportOptions = {
        basic: {
            responseTime: '48-72h',
            channels: ['email'],
            features: ['email']
        },
        priority: {
            responseTime: '24h',
            channels: ['email', 'chat'],
            features: ['email', 'chat', 'phone']
        },
        '24/7': {
            responseTime: '1h',
            channels: ['email', 'chat', 'phone'],
            features: ['email', 'chat', 'phone', 'dedicated']
        }
    }

    const currentSupport = supportOptions[supportLevel]

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <HeadphonesIcon className="h-8 w-8 text-blue-600" />
                            {t('title')}
                        </h1>
                        <p className="text-gray-600 mt-2">{t('subtitle')}</p>
                    </div>
                    <Badge
                        className={`px-4 py-2 text-sm ${
                            supportLevel === '24/7'
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0'
                                : supportLevel === 'priority'
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0'
                                    : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                        {supportLevel === '24/7' && <Crown className="h-4 w-4 mr-2" />}
                        {supportLevel === 'priority' && <Sparkles className="h-4 w-4 mr-2" />}
                        {supportLevel === '24/7' ? t('support247') :
                         supportLevel === 'priority' ? t('prioritySupport') : t('basicSupport')}
                    </Badge>
                </div>
            </div>

            {/* Enterprise 24/7 WhatsApp Support Section */}
            {isEnterprise && (
                <div className="mb-8">
                    <WhatsAppChatWidget
                        locale={locale}
                        userName={user?.name || session.user.name || 'User'}
                        userEmail={user?.email || session.user.email || ''}
                    />
                </div>
            )}

            {/* Support Level Info */}
            <Card className={`mb-8 ${
                supportLevel === '24/7'
                    ? 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200'
                    : supportLevel === 'priority'
                        ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200'
                        : 'bg-gray-50 border-gray-200'
            }`}>
                <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                supportLevel === '24/7' ? 'bg-amber-500' :
                                supportLevel === 'priority' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}>
                                <Clock className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('responseTime')}</p>
                                <p className="text-xl font-bold text-gray-900">{currentSupport.responseTime}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                supportLevel === '24/7' ? 'bg-amber-500' :
                                supportLevel === 'priority' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}>
                                <MessageSquare className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('channels')}</p>
                                <p className="text-xl font-bold text-gray-900">{currentSupport.channels.length} {t('active')}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                                supportLevel === '24/7' ? 'bg-amber-500' :
                                supportLevel === 'priority' ? 'bg-blue-500' : 'bg-gray-400'
                            }`}>
                                <Zap className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">{t('priority')}</p>
                                <p className="text-xl font-bold text-gray-900">
                                    {supportLevel === '24/7' ? t('highest') :
                                     supportLevel === 'priority' ? t('high') : t('standard')}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Contact Options */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Email Support - Available for all */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{t('emailSupport')}</CardTitle>
                                <CardDescription>{t('emailSupportDesc')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <a href="mailto:support@pylonchat.com?subject=Priority Support Request">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700">
                                <Mail className="h-4 w-4 mr-2" />
                                {t('sendEmail')}
                            </Button>
                        </a>
                        <p className="text-sm text-gray-500 mt-3 text-center">support@pylonchat.com</p>
                    </CardContent>
                </Card>

                {/* Live Chat - Priority & Enterprise - Opens WhatsApp */}
                <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <CardTitle className="text-lg">{t('liveChat')}</CardTitle>
                                <CardDescription>{t('liveChatDesc')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <a
                            href={`https://wa.me/61432672696?text=${encodeURIComponent(`Hello! I need support.\n\nName: ${user?.name || session.user.name || 'User'}\nEmail: ${user?.email || session.user.email || ''}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button className="w-full bg-green-600 hover:bg-green-700">
                                <MessageSquare className="h-4 w-4 mr-2" />
                                {t('startChat')}
                            </Button>
                        </a>
                        <p className="text-sm text-green-600 mt-3 text-center flex items-center justify-center gap-1">
                            <CheckCircle className="h-4 w-4" />
                            {t('available')}
                        </p>
                    </CardContent>
                </Card>

                {/* Phone Support - Enterprise Only */}
                <Card className={`transition-shadow ${supportLevel === '24/7' ? 'hover:shadow-lg' : 'opacity-60'}`}>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                supportLevel === '24/7' ? 'bg-purple-100' : 'bg-gray-100'
                            }`}>
                                <HeadphonesIcon className={`h-5 w-5 ${supportLevel === '24/7' ? 'text-purple-600' : 'text-gray-400'}`} />
                            </div>
                            <div>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    {t('phoneSupport')}
                                    {supportLevel !== '24/7' && (
                                        <Badge variant="outline" className="text-xs">Enterprise</Badge>
                                    )}
                                </CardTitle>
                                <CardDescription>{t('phoneSupportDesc')}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {supportLevel === '24/7' ? (
                            <a href="tel:+61432672696">
                                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                                    <HeadphonesIcon className="h-4 w-4 mr-2" />
                                    {t('callNow')}
                                </Button>
                            </a>
                        ) : (
                            <Link href={`/${locale}/dashboard/pricing`}>
                                <Button variant="outline" className="w-full">
                                    <Crown className="h-4 w-4 mr-2" />
                                    {t('upgradeEnterprise')}
                                </Button>
                            </Link>
                        )}
                        {supportLevel === '24/7' && (
                            <p className="text-sm text-purple-600 mt-3 text-center">+61 432 672 696</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Resources */}
            <h2 className="text-xl font-bold text-gray-900 mb-4">{t('helpResources')}</h2>
            <div className="grid md:grid-cols-2 gap-6">
                <Link href={`/${locale}/about`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                                        <FileText className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('documentation')}</h3>
                                        <p className="text-sm text-gray-500">{t('documentationDesc')}</p>
                                    </div>
                                </div>
                                <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                <Link href={`/${locale}/contact`}>
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-600 transition-colors">
                                        <Mail className="h-6 w-6 text-green-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900">{t('contactForm')}</h3>
                                        <p className="text-sm text-gray-500">{t('contactFormDesc')}</p>
                                    </div>
                                </div>
                                <ExternalLink className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                            </div>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Upgrade to Enterprise CTA for Pro/Business users */}
            {!isEnterprise && (
                <Card className="mt-8 bg-gradient-to-br from-amber-500 to-orange-600 text-white border-0">
                    <CardContent className="p-8 text-center">
                        <Crown className="h-12 w-12 mx-auto mb-4 text-amber-200" />
                        <h3 className="text-2xl font-bold mb-2">{t('upgrade247Title')}</h3>
                        <p className="text-amber-100 mb-6 max-w-lg mx-auto">{t('upgrade247Desc')}</p>
                        <Link href={`/${locale}/dashboard/pricing`}>
                            <Button size="lg" className="bg-white text-amber-600 hover:bg-amber-50">
                                <Crown className="h-5 w-5 mr-2" />
                                {t('upgradeEnterprise')}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
