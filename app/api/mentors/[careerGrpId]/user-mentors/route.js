import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_MENTOR_RELATIONSHIPS, MENTOR_PROFILES } from "@/utils/schema";
import { and, eq, inArray } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const careerGroupId = parseInt(params.careerGrpId);

  try {
    // Find mentors linked to the user's selected career group
    const mentorRelationships = await db
      .select({
        mentorId: USER_MENTOR_RELATIONSHIPS.mentor_id,
        relationshipType: USER_MENTOR_RELATIONSHIPS.relationship_type
      })
      .from(USER_MENTOR_RELATIONSHIPS)
      .where(
        and(
          eq(USER_MENTOR_RELATIONSHIPS.user_id, userId),
          eq(USER_MENTOR_RELATIONSHIPS.career_group_id, careerGroupId)
        )
      );

    // If no mentor relationships found, return empty array
    if (mentorRelationships.length === 0) {
      return NextResponse.json({ mentors: [] }, { status: 200 });
    }

    // Extract mentor IDs
    const mentorIds = mentorRelationships.map(rel => rel.mentorId);

    // Fetch full mentor details
    const mentors = await db
      .select({
        mentor_id: MENTOR_PROFILES.mentor_id,
        full_name: MENTOR_PROFILES.full_name,
        profession: MENTOR_PROFILES.profession,
        experience_years: MENTOR_PROFILES.experience_years,
        profile_picture_url: MENTOR_PROFILES.profile_picture_url,
        bio: MENTOR_PROFILES.bio
      })
      .from(MENTOR_PROFILES)
      .where(
        and(
          eq(MENTOR_PROFILES.is_active, true),
          inArray(MENTOR_PROFILES.mentor_id, mentorIds)
        )
      );

    return NextResponse.json({ mentors }, { status: 200 });

  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json(
      { message: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}