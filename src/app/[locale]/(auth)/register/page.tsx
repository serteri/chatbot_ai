'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function RegisterPage() {
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations()
    const locale = pathname.split('/')[1] || 'tr'

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        website: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        // Validation
        if (formData.password !== formData.confirmPassword) {
            setError(t('auth.register.passwordMismatch'))
            setIsLoading(false)
            return
        }

        if (formData.password.length < 6) {
            setError(t('auth.register.passwordMinLength'))
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    companyName: formData.companyName || undefined,
                    website: formData.website || undefined,
                }),
            })

            const data = await response.json()

            if (!response.ok) {
                setError(data.error || t('auth.register.registrationError'))
                setIsLoading(false)
                return
            }

            // Success
            setSuccess(true)

            // Auto login after 2 seconds
            setTimeout(async () => {
                await signIn('credentials', {
                    email: formData.email,
                    password: formData.password,
                    redirect: false,
                })
                router.push(`/${locale}/dashboard`)
            }, 2000)

        } catch (err) {
            setError(t('auth.register.registrationError'))
            setIsLoading(false)
        }
    }

    const handleOAuthSignIn = async (provider: 'google' | 'github' | 'azure-ad') => {
        setIsLoading(true)
        setError(null)

        try {
            await signIn(provider, { callbackUrl: `/${locale}/dashboard` })
        } catch (err) {
            setError(t('auth.register.oauthError'))
            setIsLoading(false)
        }
    }

    if (success) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-center text-2xl">{t('auth.register.successTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                {t('auth.register.successMessage')}
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <Link href={`/${locale}`} className="absolute top-4 left-4">
                <Button variant="ghost" size="sm">
                    ← {t('auth.register.backToHome')}
                </Button>
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">{t('auth.register.title')}</CardTitle>
                    <CardDescription className="text-center">
                        {t('auth.register.subtitle')}
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* OAuth Buttons */}
                    <div className="space-y-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthSignIn('google')}
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                <path
                                    fill="currentColor"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                />
                                <path
                                    fill="currentColor"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                />
                            </svg>
                            {t('auth.register.googleSignup')}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthSignIn('github')}
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                            </svg>
                            {t('auth.register.githubSignup')}
                        </Button>

                        <Button
                            type="button"
                            variant="outline"
                            className="w-full"
                            onClick={() => handleOAuthSignIn('azure-ad')}
                            disabled={isLoading}
                        >
                            <svg className="mr-2 h-4 w-4" viewBox="0 0 23 23" fill="currentColor">
                                <path d="M11.4 0H0v11.4h11.4V0z" fill="#f35325"/>
                                <path d="M23 0H11.6v11.4H23V0z" fill="#81bc06"/>
                                <path d="M11.4 11.6H0V23h11.4V11.6z" fill="#05a6f0"/>
                                <path d="M23 11.6H11.6V23H23V11.6z" fill="#ffba08"/>
                            </svg>
                            {t('auth.register.microsoftSignup')}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">{t('auth.register.or')}</span>
                        </div>
                    </div>

                    {/* Registration Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">{t('auth.register.name')}</Label>
                            <Input
                                id="name"
                                type="text"
                                placeholder={t('auth.register.namePlaceholder')}
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">{t('auth.register.email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('auth.register.emailPlaceholder')}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t('auth.register.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder={t('auth.register.passwordPlaceholder')}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">{t('auth.register.confirmPassword')}</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder={t('auth.register.confirmPasswordPlaceholder')}
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="companyName">{t('auth.register.companyName')}</Label>
                            <Input
                                id="companyName"
                                type="text"
                                placeholder={t('auth.register.companyNamePlaceholder')}
                                value={formData.companyName}
                                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="website">{t('auth.register.website')}</Label>
                            <Input
                                id="website"
                                type="url"
                                placeholder={t('auth.register.websitePlaceholder')}
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('auth.register.signingUp') : t('auth.register.button')}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-gray-600">
                        {t('auth.register.haveAccount')}{' '}
                        <Link href={`/${locale}/login`} className="text-blue-600 hover:underline font-medium">
                            {t('auth.register.login')}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}