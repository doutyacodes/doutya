import { db } from "@/utils";
import { 
  ONE_ON_ONE_SESSIONS, 
  ONE_ON_ONE_CHAT_MESSAGES,
  MENTOR_PROFILES
} from "@/utils/schema";
import { eq, and, or, desc } from "drizzle-orm";
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
    // Check if an active session exists
    const [session] = await db
      .select()
      .from(ONE_ON_ONE_SESSIONS)
      .where(
        and(
          eq(ONE_ON_ONE_SESSIONS.user_id, userId),
          eq(ONE_ON_ONE_SESSIONS.mentor_id, parseInt(mentorId)),
          or(
            eq(ONE_ON_ONE_SESSIONS.session_status, "in_progress"),
            eq(ONE_ON_ONE_SESSIONS.session_status, "scheduled")
          ),
          eq(ONE_ON_ONE_SESSIONS.payment_status, "paid")
        )
      )
      .orderBy(desc(ONE_ON_ONE_SESSIONS.start_time))
      .limit(1);
      
    if (!session) {
      return NextResponse.json(
        { 
          session: null,
          messages: []
        },
        { status: 200 }
      );
    }
    
    // If the session is scheduled but the current time is after start_time
    // and before end_time, update the session status to "in_progress"
    const now = new Date();
    if (
      session.session_status === "scheduled" && 
      session.start_time && 
      session.end_time &&
      now >= new Date(session.start_time) && 
      now <= new Date(session.end_time)
    ) {
      await db
        .update(ONE_ON_ONE_SESSIONS)
        .set({ session_status: "in_progress" })
        .where(eq(ONE_ON_ONE_SESSIONS.session_id, session.session_id));
        
      session.session_status = "in_progress";
    }
    
    // If the session is in_progress but the current time is after end_time
    // update the session status to "completed"
    if (
      session.session_status === "in_progress" && 
      session.end_time &&
      now > new Date(session.end_time)
    ) {
      await db
        .update(ONE_ON_ONE_SESSIONS)
        .set({ session_status: "completed" })
        .where(eq(ONE_ON_ONE_SESSIONS.session_id, session.session_id));
        
      session.session_status = "completed";
    }
    
    // Get chat messages if session is in progress
    let messages = [];
    if (session.session_status === "in_progress") {
      messages = await db
        .select()
        .from(ONE_ON_ONE_CHAT_MESSAGES)
        .where(eq(ONE_ON_ONE_CHAT_MESSAGES.session_id, session.session_id))
        .orderBy(ONE_ON_ONE_CHAT_MESSAGES.sent_at);
        
      // Mark unread messages as read (only ones from mentor)
      await db
        .update(ONE_ON_ONE_CHAT_MESSAGES)
        .set({ is_read: true })
        .where(
          and(
            eq(ONE_ON_ONE_CHAT_MESSAGES.session_id, session.session_id),
            eq(ONE_ON_ONE_CHAT_MESSAGES.sender_type, "mentor"),
            eq(ONE_ON_ONE_CHAT_MESSAGES.is_read, false)
          )
        );
    }
    
    return NextResponse.json({
      session,
      messages
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching one-on-one session:", error);
    return NextResponse.json(
      { message: "Failed to fetch session data" },
      { status: 500 }
    );
  }
}