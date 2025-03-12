import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { QUIZ_SEQUENCES } from '@/utils/schema';
import { eq,and } from 'drizzle-orm';
import { db } from '@/utils';
import axios from 'axios';

export const maxDuration = 40; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

export async function GET(req)
{
    console.log('got')
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    
    const userId = userData.userId;

    const url = new URL(req.url);
    const country = url.searchParams.get('country') || 'your country';
    const industry = url.searchParams.get('industry') || null;

    console.log("country", country)
    console.log("industry", industry)

    const personality3 = await db.select({
        typeSequence: QUIZ_SEQUENCES.type_sequence
            }).from(QUIZ_SEQUENCES)
            .where(
                and(
                  eq(QUIZ_SEQUENCES.user_id, userId),
                  eq(QUIZ_SEQUENCES.quiz_id, 3)
                )
            )
            .execute();


    const type3=personality3[0].typeSequence

    const personality1 = await db
    .select({
      typeSequence: QUIZ_SEQUENCES.type_sequence
    })
    .from(QUIZ_SEQUENCES)
    .where(
      and(
        eq(QUIZ_SEQUENCES.user_id, userId),
        eq(QUIZ_SEQUENCES.quiz_id, 1)
      )
    )
    .execute();

    const type1=personality1[0].typeSequence

    const prompt=`Provide a list of the 5 best careers ${
      country ? "in " + country : ""
    } for an individual with an ${type1} personality type and ${
      type3 ? " and Gallup Strengths types of " + type3 : ""
    }. For each career, include the following information:
        career_name: A brief title of the career?.
        reason_for_recommendation: Why this career is suitable for someone with these interests${
          country
            ? " and explain the reason this career is suitable in " + country
            : ""
        }.
        roadmap: Detailed steps and milestones required to achieve this career (as an array).
        present_trends: Current trends and opportunities in the field${
          country ? " in " + country : ""
        }.
        future_prospects: Predictions and potential growth in this career${
          country ? " in " + country : ""
        }.
        user_description: Describe the personality traits, strengths, and preferences of the user that make these careers a good fit.
        Ensure that the response is valid JSON, using the specified field names, but do not include the terms '${type1}', '${type3}' or 'RIASEC' in the data.Give it as a single JSON data without any wrapping other than []`;

    
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500, // Adjust the token limit as needed
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
    console.log(`Total tokens % best careers: ${response.data.usage.total_tokens}`);

    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/```json|```/g, "").trim();
    // const response = await chatModel.invoke(prompt)
    // console.log(responseText)
    return NextResponse.json({result: responseText});
}