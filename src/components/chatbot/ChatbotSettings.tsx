'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save, Headset, Calendar } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'

interface ChatbotSettingsProps {
    chatbotId: string
    hasLiveSupport: boolean
    initialSettings: {
        name: string
        botName: string
        welcomeMessage: string
        fallbackMessage: string
        aiModel: string
        temperature: number
        language: string
        enableLiveChat?: boolean
        liveSupportUrl?: string | null
        whatsappNumber?: string | null
        calendlyUrl?: string | null
        agentName?: string | null
        agentPhone?: string | null
        agentEmail?: string | null
    }
}

export function ChatbotSettings({ chatbotId, hasLiveSupport, initialSettings }: ChatbotSettingsProps) {
    const router = useRouter()
    const t = useTranslations()
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState(initialSettings)

    const handleSave = async () => {
        // ... (save logic remains same)
        setSaving(true)

        try {
            const response = await fetch(`/api/chatbots/${chatbotId}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            })

            if (!response.ok) {
                throw new Error('Kayıt başarısız')
            }

            router.refresh()
            toast.success(t('settings.saveSuccessRefresh'))

            setTimeout(() => {
                window.location.href = window.location.href
            }, 1000)
        } catch (error) {
            console.error('Save error:', error)
            toast.error(t('common.error'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* ... (other cards) */}

            {/* Live Support / Canlı Destek */}
            <Card className={!hasLiveSupport ? "opacity-60 relative" : ""}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Headset className="h-5 w-5" />
                        {t('settings.liveSupport')}
                    </CardTitle>
                    <CardDescription>{t('settings.liveSupportDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 relative">
                    {/* Premium Lock Overlay */}
                    {!hasLiveSupport && (
                        <div className="absolute inset-0 top-0 left-0 w-full h-full z-20 flex flex-col items-center justify-center bg-white/60 dark:bg-slate-950/60 backdrop-blur-sm rounded-lg transition-all duration-300">
                            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-2xl flex flex-col items-center gap-3 max-w-sm text-center transform scale-100 hover:scale-105 transition-transform duration-300">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-1">
                                    <Headset className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1">
                                        {t('settings.liveSupport')}
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 px-2">
                                        WhatsApp ve özel link desteği sadece Business ve Enterprise paketlerinde mevcuttur.
                                    </p>
                                </div>
                                <Button
                                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                                    onClick={() => router.push('/dashboard/plans')}
                                >
                                    {t('upgradePlan') || "Planı Yükselt"}
                                </Button>
                            </div>
                        </div>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('settings.enableLiveSupport')}</Label>
                            <p className="text-xs text-muted-foreground">{t('settings.enableLiveSupportDesc')}</p>
                        </div>
                        <Switch
                            checked={settings.enableLiveChat ?? false}
                            onCheckedChange={(checked) => setSettings({ ...settings, enableLiveChat: checked })}
                            disabled={!hasLiveSupport}
                        />
                    </div>

                    {(settings.enableLiveChat) && (
                        <div className="space-y-4 animate-in fade-in pt-4 border-t">
                            <div>
                                <Label htmlFor="whatsappNumber">{t('settings.whatsappNumber')}</Label>
                                <Input
                                    id="whatsappNumber"
                                    value={settings.whatsappNumber || ''}
                                    onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                                    placeholder="+90 555 123 45 67"
                                    className="mt-2"
                                    disabled={!hasLiveSupport}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('settings.whatsappDesc')}
                                </p>
                            </div>

                            <div>
                                <Label htmlFor="liveSupportUrl">{t('settings.customSupportUrl')}</Label>
                                <Input
                                    id="liveSupportUrl"
                                    value={settings.liveSupportUrl || ''}
                                    onChange={(e) => setSettings({ ...settings, liveSupportUrl: e.target.value })}
                                    placeholder="https://tawk.to/..."
                                    className="mt-2"
                                    disabled={!hasLiveSupport}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {t('settings.customSupportDesc')}
                                </p>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Google Calendar & Agent Settings (Randevu & Danışman) */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Randevu ve Danışman Ayarları
                    </CardTitle>
                    <CardDescription>Google Takvim entegrasyonu ve emlak danışmanı bilgileri.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Google Calendar Connection */}
                    <div className="p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                                        <rect width="18" height="18" x="3" y="4" rx="2" fill="#4285F4" />
                                        <path fill="#fff" d="M7 12h4v4H7zm5-4h4v4h-4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="font-medium text-sm">Google Takvim</h4>
                                    <p className="text-xs text-muted-foreground">
                                        {(settings as any).calendarConnected
                                            ? '✅ Bağlı - Gerçek müsaitlik gösteriliyor'
                                            : 'Gerçek takvim müsaitliğinizi gösterin'}
                                    </p>
                                </div>
                            </div>
                            {(settings as any).calendarConnected ? (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                        try {
                                            await fetch(`/api/calendar/connect?chatbotId=${chatbotId}`, {
                                                method: 'DELETE'
                                            })
                                            setSettings({ ...settings, calendarConnected: false } as any)
                                            toast.success('Google Takvim bağlantısı kesildi')
                                            router.refresh()
                                        } catch (error) {
                                            toast.error('Bağlantı kesilemedi')
                                        }
                                    }}
                                >
                                    Bağlantıyı Kes
                                </Button>
                            ) : (
                                <Button
                                    size="sm"
                                    onClick={async () => {
                                        try {
                                            const response = await fetch(`/api/calendar/connect?chatbotId=${chatbotId}`)
                                            const data = await response.json()
                                            if (data.authUrl) {
                                                window.location.href = data.authUrl
                                            }
                                        } catch (error) {
                                            toast.error('Bağlantı başlatılamadı')
                                        }
                                    }}
                                >
                                    🔗 Google Takvim Bağla
                                </Button>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Bağlandığında, müşteriler gerçek müsaitliğinize göre randevu alabilir.
                        </p>
                    </div>

                    <div className="pt-2">
                        <Label htmlFor="calendlyUrl">Calendly Link (Opsiyonel)</Label>
                        <Input
                            id="calendlyUrl"
                            value={settings.calendlyUrl || ''}
                            onChange={(e) => setSettings({ ...settings, calendlyUrl: e.target.value })}
                            placeholder="https://calendly.com/username/event"
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Google Takvim bağlı değilse Calendly linki kullanılır.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="agentName">Danışman Adı</Label>
                            <Input
                                id="agentName"
                                value={settings.agentName || ''}
                                onChange={(e) => setSettings({ ...settings, agentName: e.target.value })}
                                placeholder="Ad Soyad"
                                className="mt-2"
                            />
                        </div>
                        <div>
                            <Label htmlFor="agentPhone">Danışman Telefon</Label>
                            <Input
                                id="agentPhone"
                                value={settings.agentPhone || ''}
                                onChange={(e) => setSettings({ ...settings, agentPhone: e.target.value })}
                                placeholder="+90 555 ..."
                                className="mt-2"
                            />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="agentEmail">Danışman Email</Label>
                        <Input
                            id="agentEmail"
                            value={settings.agentEmail || ''}
                            onChange={(e) => setSettings({ ...settings, agentEmail: e.target.value })}
                            placeholder="email@example.com"
                            className="mt-2"
                        />
                    </div>
                </CardContent>
            </Card>

            {/* AI Ayarları */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('settings.aiSettings')}</CardTitle>
                    <CardDescription>{t('settings.aiSettingsDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="aiModel">{t('settings.model')}</Label>
                        <Select
                            value={settings.aiModel}
                            onValueChange={(value) => setSettings({ ...settings, aiModel: value })}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gpt-4o-mini">GPT-4o Mini ({t('settings.modelFastEconomic')})</SelectItem>
                                <SelectItem value="gpt-4o">GPT-4o ({t('settings.modelSmartest')})</SelectItem>
                                <SelectItem value="gpt-4-turbo">GPT-4 Turbo ({t('settings.modelBalanced')})</SelectItem>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo ({t('settings.modelEconomic')})</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="temperature">
                            {t('settings.temperature')}: {settings.temperature.toFixed(1)}
                        </Label>
                        <input
                            id="temperature"
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={settings.temperature}
                            onChange={(e) => setSettings({ ...settings, temperature: parseFloat(e.target.value) })}
                            className="w-full mt-2"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>{t('settings.consistent')} (0.0)</span>
                            <span>{t('settings.balanced')} (0.7)</span>
                            <span>{t('settings.creative')} (2.0)</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {t('settings.temperatureDesc')}
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Kaydet Butonu */}
            <div className="flex justify-end">
                <Button onClick={handleSave} disabled={saving} size="lg">
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('settings.saving')}
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            {t('settings.save')}
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}