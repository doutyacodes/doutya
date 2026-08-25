import { db } from "@/utils";
import { USER_DETAILS, QUIZ_SEQUENCES, USER_EDUCATION_STAGE, USER_CAREER } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";
import { verifyGoogleToken } from "@/lib/googleAuth";

export async function POST(req) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json(
        { message: "Google ID token is required" },
        { status: 400 }
      );
    }

    // 1. Verify Google Token
    let googleProfile;
    try {
      googleProfile = await verifyGoogleToken(idToken);
    } catch (err) {
      return NextResponse.json(
        { message: err.message || "Invalid Google token" },
        { status: 401 }
      );
    }

    // 2. Lookup existing user by username/email
    const [existingUser] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, googleProfile.email))
      .execute();

    // 3. If new user -> return info to frontend for quick completion
    if (!existingUser) {
      return NextResponse.json(
        {
          status: "NEW_USER",
          message: "Google account verified. Please complete your registration.",
          googleProfile: {
            email: googleProfile.email,
            name: googleProfile.name,
            picture: googleProfile.picture,
          },
        },
        { status: 200 }
      );
    }

    // 4. Existing user -> Generate JWT & determine navigation
    const jwtSecret = process.env.JWT_SECRET_KEY || "doutyajWtsecRet";
    const token = jwt.sign(
      {
        userId: existingUser.id,
        birth_date: existingUser.birth_date,
        isVerified: existingUser.is_verified,
        plan: existingUser.plan_type,
        scope_type: existingUser.scope_type,
      },
      jwtSecret
    );

    const userId = existingUser.id;
    let navigateUrl = "/default";

    const [quizSequences, educationStage, userDetails, userCareers] = await Promise.all([
      db.select().from(QUIZ_SEQUENCES).where(eq(QUIZ_SEQUENCES.user_id, userId)).execute(),
      db.select().from(USER_EDUCATION_STAGE).where(eq(USER_EDUCATION_STAGE.user_id, userId)).execute(),
      db.select({
        country: USER_DETAILS.country,
        institutionId: USER_DETAILS.institution_id,
        instituteName: USER_DETAILS.institute_name,
        classId: USER_DETAILS.class_id,
        className: USER_DETAILS.class_name,
        academicYearStart: USER_DETAILS.academicYearStart,
        academicYearEnd: USER_DETAILS.academicYearEnd,
      }).from(USER_DETAILS).where(eq(USER_DETAILS.id, userId)).execute(),
      db.select().from(USER_CAREER).where(eq(USER_CAREER.user_id, userId)).execute(),
    ]);

    const quizMap = quizSequences.reduce((acc, quiz) => {
      acc[quiz.quiz_id] = quiz;
      return acc;
    }, {});

    const quiz1Completed = quizMap[1]?.type_sequence && quizMap[1].type_sequence !== "";
    const quiz2Completed = quizMap[2]?.type_sequence && quizMap[2].type_sequence !== "";
    const allQuizzesCompleted = quiz1Completed && quiz2Completed;

    if (!allQuizzesCompleted) {
      navigateUrl = "/default";
    } else {
      const educationStageExists = educationStage.length > 0;
      if (!educationStageExists) {
        navigateUrl = "/user/education-profile";
      } else {
        const hasAddedCareers = userCareers.length > 0;
        if (hasAddedCareers) {
          navigateUrl = "/dashboard/careers/career-guide";
        } else {
          const scopeType = existingUser.scope_type || "career";
          if (scopeType === "career") {
            navigateUrl = "/dashboard/careers/career-suggestions";
          } else if (scopeType === "sector") {
            navigateUrl = "/dashboard_kids/sector-suggestion";
          } else if (scopeType === "cluster") {
            navigateUrl = "/dashboard_junior/cluster-suggestion";
          }
        }
      }
    }

    const response = NextResponse.json(
      {
        status: "LOGGED_IN",
        token,
        birth_date: existingUser.birth_date,
        planType: existingUser.plan_type,
        class: existingUser.grade,
        navigateUrl,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          username: existingUser.username,
          grade: existingUser.grade,
        },
      },
      { status: 200 }
    );

    response.cookies.set("auth_token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Google Auth Route Error:", error);
    return NextResponse.json(
      { message: "Internal server error during Google authentication" },
      { status: 500 }
    );
  }
}
