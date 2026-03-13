import { AzureOpenAI } from 'openai'

if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
  throw new Error('Azure OpenAI environment variables are missing')
}

/**
 * Azure OpenAI Client Instance
 */
export const openai = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
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