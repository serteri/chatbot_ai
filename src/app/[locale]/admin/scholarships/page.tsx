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

interface ExpiredScholarship {
    id: string
    title: string
    provider: string
    country: string
    deadline: string
    amount: string
    currency: string
    expiredSince: number
    deadlineFormatted: string
}

interface ExpiredPagination {
    page: number
    limit: number
    total: number
    totalPages: number
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

    // EXPIRED SCHOLARSHIPS STATE
    const [expiredList, setExpiredList] = useState<ExpiredScholarship[]>([])
    const [expiredPagination, setExpiredPagination] = useState<ExpiredPagination | null>(null)
    const [loadingExpired, setLoadingExpired] = useState(false)
    const [showExpiredList, setShowExpiredList] = useState(false)
    const [deletingAll, setDeletingAll] = useState(false)
    const [updatingAll, setUpdatingAll] = useState(false)
    const [actionInProgress, setActionInProgress] = useState<string | null>(null)

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

    // Fetch expired scholarships list
    const fetchExpiredList = async (page = 1) => {
        setLoadingExpired(true)
        try {
            const response = await fetch(`/api/admin/scholarship-expired?page=${page}&limit=20`)
            const data = await response.json()

            if (data.success) {
                setExpiredList(data.scholarships)
                setExpiredPagination(data.pagination)
            } else {
                toast.error('Süresi geçmiş burslar yüklenemedi')
            }
        } catch (error) {
            toast.error('Bağlantı hatası')
        } finally {
            setLoadingExpired(false)
        }
    }

    // Delete single expired scholarship
    const deleteExpired = async (id: string) => {
        setActionInProgress(id)
        try {
            const response = await fetch(`/api/admin/scholarship-expired?id=${id}`, {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                toast.success('Burs silindi')
                setExpiredList(prev => prev.filter(s => s.id !== id))
                await fetchStats()
            } else {
                toast.error('Silme başarısız: ' + data.error)
            }
        } catch (error) {
            toast.error('Silme hatası')
        } finally {
            setActionInProgress(null)
        }
    }

    // Refresh single expired scholarship deadline
    const refreshExpired = async (id: string) => {
        setActionInProgress(id)
        try {
            const response = await fetch(`/api/admin/scholarship-expired?id=${id}`, {
                method: 'PATCH'
            })
            const data = await response.json()

            if (data.success) {
                toast.success(`Deadline güncellendi: ${data.scholarship.newDeadline.split('T')[0]}`)
                setExpiredList(prev => prev.filter(s => s.id !== id))
                await fetchStats()
            } else {
                toast.error('Güncelleme başarısız: ' + data.error)
            }
        } catch (error) {
            toast.error('Güncelleme hatası')
        } finally {
            setActionInProgress(null)
        }
    }

    // Delete ALL expired scholarships
    const deleteAllExpired = async () => {
        if (!confirm(`${stats?.expired || 0} süresi geçmiş bursu silmek istediğinize emin misiniz?`)) {
            return
        }

        setDeletingAll(true)
        try {
            const response = await fetch('/api/admin/scholarship-expired', {
                method: 'DELETE'
            })
            const data = await response.json()

            if (data.success) {
                toast.success(`✅ ${data.deletedCount} süresi geçmiş burs silindi`)
                setExpiredList([])
                await fetchStats()
            } else {
                toast.error('Toplu silme başarısız: ' + data.error)
            }
        } catch (error) {
            toast.error('Toplu silme hatası')
        } finally {
            setDeletingAll(false)
        }
    }

    // Update ALL expired scholarships with new deadlines
    const updateAllExpired = async () => {
        if (!confirm(`${stats?.expired || 0} süresi geçmiş bursun deadline'ını güncellemek istediğinize emin misiniz?`)) {
            return
        }

        setUpdatingAll(true)
        try {
            const response = await fetch('/api/admin/scholarship-expired', {
                method: 'PATCH'
            })
            const data = await response.json()

            if (data.success) {
                toast.success(`✅ ${data.updatedCount} burs güncellendi (yeni deadline'lar eklendi)`)
                setExpiredList([])
                await fetchStats()
            } else {
                toast.error('Toplu güncelleme başarısız: ' + data.error)
            }
        } catch (error) {
            toast.error('Toplu güncelleme hatası')
        } finally {
            setUpdatingAll(false)
        }
    }

    // Toggle expired list view
    const toggleExpiredList = () => {
        if (!showExpiredList) {
            fetchExpiredList(1)
        }
        setShowExpiredList(!showExpiredList)
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

            {/* Expired Scholarships Management */}
            <Card className="border-red-200">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Trash2 className="h-5 w-5 text-red-500" />
                        Süresi Geçmiş Bursları Yönet
                    </CardTitle>
                    <CardDescription>
                        Süresi geçmiş {stats?.expired || 0} burs var. Bunları silebilir veya deadline'larını güncelleyebilirsiniz.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-3">
                        <Button
                            variant="outline"
                            onClick={toggleExpiredList}
                            disabled={loadingExpired}
                        >
                            {loadingExpired ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Database className="w-4 h-4 mr-2" />
                            )}
                            {showExpiredList ? 'Listeyi Gizle' : 'Süresi Geçmişleri Listele'}
                        </Button>

                        <Button
                            variant="destructive"
                            onClick={deleteAllExpired}
                            disabled={deletingAll || !stats?.expired}
                        >
                            {deletingAll ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Trash2 className="w-4 h-4 mr-2" />
                            )}
                            Tümünü Sil ({stats?.expired || 0})
                        </Button>

                        <Button
                            variant="default"
                            onClick={updateAllExpired}
                            disabled={updatingAll || !stats?.expired}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {updatingAll ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Tümünü Yenile ({stats?.expired || 0})
                        </Button>
                    </div>

                    {/* Expired Scholarships List */}
                    {showExpiredList && (
                        <div className="mt-4 border rounded-lg overflow-hidden">
                            {loadingExpired ? (
                                <div className="p-8 text-center">
                                    <Loader2 className="w-8 h-8 animate-spin mx-auto" />
                                    <p className="mt-2 text-gray-500">Yükleniyor...</p>
                                </div>
                            ) : expiredList.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    ✅ Süresi geçmiş burs yok
                                </div>
                            ) : (
                                <>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium">Burs Adı</th>
                                                    <th className="px-4 py-3 text-left font-medium">Ülke</th>
                                                    <th className="px-4 py-3 text-left font-medium">Deadline</th>
                                                    <th className="px-4 py-3 text-left font-medium">Geçen Süre</th>
                                                    <th className="px-4 py-3 text-center font-medium">İşlemler</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                {expiredList.map((scholarship) => (
                                                    <tr key={scholarship.id} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3">
                                                            <div className="font-medium truncate max-w-[200px]">
                                                                {scholarship.title}
                                                            </div>
                                                            <div className="text-xs text-gray-500">
                                                                {scholarship.provider}
                                                            </div>
                                                        </td>
                                                        <td className="px-4 py-3">{scholarship.country}</td>
                                                        <td className="px-4 py-3">
                                                            <span className="text-red-600">
                                                                {scholarship.deadlineFormatted}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant="destructive">
                                                                {scholarship.expiredSince} gün önce
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <div className="flex justify-center gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => refreshExpired(scholarship.id)}
                                                                    disabled={actionInProgress === scholarship.id}
                                                                    className="text-green-600 hover:text-green-700"
                                                                >
                                                                    {actionInProgress === scholarship.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <RefreshCw className="w-3 h-3" />
                                                                    )}
                                                                </Button>
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    onClick={() => deleteExpired(scholarship.id)}
                                                                    disabled={actionInProgress === scholarship.id}
                                                                    className="text-red-600 hover:text-red-700"
                                                                >
                                                                    {actionInProgress === scholarship.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : (
                                                                        <Trash2 className="w-3 h-3" />
                                                                    )}
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    {expiredPagination && expiredPagination.totalPages > 1 && (
                                        <div className="flex justify-between items-center p-4 border-t bg-gray-50">
                                            <div className="text-sm text-gray-500">
                                                Sayfa {expiredPagination.page} / {expiredPagination.totalPages}
                                                {' '}({expiredPagination.total} toplam)
                                            </div>
                                            <div className="flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={expiredPagination.page <= 1}
                                                    onClick={() => fetchExpiredList(expiredPagination.page - 1)}
                                                >
                                                    Önceki
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    disabled={expiredPagination.page >= expiredPagination.totalPages}
                                                    onClick={() => fetchExpiredList(expiredPagination.page + 1)}
                                                >
                                                    Sonraki
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Action Buttons */}
            <Card>
                <CardHeader>
                    <CardTitle>🔧 Manual Database Update v2</CardTitle>
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