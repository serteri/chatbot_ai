'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MessageSquare, TrendingUp, Clock, FileText, Loader2 } from 'lucide-react'

interface AnalyticsData {
    overview: {
        totalConversations: number
        todayConversations: number
        totalMessages: number
        avgMessagesPerConversation: number
        avgConfidence: number
        documentUsageRate: number
    }
    charts: {
        daily: Array<{ date: string; conversations: number }>
        hourly: Array<{ hour: string; messages: number }>
    }
    topQueries: Array<{ query: string; count: number }>
    recentConversations: Array<{
        id: string
        visitorId: string
        status: string
        messageCount: number
        lastMessage: string
        createdAt: string
    }>
}

export default function AnalyticsPage({ chatbotId }: { chatbotId: string }) {
    const t = useTranslations()
    const [data, setData] = useState<AnalyticsData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAnalytics()
    }, [chatbotId])

    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`/api/chatbots/${chatbotId}/analytics`)
            if (response.ok) {
                const analytics = await response.json()
                setData(analytics)
            }
        } catch (error) {
            console.error('Analytics fetch error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        )
    }

    if (!data) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-center text-gray-600">{t('analytics.loadError')}</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{t('chatbots.analytics')}</h1>
                <p className="text-gray-600 mt-2">{t('analytics.subtitle')}</p>
            </div>

            {/* Overview Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('analytics.totalConversations')}</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.totalConversations}</div>
                        <p className="text-xs text-muted-foreground">
                            {t('analytics.today')}: {data.overview.todayConversations}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('analytics.totalMessages')}</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.totalMessages}</div>
                        <p className="text-xs text-muted-foreground">
                            {t('analytics.avg')} {data.overview.avgMessagesPerConversation} {t('analytics.messagesPerConv')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('analytics.confidenceScore')}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.avgConfidence}%</div>
                        <p className="text-xs text-muted-foreground">
                            {t('analytics.avgConfidence')}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('analytics.documentUsage')}</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.documentUsageRate}%</div>
                        <p className="text-xs text-muted-foreground">
                            {t('analytics.documentUsageDesc')}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2 mb-8">
                {/* Daily Conversations Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.last7Days')}</CardTitle>
                        <CardDescription>{t('analytics.dailyConversations')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={data.charts.daily}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(value) => {
                                        const date = new Date(value)
                                        return `${date.getDate()}/${date.getMonth() + 1}`
                                    }}
                                />
                                <YAxis />
                                <Tooltip
                                    labelFormatter={(value) => {
                                        const date = new Date(value as string)
                                        return date.toLocaleDateString()
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="conversations"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    name={t('analytics.conversation')}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Hourly Messages Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.hourlyDistribution')}</CardTitle>
                        <CardDescription>{t('analytics.todayMessages')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={data.charts.hourly}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="hour" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="messages" fill="#3b82f6" name={t('analytics.message')} />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Top Queries */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.topKeywords')}</CardTitle>
                        <CardDescription>{t('analytics.last30Days')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.topQueries.length === 0 ? (
                            <p className="text-sm text-gray-500">{t('analytics.noData')}</p>
                        ) : (
                            <div className="space-y-2">
                                {data.topQueries.map((query, index) => (
                                    <div key={index} className="flex items-center justify-between border-b pb-2">
                                        <span className="text-sm font-medium">{query.query}</span>
                                        <span className="text-sm text-gray-500">{query.count} {t('analytics.times')}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Conversations */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('analytics.recentConversations')}</CardTitle>
                        <CardDescription>{t('analytics.last10Conversations')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {data.recentConversations.length === 0 ? (
                            <p className="text-sm text-gray-500">{t('analytics.noConversations')}</p>
                        ) : (
                            <div className="space-y-3">
                                {data.recentConversations.map((conv) => (
                                    <div key={conv.id} className="border rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-xs font-medium text-gray-500">
                                                {conv.visitorId.substring(0, 12)}...
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded ${
                                                conv.status === 'active'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {conv.status === 'active' ? t('chatbots.active') : t('chatbots.inactive')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-700 mb-2">
                                            {conv.lastMessage}
                                        </p>
                                        <div className="flex items-center text-xs text-gray-500">
                                            <MessageSquare className="w-3 h-3 mr-1" />
                                            {conv.messageCount} {t('analytics.messages')}
                                            <Clock className="w-3 h-3 ml-3 mr-1" />
                                            {new Date(conv.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}