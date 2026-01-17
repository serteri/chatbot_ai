import { NextRequest, NextResponse } from 'next/server';
import { ImportService } from '@/lib/imports/ImportService';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, content } = body;

        if (!url && !content) {
            return NextResponse.json({ error: 'URL or Content is required' }, { status: 400 });
        }

        const service = new ImportService();
        // Prioritize content if provided (e.g. file upload), else use URL
        const input = content || url;

        const result = await service.detectAndParse(input);

        return NextResponse.json({
            success: true,
            strategy: result.strategy,
            count: result.properties.length,
            properties: result.properties
        });

    } catch (error: any) {
        console.error('Property Import Detection Error:', error);
        return NextResponse.json({
            success: false,
            error: error.message || 'Failed to detect properties'
        }, { status: 500 });
    }
}
