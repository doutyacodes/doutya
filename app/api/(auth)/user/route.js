import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_DETAILS } from "@/utils/schema";
import jwt from "jsonwebtoken";
import { eq, or } from "drizzle-orm/expressions";

export async function POST(req) {
  try {
    const data = await req.json();
    // Check if username or mobile number already exists
    const existingUser = await db
      .select()
      .from(USER_DETAILS)
      .where(or(
        eq(USER_DETAILS.username, data?.username),
        eq(USER_DETAILS.mobile, data?.mobile)
      ));
    
    if (existingUser.length > 0) {
      const message = existingUser[0].username === data?.username
        ? "Username already exists"
        : "Phone number already exists";
      return NextResponse.json(
        { message },
        { status: 400 } // Bad Request
      );
    }    // Calculate age from DOB
    const dob = new Date(data?.dob);
    const ageDiff = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Determine scope_type
    // let scope_type = "career";
    // if (age >= 6 && age <= 9) {
    //   scope_type = "sector";
    // } else if (age >= 10 && age <= 14) {
    //   scope_type = "cluster";
    // }

    // Determine scope_type based on class
    let scope_type = "career"; // default for 11th, 12th, college
    if (["5", "6", "7"].includes(data?.class)) {
      scope_type = "sector";
    } else if (["8", "9", "10"].includes(data?.class)) {
      scope_type = "cluster";
    }
    console.log("scope_type", scope_type)

    // Insert user details into the database
    const result = await db.insert(USER_DETAILS).values({
      name: data?.name,
      gender: data?.gender,
      mobile: data?.mobile,
      birth_date: new Date(data?.dob),
      password: data?.password,
      username: data?.username,
      education: data?.education,
      student: data?.student,
      college: data?.college,
      university: data?.university,
      yearOfPassing: data?.yearOfPassing,
      monthOfPassing: data?.monthOfPassing,
      country: data?.country,
      language:data?.language,
      education_level:data?.educationLevel,
      education_qualification: data?.educationQualification,
      experience: data?.experience,
      current_job: data?.currentJob,
      account_status: 'separated',
      scope_type: scope_type,
      grade: data?.class,
      user_stream: data?.stream || null,
      // institution_id: data?.instituteId,
      // class_id: data?.classId,
      // division_id: data?.divisionId, /* moved to speratee section
      //  */
    });

    if (!result) {
      return NextResponse.json(
        { message: "User registration failed" },
        { status: 500 } // Internal Server Error
      );
    }

    const [user] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, data?.username));

    if (!user) {
      return NextResponse.json(
        { message: "User not found after registration" },
        { status: 404 } // Not Found
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id,
        birth_date: user.birth_date,
        isVerified: user.is_verified,
        plan: user.plan_type,
        scope_type: user.scope_type,
       },
      process.env.JWT_SECRET_KEY
    );

    const response = NextResponse.json(
      {
        data: { user, token },
        message: "User registered and authenticated successfully",
      },
      { status: 201 }
    );

    response.cookies.set("auth_token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

  return response;
  } catch (error) {
    console.error("Error in POST:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 } // Internal Server Error
    );
  }
}
