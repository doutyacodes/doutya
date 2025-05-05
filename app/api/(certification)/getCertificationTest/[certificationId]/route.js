import { db } from '@/utils';
import { CERTIFICATION_QUIZ, CERTIFICATION_QUIZ_OPTIONS, CERTIFICATION_USER_PROGRESS, CERTIFICATIONS, USER_CERTIFICATION_COMPLETION, USER_DETAILS, CAREER_GROUP, TOPICS_COVERED, USER_CAREER, QUIZ_SEQUENCES, CLUSTER, SECTOR } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { GenerateCourse } from '@/app/api/utils/GenerateCourse';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

async function fetchAndFormatQuestions(certificationId, age, className, level) {
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
                eq(CERTIFICATION_QUIZ.class_name, className),
                eq(CERTIFICATION_QUIZ.level, level) 
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
    const { searchParams } = new URL(request.url);
    const level = searchParams.get("level");

    if (!certificationId || !level) {
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

        // Get user details including scope_type from USER_DETAILS
        const userDetailsResult = await db
            .select({ 
                birth_date: USER_DETAILS.birth_date,
                educationLevel: USER_DETAILS.education_level,
                academicYearStart: USER_DETAILS.academicYearStart,
                academicYearEnd: USER_DETAILS.academicYearEnd,
                className: USER_DETAILS.class_name,
                scope_type: USER_DETAILS.scope_type  // Get user's scope_type
            })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));

        if (!userDetailsResult.length) {
            return NextResponse.json({ message: 'User details not found.' }, { status: 404 });
        }

        const userDetails = userDetailsResult[0];
        const birth_date = userDetails.birth_date;
        const age = calculateAge(birth_date);
        const className = userDetails.className || 'completed';
        const userScopeType = userDetails.scope_type || 'career'; // Default to 'career' if not specified

        // Get certification details including scope type and scope id
        const certificationDetails = await db
            .select({
                certificationName: CERTIFICATIONS.certification_name,
                scopeId: CERTIFICATIONS.scope_id,
                scopeType: CERTIFICATIONS.scope_type
            })
            .from(CERTIFICATIONS)
            .where(eq(CERTIFICATIONS.id, certificationId));

        if (!certificationDetails.length) {
            return NextResponse.json({ message: 'Certification details not found.' }, { status: 404 });
        }

        const certificationName = certificationDetails[0].certificationName;
        const scopeId = certificationDetails[0].scopeId;
        const scopeType = certificationDetails[0].scopeType;

        // Get scope name based on scope type (career, cluster, or sector)
        let scopeName = '';

        if (scopeType === 'career') {
            // Get career name
            const careerResult = await db
                .select({ careerName: CAREER_GROUP.career_name })
                .from(CAREER_GROUP)
                .where(eq(CAREER_GROUP.id, scopeId));
                
            scopeName = careerResult.length ? careerResult[0].careerName : '';
        } 
        else if (scopeType === 'cluster') {
            // Get cluster name
            const clusterResult = await db
                .select({ clusterName: CLUSTER.name })
                .from(CLUSTER)
                .where(eq(CLUSTER.id, scopeId));
                
            scopeName = clusterResult.length ? clusterResult[0].clusterName : '';
        } 
        else if (scopeType === 'sector') {
            // Get sector name
            const sectorResult = await db
                .select({ sectorName: SECTOR.name })
                .from(SECTOR)
                .where(eq(SECTOR.id, scopeId));
                
            scopeName = sectorResult.length ? sectorResult[0].sectorName : '';
        }

        // Get the type1 and type2 from the QUIZ_SEQUENCES table
        const personalities = await db
            .select({
                quizId: QUIZ_SEQUENCES.quiz_id,
                typeSequence: QUIZ_SEQUENCES.type_sequence
            })
            .from(QUIZ_SEQUENCES)
            .where(
                and(
                eq(QUIZ_SEQUENCES.user_id, userId),
                inArray(QUIZ_SEQUENCES.quiz_id, [1, 2])
                )
            );

        let type1 = null;
        let type2 = null;

        for (const p of personalities) {
            if (p.quizId === 1) type1 = p.typeSequence;
            else if (p.quizId === 2) type2 = p.typeSequence;
        }

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
        let { questions } = await fetchAndFormatQuestions(certificationId, age, className, level);

        // If no questions are found, generate new course data
        if (questions.length === 0) {
            await GenerateCourse(
                userId, 
                age, 
                level, 
                certificationName, 
                scopeName, 
                certificationId, 
                birth_date, 
                className, 
                type1, 
                type2, 
                scopeType // Pass scope type to GenerateCourse
            );
            
            // Fetch the questions again after generation
            ({ questions } = await fetchAndFormatQuestions(certificationId, age, className, level));
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
            scopeName, // Use more generic scopeName instead of careerName
            scopeType, // Include scope type in the response
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