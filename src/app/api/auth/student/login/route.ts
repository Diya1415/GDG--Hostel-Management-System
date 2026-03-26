import { prisma } from '@/lib/prisma';
import { verifyPassword, signJWT } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { roomNumber, password } = body; // password is USN

        if (!roomNumber || !password) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // Find students in this room
        const students = await prisma.student.findMany({ where: { roomNumber } });

        // We need to find the one whose USN matches the password
        let validStudent = null;

        // Iterate to find match (since usn = value of password)
        // Actually we stored hash(usn).
        // So if the user enters "2KE...", that IS the password.
        // We check if verifyPassword(password, student.password) is true.

        for (const student of students) {
            const isValid = await verifyPassword(password, student.password);
            if (isValid) {
                validStudent = student;
                break;
            }
        }

        if (!validStudent) {
            return NextResponse.json({ error: 'Invalid room number or USN' }, { status: 401 });
        }

        // Create Session
        const token = await signJWT({
            id: validStudent.id,
            role: 'student',
            name: validStudent.name,
            usn: validStudent.usn
        });

        const cookieStore = await cookies();
        cookieStore.set('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
