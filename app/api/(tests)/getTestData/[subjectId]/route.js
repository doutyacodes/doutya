import { db } from '@/utils';
import { 
    QUIZ_SEQUENCES, 
    SUBJECTS, 
    TESTS, 
    TEST_ANSWERS, 
    TEST_QUESTIONS, 
    USER_CAREER, 
    USER_DETAILS,
    GENERATION_STATUS,
    CAREER_SUBJECTS, 
    USER_CLUSTER, 
    USER_SECTOR,
    CAREER_GROUP,
    CLUSTER,
    SECTOR
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
const generateTestKeyHash = (subjectId, className, yearsSinceJoined, monthsSinceJoined, weekNumber) => {
    const keyString = `test-${subjectId}-${className}-${yearsSinceJoined}-${monthsSinceJoined}-${weekNumber}`;
    return crypto.createHash('sha256').update(keyString).digest('hex');
};

// Helper function to wait with exponential backoff
const waitWithBackoff = (attempt) => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 10000; // 10 seconds
    const delay = Math.min(baseDelay * Math.pow(10, attempt), maxDelay);
    return new Promise(resolve => setTimeout(resolve, delay));
};

// Add these helper functions before your GET function (around line 30, after waitWithBackoff):

// Helper function to wait for test generation completion
const waitForTestGenerationCompletion = async (testKeyHash) => {
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
                return;
            } else if (status === 'failed') {
                throw new Error('Test generation failed by another request');
            }
        }
    }
    
    // If we reach here, generation timed out
    throw new Error('Test generation timed out');
};

// Helper function to handle failed test generation with atomic retry
const handleFailedTestGeneration = async (testKeyHash, userId, subjectId, subjectName, className, country, scopeType, scopeName, sectorDescription, userStream) => {
    try {
        // Use atomic update to claim the retry
        const updateResult = await db
            .update(GENERATION_STATUS)
            .set({ 
                status: 'in_progress',
                generated_by: userId 
            })
            .where(
                and(
                    eq(GENERATION_STATUS.key_hash, testKeyHash),
                    eq(GENERATION_STATUS.generation_type, 'test'),
                    eq(GENERATION_STATUS.status, 'failed') // Only update if still failed
                )
            );

        console.log('Attempting to retry failed test generation...');
        
        await GenerateTestQuiz(userId, subjectId, subjectName, className, country, testKeyHash, scopeType, scopeName, sectorDescription, userStream);

        await db
            .update(GENERATION_STATUS)
            .set({ status: 'completed' })
            .where(
                and(
                    eq(GENERATION_STATUS.key_hash, testKeyHash),
                    eq(GENERATION_STATUS.generation_type, 'test')
                )
            );
        
        console.log('Retry test generation completed successfully');
        
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
        
        console.error('Retry test generation failed:', error);
        throw error;
    }
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
        // Fetch user's birth date and calculat
        const { birth_date, joined_date, class_Name, country, scopeType, user_stream } = await db
            .select({
                birth_date: USER_DETAILS.birth_date,
                joined_date: USER_DETAILS.joined_date,
                educationLevel: USER_DETAILS.education_level,
                academicYearStart : USER_DETAILS.academicYearStart,
                academicYearEnd : USER_DETAILS.academicYearEnd,
                class_Name: USER_DETAILS.grade,
                country: USER_DETAILS.country,
                scopeType: USER_DETAILS.scope_type,
                user_stream: USER_DETAILS.user_stream 
            })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .then(result => result[0]);

        console.log("joined_date 2", joined_date);   

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
        const userStream = user_stream || ''
        console.log("userJoin week", userJoinWeek);
        
        console.log("log 1");

        // Fetch subject name based on subjectId
        const subjectData = await db
            .select({ subjectName: SUBJECTS.subject_name })
            .from(SUBJECTS)
            .where(eq(SUBJECTS.subject_id, subjectId))
            .execute();
        
        const subjectName = subjectData[0].subjectName;

        // First get the scope_id from CAREER_SUBJECTS
        const careerSubjectData = await db
            .select({ scope_id: CAREER_SUBJECTS.scope_id })
            .from(CAREER_SUBJECTS)
            .where(
                and(
                    eq(CAREER_SUBJECTS.subject_id, subjectId),
                    eq(CAREER_SUBJECTS.scope_type, scopeType)
                )
            );

        if (!careerSubjectData.length) {
            return NextResponse.json({ message: 'No scope information found for this subject.' }, { status: 404 });
        }

        const scopeId = careerSubjectData[0].scope_id;

        // Get scope information based on scopeType
        let scopeName = '';
        let sectorDescription = null;

        if (scopeType === 'career') {
            const careerData = await db
                .select({ careerName: CAREER_GROUP.career_name })
                .from(USER_CAREER)
                .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
                .where(
                    and(
                        eq(USER_CAREER.user_id, userId),
                        eq(USER_CAREER.career_group_id, scopeId)
                    )
                );
            
            if (careerData.length) {
                scopeName = careerData[0].careerName;
            }
        } 
        else if (scopeType === 'cluster') {
            const clusterData = await db
                .select({ clusterName: CLUSTER.name })
                .from(USER_CLUSTER)
                .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
                .where(
                    and(
                        eq(USER_CLUSTER.user_id, userId),
                        eq(USER_CLUSTER.cluster_id, scopeId)
                    )
                );
            
            if (clusterData.length) {
                scopeName = clusterData[0].clusterName;
            }
        } 
        else if (scopeType === 'sector') {
            const sectorData = await db
                .select({ 
                    sectorName: SECTOR.name,
                    sectorDescription: SECTOR.description 
                })
                .from(USER_SECTOR)
                .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
                .where(
                    and(
                        eq(USER_SECTOR.user_id, userId),
                        eq(USER_SECTOR.sector_id, scopeId)
                    )
                );
            
            if (sectorData.length) {
                scopeName = sectorData[0].sectorName;
                sectorDescription = sectorData[0].sectorDescription;
            }
        }

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
                const testKeyHash = generateTestKeyHash(249, 12, yearsSinceJoined, monthsSinceJoined, weekNumber);
                console.log("testKeyHash", testKeyHash);

                // Use a transaction to handle race conditions
                let shouldStartGeneration = false;
                let generationStatus = [];

                try {
                    // First, try to get existing status
                    generationStatus = await db
                        .select()
                        .from(GENERATION_STATUS)
                        .where(
                            and(
                                eq(GENERATION_STATUS.key_hash, testKeyHash),
                                eq(GENERATION_STATUS.generation_type, 'test')
                            )
                        );

                    if (generationStatus.length === 0) {
                        // Try to insert a new record - this will fail if another request already inserted it
                        try {
                            await db
                                .insert(GENERATION_STATUS)
                                .values({
                                    generation_type: 'test',
                                    key_hash: testKeyHash,
                                    status: 'in_progress',
                                    generated_by: userId
                                });
                            
                            shouldStartGeneration = true;
                            console.log('Created new test generation record, starting generation...');
                            
                        } catch (insertError) {
                            if (insertError.code === 'ER_DUP_ENTRY') {
                                // Another request already created the record, fetch it
                                console.log('Another request created test generation record, fetching status...');
                                generationStatus = await db
                                    .select()
                                    .from(GENERATION_STATUS)
                                    .where(
                                        and(
                                            eq(GENERATION_STATUS.key_hash, testKeyHash),
                                            eq(GENERATION_STATUS.generation_type, 'test')
                                        )
                                    );
                            } else {
                                throw insertError; // Re-throw if it's not a duplicate entry error
                            }
                        }
                    }

                    // Handle generation based on current status
                    if (shouldStartGeneration) {
                        try {
                            // This request should start the generation
                            await GenerateTestQuiz(userId, subjectId, subjectName, className, country, testKeyHash, scopeType, scopeName, sectorDescription, userStream);

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
                        // Another request is handling generation, wait for it
                        const currentStatus = generationStatus[0]?.status;
                        
                        if (currentStatus === 'in_progress') {
                            console.log('Test generation in progress by another request, waiting...');
                            await waitForTestGenerationCompletion(testKeyHash);
                            
                        } else if (currentStatus === 'failed') {
                            console.log('Previous test generation failed, attempting retry...');
                            await handleFailedTestGeneration(testKeyHash, userId, subjectId, subjectName, className, country, scopeType, scopeName, sectorDescription, userStream);
                        }
                        // If status is 'completed', continue with fetching questions
                    }

                } catch (error) {
                    console.error('Error in test generation status handling:', error);
                    throw error;
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