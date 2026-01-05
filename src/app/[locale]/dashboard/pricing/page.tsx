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

    return (
        <div className="container mx-auto px-4 py-16">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold mb-4">{t('pricing.title')}</h1>
                <p className="text-xl text-gray-600">
                    {t('pricing.subtitle')}
                </p>
            </div>

            <PricingCards currentPlan={currentPlan} />

            {/* Plan Karşılaştırma */}
            <div className="mt-16">
                <h2 className="text-2xl font-bold text-center mb-8">{t('pricing.comparison')}</h2>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="border-b">
                            <th className="text-left p-4">{t('pricing.feature')}</th>
                            <th className="text-center p-4">{t('pricing.plans.free.name')}</th>
                            <th className="text-center p-4">{t('pricing.plans.pro.name')}</th>
                            <th className="text-center p-4">{t('pricing.plans.enterprise.name')}</th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr className="border-b">
                            <td className="p-4">{t('pricing.chatbotCount')}</td>
                            <td className="text-center p-4">1</td>
                            <td className="text-center p-4">5</td>
                            <td className="text-center p-4">{t('pricing.unlimited')}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">{t('pricing.documentCount')}</td>
                            <td className="text-center p-4">3</td>
                            <td className="text-center p-4">50</td>
                            <td className="text-center p-4">{t('pricing.unlimited')}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">{t('pricing.monthlyConversations')}</td>
                            <td className="text-center p-4">50</td>
                            <td className="text-center p-4">1,000</td>
                            <td className="text-center p-4">{t('pricing.unlimited')}</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">{t('pricing.analytics')}</td>
                            <td className="text-center p-4">❌</td>
                            <td className="text-center p-4">✅</td>
                            <td className="text-center p-4">✅</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">{t('pricing.customBranding')}</td>
                            <td className="text-center p-4">❌</td>
                            <td className="text-center p-4">✅</td>
                            <td className="text-center p-4">✅</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">{t('pricing.apiAccess')}</td>
                            <td className="text-center p-4">❌</td>
                            <td className="text-center p-4">❌</td>
                            <td className="text-center p-4">✅</td>
                        </tr>
                        <tr className="border-b">
                            <td className="p-4">{t('pricing.support')}</td>
                            <td className="text-center p-4">{t('pricing.emailSupport')}</td>
                            <td className="text-center p-4">{t('pricing.prioritySupport')}</td>
                            <td className="text-center p-4">{t('pricing.support247')}</td>
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