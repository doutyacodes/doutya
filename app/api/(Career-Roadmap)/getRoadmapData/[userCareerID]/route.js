// import { db } from "@/utils"; // Ensure this path is correct
// import {
//   CAREER_GROUP,
//   USER_CAREER,
//   MILESTONES,
//   MILESTONE_CATEGORIES,
//   USER_MILESTONES,
//   USER_DETAILS,
//   USER_CAREER_STATUS,
//   CERTIFICATIONS,
//   USER_CERTIFICATION_COMPLETION,
//   MILESTONE_SUBCATEGORIES,
//   USER_COURSE_PROGRESS,
//   CLUSTER,
//   USER_CLUSTER,
//   SECTOR,
//   USER_SECTOR
// } from "@/utils/schema"; // Ensure this path is correct
// import { NextResponse } from "next/server";
// import { authenticate } from "@/lib/jwtMiddleware"; // Ensure this path is correct
// import { eq, and } from "drizzle-orm";
// import { formattedAge } from "@/lib/formattedAge";
// import { fetchAndSaveRoadmap } from "@/app/api/utils/fetchAndSaveRoadmap";

// export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

// export async function GET(req, { params }) {
//   // Authenticate the request
//   const authResult = await authenticate(req);
//   if (!authResult.authenticated) {
//     return authResult.response;
//   }

//   // Extract userId from decoded token
//   const userData = authResult.decoded_Data;
//   const userId = userData.userId;

//   const language = req.headers.get('accept-language') || 'en';

//   const { userCareerID } = params;

//   try {
//     console.log("userCareerID", userCareerID);

//     const user_data = await db
//       .select({
//         birth_date: USER_DETAILS.birth_date,
//         education: USER_DETAILS.education,
//         educationLevel: USER_DETAILS.education_level,
//         academicYearStart: USER_DETAILS.academicYearStart,
//         academicYearEnd: USER_DETAILS.academicYearEnd,
//         className: USER_DETAILS.class_name,
//         scopeType: USER_DETAILS.scope_type, // Get the user's scope_type
//       })
//       .from(USER_DETAILS)
//       .where(eq(USER_DETAILS.id, userId));

//     const birth_date = user_data[0].birth_date;
//     console.log("birth_date", birth_date);
//     const age = formattedAge(birth_date);
//     console.log("formattedAge", age);

//     // Get the scope type for this user
//     const scopeType = user_data[0].scopeType || "career"; // Default to career if not specified
//     console.log("scopeType", scopeType);

//     let scopeId;
//     let scopeName;
//     let type1 = null;
//     let type2 = null;

//     // Determine which table to query based on scope_type
//     switch(scopeType) {
//       case "career":
//         // Fetch career data from USER_CAREER
//         const userCareerData = await db
//           .select({
//             careerGroupID: CAREER_GROUP.id,
//             career_name: CAREER_GROUP.career_name,
//             type1: USER_CAREER.type1,
//             type2: USER_CAREER.type2,
//           })
//           .from(USER_CAREER)
//           .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
//           .where(eq(USER_CAREER.id, userCareerID))
//           .execute();

//         if (!userCareerData.length) {
//           return NextResponse.json({ message: "Career not found." }, { status: 404 });
//         }

//         scopeId = userCareerData[0].careerGroupID;
//         scopeName = userCareerData[0].career_name;
//         type1 = userCareerData[0].type1;
//         type2 = userCareerData[0].type2;
//         break;

//       case "cluster":
//         // Fetch cluster data from USER_CLUSTER
//         const userClusterData = await db
//           .select({
//             clusterId: CLUSTER.id,
//             clusterName: CLUSTER.name,
//             mbtiType: USER_CLUSTER.mbti_type,
//             riasecCode: USER_CLUSTER.riasec_code,
//           })
//           .from(USER_CLUSTER)
//           .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
//           .where(eq(USER_CLUSTER.id, userCareerID)) // Using userCareerID as userClusterID
//           .execute();

//         if (!userClusterData.length) {
//           return NextResponse.json({ message: "Cluster not found." }, { status: 404 });
//         }

//         scopeId = userClusterData[0].clusterId;
//         scopeName = userClusterData[0].clusterName;
//         type1 = userClusterData[0].mbtiType;
//         type2 = userClusterData[0].riasecCode;
//         break;

//       case "sector":
//         // Fetch sector data from USER_SECTOR
//         const userSectorData = await db
//           .select({
//             sectorId: SECTOR.id,
//             sectorName: SECTOR.name,
//             mbtiType: USER_SECTOR.mbti_type,
//           })
//           .from(USER_SECTOR)
//           .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
//           .where(eq(USER_SECTOR.id, userCareerID)) // Using userCareerID as userSectorID
//           .execute();

//         if (!userSectorData.length) {
//           return NextResponse.json({ message: "Sector not found." }, { status: 404 });
//         }

//         scopeId = userSectorData[0].sectorId;
//         scopeName = userSectorData[0].sectorName;
//         type1 = userSectorData[0].mbtiType;
//         type2 = null; // No type2 for sector
//         break;

//       default:
//         return NextResponse.json({ message: "Invalid scope type." }, { status: 400 });
//     }

//     // Fetch milestones for the current scope
//     const userMilestones = await db
//       .select({
//         milestoneId: USER_MILESTONES.milestone_id,
//         milestoneDescription: MILESTONES.description,
//         milestoneCategoryName: MILESTONE_CATEGORIES.name,
//         milestoneSubcategoryName: MILESTONE_SUBCATEGORIES.name,
//         milestoneCompletionStatus: MILESTONES.completion_status,
//         milestoneDateAchieved: MILESTONES.date_achieved,
//         certificationId: CERTIFICATIONS.id,
//         certificationName: CERTIFICATIONS.certification_name,
//         certificationCompletedStatus: USER_CERTIFICATION_COMPLETION.completed,
//         courseStatus: USER_COURSE_PROGRESS.status
//       })
//       .from(USER_MILESTONES)
//       .innerJoin(MILESTONES, eq(USER_MILESTONES.milestone_id, MILESTONES.id))
//       .innerJoin(MILESTONE_CATEGORIES, eq(MILESTONES.category_id, MILESTONE_CATEGORIES.id))
//       .leftJoin(MILESTONE_SUBCATEGORIES, eq(MILESTONES.subcategory_id, MILESTONE_SUBCATEGORIES.id))
//       .leftJoin(
//         CERTIFICATIONS,
//         and(
//           eq(CERTIFICATIONS.milestone_id, MILESTONES.id),
//           eq(CERTIFICATIONS.scope_id, scopeId),
//           eq(CERTIFICATIONS.scope_type, scopeType)
//         )
//       )
//       .leftJoin(
//         USER_CERTIFICATION_COMPLETION,
//         and(
//           eq(USER_CERTIFICATION_COMPLETION.certification_id, CERTIFICATIONS.id),
//           eq(USER_CERTIFICATION_COMPLETION.user_id, userId)
//         )
//       )
//       .leftJoin(
//         USER_COURSE_PROGRESS,
//         and(
//           eq(USER_COURSE_PROGRESS.certification_id, CERTIFICATIONS.id),
//           eq(USER_COURSE_PROGRESS.user_id, userId)
//         )
//       )
//       .where(
//         and(
//           eq(USER_MILESTONES.scope_id, userCareerID),
//           eq(USER_MILESTONES.scope_type, scopeType),
//           eq(MILESTONES.milestone_age, age)
//         )
//       )
//       .execute();

//     // If no milestones are found, start data generation
//     if (userMilestones.length === 0) {
//       // Call fetchAndSaveRoadmap with the scope information
//       const savedMilestones = await fetchAndSaveRoadmap(
//         userId,
//         userCareerID,
//         birth_date,
//         age,
//         scopeId,
//         scopeName,
//         type1,
//         type2,
//         language,
//         scopeType // Pass the scope type
//       );
//       return NextResponse.json(savedMilestones, { status: 200 });
//     }

//     // Respond with fetched milestones data
//     return NextResponse.json(userMilestones, { status: 200 });

//   } catch (error) {
//     console.error("Error fetching milestones data:", error);
//     return NextResponse.json(
//       { message: "Error processing request" },
//       { status: 500 }
//     );
//   }
// }

import { calculateWeekFromTimestamp } from "@/app/api/utils/calculateWeekFromTimestamp";
import { fetchAndSaveRoadmap } from "@/app/api/utils/fetchAndSaveRoadmap";
import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";
import crypto from "crypto";
import {
  CAREER_GROUP,
  CERTIFICATIONS,
  CLUSTER,
  MILESTONES,
  MILESTONE_CATEGORIES,
  MILESTONE_SUBCATEGORIES,
  SECTOR,
  USER_CAREER,
  USER_CERTIFICATION_COMPLETION,
  USER_CLUSTER,
  USER_COURSE_PROGRESS,
  USER_DETAILS,
  USER_MILESTONES,
  USER_SECTOR,
  GENERATION_STATUS,
  COMPLETED_EDUCATION,
  WORK_EXPERIENCE,
} from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Helper function to generate unique key hash for milestone generation
const generateMilestoneKeyHash = (
  scopeId,
  classLevel,
  currentMonth,
  scopeType
) => {
  const keyString = `milestone-${scopeType}-${scopeId}-${classLevel}-${currentMonth}`;
  return crypto.createHash("sha256").update(keyString).digest("hex");
};

// Helper function to wait with exponential backoff
const waitWithBackoff = (attempt) => {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const delay = Math.min(baseDelay * Math.pow(1.5, attempt), maxDelay);
  return new Promise((resolve) => setTimeout(resolve, delay));
};

// Helper function to wait for milestone generation completion
const waitForMilestoneGenerationCompletion = async (milestoneKeyHash) => {
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
          eq(GENERATION_STATUS.key_hash, milestoneKeyHash),
          eq(GENERATION_STATUS.generation_type, "milestone")
        )
      );

    if (updatedStatus.length > 0) {
      const status = updatedStatus[0].status;

      if (status === "completed") {
        console.log("Milestone generation completed by another request");
        return;
      } else if (status === "failed") {
        throw new Error("Milestone generation failed by another request");
      }
    }
  }

  // If we reach here, generation timed out
  throw new Error("Milestone generation timed out");
};

// Helper function to handle failed milestone generation with atomic retry
const handleFailedMilestoneGeneration = async (
  milestoneKeyHash,
  userId,
  scopeId,
  classLevel,
  currentMonth,
  userCareerID,
  scopeName,
  type1,
  type2,
  language,
  scopeType,
  sectorDescription
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
          eq(GENERATION_STATUS.key_hash, milestoneKeyHash),
          eq(GENERATION_STATUS.generation_type, "milestone"),
          eq(GENERATION_STATUS.status, "failed") // Only update if still failed
        )
      );

    console.log("Attempting to retry failed milestone generation...");

    const savedMilestones = await fetchAndSaveRoadmap(
      userId,
      scopeId,
      classLevel,
      currentMonth,
      userCareerID,
      scopeName,
      type1,
      type2,
      language,
      scopeType,
      sectorDescription
    );

    await db
      .update(GENERATION_STATUS)
      .set({ status: "completed" })
      .where(
        and(
          eq(GENERATION_STATUS.key_hash, milestoneKeyHash),
          eq(GENERATION_STATUS.generation_type, "milestone")
        )
      );

    console.log("Retry milestone generation completed successfully");
    return savedMilestones;
  } catch (error) {
    await db
      .update(GENERATION_STATUS)
      .set({ status: "failed" })
      .where(
        and(
          eq(GENERATION_STATUS.key_hash, milestoneKeyHash),
          eq(GENERATION_STATUS.generation_type, "milestone")
        )
      );

    console.error("Retry milestone generation failed:", error);
    throw error;
  }
};

export async function GET(req, { params }) {
  // Authenticate the request
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  // Extract userId from decoded token
  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  const language = req.headers.get("accept-language") || "en";

  const { userCareerID } = params;

  try {
    console.log("userCareerID", userCareerID);

    const user_data = await db
      .select({
        birth_date: USER_DETAILS.birth_date,
        education: USER_DETAILS.education,
        educationLevel: USER_DETAILS.education_level,
        academicYearStart: USER_DETAILS.academicYearStart,
        academicYearEnd: USER_DETAILS.academicYearEnd,
        className: USER_DETAILS.grade,
        scopeType: USER_DETAILS.scope_type,
        joinedDate: USER_DETAILS.joined_date,
        grade: USER_DETAILS.grade,
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    const birth_date = user_data[0].birth_date;
    const joinedDate = user_data[0].joinedDate;
    const classLevel = user_data[0].className;

    // Calculate current month from joined date
    const timeData = calculateWeekFromTimestamp(joinedDate);
    const currentMonth = timeData.monthsSinceJoined;

    console.log("classLevel", classLevel);
    console.log("currentMonth", currentMonth);

    // Get the scope type for this user
    const scopeType = user_data[0].scopeType || "career";
    console.log("scopeType", scopeType);

    let educationWorkDescription = null;
    let workExperience = "";
    let completedEducation = "";

    if (user_data[0].grade === "completed-education") {
      // Fetch completed education
      const completedEducation = await db
        .select({
          degree: COMPLETED_EDUCATION.degree,
          field: COMPLETED_EDUCATION.field,
          institution: COMPLETED_EDUCATION.institution,
          start_date: COMPLETED_EDUCATION.start_date,
          end_date: COMPLETED_EDUCATION.end_date,
          is_currently_studying: COMPLETED_EDUCATION.is_currently_studying,
        })
        .from(COMPLETED_EDUCATION)
        .where(eq(COMPLETED_EDUCATION.user_id, userId))
        .execute();

      // Fetch work experience
      const workExperience = await db
        .select({
          job_title: WORK_EXPERIENCE.job_title,
          company: WORK_EXPERIENCE.company,
          start_date: WORK_EXPERIENCE.start_date,
          end_date: WORK_EXPERIENCE.end_date,
          is_currently_working: WORK_EXPERIENCE.is_currently_working,
          skills: WORK_EXPERIENCE.skills,
        })
        .from(WORK_EXPERIENCE)
        .where(eq(WORK_EXPERIENCE.user_id, userId))
        .execute();

      // Helper function to format dates
      const formatDate = (date) => {
        if (!date) return "unknown";
        const d = new Date(date);
        const month = d.toLocaleDateString("en-US", { month: "long" });
        const year = d.getFullYear();
        return `${month} ${year}`;
      };

      // Format education information
      let educationText = "";
      if (completedEducation.length > 0) {
        const educationDetails = completedEducation
          .map((edu) => {
            const duration =
              edu.start_date && edu.end_date
                ? `from ${formatDate(edu.start_date)} to ${formatDate(
                    edu.end_date
                  )}`
                : edu.is_currently_studying
                ? `from ${formatDate(edu.start_date)} (currently studying)`
                : "";

            return `${edu.degree} in ${edu.field}${
              edu.institution ? ` from ${edu.institution}` : ""
            }${duration ? ` ${duration}` : ""}`;
          })
          .join(", ");

        educationText = `Education: ${educationDetails}.`;
      }

      // Format work experience information
      let workText = "";
      if (workExperience.length > 0) {
        const workDetails = workExperience
          .map((work) => {
            const duration =
              work.start_date && work.end_date && !work.is_currently_working
                ? `from ${formatDate(work.start_date)} to ${formatDate(
                    work.end_date
                  )}`
                : work.is_currently_working
                ? `from ${formatDate(work.start_date)} (currently working)`
                : work.start_date
                ? `from ${formatDate(work.start_date)}`
                : "";

            let workDetail = `${work.job_title}${
              work.company ? ` at ${work.company}` : ""
            }${duration ? ` ${duration}` : ""}`;
            if (work.skills) {
              workDetail += ` with skills in ${work.skills}`;
            }
            return workDetail;
          })
          .join(", ");

        workText = `Work Experience: ${workDetails}.`;
      }

      // Combine both education and work information
      educationWorkDescription = [educationText, workText]
        .filter(Boolean)
        .join(" ");
    }
    console.log("educationWorkDescription", educationWorkDescription);
    // return NextResponse.json({
    //   debug: { educationWorkDescription, completedEducation, workExperience },
    // });

    let scopeId;
    let scopeName;
    let type1 = null;
    let type2 = null;
    let sectorDescription = null;

    // Determine which table to query based on scope_type
    switch (scopeType) {
      case "career":
        // Fetch career data from USER_CAREER
        const userCareerData = await db
          .select({
            careerGroupID: CAREER_GROUP.id,
            career_name: CAREER_GROUP.career_name,
            type1: USER_CAREER.type1,
            type2: USER_CAREER.type2,
          })
          .from(USER_CAREER)
          .innerJoin(
            CAREER_GROUP,
            eq(USER_CAREER.career_group_id, CAREER_GROUP.id)
          )
          .where(eq(USER_CAREER.id, userCareerID))
          .execute();

        if (!userCareerData.length) {
          return NextResponse.json(
            { message: "Career not found." },
            { status: 404 }
          );
        }

        scopeId = userCareerData[0].careerGroupID;
        scopeName = userCareerData[0].career_name;
        type1 = userCareerData[0].type1;
        type2 = userCareerData[0].type2;
        break;

      case "cluster":
        // Fetch cluster data from USER_CLUSTER
        const userClusterData = await db
          .select({
            clusterId: CLUSTER.id,
            clusterName: CLUSTER.name,
            mbtiType: USER_CLUSTER.mbti_type,
            riasecCode: USER_CLUSTER.riasec_code,
          })
          .from(USER_CLUSTER)
          .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
          .where(eq(USER_CLUSTER.id, userCareerID))
          .execute();

        if (!userClusterData.length) {
          return NextResponse.json(
            { message: "Cluster not found." },
            { status: 404 }
          );
        }

        scopeId = userClusterData[0].clusterId;
        scopeName = userClusterData[0].clusterName;
        type1 = userClusterData[0].mbtiType;
        type2 = userClusterData[0].riasecCode;
        break;

      case "sector":
        // Fetch sector data from USER_SECTOR
        const userSectorData = await db
          .select({
            sectorId: SECTOR.id,
            sectorName: SECTOR.name,
            sectorDescription: SECTOR.description,
            mbtiType: USER_SECTOR.mbti_type,
          })
          .from(USER_SECTOR)
          .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
          .where(eq(USER_SECTOR.id, userCareerID))
          .execute();

        if (!userSectorData.length) {
          return NextResponse.json(
            { message: "Sector not found." },
            { status: 404 }
          );
        }

        scopeId = userSectorData[0].sectorId;
        scopeName = userSectorData[0].sectorName;
        sectorDescription = userSectorData[0].sectorDescription;
        type1 = userSectorData[0].mbtiType;
        type2 = null;
        break;

      default:
        return NextResponse.json(
          { message: "Invalid scope type." },
          { status: 400 }
        );
    }

    // Fetch milestones based on scope type
    let userMilestones;

    if (scopeType === "sector" || scopeType === "cluster") {
      // Generate unique key hash for milestone generation (only for sectors and clusters)
      const milestoneKeyHash = generateMilestoneKeyHash(
        scopeId,
        classLevel,
        currentMonth,
        scopeType
      );

      // First check if milestones exist for this class level and month
      const existingMilestones = await db
        .select({
          milestoneId: MILESTONES.id,
          milestoneDescription: MILESTONES.description,
          milestoneCategoryName: MILESTONE_CATEGORIES.name,
          milestoneSubcategoryName: MILESTONE_SUBCATEGORIES.name,
          milestoneCompletionStatus: MILESTONES.completion_status,
          milestoneDateAchieved: MILESTONES.date_achieved,
          certificationId: CERTIFICATIONS.id,
          certificationName: CERTIFICATIONS.certification_name,
          certificationCompletedStatus: USER_CERTIFICATION_COMPLETION.completed,
          courseStatus: USER_COURSE_PROGRESS.status,
        })
        .from(MILESTONES)
        .innerJoin(
          MILESTONE_CATEGORIES,
          eq(MILESTONES.category_id, MILESTONE_CATEGORIES.id)
        )
        .leftJoin(
          MILESTONE_SUBCATEGORIES,
          eq(MILESTONES.subcategory_id, MILESTONE_SUBCATEGORIES.id)
        )
        .leftJoin(
          CERTIFICATIONS,
          and(
            eq(CERTIFICATIONS.milestone_id, MILESTONES.id),
            eq(CERTIFICATIONS.scope_id, scopeId),
            eq(CERTIFICATIONS.scope_type, scopeType)
          )
        )
        .leftJoin(
          USER_CERTIFICATION_COMPLETION,
          and(
            eq(
              USER_CERTIFICATION_COMPLETION.certification_id,
              CERTIFICATIONS.id
            ),
            eq(USER_CERTIFICATION_COMPLETION.user_id, userId)
          )
        )
        .leftJoin(
          USER_COURSE_PROGRESS,
          and(
            eq(USER_COURSE_PROGRESS.certification_id, CERTIFICATIONS.id),
            eq(USER_COURSE_PROGRESS.user_id, userId)
          )
        )
        .where(
          and(
            eq(MILESTONES.class_level, classLevel),
            scopeType === "sector"
              ? eq(MILESTONES.sector_id, scopeId)
              : eq(MILESTONES.cluster_id, scopeId),
            eq(MILESTONES.milestone_interval, currentMonth)
          )
        )
        .execute();

      // If no milestones exist, handle generation with duplicate prevention
      if (existingMilestones.length === 0) {
        console.log(
          `No existing milestones found for ${scopeType} ${scopeName}, checking generation status...`
        );

        // Check if generation is already in progress or completed
        const existingGenerationStatus = await db
          .select()
          .from(GENERATION_STATUS)
          .where(
            and(
              eq(GENERATION_STATUS.key_hash, milestoneKeyHash),
              eq(GENERATION_STATUS.generation_type, "milestone")
            )
          );

        if (existingGenerationStatus.length > 0) {
          const currentStatus = existingGenerationStatus[0].status;
          console.log(`Generation status: ${currentStatus}`);

          switch (currentStatus) {
            case "completed":
              // Generation already completed, fetch the milestones
              console.log(
                "Generation already completed, fetching milestones..."
              );
              const completedMilestones = await db
                .select({
                  milestoneId: MILESTONES.id,
                  milestoneDescription: MILESTONES.description,
                  milestoneCategoryName: MILESTONE_CATEGORIES.name,
                  milestoneSubcategoryName: MILESTONE_SUBCATEGORIES.name,
                  milestoneCompletionStatus: MILESTONES.completion_status,
                  milestoneDateAchieved: MILESTONES.date_achieved,
                  certificationId: CERTIFICATIONS.id,
                  certificationName: CERTIFICATIONS.certification_name,
                  certificationCompletedStatus:
                    USER_CERTIFICATION_COMPLETION.completed,
                  courseStatus: USER_COURSE_PROGRESS.status,
                })
                .from(MILESTONES)
                .innerJoin(
                  MILESTONE_CATEGORIES,
                  eq(MILESTONES.category_id, MILESTONE_CATEGORIES.id)
                )
                .leftJoin(
                  MILESTONE_SUBCATEGORIES,
                  eq(MILESTONES.subcategory_id, MILESTONE_SUBCATEGORIES.id)
                )
                .leftJoin(
                  CERTIFICATIONS,
                  and(
                    eq(CERTIFICATIONS.milestone_id, MILESTONES.id),
                    eq(CERTIFICATIONS.scope_id, scopeId),
                    eq(CERTIFICATIONS.scope_type, scopeType)
                  )
                )
                .leftJoin(
                  USER_CERTIFICATION_COMPLETION,
                  and(
                    eq(
                      USER_CERTIFICATION_COMPLETION.certification_id,
                      CERTIFICATIONS.id
                    ),
                    eq(USER_CERTIFICATION_COMPLETION.user_id, userId)
                  )
                )
                .leftJoin(
                  USER_COURSE_PROGRESS,
                  and(
                    eq(
                      USER_COURSE_PROGRESS.certification_id,
                      CERTIFICATIONS.id
                    ),
                    eq(USER_COURSE_PROGRESS.user_id, userId)
                  )
                )
                .where(
                  and(
                    eq(MILESTONES.class_level, classLevel),
                    scopeType === "sector"
                      ? eq(MILESTONES.sector_id, scopeId)
                      : eq(MILESTONES.cluster_id, scopeId),
                    eq(MILESTONES.milestone_interval, currentMonth)
                  )
                )
                .execute();

              userMilestones = completedMilestones;
              break;

            case "in_progress":
              // Another request is generating, wait for completion
              console.log(
                "Another request is generating milestones, waiting..."
              );
              await waitForMilestoneGenerationCompletion(milestoneKeyHash);

              // Fetch the generated milestones
              const generatedMilestones = await db
                .select({
                  milestoneId: MILESTONES.id,
                  milestoneDescription: MILESTONES.description,
                  milestoneCategoryName: MILESTONE_CATEGORIES.name,
                  milestoneSubcategoryName: MILESTONE_SUBCATEGORIES.name,
                  milestoneCompletionStatus: MILESTONES.completion_status,
                  milestoneDateAchieved: MILESTONES.date_achieved,
                  certificationId: CERTIFICATIONS.id,
                  certificationName: CERTIFICATIONS.certification_name,
                  certificationCompletedStatus:
                    USER_CERTIFICATION_COMPLETION.completed,
                  courseStatus: USER_COURSE_PROGRESS.status,
                })
                .from(MILESTONES)
                .innerJoin(
                  MILESTONE_CATEGORIES,
                  eq(MILESTONES.category_id, MILESTONE_CATEGORIES.id)
                )
                .leftJoin(
                  MILESTONE_SUBCATEGORIES,
                  eq(MILESTONES.subcategory_id, MILESTONE_SUBCATEGORIES.id)
                )
                .leftJoin(
                  CERTIFICATIONS,
                  and(
                    eq(CERTIFICATIONS.milestone_id, MILESTONES.id),
                    eq(CERTIFICATIONS.scope_id, scopeId),
                    eq(CERTIFICATIONS.scope_type, scopeType)
                  )
                )
                .leftJoin(
                  USER_CERTIFICATION_COMPLETION,
                  and(
                    eq(
                      USER_CERTIFICATION_COMPLETION.certification_id,
                      CERTIFICATIONS.id
                    ),
                    eq(USER_CERTIFICATION_COMPLETION.user_id, userId)
                  )
                )
                .leftJoin(
                  USER_COURSE_PROGRESS,
                  and(
                    eq(
                      USER_COURSE_PROGRESS.certification_id,
                      CERTIFICATIONS.id
                    ),
                    eq(USER_COURSE_PROGRESS.user_id, userId)
                  )
                )
                .where(
                  and(
                    eq(MILESTONES.class_level, classLevel),
                    scopeType === "sector"
                      ? eq(MILESTONES.sector_id, scopeId)
                      : eq(MILESTONES.cluster_id, scopeId),
                    eq(MILESTONES.milestone_interval, currentMonth)
                  )
                )
                .execute();

              userMilestones = generatedMilestones;
              break;

            case "failed":
              // Previous generation failed, attempt retry
              console.log("Previous generation failed, attempting retry...");
              const retriedMilestones = await handleFailedMilestoneGeneration(
                milestoneKeyHash,
                userId,
                scopeId,
                classLevel,
                currentMonth,
                userCareerID,
                scopeName,
                type1,
                type2,
                language,
                scopeType,
                sectorDescription,
                educationWorkDescription
              );
              return NextResponse.json(retriedMilestones, { status: 200 });

            default:
              // Should not reach here, but handle gracefully
              throw new Error(`Unknown generation status: ${currentStatus}`);
          }
        } else {
          // No existing generation status, start new generation
          console.log("Starting new milestone generation...");

          try {
            // Insert generation status record
            await db
              .insert(GENERATION_STATUS)
              .values({
                generation_type: "milestone",
                key_hash: milestoneKeyHash,
                status: "in_progress",
                generated_by: userId,
              })
              .execute();

            // Generate AI roadmap data
            const savedMilestones = await fetchAndSaveRoadmap(
              userId,
              scopeId,
              classLevel,
              currentMonth,
              userCareerID,
              scopeName,
              type1,
              type2,
              language,
              scopeType,
              sectorDescription,
              educationWorkDescription
            );

            // Update status to completed
            await db
              .update(GENERATION_STATUS)
              .set({ status: "completed" })
              .where(
                and(
                  eq(GENERATION_STATUS.key_hash, milestoneKeyHash),
                  eq(GENERATION_STATUS.generation_type, "milestone")
                )
              );

            return NextResponse.json(savedMilestones, { status: 200 });
          } catch (error) {
            // Update status to failed
            await db
              .update(GENERATION_STATUS)
              .set({ status: "failed" })
              .where(
                and(
                  eq(GENERATION_STATUS.key_hash, milestoneKeyHash),
                  eq(GENERATION_STATUS.generation_type, "milestone")
                )
              );
            throw error;
          }
        }
      } else {
        // Milestones exist, check if user milestones are linked
        const userMilestonesExist = await db
          .select()
          .from(USER_MILESTONES)
          .where(
            and(
              eq(USER_MILESTONES.scope_id, userCareerID),
              eq(USER_MILESTONES.scope_type, scopeType)
            )
          )
          .execute();

        if (userMilestonesExist.length === 0 && existingMilestones.length > 0) {
          // Link existing milestones to user
          for (const milestone of existingMilestones) {
            await db
              .insert(USER_MILESTONES)
              .values({
                scope_id: userCareerID,
                scope_type: scopeType,
                milestone_id: milestone.milestoneId,
              })
              .execute();
          }
        }

        userMilestones = existingMilestones;
      }
    } else {
      // For careers, fetch user milestones as before (no duplicate prevention needed)
      userMilestones = await db
        .select({
          milestoneId: USER_MILESTONES.milestone_id,
          milestoneDescription: MILESTONES.description,
          milestoneCategoryName: MILESTONE_CATEGORIES.name,
          milestoneSubcategoryName: MILESTONE_SUBCATEGORIES.name,
          milestoneCompletionStatus: MILESTONES.completion_status,
          milestoneDateAchieved: MILESTONES.date_achieved,
          certificationId: CERTIFICATIONS.id,
          certificationName: CERTIFICATIONS.certification_name,
          certificationCompletedStatus: USER_CERTIFICATION_COMPLETION.completed,
          courseStatus: USER_COURSE_PROGRESS.status,
        })
        .from(USER_MILESTONES)
        .innerJoin(MILESTONES, eq(USER_MILESTONES.milestone_id, MILESTONES.id))
        .innerJoin(
          MILESTONE_CATEGORIES,
          eq(MILESTONES.category_id, MILESTONE_CATEGORIES.id)
        )
        .leftJoin(
          MILESTONE_SUBCATEGORIES,
          eq(MILESTONES.subcategory_id, MILESTONE_SUBCATEGORIES.id)
        )
        .leftJoin(
          CERTIFICATIONS,
          and(
            eq(CERTIFICATIONS.milestone_id, MILESTONES.id),
            eq(CERTIFICATIONS.scope_id, scopeId),
            eq(CERTIFICATIONS.scope_type, scopeType),
            eq(CERTIFICATIONS.class_level, classLevel),
            eq(CERTIFICATIONS.milestone_interval, currentMonth)
          )
        )
        .leftJoin(
          USER_CERTIFICATION_COMPLETION,
          and(
            eq(
              USER_CERTIFICATION_COMPLETION.certification_id,
              CERTIFICATIONS.id
            ),
            eq(USER_CERTIFICATION_COMPLETION.user_id, userId)
          )
        )
        .leftJoin(
          USER_COURSE_PROGRESS,
          and(
            eq(USER_COURSE_PROGRESS.certification_id, CERTIFICATIONS.id),
            eq(USER_COURSE_PROGRESS.user_id, userId)
          )
        )
        .where(
          and(
            eq(USER_MILESTONES.scope_id, scopeId),
            eq(USER_MILESTONES.scope_type, scopeType),
            eq(MILESTONES.class_level, classLevel),
            eq(MILESTONES.milestone_interval, currentMonth)
          )
        )
        .execute();

      console.log(
        "currentMonth",
        currentMonth,
        "classLevel",
        classLevel,
        "scopeType",
        scopeType,
        "userCareerID",
        userCareerID
      );

      // If no milestones are found for careers, generate them (no duplicate prevention)
      if (userMilestones.length === 0) {
        const savedMilestones = await fetchAndSaveRoadmap(
          userId,
          userCareerID,
          classLevel,
          currentMonth,
          scopeId,
          scopeName,
          type1,
          type2,
          language,
          scopeType,
          sectorDescription,
          educationWorkDescription
        );
        return NextResponse.json(savedMilestones, { status: 200 });
      }
    }

    // Respond with fetched milestones data
    return NextResponse.json(userMilestones, { status: 200 });
  } catch (error) {
    console.error("Error fetching milestones data:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
