// import { db } from '@/utils';
// import { SUBJECTS, TESTS, USER_DETAILS, USER_SUBJECT_COMPLETION  } from '@/utils/schema';
// import { NextResponse } from 'next/server';
// import { and, eq, gte, inArray, isNull, lte } from 'drizzle-orm'; // Adjust based on your ORM version
// import { authenticate } from '@/lib/jwtMiddleware';
// import { calculateAge } from '@/lib/ageCalculate';

// export async function GET(req, { params }) {
//      // Authenticate user
//     const authResult = await authenticate(req);
//     if (!authResult.authenticated) {
//         return authResult.response;
//       }

//     const userData = authResult.decoded_Data;
//     const userId = userData.userId;

//     const { testID } = params;
// console.log("testID", testID);

//     try {
//         const birth_date=await db
//         .select({birth_date:USER_DETAILS.birth_date})
//         .from(USER_DETAILS)
//         .where(eq(USER_DETAILS.id, userId))
//         const age = calculateAge(birth_date[0].birth_date)
//         console.log(age)

//          const completionData = await db
//          .select({
//              skilled_age: USER_SUBJECT_COMPLETION.skilled_age,
//              subject_name: SUBJECTS.subject_name
//          })
//          .from(USER_SUBJECT_COMPLETION)
//          .innerJoin(TESTS, eq(USER_SUBJECT_COMPLETION.test_id, TESTS.test_id))   // First, join with TESTS
//          .innerJoin(SUBJECTS, eq(TESTS.subject_id, SUBJECTS.subject_id))         // Then, join with SUBJECTS
//          .where(
//              and(
//                  eq(USER_SUBJECT_COMPLETION.user_id, userId),
//                  eq(USER_SUBJECT_COMPLETION.test_id, testID)
//              )
//          );


//         const skilledAge = completionData.length > 0 ? completionData[0].skilled_age : null;
//         const subjectName = completionData.length > 0 ? completionData[0].subject_name : null;
//         console.log("subjectName", completionData)

//         let feedback;
//         if (skilledAge < age) {
//         feedback = `Your performance suggests there's room to grow in ${subjectName}. For your age ${age}, revisiting the basics will help strengthen your foundation. Keep practicing and you'll improve!`;
//         } else if (skilledAge === age) {
//         feedback = `Well done! You've shown a good understanding of ${subjectName} for your age ${age}. Keep up the great work and continue exploring new concepts to build on your knowledge.`;
//         } else if (skilledAge > age) {
//         feedback = `Outstanding performance! You've demonstrated advanced knowledge in ${subjectName} for your age ${age}. Keep challenging yourself with more advanced topics and continue excelling!`;
//         } else {
//         feedback = `No skilled age data available for ${subjectName}.`;
//         }
//         return NextResponse.json({ feedback }, { status: 200 });

//     } catch (error) {
//         console.error("Error fetching subjects:", error);
//         return NextResponse.json({ message: 'Error fetching subjects' }, { status: 500 });
//     }
// }


import { db } from '@/utils';
import { SUBJECTS, TESTS, USER_DETAILS, USER_SUBJECT_COMPLETION, TEST_PROGRESS, TEST_QUESTIONS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, count } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';

export async function GET(req, { params }) {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { testID } = params;

    try {
        // Get user's age
        const userDetails = await db
            .select({
                birth_date: USER_DETAILS.birth_date
            })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));
        
        const userAge = calculateAge(userDetails[0].birth_date);
        
        // Get test completion data
        const completionData = await db
            .select({
                skilled_age: USER_SUBJECT_COMPLETION.skilled_age,
                subject_name: SUBJECTS.subject_name,
                stars_awarded: USER_SUBJECT_COMPLETION.stars_awarded,
                created_at: USER_SUBJECT_COMPLETION.created_at
            })
            .from(USER_SUBJECT_COMPLETION)
            .innerJoin(TESTS, eq(USER_SUBJECT_COMPLETION.test_id, TESTS.test_id))
            .innerJoin(SUBJECTS, eq(TESTS.subject_id, SUBJECTS.subject_id))
            .where(
                and(
                    eq(USER_SUBJECT_COMPLETION.user_id, userId),
                    eq(USER_SUBJECT_COMPLETION.test_id, testID)
                )
            );
            
        // Get total number of questions for this test directly from TEST_QUESTIONS table
        const totalQuestionsResult = await db
            .select({
                count: count()
            })
            .from(TEST_QUESTIONS)
            .where(eq(TEST_QUESTIONS.test_id, testID));
            
        const totalQuestions = totalQuestionsResult[0].count;
            
        // Get correct answers count
        const correctAnswersResult = await db
            .select({
                count: count()
            })
            .from(TEST_PROGRESS)
            .where(
                and(
                    eq(TEST_PROGRESS.user_id, userId),
                    eq(TEST_PROGRESS.test_id, testID),
                    eq(TEST_PROGRESS.is_answer, "yes")
                )
            );
            
        const correctAnswers = correctAnswersResult[0].count;
        
        // Calculate accuracy
        const accuracy = totalQuestions > 0 
            ? Math.round((correctAnswers / totalQuestions) * 100) 
            : 0;

        if (completionData.length === 0) {
            return NextResponse.json(
                { message: 'No test completion data found' }, 
                { status: 404 }
            );
        }

        const { skilled_age, subject_name, stars_awarded, created_at } = completionData[0];
        
        // Generate appropriate feedback
        let feedback;
        if (skilled_age < userAge) {
            feedback = `Your performance suggests there's room to grow in ${subject_name}. For your age ${userAge}, revisiting the basics will help strengthen your foundation. Keep practicing and you'll improve!`;
        } else if (skilled_age === userAge) {
            feedback = `Well done! You've shown a good understanding of ${subject_name} for your age ${userAge}. Keep up the great work and continue exploring new concepts to build on your knowledge.`;
        } else if (skilled_age > userAge) {
            feedback = `Outstanding performance! You've demonstrated advanced knowledge in ${subject_name} for your age ${userAge}. Keep challenging yourself with more advanced topics and continue excelling!`;
        } else {
            feedback = `No skilled age data available for ${subject_name}.`;
        }

        // Prepare response data
        const responseData = {
            subjectName: subject_name,
            skilledAge: skilled_age,
            userAge,
            starsAwarded: stars_awarded,
            correctAnswers,
            totalQuestions,
            accuracy,
            feedback,
            completedAt: created_at
        };

        return NextResponse.json(responseData, { status: 200 });

    } catch (error) {
        console.error("Error fetching test results:", error);
        return NextResponse.json(
            { message: 'Error fetching test results' }, 
            { status: 500 }
        );
    }
}