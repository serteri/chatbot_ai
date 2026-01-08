import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { Book, FileText, Code, Sparkles } from 'lucide-react'
import { getTranslations } from 'next-intl/server'

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
                        </div>
                    </div>
                </main>
            </div>
            <Footer locale={locale} />
        </div>
    )
}
