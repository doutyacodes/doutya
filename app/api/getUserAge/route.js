import { db } from '@/utils';
import { USER_DETAILS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req) {
    try {
        console.log('age')
        const authResult = await authenticate(req);
        if (!authResult.authenticated) {
            return authResult.response;
        }
        const userData = authResult.decoded_Data;
        const userId = userData.userId;
        const [user] = await db
            .select({ birth_date: USER_DETAILS.birth_date })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .execute();
        console.log(user)
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        return NextResponse.json({ birth_date: user.birth_date }, { status: 200 });
    } catch (error) {
        console.error('Error fetching user details:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}