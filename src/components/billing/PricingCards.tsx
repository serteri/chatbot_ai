'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Loader2, Zap, Star, Shield, AlertCircle, X } from 'lucide-react'

// ─── AUD pricing constants ────────────────────────────────────────────────────
const PRO_MONTHLY_AUD = 99
const BIZ_MONTHLY_AUD = 299
const YEARLY_DISCOUNT = 0.8 // 20% off

interface PlanCardProps {
    currentPlan: string
    hasStripeSubscription?: boolean
}

export function PricingCards({ currentPlan, hasStripeSubscription = false }: PlanCardProps) {
    const t = useTranslations('pricing')
    const [loading, setLoading] = useState<string | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

    // Displayed price string for a paid plan, AUD-labelled
    const audDisplay = (baseAUD: number) =>
        billingPeriod === 'yearly'
            ? `$${Math.round(baseAUD * YEARLY_DISCOUNT)} AUD`
            : `$${baseAUD} AUD`

    const PLANS = [
        {
            id: 'free',
            name: t('plans.free.name'),
            displayPrice: '$0 AUD',
            description: t('plans.free.description'),
            features: t.raw('plans.free.features') as string[],
            priceId: null,
            icon: Zap,
            popular: false,
            color: 'gray',
            cta: 'Get Started Free',
        },
        {
            id: 'pro',
            name: t('plans.pro.name'),
            displayPrice: audDisplay(PRO_MONTHLY_AUD),
            description: t('plans.pro.description'),
            features: t.raw('plans.pro.features') as string[],
            priceId: billingPeriod === 'monthly'
                ? process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID
                : process.env.NEXT_PUBLIC_STRIPE_PRO_Year_PRICE_ID,
            icon: Star,
            popular: false,
            color: 'blue',
            cta: 'Start Professional',
        },
        {
            id: 'business',
            name: t('plans.business.name'),
            displayPrice: audDisplay(BIZ_MONTHLY_AUD),
            description: t('plans.business.description'),
            features: t.raw('plans.business.features') as string[],
            priceId: billingPeriod === 'monthly'
                ? process.env.NEXT_PUBLIC_STRIPE_BUSINESS_PRICE_ID
                : process.env.NEXT_PUBLIC_STRIPE_BUSINESS_Year_PRICE_ID,
            icon: Shield,
            popular: true,
            color: 'purple',
            badge: 'Best Value for Agencies',
            cta: 'Go Enterprise',
        },
        {
            id: 'enterprise',
            name: t('plans.enterprise.name'),
            displayPrice: 'Custom',
            description: t('plans.enterprise.description'),
            features: t.raw('plans.enterprise.features') as string[],
            priceId: undefined,
            icon: Shield,
            popular: false,
            color: 'emerald',
            cta: t('contact'),
        },
    ]

    const handleUpgrade = async (priceId: string | null | undefined, planType: string) => {
        if (!priceId) {
            console.error('Price ID not found')
            return
        }

        setLoading(planType)

        try {
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId, planType, billingPeriod })
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
            {/* Billing Period Toggle */}
            <div className="flex flex-col items-center gap-2">
                <div className="inline-flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                    <button
                        onClick={() => setBillingPeriod('monthly')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${billingPeriod === 'monthly'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Monthly
                    </button>
                    <button
                        onClick={() => setBillingPeriod('yearly')}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billingPeriod === 'yearly'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Yearly
                        <span className="bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            SAVE 20%
                        </span>
                    </button>
                </div>
                <p className="text-xs text-slate-400">
                    All prices are in Australian Dollars (AUD) and include GST where applicable.
                </p>
            </div>

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
                                <Badge className={`absolute -top-3 left-1/2 -translate-x-1/2 text-white px-4 py-1 text-sm font-semibold uppercase tracking-wide ${plan.id === 'business' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'
                                    }`}>
                                    {plan.badge || t('mostPopular')}
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

                                <div className="mt-4">
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-4xl font-bold text-slate-900">{plan.displayPrice}</span>
                                        {plan.id !== 'free' && plan.id !== 'enterprise' && (
                                            <span className="text-gray-500 text-sm">/ mo</span>
                                        )}
                                    </div>
                                    {billingPeriod === 'yearly' && plan.id !== 'free' && plan.id !== 'enterprise' && (
                                        <p className="text-xs text-green-600 font-medium mt-1">
                                            ✓ Save 20% — billed annually in AUD
                                        </p>
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
                                        {plan.cta || (plan.id === 'free' ? t('startFree') : t('upgrade'))}
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