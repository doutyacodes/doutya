import { db } from '@/utils';
import { ANALYTICS_QUESTION, ANSWERS, OPTIONS, QUESTIONS, TASKS, USER_DETAILS, USER_TASKS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm'; // Ensure these imports match your ORM version


export async function GET(request, { params }) {

    // const authResult = await authenticate(req);
    // if (!authResult.authenticated) {
    //     return authResult.response;
    //   }

    const { quizId } = params;
    
    if (!quizId) {
        return NextResponse.json({ message: 'Invalid QuizId' }, { status: 400 });
    }
    
    try {
        const quizWithOption = await db
            .select({
                questionId: ANALYTICS_QUESTION.id,
                questionText: ANALYTICS_QUESTION.question_text,
                answerId: OPTIONS.id,
                answerText: OPTIONS.option_text,
                analyticId: OPTIONS.analytic_id

            })
            .from(ANALYTICS_QUESTION)
            .leftJoin(OPTIONS, eq(ANALYTICS_QUESTION.id, OPTIONS.question_id))
            .where(eq(ANALYTICS_QUESTION.quiz_id, quizId))
            .execute();
            
        if (quizWithOption.length === 0) {
            return NextResponse.json({ message: 'No questions found for the given Task id' }, { status: 404 });
        }

        // Grouping the answers by question
        const result = quizWithOption.reduce((acc, curr) => {
            const { questionId, questionText, answerId, answerText, analyticId } = curr;
            if (!acc[questionId]) {
                acc[questionId] = {
                    id: questionId,
                    question: questionText,
                    answers: []
                };
            }
            acc[questionId].answers.push({
                id: answerId,
                text: answerText,
                analyticId: analyticId
            });
            return acc;
        }, {});

        return NextResponse.json({ questions: Object.values(result) });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}