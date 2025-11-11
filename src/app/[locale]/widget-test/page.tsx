'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function WidgetTestPage() {
    const [chatbotId, setChatbotId] = useState('') // Default ID
    const [loaded, setLoaded] = useState(false)

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
        <div className="container mx-auto px-4 py-16">
            <Card className="max-w-2xl mx-auto p-8">
                <h1 className="text-3xl font-bold mb-4">🧪 Chatbot Widget Test</h1>
                <p className="text-gray-600 mb-6">
                    Dashboard'dan chatbot identifier'ınızı girin ve test edin.
                </p>

                <div className="space-y-4">
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
                </div>

                <div className="mt-8 space-y-4">
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
                            <strong>📊 TOEFL sorusu:</strong>
                            <p className="text-gray-700 mt-1">"MIT için TOEFL puanı kaç olmalı?"</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded">
                            <strong>💬 Canlı destek:</strong>
                            <p className="text-gray-700 mt-1">"Bir danışmanla konuşmak istiyorum"</p>
                        </div>
                    </div>
                </div>

                <div className="mt-8 p-4 bg-gray-50 rounded border">
                    <h3 className="font-semibold mb-2">⚙️ Gereksinimler:</h3>
                    <ul className="text-sm text-gray-600 space-y-1">
                        <li>✓ Chatbot <strong>isActive = true</strong> olmalı</li>
                        <li>✓ <strong>allowedDomains</strong> listesinde "localhost" olmalı</li>
                        <li>✓ Chatbot'un <strong>industry = "education"</strong> olmalı (intent detection için)</li>
                        <li>✓ WhatsApp/Email ayarları dolu olmalı (canlı destek için)</li>
                    </ul>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
                    <h3 className="font-semibold mb-2">🔧 Chatbot Ayarları Güncelle:</h3>
                    <p className="text-sm text-gray-700 mb-2">Database'de manuel olarak chatbot'u güncelleyin:</p>
                    <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`UPDATE "Chatbot" 
SET 
  "industry" = 'education',
  "whatsappNumber" = '+90 555 123 4567',
  "supportEmail" = 'destek@example.com',
  "liveSupport" = true
WHERE "identifier" = '${chatbotId}';`}
          </pre>
                </div>
            </Card>
        </div>
    )
}