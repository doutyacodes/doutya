import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMMUNITY_POST, MILESTONES, COMMUNITY, USER_MILESTONES } from "@/utils/schema";  // Include COMMUNITY table
import { eq, and } from "drizzle-orm/expressions";  // Import expressions for conditions
import { authenticate } from "@/lib/jwtMiddleware";
import { sql } from "drizzle-orm";

export async function PUT(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    const data = await req.json();
    const { milestoneId, completed, milestoneText, careerName, selectedCommunities } = data;

    console.log("careerName", careerName)
 
    const { global, countrySpecific } = selectedCommunities;
      
    let communityIds = [];

    // Fetch global community if the flag is true
    if (global) {
      const globalCommunityResult = await db
        .select({ id: COMMUNITY.id })
        .from(COMMUNITY)
        .where(and(eq(COMMUNITY.career, careerName), eq(COMMUNITY.global, 'yes')))
        .execute();

      if (globalCommunityResult.length > 0) {
        communityIds.push(globalCommunityResult[0].id);
      }
    }

    // Fetch country-specific community if the flag is true
    if (countrySpecific) {
      const countrySpecificCommunityResult = await db
        .select({ id: COMMUNITY.id })
        .from(COMMUNITY)
        .where(and(eq(COMMUNITY.career, careerName), eq(COMMUNITY.global, 'no')))
        .execute();

      if (countrySpecificCommunityResult.length > 0) {
        communityIds.push(countrySpecificCommunityResult[0].id);
      }
    }

    if (communityIds.length === 0) {
      return NextResponse.json(
        { message: "No community found matching the criteria" },
        { status: 404 }
      );
    }

    if (completed) {
      const predefinedImageUrl = "/assets/images/milestone_achieved.png";
      const postCaption = `I have successfully completed the milestone: "${milestoneText}". Feeling great about this accomplishment!`;

      for (const communityId of communityIds) {
        await db.insert(COMMUNITY_POST).values({
          user_id: userId,
          community_id: communityId,
          type: 'image',
          post_category: 'milestone',
          caption: postCaption,
          created_at: new Date(),
          file_url: predefinedImageUrl,
        });
      }

    // Update the milestone completion status
    await db
      .update(USER_MILESTONES)
      .set({
        completion_status: completed,
        date_achieved: completed ? sql`NOW()` : null,
      })
      .where(
        and(
          eq(USER_MILESTONES.milestone_id, milestoneId),
          eq(USER_MILESTONES.user_id, userId)
        )
      )
      .execute();

      return NextResponse.json(
        { message: "Milestone status updated and posts created successfully" },
        { status: 201 }
      );
    }

    return NextResponse.json(
      { message: "Milestone status updated successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
