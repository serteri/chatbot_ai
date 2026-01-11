import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/auth';
import crypto from 'crypto';

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const chatbotId = searchParams.get('chatbotId');

        if (!chatbotId) {
            return NextResponse.json({ error: 'Chatbot ID required' }, { status: 400 });
        }

        // Yetki kontrolü: Kullanıcı bu chatbot'un sahibi mi?
        const chatbot = await prisma.chatbot.findFirst({
            where: {
                id: chatbotId,
                userId: session.user.id
            }
        });

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
        }

        const keys = await prisma.apiKey.findMany({
            where: { chatbotId },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                key: true, // Güvenlik notu: Genelde key'in sadece sonu gösterilir ama burada tam key dönüyoruz şimdilik (dashboard'da copy için)
                createdAt: true,
                lastUsed: true
            }
        });

        // Frontend için key'i maskele (Sonra tam göstermek için ayrı mantık kurabiliriz ama basitlik için tam gönderiyoruz)
        // Şimdilik güvenlik için sadece son 4 hanesini gösterip, 'fullKey' diye ayrı field dönelim mi?
        // Hayır, kullanıcı key'i kaybettiyse yeniden oluşturur. Oluşturma anında gösterilmeli sadece.
        // Ancak kullanıcı "Copy" butonu istiyor.
        // O yüzden full key dönelim, ama HTTPS altında güvenli.

        return NextResponse.json(keys);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { chatbotId, name } = body;

        if (!chatbotId || !name) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const chatbot = await prisma.chatbot.findFirst({
            where: {
                id: chatbotId,
                userId: session.user.id
            }
        });

        if (!chatbot) {
            return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
        }

        // Generate Key: sk_live_...
        const uniquePart = crypto.randomBytes(24).toString('hex');
        const newKey = `sk_live_${uniquePart}`;

        const apiKey = await prisma.apiKey.create({
            data: {
                chatbotId,
                name,
                key: newKey
            }
        });

        return NextResponse.json(apiKey);

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const keyId = searchParams.get('id');

        if (!keyId) {
            return NextResponse.json({ error: 'Key ID required' }, { status: 400 });
        }

        // Key'in sahibi chatbot'un da sahibi mi?
        const key = await prisma.apiKey.findUnique({
            where: { id: keyId },
            include: { chatbot: true }
        });

        if (!key || key.chatbot.userId !== session.user.id) {
            return NextResponse.json({ error: 'Key not found or unauthorized' }, { status: 404 });
        }

        await prisma.apiKey.delete({
            where: { id: keyId }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
