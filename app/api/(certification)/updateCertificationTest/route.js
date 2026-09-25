import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and, sum, count, lte, desc } from 'drizzle-orm';
import { CERTIFICATION_QUIZ, CERTIFICATION_USER_PROGRESS, CERTIFICATIONS, STAR_PERCENT, TEST_PROGRESS, USER_CERTIFICATION_COMPLETION, USER_TESTS, } from '@/utils/schema';

// Helper function to generate certificate ID
const generateCertificateId = () => {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');  // YYYYMMDD
    const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase(); // 6 random alphanumeric chars
    return `XCT-${datePart}-${randomPart}`;  
};

export async function POST(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { certificationId, level } = await req.json();

    try {
        // Step 1: Fetch user progress for the given Certification
        const userProgress = await db
            .select({ is_answer: CERTIFICATION_USER_PROGRESS.is_answer })
            .from(CERTIFICATION_USER_PROGRESS)
            .where(
                and(
                    eq(CERTIFICATION_USER_PROGRESS.user_id, userId), 
                    eq(CERTIFICATION_USER_PROGRESS.certification_id, certificationId)
                )
            );
                    
        // Step 2: Count how many answers are 'yes'
        const yesCount = userProgress.filter(progress => progress.is_answer === 'yes').length;

        // Step 3: Get the number of questions for the given testId from CERTIFICATION_QUIZ
        const questionCountResults = await db
            .select({
                questionCount: count(CERTIFICATION_QUIZ.id)
            })
            .from(CERTIFICATION_QUIZ)
            .where(eq(CERTIFICATION_QUIZ.certification_id, certificationId));

        const questionCount = questionCountResults[0]?.questionCount || 0;

        if (questionCount === 0) {
            return NextResponse.json({ message: 'No questions available for this Certification.' }, { status: 400 });
        }

        // Step 4: Calculate the percentage based on the number of "yes" answers
        const percentage = (yesCount / questionCount) * 100;

        // Step 5: Calculate stars from STAR_PERCENT
        const result = await db
            .select({
                stars: STAR_PERCENT.stars,
                min_percentage: STAR_PERCENT.min_percentage
            })
            .from(STAR_PERCENT)
            .where(
                lte(STAR_PERCENT.min_percentage, percentage)
            )
            .orderBy(desc(STAR_PERCENT.min_percentage))
            .limit(1);

        let stars = 0;
        if (result.length > 0) {
            stars = result[0].stars;
            console.log(`Stars for percentage ${percentage}: ${stars}`);
        } else {
            console.log('No matching stars found.');
            stars = 0; // If percentage is below minimum threshold (40%)
        }

        // Criteria: User passes if stars > 0 (i.e. score >= 40%)
        // Passing criteria: Score >= 70% (matches test overview requirements)
        const isPassed = percentage >= 70;

        // Step 6: Get certification name
        const certification = await db
            .select({ certification_name: CERTIFICATIONS.certification_name })
            .from(CERTIFICATIONS)
            .where(eq(CERTIFICATIONS.id, certificationId))
            .limit(1);

        if (certification.length === 0) {
            return NextResponse.json({ message: 'Certification not found' }, { status: 404 });
        }

        const certificationName = certification[0].certification_name;

        // Step 7: Get current attempts from USER_CERTIFICATION_COMPLETION
        const existingCompletion = await db
            .select({
                attempts: USER_CERTIFICATION_COMPLETION.attempts
            })
            .from(USER_CERTIFICATION_COMPLETION)
            .where(
                and(
                    eq(USER_CERTIFICATION_COMPLETION.user_id, userId),
                    eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId)
                )
            );

        const currentAttempts = existingCompletion.length > 0 && existingCompletion[0].attempts != null
            ? existingCompletion[0].attempts
            : 1;

        // Certificate ID only generated if passed
        const certificateId = isPassed ? generateCertificateId() : null;

        // Step 8: Update database with score, stars, completion status and attempts
        await db.update(USER_CERTIFICATION_COMPLETION)
            .set({
                score_percentage: Number(percentage.toFixed(2)),
                rating_stars: isPassed ? stars : 0,
                completed: isPassed ? 'yes' : 'no',
                certificate_id: certificateId,
                certification_name: certificationName,
                issued_at: isPassed ? new Date() : null,
                status: isPassed ? 'valid' : 'invalid',
                level: level,
                attempts: currentAttempts
            })
            .where(
                and(
                    eq(USER_CERTIFICATION_COMPLETION.user_id, userId),
                    eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId)
                )
            );
 
        return NextResponse.json({ 
            message: 'Quiz Data Completed', 
            isPassed,
            percentage: Number(percentage.toFixed(2)),
            stars,
            attempts: currentAttempts,
            remainingAttempts: isPassed ? 0 : Math.max(0, 3 - currentAttempts)
        }, { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
