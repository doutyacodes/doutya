import { db } from '@/utils'; // Ensure this path is correct
import { QUIZ_SEQUENCES, USER_CAREER, RESULTS1 } from '@/utils/schema'; // Ensure this path is correct
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware'; // Ensure this path is correct
import { desc, eq, and } from 'drizzle-orm';
import { careerFeedback } from './careerFeedback';

export async function GET(req) {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    // Extract userId from decoded token
    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Fetch data for the given userId
        const data = await db
            .select()
            .from(USER_CAREER)
            .where(eq(USER_CAREER.user_id, userId))
            .orderBy(desc(USER_CAREER.created_at))
            .execute();

        const personalityTypes = await db.select({
            typeSequence: QUIZ_SEQUENCES.type_sequence,
            quizId: QUIZ_SEQUENCES.quiz_id
        }).from(QUIZ_SEQUENCES)
            .where(eq(QUIZ_SEQUENCES.user_id, userId))
            .execute();

        const type1 = personalityTypes.find(pt => pt.quizId === 1)?.typeSequence;
        const type2 = personalityTypes.find(pt => pt.quizId === 2)?.typeSequence;


        // Generate feedback for each record asynchronously
        const resultData = await Promise.all(data.map(async (record) => {
            const { result: feedback } = await careerFeedback(type1, type2, userId, record.career_name, record.country);
            // console.log("feedback",feedback);

            // Extract the feedback text from the JSON object
            let feedbackText = '';
            try {
                const feedbackObject = JSON.parse(feedback);
                // console.log(feedbackObject)
                feedbackText = feedbackObject.feedback || ''; // Extract only the text
            } catch (error) {
                console.error('Error parsing feedback JSON:', error);
                feedbackText = 'No feedback provided'; // Default message in case of error
            }

            //extracts the strengths and weaknesses of the user
            const type_sequences = await db
                .select({
                    typeSequence: QUIZ_SEQUENCES.type_sequence
                })
                .from(QUIZ_SEQUENCES)
                .where(
                    and(
                        eq(QUIZ_SEQUENCES.user_id, userId),
                        eq(QUIZ_SEQUENCES.quiz_id, 1)
                    )
                )
                .execute();
            const type = type_sequences[0].typeSequence
            const results = await db.select().from(RESULTS1).where(eq(RESULTS1.type_sequence, type));
            const strengths=results[0].strengths
            const weaknesses=results[0].weaknesses

            // Create an object with the record data and the generated feedback
            return {
                id: record.id,
                user_id: record.user_id,
                career_name: record.career_name,
                reason_for_recommendation: record.reason_for_recommendation,
                roadmap: record.roadmap,
                present_trends: record.present_trends,
                future_prospects: record.future_prospects,
                user_description: record.user_description,
                created_at: record.created_at,
                feedback: feedbackText, 
                strengths:strengths,
                weaknesses: weaknesses
            };
        }));

        // Respond with the fetched data
        return NextResponse.json(resultData, { status: 201 });

    } catch (error) {
        console.error('Error fetching career dat:', error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
