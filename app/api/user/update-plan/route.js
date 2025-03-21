import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_DETAILS } from "@/utils/schema";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";

export async function PUT(req) {
    // Authenticate the user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        const data = await req.json();
        
        // Validate plan_type
        if (!data.plan_type || !['base', 'pro'].includes(data.plan_type)) {
            return NextResponse.json(
                { message: "Invalid plan type" },
                { status: 400 }
            );
        }

        // Update user's plan type in the database
        const result = await db.update(USER_DETAILS)
            .set({
                plan_type: data.plan_type,
            })
            .where(eq(USER_DETAILS.id, userId))
            .execute();

        // Fetch the updated user to generate a new token
        const [updatedUser] = await db
            .select()
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .execute();

        if (!updatedUser) {
            return NextResponse.json(
                { message: "Failed to retrieve updated user information" },
                { status: 500 }
            );
        }

        // Generate a new JWT token with updated plan information
        const token = jwt.sign(
            { 
                userId: updatedUser.id, 
                birth_date: updatedUser.birth_date, 
                isVerified: updatedUser.is_verified,
                plan: updatedUser.plan_type  
            },
            process.env.JWT_SECRET_KEY
        );

        // Create the response
        const response = NextResponse.json(
            {
                message: "Plan updated successfully",
                token: token,
                planType: updatedUser.plan_type
            },
            { status: 200 }
        );

        // Set the auth_token cookie
        response.cookies.set("auth_token", token, {
            path: "/",
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
        });

        return response;
    } catch (error) {
        console.error("Error updating plan:", error);
        return NextResponse.json(
            { message: error.message || "An unexpected error occurred" },
            { status: 500 }
        );
    }
}