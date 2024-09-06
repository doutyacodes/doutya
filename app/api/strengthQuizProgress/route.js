import { db } from '@/utils';
import { QUIZ_SEQUENCES, STRENGTH_QUIZ_PROGRESS, USER_CAREER_PROGRESS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';


export async function POST(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { quizId, results } = await req.json(); // Directly destructuring to get quizId and results array
    const { questionId, optionId, strengthTypeId } = results

    try {
        try {
            // Check if the record already exists
            const existingSequence = await db
                .select()
                .from(QUIZ_SEQUENCES)
                .where(
                    and(
                        eq(QUIZ_SEQUENCES.user_id, userId),
                        eq(QUIZ_SEQUENCES.quiz_id, 3)
                    )
                );                
        
            if (existingSequence.length === 0) {
                // Record doesn't exist, so insert it
                await db.insert(QUIZ_SEQUENCES).values({
                    user_id: userId,
                    quiz_id: quizId,
                    type_sequence: '',
                    isStarted: true,
                    isCompleted: false,
                    createddate: new Date()
                });
                console.log("Quiz sequence inserted successfully");
            } else {
                console.log("Quiz sequence already exists, skipping insert");
            }
        } catch (error) {
            console.error("Error processing quiz sequence:", error);
            throw error;  // Rethrow the error to be caught by the outer catch block
        }
        
        // questionId, optionId, personaTypeId
        const existingRecords = await db
                                .select()
                                .from(STRENGTH_QUIZ_PROGRESS)
                                .where(
                                    and(
                                    eq(STRENGTH_QUIZ_PROGRESS.user_id, userId),
                                    eq(STRENGTH_QUIZ_PROGRESS.question_id, questionId)
                                    )
                                )
                                .execute();

        if (existingRecords.length > 0) {
            return NextResponse.json({ message: 'Records already created for this question.' }, { status: 400 });
        }
        
        try {
            const insertData = {
                user_id: userId,
                question_id: questionId,
                option_id: optionId,
                strength_type_id: strengthTypeId,
                created_at: new Date(),
            };

            await db.insert(STRENGTH_QUIZ_PROGRESS).values(insertData);
        } catch (error) {
            console.error("Error adding progress sequence:", error);
            throw error;
        }
        
        return NextResponse.json({ message: 'Progress added successfully' }, { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
    
}