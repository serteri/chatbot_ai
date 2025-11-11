'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Save } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface ChatbotSettingsProps {
    chatbotId: string
    initialSettings: {
        name: string
        botName: string
        welcomeMessage: string
        fallbackMessage: string
        aiModel: string
        temperature: number
        language: string
    }
}

export function ChatbotSettings({ chatbotId, initialSettings }: ChatbotSettingsProps) {
    const router = useRouter()
    const t = useTranslations()
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState(initialSettings)

    const handleSave = async () => {
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
            {/* Genel Ayarlar */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('settings.general')}</CardTitle>
                    <CardDescription>{t('settings.generalDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="name">{t('settings.chatbotName')}</Label>
                        <Input
                            id="name"
                            value={settings.name}
                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                            placeholder={t('settings.chatbotNamePlaceholder')}
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {t('settings.chatbotNameDesc')}
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="botName">{t('settings.botDisplayName')}</Label>
                        <Input
                            id="botName"
                            value={settings.botName}
                            onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                            placeholder={t('settings.botDisplayNamePlaceholder')}
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {t('settings.botDisplayNameDesc')}
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="language">{t('settings.language')}</Label>
                        <Select
                            value={settings.language}
                            onValueChange={(value) => setSettings({ ...settings, language: value })}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="tr">Türkçe</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="de">Deutsch</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Mesajlar */}
            <Card>
                <CardHeader>
                    <CardTitle>{t('settings.messages')}</CardTitle>
                    <CardDescription>{t('settings.messagesDesc')}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="welcomeMessage">{t('settings.welcomeMessage')}</Label>
                        <Textarea
                            id="welcomeMessage"
                            value={settings.welcomeMessage}
                            onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                            placeholder={t('settings.welcomePlaceholder')}
                            rows={3}
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {t('settings.welcomeDesc')}
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="fallbackMessage">{t('settings.fallbackMessage')}</Label>
                        <Textarea
                            id="fallbackMessage"
                            value={settings.fallbackMessage}
                            onChange={(e) => setSettings({ ...settings, fallbackMessage: e.target.value })}
                            placeholder={t('settings.fallbackPlaceholder')}
                            rows={4}
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ⚠️ <strong>{t('settings.important')}:</strong> {t('settings.fallbackDesc')}
                        </p>
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