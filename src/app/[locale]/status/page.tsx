import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react'

interface PageProps {
    params: Promise<{ locale: string }>
}

export default async function StatusPage({ params }: PageProps) {
    const { locale } = await params
    const t = await getTranslations({ locale, namespace: 'status' })

    const systems = [
        { name: t('systems.api'), status: "operational" },
        { name: t('systems.dashboard'), status: "operational" },
        { name: t('systems.widget'), status: "operational" },
        { name: t('systems.webhooks'), status: "operational" },
        { name: t('systems.database'), status: "operational" },
        { name: t('systems.integrations'), status: "operational" }
    ]

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />
            <main className="flex-1 py-16">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-8">
                        <div className="bg-green-500 px-8 py-6 flex items-center justify-between text-white">
                            <div className="flex items-center space-x-3">
                                <CheckCircle className="h-8 w-8" />
                                <h1 className="text-2xl font-bold">{t('allSystemsOperational')}</h1>
                            </div>
                            <span className="text-green-100 text-sm font-medium">{new Date().toLocaleDateString(locale)}</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100">
                            <h2 className="text-lg font-semibold text-gray-900">{t('currentStatus')}</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {systems.map((system, index) => (
                                <div key={index} className="px-8 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <span className="font-medium text-gray-700">{system.name}</span>
                                    <div className="flex items-center space-x-2">
                                        <div className="h-2.5 w-2.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-green-600 font-medium text-sm">{t(system.status)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </main>
            <Footer locale={locale} />
        </div>
    )
}
