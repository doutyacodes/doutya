import { db } from '@/utils';
import { CAREER_SUBJECTS, SUBJECTS, TESTS, TEST_ANSWERS, TEST_QUESTIONS, USER_CAREER, USER_DETAILS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, and, gte, lte } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { GenerateTestQuiz } from '@/app/api/utils/GenerateTestQuiz';
import { getCurrentWeekOfMonth } from '@/lib/getCurrentWeekOfMonth';
import { calculateWeekFromTimestamp } from '@/app/api/utils/calculateWeekFromTimestamp';

// Helper to calculate week of the month for a given date
function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return Math.ceil((firstDay.getDay()) / 7);
}

export const maxDuration = 300; // This function can run for a maximum of 5 seconds
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
        const { birth_date, joined_date, class_Name } = await db
            .select({
                birth_date: USER_DETAILS.birth_date,
                joined_date: USER_DETAILS.joined_date,
                educationLevel: USER_DETAILS.education_level,
                academicYearStart : USER_DETAILS.academicYearStart,
                academicYearEnd : USER_DETAILS.academicYearEnd,
                className: USER_DETAILS.class_name
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

        console.log("Year:", user_days.yearsSinceJoined);       // Current year based on 52-week year cycles
        console.log("Month:", user_days.monthsSinceJoined);     // Current month (4-week months)
        console.log("Week:", user_days.weekNumber);             // Current week (within the 52-week cycle)
        console.log("Start of Week:", user_days.startOfWeek);

        // const currentYear = new Date().getFullYear();
        // const currentMonth = new Date().getMonth() + 1;

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


        const careerGroup = await db
        .select({ careerGroupId: CAREER_SUBJECTS.career_id })
        .from(CAREER_SUBJECTS)
        .where(eq(CAREER_SUBJECTS.subject_id, subjectId));

        let type1;
        let type2;

        if (careerGroup.length > 0) {
            const careerGroupId = careerGroup[0].careerGroupId;
          
            const userCareer = await db
              .select({
                type1: USER_CAREER.type1,
                type2: USER_CAREER.type2,
              })
              .from(USER_CAREER)
              .where(and(eq(USER_CAREER.user_id, userId), eq(USER_CAREER.career_group_id, careerGroupId)));
              if (userCareer.length > 0) {
                    ({ type1, type2 } = userCareer[0]); 
                }
          }

        // Helper function to fetch questions and answers
        async function fetchQuestionsAndAnswers() {
            console.log("log fetch");
            // let weekNumber;
            // if(userJoinWeek === 1){
            //     weekNumber = 1
            // } else {
            //     weekNumber = getCurrentWeekOfMonth()
            // }
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

                // console.log("data", data);
                // return data
                
        }
        
        console.log("log before fetch");
        // Fetch questions and answers
        let questionWithAnswers = await fetchQuestionsAndAnswers();
        console.log("log after fetcgh");
        // Conditional logic based on user's join week
        if (weekNumber === 1) {
            // Week 1 logic: generate quiz if no questions found
            if (questionWithAnswers.length === 0) {
                console.log("log generate");

                await GenerateTestQuiz(userId, subjectId, subjectName, age, birth_date, className, type1, type2,); // Call function to generate test quiz
                // await GenerateTestQuiz(subjectId, subjectName, age, birth_date); // Call function to generate test quiz
                questionWithAnswers = await fetchQuestionsAndAnswers(); // Retry fetching questions after generating
            }
        } else {
            // Week > 1 logic: return message if no tests available
            if (questionWithAnswers.length === 0) {
                console.log("log No testt");

                return NextResponse.json({ message: 'No tests available for the selected subject.' }, { status: 404 });
            }
        }

        if (questionWithAnswers.length === 0) {
            console.log("log No testt");

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
