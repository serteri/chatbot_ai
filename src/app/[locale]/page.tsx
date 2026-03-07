import { PublicNav } from '@/components/layout/PublicNav'
import { Footer } from '@/components/Footer'
import { HeroEnterprise } from '@/components/landing/HeroEnterprise'
import { TrustBar } from '@/components/landing/TrustBar'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { PricingPreview } from '@/components/landing/PricingPreview'

interface HomePageProps {
    params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: HomePageProps) {
    const { locale } = await params

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            <PublicNav />

            <main className="flex-1">
                <HeroEnterprise locale={locale} />
                <TrustBar />
                <HowItWorks />
                <PricingPreview locale={locale} />
            </main>

            <Footer locale={locale} />
        </div>
    )
}