import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and, sum, count, lte } from 'drizzle-orm';
import { CERTIFICATION_QUIZ, CERTIFICATION_USER_PROGRESS, STAR_PERCENT, TEST_PROGRESS, USER_CERTIFICATION_COMPLETION, USER_TESTS,  } from '@/utils/schema'; // Import relevant tables


export async function POST(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { certificationId } = await req.json();

    try {
        // Step 1: Fetch user progress for the given Certification
        const userProgress = await db
        .select({ is_answer: CERTIFICATION_USER_PROGRESS.is_answer })
        .from(CERTIFICATION_USER_PROGRESS)
        .where(
            and(
                eq(CERTIFICATION_USER_PROGRESS.user_id, userId), 
                eq(CERTIFICATION_USER_PROGRESS.certification_id, certificationId)
            ))
                    
        // Step 3: Count how many answers are 'yes'
        const yesCount = userProgress.filter(progress => progress.is_answer === 'yes').length;

        // 2. Get the number of questions for the given testId from CERTIFICATION_QUIZ
        const questionCountResults = await db
                                    .select({
                                        questionCount: count(CERTIFICATION_QUIZ.id)  // Count the number of questions
                                    })
                                    .from(CERTIFICATION_QUIZ)
                                    .where(eq(CERTIFICATION_QUIZ.certification_id, certificationId));

        const questionCount = questionCountResults[0]?.questionCount || 0;

        if (questionCount === 0) {
            return NextResponse.json({ message: 'No questions available for this Certification.' }, { status: 400 });
        }

        // Step 4: Calculate the percentage based on the number of "yes" answers
        const percentage = (yesCount / questionCount) * 100;

        // 4. Calculate the percentage
        const result = await db
                    .select({
                        stars: STAR_PERCENT.stars
                    })
                    .from(STAR_PERCENT)
                    .where(
                        and(
                            lte(STAR_PERCENT.min_percentage, percentage)
                        )
                    )
                    .orderBy(STAR_PERCENT.min_percentage, 'desc') // Sort descending to get the highest applicable stars
                    .limit(1); // Only get the top result

        let stars;
        if (result.length > 0) {
            stars = result[0].stars;
            console.log(`Stars for percentage ${percentage}: ${stars}`);
            
        } else {
            console.log('No matching stars found.');
            stars = 0
        }

        await db.update(USER_CERTIFICATION_COMPLETION)
        .set({
            score_percentage: Math.round(percentage),
            rating_stars: stars,
            completed: 'yes',
        })
        .where(
            and(
                eq(USER_CERTIFICATION_COMPLETION.user_id, userId),
                eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId)
            )
        );
        
        return NextResponse.json({ message: 'Quiz Data Completed' }, { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
