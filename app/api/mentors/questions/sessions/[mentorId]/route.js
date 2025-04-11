import { db } from "@/utils";
import { 
  QUESTION_SESSIONS, 
  SESSION_QUESTIONS, 
  SESSION_ANSWERS,
  MENTOR_PROFILES
} from "@/utils/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { mentorId } = params;
  
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  
  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  
  try {
    // Check if an active session exists for this user-mentor pair
    const [activeSession] = await db
      .select()
      .from(QUESTION_SESSIONS)
      .where(
        and(
          eq(QUESTION_SESSIONS.user_id, userId),
          eq(QUESTION_SESSIONS.mentor_id, parseInt(mentorId)),
          eq(QUESTION_SESSIONS.session_status, "active")
        )
      )
      .orderBy(desc(QUESTION_SESSIONS.created_at))
      .limit(1);
      
    if (!activeSession) {
      return NextResponse.json(
        { 
          session: null,
          questionsAndAnswers: [],
          questionCount: 0
        },
        { status: 200 }
      );
    }
    
    // Get questions and answers for this session
    const questionsAndAnswers = await db
      .select({
        question_id: SESSION_QUESTIONS.question_id,
        question_text: SESSION_QUESTIONS.question_text,
        created_at: SESSION_QUESTIONS.created_at,
        answer_text: SESSION_ANSWERS.answer_text,
        answer_created_at: SESSION_ANSWERS.created_at,
        is_read: SESSION_ANSWERS.is_read
      })
      .from(SESSION_QUESTIONS)
      .leftJoin(
        SESSION_ANSWERS,
        eq(SESSION_QUESTIONS.question_id, SESSION_ANSWERS.question_id)
      )
      .where(eq(SESSION_QUESTIONS.question_session_id, activeSession.question_session_id))
      .orderBy(SESSION_QUESTIONS.created_at);
    
    // Count questions asked in the last 24 hours
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
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
    
    // Mark unread answers as read
    const unreadAnswers = questionsAndAnswers
      .filter(qa => qa.answer_text && !qa.is_read)
      .map(qa => qa.question_id);
      
    if (unreadAnswers.length > 0) {
      await db
        .update(SESSION_ANSWERS)
        .set({ is_read: true })
        .where(
          and(
            eq(SESSION_ANSWERS.mentor_id, parseInt(mentorId)),
            sql`${SESSION_ANSWERS.question_id} IN (${unreadAnswers.join(',')})`
          )
        );
    }
    
    return NextResponse.json({
      session: activeSession,
      questionsAndAnswers,
      questionCount: questionCount.count || 0
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching question session:", error);
    return NextResponse.json(
      { message: "Failed to fetch question session" },
      { status: 500 }
    );
  }
}