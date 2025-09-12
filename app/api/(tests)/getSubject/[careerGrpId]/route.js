import { db } from "@/utils";
import {
  USER_DETAILS,
  SUBJECTS,
  CAREER_SUBJECTS,
  TESTS,
  USER_TESTS,
  USER_CAREER,
  CAREER_GROUP,
  USER_SUBJECT_COMPLETION,
  SECTOR,
  CLUSTER,
  USER_SECTOR,
  USER_CLUSTER,
  GENERATION_STATUS,
  USER_SCHOOL_SUBJECTS, // Add this import
} from "@/utils/schema";
import { NextResponse } from "next/server";
import { and, eq, gte, inArray, lte } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { calculateAge } from "@/lib/ageCalculate";
import { processCareerSubjects } from "@/app/api/utils/fetchAndSaveSubjects";
import { calculateWeekFromTimestamp } from "@/app/api/utils/calculateWeekFromTimestamp";
import crypto from "crypto"; // Add this import
import { use } from "react";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Helper function to generate unique key hash for subject generation
const generateKeyHash = (
  scopeId,
  scopeType,
  className,
  country,
  type1,
  type2
) => {
  const keyString = `${scopeId}-${scopeType}-${className}-${country}-${
    type1 || ""
  }-${type2 || ""}`;
  return crypto.createHash("sha256").update(keyString).digest("hex");
};

// Helper function to wait with exponential backoff
const waitWithBackoff = (attempt) => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const delay = Math.min(baseDelay * Math.pow(10, attempt), maxDelay);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

export async function GET(req, { params }) {
  try {
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const { careerGrpId: scopeId } = params;

    console.log("userId", userId);

    // Get user's details including scope_type
    const userDetailsResult = await db
      .select({
        birth_date: USER_DETAILS.birth_date,
        education: USER_DETAILS.education,
        educationLevel: USER_DETAILS.education_level,
        academicYearStart: USER_DETAILS.academicYearStart,
        academicYearEnd: USER_DETAILS.academicYearEnd,
        className: USER_DETAILS.grade,
        joined_date: USER_DETAILS.joined_date,
        scope_type: USER_DETAILS.scope_type,
        course: USER_DETAILS.college,
        university: USER_DETAILS.university,
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    if (!userDetailsResult.length) {
      return NextResponse.json(
        { message: "User details not found." },
        { status: 404 }
      );
    }

    const userDetails = userDetailsResult[0];
    const className = userDetails.className || "completed";
    const joinedAt = userDetails.joined_date;
    const scopeType = userDetails.scope_type || "career";
    const userStream = userDetails.user_stream || "";

    console.log(`User , Scope type: ${scopeType}`);

    // Get user's school subjects if they exist (for classes 11, 12, and college)
    let userSchoolSubjects = "";
    if (["11", "12", "college"].includes(className)) {
      const schoolSubjects = await db
        .select({ subject: USER_SCHOOL_SUBJECTS.subject })
        .from(USER_SCHOOL_SUBJECTS)
        .where(eq(USER_SCHOOL_SUBJECTS.user_id, userId));

      if (schoolSubjects.length > 0) {
        userSchoolSubjects = schoolSubjects.map((s) => s.subject).join(",");
        console.log("User school subjects:", userSchoolSubjects);
      }
    }

    // Get scope information first to generate key hash
    let scopeInfo = null;
    let scopeName = "";
    let country = "";
    let type1 = "";
    let type2 = "";
    let sectorDescription = null;
    let userCourse = userDetailsResult[0].course;
    let userUniversity = userDetailsResult[0].university;

    if (scopeType === "career") {
      const careerData = await db
        .select({
          careerGroupId: USER_CAREER.career_group_id,
          country: USER_CAREER.country,
          type1: USER_CAREER.type1,
          type2: USER_CAREER.type2,
          careerName: CAREER_GROUP.career_name,
        })
        .from(USER_CAREER)
        .innerJoin(
          CAREER_GROUP,
          eq(USER_CAREER.career_group_id, CAREER_GROUP.id)
        )
        .where(
          and(
            eq(USER_CAREER.user_id, userId),
            eq(USER_CAREER.career_group_id, scopeId)
          )
        );

      if (!careerData.length) {
        return NextResponse.json(
          { message: "No career information found for this user." },
          { status: 404 }
        );
      }

      scopeInfo = careerData[0];
      scopeName = scopeInfo.careerName;
      country = scopeInfo.country;
      type1 = scopeInfo.type1;
      type2 = scopeInfo.type2;
    } else if (scopeType === "cluster") {
      const clusterData = await db
        .select({
          clusterId: USER_CLUSTER.cluster_id,
          mbtiType: USER_CLUSTER.mbti_type,
          riasecCode: USER_CLUSTER.riasec_code,
          clusterName: CLUSTER.name,
          description: CLUSTER.brief_overview,
        })
        .from(USER_CLUSTER)
        .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
        .where(
          and(
            eq(USER_CLUSTER.user_id, userId),
            eq(USER_CLUSTER.cluster_id, scopeId)
          )
        );

      if (!clusterData.length) {
        return NextResponse.json(
          { message: "No cluster information found for this user." },
          { status: 404 }
        );
      }

      scopeInfo = clusterData[0];
      scopeName = scopeInfo.clusterName;
      type1 = scopeInfo.mbtiType || "";
      type2 = scopeInfo.riasecCode || "";
    } else if (scopeType === "sector") {
      const sectorData = await db
        .select({
          sectorId: USER_SECTOR.sector_id,
          mbtiType: USER_SECTOR.mbti_type,
          sectorName: SECTOR.name,
          description: SECTOR.brief_overview,
          sectorDescription: SECTOR.description,
        })
        .from(USER_SECTOR)
        .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
        .where(
          and(
            eq(USER_SECTOR.user_id, userId),
            eq(USER_SECTOR.sector_id, scopeId)
          )
        );

      if (!sectorData.length) {
        return NextResponse.json(
          { message: "No sector information found for this user." },
          { status: 404 }
        );
      }

      scopeInfo = sectorData[0];
      scopeName = scopeInfo.sectorName;
      type1 = scopeInfo.mbtiType || "";
      sectorDescription = sectorData.sectorDescription || null;
    }

    // Get country from USER_DETAILS if not already set
    if (!country) {
      const userCountry = await db
        .select({ country: USER_DETAILS.country })
        .from(USER_DETAILS)
        .where(eq(USER_DETAILS.id, userId));

      country = userCountry.length ? userCountry[0].country : "global";
    }

    // Generate unique key hash for this subject generation request
    const keyHash = generateKeyHash(
      scopeId,
      scopeType,
      className,
      country,
      type1,
      type2
    );

    // Check if subjects exist for this scope
    const subjectsExist = await db
      .select({ subjectId: CAREER_SUBJECTS.subject_id })
      .from(CAREER_SUBJECTS)
      .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
      .where(
        and(
          eq(CAREER_SUBJECTS.scope_id, scopeId),
          eq(CAREER_SUBJECTS.scope_type, scopeType),
          eq(SUBJECTS.class_name, className)
        )
      );

    console.log("subjectsExist", subjectsExist);

    if (!subjectsExist.length) {
      console.log("No subjects found, checking generation status...");

      // Use a transaction to handle race conditions
      let shouldStartGeneration = false;
      let generationStatus = [];

      try {
        // First, try to get existing status
        generationStatus = await db
          .select()
          .from(GENERATION_STATUS)
          .where(
            and(
              eq(GENERATION_STATUS.key_hash, keyHash),
              eq(GENERATION_STATUS.generation_type, "subject")
            )
          );

        if (generationStatus.length === 0) {
          // Try to insert a new record - this will fail if another request already inserted it
          try {
            await db.insert(GENERATION_STATUS).values({
              generation_type: "subject",
              key_hash: keyHash,
              status: "in_progress",
              generated_by: userId,
            });

            shouldStartGeneration = true;
            console.log(
              "Created new generation record, starting generation..."
            );
          } catch (insertError) {
            if (insertError.code === "ER_DUP_ENTRY") {
              // Another request already created the record, fetch it
              console.log(
                "Another request created generation record, fetching status..."
              );
              generationStatus = await db
                .select()
                .from(GENERATION_STATUS)
                .where(
                  and(
                    eq(GENERATION_STATUS.key_hash, keyHash),
                    eq(GENERATION_STATUS.generation_type, "subject")
                  )
                );
            } else {
              throw insertError; // Re-throw if it's not a duplicate entry error
            }
          }
        }

        // Handle generation based on current status
        if (shouldStartGeneration) {
          try {
            // This request should start the generation
            await processCareerSubjects(
              userId,
              scopeName,
              scopeId,
              country,
              userDetails.birth_date,
              className,
              type1,
              type2,
              scopeType,
              sectorDescription,
              userStream,
              userSchoolSubjects,
              userCourse,
              userUniversity
            );

            // Mark generation as completed
            await db
              .update(GENERATION_STATUS)
              .set({ status: "completed" })
              .where(
                and(
                  eq(GENERATION_STATUS.key_hash, keyHash),
                  eq(GENERATION_STATUS.generation_type, "subject")
                )
              );

            console.log("Subject generation completed successfully");
          } catch (error) {
            // Mark generation as failed
            await db
              .update(GENERATION_STATUS)
              .set({ status: "failed" })
              .where(
                and(
                  eq(GENERATION_STATUS.key_hash, keyHash),
                  eq(GENERATION_STATUS.generation_type, "subject")
                )
              );

            console.error("Subject generation failed:", error);
            throw error;
          }
        } else {
          // Another request is handling generation, wait for it
          const currentStatus = generationStatus[0]?.status;

          if (currentStatus === "in_progress") {
            console.log(
              "Subject generation in progress by another request, waiting..."
            );
            await waitForGenerationCompletion(keyHash);
          } else if (currentStatus === "failed") {
            console.log("Previous generation failed, attempting retry...");
            await handleFailedGeneration(
              keyHash,
              userId,
              scopeName,
              scopeId,
              country,
              userDetails.birth_date,
              className,
              type1,
              type2,
              scopeType,
              sectorDescription,
              userStream,
              userSchoolSubjects,
              userCourse,
              userUniversity
            );
          }
          // If status is 'completed', continue with fetching subjects
        }
      } catch (error) {
        console.error("Error in generation status handling:", error);
        throw error;
      }
    }

    // Continue with the rest of your existing code...
    const user_days = calculateWeekFromTimestamp(joinedAt);
    const yearsSinceJoined = user_days.yearsSinceJoined;
    const monthsSinceJoined = user_days.monthsSinceJoined;
    const weekNumber = user_days.weekNumber;

    console.log(yearsSinceJoined, monthsSinceJoined, weekNumber);

    // Get subjects for this scope
    const subjectsForScope = await db
      .select({
        subjectId: SUBJECTS.subject_id,
        subjectName: SUBJECTS.subject_name,
        completed: USER_SUBJECT_COMPLETION.completed,
        testID: USER_SUBJECT_COMPLETION.test_id,
      })
      .from(CAREER_SUBJECTS)
      .innerJoin(SUBJECTS, eq(CAREER_SUBJECTS.subject_id, SUBJECTS.subject_id))
      .leftJoin(
        TESTS,
        and(
          eq(TESTS.subject_id, SUBJECTS.subject_id),
          eq(TESTS.year, yearsSinceJoined),
          eq(TESTS.month, monthsSinceJoined),
          eq(TESTS.week_number, weekNumber)
        )
      )
      .leftJoin(
        USER_SUBJECT_COMPLETION,
        and(
          eq(USER_SUBJECT_COMPLETION.user_id, userId),
          eq(USER_SUBJECT_COMPLETION.test_id, TESTS.test_id)
        )
      )
      .where(
        and(
          eq(CAREER_SUBJECTS.scope_id, scopeId),
          eq(CAREER_SUBJECTS.scope_type, scopeType),
          eq(SUBJECTS.class_name, className)
        )
      );

    if (!subjectsForScope.length) {
      return NextResponse.json(
        {
          message: `No subjects found for this ${scopeType}.`,
        },
        { status: 400 }
      );
    }

    console.log("subjectsForScope", subjectsForScope);

    // Process subjects to include completion status
    const subjectsWithCompletionStatus = subjectsForScope.map((subject) => ({
      subjectId: subject.subjectId,
      subjectName: subject.subjectName,
      completed: subject.completed === "yes" ? "yes" : "no",
      testID: subject.testID,
    }));

    return NextResponse.json(
      {
        subjects: subjectsWithCompletionStatus,
        scopeType: scopeType,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching subjects:", error);
    return NextResponse.json(
      { message: "Error fetching subjects" },
      { status: 500 }
    );
  }
}

const waitForGenerationCompletion = async (keyHash) => {
  const maxWaitTime = 5 * 60 * 1000; // 5 minutes
  const startTime = Date.now();
  let attempt = 0;

  while (Date.now() - startTime < maxWaitTime) {
    await waitWithBackoff(attempt);
    attempt++;

    const updatedStatus = await db
      .select()
      .from(GENERATION_STATUS)
      .where(
        and(
          eq(GENERATION_STATUS.key_hash, keyHash),
          eq(GENERATION_STATUS.generation_type, "subject")
        )
      );

    if (updatedStatus.length > 0) {
      const status = updatedStatus[0].status;

      if (status === "completed") {
        console.log("Subject generation completed by another request");
        return;
      } else if (status === "failed") {
        throw new Error("Subject generation failed by another request");
      }
    }
  }

  // If we reach here, generation timed out
  throw new Error("Subject generation timed out");
};

// Helper function to handle failed generation with atomic retry
const handleFailedGeneration = async (
  keyHash,
  userId,
  scopeName,
  scopeId,
  country,
  birthDate,
  className,
  type1,
  type2,
  scopeType,
  sectorDescription,
  userStream,
  userSchoolSubjects
) => {
  try {
    // Use atomic update to claim the retry
    const updateResult = await db
      .update(GENERATION_STATUS)
      .set({
        status: "in_progress",
        generated_by: userId,
      })
      .where(
        and(
          eq(GENERATION_STATUS.key_hash, keyHash),
          eq(GENERATION_STATUS.generation_type, "subject"),
          eq(GENERATION_STATUS.status, "failed") // Only update if still failed
        )
      );

    // Check if we successfully claimed the retry (updateResult should indicate affected rows)
    // Note: The exact way to check affected rows depends on your DB library
    console.log("Attempting to retry failed generation...");

    await processCareerSubjects(
      userId,
      scopeName,
      scopeId,
      country,
      birthDate,
      className,
      type1,
      type2,
      scopeType,
      sectorDescription,
      userStream,
      userSchoolSubjects,
      userCourse,
      userUniversity
    );

    await db
      .update(GENERATION_STATUS)
      .set({ status: "completed" })
      .where(
        and(
          eq(GENERATION_STATUS.key_hash, keyHash),
          eq(GENERATION_STATUS.generation_type, "subject")
        )
      );

    console.log("Retry generation completed successfully");
  } catch (error) {
    await db
      .update(GENERATION_STATUS)
      .set({ status: "failed" })
      .where(
        and(
          eq(GENERATION_STATUS.key_hash, keyHash),
          eq(GENERATION_STATUS.generation_type, "subject")
        )
      );

    console.error("Retry generation failed:", error);
    throw error;
  }
};
