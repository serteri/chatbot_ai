'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2, Shield, GraduationCap, ArrowRight, Settings, Users, FolderOpen, Briefcase } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminDashboardPage() {
    // 🔒 AUTHENTICATION STATE
    const [authenticated, setAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [authLoading, setAuthLoading] = useState(false)
    const router = useRouter()

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

    // 🔒 AUTH SCREEN
    if (!authenticated) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <Shield className="mx-auto h-12 w-12 text-blue-600 mb-4" />
                        <CardTitle className="text-2xl">Admin Panel</CardTitle>
                        <CardDescription>
                            Yönetici paneline erişmek için şifre giriniz
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <Label htmlFor="password">Güvenlik Şifresi</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
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
                                        Giriş Yap
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    // 🔓 DASHBOARD
    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="container mx-auto max-w-5xl">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-600">Sistem yönetimi ve araçlar</p>
                    </div>
                    <Button variant="outline" onClick={() => setAuthenticated(false)}>
                        Çıkış Yap
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Scholarships Module */}
                    <Card className="hover:shadow-lg transition-shadow border-blue-100">
                        <CardHeader>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 text-blue-600">
                                <GraduationCap className="h-6 w-6" />
                            </div>
                            <CardTitle>Burs Yönetimi</CardTitle>
                            <CardDescription>
                                Burs veritabanını güncelle, süresi geçenleri temizle
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/tr/admin/scholarships">
                                <Button className="w-full">
                                    Yönetim Paneline Git <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Job Postings Module */}
                    <Card className="hover:shadow-lg transition-shadow border-green-100">
                        <CardHeader>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 text-green-600">
                                <Briefcase className="h-6 w-6" />
                            </div>
                            <CardTitle>İş İlanları</CardTitle>
                            <CardDescription>
                                Kariyer sayfası için iş ilanları oluştur ve yönet
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Link href="/tr/admin/jobs">
                                <Button className="w-full bg-green-600 hover:bg-green-700">
                                    İlanları Yönet <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    {/* Placeholder Modules */}
                    <Card className="opacity-60">
                        <CardHeader>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-600">
                                <Users className="h-6 w-6" />
                            </div>
                            <CardTitle>Kullanıcılar</CardTitle>
                            <CardDescription>
                                Kullanıcı yönetimi (Yakında)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full" disabled>
                                Yakında
                            </Button>
                        </CardContent>
                    </Card>

                    <Card className="opacity-60">
                        <CardHeader>
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 text-gray-600">
                                <FolderOpen className="h-6 w-6" />
                            </div>
                            <CardTitle>İçerik Yönetimi</CardTitle>
                            <CardDescription>
                                Blog ve sayfa içerikleri (Yakında)
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button variant="outline" className="w-full" disabled>
                                Yakında
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
