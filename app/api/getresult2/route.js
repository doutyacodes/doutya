import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { QUIZ_SEQUENCES } from '@/utils/schema';
import { eq } from 'drizzle-orm';
import { db } from '@/utils';
import { ChatOpenAI } from "@langchain/openai"


export async function GET(req)
{
    console.log('got')
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    
    const userId = userData.userId;

    const personality2 = await db.select({
        typeSequence: QUIZ_SEQUENCES.type_sequence
            }).from(QUIZ_SEQUENCES)
            .where(eq(QUIZ_SEQUENCES.user_id, userId))
            .where(eq(QUIZ_SEQUENCES.quiz_id, 2))
            .execute();

    
    const type2=personality2[0].typeSequence

    const personality1 = await db.select({
        typeSequence: QUIZ_SEQUENCES.type_sequence
            }).from(QUIZ_SEQUENCES)
            .where(eq(QUIZ_SEQUENCES.user_id, userId))
            .where(eq(QUIZ_SEQUENCES.quiz_id, 1))
            .execute();

    const type1=personality1[0].typeSequence

    const chatModel = new ChatOpenAI({
        apiKey: process.env.OPENAI_API_KEY
    })
    if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY is not set")
    }
    const prompt=`What are the 5 best careers for the  ${type1} personality where (Extraversion (E) , Introversion (I),  Sensing (S) , Intuition (N), Thinking (T) , Feeling (F), Judging (J) , Perceiving (P)) with a ${type2} interest type where (Realistic (R)  , Investigative (I), Artistic (A), Social (S), Enterprising (E), Conventional (C), ) Show the reason for each of the careers. Don't include ${type1} and ${type2} in any line instead use "according to your personality".You can't disclose ${type1} and ${type2} in the answer.`

    const response = await chatModel.invoke(prompt)

    console.log(response.content)
    return NextResponse.json({result: response.content});
}