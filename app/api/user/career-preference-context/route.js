// app/api/user/career-preference-context/route.js
import { db } from "@/utils";
import {
  USER_DETAILS, INSTITUTION, CLASS, USER_EDUCATION_STAGE, SCHOOL_EDUCATION,
  COLLEGE_EDUCATION, CAREER_PREFERENCES
} from "@/utils/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { INSTITUTION_STREAMS } from "@/utils/schema/institutional_schema";

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) return authResult.response;

  const userId = authResult.decoded_Data.userId;

  try {
    // Fetch user details with joins
    const userRows = await db
      .select({
        grade: USER_DETAILS.grade,
        scopeType: USER_DETAILS.scope_type,
        institutionId: USER_DETAILS.institution_id,
        instituteName: USER_DETAILS.institute_name,
        classId: USER_DETAILS.class_id,
        className: USER_DETAILS.class_name,
        userStream: USER_DETAILS.user_stream,
        streamId: USER_DETAILS.stream_id,
        courseId: USER_DETAILS.course_id,
        institutionType: INSTITUTION.type, // "School" or "College"
        institutionName: INSTITUTION.name,
        className2: CLASS.name,
      })
      .from(USER_DETAILS)
      .leftJoin(INSTITUTION, eq(USER_DETAILS.institution_id, INSTITUTION.id))
      .leftJoin(CLASS, eq(USER_DETAILS.class_id, CLASS.id))
      .where(eq(USER_DETAILS.id, userId))
      .limit(1);

    if (!userRows.length) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userRows[0];

    // Resolve stream name if streamId exists
    let streamName = user.userStream || null;
    if (user.streamId) {
      const streamRows = await db
        .select({ name: INSTITUTION_STREAMS.name })
        .from(INSTITUTION_STREAMS)
        .where(eq(INSTITUTION_STREAMS.id, user.streamId))
        .limit(1);
      if (streamRows.length) streamName = streamRows[0].name;
    }

    // Resolve class name
    const className = user.className2 || user.className || null;
    const institutionName = user.institutionName || user.instituteName || null;

    // Determine education level for preference options
    // "school" | "college" | "completed_education"
    const institutionType = user.institutionType; // "School" or "College"
    let educationStage = "school";
    if (institutionType === "College") {
      educationStage = "college";
    }

    // Check if grade suggests higher secondary (11th or 12th)
    const grade = user.grade || "";
    const gradeNum = parseInt(grade);
    const isHigherSecondary = gradeNum >= 11 || grade === "11" || grade === "12"
      || grade?.toLowerCase().includes("11") || grade?.toLowerCase().includes("12");

    // Check existing preferences
    const existingPrefs = await db
      .select()
      .from(CAREER_PREFERENCES)
      .where(eq(CAREER_PREFERENCES.userId, userId))
      .limit(1);

    return NextResponse.json({
      educationStage,
      institutionType,
      institutionName,
      className,
      grade,
      streamName,
      isHigherSecondary,
      existingPreference: existingPrefs[0] || null,
    });
  } catch (err) {
    console.error("career-preference-context error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}