import { db } from '@/utils';
import { PERSONALITY_CHOICES, QUIZ_SEQUENCES, STRENGTH_CHOICES, STRENGTH_QUESTIONS, STRENGTH_QUIZ_PROGRESS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray, sql } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';


export async function GET(req, { params }) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { quizId } = params;
    
    // const quizId  = 2;
    if (!quizId) {
        return NextResponse.json({ message: 'Invalid QuizId' }, { status: 400 });
    }
    
    try {

        let totalAnswered = 0;

        // Step 1: Check if isStarted is true in the QUIZ_SEQUENCES table
        const quizSequence = await db
                            .select({
                                isStarted: QUIZ_SEQUENCES.isStarted
                            })
                            .from(QUIZ_SEQUENCES)
                            .where(
                                and(
                                    eq(QUIZ_SEQUENCES.user_id, userId),
                                    eq(QUIZ_SEQUENCES.quiz_id, quizId)
                                )
                            )
                            .execute();
        // Proceed only if a sequence exists and isStarted is true
        if (quizSequence.length > 0 && quizSequence[0].isStarted) { 
            // Geting the total no of saved quiz from USER_CAREER_PROGRESS if isStarted is true
            const totalQuestionsAnswered = await db
            .select({
                countQuestionIds: sql`COUNT(${STRENGTH_QUIZ_PROGRESS.question_id})`
            })
            .from(STRENGTH_QUIZ_PROGRESS)
            .where(eq(STRENGTH_QUIZ_PROGRESS.user_id, userId))
            .execute();

            // The total number of questions answered
            totalAnswered = totalQuestionsAnswered[0]?.countQuestionIds || 0;
        }


        // Fetch questions for the given quizId
        const questions = await db
            .select({
                questionId: STRENGTH_QUESTIONS.id,
                questionText: STRENGTH_QUESTIONS.question_text,
                strengthTypeId: STRENGTH_QUESTIONS.strength_types_id
            })
            .from(STRENGTH_QUESTIONS)
            .where(eq(STRENGTH_QUESTIONS.quiz_id, quizId))
            .execute();
        console.log("questions", quizSequence); 
        if (questions.length === 0) {
            return NextResponse.json({ message: 'No questions found for the given Quiz id' }, { status: 404 });
        }

        // Fetch choices only once
        const choices = await db
            .select({
                choiceId: STRENGTH_CHOICES.id,
                choiceText: STRENGTH_CHOICES.choice_text,
            })
            .from(STRENGTH_CHOICES)
            .execute();

            console.log("choices", choices);

        return NextResponse.json({
            quizProgress: totalAnswered,
            questions: questions,
            choices: choices // Send choices separately
        });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}