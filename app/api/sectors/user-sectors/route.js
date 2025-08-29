// app/api/sector/user-sectors/route.js
import { NextResponse } from "next/server";
import { db } from "@/utils";
import { eq, and } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER_SECTOR, USER_DETAILS, SECTOR, COMMUNITY, USER_COMMUNITY } from "@/utils/schema";

export const maxDuration = 40;
export const dynamic = "force-dynamic";

  // Helper function to reduce repeated code for community creation
  const findOrCreateCommunity = async (isGlobal, name, country) => {
    // First, ensure we have the career group ID
    const [sectorGroup] = await db
      .select({ id: SECTOR.id })
      .from(SECTOR)
      .where(eq(SECTOR.name, name))
      .execute();

    if (!sectorGroup) {
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
        scope_id: sectorGroup.id, 
        scope_type: 'sector'
      })
      .execute();

    return {
      id: newCommunity.insertId,
      name,
      global: isGlobal ? "yes" : "no",
      country: isGlobal ? null : country,
      career_id: sectorGroup.id,
    };
  };

// GET endpoint to retrieve user's selected sectors
export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Get user's sectors with sector names joined from SECTOR table
    const userSectors = await db
      .select({
        id: USER_SECTOR.id,
        user_id: USER_SECTOR.user_id,
        sector_id: USER_SECTOR.sector_id,
        mbti_type: USER_SECTOR.mbti_type,
        name: SECTOR.name,
        description: SECTOR.why_suitable,
        created_at: USER_SECTOR.created_at
      })
      .from(USER_SECTOR)
      .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
      .where(eq(USER_SECTOR.user_id, userId))
      .execute();

    return NextResponse.json(userSectors, { status: 200 });
  } catch (error) {
    console.error("Error fetching user sectors:", error);
    return NextResponse.json(
      { message: "Failed to fetch user sectors" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const data = await req.json();
  const { sectors } = data;

  if (!sectors || !Array.isArray(sectors) || sectors.length === 0) {
    return NextResponse.json(
      { message: "Invalid sectors data provided" },
      { status: 400 }
    );
  }

  try {
    // Check user's plan type from USER_DETAILS table
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

    const { plan_type, country } = userDetails[0];

    // Check existing user sectors
    const existingUserSectors = await db
      .select()
      .from(USER_SECTOR)
      .where(eq(USER_SECTOR.user_id, userId))
      .execute();

    console.log("Existing User Sectors:", existingUserSectors);

    // Check if the sector is already added
    const sectorToAdd = sectors[0]; // Since we're adding one at a time
    const isSectorAlreadyAdded = existingUserSectors.some(
      sector => sector.sector_id === sectorToAdd.sector_id
    );

    if (isSectorAlreadyAdded) {
      return NextResponse.json(
        { message: "This sector is already in your selected sectors" },
        { status: 409 } // Conflict status code
      );
    }

    // Enforce limit based on plan type
    const maxSectorsAllowed = plan_type === 'base' ? 2 : 5;
    
    if (existingUserSectors.length >= maxSectorsAllowed) {
      return NextResponse.json(
        { 
          message: plan_type === 'base' 
            ? "Base plan users can only add up to two sectors. Upgrade to Pro to add more." 
            : "You can only select up to 5 sectors."
        },
        { status: 403 }
      );
    }

    // Insert new sector
    const sectorRecord = {
      user_id: userId,
      sector_id: sectorToAdd.sector_id,
      mbti_type: sectorToAdd.mbti_type
    };

    await db.insert(USER_SECTOR).values(sectorRecord).execute();

    // Get details of the added sector for response
    const addedSector = await db
      .select({
        id: USER_SECTOR.id,
        user_id: USER_SECTOR.user_id,
        sector_id: USER_SECTOR.sector_id,
        mbti_type: USER_SECTOR.mbti_type,
        name: SECTOR.name,
        description: SECTOR.description,
        created_at: USER_SECTOR.created_at
      })
      .from(USER_SECTOR)
      .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
      .where(and(
        eq(USER_SECTOR.user_id, userId),
        eq(USER_SECTOR.sector_id, sectorToAdd.sector_id)
      ))
      .execute();


      // Find or create global and country-specific communities
      const globalCommunity = await findOrCreateCommunity(true, addedSector[0].name, country);
      const countryCommunity = await findOrCreateCommunity(false, addedSector[0].name, country);

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

    return NextResponse.json({
      message: "Sector added successfully",
      sector: addedSector[0],
      isFirstSector: existingUserSectors.length === 0
    }, { status: 200 });
  } catch (error) {
    console.error("Error saving user sector:", error);
    return NextResponse.json(
      { message: "Failed to save sector" },
      { status: 500 }
    );
  }
}