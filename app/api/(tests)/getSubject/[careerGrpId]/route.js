import { db } from '@/utils';
import { USER_DETAILS, SUBJECTS, CAREER_SUBJECTS, TESTS, USER_TESTS, USER_CAREER, CAREER_GROUP, USER_SUBJECT_COMPLETION } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, gte, inArray, lte } from 'drizzle-orm'; // Adjust based on your ORM version
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { processCareerSubjects } from '@/app/api/utils/fetchAndSaveSubjects';
import { calculateWeekFromTimestamp } from '@/app/api/utils/calculateWeekFromTimestamp';

export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic";
/* this api is not currently in use if used have to include the classname as well  to filer withcalss anames  */
export async function GET(req, { params }) {
    try {
        // Authenticate user
        const authResult = await authenticate(req);
        if (!authResult.authenticated) {
            return authResult.response;
        }

        const userData = authResult.decoded_Data;
        const userId = userData.userId;
        const { careerGrpId } = params;

        // Get user's birth date
        const birthDateResult = await db
            .select({ 
                birth_date: USER_DETAILS.birth_date,
                education:USER_DETAILS.education,
                educationLevel: USER_DETAILS.education_level,
                academicYearStart : USER_DETAILS.academicYearStart,
                academicYearEnd : USER_DETAILS.academicYearEnd,
                className: USER_DETAILS.class_name,
                joined_date: USER_DETAILS.joined_date,
             })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));
        
        if (!birthDateResult.length) {
            return NextResponse.json({ message: 'User birth date not found.' }, { status: 404 });
        }

        const age = calculateAge(birthDateResult[0].birth_date);
        const effectiveAge = age;
        console.log(`User age: ${age}, Effective age: ${effectiveAge}`);
        // Set className to 'completed' if it is null, undefined, '', 0
        const className = birthDateResult[0]?.className || 'completed';
        const joinedAt = birthDateResult[0]?.joined_date 

        // Check if any subjects exist for the career group
        // const careerSubjectsExist = await db
        //     .select({ subjectId: CAREER_SUBJECTS.subject_id })
        //     .from(CAREER_SUBJECTS)
        //     .where(eq(CAREER_SUBJECTS.career_id, careerGrpId));
        
        const careerSubjectsExist = await db
            .select({ subjectId: CAREER_SUBJECTS.subject_id })
            .from(CAREER_SUBJECTS)
            .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id)) // Join with SUBJECTS table
            .where(
                and(
                    eq(CAREER_SUBJECTS.career_id, careerGrpId), // Filter by career_id
                    eq(SUBJECTS.min_age, age),
                    eq(SUBJECTS.class_name, className)                  // Filter by min_age
                )
            );

        console.log("careerSubjectsExist", careerSubjectsExist );
        

        if (!careerSubjectsExist.length) {
            console.log('No subjects found, generating subjects...');

            // Fetch the user's career information including career name
            const userCareerData = await db
                .select({
                    careerGroupId: USER_CAREER.career_group_id,
                    country: USER_CAREER.country,
                    type1: USER_CAREER.type1,
                    type2: USER_CAREER.type2,
                    careerName: CAREER_GROUP.career_name // Add career name from CAREER_GROUP
                })
                .from(USER_CAREER)
                .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id)) // Join with CAREER_GROUP
                .where(
                    and(
                        eq(USER_CAREER.user_id, userId),
                        eq(USER_CAREER.career_group_id, careerGrpId)
                    )
                );

            if (!userCareerData.length) {
                return NextResponse.json({ message: 'No career information found for this user.' }, { status: 404 });
            }

            const { country, careerName, type1, type2 } = userCareerData[0];
            // await processCareerSubjects(careerName, careerGrpId, country, age, birthDateResult[0].birth_date); // Generate subjects
            await processCareerSubjects(userId, careerName, careerGrpId, country, age, birthDateResult[0].birth_date, className, type1, type2); // Generate subjects
        }

        // Fetch subjects for the career and filter by user age (or set age as 17 for older users)
        // const subjectsForCareer = await db
        //     .select({
        //         subjectId: SUBJECTS.subject_id,
        //         subjectName: SUBJECTS.subject_name,
        //         completed: USER_SUBJECT_COMPLETION.completed, // Get completion status from USER_SUBJECT_COMPLETION
        //     })
        //     .from(CAREER_SUBJECTS)
        //     .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
        //     .leftJoin(TESTS, and(eq(TESTS.subject_id, SUBJECTS.subject_id), eq(TESTS.age_group, effectiveAge)))
        //     .leftJoin(USER_SUBJECT_COMPLETION, and(eq(USER_SUBJECT_COMPLETION.user_id, userId), eq(USER_SUBJECT_COMPLETION.test_id, TESTS.test_id)))
        //     .where(
        //         and(
        //             eq(CAREER_SUBJECTS.career_id, careerGrpId),
        //             eq(SUBJECTS.min_age, effectiveAge),
        //             eq(SUBJECTS.class_name, className),
        //             // gte(SUBJECTS.max_age, effectiveAge)
        //         )
        //     );

        // Helper to get the current week of the month
        // function getCurrentWeekOfMonth() {
        //     const now = new Date();
        //     const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        //     const dayOfWeek = startOfMonth.getDay();
        //     const adjustedDate = now.getDate() + dayOfWeek;
        //     return Math.ceil(adjustedDate / 7);
        // }

        // // Get current date details
        // const currentYear = new Date().getFullYear();
        // const currentMonth = new Date().getMonth() + 1; // Months are 0-based
        // const currentWeek = getCurrentWeekOfMonth();

        const user_days = calculateWeekFromTimestamp(joinedAt);

        const yearsSinceJoined = user_days.yearsSinceJoined
        const monthsSinceJoined = user_days.monthsSinceJoined
        const weekNumber = user_days.weekNumber
        

        console.log(yearsSinceJoined, monthsSinceJoined, weekNumber)

        const subjectsForCareer = await db
            .select({
                subjectId: SUBJECTS.subject_id,
                subjectName: SUBJECTS.subject_name,
                completed: USER_SUBJECT_COMPLETION.completed,
                testID: USER_SUBJECT_COMPLETION.test_id
            })
            .from(CAREER_SUBJECTS)
            .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
            .leftJoin(
                TESTS,
                and(
                    eq(TESTS.subject_id, SUBJECTS.subject_id),
                    eq(TESTS.age_group, effectiveAge),
                    eq(TESTS.year, yearsSinceJoined),       // Filter by current year
                    eq(TESTS.month, monthsSinceJoined),     // Filter by current month
                    eq(TESTS.week_number, weekNumber) // Filter by current week
                )
            )
            .leftJoin(
                USER_SUBJECT_COMPLETION,
                and(
                    eq(USER_SUBJECT_COMPLETION.user_id, userId),
                    eq(USER_SUBJECT_COMPLETION.test_id, TESTS.test_id)
                )
            )
            .where(
                and(
                    eq(CAREER_SUBJECTS.career_id, careerGrpId),
                    eq(SUBJECTS.min_age, effectiveAge),
                    eq(SUBJECTS.class_name, className)
                )
            );

        if (!subjectsForCareer.length) {
            return NextResponse.json({ message: 'No subjects found for this career and user age.' }, { status: 400 });
        }

        console.log("subjectsForCareer", subjectsForCareer)

        // Process subjects to include completion status
        const subjectsWithCompletionStatus = subjectsForCareer.map(subject => ({
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            completed: subject.completed === 'yes' ? 'yes' : 'no', // Check if the user has completed the subject,
            testID: subject.testID
        }));

        return NextResponse.json({ subjects: subjectsWithCompletionStatus }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return NextResponse.json({ message: 'Error fetching subjects' }, { status: 500 });
    }
}
