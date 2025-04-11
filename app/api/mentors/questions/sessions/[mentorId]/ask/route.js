import { db } from "@/utils";
import { 
  QUESTION_SESSIONS, 
  SESSION_QUESTIONS
} from "@/utils/schema";
import { eq, and, sql } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from "next/server";

export async function POST(req, { params }) {
  const { mentorId } = params;
  
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  
  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  
  try {
    const body = await req.json();
    const { questionText } = body;
    
    if (!questionText?.trim()) {
      return NextResponse.json(
        { message: "Question text is required" },
        { status: 400 }
      );
    }
    
    // Get active session
    const [activeSession] = await db
      .select()
      .from(QUESTION_SESSIONS)
      .where(
        and(
          eq(QUESTION_SESSIONS.user_id, userId),
          eq(QUESTION_SESSIONS.mentor_id, parseInt(mentorId)),
          eq(QUESTION_SESSIONS.session_status, "active"),
          eq(QUESTION_SESSIONS.payment_status, "paid")
        )
      )
      .limit(1);
      
    if (!activeSession) {
      return NextResponse.json(
        { message: "No active paid session found" },
        { status: 403 }
      );
    }
    
    // Check if user has already asked 5 questions today
    const [questionCount] = await db
      .select({
        count: sql`COUNT(*)`.as("count")
      })
      .from(SESSION_QUESTIONS)
      .where(
        and(
          eq(SESSION_QUESTIONS.question_session_id, activeSession.question_session_id),
          sql`${SESSION_QUESTIONS.created_at} >= CURRENT_DATE()`
        )
      );
      
    if (questionCount.count >= 5) {
      return NextResponse.json(
        { message: "You've reached the daily limit of 5 questions" },
        { status: 403 }
      );
    }
    
    // Update the last_interaction_at time
    await db
      .update(QUESTION_SESSIONS)
      .set({ last_interaction_at: new Date() })
      .where(eq(QUESTION_SESSIONS.question_session_id, activeSession.question_session_id));
    
    // // Insert the new question
    // const [question] = await db
    //   .insert(SESSION_QUESTIONS)
    //   .values({
    //     question_session_id: activeSession.question_session_id,
    //     user_id: userId,
    //     question_text: questionText,
    //     created_at: new Date()
    //   })
    
    // return NextResponse.json({
    //   message: "Question submitted successfully",
    //   question
    // }, { status: 201 });
    const [result] = await db
      .insert(SESSION_QUESTIONS)
      .values({
        question_session_id: activeSession.question_session_id,
        user_id: userId,
        question_text: questionText,
        created_at: new Date()
      });

    const insertedId = result.insertId;

    // Now fetch the inserted row
    const [insertedQuestion] = await db
      .select()
      .from(SESSION_QUESTIONS)
      .where(eq(SESSION_QUESTIONS.question_id, insertedId)); // replace `id` with your primary key column

return NextResponse.json({
  message: "Question submitted successfully",
  question: insertedQuestion
}, { status: 201 });
  } catch (error) {
    console.error("Error submitting question:", error);
    return NextResponse.json(
      { message: "Failed to submit question" },
      { status: 500 }
    );
  }
}