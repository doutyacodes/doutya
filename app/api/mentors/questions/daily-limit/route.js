import { db } from "@/utils";
import { USER_DAILY_QUESTION_LIMIT } from "@/utils/schema";
import { eq, and } from 'drizzle-orm';
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from 'next/server';

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  const { searchParams } = new URL(req.url);
  const mentorId = searchParams.get('mentorId');

  if (!mentorId) {
    return NextResponse.json({ message: "Mentor ID is required" }, { status: 400 });
  }

  try {
    // Check if user has reached daily limit
    const [dailyLimit] = await db
      .select()
      .from(USER_DAILY_QUESTION_LIMIT)
      .where(
        and(
          eq(USER_DAILY_QUESTION_LIMIT.user_id, userId),
          eq(USER_DAILY_QUESTION_LIMIT.mentor_id, mentorId)
        )
      )
      .limit(1);

    if (!dailyLimit) {
      // No limit record found, user can book
      return NextResponse.json({
        limitReached: false
      }, { status: 200 });
    }

    // Check if the last reset was today
    const lastResetDate = new Date(dailyLimit.last_reset_date);
    const now = new Date();
    
    // If it's a different day, user can book
    if (
      lastResetDate.getFullYear() !== now.getFullYear() ||
      lastResetDate.getMonth() !== now.getMonth() ||
      lastResetDate.getDate() !== now.getDate()
    ) {
      return NextResponse.json({
        limitReached: false
      }, { status: 200 });
    }

    // Calculate time until reset (next day)
    const nextReset = new Date(now);
    nextReset.setDate(nextReset.getDate() + 1);
    nextReset.setHours(0, 0, 0, 0);
    
    const timeUntilResetMs = nextReset - now;
    const hoursUntilReset = Math.floor(timeUntilResetMs / (1000 * 60 * 60));
    const minutesUntilReset = Math.floor((timeUntilResetMs % (1000 * 60 * 60)) / (1000 * 60));
    
    const resetTimeString = `${hoursUntilReset}h ${minutesUntilReset}m`;

    return NextResponse.json({
      limitReached: true,
      resetTime: resetTimeString
    }, { status: 200 });

  } catch (error) {
    console.error("Error checking daily limit:", error);
    return NextResponse.json(
      { message: "Failed to check daily question limit" },
      { status: 500 }
    );
  }
}