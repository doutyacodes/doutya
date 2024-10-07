import { db } from "@/utils"; // Ensure this path is correct
import {
  CAREER_GROUP,
  USER_CAREER,
  MILESTONES,
  MILESTONE_CATEGORIES,
  USER_MILESTONES,
  USER_DETAILS,
  USER_CAREER_STATUS,
} from "@/utils/schema"; // Ensure this path is correct
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware"; // Ensure this path is correct
import { eq, and } from "drizzle-orm";
import { formattedAge } from "@/lib/formattedAge";
import { fetchAndSaveRoadmap } from "@/app/api/utils/fetchAndSaveRoadmap";

export const maxDuration = 60;
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
    // Check the status of the career roadmap from the USER_CAREER_STATUS table
    const userCareerStatus = await db
      .select({ roadmap_status: USER_CAREER_STATUS.roadmap_status })
      .from(USER_CAREER_STATUS)
      .where(eq(USER_CAREER_STATUS.user_career_id, userCareerID)) // Check the correct user career status
      .execute();

    const roadmapStatus = userCareerStatus[0]?.roadmap_status;

    if (roadmapStatus === "in_progress") {
      // If the roadmap generation is in progress, return a message
      return NextResponse.json(
        { message: "Data is already being generated. Please wait." },
        { status: 202 }
      );
    }

    console.log("userCareerID", userCareerID);

    const user_data = await db
      .select({
        birth_date: USER_DETAILS.birth_date,
        education: USER_DETAILS.education, // Fetch education along with birth_date
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    const birth_date = user_data[0].birth_date;
    const education = user_data[0].education; // Use the fetched education
    const age = formattedAge(birth_date);

    // Fetch career name, type1, and type2 from USER_CAREER
    const userCareerData = await db
      .select({
        career_name: CAREER_GROUP.career_name,
        type1: USER_CAREER.type1,
        type2: USER_CAREER.type2,
      })
      .from(USER_CAREER)
      .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
      .where(eq(USER_CAREER.id, userCareerID))
      .execute();

    // Check if career data was found
    if (!userCareerData.length) {
      return NextResponse.json(
        { message: "Career not found." },
        { status: 404 }
      );
    }

    const { career_name: career, type1, type2 } = userCareerData[0];

    // Fetch milestones for the found user career ID
    const userMilestones = await db
      .select({
        milestoneId: USER_MILESTONES.milestone_id,
        milestoneDescription: MILESTONES.description,
        milestoneCategoryName: MILESTONE_CATEGORIES.name,
        milestoneCompletionStatus: MILESTONES.completion_status,
        milestoneDateAchieved: MILESTONES.date_achieved,
      })
      .from(USER_MILESTONES)
      .innerJoin(MILESTONES, eq(USER_MILESTONES.milestone_id, MILESTONES.id))
      .innerJoin(
        MILESTONE_CATEGORIES,
        eq(MILESTONES.category_id, MILESTONE_CATEGORIES.id)
      )
      .where(
        and(
          eq(USER_MILESTONES.user_career_id, userCareerID),
          eq(MILESTONES.milestone_age, age)
        )
      )
      .execute();

    console.log("userMilestones", userMilestones);

    // If no milestones are found, start data generation
    if (userMilestones.length === 0) {
      // Mark the roadmap status as "in_progress" before starting generation
      await db
        .update(USER_CAREER_STATUS)
        .set({ roadmap_status: "in_progress" }) // Update the roadmap status
        .where(eq(USER_CAREER_STATUS.user_career_id, userCareerID))
        .execute();

      // Send immediate response
      const loadingResponse = { message: "Generating data, please wait..." };

      // Trigger the data generation asynchronously
      // Start the background roadmap generation process
      fetchAndSaveRoadmap(
        userCareerID,
        age,
        education,
        career,
        type1,
        type2,
        language
      );
      // fetchAndSaveRoadmap(userCareerID, age, education, career, type1, type2)
      // .then(async () => {
      //     // After data is generated, update the status to "completed"
      //     await db
      //         .update(USER_CAREER_STATUS)
      //         .set({ roadmap_status: 'completed' })
      //         .where(eq(USER_CAREER_STATUS.user_career_id, userCareerID))
      //         .execute();
      // })
      // .catch(async (err) => {
      //     console.error("Error during roadmap generation:", err);
      //     // In case of an error, reset the status to "not_started"
      //     await db
      //         .update(USER_CAREER_STATUS)
      //         .set({ roadmap_status: 'not_started' })
      //         .where(eq(USER_CAREER_STATUS.user_career_id, userCareerID))
      //         .execute();
      // });

      // Respond with a 202 Accepted status if you want to signify processing
      return NextResponse.json(loadingResponse, { status: 202 });
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
