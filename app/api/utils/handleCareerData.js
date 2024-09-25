import { db } from "@/utils";
import { USER_CAREER, CAREER_GROUP, MILESTONE_CATEGORIES, MILESTONES, USER_MILESTONES } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { processCareerSubjects } from "./fetchAndSaveSubjects";

export async function handleCareerData(userId, country, results) {
    console.log("inside handleCareerData");
    
    try {
        for (const career of results) {

            let careerGroupId;

            // Check if the career name exists in the CAREER_GROUP table
            const existingCareerGroup = await db
                .select({ id: CAREER_GROUP.id })
                .from(CAREER_GROUP)
                .where(eq(CAREER_GROUP.career_name, career.career_name))
                .execute();

            if (existingCareerGroup.length > 0) {
                careerGroupId = existingCareerGroup[0].id;
            } else {
                console.log("Career group not found. Inserting new record.");
                
                // Insert the new career group
                const insertedCareerGroup = await db
                            .insert(CAREER_GROUP)
                            .values({ career_name: career.career_name })
                            .execute();

                careerGroupId = insertedCareerGroup[0].insertId;
                console.log("Inserted career group:", careerGroupId);

                await processCareerSubjects(career.career_name, careerGroupId, country);
            }

            const insertData = {
                user_id: userId,
                career_group_id: careerGroupId,
                reason_for_recommendation: career.reason_for_recommendation,
                present_trends: career.present_trends,
                future_prospects: career.future_prospects,
                user_description: career.user_description,
                type2: "",
                type1: "",
                country: country
            };
            
            const result = await db.insert(USER_CAREER).values(insertData).execute();

            const userCareerId = result[0].insertId;

            // Iterate over each milestone data
            if (Array.isArray(career.roadmap)) {                
                for (const milestoneData of career.roadmap) {
                    if (milestoneData && typeof milestoneData.age === 'number' && milestoneData.milestones) {
                        const milestoneAge = milestoneData.age;

                        for (const [category, milestones] of Object.entries(milestoneData.milestones)) {

                            const categoryResult = await db
                                .select({ id: MILESTONE_CATEGORIES.id })
                                .from(MILESTONE_CATEGORIES)
                                .where(eq(MILESTONE_CATEGORIES.name, category))
                                .execute();

                            if (categoryResult.length === 0) {
                                console.log(`Milestone category ${category} not found.`);
                                continue;
                            }

                            const categoryId = categoryResult[0].id;

                            // Split the milestones string into an array, filter out invalid entries
                            const milestoneEntries = milestones.split('|')
                            .map(desc => desc.trim())
                            .filter(desc => desc && desc !== '-' && desc !== "N/A");

                        // Process each valid milestone entry
                        for (const desc of milestoneEntries) {
                            // Insert the milestone into the database
                            const insertMilestone = await db
                                .insert(MILESTONES)
                                .values({
                                    category_id: categoryId,
                                    description: desc, // Use the valid description
                                    completion_status: false,
                                    date_achieved: null,
                                    milestone_age: milestoneAge // Ensure milestoneAge is defined and correctly set
                                })
                                .execute();

                            const milestoneId = insertMilestone[0].insertId;

                            // Link the milestone with the user career
                            await db.insert(USER_MILESTONES).values({
                                user_career_id: userCareerId,
                                milestone_id: milestoneId
                            }).execute();
                            
                        }


                        }
                    } else {
                        console.error("Invalid milestone data:", milestoneData);
                    }
                }
            } else {
                console.error("Career roadmap is not an array or is missing.");
            }
        }
    } catch (error) {
        console.error("Error handling career data:", error);
        throw error; // Re-throw error to be handled by the caller if needed
    }
}