import { db } from '@/utils';
import { DIVISION } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        const { classId } = params;

        if (!classId) {
            return NextResponse.json(
                { message: 'Class ID is required' },
                { status: 400 }
            );
        }

        // Fetch divisions linked to the class
        const divisions = await db
            .select({
                id: DIVISION.id,
                name: DIVISION.name,
                classId: DIVISION.class_id,
            })
            .from(DIVISION)
            .where(eq(DIVISION.class_id, parseInt(classId, 10)));

        return NextResponse.json({ divisions }, { status: 200 });
    } catch (error) {
        console.error('Error fetching divisions:', error);
        return NextResponse.json({ message: 'Error fetching divisions' }, { status: 500 });
    }
}
