import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { QUIZ_SEQUENCES } from '@/utils/schema';
import { db } from '@/utils';
import { and,eq } from 'drizzle-orm';
import { RESULTS1 } from '@/utils/schema';
import path from 'path';
import fs from 'fs';


const languageOptions = {
  en: 'english',
  hi: 'hindi',
  mar: 'marathi',
  ur: 'urdu',
  sp: 'spanish',
  ben: 'bengali',
  assa: 'assamese',
  ge: 'german',
  mal:'malyalam',
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

  console.log(filteredResults);

  console.log(filteredResults)

  return NextResponse.json(filteredResults);
}