import { db } from '@/utils';
import { SUBJECTS, TESTS, USER_TESTS, USER_DETAILS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, gte, sql } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(request) {
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Get the user’s joining date
        const userJoined = await db.select({ joinedDate: USER_DETAILS.joined_date })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .execute();

        if (userJoined.length === 0) {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const joinedDate = new Date(userJoined[0].joinedDate);
        const today = new Date();
        const totalWeeks = Math.ceil((today - joinedDate) / (7 * 24 * 60 * 60 * 1000)); // Weeks since joining

        // Fetch the user's completed tests, aggregating the total stars and scores per subject
        const completedTests = await db
            .select({
                subjectName: SUBJECTS.subject_name,
                totalStars: sql`SUM(${USER_TESTS.stars_awarded})`.as('totalStars'),
                totalScore: sql`SUM(${USER_TESTS.score})`.as('totalScore')
            })
            .from(USER_TESTS)
            .innerJoin(TESTS, eq(USER_TESTS.test_id, TESTS.test_id))
            .innerJoin(SUBJECTS, eq(TESTS.subject_id, SUBJECTS.subject_id))
            .where(and(eq(USER_TESTS.user_id, userId), eq(USER_TESTS.completed, 'yes')))
            .groupBy(SUBJECTS.subject_name)
            .execute();

        if (completedTests.length === 0) {
            return NextResponse.json({ message: 'No completed tests found for the user' }, { status: 404 });
        }

        // Format the results
        const weeklyTests = completedTests.map(test => {
            const passed = test.totalStars >= totalWeeks; // Adjust this logic as per your passing criteria
            return {
                subject: test.subjectName,
                score: test.totalScore,
                total: totalWeeks,
                passed: passed
            };
        });

        return NextResponse.json({ results: weeklyTests }, { status: 200 });

    } catch (error) {
        console.error("Error fetching user results:", error);
        return NextResponse.json({ message: 'Error fetching user results' }, { status: 500 });
    }
}
