import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { QUIZ_SEQUENCES } from '@/utils/schema';
import { db } from '@/utils';
import { and,eq } from 'drizzle-orm';
import { RESULTS1 } from '@/utils/schema';
import path from 'path';
import fs from 'fs';
import axios from 'axios';


const languageOptions = {
  en: 'english',
  hi: 'hindi',
  mar: 'marathi',
  ur: 'urdu',
  sp: 'spanish',
  ben: 'bengali',
  assa: 'assamese',
  ge: 'german',
  mal:'malayalam',
  tam:'tamil'
};

export async function GET(req) {
  console.log('got user id function')
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;

  const userId = userData.userId;

  const shortLanguage = req.headers.get('accept-language') || 'en';
  const language = languageOptions[shortLanguage] || 'english'; 

  console.log(userId)

  const type_sequences = await db
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


  console.log(type_sequences)
  const type = type_sequences[0].typeSequence
  console.log(type)

  const jsonFilePath = path.join(process.cwd(), 'public', 'results', `${language}_result.json`);
  console.log(jsonFilePath)
  if (!fs.existsSync(jsonFilePath)) {
    return NextResponse.json({ error: "Results file not found" }, { status: 404 });
  }
  const fileContents = fs.readFileSync(jsonFilePath, 'utf8');
  const results = JSON.parse(fileContents);
  // const results = await db.select().from(RESULTS1).where(eq(RESULTS1.type_sequence, type));

  const filteredResults = results.filter(result => result.type_sequence === type);

  if (filteredResults.length === 0) {
    return NextResponse.json({ error: "No matching results found" }, { status: 404 });
  }
  // console.log(filteredResults)

  let careers = [];
  if (Array.isArray(filteredResults[0].most_suitable_careers)) {
    careers = filteredResults[0].most_suitable_careers;
  } else if (typeof filteredResults[0].most_suitable_careers === 'string') {
    // Regex to split by commas only outside parentheses
    careers = filteredResults[0].most_suitable_careers.split(/,(?![^(]*\))/).map(career => career.trim());
  }
  
  const description = filteredResults[0].description;

  const prompt = `
    Based on the following personality description: "${description}", provide a match percentage for each of these careers: ${careers.join(', ')}.
    The match percentage should reflect how well the personality fits each career. Give it as a single JSON data without any wrapping other than []`;

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 4000, // Adjust the token limit as needed
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log(`Input tokens Kids result: ${response.data.usage.prompt_tokens}`);
  console.log(`Output tokens Kids result: ${response.data.usage.completion_tokens}`);
  console.log(`Total tokens Kids result: ${response.data.usage.total_tokens}`);

  let responseText = response.data.choices[0].message.content.trim();
  responseText = responseText.replace(/```json|```/g, "").trim();

  

  const careerMatches = JSON.parse(responseText);

  

  const updatedResults = filteredResults.map(result => ({
    ...result,
    most_suitable_careers: careers.map((career, index) => ({
      career,
      match_percentage: careerMatches[index] || "N/A" // Use index to align with the response
    }))
  }));

  

  return NextResponse.json(updatedResults);
}