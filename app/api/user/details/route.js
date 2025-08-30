import { NextResponse } from "next/server";
import { db } from "@/utils";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER_DETAILS } from "@/utils/schema";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Fetch user details
    const userDetails = await db
      .select({
        grade: USER_DETAILS.grade,
        plan_type: USER_DETAILS.plan_type,
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId))
      .execute();

    if (userDetails.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(userDetails[0], { status: 200 });

  } catch (error) {
    console.error("Error fetching user details:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}