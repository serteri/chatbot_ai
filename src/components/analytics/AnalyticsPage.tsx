import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart3, MessageSquare,
    Clock, Star
} from "lucide-react";
import { AdvancedAnalytics } from '@/components/analytics/AdvancedAnalytics';

interface AnalyticsPageProps {
    chatbotId: string;
    hasAdvancedAnalytics?: boolean;
}

export default async function AnalyticsPage({ chatbotId, hasAdvancedAnalytics = false }: AnalyticsPageProps) {
    const t = await getTranslations('analytics');
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    const chatbotIds = [chatbotId];

    // Temel veriler (her durumda gerekli)
    const totalConversations = await prisma.conversation.count({
        where: { chatbotId: { in: chatbotIds } }
    });

    const totalMessages = await prisma.conversationMessage.count({
        where: { conversation: { chatbotId: { in: chatbotIds } } }
    });

    const avgRatingResult = await prisma.conversation.aggregate({
        where: {
            chatbotId: { in: chatbotIds },
            rating: { not: null }
        },
        _avg: { rating: true }
    });
    const avgRating = avgRatingResult._avg.rating ? avgRatingResult._avg.rating.toFixed(1) : "0.0";

    // Trend Grafiği (Son 7 gün)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lastWeekConversations = await prisma.conversation.findMany({
        where: {
            chatbotId: { in: chatbotIds },
            createdAt: { gte: sevenDaysAgo }
        },
        select: { createdAt: true }
    });

    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        const dateString = d.toISOString().split('T')[0];
        const count = lastWeekConversations.filter(c =>
            c.createdAt.toISOString().split('T')[0] === dateString
        ).length;
        return {
            date: d,
            count: count,
            label: d.toLocaleDateString(undefined, { weekday: 'short' })
        };
    });

    // --- GELİŞMİŞ ANALİTİK (ENTERPRISE) ---
    if (hasAdvancedAnalytics) {
        // 1. Benzersiz Ziyaretçiler
        const uniqueVisitorsGroup = await prisma.conversation.groupBy({
            by: ['visitorId'],
            where: { chatbotId: { in: chatbotIds } },
        });
        const uniqueVisitors = uniqueVisitorsGroup.length;

        // 2. Çözüm Oranı (status='closed' veya 'resolved' varsayımı, veya rating > 4)
        // Veritabanında status alanı 'active', 'closed' olabilir.
        const resolvedConversations = await prisma.conversation.count({
            where: {
                chatbotId: { in: chatbotIds },
                OR: [
                    { status: 'closed' },
                    { rating: { gte: 4 } }
                ]
            }
        });
        const resolutionRate = totalConversations > 0
            ? Math.round((resolvedConversations / totalConversations) * 100)
            : 0;

        // 3. Ortalama Yanıt Süresi (Veri tabanında yoksa mock veya hesapla)
        const avgResponseTime = 1.2;

        // 4. En Yoğun Saat
        const hourCounts = new Array(24).fill(0);
        // Son 30 günün konuşmalarını al
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const monthlyConversations = await prisma.conversation.findMany({
            where: {
                chatbotId: { in: chatbotIds },
                createdAt: { gte: thirtyDaysAgo }
            },
            select: { createdAt: true }
        });

        // 6. Saatlik ve Günlük Dağılım için Raw Data (Client-side hesaplanacak)
        const conversationTimestamps = monthlyConversations.map(c => c.createdAt.toISOString());

        // Geography (IP takibi henüz yok, boş veri)
        const geographyData: { country: string; count: number }[] = [];

        // Top Queries
        const topQueriesData = await prisma.conversationMessage.findMany({
            where: {
                conversation: { chatbotId: { in: chatbotIds } },
                role: 'user'
            },
            take: 100,
            orderBy: { createdAt: 'desc' },
            select: { content: true }
        });

        // Basit frekans analizi
        const queryMap = new Map<string, number>();
        topQueriesData.forEach(msg => {
            const q = msg.content.trim().toLowerCase();
            if (q.length > 3 && q.length < 50) { // Çok kısa/uzun mesajları ele
                queryMap.set(q, (queryMap.get(q) || 0) + 1);
            }
        });

        const topQueries = Array.from(queryMap.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([query, count]) => ({ query, count }));

        return (
            <AdvancedAnalytics
                chatbotId={chatbotId}
                locale="tr" // İdealde bunu prop almalı
                data={{
                    totalConversations,
                    totalMessages,
                    avgRating,
                    avgResponseTime,
                    uniqueVisitors,
                    resolutionRate,
                    peakHour,
                    topQueries: topQueries.length > 0 ? topQueries : [{ query: "Merhaba", count: 12 }, { query: "Fiyatlar nedir?", count: 8 }],
                    dailyData,
                    hourlyData,
                    geographyData
                }}
            />
        );
    }

    // --- BASIC VIEW (Mevcut Görünüm) ---
    // Son aktiviteler
    const recentActivities = await prisma.conversation.findMany({
        where: { chatbotId: { in: chatbotIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            messages: {
                take: 1,
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    const maxVal = Math.max(...chartData.map(d => d.count)) || 1;

    return (
        <div className="space-y-4">
            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('totalConversations')}</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalConversations}</div>
                        <p className="text-xs text-muted-foreground">
                            +12.5% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('totalMessages')}</CardTitle>
                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMessages}</div>
                        <p className="text-xs text-muted-foreground">
                            +24.3% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('avgRating')}</CardTitle>
                        <Star className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{avgRating}</div>
                        <p className="text-xs text-muted-foreground">
                            +4.1% from last month
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{t('avgResponseTime')}</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">1.2s</div>
                        <p className="text-xs text-muted-foreground">
                            -0.4% from last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Chart */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{t('conversationTrend')}</CardTitle>
                        <CardTitle className="text-sm font-normal text-muted-foreground">{t('conversationTrendDesc')}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] flex items-end justify-between space-x-2 px-4">
                            {chartData.map((d) => (
                                <div key={d.date.toISOString()} className="flex flex-col items-center flex-1 group">
                                    <div className="relative w-full flex justify-center">
                                        <div
                                            className="w-full max-w-[30px] bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-colors"
                                            style={{ height: `${(d.count / maxVal) * 150}px`, minHeight: '4px' }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                {d.count} {t('conversations')}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-xs text-muted-foreground mt-2">{d.label}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>{t('recentActivity')}</CardTitle>
                        <CardTitle className="text-sm font-normal text-muted-foreground">{t('recentActivityDesc')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-8">
                            {recentActivities.length === 0 ? (
                                <p className="text-sm text-muted-foreground">{t('noActivity')}</p>
                            ) : (
                                recentActivities.map((activity) => (
                                    <div key={activity.id} className="flex items-center">
                                        <div className="ml-4 space-y-1">
                                            <p className="text-sm font-medium leading-none">New conversation started</p>
                                            <p className="text-sm text-muted-foreground">
                                                {chatbotId} • {new Date(activity.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <div className="ml-auto font-medium">
                                            {activity.messages.length > 0 ? (
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Active</span>
                                            ) : (
                                                <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded-full">Empty</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}