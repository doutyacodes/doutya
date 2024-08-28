import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_CAREER, USER_DETAILS } from "@/utils/schema";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
        }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const data = await req.json(); 
    const {country, results} = data
        
    try {
        for (const career of results) {
            const insertData = {
                user_id: userId,
                career_name: career.career_name,
                reason_for_recommendation: career.reason_for_recommendation,
                roadmap: career.roadmap.join(', '), // converting the array to a string 
                present_trends: career.present_trends,
                future_prospects: career.future_prospects,
                user_description: career.user_description,
                type2: "",
                type1: "",
                country: country?.label || null
            };

            // Insert the data into the USER_CAREER table
            await db.insert(USER_CAREER).values(insertData);
        }
        
        return NextResponse.json({ message: 'Careers saved successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
          { message: error.message || "An unexpected error occurred" },
          { status: 500 } // Internal Server Error
        );
      }
}
