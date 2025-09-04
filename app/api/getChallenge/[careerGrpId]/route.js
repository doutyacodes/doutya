// app\api\getChallenge\[careerGrpId]
import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import axios from 'axios';
import { CAREER_GROUP, USER_DETAILS, CHALLENGES, CHALLENGE_PROGRESS, SECTOR, CLUSTER, GENERATION_STATUS } from '@/utils/schema';
import { calculateAge } from '@/lib/ageCalculate';
import { eq, and, isNull } from 'drizzle-orm';
import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
import { calculateAcademicPercentage } from '@/lib/calculateAcademicPercentage';
import crypto from 'crypto';

const languageOptions = {
    en: 'in English',
    hi: 'in Hindi',
    mar: 'in Marathi',
    ur: 'in Urdu',
    sp: 'in Spanish',
    ben: 'in Bengali',
    assa: 'in Assamese',
    ge: 'in German',
    mal: 'in Malayalam',
    tam: 'in Tamil'
};

export const maxDuration = 60;
export const dynamic = 'force-dynamic';

// Helper function to create a unique key hash for generation
function createKeyHash(scopeId, scopeType, className, country) {
    const keyString = `${scopeId}_${scopeType}_${className}_${country}`;
    return crypto.createHash('sha256').update(keyString).digest('hex');
}

// Helper function to wait for generation completion
async function waitForGeneration(keyHash, maxWaitTime = 60000) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
        const status = await db
            .select()
            .from(GENERATION_STATUS)
            .where(and(
                eq(GENERATION_STATUS.generation_type, 'challenge'),
                eq(GENERATION_STATUS.key_hash, keyHash)
            ));

        if (status.length > 0) {
            if (status[0].status === 'completed') {
                return { success: true };
            } else if (status[0].status === 'failed') {
                return { success: false, error: 'Generation failed' };
            }
        }
        
        // Wait 1 second before checking again
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    return { success: false, error: 'Timeout waiting for generation' };
}

export async function GET(req, { params }) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const language = req.headers.get('accept-language') || 'en';
    
    const { careerGrpId: scopeId } = params;

    console.log("scopeId", scopeId)

    // Fetch user details including the scope type
    const user_data = await db
        .select({
            birth_date: USER_DETAILS.birth_date,
            country: USER_DETAILS.country,
            educationLevel: USER_DETAILS.education_level,
            academicYearStart: USER_DETAILS.academicYearStart,
            academicYearEnd: USER_DETAILS.academicYearEnd,
            className: USER_DETAILS.grade,
            scope_type: USER_DETAILS.scope_type
        })
        .from(USER_DETAILS)
        .where(eq(USER_DETAILS.id, userId));

    const birth_date = user_data[0].birth_date;
    const age = calculateAge(birth_date);
    const currentAgeWeek = getCurrentWeekOfAge(birth_date);
    const country = user_data[0].country;
    const className = user_data[0]?.className || 'completed';
    const scope_type = user_data[0].scope_type;
    
    // Create unique key hash for this generation request
    const keyHash = createKeyHash(scopeId, scope_type, className, country);
    
    // Get the scope name based on the scope type
    let scope_name = '';
    let sectorDescription = null;
    
    if (scope_type === 'career') {
        const careerData = await db
            .select({
                career_name: CAREER_GROUP.career_name,
            })
            .from(CAREER_GROUP)
            .where(eq(CAREER_GROUP.id, scopeId));
        
        scope_name = careerData[0].career_name;
    } 
    else if (scope_type === 'cluster') {
        const clusterData = await db
            .select({
                name: CLUSTER.name,
            })
            .from(CLUSTER)
            .where(eq(CLUSTER.id, scopeId));
        
        scope_name = clusterData[0].name;
    }
    else if (scope_type === 'sector') {
        const sectorData = await db
            .select({
                name: SECTOR.name,
                sectorDescription: SECTOR.description,
            })
            .from(SECTOR)
            .where(eq(SECTOR.id, scopeId));
        
        scope_name = sectorData[0].name;
        sectorDescription = sectorData[0].sectorDescription;
    }

    // Check for existing challenges
    const existingChallenges = await db
        .select({
            week: CHALLENGES.week,
            challenge: CHALLENGES.challenge,
            verification: CHALLENGES.verification,
            id: CHALLENGES.id
        })
        .from(CHALLENGES)
        .leftJoin(CHALLENGE_PROGRESS, and(
            eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id),
            eq(CHALLENGE_PROGRESS.user_id, userId)  // Only check for this user's progress
        ))
        .where(
            and(
                eq(CHALLENGES.scope_id, scopeId),
                eq(CHALLENGES.scope_type, scope_type),
                eq(CHALLENGES.class_name, className),
                isNull(CHALLENGE_PROGRESS.id),  // This user hasn't completed this challenge
            )
        );

    if (existingChallenges.length > 0) {
        return NextResponse.json({ challenges: existingChallenges }, { status: 200 });
    }

    // Check if generation is already in progress
    const existingGeneration = await db
        .select()
        .from(GENERATION_STATUS)
        .where(and(
            eq(GENERATION_STATUS.generation_type, 'challenge'),
            eq(GENERATION_STATUS.key_hash, keyHash)
        ));

    if (existingGeneration.length > 0) {
        const status = existingGeneration[0].status;
        
        if (status === 'in_progress') {
            // Wait for the other request to complete
            console.log('Generation in progress, waiting...');
            const waitResult = await waitForGeneration(keyHash);
            
            if (waitResult.success) {
                // Fetch the generated challenges
                const generatedChallenges = await db
                    .select({
                        week: CHALLENGES.week,
                        challenge: CHALLENGES.challenge,
                        verification: CHALLENGES.verification,
                        id: CHALLENGES.id
                    })
                    .from(CHALLENGES)
                    .leftJoin(CHALLENGE_PROGRESS, and(
                        eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id),
                        eq(CHALLENGE_PROGRESS.user_id, userId)
                    ))
                    .where(
                        and(
                            eq(CHALLENGES.scope_id, scopeId),
                            eq(CHALLENGES.scope_type, scope_type),
                            eq(CHALLENGES.class_name, className),
                            isNull(CHALLENGE_PROGRESS.id),
                        )
                    );

                return NextResponse.json({ challenges: generatedChallenges }, { status: 200 });
            } else {
                return NextResponse.json({ error: waitResult.error }, { status: 500 });
            }
        } else if (status === 'completed') {
            // Challenges should already exist, fetch them
            const generatedChallenges = await db
                .select({
                    week: CHALLENGES.week,
                    challenge: CHALLENGES.challenge,
                    verification: CHALLENGES.verification,
                    id: CHALLENGES.id
                })
                .from(CHALLENGES)
                .leftJoin(CHALLENGE_PROGRESS, and(
                    eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id),
                    eq(CHALLENGE_PROGRESS.user_id, userId)
                ))
                .where(
                    and(
                        eq(CHALLENGES.scope_id, scopeId),
                        eq(CHALLENGES.scope_type, scope_type),
                        eq(CHALLENGES.class_name, className),
                        isNull(CHALLENGE_PROGRESS.id),
                    )
                );

            return NextResponse.json({ challenges: generatedChallenges }, { status: 200 });
        }
    }

    // Start generation process
    try {
        let shouldGenerate = true;
        
        // Try to insert generation status as "in_progress"
        try {
            await db.insert(GENERATION_STATUS).values({
                generation_type: 'challenge',
                key_hash: keyHash,
                status: 'in_progress',
                generated_by: userId,
                created_at: new Date(),
                updated_at: new Date()
            });
            console.log('Successfully inserted generation status, proceeding with generation...');
        } catch (insertError) {
            // If duplicate key error, another request is already handling this generation
            if (insertError.code === 'ER_DUP_ENTRY') {
                console.log('Generation already in progress by another request, waiting...');
                shouldGenerate = false;
                
                const waitResult = await waitForGeneration(keyHash);
                
                if (waitResult.success) {
                    // Fetch the generated challenges
                    const generatedChallenges = await db
                        .select({
                            week: CHALLENGES.week,
                            challenge: CHALLENGES.challenge,
                            verification: CHALLENGES.verification,
                            id: CHALLENGES.id
                        })
                        .from(CHALLENGES)
                        .leftJoin(CHALLENGE_PROGRESS, and(
                            eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id),
                            eq(CHALLENGE_PROGRESS.user_id, userId)
                        ))
                        .where(
                            and(
                                eq(CHALLENGES.scope_id, scopeId),
                                eq(CHALLENGES.scope_type, scope_type),
                                eq(CHALLENGES.class_name, className),
                                isNull(CHALLENGE_PROGRESS.id),
                            )
                        );

                    return NextResponse.json({ challenges: generatedChallenges }, { status: 200 });
                } else {
                    return NextResponse.json({ error: waitResult.error }, { status: 500 });
                }
            } else {
                // Re-throw if it's a different error
                throw insertError;
            }
        }
        
        // If we shouldn't generate (another request is handling it), return early
        if (!shouldGenerate) {
            return;
        }
        
        // If we reach here, this request is responsible for generation
        console.log('Starting challenge generation...');

        const prompt = `
                give a list of CLASS APPROPRIATE, LOW EFFORT, VERIFIABLE THROUGH PICTURES, 52 WEEKLY CHALLENGES LIST with verification text like - (Verification: Take a picture of the completed poster.) like week1, week2, till week52, for a student in class "${className}" (currently in week ${currentAgeWeek} of this academic year), aspiring to be in the ${scope_type.toUpperCase()} titled "${scope_name}" in ${country}, and the challenges should be random. 

            ${sectorDescription ? `\n    **Sector Description:** ${sectorDescription}\n` : ''}

            Ensure that the response is valid JSON, using the specified field names, but do not include the terms ${className} or ${country} in the data. Provide the response ${languageOptions[language] || 'in English'} keeping the keys in English only. Provide single data per week. Give it as a single JSON data without any wrapping other than [].`;

            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 3000,
                },
                {
                    headers: {
                        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
            console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
            console.log(`Total tokens Challenges: ${response.data.usage.total_tokens}`);

            let responseText = response.data.choices[0].message.content.trim();
            responseText = responseText.replace(/```json|```/g, "").trim();

            const challengesList = JSON.parse(responseText);
            console.log(responseText)

            // Insert the generated challenges into the database
            for (const challenge of challengesList) {
                await db.insert(CHALLENGES).values({
                    country: country,
                    scope_id: scopeId,
                    scope_type: scope_type,
                    week: challenge.week,
                    class_name: className,
                    challenge: challenge.challenge,
                    verification: challenge.verification,
                    created_at: new Date(),
                });
            }

            // Update generation status to "completed"
            await db.update(GENERATION_STATUS)
                .set({
                    status: 'completed',
                    updated_at: new Date()
                })
                .where(and(
                    eq(GENERATION_STATUS.generation_type, 'challenge'),
                    eq(GENERATION_STATUS.key_hash, keyHash)
                ));

            // Fetch the newly inserted challenges
            const insertedChallenges = await db
                .select({
                    week: CHALLENGES.week,
                    challenge: CHALLENGES.challenge,
                    verification: CHALLENGES.verification,
                    id: CHALLENGES.id
                })
                .from(CHALLENGES)
                .leftJoin(CHALLENGE_PROGRESS, and(
                    eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id),
                    eq(CHALLENGE_PROGRESS.user_id, userId)
                ))
                .where(
                    and(
                        eq(CHALLENGES.scope_id, scopeId),
                        eq(CHALLENGES.scope_type, scope_type),
                        eq(CHALLENGES.class_name, className),
                        isNull(CHALLENGE_PROGRESS.id),
                    )
                );

            return NextResponse.json({ challenges: insertedChallenges }, { status: 200 });

        } catch (error) {
            console.error('Error fetching or parsing data from OpenAI API:', error);
            
            // Update generation status to "failed"
            await db.update(GENERATION_STATUS)
                .set({
                    status: 'failed',
                    updated_at: new Date()
                })
                .where(and(
                    eq(GENERATION_STATUS.generation_type, 'challenge'),
                    eq(GENERATION_STATUS.key_hash, keyHash)
                ));
                
            return NextResponse.json({ error: 'Failed to generate challenges' }, { status: 500 });
        }
}
