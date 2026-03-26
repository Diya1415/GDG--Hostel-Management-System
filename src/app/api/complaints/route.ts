import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { analyzeComplaint } from '@/lib/gemini';
import { saveFile } from '@/lib/file-upload';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    // Filters
    const hostel = searchParams.get('hostel');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const subCategory = searchParams.get('subCategory');
    const floor = searchParams.get('floor');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');

    // Date Filters
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    try {
        let whereClause: any = {};

        if (session.role === 'student') {
            whereClause.studentId = session.id;
        } else if (session.role === 'warden') {
            whereClause.hostelName = session.hostelName; // Strict hostel check for now
            if (hostel && hostel !== 'all') whereClause.hostelName = hostel;
        } else {
            return NextResponse.json({ error: 'Unknown role' }, { status: 403 });
        }

        // Apply filters
        if (status && status !== 'all') whereClause.status = status;
        if (category && category !== 'all') whereClause.category = category;
        if (subCategory && subCategory !== 'all') whereClause.subCategory = subCategory;
        if (floor && floor !== 'all') whereClause.floor = floor;
        if (priority && priority !== 'all') whereClause.priority = priority;

        // Search (Title, Description, Student Name)
        if (search) {
            whereClause.OR = [
                { title: { contains: search } }, // Case insensitive usually depends on DB collation
                { description: { contains: search } },
                { student: { name: { contains: search } } }
            ];
        }

        // Date Logic (Default to TODAY if no date filter provided)
        if (startDate && endDate) {
            whereClause.createdAt = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            };
        } else if (!startDate && !endDate && session.role === 'warden' && !search) {
            // DEFAULT VIEW: Show ONLY TODAY'S complaints for Warden if no other date filter is set
            // and no search term (search usually implies looking for past stuff too)
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const todayEnd = new Date();
            todayEnd.setHours(23, 59, 59, 999);

            whereClause.createdAt = {
                gte: todayStart,
                lte: todayEnd
            };
        }

        const complaints = await (prisma.complaint as any).findMany({
            where: whereClause,
            orderBy: [
                { priority: 'desc' }, // URGENT first alphabetically (U > N)
                { createdAt: 'desc' }
            ],
            include: {
                student: { select: { name: true, roomNumber: true, phone: true } },
                statusLogs: true,
                feedback: true
            }
        });

        return NextResponse.json({ complaints });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session || session.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { description, mediaBase64, mediaType, category, subCategory, priority, title } = body;

        if (!description) {
            return NextResponse.json({ error: 'Description is required' }, { status: 400 });
        }

        // AI Analysis or Manual Input
        let finalData = {
            summary: title,
            category,
            subCategory,
            priority
        };

        // If categories are missing, force AI analysis (fallback)
        if (!category || !priority) {
            let aiAnalysis;
            if (mediaType === 'image' && mediaBase64) {
                const base64Data = mediaBase64.replace(/^data:image\/[a-z]+;base64,/, "");
                aiAnalysis = await analyzeComplaint(description, base64Data);
            } else {
                aiAnalysis = await analyzeComplaint(description);
            }
            // Merge AI results if manual data was missing
            finalData = {
                summary: title || aiAnalysis.summary, // Use AI summary if manual title missing
                category: category || aiAnalysis.category,
                subCategory: subCategory || aiAnalysis.subCategory,
                priority: priority || aiAnalysis.priority
            };
        }

        // Save File
        let mediaUrl = null;
        if (mediaBase64) {
            // If manual category provided, we might still have media to upload
            mediaUrl = await saveFile(mediaBase64, mediaType || 'image');
        }

        const student = await prisma.student.findUnique({ where: { id: session.id as string } });

        if (!student) {
            return NextResponse.json({ error: 'Student record not found in system' }, { status: 404 });
        }

        const complaint = await prisma.complaint.create({
            data: {
                title: finalData.summary || "New Complaint",
                description,
                category: finalData.category,
                subCategory: finalData.subCategory,
                priority: finalData.priority,
                status: 'PENDING',
                mediaType: mediaType ? mediaType.toUpperCase() : null,
                mediaUrl,
                studentId: session.id as string,
                // @ts-ignore
                hostelName: student.hostelName,
                floor: student.floorNumber,
            },
        });

        return NextResponse.json({ success: true, complaint });
    } catch (error: any) {
        console.error("CRITICAL ERROR in /api/complaints POST:", error);
        return NextResponse.json({
            error: error.message || 'Internal server error',
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
