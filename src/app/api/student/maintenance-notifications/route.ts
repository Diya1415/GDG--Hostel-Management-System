import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const session = await getSession();
    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const student = await prisma.student.findUnique({
            where: { id: session.id as string },
            select: { hostelName: true, floorNumber: true, roomNumber: true }
        });

        if (!student) {
            return NextResponse.json({ error: 'Student not found' }, { status: 404 });
        }

        // Robust check for hostel name (try both exact and without " Hall")
        const hostelBase = student.hostelName.replace(" Hall", "").trim();

        const notifications = await (prisma as any).maintenanceNotification.findMany({
            where: {
                OR: [
                    { hostelName: student.hostelName },
                    { hostelName: hostelBase },
                    { hostelName: hostelBase + " Hall" }
                ],
                AND: [
                    {
                        OR: [
                            { floor: null },
                            { floor: student.floorNumber }
                        ]
                    }
                ]
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });

        const filteredNotifications = notifications.filter((notif: any) => {
            if (!notif.roomNumber) return true;
            const targetRooms = notif.roomNumber.split(',').map((r: string) => r.trim().toLowerCase());
            return targetRooms.includes(student.roomNumber.toLowerCase());
        }).slice(0, 10);

        return NextResponse.json(filteredNotifications);
    } catch (error) {
        console.error('Error fetching student maintenance notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
