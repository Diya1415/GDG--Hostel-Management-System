import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(req: Request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = await verifyJWT(token);
        if (!decoded || decoded.role !== 'student') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const studentId = decoded.id;

        // Fetch status logs for complaints made by this student
        // We need to join with Complaint to verify ownership and get details
        const logs = await prisma.statusLog.findMany({
            where: {
                complaint: {
                    studentId: studentId as string
                }
            },
            include: {
                complaint: {
                    select: {
                        title: true,
                        category: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            },
            take: 20 // Limit to last 20 notifications
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('Error details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
