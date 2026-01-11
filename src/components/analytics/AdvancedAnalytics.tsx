'use client'

import { useState, useEffect, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    TrendingUp, Users, MessageSquare,
    ArrowUpRight, ArrowDownRight, Clock, Star,
    Download, Calendar, Globe, Zap, Target
} from "lucide-react"
import toast from 'react-hot-toast'

interface AdvancedAnalyticsProps {
    chatbotId: string
    locale: string
    data: {
        totalConversations: number
        totalMessages: number
        avgRating: string
        avgResponseTime: number
        uniqueVisitors: number
        resolutionRate: number
        topQueries: { query: string; count: number }[]
        // Raw timestamps for client-side local time calculation
        conversationTimestamps?: string[]
        // Fallback for missing raw data
        dailyData?: { date: string; conversations: number; messages: number }[]
        hourlyData?: { hour: number; count: number }[]
        peakHour?: number
        geographyData: { country: string; count: number }[]
    }
}

export function AdvancedAnalytics({ chatbotId, locale, data }: AdvancedAnalyticsProps) {
    const t = useTranslations('advancedAnalytics')
    const [dateRange, setDateRange] = useState('30d')
    const [isExporting, setIsExporting] = useState(false)
    const [clientStats, setClientStats] = useState<{
        dailyData: { date: string; conversations: number; messages: number }[];
        hourlyData: { hour: number; count: number }[];
        peakHour: number;
    }>({
        dailyData: data.dailyData || [],
        hourlyData: data.hourlyData || [],
        peakHour: data.peakHour || 0
    })

    // Local Time Calculation
    useEffect(() => {
        if (!data.conversationTimestamps) return;

        const timestamps = data.conversationTimestamps.map(ts => new Date(ts));
        const now = new Date();
        const hourCounts = new Array(24).fill(0);

        // Filter by date range
        let daysToLookBack = 30;
        if (dateRange === '7d') daysToLookBack = 7;
        if (dateRange === '90d') daysToLookBack = 90;
        if (dateRange === 'year') daysToLookBack = 365;

        const startDate = new Date();
        startDate.setDate(startDate.getDate() - daysToLookBack);

        const filteredTimestamps = timestamps.filter(d => d >= startDate);

        // Calculate Hourly Distribution (Local Time)
        filteredTimestamps.forEach(date => {
            const hour = date.getHours(); // Browser's local time
            hourCounts[hour]++;
        });

        const newHourlyData = hourCounts.map((count, hour) => ({ hour, count }));
        const newPeakHour = hourCounts.indexOf(Math.max(...hourCounts));

        // Calculate Daily Trend (Local Time)
        const dailyCounts = new Map<string, number>();
        // Initialize last N days with 0
        for (let i = 0; i < daysToLookBack; i++) {
            const d = new Date();
            d.setDate(d.getDate() - (daysToLookBack - 1 - i));
            const key = d.toLocaleDateString('en-CA'); // YYYY-MM-DD
            dailyCounts.set(key, 0);
        }

        filteredTimestamps.forEach(date => {
            const key = date.toLocaleDateString('en-CA');
            if (dailyCounts.has(key)) {
                dailyCounts.set(key, (dailyCounts.get(key) || 0) + 1);
            }
        });

        const newDailyData = Array.from(dailyCounts.entries()).map(([dateStr, count]) => ({
            date: dateStr,
            conversations: count,
            messages: count * 4 // Mock estimate
        }));

        setClientStats({
            dailyData: newDailyData,
            hourlyData: newHourlyData,
            peakHour: newPeakHour
        });

    }, [data.conversationTimestamps, dateRange]);

    const handleExport = async (format: 'csv' | 'excel') => {
        setIsExporting(true)
        try {
            const response = await fetch(`/api/analytics/export?chatbotId=${chatbotId}&format=${format}&range=${dateRange}`)
            if (!response.ok) throw new Error('Export failed')

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `analytics-${chatbotId}-${dateRange}.${format === 'excel' ? 'xlsx' : 'csv'}`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            a.remove()

            toast.success(t('exportSuccess'))
        } catch (error) {
            toast.error(t('exportError'))
        } finally {
            setIsExporting(false)
        }
    }

    const stats = [
        {
            title: t('totalConversations'),
            value: data.totalConversations.toLocaleString(),
            change: "+12%",
            trend: "up",
            icon: MessageSquare,
            color: "text-blue-600",
            bg: "bg-blue-100"
        },
        {
            title: t('uniqueVisitors'),
            value: data.uniqueVisitors.toLocaleString(),
            change: "+8%",
            trend: "up",
            icon: Users,
            color: "text-purple-600",
            bg: "bg-purple-100"
        },
        {
            title: t('resolutionRate'),
            value: `${data.resolutionRate}%`,
            change: "+3%",
            trend: "up",
            icon: Target,
            color: "text-green-600",
            bg: "bg-green-100"
        },
        {
            title: t('avgResponseTime'),
            value: `${data.avgResponseTime}s`,
            change: "-0.2s",
            trend: "down",
            icon: Clock,
            color: "text-amber-600",
            bg: "bg-amber-100"
        },
        {
            title: t('avgRating'),
            value: data.avgRating,
            change: "+0.2",
            trend: "up",
            icon: Star,
            color: "text-yellow-600",
            bg: "bg-yellow-100"
        },
        {
            title: t('peakHour'),
            value: `${clientStats.peakHour}:00`,
            change: "",
            trend: "neutral",
            icon: Zap,
            color: "text-rose-600",
            bg: "bg-rose-100"
        }
    ]

    const maxDailyConversations = Math.max(...clientStats.dailyData.map(d => d.conversations)) || 1
    const maxHourlyCount = Math.max(...clientStats.hourlyData.map(d => d.count)) || 1

    return (
        <div className="space-y-6">
            {/* Header with Date Range and Export */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">{t('title')}</h2>
                    <p className="text-slate-500">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <Select value={dateRange} onValueChange={setDateRange}>
                        <SelectTrigger className="w-[140px]">
                            <Calendar className="w-4 h-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="7d">{t('last7Days')}</SelectItem>
                            <SelectItem value="30d">{t('last30Days')}</SelectItem>
                            <SelectItem value="90d">{t('last90Days')}</SelectItem>
                            <SelectItem value="year">{t('lastYear')}</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() => handleExport('csv')}
                        disabled={isExporting}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        {isExporting ? t('exporting') : 'CSV'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleExport('excel')}
                        disabled={isExporting}
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Excel
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {stats.map((stat, index) => (
                    <Card key={index} className="hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-slate-500">
                                {stat.title}
                            </CardTitle>
                            <div className={`p-1.5 rounded-full ${stat.bg}`}>
                                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
                            {stat.change && (
                                <div className="flex items-center gap-1 mt-1">
                                    {stat.trend === "up" ? (
                                        <ArrowUpRight className="h-3 w-3 text-green-600" />
                                    ) : stat.trend === "down" ? (
                                        <ArrowDownRight className="h-3 w-3 text-green-600" />
                                    ) : null}
                                    <span className="text-xs text-green-600 font-medium">
                                        {stat.change}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Daily Trend Chart */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            {t('dailyTrend')}
                        </CardTitle>
                        <CardDescription>{t('dailyTrendDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-end justify-between gap-1">
                            {clientStats.dailyData.map((day, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
                                    <div className="w-full flex flex-col items-center gap-0.5">
                                        <div
                                            className="w-full bg-blue-500 rounded-t-sm hover:bg-blue-600 transition-all relative"
                                            style={{
                                                height: `${(day.conversations / maxDailyConversations) * 150}px`,
                                                minHeight: '4px'
                                            }}
                                        >
                                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                {day.conversations} {t('conversations')}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-slate-400">
                                        {new Date(day.date).toLocaleDateString(locale, { day: 'numeric' })}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Hourly Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-purple-600" />
                            {t('hourlyDistribution')}
                        </CardTitle>
                        <CardDescription>{t('hourlyDistributionDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[200px] flex items-end justify-between gap-0.5">
                            {clientStats.hourlyData.map((hour, i) => (
                                <div key={i} className="flex flex-col items-center gap-1 flex-1 group">
                                    <div
                                        className="w-full bg-purple-500 rounded-t-sm hover:bg-purple-600 transition-all relative"
                                        style={{
                                            height: `${(hour.count / maxHourlyCount) * 150}px`,
                                            minHeight: '2px'
                                        }}
                                    >
                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                            {hour.count}
                                        </div>
                                    </div>
                                    {i % 4 === 0 && (
                                        <span className="text-[10px] text-slate-400">{hour.hour}:00</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Top Queries */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-green-600" />
                            {t('topQueries')}
                        </CardTitle>
                        <CardDescription>{t('topQueriesDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.topQueries.length > 0 ? (
                                data.topQueries.slice(0, 8).map((query, i) => (
                                    <div key={i} className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-medium text-slate-400 w-6">
                                                #{i + 1}
                                            </span>
                                            <span className="text-sm text-slate-700 truncate max-w-[250px]">
                                                {query.query}
                                            </span>
                                        </div>
                                        <Badge variant="secondary">{query.count}x</Badge>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    {t('noData')}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Geography */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="w-5 h-5 text-amber-600" />
                            {t('geography')}
                        </CardTitle>
                        <CardDescription>{t('geographyDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {data.geographyData.length > 0 ? (
                                data.geographyData.slice(0, 6).map((geo, i) => {
                                    const maxGeo = data.geographyData[0]?.count || 1
                                    const percentage = (geo.count / maxGeo) * 100
                                    return (
                                        <div key={i} className="space-y-1">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-slate-700">{geo.country}</span>
                                                <span className="text-slate-500">{geo.count}</span>
                                            </div>
                                            <div className="w-full bg-slate-100 rounded-full h-2">
                                                <div
                                                    className="bg-amber-500 h-2 rounded-full transition-all"
                                                    style={{ width: `${percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <p className="text-sm text-slate-500 text-center py-4">
                                    {t('noData')}
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
