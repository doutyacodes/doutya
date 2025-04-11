import { db } from "@/utils";
import { 
  QUESTION_SESSIONS, 
  SESSION_QUESTIONS, 
  SESSION_ANSWERS
} from "@/utils/schema";
import { eq, and, gt } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from "next/server";

export async function GET(req, { params }) {
  const { mentorId } = params;
  const { searchParams } = new URL(req.url);
  const lastUpdate = searchParams.get('lastUpdate') || new Date(0).toISOString();
  
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  
  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  
  try {
    // Get active session
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
      .limit(1);
      
    if (!activeSession) {
      return NextResponse.json({ updates: [] }, { status: 200 });
    }
    
    // Get new answers since lastUpdate
    const updates = await db
      .select({
        question_id: SESSION_QUESTIONS.question_id,
        question_text: SESSION_QUESTIONS.question_text,
        created_at: SESSION_ANSWERS.created_at,
        answer_text: SESSION_ANSWERS.answer_text,
        answer_created_at: SESSION_ANSWERS.created_at,
        is_read: SESSION_ANSWERS.is_read
      })
      .from(SESSION_ANSWERS)
      .innerJoin(
        SESSION_QUESTIONS,
        eq(SESSION_ANSWERS.question_id, SESSION_QUESTIONS.question_id)
      )
      .where(
        and(
          eq(SESSION_QUESTIONS.question_session_id, activeSession.question_session_id),
          gt(SESSION_ANSWERS.created_at, new Date(lastUpdate))
        )
      );
    
    // Mark answers as read
    if (updates.length > 0) {
      const answerIds = updates.map(update => update.question_id);
      
      await db
        .update(SESSION_ANSWERS)
        .set({ is_read: true })
        .where(
          and(
            eq(SESSION_ANSWERS.mentor_id, parseInt(mentorId)),
            eq(SESSION_ANSWERS.is_read, false),
            sql`${SESSION_ANSWERS.question_id} IN (${answerIds.join(',')})`
          )
        );
    }
    
    return NextResponse.json({ updates }, { status: 200 });
  } catch (error) {
    console.error("Error fetching question updates:", error);
    return NextResponse.json(
      { message: "Failed to fetch updates" },
      { status: 500 }
    );
  }
}