import { db } from "@/utils";
import { 
  ONE_ON_ONE_SESSIONS, 
  ONE_ON_ONE_CHAT_MESSAGES
} from "@/utils/schema";
import { eq, and } from "drizzle-orm";
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
    const { messageText } = body;
    
    if (!messageText?.trim()) {
      return NextResponse.json(
        { message: "Message text is required" },
        { status: 400 }
      );
    }
    
    // Get active session
    const [activeSession] = await db
      .select()
      .from(ONE_ON_ONE_SESSIONS)
      .where(
        and(
          eq(ONE_ON_ONE_SESSIONS.user_id, userId),
          eq(ONE_ON_ONE_SESSIONS.mentor_id, parseInt(mentorId)),
          eq(ONE_ON_ONE_SESSIONS.session_status, "in_progress"),
          eq(ONE_ON_ONE_SESSIONS.payment_status, "paid")
        )
      )
      .limit(1);
      
    if (!activeSession) {
      return NextResponse.json(
        { message: "No active session found" },
        { status: 403 }
      );
    }
    
// Insert the new message
  const [result] = await db
    .insert(ONE_ON_ONE_CHAT_MESSAGES)
    .values({
      session_id: activeSession.session_id,
      sender_type: "user",
      sender_id: userId,
      message_text: messageText,
      sent_at: new Date(),
      is_read: false
    });

  const insertedId = result.insertId;

  // Fetch the inserted message row
  const [insertedMessage] = await db
    .select()
    .from(ONE_ON_ONE_CHAT_MESSAGES)
    .where(eq(ONE_ON_ONE_CHAT_MESSAGES.message_id, insertedId)); // Use your actual PK column

  return NextResponse.json({
    message: "Message sent successfully",
    data: insertedMessage
  }, { status: 201 });

  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { message: "Failed to send message" },
      { status: 500 }
    );
  }
}