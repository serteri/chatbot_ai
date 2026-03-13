import { SubscriptionPlan, PlanConfig } from '@/types'

/**
 * NDIS Shield Hub - Subscription Plans
 */

export const PRICING_PLANS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Starter',
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      maxChatbots: 0,
      maxDocuments: 10,
      maxConversations: 0,
      storageLimit: 100, // MB
    },
    features: [
      '5 NDIS Claims / month',
      'Basic Excel/CSV Imports',
      'NDIS Price Guide Sync (Basic)',
      'Audit Evidence Vault (100MB)',
      'Email Support',
      'NDIS Shield Hub branding',
    ],
  },

  starter: {
    id: 'starter',
    name: 'Professional',
    price: {
      monthly: 99,
      yearly: 990,
    },
    limits: {
      maxChatbots: 0,
      maxDocuments: 100,
      maxConversations: 0,
      storageLimit: 1000, // MB
    },
    features: [
      'Unlimited NDIS Claims',
      'Unlimited Excel/CSV Imports',
      'PRODA Bulk Export Sync',
      'NDIS Price Guide Sync (Full)',
      'Audit Evidence Vault (1GB)',
      'Priority Email Support',
      'No Branding',
    ],
  },

  professional: {
    id: 'professional',
    name: 'Business',
    price: {
      monthly: 249,
      yearly: 2490,
    },
    limits: {
      maxChatbots: 0,
      maxDocuments: -1,
      maxConversations: 0,
      storageLimit: 5000, // MB
    },
    features: [
      'Everything in Professional',
      'AI-Powered Docx & PDF Evidence Extraction',
      'Advanced Accounting Integration Suite (Xero/QB)',
      'Priority Compliance Support',
      'Audit-Ready Data Logs',
      'Multiple PRODA Accounts',
      'Dedicated Account Manager',
      'Audit Evidence Vault (5GB)',
      'API Access for CRM Sync',
    ],
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: {
      monthly: 499,
      yearly: 4990,
    },
    limits: {
      maxChatbots: -1,
      maxDocuments: -1,
      maxConversations: -1,
      storageLimit: -1,
    },
    features: [
      'Custom Solutions',
      'Unlimited Everything',
      'SLA Guarantee',
      'Whitelabel Portal',
    ],
  },
}

/**
 * Feature Comparison Table
 */
export const FEATURE_COMPARISON = [
  {
    category: 'Temel',
    features: [
      {
        name: 'Chatbot Sayısı',
        free: '1',
        starter: '3',
        professional: '10',
        enterprise: 'Sınırsız',
      },
      {
        name: 'Belge Yükleme',
        free: '5',
        starter: '50',
        professional: '200',
        enterprise: 'Sınırsız',
      },
      {
        name: 'Aylık Konuşma',
        free: '50',
        starter: '1,000',
        professional: '5,000',
        enterprise: 'Sınırsız',
      },
      {
        name: 'Depolama',
        free: '50 MB',
        starter: '500 MB',
        professional: '2 GB',
        enterprise: 'Sınırsız',
      },
      {
        name: 'AI Değerleme',
        free: '5/ay',
        starter: '50/ay',
        professional: '200/ay',
        enterprise: 'Sınırsız',
      },
    ],
  },
  {
    category: 'Özellikler',
    features: [
      {
        name: 'AI Modelleri',
        free: 'GPT-3.5',
        starter: 'GPT-3.5 & GPT-4',
        professional: 'Tümü',
        enterprise: 'Tümü + Custom',
      },
      {
        name: 'Özelleştirme',
        free: 'Temel',
        starter: 'Tam',
        professional: 'Gelişmiş',
        enterprise: 'Tam Kontrol',
      },
      {
        name: 'White-label',
        free: false,
        starter: 'Opsiyonel',
        professional: true,
        enterprise: true,
      },
      {
        name: 'API Erişimi',
        free: false,
        starter: false,
        professional: true,
        enterprise: true,
      },
      {
        name: 'Analytics',
        free: 'Temel',
        starter: 'Temel',
        professional: 'Gelişmiş',
        enterprise: 'Custom',
      },
    ],
  },
  {
    category: 'Destek',
    features: [
      {
        name: 'Destek Seviyesi',
        free: 'Email',
        starter: 'Email',
        professional: 'Öncelikli',
        enterprise: '24/7 Dedicated',
      },
      {
        name: 'SLA',
        free: false,
        starter: false,
        professional: false,
        enterprise: '99.9%',
      },
    ],
  },
]

/**
 * Stripe Price IDs (Production'da gerçek ID'lerle değiştirilecek)
 */
export const STRIPE_PRICE_IDS = {
  starter: {
    monthly: 'price_starter_monthly',
    yearly: 'price_starter_yearly',
  },
  professional: {
    monthly: 'price_professional_monthly',
    yearly: 'price_professional_yearly',
  },
}

/**
 * Plan bilgisini al
 */
export function getPlanInfo(planId: SubscriptionPlan): PlanConfig {
  return PRICING_PLANS[planId]
}

/**
 * Yıllık indirim hesapla
 */
export function calculateYearlySavings(planId: SubscriptionPlan): number {
  const plan = PRICING_PLANS[planId]
  if (plan.price.monthly <= 0 || plan.price.yearly <= 0) return 0

  const monthlyTotal = plan.price.monthly * 12
  const yearlySavings = monthlyTotal - plan.price.yearly

  return Math.round(yearlySavings * 100) / 100
}

// ─── NDIS Compliance Product Tiers ──────────────────────────────────────────
// Single source of truth for the NDIS compliance product pricing.
// Import from here in every component that displays a plan name, price, or
// feature list. Never hardcode dollar amounts in individual components.

export const NDIS_COMPLIANCE_TIERS = {
    starter: {
        id: 'starter' as const,
        name: 'Starter',
        priceMonthlyUSD: 0,
        priceMonthlyTRY: 0,
        displayUSD: '$0',
        displayTRY: '₺0',
        isMostPopular: false,
        features: [
            '5 NDIS Claims/month',
            'Basic Excel/CSV Imports',
            'NDIS Price Guide Sync',
        ],
        cta: 'Get Started Free',
    },
    professional: {
        id: 'professional' as const,
        name: 'Professional',
        priceMonthlyUSD: 99,
        priceMonthlyTRY: 2999,
        displayUSD: '$99',
        displayTRY: '₺2.999',
        isMostPopular: false,
        features: [
            'Unlimited NDIS Claims',
            'PRODA Bulk Export Sync',
            'Priority Email Support',
        ],
        cta: 'Start Professional',
    },
    business: {
        id: 'business' as const,
        name: 'Business',
        priceMonthlyUSD: 299,
        priceMonthlyTRY: 9499,
        displayUSD: '$299',
        displayTRY: '₺9.499',
        isMostPopular: true,
        features: [
            'AI-Powered Docx & PDF Evidence Extraction',
            'Advanced Accounting Integration Suite',
            'Priority Compliance Support',
            'Audit-Ready Data Logs',
        ],
        cta: 'Go Enterprise',
    },
} as const

export type NdisComplianceTierKey = keyof typeof NDIS_COMPLIANCE_TIERS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Kullanıcının limitlerini kontrol et
 */
export function checkLimit(
  subscription: { plan: string; maxChatbots: number; conversationsUsed: number; maxConversations: number },
  type: 'chatbots' | 'conversations' | 'documents'
): { canCreate: boolean; reason?: string } {

  if (type === 'chatbots') {
    const currentCount = 0 // This should come from actual count
    if (subscription.maxChatbots !== -1 && currentCount >= subscription.maxChatbots) {
      return {
        canCreate: false,
        reason: `Maksimum ${subscription.maxChatbots} chatbot oluşturabilirsiniz. Plan yükseltin.`
      }
    }
  }

  if (type === 'conversations') {
    if (subscription.maxConversations !== -1 && subscription.conversationsUsed >= subscription.maxConversations) {
      return {
        canCreate: false,
        reason: 'Aylık konuşma limitiniz doldu. Plan yükseltin.'
      }
    }
  }

  return { canCreate: true }
}