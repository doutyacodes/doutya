import { db } from '@/utils';
import { CHALLENGES, TEMP_LEADER, TASKS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray, isNotNull, isNull } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { decryptText } from '@/utils/encryption';

export async function GET(request) {
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Fetch only the challenge IDs where career_group_id is not null
        const challengeIdsResult = await db
        .select({
            challengeId: CHALLENGES.challenge_id,
            questions: CHALLENGES.questions  // Assuming this stores the number of questions
        })
        .from(CHALLENGES)
        .where(isNull(CHALLENGES.career_group_id))  // Ensure career_group_id is not null
        .execute();

        const challengeIds = challengeIdsResult.map(challenge => challenge.challengeId);
        
        if (challengeIds.length === 0) {
            return NextResponse.json({ message: 'No challenges found for the given career_group_id' }, { status: 404 });
        }

        // Step 2: Fetch results from TEMP_LEADER table for the user and the challenge IDs
        const results = await db
            .select({
                marks: TEMP_LEADER.marks,
                challengeId: TEMP_LEADER.challengeId,
                taskId: TEMP_LEADER.taskId
            })
            .from(TEMP_LEADER)
            .where(
                and(
                    eq(TEMP_LEADER.userId, userId),
                    inArray(TEMP_LEADER.challengeId, challengeIds)
                )
            )
            .execute();

        if (results.length === 0) {
            return NextResponse.json({ message: 'No results found for the user and career group challenges' }, { status: 404 });
        }

        // Step 3: Calculate the percentage for each result
        const resultsWithPercentage = await Promise.all(
            results.map(async (result) => {
                const { marks, taskId, challengeId } = result;

                // Find the challenge that corresponds to this challengeId
                const challenge = challengeIdsResult.find(c => c.challengeId === challengeId);
                const numberOfQuestions = challenge?.questions || 1; // Default to 1 to avoid division by 0

                // Calculate total possible marks for the challenge
                const totalMarks = numberOfQuestions * 1000;

                // Get the task data for this taskId
                const task = await db
                    .select({
                        taskName: TASKS.task_name
                    })
                    .from(TASKS)
                    .where(eq(TASKS.task_id, taskId))
                    .execute();

                const taskName = task[0]?.taskName || 'Unknown Task';

                const decryptedTaskName = decryptText(taskName)

                // Calculate percentage
                const percentage = (marks / totalMarks) * 100;

                return {
                    decryptedTaskName,
                    challengeId,
                    percentage: percentage.toFixed(2) // Format to 2 decimal places
                };
            })
        );

        // Step 4: Return the results with percentage and task names
        return NextResponse.json({
            results: resultsWithPercentage
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching user results:", error);
        return NextResponse.json({ message: 'Error fetching user results' }, { status: 500 });
    }
}