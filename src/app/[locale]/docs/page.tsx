import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Book, FileText, Code, Sparkles, MessageCircle, FileDown, ShieldCheck, Activity, Rocket } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Button } from '@/components/ui/button'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function DocsPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'docs' })

    const menuItems = [
        { title: t('sidebar.gettingStarted'), href: `/${locale}/docs`, active: true, icon: Book },
        { title: t('sidebar.coreConcepts'), href: `/${locale}/docs/concepts`, active: false, icon: FileText },
        { title: t('sidebar.apiReference'), href: `/${locale}/docs/api`, active: false, icon: Code }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <PublicNav />
            <div className="flex-1 flex border-t border-gray-200">
                {/* Sidebar */}
                <aside className="w-64 border-r border-gray-200 bg-gray-50 hidden md:block">
                    <div className="p-6 sticky top-0">
                        <h2 className="font-bold text-gray-900 mb-6 px-3">{t('title')}</h2>
                        <nav className="space-y-1">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.title}
                                    href={item.href}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${item.active
                                        ? 'bg-blue-50 text-blue-700'
                                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                        }`}
                                >
                                    <item.icon className={`mr-3 h-4 w-4 ${item.active ? 'text-blue-500' : 'text-gray-400'}`} />
                                    {item.title}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 bg-white">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                        <div className="prose prose-blue max-w-none">
                            <h1>{t('intro.title')}</h1>
                            <p className="lead text-xl text-gray-600">
                                {t('intro.text')}
                            </p>

                            <div className="my-8 p-6 bg-blue-50 rounded-xl border border-blue-100">
                                <h3 className="text-blue-900 mt-0 flex items-center">
                                    <Sparkles className="h-5 w-5 mr-2 text-blue-600" />
                                    {t('intro.howItWorks')}
                                </h3>
                                <p className="text-blue-800 mb-0">
                                    {t('intro.howItWorksText')}
                                </p>
                            </div>

                            <h2>{t('intro.nextSteps')}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 not-prose my-8">
                                <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-blue-100 mb-2">01</div>
                                    <h3 className="font-bold text-gray-900 mb-2">{t('intro.step1')}</h3>
                                </Card>
                                <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-blue-100 mb-2">02</div>
                                    <h3 className="font-bold text-gray-900 mb-2">{t('intro.step2')}</h3>
                                </Card>
                                <Card className="p-6 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                                    <div className="text-3xl font-bold text-blue-100 mb-2">03</div>
                                    <h3 className="font-bold text-gray-900 mb-2">{t('intro.step3')}</h3>
                                </Card>
                            </div>

                            {/* 2026 Roadmap / Future Features Section */}
                            <div className="mt-20 pt-12 border-t border-gray-100">
                                <div className="text-center mb-10">
                                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-medium mb-4">
                                        <Rocket className="w-4 h-4 mr-2" />
                                        NDIS Shield Hub Roadmap
                                    </div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-4">2026 Future Features</h2>
                                    <p className="text-gray-600 max-w-2xl mx-auto">
                                        We are actively developing powerful new modules to further reduce your compliance burden and automate NDIS workflows.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
                                    <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className="absolute top-4 right-4 bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                            Alpha
                                        </div>
                                        <CardHeader>
                                            <div className="w-10 h-10 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-3">
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Auto-Service Agreements</h3>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600">Generate one-click PDF contracts perfectly tailored to participant plans, featuring secure, integrated e-signatures for instant onboarding.</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className="absolute top-4 right-4 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                            Beta
                                        </div>
                                        <CardHeader>
                                            <div className="w-10 h-10 rounded-lg bg-green-100 text-green-600 flex items-center justify-center mb-3">
                                                <FileDown className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">PRODA Bulk Claim Export</h3>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600">Export hundreds of validated invoice lines into a single rigorously-verified .csv file explicitly formatted for instant NDIA portal uploads.</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                            Coming Soon
                                        </div>
                                        <CardHeader>
                                            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-3">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Budget Tracker</h3>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600">Provide participants and support coordinators with real-time visual capacity graphs and automated alerts prior to fund exhaustion.</p>
                                        </CardContent>
                                    </Card>

                                    <Card className="hover:shadow-md transition-shadow relative overflow-hidden">
                                        <div className="absolute top-4 right-4 bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                                            Coming Soon
                                        </div>
                                        <CardHeader>
                                            <div className="w-10 h-10 rounded-lg bg-teal-100 text-teal-600 flex items-center justify-center mb-3">
                                                <ShieldCheck className="w-5 h-5" />
                                            </div>
                                            <h3 className="text-xl font-bold text-gray-900 mb-2">Audit Readiness Score</h3>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-gray-600">An intelligent dashboard metric that flags missing compliance documents or expired staff credentials automatically before an auditor arrives.</p>
                                        </CardContent>
                                    </Card>
                                </div>
                            </div>

                            <div className="mt-16 text-center bg-blue-50 rounded-2xl p-8 border border-blue-100 not-prose">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 text-blue-600 mb-4">
                                    <MessageCircle className="h-6 w-6" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-2">Need more help?</h3>
                                <p className="text-gray-600 mb-6 max-w-lg mx-auto">
                                    Our support team is available to assist you with any questions about NDIS Shield Hub.
                                </p>
                                <Link href={`/${locale}/contact`}>
                                    <Button className="bg-blue-600 hover:bg-blue-700">
                                        Contact Support
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </main>
            </div>
            <Footer locale={locale} />
        </div>
    )
}
