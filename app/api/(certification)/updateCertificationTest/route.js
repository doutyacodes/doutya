import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and, sum, count, lte, desc } from 'drizzle-orm';
import { CERTIFICATION_QUIZ, CERTIFICATION_USER_PROGRESS, CERTIFICATIONS, STAR_PERCENT, TEST_PROGRESS, USER_CERTIFICATION_COMPLETION, USER_TESTS,  } from '@/utils/schema'; // Import relevant tables

// Helper function to generate the improved certificate ID
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
            stars: STAR_PERCENT.stars,
            min_percentage: STAR_PERCENT.min_percentage
        })
        .from(STAR_PERCENT)
        .where(
            lte(STAR_PERCENT.min_percentage, percentage)
        )
        .orderBy(desc(STAR_PERCENT.min_percentage))
        .limit(1);

        let stars;
        if (result.length > 0) {
        stars = result[0].stars;
        console.log(`Stars for percentage ${percentage}: ${stars}`);
        } else {
        console.log('No matching stars found.');
        stars = 0; // If percentage is below minimum threshold (40%)
        }

        
        // const stars = result.length > 0 ? result[0].stars : 0;

        // 5️⃣ Get certification name
        const certification = await db
            .select({ certification_name: CERTIFICATIONS.certification_name })
            .from(CERTIFICATIONS)
            .where(eq(CERTIFICATIONS.id, certificationId))
            .limit(1);

        if (certification.length === 0) {
            return NextResponse.json({ message: 'Certification not found' }, { status: 404 });
        }

        const certificationName = certification[0].certification_name;

         // 6️⃣ Generate a new certificate ID
         const certificateId = generateCertificateId();
         

         // 7️⃣ Update the database with the new fields
         await db.update(USER_CERTIFICATION_COMPLETION)
             .set({
                 score_percentage: Number(percentage.toFixed(2)),
                 rating_stars: stars,
                 completed: 'yes',
                 certificate_id: certificateId,
                 certification_name: certificationName,
                 issued_at: new Date(),
                 status: 'valid',
                 level: level                      
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
