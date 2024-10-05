import { db } from '@/utils';
import { CAREER_GROUP, CAREER_SUBJECTS, SUBJECTS, TESTS, USER_CAREER, USER_DETAILS, USER_TESTS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm'; // Adjust based on your ORM version
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import axios from 'axios';

const languageOptions = {
  en: 'in English',
  hi: 'in Hindi',
  mar: 'in Marathi',
  ur: 'in Urdu',
  sp: 'in Spanish',
  ben: 'in Bengali',
  assa: 'in Assamese',
  ge: 'in German'
};

export const maxDuration = 40; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';


export async function GET(req, { params }) {
  console.log('generating')
     // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const language = req.headers.get('accept-language') || 'en';

    const { careerGrpId } = params;

    try {

            // Step 1: Check if feedback is already present in the USER_CAREER table
            const userCareer = await db
            .select({
                feedback: USER_CAREER.feedback,
                type1: USER_CAREER.type1,
                type2: USER_CAREER.type2,
                country: USER_CAREER.country,
            })
            .from(USER_CAREER)
            .where(and(eq(USER_CAREER.user_id, userId), eq(USER_CAREER.career_group_id, careerGrpId)));

            console.log("userCareer", userCareer);
            

            // If feedback exists, return it
            if (userCareer.length > 0 && userCareer[0].feedback && userCareer[0].feedback !== 'null') {
                console.log("Present");
                return NextResponse.json({ feedback: userCareer[0].feedback }, { status: 200 });
            }

            // Step 2: If feedback is not present, fetch required fields to generate feedback
            const birthDateResult = await db
                .select({ birth_date: USER_DETAILS.birth_date })
                .from(USER_DETAILS)
                .where(eq(USER_DETAILS.id, userId));

            const birth_date = birthDateResult[0]?.birth_date;
            const age = calculateAge(birth_date);

            // Fetch career name from the CAREER_GROUP table
            const careerGroup = await db
                .select({ career_name: CAREER_GROUP.career_name })
                .from(CAREER_GROUP)
                .where(eq(CAREER_GROUP.id, careerGrpId));

            const career_name = careerGroup[0]?.career_name;
            const { type1, type2, country } = userCareer[0];
          
            const FINAL_PROMPT = `Provide a simple and concise feedback for an individual of age ${age} with a ${type1} personality type and ${type2} RIASEC interest types in the field of ${career_name}${country ? " in " + country : ""}. The feedback should highlight key areas for improvement in this career, such as time management, organizational skills, and other relevant skills. Avoid lengthy descriptions and complex formatting. Ensure the response is valid JSON and exclude the terms '${type1}' and 'RIASEC' from the data. Provide the response ${languageOptions[language] || 'in English'} keeping the keys in english only. Give it as a single JSON data without any wrapping other than {}`;
          
          
              const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                  model: "gpt-4o-mini", // or 'gpt-4' if you have access
                  messages: [{ role: "user", content: FINAL_PROMPT }],
                  max_tokens: 1500,
                },
                {
                  headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log("API request completed.");
              let responseText = response.data.choices[0].message.content.trim();
              responseText = responseText.replace(/```json|```/g, "").trim();
              console.log("responseText",responseText);
              const parsedFeedback = JSON.parse(responseText);
              console.log(parsedFeedback)

            // Step 4: Save the generated feedback in the USER_CAREER table
            await db
                .update(USER_CAREER)
                .set({
                    feedback: parsedFeedback.feedback, // Update the type_sequence field
                })
                .where(and(eq(USER_CAREER.user_id, userId), eq(USER_CAREER.career_group_id, careerGrpId)));

            // Return the generated feedback
            return NextResponse.json({ feedback: parsedFeedback.feedback }, { status: 200 });



    } catch (error) {
        console.error("Error fetching or generating feedback:", error);
        return NextResponse.json({ message: 'Error fetching or generating feedback' }, { status: 500 });
    }
}