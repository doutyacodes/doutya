import { db } from '@/utils';
import { CLASS } from '@/utils/schema';
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

        // Fetch classes linked to the institution
        const classes = await db
            .select({
                id: CLASS.id,
                name: CLASS.name,
            })
            .from(CLASS)
            .where(eq(CLASS.institution_id, parseInt(institutionId, 10)));

        return NextResponse.json({ classes }, { status: 200 });
    } catch (error) {
        console.error('Error fetching classes:', error);
        return NextResponse.json({ message: 'Error fetching classes' }, { status: 500 });
    }
}
