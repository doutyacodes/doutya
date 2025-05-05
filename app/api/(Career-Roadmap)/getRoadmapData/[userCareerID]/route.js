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
//         education: USER_DETAILS.education, // Fetch education along with birth_date
//         educationLevel: USER_DETAILS.education_level,
//         academicYearStart : USER_DETAILS.academicYearStart,
//         academicYearEnd : USER_DETAILS.academicYearEnd,
//         className: USER_DETAILS.class_name
//       })
//       .from(USER_DETAILS)
//       .where(eq(USER_DETAILS.id, userId));
      
//     const birth_date = user_data[0].birth_date;
//     console.log("birth_date", birth_date)
//     const age = formattedAge(birth_date);

//     console.log("formattedAge", age)
//     // Fetch career name, type1, and type2 from USER_CAREER
//     const userCareerData = await db
//       .select({
//         careerGroupID: CAREER_GROUP.id,
//         career_name: CAREER_GROUP.career_name,
//         type1: USER_CAREER.type1,
//         type2: USER_CAREER.type2,
//       })
//       .from(USER_CAREER)
//       .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
//       .where(eq(USER_CAREER.id, userCareerID))
//       .execute();

//     // Check if career data was found
//     if (!userCareerData.length) {
//       return NextResponse.json({ message: "Career not found." }, { status: 404 });
//     }

//     const { careerGroupID, career_name: career, type1, type2 } = userCareerData[0];
//     const userMilestones = await db
//     .select({
//       milestoneId: USER_MILESTONES.milestone_id,
//       milestoneDescription: MILESTONES.description,
//       milestoneCategoryName: MILESTONE_CATEGORIES.name,
//       milestoneSubcategoryName: MILESTONE_SUBCATEGORIES.name,
//       milestoneCompletionStatus: MILESTONES.completion_status,
//       milestoneDateAchieved: MILESTONES.date_achieved,
//       certificationId: CERTIFICATIONS.id,  // Fetch certification ID
//       certificationName: CERTIFICATIONS.certification_name,  // Fetch certification name
//       certificationCompletedStatus: USER_CERTIFICATION_COMPLETION.completed, // Fetch certification completion status
//       courseStatus: USER_COURSE_PROGRESS.status // Fetch course status
//     })
//     .from(USER_MILESTONES)
//     .innerJoin(MILESTONES, eq(USER_MILESTONES.milestone_id, MILESTONES.id))
//     .innerJoin(MILESTONE_CATEGORIES, eq(MILESTONES.category_id, MILESTONE_CATEGORIES.id))
//     .leftJoin(MILESTONE_SUBCATEGORIES, eq(MILESTONES.subcategory_id, MILESTONE_SUBCATEGORIES.id))
//     .leftJoin(CERTIFICATIONS, eq(CERTIFICATIONS.milestone_id, MILESTONES.id))  // Join with CERTIFICATIONS
//     .leftJoin(
//       USER_CERTIFICATION_COMPLETION, 
//       and(
//         eq(USER_CERTIFICATION_COMPLETION.certification_id, CERTIFICATIONS.id),
//         eq(USER_CERTIFICATION_COMPLETION.user_id, userId) 
//       )
//     )
//     .leftJoin( // Left join with USER_COURSE_PROGRESS to fetch course status
//       USER_COURSE_PROGRESS,
//       and(
//         eq(USER_COURSE_PROGRESS.certification_id, CERTIFICATIONS.id),
//         eq(USER_COURSE_PROGRESS.user_id, userId)
//       )
//     )
//     .where(
//       and(
//         eq(USER_MILESTONES.user_career_id, userCareerID),
//         eq(MILESTONES.milestone_age, age)
//       )
//     )
//     .execute();
  
//     // If no milestones are found, start data generation
//     if (userMilestones.length === 0) {
//       // Respond with savedData
//       const savedMilestones = await fetchAndSaveRoadmap(userId, userCareerID, birth_date, age, careerGroupID, career, type1, type2,language);
//       return NextResponse.json(savedMilestones, { status: 200 });
//     }
  
//     // Respond with fetched milestones data
//     return NextResponse.json( userMilestones, { status: 200 });

//   } catch (error) {
//     console.error("Error fetching milestones data:", error);
//     return NextResponse.json(
//       { message: "Error processing request" },
//       { status: 500 }
//     );
//   }
// }


import { db } from "@/utils"; // Ensure this path is correct
import {
  CAREER_GROUP,
  USER_CAREER,
  MILESTONES,
  MILESTONE_CATEGORIES,
  USER_MILESTONES,
  USER_DETAILS,
  USER_CAREER_STATUS,
  CERTIFICATIONS,
  USER_CERTIFICATION_COMPLETION,
  MILESTONE_SUBCATEGORIES,
  USER_COURSE_PROGRESS,
  CLUSTER,
  USER_CLUSTER,
  SECTOR,
  USER_SECTOR
} from "@/utils/schema"; // Ensure this path is correct
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware"; // Ensure this path is correct
import { eq, and } from "drizzle-orm";
import { formattedAge } from "@/lib/formattedAge";
import { fetchAndSaveRoadmap } from "@/app/api/utils/fetchAndSaveRoadmap";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  // Authenticate the request
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  // Extract userId from decoded token
  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  const language = req.headers.get('accept-language') || 'en';

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
        className: USER_DETAILS.class_name,
        scopeType: USER_DETAILS.scope_type, // Get the user's scope_type
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));
      
    const birth_date = user_data[0].birth_date;
    console.log("birth_date", birth_date);
    const age = formattedAge(birth_date);
    console.log("formattedAge", age);
    
    // Get the scope type for this user
    const scopeType = user_data[0].scopeType || "career"; // Default to career if not specified
    console.log("scopeType", scopeType);
    
    let scopeId;
    let scopeName;
    let type1 = null;
    let type2 = null;
    
    // Determine which table to query based on scope_type
    switch(scopeType) {
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
          .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
          .where(eq(USER_CAREER.id, userCareerID))
          .execute();

        if (!userCareerData.length) {
          return NextResponse.json({ message: "Career not found." }, { status: 404 });
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
          return NextResponse.json({ message: "Cluster not found." }, { status: 404 });
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
            mbtiType: USER_SECTOR.mbti_type,
          })
          .from(USER_SECTOR)
          .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
          .where(eq(USER_SECTOR.id, userCareerID)) // Using userCareerID as userSectorID
          .execute();

        if (!userSectorData.length) {
          return NextResponse.json({ message: "Sector not found." }, { status: 404 });
        }

        scopeId = userSectorData[0].sectorId;
        scopeName = userSectorData[0].sectorName;
        type1 = userSectorData[0].mbtiType;
        type2 = null; // No type2 for sector
        break;
        
      default:
        return NextResponse.json({ message: "Invalid scope type." }, { status: 400 });
    }

    // Fetch milestones for the current scope
    const userMilestones = await db
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
        courseStatus: USER_COURSE_PROGRESS.status
      })
      .from(USER_MILESTONES)
      .innerJoin(MILESTONES, eq(USER_MILESTONES.milestone_id, MILESTONES.id))
      .innerJoin(MILESTONE_CATEGORIES, eq(MILESTONES.category_id, MILESTONE_CATEGORIES.id))
      .leftJoin(MILESTONE_SUBCATEGORIES, eq(MILESTONES.subcategory_id, MILESTONE_SUBCATEGORIES.id))
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
          eq(USER_CERTIFICATION_COMPLETION.certification_id, CERTIFICATIONS.id),
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
          eq(MILESTONES.milestone_age, age)
        )
      )
      .execute();
  
    // If no milestones are found, start data generation
    if (userMilestones.length === 0) {
      // Call fetchAndSaveRoadmap with the scope information
      const savedMilestones = await fetchAndSaveRoadmap(
        userId, 
        userCareerID, 
        birth_date, 
        age, 
        scopeId, 
        scopeName, 
        type1, 
        type2, 
        language,
        scopeType // Pass the scope type
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