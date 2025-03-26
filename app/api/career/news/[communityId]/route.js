import { NextResponse } from "next/server";
import { db } from "@/utils";
import { CAREER_NEWS, COMMUNITY } from "@/utils/schema";
import { eq, desc } from "drizzle-orm";  // ✅ Import desc for ordering
import { authenticate } from "@/lib/jwtMiddleware";

export async function GET(req, { params }) {
  try {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const communityId = parseInt(params.communityId);

    if (isNaN(communityId)) {
      return NextResponse.json(
        { message: "Invalid community ID" },
        { status: 400 }
      );
    }

    console.log('communityId:', communityId);

    // Fetch career_id from COMMUNITY table
    const communityDetails = await db
      .select({ careerId: COMMUNITY.career_id })
      .from(COMMUNITY)
      .where(eq(COMMUNITY.id, communityId))
      .limit(1);   // ✅ Proper limit usage

    if (!communityDetails.length) {
      return NextResponse.json(
        { message: "Community not found" },
        { status: 404 }
      );
    }

    const careerId = communityDetails[0].careerId;

    // Fetch news for the specific career, ordered by most recent
    const news = await db
      .select()
      .from(CAREER_NEWS)
      .where(eq(CAREER_NEWS.career_id, careerId))
      .orderBy(desc(CAREER_NEWS.created_at))  // ✅ Use desc() for ordering
      .limit(9);   // ✅ Proper limit usage

    return NextResponse.json(
      { 
        message: "Career news fetched successfully", 
        news 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in GET career news:", error);
    return NextResponse.json(
      { 
        message: error.message || "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}
