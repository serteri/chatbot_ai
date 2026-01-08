import { Button } from "@/components/ui/button"
import { ArrowLeft, Construction } from "lucide-react"
import Link from "next/link"
import { PublicNav } from "@/components/layout/PublicNav"
import { Footer } from "@/components/Footer"
import { getTranslations } from 'next-intl/server'

interface PlaceholderPageProps {
    titleKey: string
    descriptionKey?: string
    locale: string
    namespace?: string
}

export default async function PlaceholderPage({
    titleKey,
    descriptionKey = "common.underConstruction",
    locale,
    namespace = "common"
}: PlaceholderPageProps) {
    // We'll use a simple fallback title if translation fails or for now just pass the key as title
    // In a real scenario we would use getTranslations

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <PublicNav />

            <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
                <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Construction className="w-8 h-8 text-blue-600" />
                    </div>

                    <h1 className="text-2xl font-bold text-gray-900 mb-2 capitalize">
                        {titleKey.replace(/-/g, ' ')}
                    </h1>

                    <p className="text-gray-500 mb-8">
                        {descriptionKey}
                    </p>

                    <Link href={`/${locale}`}>
                        <Button className="w-full">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Home
                        </Button>
                    </Link>
                </div>
            </main>

            <Footer locale={locale} />
        </div>
    )
}
