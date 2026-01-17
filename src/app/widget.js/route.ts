import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        // Get chatbot ID from query parameter
        const { searchParams } = new URL(request.url);
        const chatbotId = searchParams.get('id');

        if (!chatbotId) {
            return new NextResponse('console.warn("No chatbot ID provided");', {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }

        // Find chatbot by ID or identifier
        const chatbot = await prisma.chatbot.findFirst({
            where: {
                OR: [
                    { id: chatbotId },
                    { identifier: chatbotId }
                ]
            },
            select: {
                id: true,
                isActive: true,
                widgetPosition: true
            }
        });

        if (!chatbot || !chatbot.isActive) {
            return new NextResponse('console.warn("Chatbot not found or inactive");', {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
        const position = chatbot.widgetPosition || 'bottom-right';
        const isLeft = position === 'bottom-left';

        // Widget loader script
        const scriptContent = `
(function() {
    if (document.getElementById('pylon-chatbot-widget')) return;

    var appUrl = "${appUrl}";
    var chatbotId = "${chatbot.id}";
    var position = "${position}";

    // Create widget container
    var container = document.createElement('div');
    container.id = 'pylon-chatbot-widget';
    container.style.cssText = 'position:fixed;bottom:20px;${isLeft ? 'left' : 'right'}:20px;z-index:2147483647;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;';

    // Create welcome bubble (WhatsApp-style teaser)
    var bubble = document.createElement('div');
    bubble.id = 'pylon-welcome-bubble';
    bubble.innerHTML = '<div style="font-weight:600;margin-bottom:4px;">Merhaba! 👋</div><div style="font-size:13px;opacity:0.9;">Size nasıl yardımcı olabilirim?</div><div style="position:absolute;bottom:-8px;${isLeft ? 'left' : 'right'}:24px;width:0;height:0;border-left:8px solid transparent;border-right:8px solid transparent;border-top:8px solid white;"></div>';
    bubble.style.cssText = 'position:absolute;bottom:70px;${isLeft ? 'left' : 'right'}:0;background:white;padding:12px 16px;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);min-width:200px;cursor:pointer;opacity:0;transform:translateY(10px) scale(0.95);transition:all 0.3s ease;display:none;';

    // Create close button for bubble
    var bubbleClose = document.createElement('div');
    bubbleClose.innerHTML = '×';
    bubbleClose.style.cssText = 'position:absolute;top:4px;right:8px;font-size:18px;color:#999;cursor:pointer;line-height:1;';
    bubbleClose.onclick = function(e) {
        e.stopPropagation();
        bubble.style.opacity = '0';
        bubble.style.transform = 'translateY(10px) scale(0.95)';
        setTimeout(function() { bubble.style.display = 'none'; }, 300);
        localStorage.setItem('pylon-bubble-closed', 'true');
    };
    bubble.appendChild(bubbleClose);

    // Create toggle button
    var btn = document.createElement('div');
    btn.id = 'pylon-chatbot-btn';
    btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    btn.style.cssText = 'width:60px;height:60px;border-radius:50%;background:linear-gradient(135deg,#d97706,#f59e0b);display:flex;align-items:center;justify-content:center;cursor:pointer;box-shadow:0 4px 20px rgba(217,119,6,0.4);transition:transform 0.3s ease,box-shadow 0.3s ease;animation:pylon-pulse 2s infinite;';
    btn.onmouseover = function() { this.style.transform = 'scale(1.1)'; this.style.boxShadow = '0 6px 25px rgba(217,119,6,0.5)'; };
    btn.onmouseout = function() { this.style.transform = 'scale(1)'; this.style.boxShadow = '0 4px 20px rgba(217,119,6,0.4)'; };

    // Add pulse animation
    var style = document.createElement('style');
    style.textContent = '@keyframes pylon-pulse { 0%, 100% { box-shadow: 0 4px 20px rgba(217,119,6,0.4); } 50% { box-shadow: 0 4px 30px rgba(217,119,6,0.6), 0 0 0 8px rgba(217,119,6,0.1); } }';
    document.head.appendChild(style);

    // Create iframe (hidden initially)
    var iframe = document.createElement('iframe');
    iframe.id = 'pylon-chatbot-iframe';
    iframe.src = appUrl + '/chatbot/' + chatbotId;
    iframe.style.cssText = 'position:absolute;bottom:70px;${isLeft ? 'left' : 'right'}:0;width:380px;height:600px;border:none;border-radius:16px;box-shadow:0 12px 40px rgba(0,0,0,0.2);display:none;background:white;';
    iframe.allow = 'microphone';

    // Mobile responsive
    if (window.innerWidth < 500) {
        iframe.style.width = '100vw';
        iframe.style.height = '100vh';
        iframe.style.bottom = '0';
        iframe.style.${isLeft ? 'left' : 'right'} = '0';
        iframe.style.borderRadius = '0';
        iframe.style.position = 'fixed';
    }

    var isOpen = false;

    function openChat() {
        isOpen = true;
        iframe.style.display = 'block';
        bubble.style.display = 'none';
        btn.style.animation = 'none';
        btn.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>';
    }

    function closeChat() {
        isOpen = false;
        iframe.style.display = 'none';
        btn.innerHTML = '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>';
    }

    btn.onclick = function() {
        if (isOpen) {
            closeChat();
        } else {
            openChat();
        }
    };

    // Bubble click opens chat
    bubble.onclick = function() {
        openChat();
    };

    // Show welcome bubble after 3 seconds (if not previously closed)
    if (!localStorage.getItem('pylon-bubble-closed')) {
        setTimeout(function() {
            if (!isOpen) {
                bubble.style.display = 'block';
                setTimeout(function() {
                    bubble.style.opacity = '1';
                    bubble.style.transform = 'translateY(0) scale(1)';
                }, 50);
            }
        }, 3000);
    }

    // Listen for close message from iframe
    window.addEventListener('message', function(event) {
        if (event.origin !== appUrl) return;
        if (event.data === 'CHATBOT_CLOSE' || event.data.type === 'CHATBOT_CLOSE') {
            closeChat();
        }
    });

    container.appendChild(bubble);
    container.appendChild(iframe);
    container.appendChild(btn);
    document.body.appendChild(container);
})();
`;

        return new NextResponse(scriptContent, {
            headers: {
                'Content-Type': 'application/javascript',
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Widget.js error:', error);
        return new NextResponse('console.error("Widget loading error");', {
            status: 500,
            headers: { 'Content-Type': 'application/javascript' }
        });
    }
}
