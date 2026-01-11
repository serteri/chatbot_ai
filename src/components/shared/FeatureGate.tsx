'use client'

import { ReactNode } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Lock, Zap, Crown } from 'lucide-react'
import Link from 'next/link'

type FeatureType =
    | 'analytics'
    | 'advancedAnalytics'
    | 'customBranding'
    | 'teamCollaboration'
    | 'customDomain'
    | 'apiAccess'
    | 'prioritySupport'
    | 'whiteLabel'

interface FeatureGateProps {
    feature: FeatureType
    subscription: {
        planType: string
        hasAnalytics?: boolean
        hasAdvancedAnalytics?: boolean
        hasCustomBranding?: boolean
        hasTeamCollaboration?: boolean
        hasCustomDomain?: boolean
        hasApiAccess?: boolean
        hasPrioritySupport?: boolean
        hasWhiteLabel?: boolean
    }
    children: ReactNode
    locale: string
    fallback?: 'hide' | 'upgrade' | 'blur'
}

const featureToFlag: Record<FeatureType, keyof FeatureGateProps['subscription']> = {
    analytics: 'hasAnalytics',
    advancedAnalytics: 'hasAdvancedAnalytics',
    customBranding: 'hasCustomBranding',
    teamCollaboration: 'hasTeamCollaboration',
    customDomain: 'hasCustomDomain',
    apiAccess: 'hasApiAccess',
    prioritySupport: 'hasPrioritySupport',
    whiteLabel: 'hasWhiteLabel'
}

const featureRequiredPlan: Record<FeatureType, string> = {
    analytics: 'Pro',
    advancedAnalytics: 'Enterprise',
    customBranding: 'Pro',
    teamCollaboration: 'Business',
    customDomain: 'Enterprise',
    apiAccess: 'Enterprise',
    prioritySupport: 'Pro',
    whiteLabel: 'Enterprise'
}

export function FeatureGate({
    feature,
    subscription,
    children,
    locale,
    fallback = 'upgrade'
}: FeatureGateProps) {
    const t = useTranslations('featureGate')

    const flagKey = featureToFlag[feature]
    const hasAccess = subscription[flagKey] === true

    if (hasAccess) {
        return <>{children}</>
    }

    // No access - show fallback
    if (fallback === 'hide') {
        return null
    }

    if (fallback === 'blur') {
        return (
            <div className="relative">
                <div className="blur-sm pointer-events-none select-none">
                    {children}
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                    <UpgradePrompt
                        feature={feature}
                        locale={locale}
                        requiredPlan={featureRequiredPlan[feature]}
                    />
                </div>
            </div>
        )
    }

    // Default: upgrade prompt
    return (
        <UpgradeCard
            feature={feature}
            locale={locale}
            requiredPlan={featureRequiredPlan[feature]}
        />
    )
}

function UpgradePrompt({ feature, locale, requiredPlan }: {
    feature: FeatureType
    locale: string
    requiredPlan: string
}) {
    const t = useTranslations('featureGate')

    return (
        <div className="text-center p-4">
            <Lock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
                {t('requiresPlan', { plan: requiredPlan })}
            </p>
            <Link href={`/${locale}/dashboard/pricing`}>
                <Button size="sm" variant="outline">
                    <Zap className="mr-2 h-4 w-4" />
                    {t('upgrade')}
                </Button>
            </Link>
        </div>
    )
}

function UpgradeCard({ feature, locale, requiredPlan }: {
    feature: FeatureType
    locale: string
    requiredPlan: string
}) {
    const t = useTranslations('featureGate')

    const featureNames: Record<FeatureType, string> = {
        analytics: t('features.analytics'),
        advancedAnalytics: t('features.advancedAnalytics'),
        customBranding: t('features.customBranding'),
        teamCollaboration: t('features.teamCollaboration'),
        customDomain: t('features.customDomain'),
        apiAccess: t('features.apiAccess'),
        prioritySupport: t('features.prioritySupport'),
        whiteLabel: t('features.whiteLabel')
    }

    return (
        <Card className="border-dashed border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
            <CardHeader className="text-center pb-2">
                <div className="mx-auto w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
                    <Crown className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle className="text-lg">
                    {featureNames[feature]}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-sm text-muted-foreground mb-4">
                    {t('upgradeMessage', { plan: requiredPlan })}
                </p>
                <Link href={`/${locale}/dashboard/pricing`}>
                    <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                        <Zap className="mr-2 h-4 w-4" />
                        {t('upgradeToPlan', { plan: requiredPlan })}
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}

// Helper hook to check feature access
export function useFeatureAccess(
    feature: FeatureType,
    subscription: FeatureGateProps['subscription']
): boolean {
    const flagKey = featureToFlag[feature]
    return subscription[flagKey] === true
}
