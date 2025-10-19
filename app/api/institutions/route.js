import { db } from '@/utils';
import { INSTITUTION } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type'); // 'School' or 'College'

        let query = db.select({
            id: INSTITUTION.id,
            name: INSTITUTION.name,
            type: INSTITUTION.type,
        }).from(INSTITUTION);

        // Filter by type if provided
        if (type) {
            query = query.where(eq(INSTITUTION.type, type));
        }

        const institutions = await query;

        return NextResponse.json({ institutions }, { status: 200 });
    } catch (error) {
        console.error('Error fetching institutions:', error);
        return NextResponse.json({ message: 'Error fetching institutions' }, { status: 500 });
    }
}