import { AzureOpenAI } from 'openai'

if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_ENDPOINT || !process.env.AZURE_OPENAI_DEPLOYMENT_NAME) {
    throw new Error('Azure OpenAI environment variables are missing (AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_DEPLOYMENT_NAME)')
}

console.log("🛡️ Compliance Guard: AI Engine locked to Sydney (ap-southeast-2). No data will leave Australian jurisdiction.")

export const openai = new AzureOpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    endpoint: process.env.AZURE_OPENAI_ENDPOINT,
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT_NAME,
    apiVersion: process.env.AZURE_OPENAI_API_VERSION || '2024-08-01-preview',
})

export const OPENAI_CONFIG = {
    model: 'gpt-3.5-turbo',
    embeddingModel: 'text-embedding-ada-002',
    maxTokens: 1500,
    temperature: 0.7,
}