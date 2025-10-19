import { db } from "@/utils";
import {
  CAREER_GROUP,
  COMMUNITY,
  USER_CAREER,
  USER_CAREER_STATUS,
  USER_COMMUNITY,
  COMMUNITIES,
  COMMUNITY_MEMBERS,
  USER_DETAILS,
  CLASS_MODERATOR,
} from "@/utils/schema";
import { and, eq } from "drizzle-orm";

export async function saveCareer(
  careersArray, 
  country, 
  userId, 
  type1, 
  type2,
  locationData = {} // New parameter for location data
) {
  try {
    // Extract location data
    const {
      schoolingLocation = null,
      graduationLocation = null,
      postGraduationLocation = null
    } = locationData;

    // Get user's class_id
    const [userDetails] = await db
      .select({ class_id: USER_DETAILS.class_id })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId))
      .execute();

    if (!userDetails || !userDetails.class_id) {
      throw new Error("User class_id not found");
    }

    const classId = userDetails.class_id;

    // Get all moderators for this class
    const classModerators = await db
      .select({ moderator_id: CLASS_MODERATOR.moderator_id })
      .from(CLASS_MODERATOR)
      .where(eq(CLASS_MODERATOR.class_id, classId))
      .execute();

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

      // Insert user career with location data
      const [userCareerInsert] = await db
        .insert(USER_CAREER)
        .values({
          user_id: userId,
          career_group_id: careerGroupId,
          country,
          type1,
          type2,
          schooling_location: schoolingLocation,
          graduation_location: graduationLocation,
          post_graduation_location: postGraduationLocation,
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

      // ===== NEW COMMUNITIES TABLE LOGIC =====
      
      // Check if community already exists in COMMUNITIES table
      const existingNewCommunity = await db
        .select()
        .from(COMMUNITIES)
        .where(
          and(
            eq(COMMUNITIES.class_id, classId),
            eq(COMMUNITIES.type, "career"),
            eq(COMMUNITIES.ref_id, careerGroupId)
          )
        )
        .execute();

      let newCommunityId;

      if (existingNewCommunity.length > 0) {
        // Community already exists
        newCommunityId = existingNewCommunity[0].id;
      } else {
        // Create new community in COMMUNITIES table
        const [newCommunityInsert] = await db
          .insert(COMMUNITIES)
          .values({
            class_id: classId,
            type: "career",
            ref_id: careerGroupId,
            name: career,
            description: `Community for ${career} career`,
          })
          .execute();

        newCommunityId = newCommunityInsert.insertId;
      }

      // Add current user as member in COMMUNITY_MEMBERS
      const existingUserMember = await db
        .select()
        .from(COMMUNITY_MEMBERS)
        .where(
          and(
            eq(COMMUNITY_MEMBERS.community_id, newCommunityId),
            eq(COMMUNITY_MEMBERS.user_id, userId)
          )
        )
        .execute();

      if (existingUserMember.length === 0) {
        await db
          .insert(COMMUNITY_MEMBERS)
          .values({
            community_id: newCommunityId,
            user_id: userId,
            moderator_id: null,
            role: "member",
            is_active: true,
          })
          .execute();
      }

      // Add all class moderators as admins in COMMUNITY_MEMBERS
      for (const moderator of classModerators) {
        const existingModeratorMember = await db
          .select()
          .from(COMMUNITY_MEMBERS)
          .where(
            and(
              eq(COMMUNITY_MEMBERS.community_id, newCommunityId),
              eq(COMMUNITY_MEMBERS.moderator_id, moderator.moderator_id)
            )
          )
          .execute();

        if (existingModeratorMember.length === 0) {
          await db
            .insert(COMMUNITY_MEMBERS)
            .values({
              community_id: newCommunityId,
              user_id: null,
              moderator_id: moderator.moderator_id,
              role: "admin",
              is_active: true,
            })
            .execute();
        }
      }
    }

    return { message: "Careers saved successfully", status: 200 };
  } catch (error) {
    console.error("Error saving career:", error);
    throw error;
  }
}