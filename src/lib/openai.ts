import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is required but not set')
}

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

export const OPENAI_CONFIG = {
    model: 'gpt-3.5-turbo',
    embeddingModel: 'text-embedding-ada-002',
    maxTokens: 1500,
    temperature: 0.7,
}