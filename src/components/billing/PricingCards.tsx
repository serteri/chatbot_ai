'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Zap, Star, Shield, AlertCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PlanCardProps {
    currentPlan: string
    hasStripeSubscription?: boolean
}

export function PricingCards({ currentPlan, hasStripeSubscription = false }: PlanCardProps) {
    const t = useTranslations('pricing') // Using the 'pricing' namespace directly
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()

    const PLANS = [
        {
            id: 'free',
            name: t('plans.free.name'),
            price: t('plans.free.price'),
            description: t('plans.free.description'),
            features: [
                t('freeFeat1'),
                t('freeFeat2'),
                t('freeFeat3'),
                t('freeFeat4')
            ],
            priceId: null,
            icon: Zap,
            popular: false,
            color: 'gray'
        },
        {
            id: 'pro',
            name: t('plans.pro.name'),
            price: t('plans.pro.price'),
            description: t('plans.pro.description'),
            features: [
                t('proFeat1'),
                t('proFeat2'),
                t('proFeat3'),
                t('proFeat4'),
                t('proFeat5'),
                t('proFeat6')
            ],
            priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
            icon: Star,
            popular: true,
            color: 'blue'
        },
        {
            id: 'business',
            name: t('plans.business.name'),
            price: t('plans.business.price'),
            description: t('plans.business.description'),
            features: [
                t('bizFeat1'),
                t('bizFeat2'),
                t('bizFeat3'),
                t('bizFeat4'),
                t('bizFeat5'),
                t('bizFeat6'),
                t('bizFeat7')
            ],
            priceId: process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID,
            icon: Shield,
            popular: false,
            color: 'purple'
        },
        {
            id: 'enterprise',
            name: t('plans.enterprise.name'),
            price: t('plans.enterprise.price'),
            description: t('plans.enterprise.description'),
            features: [
                t('entFeat1'),
                t('entFeat2'),
                t('entFeat3'),
                t('entFeat4'),
                t('entFeat5'),
                t('entFeat6'),
                t('entFeat7')
            ],
            priceId: process.env.NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID,
            icon: Shield,
            popular: false,
            color: 'emerald'
        }
    ]

    const handleUpgrade = async (priceId: string | null | undefined, planType: string) => {
        if (!priceId) {
            console.error("Price ID not found")
            return
        }

        setLoading(planType)

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, planType })
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else {
                throw new Error('Checkout URL not found')
            }
        } catch (error) {
            console.error('Upgrade error:', error)
            setError(t('upgradeError'))
        } finally {
            setLoading(null)
        }
    }

    const handleManageSubscription = async () => {
        setLoading('manage')

        try {
            const response = await fetch('/api/stripe/portal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })

            const data = await response.json()

            if (data.url) {
                window.location.href = data.url
            } else if (data.error) {
                setError(data.error)
            }
        } catch (error) {
            console.error('Portal error:', error)
            setError(t('portalError'))
        } finally {
            setLoading(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Error Banner */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <span className="text-red-700">{error}</span>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 items-start">
                {PLANS.map((plan) => {
                    const isCurrent = currentPlan === plan.id
                    const planOrder = ['free', 'pro', 'business', 'enterprise']
                    const currentIndex = planOrder.indexOf(currentPlan)
                    const planIndex = planOrder.indexOf(plan.id)
                    const isDowngrade = planIndex < currentIndex

                    return (
                        <Card key={plan.id} className={`relative flex flex-col h-full transition-all duration-200 ${plan.color === 'blue'
                            ? 'border-2 border-blue-400 shadow-xl ring-2 ring-blue-100'
                            : plan.color === 'purple'
                                ? 'border-2 border-purple-300 hover:border-purple-400'
                                : plan.color === 'emerald'
                                    ? 'border-2 border-emerald-300 hover:border-emerald-400'
                                    : 'border border-slate-200 hover:border-slate-300'
                            }`}>
                            {plan.popular && (
                                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 text-sm font-semibold uppercase tracking-wide">
                                    {t('mostPopular')}
                                </Badge>
                            )}

                            <CardHeader className={`pb-8 border-b rounded-t-xl ${plan.color === 'blue' ? 'bg-blue-50/50'
                                : plan.color === 'purple' ? 'bg-purple-50/50'
                                    : plan.color === 'emerald' ? 'bg-emerald-50/50'
                                        : 'bg-slate-50/50'
                                }`}>
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-2 rounded-lg ${plan.color === 'blue' ? 'bg-blue-100 text-blue-600'
                                        : plan.color === 'purple' ? 'bg-purple-100 text-purple-600'
                                            : plan.color === 'emerald' ? 'bg-emerald-100 text-emerald-600'
                                                : 'bg-white border text-slate-500'
                                        }`}>
                                        <plan.icon className="w-5 h-5" />
                                    </div>
                                    {isCurrent && (
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center gap-1">
                                            <Check className="w-3 h-3" /> {t('currentPlan')}
                                        </Badge>
                                    )}
                                </div>
                                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                                <CardDescription className="mt-2 min-h-[40px]">{plan.description}</CardDescription>

                                <div className="mt-4 flex items-baseline">
                                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                                    {/* Show /month for all paid plans */}
                                    {plan.id !== 'free' && (
                                        <span className="text-gray-500 ml-1 text-sm">{t('perMonth')}</span>
                                    )}
                                </div>
                            </CardHeader>

                            <CardContent className="flex-1 pt-6">
                                <ul className="space-y-3">
                                    {plan.features.map((feature, index) => (
                                        <li key={index} className="flex items-start gap-3 text-sm text-slate-600">
                                            <div className={`mt-0.5 rounded-full p-0.5 flex-shrink-0 ${plan.popular ? 'text-blue-600 bg-blue-100' : 'text-green-600 bg-green-100'}`}>
                                                <Check className="w-3 h-3 stroke-[3]" />
                                            </div>
                                            <span className="leading-tight">{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>

                            <CardFooter className="pt-2 pb-8">
                                {isCurrent ? (
                                    currentPlan !== 'free' && hasStripeSubscription ? (
                                        <Button
                                            variant="outline"
                                            className="w-full border-slate-300 hover:bg-slate-50"
                                            onClick={handleManageSubscription}
                                            disabled={loading === 'manage'}
                                        >
                                            {loading === 'manage' ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : null}
                                            {t('manageSub')}
                                        </Button>
                                    ) : (
                                        <Button variant="outline" className="w-full bg-slate-100 text-slate-500 border-slate-200" disabled>
                                            {t('currentPlan')}
                                        </Button>
                                    )
                                ) : isDowngrade ? (
                                    <div className="w-full text-center py-3 text-sm text-gray-400">
                                        {t('includedInCurrentPlan')}
                                    </div>
                                ) : (
                                    <Button
                                        className={`w-full h-11 font-semibold ${plan.color === 'blue'
                                            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                                            : plan.color === 'purple'
                                                ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md'
                                                : plan.color === 'emerald'
                                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                                                    : ''
                                            }`}
                                        onClick={() => handleUpgrade(plan.priceId, plan.id)}
                                        disabled={loading === plan.id || !plan.priceId}
                                        variant={plan.color === 'gray' ? 'outline' : 'default'}
                                    >
                                        {loading === plan.id ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Zap className="mr-2 h-4 w-4" />
                                        )}
                                        {plan.id === 'free' ? t('startFree') : t('upgrade')}
                                    </Button>
                                )}
                            </CardFooter>
                        </Card>
                    )
                })}
            </div>
        </div >
    )
}