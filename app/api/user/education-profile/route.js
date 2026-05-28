// File: /app/api/user/education-profile/route.js
import { 
  USER_EDUCATION_STAGE, 
  SCHOOL_EDUCATION, 
  COLLEGE_EDUCATION, 
  COMPLETED_EDUCATION, 
  WORK_EXPERIENCE, 
  CAREER_PREFERENCES, 
  USER_DETAILS,
  INSTITUTION,
  CLASS
} from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import { INSTITUTION_COURSES, INSTITUTION_STREAMS } from "@/utils/schema/institutional_schema";

// app/api/user/education-profile/route.js  (POST section)
export async function POST(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) return authResult.response;

    const userId = authResult.decoded_Data.userId;
    const data = await req.json();
    // data = { preference, description }

    return await db.transaction(async (tx) => {
      // 1. Fetch user profile to auto-fill education data
      const userRows = await tx
        .select({
          grade: USER_DETAILS.grade,
          institutionId: USER_DETAILS.institution_id,
          instituteName: USER_DETAILS.institute_name,
          classId: USER_DETAILS.class_id,
          className: USER_DETAILS.class_name,
          userStream: USER_DETAILS.user_stream,
          streamId: USER_DETAILS.stream_id,
          courseId: USER_DETAILS.course_id,
          institutionType: INSTITUTION.type,
          institutionName: INSTITUTION.name,
          className2: CLASS.name,
          academicYearStart: USER_DETAILS.academicYearStart,
          academicYearEnd: USER_DETAILS.academicYearEnd,
        })
        .from(USER_DETAILS)
        .leftJoin(INSTITUTION, eq(USER_DETAILS.institution_id, INSTITUTION.id))
        .leftJoin(CLASS, eq(USER_DETAILS.class_id, CLASS.id))
        .where(eq(USER_DETAILS.id, userId))
        .limit(1);

      if (!userRows.length) throw new Error("User not found");

      const user = userRows[0];
      const institutionType = user.institutionType; // "School" | "College"
      const className = user.className2 || user.className;
      const grade = user.grade || "";
      const gradeNum = parseInt(grade);
      const isHigherSecondary = gradeNum >= 11;

      // Resolve stream name
      let streamName = user.userStream || null;
      if (user.streamId) {
        const streamRows = await tx
          .select({ name: INSTITUTION_STREAMS.name })
          .from(INSTITUTION_STREAMS)
          .where(eq(INSTITUTION_STREAMS.id, user.streamId))
          .limit(1);
        if (streamRows.length) streamName = streamRows[0].name;
      }

      // 2. Determine education stage from institution type
      const educationStage =
        institutionType === "College" ? "college" : "school";

      // 3. Upsert USER_EDUCATION_STAGE
      await tx
        .insert(USER_EDUCATION_STAGE)
        .values({ user_id: userId, stage: educationStage })
        .onDuplicateKeyUpdate({ set: { stage: educationStage } });

      // 4. Auto-fill SCHOOL_EDUCATION
      if (educationStage === "school") {
        await tx
          .delete(SCHOOL_EDUCATION)
          .where(eq(SCHOOL_EDUCATION.user_id, userId));

        await tx.insert(SCHOOL_EDUCATION).values({
          user_id: userId,
          is_higher_secondary: isHigherSecondary,
          main_subject: streamName || null,
          description: data.description || null,
        });
      }

      // 5. Auto-fill COLLEGE_EDUCATION
      if (educationStage === "college") {
        await tx
          .delete(COLLEGE_EDUCATION)
          .where(eq(COLLEGE_EDUCATION.user_id, userId));

        // Resolve course name if available
        let courseName = null;
        if (user.courseId) {
          const courseRows = await tx
            .select({ name: INSTITUTION_COURSES.name })
            .from(INSTITUTION_COURSES)
            .where(eq(INSTITUTION_COURSES.id, user.courseId))
            .limit(1);
          if (courseRows.length) courseName = courseRows[0].name;
        }

        await tx.insert(COLLEGE_EDUCATION).values({
          user_id: userId,
          degree: courseName || "Undergraduate", // best-effort
          field: streamName || className || "General",
          year_of_study: 1, // default; we don't collect this separately
          is_completed: false,
          description: data.description || null,
        });
      }

      // 6. Map preference to the right column
      const prefValue = data.preference;
      let prefPayload = {
        userId: userId,
        schoolPref: null,
        collegePref: null,
        completedPref: null,
        noJobPref: null,
      };

      if (educationStage === "school") {
        prefPayload.schoolPref = prefValue;
      } else if (educationStage === "college") {
        prefPayload.collegePref = prefValue;
      }

      await tx
        .insert(CAREER_PREFERENCES)
        .values(prefPayload)
        .onDuplicateKeyUpdate({
          set: {
            schoolPref: prefPayload.schoolPref,
            collegePref: prefPayload.collegePref,
          },
        });

      return NextResponse.json({ success: true, educationStage });
    });
  } catch (error) {
    console.error("Error updating education profile:", error);
    return NextResponse.json(
      { error: "Failed to update education profile" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's education profile
export async function GET(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    
    // Fetch all education data for this user
    const [
      educationStage,
      schoolEducation,
      collegeEducation,
      completedEducation,
      workExperience,
      careerPreferences
    ] = await Promise.all([
      db.select().from(USER_EDUCATION_STAGE).where(eq(USER_EDUCATION_STAGE.user_id, userId)).limit(1),
      db.select().from(SCHOOL_EDUCATION).where(eq(SCHOOL_EDUCATION.user_id, userId)),
      db.select().from(COLLEGE_EDUCATION).where(eq(COLLEGE_EDUCATION.user_id, userId)),
      db.select().from(COMPLETED_EDUCATION).where(eq(COMPLETED_EDUCATION.user_id, userId)),
      db.select().from(WORK_EXPERIENCE).where(eq(WORK_EXPERIENCE.user_id, userId)),
      db.select().from(CAREER_PREFERENCES).where(eq(CAREER_PREFERENCES.userId, userId)).limit(1)
    ]);

    // Transform data to match the new UI structure
    const completedEntries = [];
    
    // Add education entries
    if (completedEducation && completedEducation.length > 0) {
      completedEducation.forEach(edu => {
        completedEntries.push({
          type: "education",
          degree: edu.degree,
          field: edu.field,
          institution: edu.institution,
          startDate: edu.start_date ? edu.start_date.toISOString().substring(0, 7) : "",
          endDate: edu.end_date ? edu.end_date.toISOString().substring(0, 7) : "",
          isCurrentlyStudying: edu.is_currently_studying,
          description: edu.description,
          jobTitle: "",
          company: "",
          isCurrentlyWorking: false,
          skills: ""
        });
      });
    }

    // Add work entries
    if (workExperience && workExperience.length > 0) {
      workExperience.forEach(work => {
        completedEntries.push({
          type: "work",
          degree: "",
          field: "",
          institution: "",
          startDate: work.start_date ? work.start_date.toISOString().substring(0, 7) : "",
          endDate: work.end_date ? work.end_date.toISOString().substring(0, 7) : "",
          isCurrentlyStudying: false,
          description: work.description,
          jobTitle: work.job_title,
          company: work.company,
          isCurrentlyWorking: work.is_currently_working,
          skills: work.skills || ""
        });
      });
    }

    return NextResponse.json({
      educationStage: educationStage[0]?.stage || null,
      schoolEducation: schoolEducation[0] || null,
      collegeEducation: collegeEducation || [],
      completedEntries: completedEntries,
      // Legacy format for backward compatibility
      completedEducation: completedEducation || [],
      workExperience: workExperience || [],
      careerPreferences: careerPreferences[0] || null
    });
  } catch (error) {
    console.error("Error fetching education profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch education profile" },
      { status: 500 }
    );
  }
}