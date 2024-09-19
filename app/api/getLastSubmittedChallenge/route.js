import { NextResponse } from 'next/server';
import { db } from '@/utils'; 
import { authenticate } from '@/lib/jwtMiddleware'; 
import { CHALLENGE_PROGRESS } from '@/utils/schema';
import { eq } from 'drizzle-orm'; 

export async function GET(req) {
  console.log('got')
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userId = authResult.decoded_Data.userId;

  console.log(userId)

  // Fetch last submitted challenge
  const lastSubmittedChallenge = await db
    .select({
      week: CHALLENGE_PROGRESS.week,
      created_at: CHALLENGE_PROGRESS.created_at
    })
    .from(CHALLENGE_PROGRESS)
    .where(eq(CHALLENGE_PROGRESS.user_id, userId))
    .orderBy(CHALLENGE_PROGRESS.created_at, 'desc') 
    .limit(1);

  console.log(lastSubmittedChallenge)

  return NextResponse.json({ lastSubmittedChallenge: lastSubmittedChallenge[0] }, { status: 200 });
}
