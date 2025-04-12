import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { eq, and, sum, count, lte } from 'drizzle-orm';
import { STAR_PERCENT, TEST_PROGRESS, TEST_QUESTIONS, USER_DETAILS, USER_SUBJECT_COMPLETION } from '@/utils/schema'; // Import relevant tables
import { calculateAge } from '@/lib/ageCalculate';


export async function POST(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { testId } = await req.json();

    try {
         // 1. Get the sum of marks from TEST_PROGRESS table for the given user and test
         const quizResults = await db
         .select({
             is_answer: TEST_PROGRESS.is_answer
         })
         .from(TEST_PROGRESS)
         .where(
             and(
                 eq(TEST_PROGRESS.user_id, userId),
                 eq(TEST_PROGRESS.test_id, testId)
             )
         )
         const quizTotal = await db
         .select({
             totalMarks: sum(TEST_PROGRESS.marks),
         })
         .from(TEST_PROGRESS)
         .where(
             and(
                 eq(TEST_PROGRESS.user_id, userId),
                 eq(TEST_PROGRESS.test_id, testId)
             )
         )
         .groupBy(TEST_PROGRESS.is_answer);

        const totalMarks = quizTotal[0]?.totalMarks || 0;


        // Step 2: Calculate the user's birth date and current age
        const birthDateResult = await db
            .select({ birth_date: USER_DETAILS.birth_date })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));

        const birth_date = birthDateResult[0]?.birth_date;
        const age = calculateAge(birth_date);
        console.log("Age:", age);

        // Step 3: Count how many answers are 'yes'
        const yesCount = quizResults.filter(progress => progress.is_answer === 'yes').length;

        console.log("yesCount", yesCount);

        // Step 4: Determine skilled_age based on yesCount  
        let skilled_age;

        if (yesCount >= 0 && yesCount <= 5) {             // Range 1 (0-5)
            console.log("in1");
            skilled_age = age - 1;
        } else if (yesCount >= 6 && yesCount <= 14) {     // Range 2 (6-14)
            console.log("in2");
            skilled_age = age;
        } else if (yesCount >= 15 && yesCount <= 20) {    // Range 3 (15-20)
            console.log("in3");
            skilled_age = age + 1;
        } else {
            console.log("Invalid yesCount");
        }
        
        console.log("skilled_age", skilled_age);
        console.log("user_id", userId, testId);
        console.log("totalMarks", totalMarks);
            
        let stars;
        if (totalMarks >= 8000 && totalMarks <= 13999) {   // ⭐ 1 star range
            stars = 1;
            console.log(`Stars for total marks ${totalMarks}: ${stars}`);
            
        } else if (totalMarks >= 14000 && totalMarks <= 20000) {  // ⭐⭐ 2 stars range
            stars = 2;
            console.log(`Stars for total marks ${totalMarks}: ${stars}`);

        } else {
            console.log('No matching stars found.');
            stars = 0;   // ⭐ No stars if below 8000
        }

        // Step 5: Update the USER_SUBJECT_COMPLETION table
        await db
        .update(USER_SUBJECT_COMPLETION)
        .set({ 
            skilled_age,  
            stars_awarded: stars, 
            completed: 'yes' 
        })
        .where(
            and(
                eq(USER_SUBJECT_COMPLETION.user_id, userId), 
                eq(USER_SUBJECT_COMPLETION.test_id, testId)
            )
        );
 
        return NextResponse.json({ message: 'Test Data Completed' }, { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
