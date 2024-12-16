import { NextResponse } from "next/server";
import { db } from "@/utils";
import {
  COMPANY_CHALLENGES,
  COMPANY_CHALLENGE_PROGRESS,
  COMPANY_CHALLENGE_QUESTIONS,
  COMPANY_CHALLENGE_OPTIONS,
  COMPANY_CHALLENGE_USER_QUIZ,
  COMPANY_USER_CHALLENGE_POINTS,
} from "@/utils/schema";
import { and, eq, not, inArray } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  try {
    // Authenticate the user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }
  
    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required." },
        { status: 400 }
      );
    }

    // Parse request body
    const { slug, show = null } = await req.json();

    if (!slug) {
      return NextResponse.json(
        { error: "Challenge slug is required." },
        { status: 400 }
      );
    }

    // Fetch challenge details
    const challenge = await db
      .select()
      .from(COMPANY_CHALLENGES)
      .where(eq(COMPANY_CHALLENGES.slug, slug))
      .execute();

    if (challenge.length === 0) {
      return NextResponse.json(
        { error: "Challenge not found." },
        { status: 404 }
      );
    }

    const challengeData = challenge[0];

    let permission = false;

    if (show && challengeData.entry_type == "points") {
      const user_points = await db
        .select()
        .from(COMPANY_USER_CHALLENGE_POINTS)
        .where(eq(COMPANY_USER_CHALLENGE_POINTS.user_id, userId))
        .execute();
      if (user_points.length > 0) {
        const required_points = challengeData.entry_fee;
        const user_points = user_points[0].points;
        if (user_points >= required_points) {
          permission = true;
        }
      }
    }

    // Fetch user's progress
    const challengeProgress = await db
      .select()
      .from(COMPANY_CHALLENGE_PROGRESS)
      .where(
        and(
          eq(COMPANY_CHALLENGE_PROGRESS.user_id, userId),
          eq(COMPANY_CHALLENGE_PROGRESS.challenge_id, challengeData.id)
        )
      )
      .execute();

    const isCompleted =
      challengeProgress.length > 0 ? challengeProgress[0].is_completed : false;

    if (challengeData.challenge_type === "quiz") {
      // Fetch answered questions
      const answeredQuestions = await db
        .select({
          question_id: COMPANY_CHALLENGE_USER_QUIZ.question_id,
          option_id: COMPANY_CHALLENGE_USER_QUIZ.option_id,
        })
        .from(COMPANY_CHALLENGE_USER_QUIZ)
        .where(
          and(
            eq(COMPANY_CHALLENGE_USER_QUIZ.challenge_id, challengeData.id),
            eq(COMPANY_CHALLENGE_USER_QUIZ.user_id, userId),
          )
        )
        .execute();

      const answeredQuestionIds = answeredQuestions.map((q) => q.question_id);

      // Fetch remaining questions
      const remainingQuestionsQuery = db
        .select({
          id: COMPANY_CHALLENGE_QUESTIONS.id,
          question: COMPANY_CHALLENGE_QUESTIONS.question,
        })
        .from(COMPANY_CHALLENGE_QUESTIONS)
        .where(eq(COMPANY_CHALLENGE_QUESTIONS.challenge_id, challengeData.id));

      if (answeredQuestionIds.length > 0) {
        remainingQuestionsQuery.where(
          not(inArray(COMPANY_CHALLENGE_QUESTIONS.id, answeredQuestionIds))
        );
      }

      const questions = await remainingQuestionsQuery.execute();

      // Fetch options for all remaining questions
      const questionIds = questions.map((q) => q.id);
      const options = questionIds.length
        ? await db
            .select()
            .from(COMPANY_CHALLENGE_OPTIONS)
            .where(inArray(COMPANY_CHALLENGE_OPTIONS.question_id, questionIds))
            .execute()
        : [];

      // Combine questions and options
      const remainingQuestions = questions.map((q) => ({
        ...q,
        options: options.filter((opt) => opt.question_id === q.id),
      }));

      // Return response for quiz challenges
      return NextResponse.json({
        challenge: {
          ...challengeData,
          isCompleted,
          permission
        },
        answeredQuestions: answeredQuestions || [],
        remainingQuestions: remainingQuestions || [],
      });
    }

    // Return response for non-quiz challenges
    return NextResponse.json({
      challenge: {
        ...challengeData,
        isCompleted,
        permission
      },
    });
  } catch (error) {
    console.error("Error in processing the request:", error);
    return NextResponse.json(
      { error: "Failed to process the request. Please try again later." },
      { status: 500 }
    );
  }
}
