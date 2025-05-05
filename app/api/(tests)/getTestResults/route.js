import { db } from '@/utils';
import { SUBJECTS, TESTS, USER_TESTS, USER_DETAILS, CAREER_SUBJECTS, USER_SUBJECT_COMPLETION } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, gte, sql } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';

export async function GET(request) {
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const { searchParams } = new URL(request.url);
    const currentWeek = parseInt(searchParams.get('currentWeek'));
    const careerGrpId = parseInt(searchParams.get('careerGrpId'));
    
    try {
        
        // Get user's birth date
        const birthDateResult = await db
            .select({ birth_date: USER_DETAILS.birth_date })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));

        const age = calculateAge(birthDateResult[0].birth_date);

        // Fetch initial subjects for career
        const subjectsForCareer = await db
                                    .select({
                                        subjectId: SUBJECTS.subject_id,
                                        subjectName: SUBJECTS.subject_name
                                    })
                                    .from(CAREER_SUBJECTS)
                                    .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
                                    .where(
                                        and(
                                            eq(CAREER_SUBJECTS.id, careerGrpId),
                                            eq(SUBJECTS.min_age, age)
                                        )
                                    )
                                    .execute();

        const completedTests = await db
            .select({
                subjectId: SUBJECTS.subject_id,
                subjectName: SUBJECTS.subject_name,
                totalStars: sql`SUM(${USER_SUBJECT_COMPLETION.stars_awarded})`.as('totalStars'),
            })
            .from(USER_SUBJECT_COMPLETION)
            .innerJoin(TESTS, eq(USER_SUBJECT_COMPLETION.test_id, TESTS.test_id))
            .innerJoin(SUBJECTS, eq(TESTS.subject_id, SUBJECTS.subject_id))
            .where(and(eq(USER_SUBJECT_COMPLETION.user_id, userId), eq(USER_SUBJECT_COMPLETION.completed, 'yes')))
            .groupBy(SUBJECTS.subject_id, SUBJECTS.subject_name) // Include both columns in GROUP BY
            .execute();


        // Map completed test results by subject ID for quick access
        const completedTestsMap = completedTests.reduce((map, test) => {
            map[test.subjectId] = test;
            return map;
        }, {});

        console.log('completedTestsMap', completedTestsMap)

            // Format results for all subjects, using completed test data where available
            const weeklyTests = subjectsForCareer.map(subject => {

                const testData = completedTestsMap[subject.subjectId];
                const totalStars = testData ? testData.totalStars : 0;
                // const totalScore = testData ? testData.totalScore : 0;
                const passed = totalStars >= currentWeek;

                
                return {
                    subject: subject.subjectName,
                    score: totalStars,
                    total: currentWeek,
                    passed: passed,
                    completed: testData ? true : false 
                };
            });

        return NextResponse.json({ results: weeklyTests }, { status: 200 });

    } catch (error) {
        console.error("Error fetching user results:", error);
        return NextResponse.json({ message: 'Error fetching user results' }, { status: 500 });
    }
}
