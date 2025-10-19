import { db } from '@/utils';
import { INSTITUTION_COURSES } from '@/utils/schema/institutional_schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    try {
        const { institutionId } = params;

        if (!institutionId) {
            return NextResponse.json(
                { message: 'Institution ID is required' },
                { status: 400 }
            );
        }

        // Fetch courses for the institution
        const courses = await db
            .select({
                id: INSTITUTION_COURSES.id,
                course_name: INSTITUTION_COURSES.course_name,
                description: INSTITUTION_COURSES.description,
                duration_years: INSTITUTION_COURSES.duration_years,
            })
            .from(INSTITUTION_COURSES)
            .where(eq(INSTITUTION_COURSES.institution_id, parseInt(institutionId, 10)));

        return NextResponse.json({ courses }, { status: 200 });
    } catch (error) {
        console.error('Error fetching courses:', error);
        return NextResponse.json({ message: 'Error fetching courses' }, { status: 500 });
    }
}