import { db } from '@/utils';
import { CERTIFICATION_QUIZ, CERTIFICATION_QUIZ_OPTIONS, CERTIFICATION_USER_PROGRESS, CERTIFICATIONS, USER_CERTIFICATION_COMPLETION, USER_DETAILS, CAREER_GROUP } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { GenerateCourse } from '@/app/api/utils/GenerateCourse';

export const maxDuration = 60; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

async function fetchAndFormatQuestions(certificationId, age) {
    const existingQuestions = await db
        .select({
            questionId: CERTIFICATION_QUIZ.id,
            question: CERTIFICATION_QUIZ.question,
            optionId: CERTIFICATION_QUIZ_OPTIONS.id,
            option_text: CERTIFICATION_QUIZ_OPTIONS.option_text,
            is_answer: CERTIFICATION_QUIZ_OPTIONS.is_answer,
        })
        .from(CERTIFICATION_QUIZ)
        .innerJoin(CERTIFICATION_QUIZ_OPTIONS, eq(CERTIFICATION_QUIZ.id, CERTIFICATION_QUIZ_OPTIONS.question_id))
        .where(
            and(
                eq(CERTIFICATION_QUIZ.certification_id, certificationId),
                eq(CERTIFICATION_QUIZ.age, age)
            )
        );

    // If existing questions are found, format them
    if (existingQuestions.length > 0) {
        const formattedQuestions = existingQuestions.reduce((acc, row) => {
            const { questionId, question, optionId, option_text, is_answer } = row;

            // Find or create a question entry in the accumulator
            let questionEntry = acc.find(q => q.question === question);
            if (!questionEntry) {
                questionEntry = { id: questionId, question, options: [] };
                acc.push(questionEntry);
            }

            // Push the option to the options array
            questionEntry.options.push({
                id: optionId,
                text: option_text,
                is_answer: is_answer === "yes" ? "yes" : "no", // Ensure is_answer is correctly set
            });

            return acc;
        }, []);

        return { questions: formattedQuestions };
    }

    // Return default values if no questions are found
    return { questions: [] };
}

export async function GET(request, { params }) {
    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { certificationId } = params;

    if (!certificationId) {
        return NextResponse.json({ message: 'Invalid certificationId' }, { status: 400 });
    }

    try {
        const birthDateResult = await db
            .select({ birth_date: USER_DETAILS.birth_date })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));

        const birth_date = birthDateResult[0]?.birth_date;
        const age = calculateAge(birth_date);

        const certification = await db
            .select({
                certificationName: CERTIFICATIONS.certification_name,
                careerName: CAREER_GROUP.career_name
            })
            .from(CERTIFICATIONS)
            .leftJoin(CAREER_GROUP, eq(CERTIFICATIONS.career_group_id, CAREER_GROUP.id))
            .where(eq(CERTIFICATIONS.id, certificationId));

        const certificationName = certification[0]?.certificationName;
        const careerName = certification[0]?.careerName;

        let totalAnswered = 0;

        // Check if isStarted is true in the USER_CERTIFICATION_COMPLETION table
        const checkProgress = await db
            .select({
                isStarted: USER_CERTIFICATION_COMPLETION.isStarted
            })
            .from(USER_CERTIFICATION_COMPLETION)
            .where(
                and(
                    eq(USER_CERTIFICATION_COMPLETION.user_id, userId),
                    eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId)
                )
            );
    
        // Proceed only if a progress exists and isStarted is true
        if (checkProgress.length > 0 && checkProgress[0].isStarted) {
            // Get the total number of saved quiz from CERTIFICATION_USER_PROGRESS if isStarted is true
            const totalQuestionsAnswered = await db
                .select({
                    countQuestionIds: sql`COUNT(${CERTIFICATION_USER_PROGRESS.quiz_id})`
                })
                .from(CERTIFICATION_USER_PROGRESS)
                .where(
                    and(
                        eq(CERTIFICATION_USER_PROGRESS.user_id, userId),
                        eq(CERTIFICATION_USER_PROGRESS.certification_id, certificationId)
                    )
                );
    
            // The total number of questions answered
            totalAnswered = totalQuestionsAnswered[0]?.countQuestionIds || 0;
        }

        // Check existing questions and fetch quiz progress
        let { questions } = await fetchAndFormatQuestions(certificationId, age);

        // If no questions are found, generate new course data
        if (questions.length === 0) {
            await GenerateCourse(age, certificationName, careerName, certificationId);
            // Fetch the questions again after generation
            ({ questions } = await fetchAndFormatQuestions(certificationId, age));
        }

        // Prepare the response with quiz progress and questions
        return NextResponse.json({ quizProgress:totalAnswered, questions }, { status: 200 });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}
