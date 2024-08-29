import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';
import { USER_DETAILS } from '@/utils/schema';
import { decryptText } from '@/utils/encryption';


export async function GET(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        const [user] = await db
        .select()
        .from(USER_DETAILS)
        .where(eq(USER_DETAILS.id, userId));
  
        if (!user) {
            return NextResponse.json(
            { message: "User not found" },
            { status: 404 } // Not Found
            );
        }

        // Decrypting fields before sending the response
        user.password = decryptText(user.password);
        user.college = decryptText(user.college);
        user.university = decryptText(user.university);

        return NextResponse.json(user, { status: 201 });
    } catch (error) {
        console.error("Error fetching user data", error);
        return NextResponse.json({ message: 'Error fetching user data' }, { status: 500 });
    }
}