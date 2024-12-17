import { db } from '@/utils';
import { INSTITUTION } from '@/utils/schema';
import { NextResponse } from 'next/server';

export async function GET(req) {
    try {
        // Fetch only the `id` and `name` columns from the `INSTITUTION` table
        const institutions = await db.select({
            id: INSTITUTION.id,
            name: INSTITUTION.name,
        }).from(INSTITUTION);

        return NextResponse.json({ institutions }, { status: 200 });
    } catch (error) {
        console.error('Error fetching institutions:', error);
        return NextResponse.json({ message: 'Error fetching institutions' }, { status: 500 });
    }
}
