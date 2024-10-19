import { NextResponse } from "next/server";
import { db } from "@/utils";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER_COMMUNITY, COMMUNITY, CAREER_GROUP } from "@/utils/schema";
import { eq } from "drizzle-orm/expressions";

export const dynamic = "force-dynamic";

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const { careerId } = await req.json(); // Parse careerId from request body

  // Convert careerId to number
  const careerIdNumber = Number(careerId);

  if (!careerIdNumber || isNaN(careerIdNumber)) {
    return NextResponse.json(
      { message: "Invalid Career ID" },
      { status: 400 } // Bad Request
    );
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Step 1: Fetch the career name from the CAREER_GROUP table using careerId
    const careerData = await db
      .select()
      .from(CAREER_GROUP)
      .where(eq(CAREER_GROUP.id, careerIdNumber))
      .execute();

    // Check if career data exists
    if (careerData.length === 0) {
      return NextResponse.json(
        { message: "Career not found" },
        { status: 404 } // Not Found
      );
    }

    const careerName = careerData[0].career_name; // Assuming 'career' is the column name in CAREER_GROUP

    // Step 2: Fetch all communities for the given career from COMMUNITY table
    const communities = await db
      .select()
      .from(COMMUNITY)
      .where(eq(COMMUNITY.career, careerName)) // Use career name to match
      .execute();

    // Step 3: Fetch user's communities from USER_COMMUNITY table
    const userCommunities = await db
      .select()
      .from(USER_COMMUNITY)
      .where(eq(USER_COMMUNITY.user_id, userId))
      .execute();

    const userCommunityIds = userCommunities.map((uc) => uc.community_id);

    // Step 4: Map through all communities and check if the user is already in
    const communityData = communities.map((community) => ({
      ...community,
      already_in: userCommunityIds.includes(community.id),
    }));

    return NextResponse.json({ communities: communityData });
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 } // Internal Server Error
    );
  }
}
