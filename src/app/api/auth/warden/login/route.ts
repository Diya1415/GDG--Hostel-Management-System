import { prisma } from '@/lib/prisma';
import { verifyPassword, signJWT } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { phone, password } = body;

        if (!phone || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const warden = await prisma.warden.findUnique({ where: { phone } });

        if (!warden || !(await verifyPassword(password, warden.password))) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const token = await signJWT({
            id: warden.id,
            role: 'warden',
            name: warden.name,
            hostelName: warden.hostelName
        });

        const cookieStore = await cookies();
        cookieStore.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
