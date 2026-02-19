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
  locationData = {}
) {
  try {
    const {
      schoolingLocation = null,
      graduationLocation = null,
      postGraduationLocation = null,
    } = locationData;

    // Fetch user details — we need class_id and user_role
    const [userDetails] = await db
      .select({
        class_id: USER_DETAILS.class_id,
        user_role: USER_DETAILS.user_role,
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId))
      .execute();

    if (!userDetails) {
      throw new Error("User not found");
    }

    // Individual users (mall kiosk / no institution) have no class_id.
    // They can still save careers, communities, etc. — but skip anything
    // that requires a class_id (COMMUNITIES table, CLASS_MODERATOR, etc.)
    const isIndividualUser =
      userDetails.user_role === "Individual" || !userDetails.class_id;

    const classId = isIndividualUser ? null : userDetails.class_id;

    // Only fetch moderators for institutional users who have a class
    let classModerators = [];
    if (!isIndividualUser && classId) {
      classModerators = await db
        .select({ moderator_id: CLASS_MODERATOR.moderator_id })
        .from(CLASS_MODERATOR)
        .where(eq(CLASS_MODERATOR.class_id, classId))
        .execute();
    }

    for (const career of careersArray) {
      // ── Helper: find or create a community (global or country-specific) ──
      const findOrCreateCommunity = async (isGlobal) => {
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
            scope_id: careerGroup.id,
            scope_type: "career",
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

      // ── Find or create career group ───────────────────────────────────────
      const [existingCareerGroup] = await db
        .select({ id: CAREER_GROUP.id })
        .from(CAREER_GROUP)
        .where(eq(CAREER_GROUP.career_name, career))
        .execute();

      const careerGroupId = existingCareerGroup
        ? existingCareerGroup.id
        : (
            await db
              .insert(CAREER_GROUP)
              .values({ career_name: career })
              .execute()
          )[0].insertId;

      // ── Guard against duplicate user career ───────────────────────────────
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

      // ── Insert user career (same for all user types) ──────────────────────
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

      // ── Insert user career status (same for all user types) ───────────────
      await db
        .insert(USER_CAREER_STATUS)
        .values({
          user_career_id: userCareerId,
          roadmap_status: "not_started",
        })
        .execute();

      // ── Global + country-specific communities (same for all user types) ───
      const globalCommunity = await findOrCreateCommunity(true);
      const countryCommunity = await findOrCreateCommunity(false);

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

      await addUserToCommunity(globalCommunity.id, null);
      await addUserToCommunity(countryCommunity.id, country);

      // ── Class-based communities — INSTITUTIONAL USERS ONLY ────────────────
      // Individual users (user_role = "Individual" or no class_id) are not
      // linked to any institution, so we skip the COMMUNITIES / COMMUNITY_MEMBERS
      // logic entirely. Everything above still runs for them normally.
      if (isIndividualUser) {
        continue; // move to next career in the loop
      }

      // ── COMMUNITIES table (institutional users only) ───────────────────────
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
        newCommunityId = existingNewCommunity[0].id;
      } else {
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

      // Add current user as member
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

      // Add class moderators as admins
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