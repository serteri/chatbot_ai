import { auth } from '@/lib/auth/auth'
import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { prisma } from '@/lib/db/prisma'
import { PricingCards } from '@/components/billing/PricingCards'

export default async function PricingPage({
    params,
}: {
    params: Promise<{ locale: string }>
}) {
    const { locale } = await params
    const t = await getTranslations({ locale })
    const session = await auth()

    if (!session?.user?.id) {
        redirect('/login')
    }

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { subscription: true }
    })

    const currentPlan = user?.subscription?.planType || 'free'
    const hasStripeSubscription = !!user?.stripeCustomerId

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">{t('pricing.title')}</h1>
                <p className="text-xl text-gray-600">
                    {t('pricing.subtitle')}
                </p>
            </div>

            <PricingCards currentPlan={currentPlan} hasStripeSubscription={hasStripeSubscription} />

            {/* Plan Karşılaştırma */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-center mb-8">{t('pricing.comparison')}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="border-b">
                                <th className="text-left p-4">{t('pricing.feature')}</th>
                                <th className="text-center p-4">Starter</th>
                                <th className="text-center p-4">Professional</th>
                                <th className="text-center p-4">Business</th>
                                <th className="text-center p-4">Enterprise</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b">
                                <td className="p-4">NDIS Claims / Month</td>
                                <td className="text-center p-4">5</td>
                                <td className="text-center p-4">Unlimited</td>
                                <td className="text-center p-4">Unlimited</td>
                                <td className="text-center p-4">Unlimited</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-4">PRODA Bulk Export</td>
                                <td className="text-center p-4">❌</td>
                                <td className="text-center p-4">✅</td>
                                <td className="text-center p-4">✅</td>
                                <td className="text-center p-4">✅</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-4">NDIS Price Guide Sync</td>
                                <td className="text-center p-4">Basic</td>
                                <td className="text-center p-4">Full</td>
                                <td className="text-center p-4">Full</td>
                                <td className="text-center p-4">Custom</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-4">Audit Evidence Vault</td>
                                <td className="text-center p-4">100MB</td>
                                <td className="text-center p-4">1GB</td>
                                <td className="text-center p-4">5GB</td>
                                <td className="text-center p-4">Unlimited</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-4">Compliance Validator</td>
                                <td className="text-center p-4">✅</td>
                                <td className="text-center p-4">✅</td>
                                <td className="text-center p-4">✅</td>
                                <td className="text-center p-4">✅</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-4">Multiple PRODA Accounts</td>
                                <td className="text-center p-4">❌</td>
                                <td className="text-center p-4">❌</td>
                                <td className="text-center p-4">✅</td>
                                <td className="text-center p-4">✅</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-4">API Access / CRM Sync</td>
                                <td className="text-center p-4">❌</td>
                                <td className="text-center p-4">❌</td>
                                <td className="text-center p-4">✅</td>
                                <td className="text-center p-4">✅</td>
                            </tr>
                            <tr className="border-b">
                                <td className="p-4">Priority Support</td>
                                <td className="text-center p-4">Email</td>
                                <td className="text-center p-4">Priority</td>
                                <td className="text-center p-4">24/7 Dedicated</td>
                                <td className="text-center p-4">White-Glove</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* FAQ */}
            <div className="mt-16 max-w-3xl mx-auto">
                <h2 className="text-2xl font-bold text-center mb-8">{t('pricing.faq.title')}</h2>
                <div className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">{t('pricing.faq.q1')}</h3>
                        <p className="text-gray-600">
                            {t('pricing.faq.a1')}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">{t('pricing.faq.q2')}</h3>
                        <p className="text-gray-600">
                            {t('pricing.faq.a2')}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">{t('pricing.faq.q3')}</h3>
                        <p className="text-gray-600">
                            {t('pricing.faq.a3')}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-semibold mb-2">{t('pricing.faq.q4')}</h3>
                        <p className="text-gray-600">
                            {t('pricing.faq.a4')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}