import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { QUIZ_SEQUENCES } from '@/utils/schema';
import { db } from '@/utils';
import { eq } from 'drizzle-orm';
import { RESULTS1 } from '@/utils/schema';

export async function GET(req)
{
    console.log('got user id function')
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    
    const userId = userData.userId;
    
    const type_sequences = await db.select({
      typeSequence: QUIZ_SEQUENCES.type_sequence
          }).from(QUIZ_SEQUENCES)
          .where(eq(QUIZ_SEQUENCES.user_id, userId))
          .where(eq(QUIZ_SEQUENCES.quiz_id, 1))
          .execute();

    console.log(type_sequences)

    const type=type_sequences[0].typeSequence

    const results = await db.select().from(RESULTS1).where(eq(RESULTS1.type_sequence, type));

    return NextResponse.json(results);
}