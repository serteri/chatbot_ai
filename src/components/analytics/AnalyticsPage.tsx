import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db/prisma';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    BarChart3, TrendingUp, Users, MessageSquare,
    ArrowUpRight, ArrowDownRight, Clock, Star
} from "lucide-react";

interface AnalyticsPageProps {
    chatbotId: string;
}

export default async function AnalyticsPage({ chatbotId }: AnalyticsPageProps) {
    const t = await getTranslations('analytics');
    const session = await auth();

    if (!session?.user?.id) {
        redirect('/login');
    }

    // --- GERÇEK VERİLERİ ÇEKME ---
    // Sadece bu chatbot için veriler
    const chatbotIds = [chatbotId];

    // 2. Toplam Konuşma Sayısı
    const totalConversations = await prisma.conversation.count({
        where: { chatbotId: { in: chatbotIds } }
    });

    // 3. Toplam Mesaj Sayısı (Kullanıcı + Bot)
    const totalMessages = await prisma.conversationMessage.count({
        where: { conversation: { chatbotId: { in: chatbotIds } } }
    });

    // 4. Ortalama Puan (Rating)
    const avgRatingResult = await prisma.conversation.aggregate({
        where: {
            chatbotId: { in: chatbotIds },
            rating: { not: null }
        },
        _avg: { rating: true }
    });
    const avgRating = avgRatingResult._avg.rating ? avgRatingResult._avg.rating.toFixed(1) : "0.0";

    // --- TREND GRAFİĞİ (GERÇEK VERİ) ---
    // Son 7 günün verilerini çek ve grupla
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lastWeekConversations = await prisma.conversation.findMany({
        where: {
            chatbotId: { in: chatbotIds },
            createdAt: { gte: sevenDaysAgo }
        },
        select: { createdAt: true }
    });

    // Son 7 günü oluştur ve her gün için konuşma sayısını hesapla
    const chartData = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i)); // 6 gün önceden bugüne doğru
        const dateString = d.toISOString().split('T')[0]; // YYYY-MM-DD

        // O güne ait konuşmaları filtrele
        const count = lastWeekConversations.filter(c =>
            c.createdAt.toISOString().split('T')[0] === dateString
        ).length;

        return {
            date: d,
            count: count,
            label: d.toLocaleDateString(undefined, { weekday: 'short' }) // Pzt, Sal vb.
        };
    });

    const maxVal = Math.max(...chartData.map(d => d.count)) || 1; // 0'a bölünmeyi önle

    // --- SON AKTİVİTELER (GERÇEK VERİ) ---
    const recentActivities = await prisma.conversation.findMany({
        where: { chatbotId: { in: chatbotIds } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
            chatbot: { select: { name: true } }
        }
    });

    // --- İSTATİSTİK KARTLARI ---
    const stats = [
        {
            title: t('totalConversations'),
            value: totalConversations.toLocaleString(),
            change: "+12.5%", // Geçmiş ayla kıyaslama mantığı eklenebilir
            trend: "up",
            icon: MessageSquare,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: t('totalMessages'),
            value: totalMessages.toLocaleString(),
            change: "+24.3%",
            trend: "up",
            icon: BarChart3,
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
        {
            title: t('avgRating'),
            value: avgRating,
            change: "+4.1%",
            trend: "up",
            icon: Star,
            color: "text-yellow-600",
            bg: "bg-yellow-100"
        },
        {
            title: t('avgResponseTime'),
            value: "1.2s", // API yanıt süreleri loglanıyorsa buraya eklenebilir
            change: "-0.4%",
            trend: "down",
            icon: Clock,
            color: "text-green-600",
            bg: "bg-green-100"
        }
    ];

    return (
        <div className="container mx-auto py-10 max-w-7xl px-4 animate-in fade-in-50">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900">{t('title')}</h2>
                    <p className="text-slate-500 mt-1">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
                    <span className="text-sm font-medium text-slate-600 px-3 py-1 bg-slate-100 rounded-md">
                        {t('last30Days')}
                    </span>
                </div>
            </div>

            {/* İstatistik Kartları */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
                {stats.map((stat, index) => (
                    <Card key={index} className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-slate-600">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-2 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
                            <div className="flex items-center gap-1 mt-1">
                                {stat.trend === "up" ? (
                                    <ArrowUpRight className="h-4 w-4 text-green-600" />
                                ) : (
                                    <ArrowDownRight className="h-4 w-4 text-green-600" />
                                )}
                                <p className="text-xs text-green-600 font-medium">
                                    {stat.change} <span className="text-slate-400 font-normal">{t('fromLastMonth')}</span>
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Grafikler ve Detaylar */}
            <div className="grid gap-8 lg:grid-cols-7">

                {/* Sol Taraf: Büyük Grafik (CSS Bar Chart) */}
                <Card className="lg:col-span-4 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('conversationTrend')}</CardTitle>
                        <CardDescription>{t('trendDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full flex items-end justify-between gap-2 pt-4 px-2">
                            {chartData.map((data, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 w-full group">
                                    <div
                                        className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all relative group-hover:scale-y-105 origin-bottom"
                                        style={{ height: `${(data.count / maxVal) * 100}%`, minHeight: '4px' }}
                                    >
                                        {/* Tooltip */}
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {data.count} {t('conversations')}
                                        </div>
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">
                                        {data.label}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Sağ Taraf: Son Aktiviteler (Gerçek Veri) */}
                <Card className="lg:col-span-3 border-slate-200 shadow-sm">
                    <CardHeader>
                        <CardTitle>{t('recentActivity')}</CardTitle>
                        <CardDescription>{t('activityDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {recentActivities.length > 0 ? (
                                recentActivities.map((activity, i) => {
                                    // Zaman farkını hesapla (dk, saat, gün)
                                    const diffMs = Date.now() - new Date(activity.createdAt).getTime();
                                    const diffMins = Math.floor(diffMs / 60000);
                                    const diffHours = Math.floor(diffMins / 60);
                                    const diffDays = Math.floor(diffHours / 24);

                                    let timeString = `${diffMins} ${t('minutesAgo')}`;
                                    if (diffDays > 0) timeString = `${diffDays} gün önce`;
                                    else if (diffHours > 0) timeString = `${diffHours} saat önce`;

                                    return (
                                        <div key={activity.id} className="flex items-start gap-4">
                                            <div className="w-2 h-2 mt-2 rounded-full bg-green-500 flex-shrink-0 animate-pulse" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-medium text-slate-900 leading-none">
                                                    {t('newConversation')}
                                                </p>
                                                <p className="text-xs text-slate-500">
                                                    {/* Bot ismi ve zaman */}
                                                    <span className="font-semibold text-blue-600">{activity.chatbot.name}</span> • {timeString}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-8">
                                    <div className="p-3 bg-slate-100 rounded-full inline-flex mb-3">
                                        <MessageSquare className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-sm text-slate-500">
                                        {t('noActivity')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}