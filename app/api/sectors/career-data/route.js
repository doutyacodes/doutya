import { NextResponse } from "next/server";
import { db } from "@/utils";
import { eq, and } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER_DETAILS, QUIZ_SEQUENCES } from "@/utils/schema";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Get user details for plan type
    const userDetails = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId))
      .execute();

    if (userDetails.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Get personality type from quiz sequences
    const quizSequences = await db
      .select()
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, userId),
          eq(QUIZ_SEQUENCES.quiz_id, 1),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        )
      )
      .execute();

    const personalityType = quizSequences.length > 0 ? quizSequences[0].type_sequence : "";

    return NextResponse.json({
      plan_type: userDetails[0].plan_type || "base",
      personality_type: personalityType
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user career data:", error);
    return NextResponse.json(
      { message: "Failed to fetch user data" },
      { status: 500 }
    );
  }
}