import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMMUNITY_POST, COMMUNITY, CERTIFICATIONS, USER_CAREER, USER_CLUSTER, USER_SECTOR } from "@/utils/schema";
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

    // Fetch certification details to get scope ID and scope type
    const certificationResult = await db
      .select({ 
        scope_id: CERTIFICATIONS.scope_id,
        scope_type: CERTIFICATIONS.scope_type,
        certification_name: CERTIFICATIONS.certification_name
      })
      .from(CERTIFICATIONS)
      .where(eq(CERTIFICATIONS.id, certificationId))
      .execute();

    if (certificationResult.length === 0) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    const { scope_id, scope_type, certification_name } = certificationResult[0];

    // Find communities matching scope_id and scope_type, or parent mapping
    let matchedCommunityScopeId = scope_id;

    // Check if there are communities with scope_id directly
    let communities = await db
      .select({ id: COMMUNITY.id, global: COMMUNITY.global })
      .from(COMMUNITY)
      .where(and(
        eq(COMMUNITY.scope_id, scope_id),
        eq(COMMUNITY.scope_type, scope_type)
      ));

    // If not found directly and it might be a user mapping id, resolve master id
    if (communities.length === 0) {
      if (scope_type === 'career') {
        const uc = await db.select({ masterId: USER_CAREER.career_group_id }).from(USER_CAREER).where(eq(USER_CAREER.id, scope_id)).limit(1);
        if (uc.length) matchedCommunityScopeId = uc[0].masterId;
      } else if (scope_type === 'cluster') {
        const ucl = await db.select({ masterId: USER_CLUSTER.cluster_id }).from(USER_CLUSTER).where(eq(USER_CLUSTER.id, scope_id)).limit(1);
        if (ucl.length) matchedCommunityScopeId = ucl[0].masterId;
      } else if (scope_type === 'sector') {
        const usc = await db.select({ masterId: USER_SECTOR.sector_id }).from(USER_SECTOR).where(eq(USER_SECTOR.id, scope_id)).limit(1);
        if (usc.length) matchedCommunityScopeId = usc[0].masterId;
      }

      communities = await db
        .select({ id: COMMUNITY.id, global: COMMUNITY.global })
        .from(COMMUNITY)
        .where(and(
          eq(COMMUNITY.scope_id, matchedCommunityScopeId),
          eq(COMMUNITY.scope_type, scope_type)
        ));
    }

    let communityIds = [];
    if (global) {
      const g = communities.find(c => c.global === 'yes');
      if (g) communityIds.push(g.id);
    }
    if (countrySpecific) {
      const c = communities.find(c => c.global === 'no');
      if (c) communityIds.push(c.id);
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
        caption: `I just earned a certification in ${certification_name}!`,
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
