// import { db } from '@/utils';
// import { USER_DETAILS, SUBJECTS, CAREER_SUBJECTS, TESTS, USER_TESTS, USER_CAREER, CAREER_GROUP, USER_SUBJECT_COMPLETION } from '@/utils/schema';
// import { NextResponse } from 'next/server';
// import { and, eq, gte, inArray, lte } from 'drizzle-orm'; // Adjust based on your ORM version
// import { authenticate } from '@/lib/jwtMiddleware';
// import { calculateAge } from '@/lib/ageCalculate';
// import { processCareerSubjects } from '@/app/api/utils/fetchAndSaveSubjects';
// import { calculateWeekFromTimestamp } from '@/app/api/utils/calculateWeekFromTimestamp';

// export const maxDuration = 300; // This function can run for a maximum of 5 seconds
// export const dynamic = "force-dynamic";

// export async function GET(req, { params }) {
//     try {
//         // Authenticate user
//         const authResult = await authenticate(req);
//         if (!authResult.authenticated) {
//             return authResult.response;
//         }

//         const userData = authResult.decoded_Data;
//         const userId = userData.userId;
//         const { careerGrpId } = params;

//         // Get user's birth date
//         const birthDateResult = await db
//             .select({ 
//                 birth_date: USER_DETAILS.birth_date,
//                 education:USER_DETAILS.education,
//                 educationLevel: USER_DETAILS.education_level,
//                 academicYearStart : USER_DETAILS.academicYearStart,
//                 academicYearEnd : USER_DETAILS.academicYearEnd,
//                 className: USER_DETAILS.class_name,
//                 joined_date: USER_DETAILS.joined_date,
//              })
//             .from(USER_DETAILS)
//             .where(eq(USER_DETAILS.id, userId));
        
//         if (!birthDateResult.length) {
//             return NextResponse.json({ message: 'User birth date not found.' }, { status: 404 });
//         }

//         const age = calculateAge(birthDateResult[0].birth_date);
//         const effectiveAge = age;
//         console.log(`User age: ${age}, Effective age: ${effectiveAge}`);
//         // Set className to 'completed' if it is null, undefined, '', 0
//         const className = birthDateResult[0]?.className || 'completed';
//         const joinedAt = birthDateResult[0]?.joined_date 
        
//         const careerSubjectsExist = await db
//             .select({ subjectId: CAREER_SUBJECTS.subject_id })
//             .from(CAREER_SUBJECTS)
//             .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id)) // Join with SUBJECTS table
//             .where(
//                 and(
//                     eq(CAREER_SUBJECTS.career_id, careerGrpId), // Filter by career_id
//                     eq(SUBJECTS.min_age, age),
//                     eq(SUBJECTS.class_name, className)            // Filter by min_age
//                 )
//             );

//         console.log("careerSubjectsExist", careerSubjectsExist );
    
//         if (!careerSubjectsExist.length) {
//             console.log('No subjects found, generating subjects...');

//             // Fetch the user's career information including career name
//             const userCareerData = await db
//                 .select({
//                     careerGroupId: USER_CAREER.career_group_id,
//                     country: USER_CAREER.country,
//                     type1: USER_CAREER.type1,
//                     type2: USER_CAREER.type2,
//                     careerName: CAREER_GROUP.career_name // Add career name from CAREER_GROUP
//                 })
//                 .from(USER_CAREER)
//                 .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id)) // Join with CAREER_GROUP
//                 .where(
//                     and(
//                         eq(USER_CAREER.user_id, userId),
//                         eq(USER_CAREER.career_group_id, careerGrpId)
//                     )
//                 );

//             if (!userCareerData.length) {
//                 return NextResponse.json({ message: 'No career information found for this user.' }, { status: 404 });
//             }

//             const { country, careerName, type1, type2 } = userCareerData[0];
//             // await processCareerSubjects(careerName, careerGrpId, country, age, birthDateResult[0].birth_date); // Generate subjects
//             await processCareerSubjects(userId, careerName, careerGrpId, country, age, birthDateResult[0].birth_date, className, type1, type2); // Generate subjects
//         }

//         const user_days = calculateWeekFromTimestamp(joinedAt);
//         const yearsSinceJoined = user_days.yearsSinceJoined
//         const monthsSinceJoined = user_days.monthsSinceJoined
//         const weekNumber = user_days.weekNumber
        

//         console.log(yearsSinceJoined, monthsSinceJoined, weekNumber)

//         const subjectsForCareer = await db
//             .select({
//                 subjectId: SUBJECTS.subject_id,
//                 subjectName: SUBJECTS.subject_name,
//                 completed: USER_SUBJECT_COMPLETION.completed,
//                 testID: USER_SUBJECT_COMPLETION.test_id
//             })
//             .from(CAREER_SUBJECTS)
//             .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
//             .leftJoin(
//                 TESTS,
//                 and(
//                     eq(TESTS.subject_id, SUBJECTS.subject_id),
//                     eq(TESTS.age_group, effectiveAge),
//                     eq(TESTS.year, yearsSinceJoined),       // Filter by current year
//                     eq(TESTS.month, monthsSinceJoined),     // Filter by current month
//                     eq(TESTS.week_number, weekNumber) // Filter by current week
//                 )
//             )
//             .leftJoin(
//                 USER_SUBJECT_COMPLETION,
//                 and(
//                     eq(USER_SUBJECT_COMPLETION.user_id, userId),
//                     eq(USER_SUBJECT_COMPLETION.test_id, TESTS.test_id)
//                 )
//             )
//             .where(
//                 and(
//                     eq(CAREER_SUBJECTS.career_id, careerGrpId),
//                     eq(SUBJECTS.min_age, effectiveAge),
//                     eq(SUBJECTS.class_name, className)
//                 )
//             );

//         if (!subjectsForCareer.length) {
//             return NextResponse.json({ message: 'No subjects found for this career and user age.' }, { status: 400 });
//         }

//         console.log("subjectsForCareer", subjectsForCareer)

//         // Process subjects to include completion status
//         const subjectsWithCompletionStatus = subjectsForCareer.map(subject => ({
//             subjectId: subject.subjectId,
//             subjectName: subject.subjectName,
//             completed: subject.completed === 'yes' ? 'yes' : 'no', // Check if the user has completed the subject,
//             testID: subject.testID
//         }));

//         return NextResponse.json({ subjects: subjectsWithCompletionStatus }, { status: 200 });
        
//     } catch (error) {
//         console.error("Error fetching subjects:", error);
//         return NextResponse.json({ message: 'Error fetching subjects' }, { status: 500 });
//     }
// }


import { db } from '@/utils';
import { 
  USER_DETAILS, 
  SUBJECTS, 
  CAREER_SUBJECTS, 
  TESTS, 
  USER_TESTS, 
  USER_CAREER, 
  CAREER_GROUP, 
  USER_SUBJECT_COMPLETION,
  SECTOR,
  CLUSTER,
  USER_SECTOR,
  USER_CLUSTER
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { processCareerSubjects } from '@/app/api/utils/fetchAndSaveSubjects';
import { calculateWeekFromTimestamp } from '@/app/api/utils/calculateWeekFromTimestamp';

export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
    try {
        // Authenticate user
        const authResult = await authenticate(req);
        if (!authResult.authenticated) {
            return authResult.response;
        }

        const userData = authResult.decoded_Data;
        const userId = userData.userId;
        const { careerGrpId: scopeId } = params; 

        console.log("userId", userId)

        // Get user's details including scope_type
        const userDetailsResult = await db
            .select({ 
                birth_date: USER_DETAILS.birth_date,
                education: USER_DETAILS.education,
                educationLevel: USER_DETAILS.education_level,
                academicYearStart: USER_DETAILS.academicYearStart,
                academicYearEnd: USER_DETAILS.academicYearEnd,
                className: USER_DETAILS.class_name,
                joined_date: USER_DETAILS.joined_date,
                scope_type: USER_DETAILS.scope_type, // Get the user's scope_type
             })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));
        
        if (!userDetailsResult.length) {
            return NextResponse.json({ message: 'User details not found.' }, { status: 404 });
        }

        const userDetails = userDetailsResult[0];
        const age = calculateAge(userDetails.birth_date);
        const effectiveAge = age;
        // Set className to 'completed' if it is null, undefined, '', 0
        const className = userDetails.className || 'completed';
        const joinedAt = userDetails.joined_date;
        const scopeType = userDetails.scope_type || 'career'; // Default to 'career' if not specified
        
        console.log(`User age: ${age}, Effective age: ${effectiveAge}, Scope type: ${scopeType}`);

        // Check if subjects exist for this scope
        const subjectsExist = await db
            .select({ subjectId: CAREER_SUBJECTS.subject_id })
            .from(CAREER_SUBJECTS)
            .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
            .where(
                and(
                    eq(CAREER_SUBJECTS.scope_id, scopeId),
                    eq(CAREER_SUBJECTS.scope_type, scopeType),
                    eq(SUBJECTS.min_age, age),
                    eq(SUBJECTS.class_name, className)
                )
            );

        console.log("subjectsExist", subjectsExist);
    
        if (!subjectsExist.length) {
            console.log('No subjects found, generating subjects...');

            // Get scope information based on scope_type
            let scopeInfo = null;
            let scopeName = '';
            let country = '';
            let type1 = '';
            let type2 = '';
            
            if (scopeType === 'career') {
                // Fetch career information
                const careerData = await db
                    .select({
                        careerGroupId: USER_CAREER.career_group_id,
                        country: USER_CAREER.country,
                        type1: USER_CAREER.type1,
                        type2: USER_CAREER.type2,
                        careerName: CAREER_GROUP.career_name
                    })
                    .from(USER_CAREER)
                    .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
                    .where(
                        and(
                            eq(USER_CAREER.user_id, userId),
                            eq(USER_CAREER.career_group_id, scopeId)
                        )
                    );
                
                if (!careerData.length) {
                    return NextResponse.json({ message: 'No career information found for this user.' }, { status: 404 });
                }
                
                scopeInfo = careerData[0];
                scopeName = scopeInfo.careerName;
                country = scopeInfo.country;
                type1 = scopeInfo.type1;
                type2 = scopeInfo.type2;
            } 
            else if (scopeType === 'cluster') {
                // Fetch cluster information
                const clusterData = await db
                    .select({
                        clusterId: USER_CLUSTER.cluster_id,
                        mbtiType: USER_CLUSTER.mbti_type,
                        riasecCode: USER_CLUSTER.riasec_code,
                        clusterName: CLUSTER.name,
                        description: CLUSTER.brief_overview
                    })
                    .from(USER_CLUSTER)
                    .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
                    .where(
                        and(
                            eq(USER_CLUSTER.user_id, userId),
                            eq(USER_CLUSTER.cluster_id, scopeId)
                        )
                    );
                
                if (!clusterData.length) {
                    return NextResponse.json({ message: 'No cluster information found for this user.' }, { status: 404 });
                }
                
                scopeInfo = clusterData[0];
                scopeName = scopeInfo.clusterName;
                type1 = scopeInfo.mbtiType || '';
                type2 = scopeInfo.riasecCode || '';
            } 
            else if (scopeType === 'sector') {
                // Fetch sector information
                const sectorData = await db
                    .select({
                        sectorId: USER_SECTOR.sector_id,
                        mbtiType: USER_SECTOR.mbti_type,
                        sectorName: SECTOR.name,
                        description: SECTOR.brief_overview
                    })
                    .from(USER_SECTOR)
                    .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
                    .where(
                        and(
                            eq(USER_SECTOR.user_id, userId),
                            eq(USER_SECTOR.sector_id, scopeId)
                        )
                    );
                
                if (!sectorData.length) {
                    return NextResponse.json({ message: 'No sector information found for this user.' }, { status: 404 });
                }
                
                scopeInfo = sectorData[0];
                scopeName = scopeInfo.sectorName;
                type1 = scopeInfo.mbtiType || '';
            }

            // Get country from USER_DETAILS if not already set
            if (!country) {
                const userCountry = await db
                    .select({ country: USER_DETAILS.country })
                    .from(USER_DETAILS)
                    .where(eq(USER_DETAILS.id, userId));
                
                country = userCountry.length ? userCountry[0].country : 'global';
            }

            // Process and generate subjects
            await processCareerSubjects(
                userId, 
                scopeName, 
                scopeId, 
                country, 
                age, 
                userDetails.birth_date, 
                className, 
                type1, 
                type2,
                scopeType // Pass scope type to the function
            );
        }

        const user_days = calculateWeekFromTimestamp(joinedAt);
        const yearsSinceJoined = user_days.yearsSinceJoined;
        const monthsSinceJoined = user_days.monthsSinceJoined;
        const weekNumber = user_days.weekNumber;
        
        console.log(yearsSinceJoined, monthsSinceJoined, weekNumber);

        // Get subjects for this scope
        const subjectsForScope = await db
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
                    eq(TESTS.year, yearsSinceJoined),
                    eq(TESTS.month, monthsSinceJoined),
                    eq(TESTS.week_number, weekNumber)
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
                    eq(CAREER_SUBJECTS.scope_id, scopeId),
                    eq(CAREER_SUBJECTS.scope_type, scopeType),
                    eq(SUBJECTS.min_age, effectiveAge),
                    eq(SUBJECTS.class_name, className)
                )
            );

        if (!subjectsForScope.length) {
            return NextResponse.json({ 
                message: `No subjects found for this ${scopeType} and user age.` 
            }, { status: 400 });
        }

        console.log("subjectsForScope", subjectsForScope);

        // Process subjects to include completion status
        const subjectsWithCompletionStatus = subjectsForScope.map(subject => ({
            subjectId: subject.subjectId,
            subjectName: subject.subjectName,
            completed: subject.completed === 'yes' ? 'yes' : 'no',
            testID: subject.testID
        }));

        return NextResponse.json({ 
            subjects: subjectsWithCompletionStatus,
            scopeType: scopeType
        }, { status: 200 });
        
    } catch (error) {
        console.error("Error fetching subjects:", error);
        return NextResponse.json({ message: 'Error fetching subjects' }, { status: 500 });
    }
}