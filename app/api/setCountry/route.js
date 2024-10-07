import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_DETAILS } from "@/utils/schema";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";

export async function PUT(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    console.log(userId)

    const requestData = await req.json();

    const { currentCountry, educationCountry } = requestData;
    console.log(currentCountry, educationCountry)
    try {
        await db.update(USER_DETAILS)
            .set({
                country: currentCountry,
                education_country: educationCountry
            })
            .where(eq(USER_DETAILS.id, userId));


        const updatedUser = await db.select().from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .limit(1);

        console.log(updatedUser)

        const birthDate = updatedUser[0]?.birth_date;

        return NextResponse.json({
            success: true,
            message: "Country and Education Country updated successfully.",
            birthDate: birthDate
        }, { status: 201 });
    } catch (error) {
        console.error("Error updating user details:", error);
        return NextResponse.json({ success: false, message: "Failed to update user details." }, { status: 500 });
    }
}