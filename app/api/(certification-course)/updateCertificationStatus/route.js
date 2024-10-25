import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_COURSE_PROGRESS } from "@/utils/schema";  // Include USER_COURSE_PROGRESS table
import { and, eq } from "drizzle-orm/expressions";  // Import expressions for conditions
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
    const { courseID, status } = data;
    
    // Check the current status and perform actions accordingly
    if (status === 'in_progress') {

      // Check if a record already exists for the user and course
          const existingProgress = await db
          .select()
          .from(USER_COURSE_PROGRESS)
          .where(
            and(
              eq(USER_COURSE_PROGRESS.user_id, userId),
              eq(USER_COURSE_PROGRESS.certification_id, courseID)
            )
          )
          .execute();

        // If a record exists, you might want to respond or update it instead
        if (existingProgress.length > 0) {
          return NextResponse.json(
            { message: "Course progress already exists and is not updated.", data: existingProgress },
            { status: 200 } // You can change this status code as needed
          );
        }
      // Insert a new record with 'in_progress' status
      const insertResult = await db
        .insert(USER_COURSE_PROGRESS)
        .values({
          user_id: userId,
          certification_id: courseID,
          status: 'in_progress', // Set the status to 'in_progress'
          enrolled_date: new Date() // Set the current date as enrolled date
        })
        .execute();

      return NextResponse.json(
        { message: "Course progress updated to 'in_progress'", data: insertResult },
        { status: 201 }
      );

    } else if (status === 'completed') {
      // Update the course status to 'completed'
      const updateResult = await db
        .update(USER_COURSE_PROGRESS)
        .set({
          status: 'completed', // Set the status to 'completed'
          completion_date: new Date(), // Set the current date as completion date
        })
        .where(
          and(
            eq(USER_COURSE_PROGRESS.user_id, userId), 
            eq(USER_COURSE_PROGRESS.certification_id, courseID)
          )
        )
        .execute();

      return NextResponse.json(
        { message: "Course progress updated to 'completed'", data: updateResult },
        { status: 201 }
      );
    } else {
      return NextResponse.json(
        { message: "Invalid status provided" },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error in PUT:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
