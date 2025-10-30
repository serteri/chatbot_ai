import { AIModel, AICompletionOptions } from '@/types'
import { streamOpenAICompletion, createOpenAICompletion } from './openai'
import { streamClaudeCompletion, createClaudeCompletion, isAnthropicModel } from './anthropic'

/**
 * Unified AI Service
 * Tüm AI provider'ları tek noktadan yönetir
 */

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

/**
 * Streaming AI completion
 */
export async function streamAICompletion(
  messages: ChatMessage[],
  model: AIModel,
  options?: AICompletionOptions
) {
  // Model'e göre doğru provider'ı seç
  if (isAnthropicModel(model)) {
    return streamClaudeCompletion(messages, model, {
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    })
  } else {
    return streamOpenAICompletion(messages, model, {
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    })
  }
}

/**
 * Non-streaming AI completion
 */
export async function createAICompletion(
  messages: ChatMessage[],
  model: AIModel,
  options?: AICompletionOptions
) {
  if (isAnthropicModel(model)) {
    return createClaudeCompletion(messages, model, {
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    })
  } else {
    return createOpenAICompletion(messages, model, {
      temperature: options?.temperature,
      maxTokens: options?.maxTokens,
    })
  }
}

/**
 * System prompt oluştur
 */
export function createSystemPrompt(language: string = 'tr'): string {
  const prompts: Record<string, string> = {
    tr: `Sen yardımcı bir AI asistanısın. Kullanıcılara dostça, profesyonel ve detaylı yanıtlar veriyorsun. 
Her zaman Türkçe cevap ver. Eğer bir şeyi bilmiyorsan, bilmediğini söyle.`,
    
    en: `You are a helpful AI assistant. You provide friendly, professional, and detailed responses to users.
Always respond in English. If you don't know something, say that you don't know.`,
    
    de: `Du bist ein hilfreicher KI-Assistent. Du gibst freundliche, professionelle und detaillierte Antworten.
Antworte immer auf Deutsch. Wenn du etwas nicht weißt, sage es.`,
    
    fr: `Tu es un assistant IA utile. Tu fournis des réponses amicales, professionnelles et détaillées.
Réponds toujours en français. Si tu ne sais pas quelque chose, dis-le.`,
    
    es: `Eres un asistente de IA útil. Proporcionas respuestas amigables, profesionales y detalladas.
Siempre responde en español. Si no sabes algo, dilo.`,
    
    ar: `أنت مساعد ذكاء اصطناعي مفيد. تقدم إجابات ودية ومهنية ومفصلة.
أجب دائمًا بالعربية. إذا كنت لا تعرف شيئًا، قل ذلك.`,
    
    ru: `Ты полезный AI-ассистент. Ты даешь дружелюбные, профессиональные и подробные ответы.
Всегда отвечай на русском. Если ты чего-то не знаешь, скажи об этом.`,
    
    zh: `你是一个有用的 AI 助手。你提供友好、专业和详细的回答。
始终用中文回答。如果你不知道某事，请说你不知道。`,
    
    ja: `あなたは役立つAIアシスタントです。フレンドリーでプロフェッショナルかつ詳細な回答を提供します。
常に日本語で回答してください。何かわからない場合は、わからないと言ってください。`,
  }
  
  return prompts[language] || prompts.tr
}