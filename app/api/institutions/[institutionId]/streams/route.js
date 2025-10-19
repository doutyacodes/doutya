import { db } from '@/utils';
import { INSTITUTION_STREAMS } from '@/utils/schema/institutional_schema';
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

        // Fetch streams for the institution
        const streams = await db
            .select({
                id: INSTITUTION_STREAMS.id,
                name: INSTITUTION_STREAMS.name,
                description: INSTITUTION_STREAMS.description,
            })
            .from(INSTITUTION_STREAMS)
            .where(eq(INSTITUTION_STREAMS.institution_id, parseInt(institutionId, 10)));

        return NextResponse.json({ streams }, { status: 200 });
    } catch (error) {
        console.error('Error fetching streams:', error);
        return NextResponse.json({ message: 'Error fetching streams' }, { status: 500 });
    }
}