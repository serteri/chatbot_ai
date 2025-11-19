'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Loader2, RefreshCw, Database, Calendar, Trash2, BarChart3, Shield, Timer } from 'lucide-react'
import { toast } from 'sonner'

interface ScholarshipStats {
    total: number
    expired: number
    urgentlyExpiring: number
    upcomingSoon: number
    needsUpdate: boolean
    topCountries: { country: string; count: number }[]
}

export default function ScholarshipAdminPage() {
    // 🔒 AUTHENTICATION STATE
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(false)

    // EXISTING STATE
    const [stats, setStats] = useState<ScholarshipStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [updating, setUpdating] = useState(false)
    const [cooldown, setCooldown] = useState(0)
    const [lastUpdateTime, setLastUpdateTime] = useState(0)

    // 🔒 AUTH CHECK WITH API CALL
    const checkAuth = async () => {
        setAuthLoading(true)

        try {
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password })
            })

            const data = await response.json()

            if (data.success) {
                setAuthenticated(true)
                await fetchStats()
                toast.success('🔓 Admin panel erişimi sağlandı')
            } else {
                toast.error('❌ Yanlış şifre')
            }
        } catch (error) {
            toast.error('❌ Bağlantı hatası')
        } finally {
            setAuthLoading(false)
        }
    }

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        checkAuth()
    }

    const fetchStats = async () => {
        try {
            const response = await fetch('/api/admin/scholarship-update')
            const data = await response.json()

            if (data.success) {
                setStats(data.stats)
            } else {
                toast.error('Stats yüklenemedi')
            }
        } catch (error) {
            toast.error('Bağlantı hatası')
        } finally {
            setLoading(false)
        }
    }

    // ✅ UPDATED runManualUpdate WITH FORCE REFRESH TRIGGER
    const runManualUpdate = async () => {
        setUpdating(true)

        try {
            const response = await fetch('/api/admin/scholarship-update', {
                method: 'POST'
            })
            const data = await response.json()

            if (data.success) {
                toast.success(`✅ Update Tamamlandı! 
                🗑️ ${data.stats.expiredDeleted} expired silindi
                📅 ${data.stats.deadlinesUpdated} deadline güncellendi`)

                // ✅ TRIGGER FRONTEND REFRESH
                // Broadcast to all scholarship pages to refresh
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('scholarshipUpdate', {
                        detail: {
                            deleted: data.stats.expiredDeleted,
                            updated: data.stats.deadlinesUpdated,
                            timestamp: new Date().toISOString()
                        }
                    }))

                    console.log('📡 Broadcast scholarship update event to frontend pages')
                }

                setLastUpdateTime(Date.now())
                await fetchStats()

            } else if (response.status === 429) {
                toast.error(`⏰ Çok hızlı! ${data.cooldown} saniye bekleyin.`)
                setCooldown(data.cooldown)

                const timer = setInterval(() => {
                    setCooldown(prev => {
                        if (prev <= 1) {
                            clearInterval(timer)
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)

            } else {
                toast.error('Update başarısız: ' + data.error)
            }

        } catch (error) {
            toast.error('Update hatası: ' + error.message)
        } finally {
            setUpdating(false)
        }
    }

    // 🔒 AUTH SCREEN
    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <CardTitle className="text-2xl">Admin Panel Erişimi</CardTitle>
                        <CardDescription>
                            Scholarship database yönetimine erişim için şifre gerekli
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="password">Admin Şifresi</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Admin şifresini girin"
                                    required
                                />
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={authLoading}
                            >
                                {authLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Kontrol Ediliyor...
                                    </>
                                ) : (
                                    <>
                                        <Shield className="mr-2 h-4 w-4" />
                                        Admin Panel'e Gir
                                    </>
                                )}
                            </Button>
                        </form>

                        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                            <p className="font-medium">🔐 Güvenli Erişim</p>
                            <p>Şifre .env dosyasından okunmaktadır</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        )
    }

    if (loading) {
        return (
            <div className="container mx-auto p-6">
                <div className="flex justify-center items-center min-h-[400px]">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </div>
        )
    }

    // 🔓 AUTHENTICATED ADMIN PANEL
    return (
        <div className="container mx-auto p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Scholarship Database Admin</h1>
                    <p className="text-gray-600">🔓 Authenticated as Admin</p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={fetchStats} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh Stats
                    </Button>
                    <Button
                        onClick={() => setAuthenticated(false)}
                        variant="outline"
                        size="sm"
                    >
                        🔒 Logout
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Active</CardTitle>
                        <Database className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.total || 0}</div>
                        <p className="text-xs text-muted-foreground">Aktif burslar</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Süresi Geçmiş</CardTitle>
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{stats?.expired || 0}</div>
                        <p className="text-xs text-muted-foreground">Silinmeli</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">30 Gün İçinde</CardTitle>
                        <Calendar className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{stats?.upcomingSoon || 0}</div>
                        <p className="text-xs text-muted-foreground">Yakında bitiyor</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Update Gerek?</CardTitle>
                        <BarChart3 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats?.needsUpdate ?
                                <Badge variant="destructive">EVET</Badge> :
                                <Badge variant="default">HAYIR</Badge>
                            }
                        </div>
                        <p className="text-xs text-muted-foreground">Sistem durumu</p>
                    </CardContent>
                </Card>
            </div>

            {/* Action Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle>🔧 Manual Database Update</CardTitle>
                    <CardDescription>
                        Süresi geçmiş bursları sil ve yeni deadlinelar ekle
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-center">
                        <Button
                            onClick={runManualUpdate}
                            disabled={updating || cooldown > 0}
                            className="flex items-center gap-2"
                        >
                            {updating ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Updating...
                                </>
                            ) : cooldown > 0 ? (
                                <>
                                    <Timer className="w-4 h-4" />
                                    Bekleyin ({cooldown}s)
                                </>
                            ) : (
                                <>
                                    <RefreshCw className="w-4 h-4" />
                                    SMART Update Database
                                </>
                            )}
                        </Button>

                        {stats?.needsUpdate && (
                            <Badge variant="destructive" className="flex items-center">
                                🚨 Update Gerekli!
                            </Badge>
                        )}

                        {cooldown > 0 && (
                            <Badge variant="outline" className="flex items-center">
                                ⏰ {cooldown} saniye bekleniyor...
                            </Badge>
                        )}
                    </div>

                    <div className="text-sm text-gray-600">
                        <p>📋 OPTIMIZED İşlem (30s cooldown):</p>
                        <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                            <li>🗑️ Süresi geçmiş bursları siler (deadline &lt; now)</li>
                            <li>📅 Acil olanları günceller (30 gün içinde bitenler)</li>
                            <li>🎯 Maksimum 75 update per run (overload önleme)</li>
                            <li>⏱️ 30 saniye bekleme süresi (spam önleme)</li>
                            <li>📡 Frontend auto-refresh trigger</li>
                            <li>📊 Database istatistiklerini yeniler</li>
                        </ul>
                    </div>
                </CardContent>
            </Card>

            {/* Top Countries */}
            {stats?.topCountries && (
                <Card>
                    <CardHeader>
                        <CardTitle>🌍 En Çok Burs Olan Ülkeler</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {stats.topCountries.map((country, index) => (
                                <div key={country.country} className="text-center">
                                    <div className="text-lg font-bold text-blue-600">
                                        {country.count}
                                    </div>
                                    <div className="text-sm text-gray-600 truncate">
                                        {country.country}
                                    </div>
                                    <Badge variant="outline" className="text-xs">
                                        #{index + 1}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}