import { db } from '@/utils';
import { CERTIFICATION_QUIZ, CERTIFICATION_QUIZ_OPTIONS, CERTIFICATION_USER_PROGRESS, CERTIFICATIONS, USER_CERTIFICATION_COMPLETION, USER_DETAILS, CAREER_GROUP, TOPICS_COVERED, USER_CAREER } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, sql } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { GenerateCourse } from '@/app/api/utils/GenerateCourse';

export const maxDuration = 60; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

async function fetchAndFormatQuestions(certificationId, age, className) {
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
                eq(CERTIFICATION_QUIZ.age, age),
                eq(CERTIFICATION_QUIZ.class_name, className)
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

        // Step 1: Check if certification is already completed
        const certificationStatus = await db
        .select({ completed: USER_CERTIFICATION_COMPLETION.completed })
        .from(USER_CERTIFICATION_COMPLETION)
        .where(and(
            eq(USER_CERTIFICATION_COMPLETION.user_id, userId),
            eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId)
        ));

        if (certificationStatus.length > 0 && certificationStatus[0].completed === 'yes') {
            return NextResponse.json({ isCompleted: true }, { status: 200 });
        }

        const birthDateResult = await db
            .select({ 
                birth_date: USER_DETAILS.birth_date,
                educationLevel: USER_DETAILS.education_level,
                academicYearStart : USER_DETAILS.academicYearStart,
                academicYearEnd : USER_DETAILS.academicYearEnd,
                className: USER_DETAILS.class_name
             })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));

        const birth_date = birthDateResult[0]?.birth_date;
        const age = calculateAge(birth_date);

        const className = birthDateResult[0]?.className || 'completed';

        const certification = await db
            .select({
                careerGrpId: CERTIFICATIONS.career_group_id,
                certificationName: CERTIFICATIONS.certification_name,
                careerName: CAREER_GROUP.career_name
            })
            .from(CERTIFICATIONS)
            .leftJoin(CAREER_GROUP, eq(CERTIFICATIONS.career_group_id, CAREER_GROUP.id))
            .where(eq(CERTIFICATIONS.id, certificationId));

        const certificationName = certification[0]?.certificationName;
        const careerName = certification[0]?.careerName;
        const careerGrpId = certification[0]?.careerGrpId

        //Get the type 1 and type 2 for the from the sequence table gy USER_CAREER table
        const userCareer = await db
        .select({
            type1: USER_CAREER.type1,
            type2: USER_CAREER.type2,
            country: USER_CAREER.country,
        })
        .from(USER_CAREER)
        .where(and(eq(USER_CAREER.user_id, userId), eq(USER_CAREER.career_group_id, careerGrpId)));

        const { type1, type2 } = userCareer[0];

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
        let { questions } = await fetchAndFormatQuestions(certificationId, age, className);

        // If no questions are found, generate new course data
        if (questions.length === 0) {
            await GenerateCourse(userId, age, certificationName, careerName, certificationId, birth_date, className, type1, type2);
            // await GenerateCourse(age, certificationName, careerName, certificationId, birth_date);
            // Fetch the questions again after generation
            ({ questions } = await fetchAndFormatQuestions(certificationId, age, className));
        }

        // Only fetch topics after ensuring questions exist
        // Fetch topics covered in this certification
        const topicsCovered = await db
            .select({
                topicName: TOPICS_COVERED.topic_name
            })
            .from(TOPICS_COVERED)
            .where(eq(TOPICS_COVERED.certification_id, certificationId));

        // Format topics into an array
        const topics = topicsCovered.map(topic => topic.topicName);

        // Create certification overview object
        const certificationOverview = {
            certificationName,
            careerName,
            topics
        };

        // Prepare the response with certification overview, quiz progress and questions
        return NextResponse.json({ 
            certificationOverview, 
            quizProgress: totalAnswered, 
            questions 
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}
