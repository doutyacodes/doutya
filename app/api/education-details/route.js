import { NextResponse } from "next/server";
import { db } from "@/utils";
import { CLASS, USER_DETAILS } from "@/utils/schema";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;

    const userId = userData.userId;
    const data = await req.json();

    // Verify the user exists
    const existingUser = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    if (existingUser.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Validate dates
    const startDate = new Date(data.academicYearStart);
    const endDate = new Date(data.academicYearEnd);

    if (isNaN(startDate) || isNaN(endDate)) {
      return NextResponse.json(
        { message: "Invalid date format for academic year" },
        { status: 400 }
      );
    }

    // Update user details
    const updateData = {
      academicYearStart: data.academicYearStart,
      academicYearEnd: data.academicYearEnd,
    };

    // Handle institutional vs custom school data
    if (data.institution_id && data.class_id && data.division_id) {

       // Fetch class name from CLASS table
       const classRecord = await db
       .select()
       .from(CLASS)
       .where(eq(CLASS.id, data.class_id));

     if (classRecord.length === 0) {
       return NextResponse.json(
         { message: "Invalid class ID provided" },
         { status: 400 }
       );
     }

      // For institutional selection
      updateData.institution_id = data.institution_id;
      updateData.class_id = data.class_id;
      updateData.division_id = data.division_id;
      updateData.institute_name = null;
      updateData.class_name = classRecord[0].name;
      updateData.user_role = 'Institutional';
      updateData.is_verified = false
    } else if (data.institute_name && data.class_name) {
      // For custom school entry
      updateData.institution_id = null;
      updateData.class_id = null;
      updateData.division_id = null;
      updateData.institute_name = data.institute_name;
      updateData.class_name = data.class_name;
    //   updateData.user_role = 'Individual'; /* dont need this as it will be defaultly Individual */
      updateData.is_verified = true  /* settting this to true as trhre is no school involved */
    } else {
      return NextResponse.json(
        { message: "Either institution selection or custom school details must be provided" },
        { status: 400 }
      );
    }

    // Update the user details
    const result = await db
      .update(USER_DETAILS)
      .set(updateData)
      .where(eq(USER_DETAILS.id, userId));

    if (!result) {
      return NextResponse.json(
        { message: "Failed to update education details" },
        { status: 500 }
      );
    }

    // Fetch updated user details
    const [updatedUser] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    return NextResponse.json(
      {
        data: { user: updatedUser },
        message: "Education details updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}