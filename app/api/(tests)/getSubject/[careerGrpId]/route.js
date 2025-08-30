// import { db } from '@/utils';
// import { 
//   USER_DETAILS, 
//   SUBJECTS, 
//   CAREER_SUBJECTS, 
//   TESTS, 
//   USER_TESTS, 
//   USER_CAREER, 
//   CAREER_GROUP, 
//   USER_SUBJECT_COMPLETION,
//   SECTOR,
//   CLUSTER,
//   USER_SECTOR,
//   USER_CLUSTER
// } from '@/utils/schema';
// import { NextResponse } from 'next/server';
// import { and, eq, gte, inArray, lte } from 'drizzle-orm';
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
//         const { careerGrpId: scopeId } = params; 

//         console.log("userId", userId)

//         // Get user's details including scope_type
//         const userDetailsResult = await db
//             .select({ 
//                 birth_date: USER_DETAILS.birth_date,
//                 education: USER_DETAILS.education,
//                 educationLevel: USER_DETAILS.education_level,
//                 academicYearStart: USER_DETAILS.academicYearStart,
//                 academicYearEnd: USER_DETAILS.academicYearEnd,
//                 className: USER_DETAILS.grade,
//                 joined_date: USER_DETAILS.joined_date,
//                 scope_type: USER_DETAILS.scope_type, // Get the user's scope_type
//              })
//             .from(USER_DETAILS)
//             .where(eq(USER_DETAILS.id, userId));
        
//         if (!userDetailsResult.length) {
//             return NextResponse.json({ message: 'User details not found.' }, { status: 404 });
//         }

//         const userDetails = userDetailsResult[0];
//         const age = calculateAge(userDetails.birth_date);
//         const effectiveAge = age;
//         // Set className to 'completed' if it is null, undefined, '', 0
//         const className = userDetails.className || 'completed';
//         const joinedAt = userDetails.joined_date;
//         const scopeType = userDetails.scope_type || 'career'; // Default to 'career' if not specified
        
//         console.log(`User age: ${age}, Effective age: ${effectiveAge}, Scope type: ${scopeType}`);

//         // Check if subjects exist for this scope
//         const subjectsExist = await db
//             .select({ subjectId: CAREER_SUBJECTS.subject_id })
//             .from(CAREER_SUBJECTS)
//             .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
//             .where(
//                 and(
//                     eq(CAREER_SUBJECTS.scope_id, scopeId),
//                     eq(CAREER_SUBJECTS.scope_type, scopeType),
//                     eq(SUBJECTS.min_age, age),
//                     eq(SUBJECTS.class_name, className)
//                 )
//             );

//         console.log("subjectsExist", subjectsExist);
    
//         if (!subjectsExist.length) {
//             console.log('No subjects found, generating subjects...');

//             // Get scope information based on scope_type
//             let scopeInfo = null;
//             let scopeName = '';
//             let country = '';
//             let type1 = '';
//             let type2 = '';
            
//             if (scopeType === 'career') {
//                 // Fetch career information
//                 const careerData = await db
//                     .select({
//                         careerGroupId: USER_CAREER.career_group_id,
//                         country: USER_CAREER.country,
//                         type1: USER_CAREER.type1,
//                         type2: USER_CAREER.type2,
//                         careerName: CAREER_GROUP.career_name
//                     })
//                     .from(USER_CAREER)
//                     .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
//                     .where(
//                         and(
//                             eq(USER_CAREER.user_id, userId),
//                             eq(USER_CAREER.career_group_id, scopeId)
//                         )
//                     );
                
//                 if (!careerData.length) {
//                     return NextResponse.json({ message: 'No career information found for this user.' }, { status: 404 });
//                 }
                
//                 scopeInfo = careerData[0];
//                 scopeName = scopeInfo.careerName;
//                 country = scopeInfo.country;
//                 type1 = scopeInfo.type1;
//                 type2 = scopeInfo.type2;
//             } 
//             else if (scopeType === 'cluster') {
//                 // Fetch cluster information
//                 const clusterData = await db
//                     .select({
//                         clusterId: USER_CLUSTER.cluster_id,
//                         mbtiType: USER_CLUSTER.mbti_type,
//                         riasecCode: USER_CLUSTER.riasec_code,
//                         clusterName: CLUSTER.name,
//                         description: CLUSTER.brief_overview
//                     })
//                     .from(USER_CLUSTER)
//                     .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
//                     .where(
//                         and(
//                             eq(USER_CLUSTER.user_id, userId),
//                             eq(USER_CLUSTER.cluster_id, scopeId)
//                         )
//                     );
                
//                 if (!clusterData.length) {
//                     return NextResponse.json({ message: 'No cluster information found for this user.' }, { status: 404 });
//                 }
                
//                 scopeInfo = clusterData[0];
//                 scopeName = scopeInfo.clusterName;
//                 type1 = scopeInfo.mbtiType || '';
//                 type2 = scopeInfo.riasecCode || '';
//             } 
//             else if (scopeType === 'sector') {
//                 // Fetch sector information
//                 const sectorData = await db
//                     .select({
//                         sectorId: USER_SECTOR.sector_id,
//                         mbtiType: USER_SECTOR.mbti_type,
//                         sectorName: SECTOR.name,
//                         description: SECTOR.brief_overview
//                     })
//                     .from(USER_SECTOR)
//                     .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
//                     .where(
//                         and(
//                             eq(USER_SECTOR.user_id, userId),
//                             eq(USER_SECTOR.sector_id, scopeId)
//                         )
//                     );
                
//                 if (!sectorData.length) {
//                     return NextResponse.json({ message: 'No sector information found for this user.' }, { status: 404 });
//                 }
                
//                 scopeInfo = sectorData[0];
//                 scopeName = scopeInfo.sectorName;
//                 type1 = scopeInfo.mbtiType || '';
//             }

//             // Get country from USER_DETAILS if not already set
//             if (!country) {
//                 const userCountry = await db
//                     .select({ country: USER_DETAILS.country })
//                     .from(USER_DETAILS)
//                     .where(eq(USER_DETAILS.id, userId));
                
//                 country = userCountry.length ? userCountry[0].country : 'global';
//             }

//             // Process and generate subjects
//             await processCareerSubjects(
//                 userId, 
//                 scopeName, 
//                 scopeId, 
//                 country,
//                 age,
//                 userDetails.birth_date, 
//                 className,
//                 type1,
//                 type2,
//                 scopeType // Pass scope type to the functio
//             );
//         }

//         const user_days = calculateWeekFromTimestamp(joinedAt);
//         const yearsSinceJoined = user_days.yearsSinceJoined;
//         const monthsSinceJoined = user_days.monthsSinceJoined;
//         const weekNumber = user_days.weekNumber;
        
//         console.log(yearsSinceJoined, monthsSinceJoined, weekNumber);

//         // Get subjects for this scope
//         const subjectsForScope = await db
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
//                     eq(TESTS.year, yearsSinceJoined),
//                     eq(TESTS.month, monthsSinceJoined),
//                     eq(TESTS.week_number, weekNumber)
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
//                     eq(CAREER_SUBJECTS.scope_id, scopeId),
//                     eq(CAREER_SUBJECTS.scope_type, scopeType),
//                     eq(SUBJECTS.min_age, effectiveAge),
//                     eq(SUBJECTS.class_name, className)
//                 )
//             );

//         if (!subjectsForScope.length) {
//             return NextResponse.json({ 
//                 message: `No subjects found for this ${scopeType} and user age.` 
//             }, { status: 400 });
//         }

//         console.log("subjectsForScope", subjectsForScope);

//         // Process subjects to include completion status
//         const subjectsWithCompletionStatus = subjectsForScope.map(subject => ({
//             subjectId: subject.subjectId,
//             subjectName: subject.subjectName,
//             completed: subject.completed === 'yes' ? 'yes' : 'no',
//             testID: subject.testID
//         }));

//         return NextResponse.json({ 
//             subjects: subjectsWithCompletionStatus,
//             scopeType: scopeType
//         }, { status: 200 });
        
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
  USER_CLUSTER,
  SUBJECT_GENERATION_STATUS // Add this import
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, gte, inArray, lte } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { processCareerSubjects } from '@/app/api/utils/fetchAndSaveSubjects';
import { calculateWeekFromTimestamp } from '@/app/api/utils/calculateWeekFromTimestamp';
import crypto from 'crypto'; // Add this import

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Helper function to generate unique key hash for subject generation
const generateKeyHash = (scopeId, scopeType, age, className, country, type1, type2) => {
    const keyString = `${scopeId}-${scopeType}-${age}-${className}-${country}-${type1 || ''}-${type2 || ''}`;
    return crypto.createHash('sha256').update(keyString).digest('hex');
};

// Helper function to wait with exponential backoff
const waitWithBackoff = (attempt) => {
    const baseDelay = 1000; // 1 second
    const maxDelay = 10000; // 10 seconds
    const delay = Math.min(baseDelay * Math.pow(10, attempt), maxDelay);
    return new Promise(resolve => setTimeout(resolve, delay));
};

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
                className: USER_DETAILS.grade,
                joined_date: USER_DETAILS.joined_date,
                scope_type: USER_DETAILS.scope_type,
            })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));
        
        if (!userDetailsResult.length) {
            return NextResponse.json({ message: 'User details not found.' }, { status: 404 });
        }

        const userDetails = userDetailsResult[0];
        const age = calculateAge(userDetails.birth_date);
        const effectiveAge = age;
        const className = userDetails.className || 'completed';
        const joinedAt = userDetails.joined_date;
        const scopeType = userDetails.scope_type || 'career';
        
        console.log(`User age: ${age}, Effective age: ${effectiveAge}, Scope type: ${scopeType}`);

        // Get scope information first to generate key hash
        let scopeInfo = null;
        let scopeName = '';
        let country = '';
        let type1 = '';
        let type2 = '';
        
        if (scopeType === 'career') {
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

        // Generate unique key hash for this subject generation request
        const keyHash = generateKeyHash(scopeId, scopeType, age, className, country, type1, type2);

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
            console.log('No subjects found, checking generation status...');

            // Check current generation status
            const generationStatus = await db
                .select()
                .from(SUBJECT_GENERATION_STATUS)
                .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));

            if (generationStatus.length === 0) {
                // No generation record exists, create one and start generation
                try {
                    await db
                        .insert(SUBJECT_GENERATION_STATUS)
                        .values({
                            key_hash: keyHash,
                            status: 'in_progress',
                            generated_by: userId
                        });

                    console.log('Starting subject generation...');
                    
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
                        scopeType
                    );

                    // Mark generation as completed
                    await db
                        .update(SUBJECT_GENERATION_STATUS)
                        .set({ status: 'completed' })
                        .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));

                    console.log('Subject generation completed successfully');

                } catch (error) {
                    // Mark generation as failed
                    await db
                        .update(SUBJECT_GENERATION_STATUS)
                        .set({ status: 'failed' })
                        .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));
                    
                    console.error('Subject generation failed:', error);
                    throw error;
                }
            } else {
                const currentStatus = generationStatus[0].status;
                
                if (currentStatus === 'in_progress') {
                    // Wait for generation to complete with timeout
                    console.log('Subject generation in progress, waiting...');
                    const maxWaitTime = 5 * 60 * 1000; // 5 minutes
                    const startTime = Date.now();
                    let attempt = 0;
                    
                    while (Date.now() - startTime < maxWaitTime) {
                        await waitWithBackoff(attempt);
                        attempt++;
                        
                        const updatedStatus = await db
                            .select()
                            .from(SUBJECT_GENERATION_STATUS)
                            .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));
                        
                        if (updatedStatus.length > 0) {
                            const status = updatedStatus[0].status;
                            
                            if (status === 'completed') {
                                console.log('Subject generation completed by another request');
                                break;
                            } else if (status === 'failed') {
                                console.log('Subject generation failed by another request, retrying...');
                                
                                // Reset status to in_progress and try generation
                                await db
                                    .update(SUBJECT_GENERATION_STATUS)
                                    .set({ 
                                        status: 'in_progress',
                                        generated_by: userId 
                                    })
                                    .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));
                                
                                try {
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
                                        scopeType
                                    );

                                    await db
                                        .update(SUBJECT_GENERATION_STATUS)
                                        .set({ status: 'completed' })
                                        .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));
                                    
                                    break;
                                } catch (retryError) {
                                    await db
                                        .update(SUBJECT_GENERATION_STATUS)
                                        .set({ status: 'failed' })
                                        .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));
                                    
                                    throw retryError;
                                }
                            }
                        }
                    }
                    
                    // Check final status after waiting
                    const finalStatus = await db
                        .select()
                        .from(SUBJECT_GENERATION_STATUS)
                        .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));
                    
                    if (finalStatus.length === 0 || finalStatus[0].status !== 'completed') {
                        return NextResponse.json({ 
                            message: 'Subject generation timed out or failed. Please try again.' 
                        }, { status: 408 });
                    }
                    
                } else if (currentStatus === 'failed') {
                    // Previous generation failed, retry
                    console.log('Previous generation failed, retrying...');
                    
                    await db
                        .update(SUBJECT_GENERATION_STATUS)
                        .set({ 
                            status: 'in_progress',
                            generated_by: userId 
                        })
                        .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));
                    
                    try {
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
                            scopeType
                        );

                        await db
                            .update(SUBJECT_GENERATION_STATUS)
                            .set({ status: 'completed' })
                            .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));
                        
                    } catch (error) {
                        await db
                            .update(SUBJECT_GENERATION_STATUS)
                            .set({ status: 'failed' })
                            .where(eq(SUBJECT_GENERATION_STATUS.key_hash, keyHash));
                        
                        throw error;
                    }
                }
                // If status is 'completed', continue with fetching subjects
            }
        }

        // Continue with the rest of your existing code...
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