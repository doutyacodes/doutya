import { NextResponse } from "next/server";
import { db } from "@/utils";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { handleCareerData } from "../utils/handleCareerData";
import { USER_DETAILS } from "@/utils/schema";

export async function POST(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
        }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const data = await req.json(); 
    const {results} = data

    try {

         // Fetch user details to get the country
         const userDetails = await db
            .select()
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .execute();

        if (userDetails.length === 0) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 } // Not Found
            );
        }

        const country = userDetails[0].country;


        await handleCareerData(userId, country, results);
        return NextResponse.json({ message: 'Careers saved successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || "An unexpected error occurred" },
            { status: 500 } // Internal Server Error
        );
    }
}
