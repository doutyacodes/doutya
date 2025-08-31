// app\api\getChallengesStatus
import { db } from '@/utils';
import { CHALLENGE_PROGRESS, CHALLENGES } from '@/utils/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';


export async function GET(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const scope_id = searchParams.get('id')

    try {
        // Fetch challenges based on status and userId by joining the tables
        const challenges = await db
            .select({
                challengeId: CHALLENGES.id,
                week: CHALLENGES.week,
                challenge: CHALLENGES.challenge,
                verification: CHALLENGES.verification,
                status: CHALLENGE_PROGRESS.status,
                image: CHALLENGE_PROGRESS.image
            })
            .from(CHALLENGES)
            .innerJoin(CHALLENGE_PROGRESS, and(
                eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id),
                eq(CHALLENGE_PROGRESS.user_id, userId),
                eq(CHALLENGE_PROGRESS.status, status),
                eq(CHALLENGES.scope_id, scope_id) 
            ))
            .orderBy(CHALLENGES.week);


        // If no challenges are found, return an empty array
        if (challenges.length === 0) {
            return NextResponse.json({ challenges: [] }, { status: 200 });
        }

        // Return the fetched challenges
        return NextResponse.json({ challenges }, { status: 200 });

    } catch (error) {
        console.error('Error fetching challenges:', error);
        return NextResponse.json({ error: 'An error occurred while fetching challenges' }, { status: 500 });
    }

}