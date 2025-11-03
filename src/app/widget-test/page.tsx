'use client'  // ← EKLE

import { DynamicWidget } from '@/components/widget/DynamicWidget'

export default function WidgetTestPage() {
    const CHATBOT_ID = "PTP2l7aNOvlG"  // Senin test ID'n

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-4">Widget Test</h1>
                <p className="text-gray-600 mb-8">
                    Sağ alttaki chat butonuna tıklayın. Artık tamamen dinamik!
                </p>
            </div>
            <DynamicWidget chatbotId={CHATBOT_ID} />
        </div>
    )
}