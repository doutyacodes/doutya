import { db } from '@/utils';
import { USER_DETAILS, SUBJECTS, CAREER_SUBJECTS, TESTS, USER_TESTS  } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, gte, inArray, lte } from 'drizzle-orm'; // Adjust based on your ORM version
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';

export async function GET(req, { params }) {
     // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const { careerGrpId } = params;

    try {
        const birth_date=await db
            .select({birth_date:USER_DETAILS.birth_date})
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
        const age = calculateAge(birth_date[0].birth_date)
        console.log(age)

         // Step 2: Fetch the subjects for the career and filter by user age
         const subjectsForCareer = await db
            .select({
                subjectId: SUBJECTS.subject_id,
                subjectName: SUBJECTS.subject_name,
            })
            .from(CAREER_SUBJECTS)
            .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
            .where(
                and(
                    eq(CAREER_SUBJECTS.career_id, careerGrpId),
                    lte(SUBJECTS.min_age, 17),
                    gte(SUBJECTS.max_age, 17)
                )
            );

        if (!subjectsForCareer.length) {
            throw new Error('No subjects found for this career and user age.');
            }

        // Step 3: Fetch the tests for the subjects found
        const subjectIds = subjectsForCareer.map((subject) => subject.subjectId);

        const testsForCareer = await db
            .select({
                testId: TESTS.test_id,
                testDate: TESTS.test_date,
                ageGroup: TESTS.age_group,
                subjectName: SUBJECTS.subject_name,  // Get subject name
                completed: USER_TESTS.completed,    // Get completed status
            })
            .from(TESTS)
            .innerJoin(SUBJECTS, eq(TESTS.subject_id, SUBJECTS.subject_id))  // Join with SUBJECTS to get subject name
            .leftJoin(USER_TESTS, and(
                eq(USER_TESTS.test_id, TESTS.test_id), 
                eq(USER_TESTS.user_id, userId))  // Join with USER_TESTS to get completion status for the current user
            )
            .where(inArray(TESTS.subject_id, subjectIds)); // Filter by subject IDs
            

        // Return the tasks with their completion status
        return NextResponse.json({ tasks: testsForCareer }, { status: 200 });

    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
    }
}
