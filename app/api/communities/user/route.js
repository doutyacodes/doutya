import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMMUNITY_MEMBERS, COMMUNITIES } from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    
    // Get communities where user is a member
    const userCommunities = await db
      .select({
        id: COMMUNITIES.id,
        name: COMMUNITIES.name,
        description: COMMUNITIES.description,
        type: COMMUNITIES.type,
        role: COMMUNITY_MEMBERS.role,
      })
      .from(COMMUNITY_MEMBERS)
      .innerJoin(COMMUNITIES, eq(COMMUNITY_MEMBERS.community_id, COMMUNITIES.id))
      .where(
        and(
          eq(COMMUNITY_MEMBERS.user_id, parseInt(userId)),
          eq(COMMUNITY_MEMBERS.is_active, true)
        )
      )
      .execute();

    return NextResponse.json(
      { success: true, communities: userCommunities },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user communities:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}