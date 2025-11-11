'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Palette, Image as ImageIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface WidgetCustomizerProps {
    chatbotId: string
    initialSettings: {
        widgetPrimaryColor: string
        widgetButtonColor: string
        widgetTextColor: string
        widgetPosition: string
        widgetSize: string
        widgetLogoUrl: string | null
        welcomeMessage: string
        botName: string
    }
}

export function WidgetCustomizer({ chatbotId, initialSettings }: WidgetCustomizerProps) {
    const router = useRouter()
    const t = useTranslations()
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState(initialSettings)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings.widgetLogoUrl)

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setLogoFile(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setLogoPreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleSave = async () => {
        setSaving(true)

        try {
            // Logo upload varsa önce yükle
            let logoUrl = settings.widgetLogoUrl

            if (logoFile) {
                const formData = new FormData()
                formData.append('file', logoFile)
                formData.append('chatbotId', chatbotId)

                const uploadResponse = await fetch('/api/upload/logo', {
                    method: 'POST',
                    body: formData
                })

                if (uploadResponse.ok) {
                    const data = await uploadResponse.json()
                    logoUrl = data.url
                }
            }

            // Widget ayarlarını kaydet
            const response = await fetch(`/api/chatbots/${chatbotId}/customize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...settings,
                    widgetLogoUrl: logoUrl
                })
            })

            if (!response.ok) {
                throw new Error('Kayıt başarısız')
            }

            router.refresh()
            toast.success(t('widget.saveSuccess'))
        } catch (error) {
            console.error('Save error:', error)
            toast.error(t('common.error'))
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-2">
            {/* Settings Form */}
            <div className="space-y-6">
                {/* Colors */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Palette className="mr-2 h-5 w-5" />
                            {t('widget.colors')}
                        </CardTitle>
                        <CardDescription>{t('widget.colorsDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="primaryColor">{t('widget.primaryColor')}</Label>
                            <div className="flex space-x-2 mt-2">
                                <Input
                                    id="primaryColor"
                                    type="color"
                                    value={settings.widgetPrimaryColor}
                                    onChange={(e) => setSettings({ ...settings, widgetPrimaryColor: e.target.value })}
                                    className="w-20 h-10"
                                />
                                <Input
                                    type="text"
                                    value={settings.widgetPrimaryColor}
                                    onChange={(e) => setSettings({ ...settings, widgetPrimaryColor: e.target.value })}
                                    placeholder="#3B82F6"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="buttonColor">{t('widget.buttonColor')}</Label>
                            <div className="flex space-x-2 mt-2">
                                <Input
                                    id="buttonColor"
                                    type="color"
                                    value={settings.widgetButtonColor}
                                    onChange={(e) => setSettings({ ...settings, widgetButtonColor: e.target.value })}
                                    className="w-20 h-10"
                                />
                                <Input
                                    type="text"
                                    value={settings.widgetButtonColor}
                                    onChange={(e) => setSettings({ ...settings, widgetButtonColor: e.target.value })}
                                    placeholder="#2563EB"
                                />
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="textColor">{t('widget.textColor')}</Label>
                            <div className="flex space-x-2 mt-2">
                                <Input
                                    id="textColor"
                                    type="color"
                                    value={settings.widgetTextColor}
                                    onChange={(e) => setSettings({ ...settings, widgetTextColor: e.target.value })}
                                    className="w-20 h-10"
                                />
                                <Input
                                    type="text"
                                    value={settings.widgetTextColor}
                                    onChange={(e) => setSettings({ ...settings, widgetTextColor: e.target.value })}
                                    placeholder="#FFFFFF"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Layout */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('widget.appearance')}</CardTitle>
                        <CardDescription>{t('widget.appearanceDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label>{t('widget.position')}</Label>
                            <Select
                                value={settings.widgetPosition}
                                onValueChange={(value) => setSettings({ ...settings, widgetPosition: value })}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="bottom-right">{t('widget.bottomRight')}</SelectItem>
                                    <SelectItem value="bottom-left">{t('widget.bottomLeft')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div>
                            <Label>{t('widget.size')}</Label>
                            <Select
                                value={settings.widgetSize}
                                onValueChange={(value) => setSettings({ ...settings, widgetSize: value })}
                            >
                                <SelectTrigger className="mt-2">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="small">{t('widget.small')}</SelectItem>
                                    <SelectItem value="medium">{t('widget.medium')}</SelectItem>
                                    <SelectItem value="large">{t('widget.large')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Messages */}
                <Card>
                    <CardHeader>
                        <CardTitle>{t('settings.messages')}</CardTitle>
                        <CardDescription>{t('widget.messagesDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <Label htmlFor="botName">{t('settings.botDisplayName')}</Label>
                            <Input
                                id="botName"
                                value={settings.botName}
                                onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                                placeholder={t('widget.botNamePlaceholder')}
                                className="mt-2"
                            />
                        </div>

                        <div>
                            <Label htmlFor="welcomeMessage">{t('settings.welcomeMessage')}</Label>
                            <Textarea
                                id="welcomeMessage"
                                value={settings.welcomeMessage}
                                onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                                placeholder={t('widget.welcomePlaceholder')}
                                rows={3}
                                className="mt-2"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Logo */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <ImageIcon className="mr-2 h-5 w-5" />
                            {t('widget.logo')}
                        </CardTitle>
                        <CardDescription>{t('widget.logoDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {logoPreview && (
                                <div className="flex justify-center">
                                    <img
                                        src={logoPreview}
                                        alt="Logo preview"
                                        className="h-20 w-20 object-contain rounded-lg border"
                                    />
                                </div>
                            )}
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleLogoChange}
                            />
                            <p className="text-xs text-gray-500">
                                {t('widget.logoInfo')}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Save Button */}
                <Button onClick={handleSave} disabled={saving} className="w-full" size="lg">
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t('settings.saving')}
                        </>
                    ) : (
                        t('settings.save')
                    )}
                </Button>
            </div>

            {/* Live Preview */}
            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('widget.livePreview')}</CardTitle>
                        <CardDescription>{t('widget.previewDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="relative h-[600px] bg-gray-100 rounded-lg overflow-hidden">
                            {/* Simulated website */}
                            <div className="p-8 space-y-4">
                                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            </div>

                            {/* Widget Preview */}
                            <div
                                className={`absolute ${
                                    settings.widgetPosition === 'bottom-right' ? 'bottom-6 right-6' : 'bottom-6 left-6'
                                }`}
                            >
                                {/* Chat Button */}
                                <button
                                    style={{
                                        backgroundColor: settings.widgetButtonColor,
                                        color: settings.widgetTextColor
                                    }}
                                    className={`rounded-full shadow-lg flex items-center justify-center ${
                                        settings.widgetSize === 'small' ? 'w-12 h-12' :
                                            settings.widgetSize === 'large' ? 'w-20 h-20' : 'w-16 h-16'
                                    }`}
                                >
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-8 h-8 object-contain" />
                                    ) : (
                                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                                            <path d="M15 7v2a4 4 0 01-4 4H9.828l-1.766 1.767c.28.149.599.233.938.233h2l3 3v-3h2a2 2 0 002-2V9a2 2 0 00-2-2h-1z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}