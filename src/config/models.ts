import { AIModel, AIModelConfig } from '@/types'

/**
 * AI Model Configurations
 * Her model için detaylı bilgiler ve fiyatlandırma
 */

export const AI_MODELS: Record<AIModel, AIModelConfig> = {
  'gpt-3.5-turbo': {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    maxTokens: 4096,
    costPer1kTokens: {
      input: 0.0005,
      output: 0.0015,
    },
    features: [
      'Hızlı yanıt',
      'Günlük kullanım',
      'Düşük maliyet',
    ],
  },
  
  'gpt-4': {
    id: 'gpt-4',
    name: 'GPT-4',
    provider: 'openai',
    maxTokens: 8192,
    costPer1kTokens: {
      input: 0.03,
      output: 0.06,
    },
    features: [
      'Gelişmiş akıl yürütme',
      'Karmaşık görevler',
      'Yüksek doğruluk',
    ],
  },
  
  'gpt-4-turbo': {
    id: 'gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'openai',
    maxTokens: 128000,
    costPer1kTokens: {
      input: 0.01,
      output: 0.03,
    },
    features: [
      'En yeni model',
      'Çok uzun context',
      'Vision desteği',
      'JSON mode',
    ],
  },
  
  'claude-3-haiku': {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: {
      input: 0.00025,
      output: 0.00125,
    },
    features: [
      'En hızlı',
      'En ekonomik',
      'Anlık yanıt',
    ],
  },
  
  'claude-3-sonnet': {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: {
      input: 0.003,
      output: 0.015,
    },
    features: [
      'Dengeli performans',
      'Uzun context',
      'Kod analizi',
    ],
  },
  
  'claude-3-opus': {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    maxTokens: 200000,
    costPer1kTokens: {
      input: 0.015,
      output: 0.075,
    },
    features: [
      'En güçlü model',
      'Karmaşık görevler',
      'Yaratıcı içerik',
      'Kod üretimi',
    ],
  },
}

/**
 * Model'e göre varsayılan ayarlar
 */
export const MODEL_DEFAULTS = {
  temperature: 0.7,
  topP: 1,
  frequencyPenalty: 0,
  presencePenalty: 0,
}

/**
 * Free plan'de kullanılabilecek modeller
 */
export const FREE_PLAN_MODELS: AIModel[] = ['gpt-3.5-turbo']

/**
 * Starter plan'de kullanılabilecek modeller
 */
export const STARTER_PLAN_MODELS: AIModel[] = [
  'gpt-3.5-turbo',
  'gpt-4-turbo',
]

/**
 * Professional plan'de kullanılabilecek modeller
 */
export const PROFESSIONAL_PLAN_MODELS: AIModel[] = [
  'gpt-3.5-turbo',
  'gpt-4',
  'gpt-4-turbo',
  'claude-3-haiku',
  'claude-3-sonnet',
  'claude-3-opus',
]

/**
 * Model listesini al
 */
export function getAvailableModels(plan: string): AIModelConfig[] {
  let modelIds: AIModel[]
  
  switch (plan) {
    case 'free':
      modelIds = FREE_PLAN_MODELS
      break
    case 'starter':
      modelIds = STARTER_PLAN_MODELS
      break
    case 'professional':
    case 'enterprise':
      modelIds = PROFESSIONAL_PLAN_MODELS
      break
    default:
      modelIds = FREE_PLAN_MODELS
  }
  
  return modelIds.map(id => AI_MODELS[id])
}

/**
 * Model bilgisini al
 */
export function getModelInfo(modelId: AIModel): AIModelConfig | undefined {
  return AI_MODELS[modelId]
}

/**
 * Token maliyetini hesapla
 */
export function calculateTokenCost(
  modelId: AIModel,
  inputTokens: number,
  outputTokens: number
): number {
  const model = AI_MODELS[modelId]
  if (!model) return 0
  
  const inputCost = (inputTokens / 1000) * model.costPer1kTokens.input
  const outputCost = (outputTokens / 1000) * model.costPer1kTokens.output
  
  return inputCost + outputCost
}