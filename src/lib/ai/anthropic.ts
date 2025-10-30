import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY

/**
 * Anthropic Client Instance (opsiyonel)
 */
export const anthropic = apiKey 
  ? new Anthropic({ apiKey })
  : null

/**
 * Claude Streaming Chat
 */
export async function streamClaudeCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = 'claude-3-sonnet-20240229',
  options?: {
    temperature?: number
    maxTokens?: number
  }
) {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  // Claude API format: system message ayrı
  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const conversationMessages = messages.filter(m => m.role !== 'system')

  const stream = await anthropic.messages.stream({
    model,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.7,
    system: systemMessage,
    messages: conversationMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  })

  return stream
}

/**
 * Claude Non-Streaming Completion
 */
export async function createClaudeCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = 'claude-3-sonnet-20240229',
  options?: {
    temperature?: number
    maxTokens?: number
  }
) {
  if (!anthropic) {
    throw new Error('ANTHROPIC_API_KEY not configured')
  }

  const systemMessage = messages.find(m => m.role === 'system')?.content || ''
  const conversationMessages = messages.filter(m => m.role !== 'system')

  const response = await anthropic.messages.create({
    model,
    max_tokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.7,
    system: systemMessage,
    messages: conversationMessages.map(m => ({
      role: m.role === 'user' ? 'user' : 'assistant',
      content: m.content,
    })),
  })

  return response
}

/**
 * Anthropic modeli mi kontrol et
 */
export function isAnthropicModel(model: string): boolean {
  return model.startsWith('claude-')
}