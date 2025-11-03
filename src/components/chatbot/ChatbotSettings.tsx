'use client'

import { useState } from 'react'
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
            toast.success('Ayarlar kaydedildi! Sayfa yenileniyor...')

            setTimeout(() => {
                window.location.href = window.location.href
            }, 1000)
        } catch (error) {
            console.error('Save error:', error)
            toast.error('Bir hata oluştu')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            {/* Genel Ayarlar */}
            <Card>
                <CardHeader>
                    <CardTitle>Genel Ayarlar</CardTitle>
                    <CardDescription>Chatbot adı ve temel bilgiler</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="name">Chatbot Adı</Label>
                        <Input
                            id="name"
                            value={settings.name}
                            onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                            placeholder="Müşteri Destek Botum"
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Dashboard'da görünen isim
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="botName">Bot Görünen Adı</Label>
                        <Input
                            id="botName"
                            value={settings.botName}
                            onChange={(e) => setSettings({ ...settings, botName: e.target.value })}
                            placeholder="AI Asistan"
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Widget'ta kullanıcılara görünen isim
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="language">Dil</Label>
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
                    <CardTitle>Mesajlar</CardTitle>
                    <CardDescription>Karşılama ve fallback mesajları</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="welcomeMessage">Karşılama Mesajı</Label>
                        <Textarea
                            id="welcomeMessage"
                            value={settings.welcomeMessage}
                            onChange={(e) => setSettings({ ...settings, welcomeMessage: e.target.value })}
                            placeholder="Merhaba! Size nasıl yardımcı olabilirim?"
                            rows={3}
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Widget açıldığında gösterilen ilk mesaj
                        </p>
                    </div>

                    <div>
                        <Label htmlFor="fallbackMessage">Fallback Mesajı</Label>
                        <Textarea
                            id="fallbackMessage"
                            value={settings.fallbackMessage}
                            onChange={(e) => setSettings({ ...settings, fallbackMessage: e.target.value })}
                            placeholder="Üzgünüm, bu konuda yardımcı olamıyorum."
                            rows={4}
                            className="mt-2"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            ⚠️ <strong>Önemli:</strong> Dokümanlarınızda cevap bulunamadığında gösterilir.
                            İletişim bilgilerinizi ekleyebilirsiniz: "Müşteri hizmetlerimizle iletişime geçin: support@firma.com veya 0850..."
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* AI Ayarları */}
            <Card>
                <CardHeader>
                    <CardTitle>AI Ayarları</CardTitle>
                    <CardDescription>Model ve davranış parametreleri</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <Label htmlFor="aiModel">AI Model</Label>
                        <Select
                            value={settings.aiModel}
                            onValueChange={(value) => setSettings({ ...settings, aiModel: value })}
                        >
                            <SelectTrigger className="mt-2">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Hızlı & Ekonomik)</SelectItem>
                                <SelectItem value="gpt-4o">GPT-4o (En Akıllı)</SelectItem>
                                <SelectItem value="gpt-4-turbo">GPT-4 Turbo (Dengeli)</SelectItem>
                                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Ekonomik)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label htmlFor="temperature">
                            Yaratıcılık Seviyesi: {settings.temperature.toFixed(1)}
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
                            <span>Tutarlı (0.0)</span>
                            <span>Dengeli (0.7)</span>
                            <span>Yaratıcı (2.0)</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Düşük değerler daha tutarlı, yüksek değerler daha yaratıcı cevaplar verir
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
                            Kaydediliyor...
                        </>
                    ) : (
                        <>
                            <Save className="mr-2 h-4 w-4" />
                            Değişiklikleri Kaydet
                        </>
                    )}
                </Button>
            </div>
        </div>
    )
}