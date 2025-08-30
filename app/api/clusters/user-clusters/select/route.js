import { NextResponse } from "next/server";
import { db } from "@/utils";
import { CLUSTER, COMMUNITY, USER_CLUSTER, USER_COMMUNITY, USER_DETAILS } from "@/utils/schema";
import { eq, and } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Helper function to reduce repeated code for community creation
const findOrCreateCommunity = async (isGlobal, name, country) => {
  // First, ensure we have the career group ID
  const [cluserGroup] = await db
    .select({ id: CLUSTER.id })
    .from(CLUSTER)
    .where(eq(CLUSTER.name, name))
    .execute();

  if (!cluserGroup) {
    throw new Error(`Career group for ${name} not found`);
  }

  const existingCommunity = await db
    .select()
    .from(COMMUNITY)
    .where(
      and(
        eq(COMMUNITY.career, name),
        eq(COMMUNITY.global, isGlobal ? "yes" : "no"),
        isGlobal ? true : eq(COMMUNITY.country, country)
      )
    )
    .execute();

  if (existingCommunity.length > 0) {
    return existingCommunity[0];
  }

  const [newCommunity] = await db
    .insert(COMMUNITY)
    .values({
      career: name,
      global: isGlobal ? "yes" : "no",
      country: isGlobal ? null : country,
      scope_id: cluserGroup.id, 
      scope_type: 'cluster'
    })
    .execute();

  return {
    id: newCommunity.insertId,
    name,
    global: isGlobal ? "yes" : "no",
    country: isGlobal ? null : country,
    career_id: cluserGroup.id,
  };
};

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  if (!userId) {
    return NextResponse.json({ message: "User ID missing" }, { status: 400 });
  }

  const body = await req.json();
  const { cluster_id } = body;

  if (!cluster_id) {
    return NextResponse.json({ message: "Cluster ID is required" }, { status: 400 });
  }

  try {
    // Set selected = true for the specific cluster for the user
    const updateResult = await db
      .update(USER_CLUSTER)
      .set({ selected: true })
      .where(and(
        eq(USER_CLUSTER.user_id, userId),
        eq(USER_CLUSTER.cluster_id, cluster_id)
      ))
      .execute();


      // Get details of the added sector for response
      const addedCluster = await db
        .select({
          name: CLUSTER.name,
        })
        .from(USER_CLUSTER)
        .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
        .where(and(
          eq(USER_CLUSTER.user_id, userId),
          eq(USER_CLUSTER.cluster_id, cluster_id)
        ))
        .execute();


      /* Community */
        const userDetails = await db
          .select()
          .from(USER_DETAILS)
          .where(eq(USER_DETAILS.id, userId))
          .execute();
    
        if (userDetails.length === 0) {
          return NextResponse.json(
            { message: "User not found" },
            { status: 404 }
          );
        }

        const { country } = userDetails[0];

        console.log("addedCluster", addedCluster, addedCluster[0].name)

        // Find or create global and country-specific communities
        const globalCommunity = await findOrCreateCommunity(true, addedCluster[0].name, country);
        const countryCommunity = await findOrCreateCommunity(false, addedCluster[0].name, country);
  
        // Helper function to add user to community
        const addUserToCommunity = async (communityId, communityCountry) => {
          const existingUserCommunity = await db
            .select()
            .from(USER_COMMUNITY)
            .where(
              and(
                eq(USER_COMMUNITY.user_id, userId),
                eq(USER_COMMUNITY.community_id, communityId)
              )
            )
            .execute();
  
          if (existingUserCommunity.length === 0) {
            await db
              .insert(USER_COMMUNITY)
              .values({
                user_id: userId,
                community_id: communityId,
                country: communityCountry,
              })
              .execute();
          }
        };
  
        // Add user to global and country-specific communities
        await addUserToCommunity(globalCommunity.id, null);
        await addUserToCommunity(countryCommunity.id, country);

    return NextResponse.json({ message: "Cluster marked as selected", updateResult }, { status: 200 });
  } catch (error) {
    console.error("Error updating user cluster selection:", error);
    return NextResponse.json(
      { message: "Failed to update cluster selection" },
      { status: 500 }
    );
  }
}
