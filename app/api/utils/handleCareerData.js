import { db } from "@/utils";
import { USER_CAREER, CAREER_GROUP } from "@/utils/schema";
import { eq } from "drizzle-orm";

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
                const test = await db
                            .insert(CAREER_GROUP)
                            .values({ career_name: career.career_name })
                            .execute();

                console.log("TESTTT", test);


                // Retrieve the newly inserted career group ID
                const insertedCareerGroup = await db
                    .select({ id: CAREER_GROUP.id })
                    .from(CAREER_GROUP)
                    .where(eq(CAREER_GROUP.career_name, career.career_name))
                    .execute();

                careerGroupId = insertedCareerGroup[0].id;
                
                console.log("Inserted career group:", insertedCareerGroup);
                careerGroupId = insertedCareerGroup[0].id;
            }

            console.log("Inserting career data with careerGroupId:", careerGroupId);

            console.log("career:", career);
            const insertData = {
                user_id: userId,
                career_group_id: careerGroupId,
                reason_for_recommendation: career.reason_for_recommendation,
                roadmap: career.roadmap.join(', '),
                present_trends: career.present_trends,
                future_prospects: career.future_prospects,
                user_description: career.user_description,
                type2: "",
                type1: "",
                country: country
            };
            
            await db.insert(USER_CAREER).values(insertData).execute();
        }
    } catch (error) {
        console.error("Error handling career data:", error);
        throw error; // Re-throw error to be handled by the caller if needed
    }
}