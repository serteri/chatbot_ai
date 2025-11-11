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
import { AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function LoginPage() {
    const router = useRouter()
    const pathname = usePathname()
    const t = useTranslations()
    const locale = pathname.split('/')[1] || 'tr'

    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            })

            if (result?.error) {
                setError(t('auth.login.invalidCredentials'))
                setIsLoading(false)
                return
            }

            router.push(`/${locale}/dashboard`)
            router.refresh()
        } catch (err) {
            setError(t('common.error'))
            setIsLoading(false)
        }
    }

    const handleOAuthSignIn = async (provider: 'google' | 'github' | 'azure-ad') => {
        setIsLoading(true)
        setError(null)

        try {
            await signIn(provider, { callbackUrl: `/${locale}/dashboard` })
        } catch (err) {
            setError(t('auth.login.oauthError'))
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            {/* Ana Sayfa Butonu */}
            <Link href={`/${locale}`} className="absolute top-4 left-4">
                <Button variant="ghost" size="sm">
                    ← {t('auth.login.backToHome')}
                </Button>
            </Link>

            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold text-center">{t('auth.login.title')}</CardTitle>
                    <CardDescription className="text-center">
                        {t('auth.login.subtitle')}
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
                            {t('auth.login.googleLogin')}
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
                            {t('auth.login.githubLogin')}
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
                            {t('auth.login.microsoftLogin')}
                        </Button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-gray-500">{t('auth.login.or')}</span>
                        </div>
                    </div>

                    {/* Email/Password Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">{t('auth.login.email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={t('auth.login.emailPlaceholder')}
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password">{t('auth.login.password')}</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? t('auth.login.loggingIn') : t('auth.login.button')}
                        </Button>
                    </form>
                </CardContent>

                <CardFooter className="flex flex-col space-y-2">
                    <div className="text-sm text-center text-gray-600">
                        {t('auth.login.noAccount')}{' '}
                        <Link href={`/${locale}/register`} className="text-blue-600 hover:underline font-medium">
                            {t('auth.login.signup')}
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}