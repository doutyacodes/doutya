import { db } from "@/utils";
import { CAREER_GROUP, USER_CAREER, USER_CAREER_STATUS } from "@/utils/schema";
import { and, eq } from "drizzle-orm";

export async function saveCareer(careersArray, country, userId, type1, type2) {
    try {
        for (const career of careersArray) {
            let careerGroupId;

            const existingCareerGroup = await db
                .select({ id: CAREER_GROUP.id })
                .from(CAREER_GROUP)
                .where(eq(CAREER_GROUP.career_name, career))
                .execute();

            if (existingCareerGroup.length > 0) {
                console.log("Exixsting Career")
                careerGroupId = existingCareerGroup[0].id;
            } else {
                console.log("INserting Career")
                const insertResult = await db
                    .insert(CAREER_GROUP)
                    .values({ career_name: career })
                    .execute();

                careerGroupId = insertResult[0].insertId;
                console.log("INserting Career ID", careerGroupId)
            }

            const existingUserCareer = await db
                .select()
                .from(USER_CAREER)
                .where(
                    and(
                        eq(USER_CAREER.user_id, userId),
                        eq(USER_CAREER.career_group_id, careerGroupId)
                    )
                );

            if (existingUserCareer.length > 0) {
                console.log("Exixsting UISER Career")
                throw new Error(`Career '${career}' is already saved for this user.`);
            }
            console.log("Inserting User Career");
            const insertUserCareerResult = await db
                .insert(USER_CAREER)
                .values({
                    user_id: userId,
                    career_group_id: careerGroupId,
                    country: country,
                    type1: type1,
                    type2: type2,
                })
                .execute();

            const userCareerId = insertUserCareerResult[0].insertId; // Get the newly created user career ID
                console.log("userCarerId", userCareerId);
                
            // Insert into USER_CAREER_STATUS table
            await db
                .insert(USER_CAREER_STATUS)
                .values({
                    user_career_id: userCareerId, // Use the ID of the newly created user career
                    roadmap_status: 'not_started' // Initialize roadmap status
                })
                .execute();
        }
    } catch (error) {
        console.error('Error saving career:', error);
        throw error;
    }
}
