import { db } from "@/utils";
import { 
  QUESTION_SESSIONS, 
  USER_DAILY_QUESTION_LIMIT, 
  MENTOR_PRICING 
} from "@/utils/schema";
import { eq, and } from 'drizzle-orm';
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from 'next/server';

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  
  try {
    const { mentorId } = await req.json();
    
    if (!mentorId) {
      return NextResponse.json({ message: "Mentor ID is required" }, { status: 400 });
    }
    
    // Check if user has already booked today
    const [existingLimit] = await db
      .select()
      .from(USER_DAILY_QUESTION_LIMIT)
      .where(
        and(
          eq(USER_DAILY_QUESTION_LIMIT.user_id, userId),
          eq(USER_DAILY_QUESTION_LIMIT.mentor_id, mentorId)
        )
      )
      .limit(1);
      
    const now = new Date();
    
    if (existingLimit) {
      const lastResetDate = new Date(existingLimit.last_reset_date);
      
      // Check if the last booking was today
      if (
        lastResetDate.getFullYear() === now.getFullYear() &&
        lastResetDate.getMonth() === now.getMonth() &&
        lastResetDate.getDate() === now.getDate()
      ) {
        return NextResponse.json({ 
          message: "You've already booked a question package with this mentor today. Please try again tomorrow." 
        }, { status: 400 });
      }
      
      // Update the existing record
      await db
        .update(USER_DAILY_QUESTION_LIMIT)
        .set({
          question_count: 1,
          last_reset_date: now
        })
        .where(eq(USER_DAILY_QUESTION_LIMIT.id, existingLimit.id));
    } else {
      // Create a new record
      await db.insert(USER_DAILY_QUESTION_LIMIT).values({
        user_id: userId,
        mentor_id: mentorId,
        question_count: 1,
        last_reset_date: now
      });
    }
    
    // Get mentor pricing
    const [pricing] = await db
      .select()
      .from(MENTOR_PRICING)
      .where(eq(MENTOR_PRICING.mentor_id, mentorId))
      .limit(1);
      
    if (!pricing) {
      return NextResponse.json({ message: "Mentor pricing not found" }, { status: 404 });
    }
    
    // Create a new question session
    const [newSession] = await db
      .insert(QUESTION_SESSIONS)
      .values({
        user_id: userId,
        mentor_id: mentorId,
        session_status: "active",
        total_price: pricing.question_price,
        payment_status: "paid", // Assume payment is successful for now
        created_at: now,
        last_interaction_at: now
      })
    
    return NextResponse.json({
      message: "5 Questions Package booked successfully",
      session_id: newSession.inserId
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error booking question package:", error);
    return NextResponse.json(
      { message: "Failed to book question package" },
      { status: 500 }
    );
  }
}