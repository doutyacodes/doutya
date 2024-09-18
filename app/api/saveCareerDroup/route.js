import { NextResponse } from "next/server";
import { db } from "@/utils";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { handleCareerData } from "../utils/handleCareerData";
import { USER_DETAILS } from "@/utils/schema";
import { validateCareer } from "../saveInterestedCareer/validateCareer";

export async function POST(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
        }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const data = await req.json(); 
    const {isValidated, results} = data

    try {

        if(!isValidated){
             // Call the validation function
            try {
                const validationResult = await validateCareer(career);
        
                if (!validationResult.isValid) {        
                    return NextResponse.json({ message: validationResult.message }, { status: 400 });
                }
                
            } catch (error) {
                return NextResponse.json({ message: error.message || "An unexpected error occurred" }, { status: 500 });
            }
        }

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
                // await processCareerSubjects(career.career_name, careerGroupId, country);
            } else {
                console.log("Career group not found. Inserting new record.");
                
                // Insert the new career group
                const insertedCareerGroup = await db
                            .insert(CAREER_GROUP)
                            .values({ career_name: career.career_name })
                            .execute();

                careerGroupId = insertedCareerGroup[0].insertId;
                console.log("Inserted career group:", careerGroupId);
            }

        }
    } catch (error) {
        console.error("Error handling career data:", error);
        throw error; // Re-throw error to be handled by the caller if needed
    }
}
