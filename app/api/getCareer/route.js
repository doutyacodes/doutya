import { db } from '@/utils'; // Ensure this path is correct
import { USER_CAREER } from '@/utils/schema'; // Ensure this path is correct
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware'; // Ensure this path is correct
import { eq } from 'drizzle-orm';

export async function GET(req) {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response; 
    }

    // Extract userId from decoded token
    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Fetch data for the given userId
        const data = await db
            .select()
            .from(USER_CAREER)
            .where(eq(USER_CAREER.user_id, userId)) 
            .execute();

        // Respond with the fetched data
        return NextResponse.json(data, { status: 201 }); 

    } catch (error) {
        console.error('Error fetching career dat:', error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
