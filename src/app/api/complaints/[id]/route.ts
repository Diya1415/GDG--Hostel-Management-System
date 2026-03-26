import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { status, remarks } = body;

    try {
        const complaint = await prisma.complaint.findUnique({ where: { id } });
        if (!complaint) {
            return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
        }

        if (session.role === 'warden') {
            // Warden can update status
            const updated = await prisma.complaint.update({
                where: { id },
                data: { status }
            });

            // Add Log
            await prisma.statusLog.create({
                data: {
                    complaintId: id,
                    previousStatus: complaint.status,
                    newStatus: status,
                    changedBy: String(session.name || "Warden"),
                    remarks: remarks || "",
                }
            });

            return NextResponse.json({ success: true, complaint: updated });
        } else {
            return NextResponse.json({ error: 'Unauthorized to update status' }, { status: 403 });
        }
    } catch (error) {
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;

    const complaint = await prisma.complaint.findUnique({
        where: { id },
        include: { statusLogs: true, student: { select: { name: true, phone: true, roomNumber: true } } }
    });

    return NextResponse.json({ complaint });
}
