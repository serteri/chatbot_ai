import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export const runtime = 'nodejs'

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ chatbotId: string }> }
) {
    try {
        const { chatbotId: rawId  } = await params

        const chatbotId = rawId.replace('.js', '')
        console.log('🔍 Searching for identifier:', chatbotId)
        // Tüm chatbot'ları göster (debug)
        const allChatbots = await prisma.chatbot.findMany({
            select: { identifier: true, name: true }
        })
        console.log('📋 All chatbots:', allChatbots)

        // Chatbot'u kontrol et
        const chatbot = await prisma.chatbot.findUnique({
            where: { identifier: chatbotId }
        })
        console.log('✅ Found chatbot:', chatbot?.name)  // ← EKLE
        if (!chatbot) {
            return new NextResponse('Chatbot not found', { status: 404 })
        }

        // Widget JavaScript kodu
        const widgetScript = `
(function() {
    // Config
    const CHATBOT_ID = '${chatbotId}';
    const API_URL = '${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}';
    
    // Widget HTML
    const widgetHTML = \`
        <div id="chatbot-widget-root">
            <style>
                #chatbot-widget-root * {
                    box-sizing: border-box;
                    margin: 0;
                    padding: 0;
                }
                
                #chatbot-bubble {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 60px;
                    height: 60px;
                    border-radius: 50%;
                    background: ${chatbot.widgetButtonColor};
                    color: white;
                    border: none;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    z-index: 999998;
                    transition: transform 0.2s;
                }
                
                #chatbot-bubble:hover {
                    transform: scale(1.1);
                }
                
                #chatbot-widget {
                    position: fixed;
                    bottom: 90px;
                    right: 20px;
                    width: 400px;
                    height: 600px;
                    border-radius: 12px;
                    box-shadow: 0 5px 40px rgba(0,0,0,0.16);
                    background: white;
                    display: none;
                    flex-direction: column;
                    z-index: 999999;
                    overflow: hidden;
                }
                
                @media (max-width: 768px) {
                    #chatbot-widget {
                        width: 100%;
                        height: 100%;
                        bottom: 0;
                        right: 0;
                        border-radius: 0;
                    }
                }
                
                #chatbot-widget.open {
                    display: flex;
                }
                
                #chatbot-header {
                    background: ${chatbot.widgetPrimaryColor};
                    color: white;
                    padding: 16px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                #chatbot-close {
                    background: none;
                    border: none;
                    color: white;
                    font-size: 24px;
                    cursor: pointer;
                    padding: 0;
                    width: 30px;
                    height: 30px;
                }
                
                #chatbot-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 16px;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }
                
                .message {
                    max-width: 80%;
                    padding: 10px 14px;
                    border-radius: 12px;
                    word-wrap: break-word;
                }
                
                .message.user {
                    align-self: flex-end;
                    background: ${chatbot.widgetPrimaryColor};
                    color: white;
                }
                
                .message.bot {
                    align-self: flex-start;
                    background: #f1f3f4;
                    color: #333;
                }
                
                #chatbot-input-container {
                    padding: 16px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    gap: 8px;
                }
                
                #chatbot-input {
                    flex: 1;
                    padding: 10px;
                    border: 1px solid #e5e7eb;
                    border-radius: 8px;
                    font-size: 14px;
                }
                
                #chatbot-send {
                    background: ${chatbot.widgetButtonColor};
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    cursor: pointer;
                    font-weight: 500;
                }
                
                #chatbot-send:hover {
                    opacity: 0.9;
                }
                
                #chatbot-send:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            </style>
            
            <button id="chatbot-bubble">💬</button>
            
            <div id="chatbot-widget">
                <div id="chatbot-header">
                    <div>
                        <strong>${chatbot.botName}</strong>
                    </div>
                    <button id="chatbot-close">×</button>
                </div>
                
                <div id="chatbot-messages"></div>
                
                <div id="chatbot-input-container">
                    <input 
                        type="text" 
                        id="chatbot-input" 
                        placeholder="${chatbot.placeholderText}"
                    />
                    <button id="chatbot-send">Gönder</button>
                </div>
            </div>
        </div>
    \`;
    
    // Insert widget
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    
    // State
    let conversationId = null;
    const visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
    
    // Elements
    const bubble = document.getElementById('chatbot-bubble');
    const widget = document.getElementById('chatbot-widget');
    const closeBtn = document.getElementById('chatbot-close');
    const messagesContainer = document.getElementById('chatbot-messages');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    
    // Toggle widget
    bubble.addEventListener('click', () => {
        widget.classList.toggle('open');
        if (widget.classList.contains('open') && messagesContainer.children.length === 0) {
            addMessage('${chatbot.welcomeMessage}', 'bot');
        }
    });
    
    closeBtn.addEventListener('click', () => {
        widget.classList.remove('open');
    });
    
    // Add message to UI
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = \`message \${sender}\`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Send message
    async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;
        
        addMessage(message, 'user');
        input.value = '';
        sendBtn.disabled = true;
        
        try {
            const response = await fetch(\`\${API_URL}/api/public/chat\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatbotId: CHATBOT_ID,
                    conversationId,
                    message,
                    visitorId
                })
            });
            
            if (!response.ok) throw new Error('Network error');
            
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let botMessage = '';
            
            // Create bot message element
            const botDiv = document.createElement('div');
            botDiv.className = 'message bot';
            messagesContainer.appendChild(botDiv);
            
            // Read stream
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                
                const chunk = decoder.decode(value);
                botMessage += chunk;
                botDiv.textContent = botMessage;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            
            // Get conversation ID from headers
            const convId = response.headers.get('X-Conversation-Id');
            if (convId) conversationId = convId;
            
        } catch (error) {
            console.error('Chat error:', error);
            addMessage('${chatbot.fallbackMessage}', 'bot');
        } finally {
            sendBtn.disabled = false;
        }
    }
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
})();
`;

        return new NextResponse(widgetScript, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=3600',
            }
        })

    } catch (error) {
        console.error('Embed script error:', error)
        return new NextResponse('Error loading widget', { status: 500 })
    }
}