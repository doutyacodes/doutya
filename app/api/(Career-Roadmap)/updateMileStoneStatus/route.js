import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMMUNITY_POST, MILESTONES, COMMUNITY } from "@/utils/schema";  // Include COMMUNITY table
import { eq, and } from "drizzle-orm/expressions";  // Import expressions for conditions
import { authenticate } from "@/lib/jwtMiddleware";

export async function PUT(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    const data = await req.json();
    const { milestoneId, completed, milestoneText, careerName } = data;
 
    // Ensure the input data is valid
    if (typeof milestoneId === 'number' && typeof completed === 'boolean' && typeof careerName === 'string') {

      // Fetch the communityId where the career name matches and global is 'yes'
      const communityResult = await db
        .select({ id: COMMUNITY.id })
        .from(COMMUNITY)
        .where(and(eq(COMMUNITY.career, careerName), eq(COMMUNITY.global, 'yes')))
        .execute();

      if (!communityResult || communityResult.length === 0) {
        return NextResponse.json(
          { message: "No global community found for the specified career" },
          { status: 404 }
        );
      }

      const communityId = communityResult[0].id;  // Get the community ID
      
      // If completed, add a post for the completed milestone
      if (completed) {
        // Predefined image URL for the post (can be stored locally or on a cloud storage)
        const predefinedImageUrl = "/assets/images/milestone_achieved.png"; // Update with your actual image path
        const postCaption = `I have successfully completed the milestone: "${milestoneText}". Feeling great about this accomplishment!`;

        // Insert a post with the image, caption, and communityId
        await db.insert(COMMUNITY_POST).values({
          user_id: userId,
          community_id: communityId,  // Set the community ID based on the career name
          type: 'image',
          caption: postCaption,
          created_at: new Date(),
          file_url: predefinedImageUrl,
        });

        // After successfully adding the post, update the milestone completion status
        const result = await db
          .update(MILESTONES)
          .set({ completion_status: completed })  // Using correct field name
          .where(eq(MILESTONES.id, milestoneId))
          .execute();

        if (!result) {
          return NextResponse.json(
            { message: "Failed to update milestone status" },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { message: "Milestone status updated and post created successfully" },
          { status: 201 }
        );
      }

      return NextResponse.json(
        { message: "Milestone status updated successfully" },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid data provided" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
