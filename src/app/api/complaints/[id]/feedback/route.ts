import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
        return NextResponse.json({ error: 'Invalid rating. Must be between 1 and 5.' }, { status: 400 });
    }

    try {
        const complaint = await (prisma.complaint as any).findUnique({
            where: { id },
            include: { feedback: true }
        });

        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        if (complaint.studentId !== session.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        if (complaint.status !== 'RESOLVED') {
            return NextResponse.json({ error: 'Feedback can only be submitted for resolved complaints' }, { status: 400 });
        }

        if ((complaint as any).feedback) {
            return NextResponse.json({ error: 'Feedback already submitted for this complaint' }, { status: 400 });
        }

        const feedback = await (prisma as any).feedback.create({
            data: {
                rating,
                comment,
                complaintId: id
            }
        });

        return NextResponse.json({ success: true, feedback });
    } catch (error) {
        console.error("Feedback API Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
