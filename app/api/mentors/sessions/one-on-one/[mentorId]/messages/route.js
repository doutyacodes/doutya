import { db } from "@/utils";
import { 
  ONE_ON_ONE_SESSIONS, 
  ONE_ON_ONE_CHAT_MESSAGES
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
      .from(ONE_ON_ONE_SESSIONS)
      .where(
        and(
          eq(ONE_ON_ONE_SESSIONS.user_id, userId),
          eq(ONE_ON_ONE_SESSIONS.mentor_id, parseInt(mentorId)),
          eq(ONE_ON_ONE_SESSIONS.session_status, "in_progress")
        )
      )
      .limit(1);
      
    if (!activeSession) {
      return NextResponse.json({ messages: [] }, { status: 200 });
    }
    
    // Get new messages since lastUpdate
    const messages = await db
      .select()
      .from(ONE_ON_ONE_CHAT_MESSAGES)
      .where(
        and(
          eq(ONE_ON_ONE_CHAT_MESSAGES.session_id, activeSession.session_id),
          gt(ONE_ON_ONE_CHAT_MESSAGES.sent_at, new Date(lastUpdate))
        )
      )
      .orderBy(ONE_ON_ONE_CHAT_MESSAGES.sent_at);
    
    // Mark mentor messages as read
    await db
      .update(ONE_ON_ONE_CHAT_MESSAGES)
      .set({ is_read: true })
      .where(
        and(
          eq(ONE_ON_ONE_CHAT_MESSAGES.session_id, activeSession.session_id),
          eq(ONE_ON_ONE_CHAT_MESSAGES.sender_type, "mentor"),
          eq(ONE_ON_ONE_CHAT_MESSAGES.is_read, false)
        )
      );
    
    return NextResponse.json({ messages }, { status: 200 });
  } catch (error) {
    console.error("Error fetching chat updates:", error);
    return NextResponse.json(
      { message: "Failed to fetch chat updates" },
      { status: 500 }
    );
  }
}