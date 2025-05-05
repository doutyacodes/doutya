import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import axios from 'axios';
import { CAREER_GROUP, USER_DETAILS, CHALLENGES, CHALLENGE_PROGRESS, SECTOR, CLUSTER } from '@/utils/schema';
import { calculateAge } from '@/lib/ageCalculate';
import { eq, and, isNull } from 'drizzle-orm';
import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
import { calculateAcademicPercentage } from '@/lib/calculateAcademicPercentage';

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

export const maxDuration = 60; // This function can run for a maximum of 60 seconds
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const language = req.headers.get('accept-language') || 'en';
    
    // Get the provided parameter (could be any of the three scope types)
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
            className: USER_DETAILS.class_name,
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
    
    // Get the scope name based on the scope type
    let scope_name = '';
    
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
            })
            .from(SECTOR)
            .where(eq(SECTOR.id, scopeId));
        
        scope_name = sectorData[0].name;
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
        .leftJoin(CHALLENGE_PROGRESS, eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id))
        .where(
            and(
                eq(CHALLENGES.age, age),
                eq(CHALLENGES.scope_id, scopeId),
                eq(CHALLENGES.scope_type, scope_type),
                eq(CHALLENGES.class_name, className),
                isNull(CHALLENGE_PROGRESS.id),
            )
        );

    if (existingChallenges.length > 0) {
        return NextResponse.json({ challenges: existingChallenges }, { status: 200 });
    } else {
        const prompt = `
        give a list of AGE APPROPRIATE, LOW EFFORT, VERIFIABLE THROUGH PICTURES, 52 WEEKLY CHALLENGES LIST with verification text like - (Verification: Take a picture of the completed poster.) like week1, week2, till week52, for a ${age} year old (currently in week ${currentAgeWeek} of this age), aspiring to be in the ${scope_type.toUpperCase()} titled "${scope_name}" in ${country}, and the challenges should be random. 
        
        Ensure that the response is valid JSON, using the specified field names, but do not include the terms ${age} or ${country} in the data. Provide the response ${languageOptions[language] || 'in English'} keeping the keys in English only. Provide single data per week. Give it as a single JSON data without any wrapping other than [].`;
        
        try {
            const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                    model: "gpt-4o-mini",
                    messages: [{ role: "user", content: prompt }],
                    max_tokens: 3000, // Adjust the token limit as needed
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

            // Insert the generated challenges into the database with the new schema
            for (const challenge of challengesList) {
                await db.insert(CHALLENGES).values({
                    age: age,
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

            // Fetch the newly inserted challenges from the database
            const insertedChallenges = await db
                .select({
                    week: CHALLENGES.week,
                    challenge: CHALLENGES.challenge,
                    verification: CHALLENGES.verification,
                    id: CHALLENGES.id
                })
                .from(CHALLENGES)
                .where(
                    and(
                        eq(CHALLENGES.age, age),
                        eq(CHALLENGES.scope_id, scopeId),
                        eq(CHALLENGES.scope_type, scope_type),
                        eq(CHALLENGES.class_name, className),
                    )
                );

            return NextResponse.json({ challenges: insertedChallenges }, { status: 200 });

        } catch (error) {
            console.error('Error fetching or parsing data from OpenAI API:', error);
            return NextResponse.json({ error: 'Failed to generate challenges' }, { status: 500 });
        }
    }
}
