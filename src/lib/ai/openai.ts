import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY environment variable is required')
}

/**
 * OpenAI Client Instance
 */
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * OpenAI Streaming Chat Completion
 */
export async function streamOpenAICompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = 'gpt-3.5-turbo',
  options?: {
    temperature?: number
    maxTokens?: number
  }
) {
  const stream = await openai.chat.completions.create({
    model,
    messages: messages as any,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens,
    stream: true,
  })

  return stream
}

/**
 * OpenAI Non-Streaming Chat Completion
 */
export async function createOpenAICompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = 'gpt-3.5-turbo',
  options?: {
    temperature?: number
    maxTokens?: number
  }
) {
  const completion = await openai.chat.completions.create({
    model,
    messages: messages as any,
    temperature: options?.temperature ?? 0.7,
    max_tokens: options?.maxTokens,
  })

  return completion
}

/**
 * Token sayısını hesapla (yaklaşık)
 */
export function estimateTokenCount(text: string): number {
  // Basit tahmin: ~4 karakter = 1 token
  return Math.ceil(text.length / 4)
}