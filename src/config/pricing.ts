import { SubscriptionPlan, PlanConfig } from '@/types'

/**
 * Customer Support Chatbot - Subscription Plans
 */

export const PRICING_PLANS: Record<SubscriptionPlan, PlanConfig> = {
  free: {
    id: 'free',
    name: 'Free',
    price: {
      monthly: 0,
      yearly: 0,
    },
    limits: {
      maxChatbots: 1,
      maxDocuments: 5,
      maxConversations: 50, // per month
      storageLimit: 50, // MB
    },
    features: [
      '1 chatbot',
      '5 belge yükleme',
      '50 konuşma/ay',
      '50 MB depolama',
      'Temel özelleştirme',
      'Email destek',
      'ChatbotAI branding',
    ],
  },

  starter: {
    id: 'starter',
    name: 'Starter',
    price: {
      monthly: 49,
      yearly: 490, // ~%17 indirim
    },
    limits: {
      maxChatbots: 3,
      maxDocuments: 50,
      maxConversations: 1000,
      storageLimit: 500, // MB
    },
    features: [
      '3 chatbot',
      '50 belge yükleme',
      '1,000 konuşma/ay',
      '500 MB depolama',
      'Tam özelleştirme',
      'Canlı destek entegrasyonu',
      'Temel analytics',
      'Email destek',
      'Branding kaldırma seçeneği',
    ],
  },

  professional: {
    id: 'professional',
    name: 'Professional',
    price: {
      monthly: 149,
      yearly: 1490, // ~%17 indirim
    },
    limits: {
      maxChatbots: 10,
      maxDocuments: 200,
      maxConversations: 5000,
      storageLimit: 2000, // MB (2GB)
    },
    features: [
      '10 chatbot',
      '200 belge yükleme',
      '5,000 konuşma/ay',
      '2 GB depolama',
      'Gelişmiş özelleştirme',
      'Tüm AI modelleri (GPT-4, Claude)',
      'Canlı destek entegrasyonu',
      'Gelişmiş analytics & raporlar',
      'API erişimi',
      'Takım işbirliği',
      'Öncelikli destek',
      'White-label (branding yok)',
      'Custom domain',
    ],
  },

  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: {
      monthly: 99,
      yearly: 990, // ~%17 indirim
    },
    limits: {
      maxChatbots: -1, // Unlimited
      maxDocuments: -1,
      maxConversations: -1,
      storageLimit: -1,
    },
    features: [
      'Sınırsız chatbot',
      'Sınırsız belge',
      'Sınırsız konuşma',
      'Sınırsız depolama',
      'Professional tüm özellikleri',
      'Özel AI model training',
      'On-premise deployment',
      'Dedicated infrastructure',
      'SLA garantisi (99.9%)',
      'Dedicated account manager',
      '24/7 öncelikli destek',
      'Custom integrations',
      'Advanced security & compliance',
      'Multi-region deployment',
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