import { NextResponse } from "next/server";
import { db } from "@/utils";
import { MILESTONES } from "@/utils/schema";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";

export async function PUT(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    const data = await req.json();
    const { milestoneId, completed } = data;

    // Ensure the input data is valid
    if (typeof milestoneId === 'number' && typeof completed === 'boolean') {
      // Update milestone completion status for the user
      const result = await db
        .update(MILESTONES)
        .set({ completion_status: completed })  // Using correct field name
        .where(eq(MILESTONES.id, milestoneId))
        .execute();  // Ensure the query executes

      if (!result) {
        return NextResponse.json(
          { message: "Failed to update milestone status" },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: "Milestone status updated successfully" },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid data provided" },
        { status: 400 }  // Bad Request
      );
    }
  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }  // Internal Server Error
    );
  }
}
