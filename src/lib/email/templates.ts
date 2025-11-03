interface NewMessageEmailProps {
    chatbotName: string
    visitorId: string
    message: string
    conversationUrl: string
}

export function NewMessageEmail({ chatbotName, visitorId, message, conversationUrl }: NewMessageEmailProps) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Yeni Mesaj</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">💬 Yeni Mesaj Aldınız!</h1>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #374151;">Chatbot:</strong> ${chatbotName}
            </p>
            <p style="margin: 0 0 15px 0; color: #6b7280; font-size: 14px;">
                <strong style="color: #374151;">Ziyaretçi:</strong> ${visitorId}
            </p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin-top: 20px;">
                <p style="margin: 0; color: #111827; font-size: 16px; font-style: italic;">
                    "${message}"
                </p>
            </div>
        </div>
        
        <div style="text-align: center;">
            <a href="${conversationUrl}" 
               style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Konuşmayı Görüntüle
            </a>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
            Bu email'i almak istemiyorsanız, dashboard'unuzdan bildirim ayarlarını değiştirebilirsiniz.
        </p>
    </div>
</body>
</html>
    `
}

interface DailyReportEmailProps {
    userName: string
    totalConversations: number
    totalMessages: number
    topChatbot: {
        name: string
        conversations: number
    } | null
    dashboardUrl: string
}

export function DailyReportEmail({ userName, totalConversations, totalMessages, topChatbot, dashboardUrl }: DailyReportEmailProps) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Günlük Rapor</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📊 Günlük Rapor</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">
            Merhaba ${userName}, bugünün özeti!
        </p>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="display: grid; gap: 15px; margin-bottom: 25px;">
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Toplam Konuşma</div>
                <div style="font-size: 32px; font-weight: bold; color: #3b82f6;">${totalConversations}</div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">Toplam Mesaj</div>
                <div style="font-size: 32px; font-weight: bold; color: #10b981;">${totalMessages}</div>
            </div>
            
            ${topChatbot ? `
            <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                <div style="font-size: 14px; color: #6b7280; margin-bottom: 5px;">En Aktif Chatbot</div>
                <div style="font-size: 20px; font-weight: bold; color: #8b5cf6;">${topChatbot.name}</div>
                <div style="font-size: 14px; color: #6b7280; margin-top: 5px;">${topChatbot.conversations} konuşma</div>
            </div>
            ` : ''}
        </div>
        
        <div style="text-align: center;">
            <a href="${dashboardUrl}" 
               style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Dashboard'a Git
            </a>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 12px;">
            Bu günlük raporu her gün saat 09:00'da alırsınız.
        </p>
    </div>
</body>
</html>
    `
}

interface WelcomeEmailProps {
    userName: string
    dashboardUrl: string
}

export function WelcomeEmail({ userName, dashboardUrl }: WelcomeEmailProps) {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hoş Geldiniz</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 32px;">🎉 Hoş Geldiniz!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 15px 0 0 0; font-size: 18px;">
            Merhaba ${userName}
        </p>
    </div>
    
    <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <div style="background: white; padding: 30px; border-radius: 8px; margin-bottom: 25px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.8;">
                ChatbotAI'ya hoş geldiniz! Artık kendi dokümanlarınızdan öğrenen akıllı chatbot'lar oluşturabilirsiniz.
            </p>
            
            <h3 style="color: #374151; margin: 25px 0 15px 0;">🚀 Başlamak için:</h3>
            <ol style="color: #6b7280; line-height: 1.8; padding-left: 20px;">
                <li>İlk chatbot'unuzu oluşturun</li>
                <li>Dokümanlarınızı yükleyin</li>
                <li>Widget kodunu sitenize ekleyin</li>
                <li>Müşteri desteğinizi otomatikleştirin!</li>
            </ol>
        </div>
        
        <div style="text-align: center;">
            <a href="${dashboardUrl}" 
               style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: bold; font-size: 16px;">
                Dashboard'a Git
            </a>
        </div>
        
        <p style="margin-top: 30px; text-align: center; color: #9ca3af; font-size: 14px;">
            Herhangi bir sorunuz varsa, bize ulaşmaktan çekinmeyin!
        </p>
    </div>
</body>
</html>
    `
}