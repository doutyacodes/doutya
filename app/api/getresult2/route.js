import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { QUIZ_SEQUENCES, USER_DETAILS, USER_RESULTS } from '@/utils/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '@/utils';
import axios from 'axios';

export const maxDuration = 15;

export async function GET(req) {
  console.log('got');
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  const url = new URL(req.url);

  const country_db = await db.select({
    country: USER_DETAILS.country
  })
    .from(USER_DETAILS)
    .where(
      eq(USER_DETAILS.id, userId)
    )
    .execute();
  console.log(country_db)
  const country=country_db[0].country
  const industry = url.searchParams.get('industry') || null;

  console.log("country", country);
  console.log("industry", industry);

  
  let existingResult=[];
  if (industry == null) {
    existingResult = await db
      .select({
        result2: USER_RESULTS.result2
      })
      .from(USER_RESULTS)
      .where(
          and(
          eq(USER_RESULTS.user_id, userId),
          eq(USER_RESULTS.type,'basic')
          )
      )
      .execute();
    }
    console.log(existingResult)
    if (industry==null && existingResult.length > 0 && existingResult[0].result2 !== null) {
      // If result2 is already present, return it
      console.log('Returning cached result');
      return NextResponse.json({ result: existingResult[0].result2 });
    }

  // Get quiz sequences
  const personality2 = await db.select({
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

  const type2 = personality2[0].typeSequence;

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

  const type1 = personality1[0].typeSequence;

  // Define the prompt for GPT
  const prompt = `Provide a list of the 5 best careers in ${industry ? `the ${industry} industry in ` : ''}${country} for an individual with an ${type1} personality 
    type and RIASEC interest types of ${type2}. For each career, include the following information:
      career_name: A brief title of the career.
      reason_for_recommendation: Why this career is suitable for someone with these interests.
      roadmap: Detailed steps and milestones required to achieve this career (as an array).
      present_trends: Current trends and opportunities in the field.
      future_prospects: Predictions and potential growth in this career.
      user_description: Describe the personality traits, strengths, and preferences of the user that make these careers a good fit.
    Ensure that the response is valid JSON, using the specified field names, but do not include the terms '${type1}' or 'RIASEC' in the data.`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini", // or 'gpt-4' if you have access
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
  let responseText = response.data.choices[0].message.content.trim();
  responseText = responseText.replace(/```json|```/g, "").trim();

  // Store the new result in the user_results table
  await db
    .insert(USER_RESULTS)
    .values({
      user_id: userId,
      result2: responseText,
      quiz_id: 2,
      type: industry == null ? 'basic' : 'advance',
      country: country,
    })
    .execute();

  // return NextResponse.json({ result: responseText });
  return NextResponse.json({ result: responseText });
}
