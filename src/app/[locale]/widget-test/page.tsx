'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { FileText, BookOpen, Bot, Settings, TestTube, Code, GraduationCap, Building, School } from 'lucide-react'
import ChatWidget from '@/components/ChatWidget'

export default function WidgetTestPage() {
    const [chatbotId, setChatbotId] = useState('') // Empty by default - user must enter
    const [loaded, setLoaded] = useState(false)
    const [mode, setMode] = useState<'document' | 'education' | 'hybrid' | 'university' | 'consultancy' | 'language-school'>('education')
    const [testMethod, setTestMethod] = useState<'embed' | 'component'>('component')
    const [chatKey, setChatKey] = useState(0)

    const handleModeChange = (newMode: any) => {
        setMode(newMode)
        setChatKey(prev => prev + 1) // Component'i reset et
    }

    const loadWidget = () => {
        if (!chatbotId) {
            alert('Chatbot ID girin!')
            return
        }

        // Önceki script'i kaldır
        const oldScript = document.getElementById('chatbot-widget-script')
        if (oldScript) oldScript.remove()

        const oldWidget = document.getElementById('chatbot-widget-root')
        if (oldWidget) oldWidget.remove()

        // Yeni script ekle
        const script = document.createElement('script')
        script.id = 'chatbot-widget-script'
        script.src = `http://localhost:3000/embed/${chatbotId}.js`
        script.async = true
        script.onload = () => setLoaded(true)
        script.onerror = () => {
            alert('Widget yüklenemedi! Chatbot ID doğru mu?')
            setLoaded(false)
        }
        document.body.appendChild(script)
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-4">
                    <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
                        <TestTube className="w-8 h-8 text-blue-600" />
                        🧪 Education Chatbot Test Hub
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Eğitim kurumları için özel tasarlanmış chatbot modlarını test edin
                    </p>
                </div>

                {/* Test Method Selection */}
                <Card>
                    <CardHeader>
                        <CardTitle>Test Yöntemi Seçin</CardTitle>
                        <CardDescription>
                            Widget'ı nasıl test etmek istiyorsunuz?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className={`cursor-pointer border-2 transition-colors ${
                                testMethod === 'component' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`} onClick={() => setTestMethod('component')}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Bot className="w-5 h-5 text-blue-500" />
                                        React Component Test
                                        {testMethod === 'component' && <Badge>Aktif</Badge>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        Widget'ı direkt React component olarak test et. Mode değişikliği mevcut.
                                    </p>
                                </CardContent>
                            </Card>

                            <Card className={`cursor-pointer border-2 transition-colors ${
                                testMethod === 'embed' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                            }`} onClick={() => setTestMethod('embed')}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Code className="w-5 h-5 text-green-500" />
                                        Embed Script Test
                                        {testMethod === 'embed' && <Badge>Aktif</Badge>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-gray-600">
                                        Widget'ı gerçek embed script ile test et. Asıl production deneyimi.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    </CardContent>
                </Card>

                {testMethod === 'component' ? (
                    // React Component Test
                    <>
                        {/* Institution Type Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="w-5 h-5" />
                                    Kurum Tipi & Mod Seçimi
                                </CardTitle>
                                <CardDescription>
                                    Eğitim kurumu tipinize uygun chatbot modunu seçin
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                                    {/* University Mode */}
                                    <Card className={`cursor-pointer border-2 transition-colors ${
                                        mode === 'university' ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'
                                    }`} onClick={() => handleModeChange('university')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <GraduationCap className="w-5 h-5 text-purple-500" />
                                                Üniversite
                                                {mode === 'university' && <Badge>Aktif</Badge>}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600">
                                                Üniversite bilgileri, bölümler, başvuru şartları, öğrenim ücretleri.
                                            </p>
                                            <div className="mt-2 space-y-1">
                                                <div className="text-xs text-gray-500">🏛️ University database</div>
                                                <div className="text-xs text-gray-500">📚 Program bilgileri</div>
                                                <div className="text-xs text-gray-500">💰 Tuition & requirements</div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Consultancy Mode */}
                                    <Card className={`cursor-pointer border-2 transition-colors ${
                                        mode === 'consultancy' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                    }`} onClick={() => handleModeChange('consultancy')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Building className="w-5 h-5 text-blue-500" />
                                                Danışmanlık
                                                {mode === 'consultancy' && <Badge>Aktif</Badge>}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600">
                                                Hibrit: Database bilgileri + kendi hizmet dokümanları.
                                            </p>
                                            <div className="mt-2 space-y-1">
                                                <div className="text-xs text-gray-500">🎓 Scholarship & University DB</div>
                                                <div className="text-xs text-gray-500">📄 Kendi hizmet dokümanları</div>
                                                <div className="text-xs text-gray-500">💼 Success stories & packages</div>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    {/* Language School Mode */}
                                    <Card className={`cursor-pointer border-2 transition-colors ${
                                        mode === 'language-school' ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-gray-300'
                                    }`} onClick={() => handleModeChange('language-school')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <School className="w-5 h-5 text-green-500" />
                                                Dil Okulu
                                                {mode === 'language-school' && <Badge>Aktif</Badge>}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600">
                                                Dil okulu database'i + kendi kurs dokümanları.
                                            </p>
                                            <div className="mt-2 space-y-1">
                                                <div className="text-xs text-gray-500">🗣️ Language school DB</div>
                                                <div className="text-xs text-gray-500">📋 Kurs programları</div>
                                                <div className="text-xs text-gray-500">🎯 Öğrenci testimonials</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Classic Modes */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Document Mode */}
                                    <Card className={`cursor-pointer border-2 transition-colors ${
                                        mode === 'document' ? 'border-gray-500 bg-gray-50' : 'border-gray-200 hover:border-gray-300'
                                    }`} onClick={() => handleModeChange('document')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <FileText className="w-5 h-5 text-gray-500" />
                                                Pure Document
                                                {mode === 'document' && <Badge>Aktif</Badge>}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600">
                                                Sadece yüklenen dokümanlardan cevap verir.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Education Mode */}
                                    <Card className={`cursor-pointer border-2 transition-colors ${
                                        mode === 'education' ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                                    }`} onClick={() => handleModeChange('education')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <BookOpen className="w-5 h-5 text-orange-500" />
                                                Pure Education
                                                {mode === 'education' && <Badge>Aktif</Badge>}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600">
                                                Sadece education database'inden cevap verir.
                                            </p>
                                        </CardContent>
                                    </Card>

                                    {/* Hybrid Mode */}
                                    <Card className={`cursor-pointer border-2 transition-colors ${
                                        mode === 'hybrid' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-gray-300'
                                    }`} onClick={() => handleModeChange('hybrid')}>
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Bot className="w-5 h-5 text-indigo-500" />
                                                Hybrid
                                                {mode === 'hybrid' && <Badge>Aktif</Badge>}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-sm text-gray-600">
                                                Education DB + Document RAG birlikte.
                                            </p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Current Mode Display */}
                                <div className="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
                                    <Bot className="w-6 h-6 text-blue-500" />
                                    <span className="font-medium">Aktif Mod:</span>
                                    <Badge variant="default" className="flex items-center gap-1">
                                        {mode === 'university' && <GraduationCap className="w-3 h-3" />}
                                        {mode === 'consultancy' && <Building className="w-3 h-3" />}
                                        {mode === 'language-school' && <School className="w-3 h-3" />}
                                        {mode === 'document' && <FileText className="w-3 h-3" />}
                                        {mode === 'education' && <BookOpen className="w-3 h-3" />}
                                        {mode === 'hybrid' && <Bot className="w-3 h-3" />}
                                        {mode === 'university' && 'Üniversite Modu'}
                                        {mode === 'consultancy' && 'Danışmanlık Modu'}
                                        {mode === 'language-school' && 'Dil Okulu Modu'}
                                        {mode === 'document' && 'Doküman Modu'}
                                        {mode === 'education' && 'Eğitim Modu'}
                                        {mode === 'hybrid' && 'Hibrit Mod'}
                                    </Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Chatbot ID Input */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">🔧 Chatbot ID</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex gap-4">
                                    <Input
                                        type="text"
                                        placeholder="Chatbot ID girin (örn: cmhlzigvd0001jjvcqvp11krr)"
                                        value={chatbotId}
                                        onChange={(e) => setChatbotId(e.target.value)}
                                        className="flex-1 font-mono text-sm"
                                    />
                                    <Button
                                        onClick={() => setChatKey(prev => prev + 1)}
                                        variant="outline"
                                    >
                                        Widget Yenile
                                    </Button>
                                </div>
                                <p className="text-sm text-gray-600">
                                    Dashboard'dan chatbot ID'nizi kopyalayın. Widget bu ID ile test edilecek.
                                </p>
                                {chatbotId && (
                                    <div className="p-3 bg-blue-50 rounded border">
                                        <p className="text-sm">
                                            <strong>Aktif Chatbot ID:</strong> <code className="text-xs">{chatbotId}</code>
                                        </p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Component Widget Demo */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Widget */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold flex items-center gap-2">
                                    <Bot className="w-6 h-6 text-blue-500" />
                                    Widget Demo
                                </h2>
                                <div className="flex justify-center">
                                    <ChatWidget
                                        key={chatKey}
                                        chatbotId={chatbotId}
                                        mode={mode}
                                    />
                                </div>
                            </div>

                            {/* Test Suggestions */}
                            <div className="space-y-4">
                                <h2 className="text-2xl font-bold">Test Önerileri</h2>

                                {mode === 'university' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg text-purple-600">🏛️ Üniversite Modu</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="text-sm space-y-1">
                                                <div>• "Harvard University hakkında bilgi"</div>
                                                <div>• "Bilgisayar mühendisliği bölümünüz var mı?"</div>
                                                <div>• "Başvuru şartları neler?"</div>
                                                <div>• "Öğrenim ücreti ne kadar?"</div>
                                                <div>• "Hangi programlarınız var?"</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {mode === 'consultancy' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg text-blue-600">💼 Danışmanlık Modu</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="text-sm space-y-1">
                                                <div>• "Amerika'da okumak istiyorum"</div>
                                                <div>• "Sizin hizmetleriniz neler?"</div>
                                                <div>• "Başarı hikayeleriniz var mı?"</div>
                                                <div>• "Danışmanlık ücretiniz ne kadar?"</div>
                                                <div>• "Vize başvuru sürecinizde yardım ediyor musunuz?"</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {mode === 'language-school' && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg text-green-600">🗣️ Dil Okulu Modu</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="text-sm space-y-1">
                                                <div>• "İngilizce kursu var mı?"</div>
                                                <div>• "Kurs ücretleri neler?"</div>
                                                <div>• "Ne kadar sürede İngilizce öğrenebilirim?"</div>
                                                <div>• "Sertifika veriyor musunuz?"</div>
                                                <div>• "Online kursunuz var mı?"</div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}

                                {(mode === 'document' || mode === 'education' || mode === 'hybrid') && (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg text-orange-600">
                                                {mode === 'document' ? '📄 Doküman Modu' :
                                                    mode === 'education' ? '🎓 Eğitim Modu' : '🔄 Hibrit Mod'}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-2">
                                            <div className="text-sm space-y-1">
                                                {(mode === 'education' || mode === 'hybrid') && (
                                                    <>
                                                        <div>• "Türkiye'de burs var mı?"</div>
                                                        <div>• "Amerika'da üniversite okumak istiyorum"</div>
                                                        <div>• "Almanya'da mühendislik bölümü"</div>
                                                    </>
                                                )}
                                                {(mode === 'document' || mode === 'hybrid') && (
                                                    <>
                                                        <div>• "Yüklediğim dosyada ne yazıyor?"</div>
                                                        <div>• "Dokümanımdan X konusunu anlat"</div>
                                                    </>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    // Embed Script Test (Original functionality)
                    <Card>
                        <CardHeader>
                            <CardTitle>Embed Script Test</CardTitle>
                            <CardDescription>
                                Dashboard'dan chatbot identifier'ınızı girin ve gerçek embed script'i test edin.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex gap-4">
                                <Input
                                    type="text"
                                    placeholder="Chatbot Identifier"
                                    value={chatbotId}
                                    onChange={(e) => setChatbotId(e.target.value)}
                                    className="flex-1"
                                />
                                <Button onClick={loadWidget}>
                                    Widget Yükle
                                </Button>
                            </div>

                            {loaded && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded">
                                    ✅ Widget yüklendi! Sağ alt köşeye bakın ve chat butonuna tıklayın.
                                </div>
                            )}

                            <div className="space-y-4">
                                <h2 className="font-semibold text-lg">📝 Test Soruları (Eğitim Danışmanlığı):</h2>
                                <div className="space-y-3 text-sm">
                                    <div className="p-3 bg-blue-50 rounded">
                                        <strong>🎓 Üniversite önerisi:</strong>
                                        <p className="text-gray-700 mt-1">"Almanya'da bilgisayar mühendisliği okumak istiyorum"</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 rounded">
                                        <strong>💰 Burs sorusu:</strong>
                                        <p className="text-gray-700 mt-1">"Amerika'da burs imkanları neler?"</p>
                                    </div>
                                    <div className="p-3 bg-yellow-50 rounded">
                                        <strong>🗣️ Dil okulu:</strong>
                                        <p className="text-gray-700 mt-1">"İngilizce öğrenmek için hangi ülkeyi önerirsiniz?"</p>
                                    </div>
                                    <div className="p-3 bg-green-50 rounded">
                                        <strong>🛂 Vize bilgisi:</strong>
                                        <p className="text-gray-700 mt-1">"Almanya öğrenci vizesi nasıl alınır?"</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 rounded border">
                                <h3 className="font-semibold mb-2">⚙️ Gereksinimler:</h3>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>✓ Chatbot <strong>isActive = true</strong> olmalı</li>
                                    <li>✓ <strong>allowedDomains</strong> listesinde "localhost" olmalı</li>
                                    <li>✓ Chatbot'un <strong>industry = "education"</strong> olmalı</li>
                                    <li>✓ WhatsApp/Email ayarları dolu olmalı (canlı destek için)</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}