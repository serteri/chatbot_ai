'use client'

import { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { MessageSquare, Check, Eye, EyeOff, Loader2, AlertCircle, User, Mail, Lock, X } from 'lucide-react'
import { signIn } from 'next-auth/react'

export default function RegisterPage() {
    const router = useRouter()
    const params = useParams()
    const locale = (params?.locale as string) || 'tr'

    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showPasswordReqs, setShowPasswordReqs] = useState(false)
    const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({})
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    })

    // Password requirements check
    const passwordReqs = useMemo(() => {
        const password = formData.password
        return {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            number: /[0-9]/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        }
    }, [formData.password])

    const allReqsMet = Object.values(passwordReqs).every(Boolean)

    const validateForm = () => {
        const newErrors: typeof errors = {}

        if (!formData.name.trim()) {
            newErrors.name = t('register.errors.nameRequired')
        } else if (formData.name.trim().length < 2) {
            newErrors.name = t('register.errors.nameLength')
        }

        if (!formData.email.trim()) {
            newErrors.email = t('register.errors.emailRequired')
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = t('register.errors.emailInvalid')
        }

        if (!formData.password) {
            newErrors.password = t('register.errors.passwordRequired')
        } else if (!allReqsMet) {
            newErrors.password = t('register.errors.passwordRequirements')
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setErrors({})

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })

            const data = await response.json()

            if (!response.ok) {
                setErrors({ general: data.error || 'Kayıt sırasında bir hata oluştu' })
                return
            }

            // Auto login after registration
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (result?.ok) {
                router.push(`/${locale}/dashboard`)
            } else {
                router.push(`/${locale}/auth/login`)
            }
        } catch (error) {
            setErrors({ general: 'Bir hata oluştu. Lütfen tekrar deneyin.' })
        } finally {
            setIsLoading(false)
        }
    }

    const handleOAuthLogin = async (provider: 'google' | 'github' | 'azure-ad') => {
        setIsLoading(true)
        try {
            await signIn(provider, {
                callbackUrl: `/${locale}/dashboard`,
            })
        } catch (error) {
            setErrors({ general: `${provider} ile giriş yapılırken hata oluştu` })
            setIsLoading(false)
        }
    }

    const features = [
        'Sınırsız AI sohbet deneyimi',
        'Özel chatbot oluşturma',
        'Gerçek zamanlı analytics',
        '7/24 destek'
    ]

    return (
        <div className="min-h-screen flex">
            {/* Sol Panel - Özellikler */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-12 flex-col justify-between relative overflow-hidden">
                {/* Decorative circles */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative z-10">
                    <Link href={`/${locale}`} className="flex items-center gap-3 text-white mb-16">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                            <MessageSquare className="h-7 w-7" />
                        </div>
                        <span className="text-2xl font-bold">PylonChat</span>
                    </Link>

                    <h1 className="text-4xl font-bold text-white mb-6">
                        {t('branding.registerTitle')}
                    </h1>
                    <p className="text-blue-100 text-lg mb-12">
                        {t('branding.registerSubtitle')}
                    </p>

                    <div className="space-y-4">
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg">{t('branding.feature1')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg">{t('branding.feature2')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg">{t('branding.feature3')}</span>
                        </div>
                        <div className="flex items-center gap-3 text-white">
                            <div className="w-6 h-6 rounded-full bg-green-400 flex items-center justify-center">
                                <Check className="h-4 w-4 text-white" />
                            </div>
                            <span className="text-lg">{t('branding.feature4')}</span>
                        </div>
                    </div>
                </div>

                <p className="text-blue-200 text-sm relative z-10">
                    © 2024 PylonChat. Tüm hakları saklıdır.
                </p>
            </div>

            {/* Sağ Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                            <MessageSquare className="h-6 w-6 text-white" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">PylonChat</span>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">{t('register.title')}</h2>
                            <p className="text-gray-500 mt-2">{t('register.subtitle')}</p>
                        </div>

                        {/* OAuth Buttons */}
                        <div className="space-y-3 mb-6">
                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('google')}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google ile Kayıt Ol
                            </button>

                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('azure-ad')}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-300 hover:shadow-md transition-all disabled:opacity-50"
                            >
                                <svg className="h-5 w-5" viewBox="0 0 23 23">
                                    <path d="M11.4 0H0v11.4h11.4V0z" fill="#f35325" />
                                    <path d="M23 0H11.6v11.4H23V0z" fill="#81bc06" />
                                    <path d="M11.4 11.6H0V23h11.4V11.6z" fill="#05a6f0" />
                                    <path d="M23 11.6H11.6V23H23V11.6z" fill="#ffba08" />
                                </svg>
                                Microsoft ile Kayıt Ol
                            </button>

                            <button
                                type="button"
                                onClick={() => handleOAuthLogin('github')}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-gray-900 rounded-xl text-white font-medium hover:bg-gray-800 hover:shadow-md transition-all disabled:opacity-50"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                GitHub ile Kayıt Ol
                            </button>
                        </div>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-400">veya e-posta ile</span>
                            </div>
                        </div>

                        {/* General Error */}
                        {errors.general && (
                            <div className="mb-4 p-4 bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                                    <AlertCircle className="h-4 w-4 text-red-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-red-700 font-medium text-sm">Hata</p>
                                    <p className="text-red-600 text-sm">{errors.general}</p>
                                </div>
                                <button onClick={() => setErrors({})} className="text-red-400 hover:text-red-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <Label htmlFor="name" className="text-gray-700 font-medium">Ad Soyad</Label>
                                <div className="relative mt-1">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`pl-10 h-12 rounded-xl border-2 transition-all ${errors.name ? 'border-red-300 focus:border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-blue-500'}`}
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.name && (
                                    <div className="mt-2 flex items-center gap-2 text-red-500 text-sm animate-in slide-in-from-top-1 duration-200">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{errors.name}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="email" className="text-gray-700 font-medium">E-posta</Label>
                                <div className="relative mt-1">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="ornek@email.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`pl-10 h-12 rounded-xl border-2 transition-all ${errors.email ? 'border-red-300 focus:border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-blue-500'}`}
                                        disabled={isLoading}
                                    />
                                </div>
                                {errors.email && (
                                    <div className="mt-2 flex items-center gap-2 text-red-500 text-sm animate-in slide-in-from-top-1 duration-200">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{errors.email}</span>
                                    </div>
                                )}
                            </div>

                            <div>
                                <Label htmlFor="password" className="text-gray-700 font-medium">Şifre</Label>
                                <div className="relative mt-1">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        onFocus={() => setShowPasswordReqs(true)}
                                        className={`pl-10 pr-10 h-12 rounded-xl border-2 transition-all ${errors.password ? 'border-red-300 focus:border-red-500 bg-red-50/50' : 'border-gray-200 focus:border-blue-500'}`}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>

                                {/* Password Requirements */}
                                {showPasswordReqs && (
                                    <div className="mt-3 p-4 bg-gradient-to-br from-gray-50 to-blue-50/50 border border-gray-200 rounded-xl animate-in slide-in-from-top-2 duration-300">
                                        <p className="text-sm font-medium text-gray-700 mb-3">{t('register.passwordReqs.title')}</p>
                                        <div className="space-y-2">
                                            <PasswordReq met={passwordReqs.length} text={t('register.passwordReqs.length')} />
                                            <PasswordReq met={passwordReqs.uppercase} text={t('register.passwordReqs.uppercase')} />
                                            <PasswordReq met={passwordReqs.number} text={t('register.passwordReqs.number')} />
                                            <PasswordReq met={passwordReqs.special} text={t('register.passwordReqs.special')} />
                                        </div>
                                    </div>
                                )}

                                {errors.password && !showPasswordReqs && (
                                    <div className="mt-2 flex items-center gap-2 text-red-500 text-sm animate-in slide-in-from-top-1 duration-200">
                                        <AlertCircle className="h-4 w-4" />
                                        <span>{errors.password}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-purple-500/25 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        {t('register.signingUp')}
                                    </>
                                ) : (
                                    t('register.button')
                                )}
                            </button>
                        </form>

                        <p className="mt-6 text-center text-gray-500">
                            {t('register.haveAccount')}{' '}
                            <Link href={`/${locale}/auth/login`} className="text-blue-600 hover:text-blue-700 font-medium">
                                {t('register.login')}
                            </Link>
                        </p>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        {t.rich('register.termsAndPrivacy', {
                            terms: (chunks) => <Link href={`/${locale}/terms`} className="underline hover:text-gray-600">{chunks}</Link>,
                            privacy: (chunks) => <Link href={`/${locale}/privacy`} className="underline hover:text-gray-600">{chunks}</Link>
                        })}
                    </p>
                </div>
            </div>
        </div>
    )
}

// Password requirement component
function PasswordReq({ met, text }: { met: boolean; text: string }) {
    return (
        <div className={`flex items-center gap-2 transition-all duration-300 ${met ? 'text-green-600' : 'text-gray-500'}`}>
            <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${met ? 'bg-green-100' : 'bg-gray-100'}`}>
                {met ? (
                    <Check className="h-3 w-3 text-green-600" />
                ) : (
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                )}
            </div>
            <span className={`text-sm transition-all duration-300 ${met ? 'line-through opacity-60' : ''}`}>
                {text}
            </span>
        </div>
    )
}