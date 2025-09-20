// /api/user/personality-status/route.js
import { db } from '@/utils';
import { QUIZ_SEQUENCES, PERSONALITY_PROFILES, USER_DETAILS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and } from 'drizzle-orm';

export async function GET(req) {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Check if user has completed the personality test (quiz_id = 1 for MBTI)
        const personalityTestProgress = await db
            .select({
                isCompleted: QUIZ_SEQUENCES.isCompleted,
                typeSequence: QUIZ_SEQUENCES.type_sequence,
                createdDate: QUIZ_SEQUENCES.createddate
            })
            .from(QUIZ_SEQUENCES)
            .where(
                and(
                    eq(QUIZ_SEQUENCES.user_id, userId),
                    eq(QUIZ_SEQUENCES.quiz_id, 1) // Assuming quiz_id 1 is for personality test
                )
            )
            .execute();

        // Check if test is completed
        const isPersonalityTestCompleted = personalityTestProgress.length > 0 && 
                                         personalityTestProgress[0].isCompleted === true;

        let personalityData = null;
        let personalityType = null;

        if (isPersonalityTestCompleted && personalityTestProgress[0].typeSequence) {
            // Extract the MBTI type from type_sequence (assuming it contains the 4-letter code)
            personalityType = personalityTestProgress[0].typeSequence.slice(0, 4); // First 4 characters

            // Fetch personality profile data
            const profileData = await db
                .select({
                    data: PERSONALITY_PROFILES.data
                })
                .from(PERSONALITY_PROFILES)
                .where(eq(PERSONALITY_PROFILES.code, personalityType))
                .execute();

            if (profileData.length > 0) {
                personalityData = profileData[0].data;
            }
        }

        // Get user basic info
        const userInfo = await db
            .select({
                name: USER_DETAILS.name,
                grade: USER_DETAILS.grade
            })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .execute();

        return NextResponse.json(
            {
                isPersonalityTestCompleted,
                personalityType,
                personalityData,
                userInfo: userInfo[0] || null,
                testCompletedDate: isPersonalityTestCompleted ? personalityTestProgress[0].createdDate : null
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching personality status:', error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}