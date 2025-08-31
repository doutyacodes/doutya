import { db } from '@/utils';
import { 
    CAREER_SUBJECTS, 
    QUIZ_SEQUENCES, 
    SUBJECTS, 
    TESTS, 
    TEST_ANSWERS, 
    TEST_QUESTIONS, 
    USER_CAREER, 
    USER_DETAILS,
    GENERATION_STATUS
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, gte, lte, inArray } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { GenerateTestQuiz } from '@/app/api/utils/GenerateTestQuiz';
import { getCurrentWeekOfMonth } from '@/lib/getCurrentWeekOfMonth';
import { calculateWeekFromTimestamp } from '@/app/api/utils/calculateWeekFromTimestamp';
import crypto from 'crypto'; // Add this import

// Helper to calculate week of the month for a given date
function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((firstDay.getDay()) / 7);
}

// Helper function to generate unique key hash for test generation
const generateTestKeyHash = (subjectId, age, className, yearsSinceJoined, monthsSinceJoined, weekNumber) => {
    const keyString = `test-${subjectId}-${age}-${className}-${yearsSinceJoined}-${monthsSinceJoined}-${weekNumber}`;
    return crypto.createHash('sha256').update(keyString).digest('hex');
};

// Helper function to wait with exponential backoff
const waitWithBackoff = (attempt) => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 10000; // 10 seconds
    const delay = Math.min(baseDelay * Math.pow(10, attempt), maxDelay);
    return new Promise(resolve => setTimeout(resolve, delay));
};

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { subjectId } = params;

    if (!subjectId) {
        return NextResponse.json({ message: 'Invalid subjectId' }, { status: 400 });
    }

    try {
        // Fetch user's birth date and calculate age
        const { birth_date, joined_date, class_Name, country } = await db
            .select({
                birth_date: USER_DETAILS.birth_date,
                joined_date: USER_DETAILS.joined_date,
                educationLevel: USER_DETAILS.education_level,
                academicYearStart : USER_DETAILS.academicYearStart,
                academicYearEnd : USER_DETAILS.academicYearEnd,
                class_Name: USER_DETAILS.grade,
                country: USER_DETAILS.country
            })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .then(result => result[0]);

        console.log("joined_date 2", joined_date);   

        const age = calculateAge(birth_date);
        const userJoinWeek = getWeekOfMonth(new Date(joined_date));
        const user_days = calculateWeekFromTimestamp(joined_date);

        const yearsSinceJoined = user_days.yearsSinceJoined
        const monthsSinceJoined = user_days.monthsSinceJoined
        const weekNumber = user_days.weekNumber

        console.log("Year:", user_days.yearsSinceJoined);
        console.log("Month:", user_days.monthsSinceJoined);
        console.log("Week:", user_days.weekNumber);
        console.log("Start of Week:", user_days.startOfWeek);

        const className = class_Name || 'completed';
        console.log("userJoin week", userJoinWeek);
        
        console.log("log 1");

        // Fetch subject name based on subjectId
        const subjectData = await db
            .select({ subjectName: SUBJECTS.subject_name })
            .from(SUBJECTS)
            .where(eq(SUBJECTS.subject_id, subjectId))
            .execute();
        
        const subjectName = subjectData[0].subjectName;

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

        // Helper function to fetch questions and answers
        async function fetchQuestionsAndAnswers() {
            console.log("log fetch");
             return await db
                .select({
                    subject_name: SUBJECTS.subject_name,
                    questionId: TEST_QUESTIONS.id,
                    questionText: TEST_QUESTIONS.question,
                    timer: TEST_QUESTIONS.timer,
                    answerId: TEST_ANSWERS.id,
                    answerText: TEST_ANSWERS.answer_text,
                    isCorrect: TEST_ANSWERS.answer,
                    testId: TESTS.test_id
                })
                .from(TEST_QUESTIONS)
                .leftJoin(TEST_ANSWERS, eq(TEST_QUESTIONS.id, TEST_ANSWERS.test_questionId))
                .leftJoin(TESTS, eq(TEST_QUESTIONS.test_id, TESTS.test_id))
                .leftJoin(SUBJECTS, eq(TESTS.subject_id, SUBJECTS.subject_id))
                .where(
                    and(
                        eq(TESTS.subject_id, subjectId),
                        eq(TESTS.year, yearsSinceJoined),
                        eq(TESTS.month, monthsSinceJoined),
                        eq(TESTS.week_number, weekNumber),
                        eq(TESTS.age_group, age),
                        eq(TESTS.class_name, className),
                    )
                )
                .execute();
        }
        
        console.log("log before fetch");
        // Fetch questions and answers
        let questionWithAnswers = await fetchQuestionsAndAnswers();
        console.log("log after fetch");

        // Conditional logic based on user's join week
        if (weekNumber === 1) {
            // Week 1 logic: generate quiz if no questions found
            if (questionWithAnswers.length === 0) {
                console.log("log generate");

                // Generate unique key hash for test generation
                const testKeyHash = generateTestKeyHash(subjectId, age, className, yearsSinceJoined, monthsSinceJoined, weekNumber);

                // Check current generation status for tests
                const generationStatus = await db
                    .select()
                    .from(GENERATION_STATUS)
                    .where(
                        and(
                            eq(GENERATION_STATUS.key_hash, testKeyHash),
                            eq(GENERATION_STATUS.generation_type, 'test')
                        )
                    );

                if (generationStatus.length === 0) {
                    // No generation record exists, create one and start generation
                    try {
                        await db
                            .insert(GENERATION_STATUS)
                            .values({
                                generation_type: 'test',
                                key_hash: testKeyHash,
                                status: 'in_progress',
                                generated_by: userId
                            });

                        console.log('Starting test generation...');
                        
                        // Generate test quiz
                        await GenerateTestQuiz(userId, subjectId, subjectName, age, birth_date, className, type1, type2, country, testKeyHash);

                        // Mark generation as completed
                        await db
                            .update(GENERATION_STATUS)
                            .set({ status: 'completed' })
                            .where(
                                and(
                                    eq(GENERATION_STATUS.key_hash, testKeyHash),
                                    eq(GENERATION_STATUS.generation_type, 'test')
                                )
                            );

                        console.log('Test generation completed successfully');

                    } catch (error) {
                        // Mark generation as failed
                        await db
                            .update(GENERATION_STATUS)
                            .set({ status: 'failed' })
                            .where(
                                and(
                                    eq(GENERATION_STATUS.key_hash, testKeyHash),
                                    eq(GENERATION_STATUS.generation_type, 'test')
                                )
                            );
                        
                        console.error('Test generation failed:', error);
                        throw error;
                    }
                } else {
                    const currentStatus = generationStatus[0].status;
                    
                    if (currentStatus === 'in_progress') {
                        // Wait for generation to complete with timeout
                        console.log('Test generation in progress, waiting...');
                        const maxWaitTime = 5 * 60 * 1000; // 5 minutes
                        const startTime = Date.now();
                        let attempt = 0;
                        
                        while (Date.now() - startTime < maxWaitTime) {
                            await waitWithBackoff(attempt);
                            attempt++;
                            
                            const updatedStatus = await db
                                .select()
                                .from(GENERATION_STATUS)
                                .where(
                                    and(
                                        eq(GENERATION_STATUS.key_hash, testKeyHash),
                                        eq(GENERATION_STATUS.generation_type, 'test')
                                    )
                                );
                            
                            if (updatedStatus.length > 0) {
                                const status = updatedStatus[0].status;
                                
                                if (status === 'completed') {
                                    console.log('Test generation completed by another request');
                                    break;
                                } else if (status === 'failed') {
                                    console.log('Test generation failed by another request, retrying...');
                                    
                                    // Reset status to in_progress and try generation
                                    await db
                                        .update(GENERATION_STATUS)
                                        .set({ 
                                            status: 'in_progress',
                                            generated_by: userId 
                                        })
                                        .where(
                                            and(
                                                eq(GENERATION_STATUS.key_hash, testKeyHash),
                                                eq(GENERATION_STATUS.generation_type, 'test')
                                            )
                                        );
                                    
                                    try {
                                        await GenerateTestQuiz(userId, subjectId, subjectName, age, birth_date, className, type1, type2, country, testKeyHash);

                                        await db
                                            .update(GENERATION_STATUS)
                                            .set({ status: 'completed' })
                                            .where(
                                                and(
                                                    eq(GENERATION_STATUS.key_hash, testKeyHash),
                                                    eq(GENERATION_STATUS.generation_type, 'test')
                                                )
                                            );
                                        
                                        break;
                                    } catch (retryError) {
                                        await db
                                            .update(GENERATION_STATUS)
                                            .set({ status: 'failed' })
                                            .where(
                                                and(
                                                    eq(GENERATION_STATUS.key_hash, testKeyHash),
                                                    eq(GENERATION_STATUS.generation_type, 'test')
                                                )
                                            );
                                        
                                        throw retryError;
                                    }
                                }
                            }
                        }
                        
                        // Check final status after waiting
                        const finalStatus = await db
                            .select()
                            .from(GENERATION_STATUS)
                            .where(
                                and(
                                    eq(GENERATION_STATUS.key_hash, testKeyHash),
                                    eq(GENERATION_STATUS.generation_type, 'test')
                                )
                            );
                        
                        if (finalStatus.length === 0 || finalStatus[0].status !== 'completed') {
                            return NextResponse.json({ 
                                message: 'Test generation timed out or failed. Please try again.' 
                            }, { status: 408 });
                        }
                        
                    } else if (currentStatus === 'failed') {
                        // Previous generation failed, retry
                        console.log('Previous test generation failed, retrying...');
                        
                        await db
                            .update(GENERATION_STATUS)
                            .set({ 
                                status: 'in_progress',
                                generated_by: userId 
                            })
                            .where(
                                and(
                                    eq(GENERATION_STATUS.key_hash, testKeyHash),
                                    eq(GENERATION_STATUS.generation_type, 'test')
                                )
                            );
                        
                        try {
                            await GenerateTestQuiz(userId, subjectId, subjectName, age, birth_date, className, type1, type2, country, testKeyHash);

                            await db
                                .update(GENERATION_STATUS)
                                .set({ status: 'completed' })
                                .where(
                                    and(
                                        eq(GENERATION_STATUS.key_hash, testKeyHash),
                                        eq(GENERATION_STATUS.generation_type, 'test')
                                    )
                                );
                            
                        } catch (error) {
                            await db
                                .update(GENERATION_STATUS)
                                .set({ status: 'failed' })
                                .where(
                                    and(
                                        eq(GENERATION_STATUS.key_hash, testKeyHash),
                                        eq(GENERATION_STATUS.generation_type, 'test')
                                    )
                                );
                            
                            throw error;
                        }
                    }
                    // If status is 'completed', continue with fetching questions
                }

                // Retry fetching questions after generation (or waiting)
                questionWithAnswers = await fetchQuestionsAndAnswers();
            }
        } else {
            // Week > 1 logic: return message if no tests available
            if (questionWithAnswers.length === 0) {
                console.log("log No test");
                return NextResponse.json({ message: 'No tests available for the selected subject.' }, { status: 404 });
            }
        }

        if (questionWithAnswers.length === 0) {
            console.log("log No test");
            return NextResponse.json({ message: 'No tests available for the selected subject.' }, { status: 404 });
        }

        console.log("questionWithAnswers", questionWithAnswers);
        
        // Process and return results if questions are found
        const { timer, subject_name } = questionWithAnswers[0];
        const result = questionWithAnswers.reduce((acc, curr) => {
            const { testId, questionId, questionText, answerId, answerText, isCorrect } = curr;
            if (!acc[questionId]) {
                acc[questionId] = {
                    testId: testId,
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

        return NextResponse.json({
            timer: timer,
            subjectName: subject_name,
            questions: Object.values(result),
        });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}