import { NextResponse } from 'next/server';
import { db } from '@/utils'; 
import { authenticate } from '@/lib/jwtMiddleware'; 
import { CHALLENGE_PROGRESS, CHALLENGES, USER_DETAILS } from '@/utils/schema';
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
  
  // Get scope parameters
  const scope_id = searchParams.get('id');
  
  // Get user's scope type from USER_DETAILS
  const user_data = await db
    .select({
      scope_type: USER_DETAILS.scope_type
    })
    .from(USER_DETAILS)
    .where(eq(USER_DETAILS.id, userId));
  
  const scope_type = user_data[0].scope_type;
  
  const lastSubmittedChallenge = await db
    .select({
      week: CHALLENGE_PROGRESS.week,
      created_at: CHALLENGE_PROGRESS.created_at
    })
    .from(CHALLENGE_PROGRESS)
    .innerJoin(CHALLENGES, eq(CHALLENGE_PROGRESS.challenge_id, CHALLENGES.id))  // Join with challenges table
    .where(and(
      eq(CHALLENGE_PROGRESS.user_id, userId),    // Filter by user_id
      eq(CHALLENGES.scope_id, scope_id),         // Filter by scope_id
      eq(CHALLENGES.scope_type, scope_type)      // Filter by scope_type
    ))
    .orderBy(CHALLENGE_PROGRESS.created_at, 'desc')  // Order by submission date
    .limit(1);

  console.log(lastSubmittedChallenge);

  return NextResponse.json({ lastSubmittedChallenge: lastSubmittedChallenge[0] }, { status: 200 });
}