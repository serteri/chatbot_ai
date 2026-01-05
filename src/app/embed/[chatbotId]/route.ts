import { prisma } from '@/lib/db/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  props: { params: Promise<{ chatbotId: string }> }
) {
  const params = await props.params;
  try {
    let { chatbotId } = params;

    // ".js" uzantısını temizle
    if (chatbotId.endsWith('.js')) {
      chatbotId = chatbotId.replace('.js', '');
    }

    // Chatbot'u bul (ID veya Identifier ile)
    const chatbot = await prisma.chatbot.findFirst({
      where: { 
        OR: [
            { id: chatbotId },
            { identifier: chatbotId } 
        ]
      },
      select: { id: true, isActive: true }
    });

    if (!chatbot || !chatbot.isActive) {
      return new NextResponse('console.warn("Chatbot bulunamadı");', { 
        headers: { 'Content-Type': 'application/javascript' } 
      });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;

    // Iframe yükleyici kod
    const scriptContent = `
      (function() {
        if (document.getElementById('ai-chatbot-widget-${chatbot.id}')) return;

        const appUrl = "${appUrl}";
        const chatbotId = "${chatbot.id}";
        
        const iframe = document.createElement('iframe');
        iframe.id = 'ai-chatbot-widget-${chatbot.id}';
        iframe.src = \`\${appUrl}/chatbot/\${chatbotId}\`;
        
        // Stil Ayarları
        iframe.style.position = 'fixed';
        iframe.style.bottom = '20px';
        iframe.style.right = '20px';
        iframe.style.width = '400px'; 
        iframe.style.height = '600px'; 
        iframe.style.border = 'none';
        iframe.style.zIndex = '2147483647'; // Maksimum Z-Index
        iframe.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
        iframe.style.borderRadius = '16px';
        iframe.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        iframe.style.opacity = '0'; 
        iframe.style.transform = 'translateY(20px)';

        // Mobil Uyumluluk
        if (window.innerWidth < 480) {
          iframe.style.width = '100%';
          iframe.style.height = '100%';
          iframe.style.bottom = '0';
          iframe.style.right = '0';
          iframe.style.borderRadius = '0';
        }

        iframe.onload = function() {
           iframe.style.opacity = '1';
           iframe.style.transform = 'translateY(0)';
        };

        document.body.appendChild(iframe);

        // Mesajlaşma (Iframe içinden gelen kapatma isteği vb.)
        window.addEventListener('message', function(event) {
          if (event.origin !== appUrl) return;
          if (event.data === 'CHATBOT_CLOSE') {
             // İsterseniz gizleyin, isterseniz tamamen kaldırın
             iframe.style.display = 'none'; 
          }
        });
      })();
    `;

    return new NextResponse(scriptContent, {
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error) {
    console.error('Embed error:', error);
    return new NextResponse('console.error("Error");', { status: 500 });
  }
}