import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMMUNITY_POST, COMMUNITY, CERTIFICATIONS } from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  // Authenticate the request
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    const data = await req.json();
    const { 
      certificationId, 
      selectedCommunities, 
      fileUrl 
    } = data;

    const { global, countrySpecific } = selectedCommunities;

    // Fetch certification details to get career ID
    const certificationResult = await db
      .select({ career_id: CERTIFICATIONS.career_group_id })
      .from(CERTIFICATIONS)
      .where(eq(CERTIFICATIONS.id, certificationId))
      .execute();

    if (certificationResult.length === 0) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    const careerID = certificationResult[0].career_id;

    let communityIds = [];

    // Fetch global community if the flag is true
    if (global) {
      const globalCommunityResult = await db
        .select({ id: COMMUNITY.id })
        .from(COMMUNITY)
        .where(and(
          eq(COMMUNITY.career_id, careerID), 
          eq(COMMUNITY.global, 'yes')
        ))
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
        .where(and(
          eq(COMMUNITY.career_id, careerID), 
          eq(COMMUNITY.global, 'no')
        ))
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

    // Create posts for each selected community
    const postPromises = communityIds.map(communityId => 
      db.insert(COMMUNITY_POST).values({
        user_id: userId,
        community_id: communityId,
        type: 'image',
        post_category: 'certification',
        caption: `I just earned a certification!`,
        created_at: new Date(),
        file_url: fileUrl,
      })
    );

    await Promise.all(postPromises);

    return NextResponse.json(
      { message: "Certificate shared successfully" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error in sharing certificate:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}