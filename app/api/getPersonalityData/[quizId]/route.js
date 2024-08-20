import { db } from '@/utils';
import { ANALYTICS_QUESTION, ANSWERS, OPTIONS, PERSONALITY_CHOICES, PERSONALITY_QUESTIONS, QUESTIONS, TASKS, USER_DETAILS, USER_TASKS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm'; // Ensure these imports match your ORM version


export async function GET(request, { params }) {

    // const authResult = await authenticate(req);
    // if (!authResult.authenticated) {
    //     return authResult.response;
    //   }

    const { quizId } = params;

    // const quizId  = 2;
    if (!quizId) {
        return NextResponse.json({ message: 'Invalid QuizId' }, { status: 400 });
    }
    
    try {
        // Fetch questions for the given quizId
        const questions = await db
            .select({
                questionId: PERSONALITY_QUESTIONS.id,
                questionText: PERSONALITY_QUESTIONS.question_text,
                personaTypeId: PERSONALITY_QUESTIONS.personality_types_id
            })
            .from(PERSONALITY_QUESTIONS)
            .where(eq(PERSONALITY_QUESTIONS.quiz_id, quizId))
            .execute();

        if (questions.length === 0) {
            return NextResponse.json({ message: 'No questions found for the given Quiz id' }, { status: 404 });
        }

        // Fetch choices only once
        const choices = await db
            .select({
                choiceId: PERSONALITY_CHOICES.id,
                choiceText: PERSONALITY_CHOICES.choice_text,
            })
            .from(PERSONALITY_CHOICES)
            .execute();

        return NextResponse.json({
            questions: questions,
            choices: choices // Send choices separately
        });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}