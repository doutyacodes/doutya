import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import axios from 'axios';
import { CAREER_GROUP, USER_DETAILS, CHALLENGES, CHALLENGE_PROGRESS } from '@/utils/schema';
import { calculateAge } from '@/lib/ageCalculate';
import { eq, and, isNull } from 'drizzle-orm';
import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';

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

    const { careerGrpId } = params;

    const user_data = await db
        .select({
            birth_date: USER_DETAILS.birth_date,
            country: USER_DETAILS.country
        })
        .from(USER_DETAILS)
        .where(eq(USER_DETAILS.id, userId));

    const birth_date = user_data[0].birth_date;
    const age = calculateAge(birth_date);
    const currentAgeWeek = getCurrentWeekOfAge(birth_date)
    const country = user_data[0].country;

    const career_name = await db
        .select({
            career_name: CAREER_GROUP.career_name,
        })
        .from(CAREER_GROUP)
        .where(eq(CAREER_GROUP.id, careerGrpId));

    const career = career_name[0].career_name;

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
                eq(CHALLENGES.career_id, careerGrpId),
                isNull(CHALLENGE_PROGRESS.id)  
            )
        );

    if (existingChallenges.length > 0) {
        return NextResponse.json({ challenges: existingChallenges }, { status: 200 });
    } else {
        const prompt = `give a list of AGE APPROPRIATE, LOW EFFORT, VERIFIABLE THROUGH PICTURES, 52 WEEKLY CHALLENGES LIST with verification text like- (Verification: Take a picture of the completed poster.) like week1, week2, till week 52, for a ${age} year old (currently in week ${currentAgeWeek} of this age), aspiring TO BE A ${career} IN ${country} and the challenges should be random. Ensure that the response is valid JSON, using the specified field names, but do not include the terms ${age} or ${country} in the data. Provide the response ${languageOptions[language] || 'in English'} keeping the keys in english only.Provide single data per week.Give it as a single JSON data without any wrapping other than [].`;

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

            let responseText = response.data.choices[0].message.content.trim();
            responseText = responseText.replace(/```json|```/g, "").trim();

            const challengesList = JSON.parse(responseText);

            // Insert the generated challenges into the database
            for (const challenge of challengesList) {
                await db.insert(CHALLENGES).values({
                    age: age,
                    country: country,
                    career_id: careerGrpId,
                    week: challenge.week,
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
                        eq(CHALLENGES.career_id, careerGrpId)
                    )
                );

            return NextResponse.json({ challenges: insertedChallenges }, { status: 200 });

        } catch (error) {
            console.error('Error fetching or parsing data from OpenAI API:', error);
            return NextResponse.json({ error: 'Failed to generate challenges' }, { status: 500 });
        }
    }
}
