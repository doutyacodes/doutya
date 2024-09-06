import { NextResponse } from "next/server";
import { db } from "@/utils";
import { CAREER_GROUP, USER_CAREER, USER_DETAILS } from "@/utils/schema";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { handleCareerData } from "../utils/handleCareerData";

export async function POST(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
        }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const data = await req.json(); 
    const {country, results} = data


        
    // try {
    //     for (const career of results) {
    //         let careerGroupId;

    //         // Step 1: Check if the career name exists in the CAREER_GROUP table
    //         const existingCareerGroup = await db
    //             .select({
    //                 id: CAREER_GROUP.id
    //             })
    //             .from(CAREER_GROUP)
    //             .where(eq(CAREER_GROUP.career_name, career.career_name))
    //             .execute();

    //         if (existingCareerGroup.length > 0) {
    //             console.log("ALready Exist")
    //             // Step 2: If the career name exists, retrieve the id
    //             careerGroupId = existingCareerGroup[0].id;
    //         } else {
    //             console.log("NOT Exist addingg")
    //             // Step 3: If the career name doesn't exist, insert it into CAREER_GROUP and retrieve the new id
    //             const insertedCareerGroup = await db
    //                 .insert(CAREER_GROUP)
    //                 .values({ career_name: career.career_name })
    //                 .returning({ id: CAREER_GROUP.id })
    //                 .execute();

    //             careerGroupId = insertedCareerGroup[0].id;
    //         }

    //         // Step 4: Insert the data into the USER_CAREER table with the career_group_id
    //         const insertData = {
    //             user_id: userId,
    //             career_group_id: careerGroupId,
    //             // career_name: career.career_name,
    //             reason_for_recommendation: career.reason_for_recommendation,
    //             roadmap: career.roadmap.join(', '),
    //             present_trends: career.present_trends,
    //             future_prospects: career.future_prospects,
    //             user_description: career.user_description,
    //             type2: "",
    //             type1: "",
    //             country: country?.label || null
    //         };

    //         // Insert the data into the USER_CAREER table
    //         await db.insert(USER_CAREER).values(insertData);
    //     }
        
    //     return NextResponse.json({ message: 'Careers saved successfully' }, { status: 201 });
    // } catch (error) {
    //     return NextResponse.json(
    //       { message: error.message || "An unexpected error occurred" },
    //       { status: 500 } // Internal Server Error
    //     );
    //   }

    try {
        await handleCareerData(userId, country, results);
        return NextResponse.json({ message: 'Careers saved successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || "An unexpected error occurred" },
            { status: 500 } // Internal Server Error
        );
    }
}
