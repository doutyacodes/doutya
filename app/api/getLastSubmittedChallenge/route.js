import { NextResponse } from 'next/server';
import { db } from '@/utils'; 
import { authenticate } from '@/lib/jwtMiddleware'; 
import { CHALLENGE_PROGRESS, CHALLENGES } from '@/utils/schema';
import { eq, and } from 'drizzle-orm'; 

export async function GET(req) {
  console.log('got')
  // Authenticate user
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userId = authResult.decoded_Data.userId;
  const { searchParams } = new URL(req.url);
  const career_id = searchParams.get('id')

  // Fetch last submitted challenge
  // const lastSubmittedChallenge = await db
  //   .select({
  //     week: CHALLENGE_PROGRESS.week,
  //     created_at: CHALLENGE_PROGRESS.created_at
  //   })
  //   .from(CHALLENGE_PROGRESS)
  //   .where(eq(CHALLENGE_PROGRESS.user_id, userId))
  //   .orderBy(CHALLENGE_PROGRESS.created_at, 'desc') 
  //   .limit(1);
  const lastSubmittedChallenge = await db
    .select({
      week: CHALLENGE_PROGRESS.week,
      created_at: CHALLENGE_PROGRESS.created_at
    })
    .from(CHALLENGE_PROGRESS)
    .innerJoin(CHALLENGES, eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id))  // Join with challenges table
    .where(and(
      eq(CHALLENGE_PROGRESS.user_id, userId),    // Filter by user_id
      eq(CHALLENGES.career_id, career_id)        // Filter by career_id
    ))
    .orderBy(CHALLENGE_PROGRESS.created_at, 'desc')  // Order by submission date
    .limit(1);

  console.log(lastSubmittedChallenge)

  return NextResponse.json({ lastSubmittedChallenge: lastSubmittedChallenge[0] }, { status: 200 });
}
