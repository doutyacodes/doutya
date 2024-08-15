import { db } from '@/utils';
import { ANSWERS, QUESTIONS, TASKS, USER_DETAILS, USER_TASKS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm'; // Ensure these imports match your ORM version


export async function GET(request, { params }) {
    const { taskId } = params;
    console.log("taskId", taskId);
    
    if (!taskId) {
        return NextResponse.json({ message: 'Invalid task_id' }, { status: 400 });
    }

    try {
        
        const questionWithAnswers = await db
            .select({
                questionId: QUESTIONS.id,
                questionText: QUESTIONS.question,
                answerId: ANSWERS.id,
                answerText: ANSWERS.answer_text,
                isCorrect: ANSWERS.answer,
            })
            .from(QUESTIONS)
            .leftJoin(ANSWERS, eq(QUESTIONS.id, ANSWERS.question_id))
            .where(eq(QUESTIONS.task_id, taskId))
            .execute();

        if (questionWithAnswers.length === 0) {
            return NextResponse.json({ message: 'No questions found for the given Task id' }, { status: 404 });
        }

        // Grouping the answers by question
        const result = questionWithAnswers.reduce((acc, curr) => {
            const { questionId, questionText, answerId, answerText, isCorrect } = curr;
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
                isCorrect: isCorrect,
            });
            return acc;
        }, {});

        return NextResponse.json({ questions: Object.values(result) });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}