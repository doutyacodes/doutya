import { NextResponse } from "next/server";
import { db } from "@/utils";
import {
  COMPANY_CHALLENGE_USER_QUIZ,
  COMPANY_CHALLENGE_PROGRESS,
  COMPANY_CHALLENGE_OPTIONS,
  QUIZ_SCORE,
  USER_POINTS,
  COMPANY_USER_CHALLENGE_POINTS,
  COMPANY_CHALLENGES,
} from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userId = authResult.decoded_Data.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    const fullData = await req.json();
    const {
      challengeId,
      questionId,
      optionId,
      isCompleted,
      isFirstQuestion,
      marks,
    } = fullData;

    if (
      !challengeId ||
      !questionId ||
      !optionId ||
      typeof isCompleted !== "boolean" ||
      typeof isFirstQuestion !== "boolean"
    ) {
      return NextResponse.json(
        { error: "Invalid data. All fields are required." },
        { status: 400 }
      );
    }

    let challengeExists2;
    if (userId) {
      // Check if the challenge exists for the given ID
      const challenge = await db
        .select()
        .from(COMPANY_CHALLENGES)
        .where(eq(COMPANY_CHALLENGES.id, challengeId))
        .limit(1)
        .execute();

      if (challenge.length > 0) {
        challengeExists2 = challenge[0];
      } else {
        return NextResponse.json(
          { error: "Challenge not found." },
          { status: 404 }
        );
      }
    }

    // Check if the user has already answered this question
    const existingAnswer = await db
      .select()
      .from(COMPANY_CHALLENGE_USER_QUIZ)
      .where(and(
        eq(COMPANY_CHALLENGE_USER_QUIZ.user_id, userId),
        eq(COMPANY_CHALLENGE_USER_QUIZ.question_id, questionId)
      ))
      .limit(1)
      .execute();

    if (existingAnswer.length > 0) {
      // If the answer already exists, skip insertion
      return NextResponse.json({ error: "Answer already submitted for this question." });
    }

    // Insert or update the user's quiz answer
    await db.insert(COMPANY_CHALLENGE_USER_QUIZ).values({
      challenge_id: challengeId,
      question_id: questionId,
      option_id: optionId,
      user_id: userId,
      marks: marks || 0,
      company_id: challengeExists2.company_id,
    });

    // Check if the selected option is the correct answer
    const correctOption = await db
      .select()
      .from(COMPANY_CHALLENGE_OPTIONS)
      .where(
        and(
          eq(COMPANY_CHALLENGE_OPTIONS.id, optionId),
          eq(COMPANY_CHALLENGE_OPTIONS.is_answer, true)
        )
      )
      .limit(1)
      .execute();

    if (correctOption.length > 0) {
      // If the option is correct, update the score
      const existingScore = await db
        .select()
        .from(QUIZ_SCORE)
        .where(
          and(
            eq(QUIZ_SCORE.challenge_id, challengeId),
            eq(QUIZ_SCORE.user_id, userId)
          )
        )
        .limit(1)
        .execute();

      if (existingScore.length > 0) {
        // Update the score by incrementing it
        await db
          .update(QUIZ_SCORE)
          .set({ score: parseFloat(existingScore[0].score) + marks })
          .where(eq(QUIZ_SCORE.id, existingScore[0].id));
      } else {
        // Insert a new score record
        await db.insert(QUIZ_SCORE).values({
          user_id: userId,
          challenge_id: challengeId,
          score: marks, // Start with a score of 1 for the first correct answer
        });
      }
    }

    // If it's the first question, insert a record in COMPANY_CHALLENGE_PROGRESS with is_started: true
    if (isFirstQuestion) {
      const existingProgress = await db
        .select()
        .from(COMPANY_CHALLENGE_PROGRESS)
        .where(
          and(
            eq(COMPANY_CHALLENGE_PROGRESS.challenge_id, challengeId),
            eq(COMPANY_CHALLENGE_PROGRESS.user_id, userId)
          )
        )
        .limit(1)
        .execute();

      if (existingProgress.length === 0) {
        await db.insert(COMPANY_CHALLENGE_PROGRESS).values({
          challenge_id: challengeId,
          user_id: userId,
          marks: marks,
          is_started: true,
          is_completed: false,
          company_id: challengeExists2.company_id,
          department_id: challengeExists2.department_id,
        });
      }
    }

    // Update challenge progress if completed
    if (isCompleted) {
      await db
        .update(COMPANY_CHALLENGE_PROGRESS)
        .set({ is_completed: true })
        .where(
          and(
            eq(COMPANY_CHALLENGE_PROGRESS.challenge_id, challengeId),
            eq(COMPANY_CHALLENGE_PROGRESS.user_id, userId)
          )
        );

      let challengeExists;
      // Check if the challenge exists for the given ID
      const challenge = await db
        .select()
        .from(COMPANY_CHALLENGES)
        .where(eq(COMPANY_CHALLENGES.id, challengeId))
        .limit(1)
        .execute();

      if (challenge.length > 0) {
        challengeExists = challenge[0];
      }

      if (challengeExists.entry_type != "points") {
        const userPoints = await db
          .select()
          .from(USER_POINTS)
          .where(and(eq(USER_POINTS.user_id, userId)))
          .limit(1)
          .execute();

        if (userPoints.length > 0) {
          // Record exists; update points
          const updatedPoints =
            userPoints[0].points + (challengeExists.points || 0);
          await db
            .update(USER_POINTS)
            .set({ points: updatedPoints })
            .where(eq(USER_POINTS.id, userPoints[0].id));
        } else {
          // Record does not exist; create new
          await db.insert(USER_POINTS).values({
            user_id: userId,
            points: challengeExists.points,
          });
        }
        await db.insert(COMPANY_USER_CHALLENGE_POINTS).values({
          user_id: userId,
          points: challengeExists.points,
          challenge_id: challengeId,
          company_id: challengeExists2.company_id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Answer submitted successfully.",
    });
  } catch (error) {
    console.error("Error submitting quiz answer:", error);
    return NextResponse.json(
      { error: "Failed to submit the answer. Please try again." },
      { status: 500 }
    );
  }
}
