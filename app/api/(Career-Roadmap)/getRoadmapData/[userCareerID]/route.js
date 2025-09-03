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
import { authenticate } from "@/lib/jwtMiddleware"; // Ensure this path is correct
import { db } from "@/utils"; // Ensure this path is correct
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
} from "@/utils/schema"; // Ensure this path is correct
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

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
        joinedDate: USER_DETAILS.joined_date, // Get joined date
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    const birth_date = user_data[0].birth_date;
    const joinedDate = user_data[0].joinedDate;
    const classLevel = parseInt(user_data[0].className); // Get class level

    // Calculate current month from joined date
    const timeData = calculateWeekFromTimestamp(joinedDate);
    const currentMonth = timeData.monthsSinceJoined;

    console.log("classLevel", classLevel);
    console.log("currentMonth", currentMonth);

    // Get the scope type for this user
    const scopeType = user_data[0].scopeType || "career"; // Default to career if not specified
    console.log("scopeType", scopeType);

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
          .where(eq(USER_CLUSTER.id, userCareerID)) // Using userCareerID as userClusterID
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
          .where(eq(USER_SECTOR.id, userCareerID)) // Using userCareerID as userSectorID
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
        type2 = null; // No type2 for sector
        break;

      default:
        return NextResponse.json(
          { message: "Invalid scope type." },
          { status: 400 }
        );
    }

    // Fetch milestones based on scope type
    let userMilestones;

    if (scopeType === "sector") {
      const query = db
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
            eq(MILESTONES.sector_id, scopeId),
            // eq(MILESTONES.mbti_type, type1),
            eq(MILESTONES.milestone_interval, currentMonth)
          )
        );

      // Log the SQL and parameters
      const { sql, params } = query.toSQL();
      console.log("SQL Query:", sql);
      console.log("Parameters:", params);
      // For sectors, first check if milestones exist for this class level, MBTI type, and month
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
            eq(MILESTONES.sector_id, scopeId),
            // eq(MILESTONES.mbti_type, type1),
            eq(MILESTONES.milestone_interval, currentMonth)
          )
        )
        .execute();

      // If no milestones exist for this specific combination, generate them using AI
      if (existingMilestones.length === 0) {
        console.log(
          `No existing milestones found for sector ${scopeName}, generating new ones with AI...`
        );

        // Generate AI roadmap data for sector with description
        const savedMilestones = await fetchAndSaveRoadmap(
          userId,
          scopeId,
          classLevel, // Pass class level instead of birth_date
          currentMonth, // Pass current month instead of age
          userCareerID,
          scopeName,
          type1,
          type2,
          language,
          scopeType,
          sectorDescription // Pass sector description
        );
        return NextResponse.json(savedMilestones, { status: 200 });
      }

      // Check if user milestones exist for this sector
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
    } else {
      // For clusters and careers, fetch user milestones as before
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
            eq(USER_MILESTONES.scope_id, userCareerID),
            eq(USER_MILESTONES.scope_type, scopeType),
            eq(MILESTONES.class_level, classLevel),
            eq(MILESTONES.milestone_interval, currentMonth)
          )
        )
        .execute();
    }

    // If no milestones are found for clusters/careers, generate them
    if (userMilestones.length === 0 && scopeType !== "sector") {
      // Call fetchAndSaveRoadmap with updated parameters
      const savedMilestones = await fetchAndSaveRoadmap(
        userId,
        userCareerID,
        classLevel, // Pass class level instead of birth_date
        currentMonth, // Pass current month instead of age
        scopeId,
        scopeName,
        type1,
        type2,
        language,
        scopeType
      );
      return NextResponse.json(savedMilestones, { status: 200 });
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
