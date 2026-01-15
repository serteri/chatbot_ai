/**
 * Plan-based valuation limits configuration
 * Each plan has a specific number of AI valuations allowed per month
 */

export interface PlanValuationLimits {
    maxValuations: number  // -1 means unlimited
    warningThreshold: number  // Percentage (0-100) to show warning
    criticalThreshold: number  // Percentage (0-100) to show critical warning
}

export const PLAN_VALUATION_LIMITS: Record<string, PlanValuationLimits> = {
    free: {
        maxValuations: 5,
        warningThreshold: 60,    // Warn at 3/5 (60%)
        criticalThreshold: 80    // Critical at 4/5 (80%)
    },
    pro: {
        maxValuations: 50,
        warningThreshold: 70,    // Warn at 35/50 (70%)
        criticalThreshold: 90    // Critical at 45/50 (90%)
    },
    business: {
        maxValuations: 200,
        warningThreshold: 80,    // Warn at 160/200 (80%)
        criticalThreshold: 95    // Critical at 190/200 (95%)
    },
    enterprise: {
        maxValuations: -1,       // Unlimited
        warningThreshold: 100,   // Never warn
        criticalThreshold: 100   // Never critical
    }
}

export type WarningLevel = 'none' | 'warning' | 'critical' | 'blocked'

export interface ValuationUsageStatus {
    used: number
    limit: number
    remaining: number
    percentage: number
    warningLevel: WarningLevel
    planType: string
    isUnlimited: boolean
    message?: string
    messageKey?: string  // For i18n
}

/**
 * Calculate valuation usage status for a user
 */
export function getValuationUsageStatus(
    valuationsUsed: number,
    maxValuations: number,
    planType: string = 'free'
): ValuationUsageStatus {
    const limits = PLAN_VALUATION_LIMITS[planType] || PLAN_VALUATION_LIMITS.free
    const isUnlimited = maxValuations === -1

    if (isUnlimited) {
        return {
            used: valuationsUsed,
            limit: -1,
            remaining: -1,
            percentage: 0,
            warningLevel: 'none',
            planType,
            isUnlimited: true
        }
    }

    const remaining = Math.max(0, maxValuations - valuationsUsed)
    const percentage = maxValuations > 0 ? Math.round((valuationsUsed / maxValuations) * 100) : 0

    let warningLevel: WarningLevel = 'none'
    let message: string | undefined
    let messageKey: string | undefined

    if (valuationsUsed >= maxValuations) {
        warningLevel = 'blocked'
        messageKey = 'valuation.limit.blocked'
        message = `You've reached your monthly limit of ${maxValuations} valuations. Upgrade your plan for more.`
    } else if (percentage >= limits.criticalThreshold) {
        warningLevel = 'critical'
        messageKey = 'valuation.limit.critical'
        message = `Critical: Only ${remaining} valuation${remaining !== 1 ? 's' : ''} remaining this month!`
    } else if (percentage >= limits.warningThreshold) {
        warningLevel = 'warning'
        messageKey = 'valuation.limit.warning'
        message = `${remaining} valuation${remaining !== 1 ? 's' : ''} remaining this month.`
    }

    return {
        used: valuationsUsed,
        limit: maxValuations,
        remaining,
        percentage,
        warningLevel,
        planType,
        isUnlimited: false,
        message,
        messageKey
    }
}

/**
 * Check if user can perform a valuation
 */
export function canPerformValuation(valuationsUsed: number, maxValuations: number): boolean {
    if (maxValuations === -1) return true  // Unlimited
    return valuationsUsed < maxValuations
}

/**
 * Get the max valuations for a plan type
 */
export function getMaxValuationsForPlan(planType: string): number {
    return PLAN_VALUATION_LIMITS[planType]?.maxValuations ?? PLAN_VALUATION_LIMITS.free.maxValuations
}