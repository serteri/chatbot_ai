'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Palette, Image as ImageIcon, Eye, EyeOff, Crown } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Switch } from '@/components/ui/switch'
import toast from 'react-hot-toast'
import Link from 'next/link'
import ChatWidget from '@/components/ChatWidget'

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
        hideBranding: boolean
        // Localized fields
        botNameTr?: string
        botNameEn?: string
        botNameDe?: string
        botNameFr?: string
        botNameEs?: string
        welcomeMessageTr?: string
        welcomeMessageEn?: string
        welcomeMessageDe?: string
        welcomeMessageFr?: string
        welcomeMessageEs?: string
    }
    hasCustomBranding?: boolean
    locale?: string
}

export function WidgetCustomizer({ chatbotId, initialSettings, hasCustomBranding = false, locale = 'en' }: WidgetCustomizerProps) {
    const router = useRouter()
    const t = useTranslations()
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState(initialSettings)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string | null>(initialSettings.widgetLogoUrl)
    const [activeTab, setActiveTab] = useState('en')

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
                throw new Error(t('widget.saveError'))
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

    // Değişiklik kontrolü
    const hasChanges = JSON.stringify(settings) !== JSON.stringify(initialSettings) || logoFile !== null;

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
                                <SelectContent className="bg-white text-slate-900 border-slate-200">
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
                                <SelectContent className="bg-white text-slate-900 border-slate-200">
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
                    <CardContent className="space-y-6 pt-6">
                        <Tabs defaultValue="en" value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-5 mb-8 h-12">
                                <TabsTrigger value="tr" className="text-sm font-medium">TR</TabsTrigger>
                                <TabsTrigger value="en" className="text-sm font-medium">EN</TabsTrigger>
                                <TabsTrigger value="de" className="text-sm font-medium">DE</TabsTrigger>
                                <TabsTrigger value="fr" className="text-sm font-medium">FR</TabsTrigger>
                                <TabsTrigger value="es" className="text-sm font-medium">ES</TabsTrigger>
                            </TabsList>

                            {/* Turkish */}
                            <TabsContent value="tr" className="space-y-6 mt-6">
                                <div>
                                    <Label htmlFor="botNameTr">{t('settings.botDisplayName')} (TR)</Label>
                                    <Input
                                        id="botNameTr"
                                        value={settings.botNameTr || settings.botName || ''}
                                        onChange={(e) => setSettings({ ...settings, botNameTr: e.target.value })}
                                        placeholder="AI Asistan"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="welcomeMessageTr">{t('settings.welcomeMessage')} (TR)</Label>
                                    <Textarea
                                        id="welcomeMessageTr"
                                        value={settings.welcomeMessageTr || ''}
                                        onChange={(e) => setSettings({ ...settings, welcomeMessageTr: e.target.value })}
                                        placeholder="Merhaba! Size nasıl yardımcı olabilirim?"
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>
                            </TabsContent>

                            {/* English */}
                            <TabsContent value="en" className="space-y-6 mt-6">
                                <div>
                                    <Label htmlFor="botNameEn">{t('settings.botDisplayName')} (EN)</Label>
                                    <Input
                                        id="botNameEn"
                                        value={settings.botNameEn || settings.botName || ''}
                                        onChange={(e) => setSettings({ ...settings, botNameEn: e.target.value, botName: e.target.value })} // Default to EN
                                        placeholder="AI Assistant"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="welcomeMessageEn">{t('settings.welcomeMessage')} (EN)</Label>
                                    <Textarea
                                        id="welcomeMessageEn"
                                        value={settings.welcomeMessageEn || settings.welcomeMessage || ''}
                                        onChange={(e) => setSettings({ ...settings, welcomeMessageEn: e.target.value, welcomeMessage: e.target.value })} // Default to EN
                                        placeholder="Hello! How can I help you?"
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>
                            </TabsContent>

                            {/* German */}
                            <TabsContent value="de" className="space-y-6 mt-6">
                                <div>
                                    <Label htmlFor="botNameDe">{t('settings.botDisplayName')} (DE)</Label>
                                    <Input
                                        id="botNameDe"
                                        value={settings.botNameDe || ''}
                                        onChange={(e) => setSettings({ ...settings, botNameDe: e.target.value })}
                                        placeholder="KI-Assistent"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="welcomeMessageDe">{t('settings.welcomeMessage')} (DE)</Label>
                                    <Textarea
                                        id="welcomeMessageDe"
                                        value={settings.welcomeMessageDe || ''}
                                        onChange={(e) => setSettings({ ...settings, welcomeMessageDe: e.target.value })}
                                        placeholder="Hallo! Wie kann ich Ihnen helfen?"
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>
                            </TabsContent>

                            {/* French */}
                            <TabsContent value="fr" className="space-y-6 mt-6">
                                <div>
                                    <Label htmlFor="botNameFr">{t('settings.botDisplayName')} (FR)</Label>
                                    <Input
                                        id="botNameFr"
                                        value={settings.botNameFr || ''}
                                        onChange={(e) => setSettings({ ...settings, botNameFr: e.target.value })}
                                        placeholder="Assistant IA"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="welcomeMessageFr">{t('settings.welcomeMessage')} (FR)</Label>
                                    <Textarea
                                        id="welcomeMessageFr"
                                        value={settings.welcomeMessageFr || ''}
                                        onChange={(e) => setSettings({ ...settings, welcomeMessageFr: e.target.value })}
                                        placeholder="Bonjour! Comment puis-je vous aider?"
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>
                            </TabsContent>

                            {/* Spanish */}
                            <TabsContent value="es" className="space-y-6 mt-6">
                                <div>
                                    <Label htmlFor="botNameEs">{t('settings.botDisplayName')} (ES)</Label>
                                    <Input
                                        id="botNameEs"
                                        value={settings.botNameEs || ''}
                                        onChange={(e) => setSettings({ ...settings, botNameEs: e.target.value })}
                                        placeholder="Asistente IA"
                                        className="mt-2"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="welcomeMessageEs">{t('settings.welcomeMessage')} (ES)</Label>
                                    <Textarea
                                        id="welcomeMessageEs"
                                        value={settings.welcomeMessageEs || ''}
                                        onChange={(e) => setSettings({ ...settings, welcomeMessageEs: e.target.value })}
                                        placeholder="¡Hola! ¿Cómo puedo ayudarte?"
                                        rows={3}
                                        className="mt-2"
                                    />
                                </div>
                            </TabsContent>
                        </Tabs>
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

                {/* Branding / White Label */}
                <Card className={!hasCustomBranding ? 'border-dashed border-2 border-purple-200' : ''}>
                    <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center">
                                {settings.hideBranding ? (
                                    <EyeOff className="mr-2 h-5 w-5" />
                                ) : (
                                    <Eye className="mr-2 h-5 w-5" />
                                )}
                                {t('widget.branding')}
                            </div>
                            {!hasCustomBranding && (
                                <span className="flex items-center text-xs font-normal text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                                    <Crown className="w-3 h-3 mr-1" />
                                    Pro+
                                </span>
                            )}
                        </CardTitle>
                        <CardDescription>{t('widget.brandingDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {hasCustomBranding ? (
                            <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                    <Label htmlFor="hideBranding">{t('widget.hideBranding')}</Label>
                                    <p className="text-xs text-muted-foreground">
                                        {t('widget.hideBrandingDesc')}
                                    </p>
                                </div>
                                <Switch
                                    id="hideBranding"
                                    checked={settings.hideBranding}
                                    onCheckedChange={(checked) => setSettings({ ...settings, hideBranding: checked })}
                                />
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <p className="text-sm text-muted-foreground mb-3">
                                    {t('widget.brandingUpgradeMessage')}
                                </p>
                                <Link href={`/${locale}/dashboard/pricing`}>
                                    <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
                                        <Crown className="mr-2 h-4 w-4" />
                                        {t('widget.upgradePlan')}
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Save Button */}
                <div className="sticky bottom-4 z-10 bg-white/80 p-4 border rounded-xl shadow-lg backdrop-blur-sm">
                    <Button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className={`w-full font-bold text-md transition-all duration-300 shadow-md ${hasChanges
                            ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-lg transform hover:-translate-y-0.5'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                            }`}
                        size="lg"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                {t('settings.saving')}
                            </>
                        ) : hasChanges ? (
                            t('settings.save')
                        ) : (
                            t('noChanges')
                        )}
                    </Button>
                </div>
            </div>

            {/* Live Preview */}
            <div className="space-y-4">
                <Card className="sticky top-6">
                    <CardHeader>
                        <CardTitle>{t('widget.livePreview')}</CardTitle>
                        <CardDescription>{t('widget.previewDesc')}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex justify-center p-6 bg-slate-100/50 min-h-[600px] items-end relative rounded-b-lg">

                        {/* 1. CLOSED STATE (Launcher Button) */}
                        <div className="absolute right-6 bottom-6 flex flex-col items-end gap-2 group cursor-pointer hover:scale-105 transition-transform">
                            {/* Message Bubble Hint */}
                            <div className="bg-white px-4 py-2 rounded-xl rounded-br-none shadow-md border border-slate-100 mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                <span className="text-sm font-medium text-slate-700">{t('widget.previewSample')}</span>
                            </div>

                            {/* Launcher Button */}
                            <div
                                className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:opacity-90 transition-all text-white"
                                style={{ backgroundColor: settings.widgetButtonColor }}
                            >
                                {logoPreview ? (
                                    <img src={logoPreview} alt="Logo" className="w-8 h-8 object-contain" />
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-message-circle"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z" /></svg>
                                )}
                            </div>
                        </div>

                        {/* 2. OPEN STATE (The Widget) - Always visible in preview for ease of editing */}
                        <div className="w-full max-w-[380px] shadow-2xl rounded-xl overflow-hidden scale-[0.9] origin-bottom sm:scale-100 mr-20">
                            <ChatWidget
                                chatbotId={chatbotId}
                                customization={{
                                    primaryColor: settings.widgetPrimaryColor,
                                    buttonColor: settings.widgetButtonColor,
                                    textColor: settings.widgetTextColor,
                                    // Dynamic preview based on active tab
                                    botName: activeTab === 'tr' ? (settings.botNameTr || settings.botName) :
                                        activeTab === 'de' ? (settings.botNameDe || settings.botName) :
                                            activeTab === 'fr' ? (settings.botNameFr || settings.botName) :
                                                activeTab === 'es' ? (settings.botNameEs || settings.botName) :
                                                    (settings.botNameEn || settings.botName),
                                    welcomeMessage: activeTab === 'tr' ? (settings.welcomeMessageTr || settings.welcomeMessage) :
                                        activeTab === 'de' ? (settings.welcomeMessageDe || settings.welcomeMessage) :
                                            activeTab === 'fr' ? (settings.welcomeMessageFr || settings.welcomeMessage) :
                                                activeTab === 'es' ? (settings.welcomeMessageEs || settings.welcomeMessage) :
                                                    (settings.welcomeMessageEn || settings.welcomeMessage),
                                    logoUrl: logoPreview,
                                    hideBranding: settings.hideBranding
                                }}
                            />
                        </div>

                    </CardContent>
                </Card>
            </div>
        </div>
    )
}