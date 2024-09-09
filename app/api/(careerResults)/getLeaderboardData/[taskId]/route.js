import { db } from '@/utils';
import { TEMP_LEADER, USER_DETAILS } from '@/utils/schema'; // Assuming both tables are exported from schema
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, desc } from 'drizzle-orm'; // Ensure to use correct methods from your ORM version

export async function GET(req, { params }) {

    // Authenticate the user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { taskId } = params;

    // Validate taskId
    if (!taskId) {
        return NextResponse.json({ message: 'Invalid taskId' }, { status: 400 });
    }

    try {
        // Fetch leaderboard data for the given taskId and join with user details
        const leaderboardData = await db
            .select({
                userId: TEMP_LEADER.userId,
                marks: TEMP_LEADER.marks,
                name: USER_DETAILS.name,
                username: USER_DETAILS.username
            })
            .from(TEMP_LEADER)
            .leftJoin(USER_DETAILS, eq(TEMP_LEADER.userId, USER_DETAILS.id))
            .where(eq(TEMP_LEADER.taskId, taskId))
            .orderBy(desc(TEMP_LEADER.marks))
            .execute();

        // Return the leaderboard data with user details
        return NextResponse.json({
            leaderboard: leaderboardData,
        });

    } catch (error) {
        console.error("Error fetching leaderboard data:", error);
        return NextResponse.json({ message: 'Error fetching leaderboard data' }, { status: 500 });
    }
}
