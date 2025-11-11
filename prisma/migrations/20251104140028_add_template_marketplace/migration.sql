-- CreateTable
CREATE TABLE "ChatbotTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "icon" TEXT,
    "thumbnail" TEXT,
    "features" TEXT[],
    "systemPrompt" TEXT NOT NULL,
    "welcomeMessages" JSONB NOT NULL,
    "fallbackMessages" JSONB NOT NULL,
    "sampleQuestions" TEXT[],
    "defaultSettings" JSONB,
    "requiredIntegrations" TEXT[],
    "includesUniversities" BOOLEAN NOT NULL DEFAULT false,
    "includesScholarships" BOOLEAN NOT NULL DEFAULT false,
    "includesFAQs" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "popularity" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT[],
    "totalSales" INTEGER NOT NULL DEFAULT 0,
    "totalRevenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChatbotTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplatePurchase" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "chatbotId" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "stripePaymentId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'completed',
    "isApplied" BOOLEAN NOT NULL DEFAULT false,
    "appliedAt" TIMESTAMP(3),
    "purchasedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplatePurchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateReview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "isVerifiedPurchase" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TemplateReview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "companyName" TEXT,
    "website" TEXT,
    "language" TEXT NOT NULL DEFAULT 'tr',
    "timezone" TEXT NOT NULL DEFAULT 'Europe/Istanbul',
    "stripeCustomerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notificationEmail" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "stripePriceId" TEXT,
    "planType" TEXT NOT NULL DEFAULT 'free',
    "status" TEXT NOT NULL DEFAULT 'active',
    "maxChatbots" INTEGER NOT NULL DEFAULT 1,
    "maxDocuments" INTEGER NOT NULL DEFAULT 10,
    "maxConversations" INTEGER NOT NULL DEFAULT 100,
    "conversationsUsed" INTEGER NOT NULL DEFAULT 0,
    "storageLimit" INTEGER NOT NULL DEFAULT 100,
    "storageUsed" INTEGER NOT NULL DEFAULT 0,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "currentPeriodEnd" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastResetDate" TIMESTAMP(3),

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chatbot" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "primaryColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "secondaryColor" TEXT NOT NULL DEFAULT '#1e40af',
    "botAvatar" TEXT,
    "botName" TEXT NOT NULL DEFAULT 'AI Assistant',
    "position" TEXT NOT NULL DEFAULT 'bottom-right',
    "botNameTr" TEXT NOT NULL DEFAULT 'AI Asistan',
    "botNameEn" TEXT NOT NULL DEFAULT 'AI Assistant',
    "botNameDe" TEXT NOT NULL DEFAULT 'KI-Assistent',
    "botNameFr" TEXT NOT NULL DEFAULT 'Assistant IA',
    "botNameEs" TEXT NOT NULL DEFAULT 'Asistente IA',
    "appliedTemplateId" TEXT,
    "welcomeMessageTr" TEXT NOT NULL DEFAULT 'Merhaba! Size nasıl yardımcı olabilirim?',
    "welcomeMessageEn" TEXT NOT NULL DEFAULT 'Hello! How can I help you?',
    "welcomeMessageDe" TEXT NOT NULL DEFAULT 'Hallo! Wie kann ich Ihnen helfen?',
    "welcomeMessageFr" TEXT NOT NULL DEFAULT 'Bonjour! Comment puis-je vous aider?',
    "welcomeMessageEs" TEXT NOT NULL DEFAULT '¡Hola! ¿Cómo puedo ayudarte?',
    "fallbackMessageTr" TEXT NOT NULL DEFAULT 'Üzgünüm, bu konuda yardımcı olamıyorum.',
    "fallbackMessageEn" TEXT NOT NULL DEFAULT 'Sorry, I cannot help with that.',
    "fallbackMessageDe" TEXT NOT NULL DEFAULT 'Entschuldigung, dabei kann ich nicht helfen.',
    "fallbackMessageFr" TEXT NOT NULL DEFAULT 'Désolé, je ne peux pas vous aider avec ça.',
    "fallbackMessageEs" TEXT NOT NULL DEFAULT 'Lo siento, no puedo ayudar con eso.',
    "placeholderTr" TEXT NOT NULL DEFAULT 'Mesajınızı yazın...',
    "placeholderEn" TEXT NOT NULL DEFAULT 'Type your message...',
    "placeholderDe" TEXT NOT NULL DEFAULT 'Geben Sie Ihre Nachricht ein...',
    "placeholderFr" TEXT NOT NULL DEFAULT 'Écrivez votre message...',
    "placeholderEs" TEXT NOT NULL DEFAULT 'Escribe tu mensaje...',
    "welcomeMessage" TEXT NOT NULL DEFAULT 'Hello! How can I help you today?',
    "placeholderText" TEXT NOT NULL DEFAULT 'Type your message...',
    "fallbackMessage" TEXT NOT NULL DEFAULT 'I couldn''t find an answer. Would you like to speak with a human?',
    "offlineMessage" TEXT,
    "language" TEXT NOT NULL DEFAULT 'en',
    "aiModel" TEXT NOT NULL DEFAULT 'gpt-3.5-turbo',
    "temperature" DOUBLE PRECISION NOT NULL DEFAULT 0.7,
    "responseStyle" TEXT NOT NULL DEFAULT 'professional',
    "widgetPrimaryColor" TEXT NOT NULL DEFAULT '#3B82F6',
    "widgetButtonColor" TEXT NOT NULL DEFAULT '#2563EB',
    "widgetTextColor" TEXT NOT NULL DEFAULT '#FFFFFF',
    "widgetPosition" TEXT NOT NULL DEFAULT 'bottom-right',
    "widgetSize" TEXT NOT NULL DEFAULT 'medium',
    "widgetLogoUrl" TEXT,
    "widgetBubbleIcon" TEXT NOT NULL DEFAULT 'bot',
    "enableLiveChat" BOOLEAN NOT NULL DEFAULT true,
    "enableEmailCapture" BOOLEAN NOT NULL DEFAULT true,
    "enableRating" BOOLEAN NOT NULL DEFAULT true,
    "enableSources" BOOLEAN NOT NULL DEFAULT true,
    "allowedDomains" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "liveChatWebhook" TEXT,
    "emailNotification" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "avgRating" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "whatsappNumber" TEXT,
    "supportEmail" TEXT,
    "liveSupport" BOOLEAN NOT NULL DEFAULT false,
    "liveSupportUrl" TEXT,
    "industry" TEXT NOT NULL DEFAULT 'general',
    "customSettings" JSONB,
    "model" TEXT,

    CONSTRAINT "Chatbot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "url" TEXT,
    "size" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "errorMessage" TEXT,
    "rawContent" TEXT,
    "totalChunks" INTEGER NOT NULL DEFAULT 0,
    "totalTokens" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentChunk" (
    "id" TEXT NOT NULL,
    "documentId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" BYTEA,
    "chunkIndex" INTEGER NOT NULL,
    "tokenCount" INTEGER NOT NULL,
    "pageNumber" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DocumentChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "visitorEmail" TEXT,
    "visitorName" TEXT,
    "visitorPhone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "rating" INTEGER,
    "feedback" TEXT,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "country" TEXT,
    "referrer" TEXT,
    "currentPage" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationMessage" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "aiModel" TEXT,
    "tokens" INTEGER,
    "confidence" DOUBLE PRECISION,
    "sources" JSONB,
    "isHumanResponse" BOOLEAN NOT NULL DEFAULT false,
    "humanAgentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConversationMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChatbotAnalytics" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalConversations" INTEGER NOT NULL DEFAULT 0,
    "totalMessages" INTEGER NOT NULL DEFAULT 0,
    "uniqueVisitors" INTEGER NOT NULL DEFAULT 0,
    "resolvedByAI" INTEGER NOT NULL DEFAULT 0,
    "escalatedToHuman" INTEGER NOT NULL DEFAULT 0,
    "avgConfidence" DOUBLE PRECISION,
    "avgRating" DOUBLE PRECISION,
    "avgResponseTime" INTEGER,
    "avgConversationLength" INTEGER,
    "topQueries" JSONB,

    CONSTRAINT "ChatbotAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "invitedBy" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "ranking" INTEGER,
    "tuitionMin" DOUBLE PRECISION,
    "tuitionMax" DOUBLE PRECISION,
    "programs" TEXT[],
    "requirements" JSONB,
    "website" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "University_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "universityId" TEXT,
    "country" TEXT NOT NULL,
    "amount" DOUBLE PRECISION,
    "percentage" INTEGER,
    "deadline" TIMESTAMP(3),
    "requirements" JSONB,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "applicationUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Scholarship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LiveSupportRequest" (
    "id" TEXT NOT NULL,
    "chatbotId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "priority" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LiveSupportRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotTemplate_slug_key" ON "ChatbotTemplate"("slug");

-- CreateIndex
CREATE INDEX "ChatbotTemplate_category_idx" ON "ChatbotTemplate"("category");

-- CreateIndex
CREATE INDEX "ChatbotTemplate_slug_idx" ON "ChatbotTemplate"("slug");

-- CreateIndex
CREATE INDEX "ChatbotTemplate_isActive_idx" ON "ChatbotTemplate"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "TemplatePurchase_stripePaymentId_key" ON "TemplatePurchase"("stripePaymentId");

-- CreateIndex
CREATE INDEX "TemplatePurchase_userId_idx" ON "TemplatePurchase"("userId");

-- CreateIndex
CREATE INDEX "TemplatePurchase_templateId_idx" ON "TemplatePurchase"("templateId");

-- CreateIndex
CREATE INDEX "TemplatePurchase_chatbotId_idx" ON "TemplatePurchase"("chatbotId");

-- CreateIndex
CREATE INDEX "TemplateReview_templateId_idx" ON "TemplateReview"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "TemplateReview_userId_templateId_key" ON "TemplateReview"("userId", "templateId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeCustomerId_key" ON "Subscription"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Chatbot_identifier_key" ON "Chatbot"("identifier");

-- CreateIndex
CREATE INDEX "Chatbot_userId_idx" ON "Chatbot"("userId");

-- CreateIndex
CREATE INDEX "Chatbot_identifier_idx" ON "Chatbot"("identifier");

-- CreateIndex
CREATE INDEX "Document_chatbotId_idx" ON "Document"("chatbotId");

-- CreateIndex
CREATE INDEX "Document_status_idx" ON "Document"("status");

-- CreateIndex
CREATE INDEX "DocumentChunk_documentId_idx" ON "DocumentChunk"("documentId");

-- CreateIndex
CREATE INDEX "Conversation_chatbotId_idx" ON "Conversation"("chatbotId");

-- CreateIndex
CREATE INDEX "Conversation_visitorId_idx" ON "Conversation"("visitorId");

-- CreateIndex
CREATE INDEX "Conversation_status_idx" ON "Conversation"("status");

-- CreateIndex
CREATE INDEX "Conversation_startedAt_idx" ON "Conversation"("startedAt");

-- CreateIndex
CREATE INDEX "ConversationMessage_conversationId_idx" ON "ConversationMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ConversationMessage_createdAt_idx" ON "ConversationMessage"("createdAt");

-- CreateIndex
CREATE INDEX "ChatbotAnalytics_date_idx" ON "ChatbotAnalytics"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ChatbotAnalytics_chatbotId_date_key" ON "ChatbotAnalytics"("chatbotId", "date");

-- CreateIndex
CREATE INDEX "TeamMember_userId_idx" ON "TeamMember"("userId");

-- CreateIndex
CREATE INDEX "University_country_idx" ON "University"("country");

-- CreateIndex
CREATE INDEX "University_ranking_idx" ON "University"("ranking");

-- CreateIndex
CREATE INDEX "Scholarship_country_idx" ON "Scholarship"("country");

-- CreateIndex
CREATE INDEX "Scholarship_deadline_idx" ON "Scholarship"("deadline");

-- CreateIndex
CREATE INDEX "LiveSupportRequest_chatbotId_idx" ON "LiveSupportRequest"("chatbotId");

-- CreateIndex
CREATE INDEX "LiveSupportRequest_status_idx" ON "LiveSupportRequest"("status");

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChatbotTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplatePurchase" ADD CONSTRAINT "TemplatePurchase_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateReview" ADD CONSTRAINT "TemplateReview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateReview" ADD CONSTRAINT "TemplateReview_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChatbotTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chatbot" ADD CONSTRAINT "Chatbot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentChunk" ADD CONSTRAINT "DocumentChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationMessage" ADD CONSTRAINT "ConversationMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatbotAnalytics" ADD CONSTRAINT "ChatbotAnalytics_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Scholarship" ADD CONSTRAINT "Scholarship_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSupportRequest" ADD CONSTRAINT "LiveSupportRequest_chatbotId_fkey" FOREIGN KEY ("chatbotId") REFERENCES "Chatbot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LiveSupportRequest" ADD CONSTRAINT "LiveSupportRequest_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
