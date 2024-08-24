import { db } from "@/utils";
import { FEEDBACK } from "@/utils/schema";
import { authenticate } from '@/lib/jwtMiddleware';
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function POST(req) {
    try {
        const authResult = await authenticate(req);
        if (!authResult.authenticated) {
            return authResult.response;
        }

        const userData = authResult.decoded_Data;

        const userId = userData.userId;

        const data = await req.json();
        await db.insert(FEEDBACK).values({
            user_id: userId, 
            rating: data?.rating,
            description: data?.user_feedback,
        });

        return NextResponse.json({ message: 'Feedback submitted successfully' }, { status: 200 });
    }catch(err)
    {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


export async function GET(req) {
    try {
        const authResult = await authenticate(req);
        if (!authResult.authenticated) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userData = authResult.decoded_Data;
        const userId = userData.userId;

        // Query to check if feedback exists for the user
        const feedback = await db.select()
            .from(FEEDBACK)
            .where(eq( FEEDBACK.user_id, userId))
            // .limit(1); // Assuming `first` returns a single result or null

        console.log(feedback)

        const feedbackExists = feedback.length > 0 ? true : false;

        console.log(feedbackExists)

        return NextResponse.json({ exists: feedbackExists }, { status: 200 });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
