'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Globe, Plus, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DomainManagerProps {
    chatbotId: string
    initialDomains: string[]
    onUpdate?: (domains: string[]) => void
}

export function DomainManager({ chatbotId, initialDomains, onUpdate }: DomainManagerProps) {
    const [domains, setDomains] = useState<string[]>(initialDomains)
    const [newDomain, setNewDomain] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    const validateDomain = (domain: string): { valid: boolean; error?: string } => {
        // Boş kontrolü
        if (!domain.trim()) {
            return { valid: false, error: 'Domain boş olamaz' }
        }

        // Wildcard kontrolü
        if (domain.startsWith('*.')) {
            const mainDomain = domain.slice(2)
            if (!mainDomain) {
                return { valid: false, error: 'Wildcard sonrası domain gerekli (örn: *.example.com)' }
            }
        }

        // Basit domain formatı kontrolü
        const domainRegex = /^(\*\.)?([a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]?(\.[a-zA-Z]{2,})+|localhost)(:\d+)?$/
        if (!domainRegex.test(domain)) {
            return { valid: false, error: 'Geçersiz domain formatı' }
        }

        // Zaten var mı kontrolü
        if (domains.includes(domain)) {
            return { valid: false, error: 'Bu domain zaten ekli' }
        }

        return { valid: true }
    }

    const handleAddDomain = () => {
        const validation = validateDomain(newDomain)

        if (!validation.valid) {
            toast.error(validation.error || 'Geçersiz domain')
            return
        }

        setDomains([...domains, newDomain.toLowerCase()])
        setNewDomain('')
        toast.success('Domain eklendi! Kaydetmeyi unutmayın.')
    }

    const handleRemoveDomain = (domain: string) => {
        setDomains(domains.filter(d => d !== domain))
        toast.success('Domain kaldırıldı! Kaydetmeyi unutmayın.')
    }

    const handleSave = async () => {
        setIsSaving(true)

        try {
            const response = await fetch(`/api/chat/${chatbotId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    allowedDomains: domains
                })
            })

            if (!response.ok) {
                throw new Error('Kayıt başarısız')
            }

            toast.success('Domain ayarları kaydedildi!')
            onUpdate?.(domains)

        } catch (error) {
            console.error('Save error:', error)
            toast.error('Kayıt sırasında hata oluştu')
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            İzinli Domain'ler
                        </CardTitle>
                        <CardDescription className="mt-2">
                            Widget'ın sadece belirtilen domainlerde çalışmasını sağlayın
                        </CardDescription>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Info Alert */}
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        {domains.length === 0 ? (
                            <div>
                                <strong>⚠️ Uyarı:</strong> Domain listesi boş olduğunda widget <strong>tüm domainlerde</strong> çalışır.
                                Güvenlik için en az bir domain eklemeniz önerilir.
                            </div>
                        ) : (
                            <div>
                                <strong>✓ Güvenli:</strong> Widget sadece aşağıdaki domainlerde çalışacak.
                            </div>
                        )}
                    </AlertDescription>
                </Alert>

                {/* Domain List */}
                {domains.length > 0 && (
                    <div className="space-y-2">
                        <Label>Kayıtlı Domainler ({domains.length})</Label>
                        <div className="space-y-2">
                            {domains.map((domain) => (
                                <div
                                    key={domain}
                                    className="flex items-center justify-between p-3 border rounded-lg bg-gray-50"
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                                        <code className="text-sm font-mono">{domain}</code>
                                        {domain.startsWith('*.') && (
                                            <Badge variant="secondary" className="text-xs">
                                                Wildcard
                                            </Badge>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveDomain(domain)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add Domain Form */}
                <div className="space-y-2">
                    <Label htmlFor="newDomain">Yeni Domain Ekle</Label>
                    <div className="flex gap-2">
                        <Input
                            id="newDomain"
                            placeholder="example.com veya *.example.com"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault()
                                    handleAddDomain()
                                }
                            }}
                        />
                        <Button
                            onClick={handleAddDomain}
                            disabled={!newDomain.trim()}
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Ekle
                        </Button>
                    </div>
                </div>

                {/* Examples */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-blue-900 mb-2">📝 Örnek Kullanımlar:</p>
                    <div className="space-y-1 text-sm text-blue-800">
                        <div><code className="bg-white px-2 py-0.5 rounded">example.com</code> → Sadece example.com</div>
                        <div><code className="bg-white px-2 py-0.5 rounded">*.example.com</code> → Tüm subdomain'ler (app.example.com, blog.example.com vb.)</div>
                        <div><code className="bg-white px-2 py-0.5 rounded">localhost</code> → Yerel test için (Development modda otomatik aktif)</div>
                    </div>
                </div>

                {/* Security Note */}
                <Alert variant="default">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-xs">
                        <strong>Güvenlik Notu:</strong> Başkaları widget kodunuzu kopyalasa bile, izin verilen domainler dışında çalışmaz.
                        Bu sayede API kullanımınız kontrol altında kalır.
                    </AlertDescription>
                </Alert>
            </CardContent>
        </Card>
    )
}