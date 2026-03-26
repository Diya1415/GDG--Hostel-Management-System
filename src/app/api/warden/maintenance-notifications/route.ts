import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await getSession();
    if (!session || session.role !== 'warden') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { floor, roomNumber, category, description, timeline, scheduledAt } = body;
        const hostelName = session.hostelName as string;

        if (!hostelName || !category || !description || !timeline) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const notification = await (prisma as any).maintenanceNotification.create({
            data: {
                hostelName,
                floor: floor === 'all' ? null : floor,
                roomNumber: roomNumber === '' ? null : roomNumber,
                category,
                description,
                timeline,
                scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            },
        });

        return NextResponse.json({ success: true, notification });
    } catch (error) {
        console.error('Error creating maintenance notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(req: Request) {
    const session = await getSession();
    if (!session || session.role !== 'warden') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const notifications = await (prisma as any).maintenanceNotification.findMany({
            where: {
                hostelName: session.hostelName as string,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching maintenance notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
