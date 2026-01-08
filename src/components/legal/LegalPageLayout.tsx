import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { getTranslations } from 'next-intl/server'

interface LegalPageLayoutProps {
    locale: string
    titleKey: string
    updatedAt?: string
    children: React.ReactNode
}

export default async function LegalPageLayout({
    locale,
    titleKey,
    updatedAt = "January 1, 2024",
    children
}: LegalPageLayoutProps) {
    // In a real app we'd fetch translations for the title
    // const t = await getTranslations({ locale, namespace: 'legal' })

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />

            <main className="flex-1 py-12 md:py-20">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gray-900 text-white px-8 py-12 text-center">
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">
                                {titleKey}
                            </h1>
                            <p className="text-gray-400">
                                Last updated: {updatedAt}
                            </p>
                        </div>

                        <div className="p-8 md:p-12 prose prose-lg max-w-none prose-blue">
                            {children}
                        </div>
                    </div>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
