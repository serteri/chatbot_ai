import { 
  User, 
  Chatbot, 
  Document, 
  DocumentChunk,
  Conversation, 
  ConversationMessage,
  Subscription,
  ChatbotAnalytics 
} from '@prisma/client'

// ============================================
// USER TYPES
// ============================================

export type SafeUser = Omit<User, 'password'>

export interface UserWithSubscription extends SafeUser {
  subscription: Subscription | null
}

export interface UserWithChatbots extends SafeUser {
  chatbots: Chatbot[]
  subscription: Subscription | null
}

// ============================================
// CHATBOT TYPES
// ============================================

export interface ChatbotWithRelations extends Chatbot {
  user: SafeUser
  documents: Document[]
  _count: {
    conversations: number
    documents: number
  }
}

export interface ChatbotSettings {
  name: string
  primaryColor: string
  secondaryColor: string
  botAvatar?: string
  botName: string
  welcomeMessage: string
  placeholderText: string
  fallbackMessage: string
  language: string
  aiModel: string
  enableLiveChat: boolean
  enableEmailCapture: boolean
  enableRating: boolean
  allowedDomains: string[]
}

export type ChatbotPosition = 'bottom-right' | 'bottom-left'
export type ResponseStyle = 'professional' | 'friendly' | 'concise'

// ============================================
// DOCUMENT TYPES
// ============================================

export type DocumentType = 'pdf' | 'docx' | 'txt' | 'url' | 'markdown'
export type DocumentStatus = 'processing' | 'ready' | 'failed'

export interface DocumentWithChunks extends Document {
  chunks: DocumentChunk[]
}

export interface CreateDocumentInput {
  chatbotId: string
  name: string
  type: DocumentType
  file?: File
  url?: string
}

export interface DocumentUploadProgress {
  documentId: string
  status: DocumentStatus
  progress: number // 0-100
  totalChunks?: number
  processedChunks?: number
}

// ============================================
// CONVERSATION TYPES
// ============================================

export type ConversationStatus = 'active' | 'resolved' | 'escalated' | 'spam'
export type MessageRole = 'user' | 'assistant' | 'system'

export interface ConversationWithMessages extends Conversation {
  messages: ConversationMessage[]
  chatbot: {
    id: string
    name: string
    botName: string
  }
}

export interface ConversationListItem extends Conversation {
  _count: {
    messages: number
  }
}

export interface MessageSource {
  documentId: string
  documentName: string
  chunkIndex: number
  content: string
  relevance: number // 0-1
}

export interface CreateMessageInput {
  conversationId: string
  role: MessageRole
  content: string
  sources?: MessageSource[]
}

// ============================================
// WIDGET (Public Chat) TYPES
// ============================================

export interface WidgetConfig {
  chatbotId: string
  identifier: string
  primaryColor: string
  secondaryColor: string
  position: ChatbotPosition
  botAvatar?: string
  botName: string
  welcomeMessage: string
  placeholderText: string
  language: string
}

export interface WidgetMessage {
  id: string
  role: MessageRole
  content: string
  sources?: MessageSource[]
  confidence?: number
  timestamp: Date
  isStreaming?: boolean
}

export interface VisitorInfo {
  visitorId: string
  email?: string
  name?: string
  phone?: string
}

// ============================================
// SUBSCRIPTION TYPES
// ============================================

export type SubscriptionPlan = 'free' | 'starter' | 'professional' | 'enterprise'
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'trialing'

export interface SubscriptionLimits {
  maxChatbots: number
  maxDocuments: number
  maxConversations: number
  storageLimit: number
}

export interface PlanConfig {
  id: SubscriptionPlan
  name: string
  price: {
    monthly: number
    yearly: number
  }
  limits: SubscriptionLimits
  features: string[]
}

// ============================================
// ANALYTICS TYPES
// ============================================

export interface AnalyticsData extends ChatbotAnalytics {
  // Additional computed fields
}

export interface DashboardStats {
  totalConversations: number
  totalMessages: number
  uniqueVisitors: number
  resolvedByAI: number
  escalatedToHuman: number
  avgRating: number | null
  avgResponseTime: number | null
  
  // Trends
  conversationsTrend: number // % change from previous period
  messagesTrend: number
  ratingTrend: number
}

export interface ConversationMetrics {
  date: string
  conversations: number
  messages: number
  avgRating: number | null
}

export interface TopQuery {
  query: string
  count: number
  avgConfidence: number
}

// ============================================
// RAG (Retrieval) TYPES
// ============================================

export interface SearchResult {
  documentId: string
  documentName: string
  chunkIndex: number
  content: string
  similarity: number // 0-1 (cosine similarity)
  pageNumber?: number
}

export interface RAGContext {
  results: SearchResult[]
  totalResults: number
  avgSimilarity: number
}

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ============================================
// FORM TYPES
// ============================================

export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
  companyName?: string
  website?: string
}

export interface ChatbotFormData {
  name: string
  language: string
  aiModel: string
  primaryColor: string
  botName: string
  welcomeMessage: string
  placeholderText: string
  fallbackMessage: string
  enableLiveChat: boolean
  enableEmailCapture: boolean
  allowedDomains: string[]
}

// ============================================
// EMBED TYPES
// ============================================

export interface EmbedCode {
  script: string
  html: string
  instructions: string
}

// ============================================
// WEBHOOK TYPES
// ============================================

export interface LiveChatWebhookPayload {
  conversationId: string
  visitorEmail?: string
  visitorName?: string
  lastMessage: string
  chatbotName: string
  timestamp: string
}