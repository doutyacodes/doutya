// /api/test-types/check/[userId]/route.js
import { db } from "@/utils";
import { QUIZ_SEQUENCES } from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from "next/server";

export async function GET(req) {
  
  // Authentication check (optional - remove if not needed for testing)
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  
  try {
    // Check for existing MBTI type (quiz_id = 1)
    const [mbtiResult] = await db
      .select()
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, parseInt(userId)),
          eq(QUIZ_SEQUENCES.quiz_id, 1),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        )
      )
      .limit(1);

    // Check for existing RIASEC type (quiz_id = 2)  
    const [riasecResult] = await db
      .select()
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, parseInt(userId)),
          eq(QUIZ_SEQUENCES.quiz_id, 2),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        )
      )
      .limit(1);

    return NextResponse.json({
      mbti: mbtiResult || null,
      riasec: riasecResult || null
    }, { status: 200 });

  } catch (error) {
    console.error("Error checking existing test types:", error);
    return NextResponse.json(
      { message: "Failed to check existing test types" },
      { status: 500 }
    );
  }
}