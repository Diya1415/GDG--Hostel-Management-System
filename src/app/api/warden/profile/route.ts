import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
    const session = await getSession();
    if (!session || session.role !== 'warden') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const warden = await prisma.warden.findUnique({
            where: { id: session.id as string },
            select: {
                id: true,
                name: true,
                phone: true,
                hostelName: true,
                createdAt: true
            }
        });

        if (!warden) {
            return NextResponse.json({ error: 'Warden not found' }, { status: 404 });
        }

        return NextResponse.json(warden);
    } catch (error) {
        console.error('Error fetching warden profile:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
