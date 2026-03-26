import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, roomNumber, floorNumber, usn, phone, email, hostelName } = body;

        if (!name || !roomNumber || !floorNumber || !usn || !phone || !hostelName) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const existingStudent = await prisma.student.findUnique({ where: { usn } });
        if (existingStudent) {
            return NextResponse.json({ error: 'Student with this USN already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(usn); // Password is USN

        const student = await prisma.student.create({
            data: {
                name,
                roomNumber,
                floorNumber,
                usn,
                phone,
                email,
                hostelName,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ success: true, studentId: student.id });
    } catch (error: any) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
