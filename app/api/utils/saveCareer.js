import { db } from "@/utils";
import {
  CAREER_GROUP,
  COMMUNITY,
  USER_CAREER,
  USER_CAREER_STATUS,
  USER_COMMUNITY,
} from "@/utils/schema";
import { and, eq } from "drizzle-orm";

export async function saveCareer(
  careersArray, 
  country, 
  userId, 
  type1, 
  type2
) {
  try {
    for (const career of careersArray) {
      // Helper function to reduce repeated code for community creation
      const findOrCreateCommunity = async (isGlobal) => {
        // First, ensure we have the career group ID
        const [careerGroup] = await db
          .select({ id: CAREER_GROUP.id })
          .from(CAREER_GROUP)
          .where(eq(CAREER_GROUP.career_name, career))
          .execute();

        if (!careerGroup) {
          throw new Error(`Career group for ${career} not found`);
        }

        const existingCommunity = await db
          .select()
          .from(COMMUNITY)
          .where(
            and(
              eq(COMMUNITY.career, career),
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
            career,
            global: isGlobal ? "yes" : "no",
            country: isGlobal ? null : country,
            scope_id: careerGroup.id, // Explicitly insert career_id
            scope_type: 'career'
          })
          .execute();

        return {
          id: newCommunity.insertId,
          career,
          global: isGlobal ? "yes" : "no",
          country: isGlobal ? null : country,
          career_id: careerGroup.id,
        };
      };

      // Find or create career group
      const [careerGroup] = await db
        .select({ id: CAREER_GROUP.id })
        .from(CAREER_GROUP)
        .where(eq(CAREER_GROUP.career_name, career))
        .execute() || [];

      const careerGroupId = careerGroup 
        ? careerGroup.id 
        : (await db
            .insert(CAREER_GROUP)
            .values({ career_name: career })
            .execute())[0].insertId;

      // Check if user career already exists
      const existingUserCareer = await db
        .select()
        .from(USER_CAREER)
        .where(
          and(
            eq(USER_CAREER.user_id, userId),
            eq(USER_CAREER.career_group_id, careerGroupId)
          )
        )
        .execute();

      if (existingUserCareer.length > 0) {
        return {
          message: `Career '${career}' is already saved for this user.`,
          status: 409,
        };
      }

      // Insert user career
      const [userCareerInsert] = await db
        .insert(USER_CAREER)
        .values({
          user_id: userId,
          career_group_id: careerGroupId,
          country,
          type1,
          type2,
        })
        .execute();

      const userCareerId = userCareerInsert.insertId;

      // Insert user career status
      await db
        .insert(USER_CAREER_STATUS)
        .values({
          user_career_id: userCareerId,
          roadmap_status: "not_started",
        })
        .execute();

      // Find or create global and country-specific communities
      const globalCommunity = await findOrCreateCommunity(true);
      const countryCommunity = await findOrCreateCommunity(false);

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
    }

    return { message: "Careers saved successfully", status: 200 };
  } catch (error) {
    console.error("Error saving career:", error);
    throw error;
  }
}