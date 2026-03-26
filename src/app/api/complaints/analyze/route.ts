import { analyzeComplaint } from '@/lib/gemini';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { description, mediaBase64 } = body;

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        const analysis = await analyzeComplaint(description, mediaBase64);
        return NextResponse.json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        return NextResponse.json({ error: 'Analysis failed' }, { status: 500 });
    }
}
