import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, phone, password, hostelName } = body;

        if (!name || !phone || !password || !hostelName) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingWarden = await prisma.warden.findUnique({ where: { phone } });
        if (existingWarden) {
            return NextResponse.json({ error: 'Warden with this phone already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        await prisma.warden.create({
            data: {
                name,
                phone,
                password: hashedPassword,
                hostelName,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Warden signup error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
