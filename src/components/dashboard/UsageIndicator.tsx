'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bot, MessageSquare, FileText, AlertTriangle, Zap, Calendar } from 'lucide-react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

interface UsageIndicatorProps {
    locale: string
    subscription: {
        planType: string
        maxChatbots: number
        maxDocuments: number
        maxConversations: number
        conversationsUsed: number
        currentPeriodEnd?: Date | null
    }
    currentUsage: {
        chatbots: number
        documents: number
        conversations: number
    }
}

export function UsageIndicator({ locale, subscription, currentUsage }: UsageIndicatorProps) {
    const t = useTranslations('usage')

    const getPercentage = (used: number, max: number): number => {
        if (max === -1) return 0 // Unlimited
        return Math.min(Math.round((used / max) * 100), 100)
    }

    const getProgressColor = (percentage: number): string => {
        if (percentage >= 100) return 'bg-red-500'
        if (percentage >= 80) return 'bg-yellow-500'
        return 'bg-green-500'
    }

    const isWarning = (used: number, max: number): boolean => {
        if (max === -1) return false
        return (used / max) >= 0.8
    }

    const isLimitReached = (used: number, max: number): boolean => {
        if (max === -1) return false
        return used >= max
    }

    const chatbotPercent = getPercentage(currentUsage.chatbots, subscription.maxChatbots)
    const conversationPercent = getPercentage(currentUsage.conversations, subscription.maxConversations)
    const documentPercent = getPercentage(currentUsage.documents, subscription.maxDocuments)

    // Enterprise gibi yüksek limitler için "unlimited" göster
    const isUnlimited = (max: number, type: 'chatbot' | 'conversation' | 'document'): boolean => {
        if (max === -1) return true
        if (type === 'chatbot' && max >= 100) return true
        if (type === 'document' && max >= 500) return true
        if (type === 'conversation' && max >= 50000) return true
        return false
    }

    // Sadece konuşma ve doküman limitleri için uyarı göster
    // Chatbot limiti Free plan için beklenen bir durum, uyarı vermeye gerek yok
    const hasAnyWarning = isWarning(currentUsage.conversations, subscription.maxConversations) ||
        isWarning(currentUsage.documents, subscription.maxDocuments)

    const formatDate = (date: Date | null | undefined): string => {
        if (!date) return ''
        return new Date(date).toLocaleDateString()
    }

    const planColors: Record<string, string> = {
        'free': 'bg-gray-100 text-gray-700',
        'pro': 'bg-blue-100 text-blue-700',
        'business': 'bg-purple-100 text-purple-700',
        'enterprise': 'bg-amber-100 text-amber-700'
    }

    return (
        <Card className="border-2 border-dashed">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="h-5 w-5 text-yellow-500" />
                        <CardTitle className="text-lg">{t('title')}</CardTitle>
                    </div>
                    <Badge className={planColors[subscription.planType] || 'bg-gray-100'}>
                        {subscription.planType.charAt(0).toUpperCase() + subscription.planType.slice(1)}
                    </Badge>
                </div>
                {subscription.currentPeriodEnd && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        {t('resetDate', { date: formatDate(subscription.currentPeriodEnd) })}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Warning Banner */}
                {hasAnyWarning && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div className="text-sm">
                            <p className="font-medium text-yellow-800">{t('warningTitle')}</p>
                            <p className="text-yellow-700 text-xs">{t('warningMessage')}</p>
                        </div>
                    </div>
                )}

                {/* Chatbots */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4 text-muted-foreground" />
                            <span>{t('chatbots')}</span>
                        </div>
                        <span className="font-medium">
                            {isUnlimited(subscription.maxChatbots, 'chatbot')
                                ? <><span>{currentUsage.chatbots}</span> <span className="text-green-600">({t('unlimited')})</span></>
                                : `${currentUsage.chatbots} / ${subscription.maxChatbots}`
                            }
                        </span>
                    </div>
                    {!isUnlimited(subscription.maxChatbots, 'chatbot') && (
                        <div className="relative">
                            <Progress value={chatbotPercent} className="h-2" />
                            <div
                                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(chatbotPercent)}`}
                                style={{ width: `${chatbotPercent}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Conversations */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-muted-foreground" />
                            <span>{t('conversations')}</span>
                        </div>
                        <span className="font-medium">
                            {isUnlimited(subscription.maxConversations, 'conversation')
                                ? <><span>{currentUsage.conversations}</span> <span className="text-green-600">({t('unlimited')})</span></>
                                : `${currentUsage.conversations} / ${subscription.maxConversations}`
                            }
                        </span>
                    </div>
                    {!isUnlimited(subscription.maxConversations, 'conversation') && (
                        <div className="relative">
                            <Progress value={conversationPercent} className="h-2" />
                            <div
                                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(conversationPercent)}`}
                                style={{ width: `${conversationPercent}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Documents */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <span>{t('documents')}</span>
                        </div>
                        <span className="font-medium">
                            {isUnlimited(subscription.maxDocuments, 'document')
                                ? <><span>{currentUsage.documents}</span> <span className="text-green-600">({t('unlimited')})</span></>
                                : `${currentUsage.documents} / ${subscription.maxDocuments}`
                            }
                        </span>
                    </div>
                    {!isUnlimited(subscription.maxDocuments, 'document') && (
                        <div className="relative">
                            <Progress value={documentPercent} className="h-2" />
                            <div
                                className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getProgressColor(documentPercent)}`}
                                style={{ width: `${documentPercent}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* Upgrade Button */}
                {(hasAnyWarning || subscription.planType === 'free') && (
                    <Link href={`/${locale}/dashboard/pricing`} className="block mt-4">
                        <Button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                            <Zap className="mr-2 h-4 w-4" />
                            {t('upgrade')}
                        </Button>
                    </Link>
                )}
            </CardContent>
        </Card>
    )
}
