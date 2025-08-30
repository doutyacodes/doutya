// /api/test-types/save/route.js
import { db } from "@/utils";
import { QUIZ_SEQUENCES } from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from "next/server";

export async function POST(req) {
  // Authentication check (optional - remove if not needed for testing)
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  
  try {
    const { quizId, typeSequence } = await req.json();
    
    // Validation
    if (!quizId || !typeSequence) {
      return NextResponse.json(
        { message: "Missing required fields: userId, quizId, typeSequence" },
        { status: 400 }
      );
    }

    // Validate quizId
    if (![1, 2].includes(quizId)) {
      return NextResponse.json(
        { message: "Invalid quizId. Must be 1 (MBTI) or 2 (RIASEC)" },
        { status: 400 }
      );
    }

    // Validate type sequence format
    const upperTypeSequence = typeSequence.toUpperCase();
    
    if (quizId === 1) {
      // MBTI validation - should be exactly 4 characters
      if (!/^[A-Z]{4}$/.test(upperTypeSequence)) {
        return NextResponse.json(
          { message: "Invalid MBTI type sequence format" },
          { status: 400 }
        );
      }
    } else if (quizId === 2) {
      // RIASEC validation - should be at least 3 characters, only R,I,A,S,E,C
      if (!/^[RIASEC]{3,6}$/.test(upperTypeSequence)) {
        return NextResponse.json(
          { message: "Invalid RIASEC type sequence format" },
          { status: 400 }
        );
      }
    }

    // Check if record already exists
    const [existingRecord] = await db
      .select()
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, parseInt(userId)),
          eq(QUIZ_SEQUENCES.quiz_id, quizId),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        )
      )
      .limit(1);

    if (existingRecord) {
      return NextResponse.json(
        { message: `${quizId === 1 ? 'MBTI' : 'RIASEC'} type already exists for this user` },
        { status: 409 }
      );
    }

    // Insert new record
    const [newRecord] = await db
      .insert(QUIZ_SEQUENCES)
      .values({
        user_id: parseInt(userId),
        quiz_id: quizId,
        type_sequence: upperTypeSequence,
        createddate: new Date(),
        isCompleted: true,
        isStarted: true
      })

    return NextResponse.json({
      message: `${quizId === 1 ? 'MBTI' : 'RIASEC'} type saved successfully`,
    }, { status: 201 });

  } catch (error) {
    console.error("Error saving test type:", error);
    return NextResponse.json(
      { message: "Failed to save test type" },
      { status: 500 }
    );
  }
}