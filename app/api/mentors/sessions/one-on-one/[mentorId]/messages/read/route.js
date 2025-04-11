import { db } from "@/utils";
import { ONE_ON_ONE_CHAT_MESSAGES }  from "@/utils/schema";
import { eq, and, inArray } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from "next/server";


export async function POST(req, { params }) {
  const { mentorId } = params;
  
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }
  
  try {
    const body = await req.json();
    const { messageIds } = body;
    
    if (!messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return NextResponse.json(
        { message: "Valid message IDs are required" },
        { status: 400 }
      );
    }
    
    // Mark messages as read
    await db
      .update(ONE_ON_ONE_CHAT_MESSAGES)
      .set({ is_read: true })
      .where(
        and(
          inArray(ONE_ON_ONE_CHAT_MESSAGES.message_id, messageIds),
          eq(ONE_ON_ONE_CHAT_MESSAGES.sender_type, "mentor")
        )
      );
    
    return NextResponse.json({
      message: "Messages marked as read"
    }, { status: 200 });
  } catch (error) {
    console.error("Error marking messages as read:", error);
    return NextResponse.json(
      { message: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}