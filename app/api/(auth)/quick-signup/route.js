import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_DETAILS } from "@/utils/schema";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm/expressions";
import { encryptText } from "@/utils/encryption";

export async function POST(req) {
  try {
    const data = await req.json();
    
    // Check if username already exists
    const existingUser = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, data?.username));
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { message: "Username already exists" },
        { status: 400 }
      );
    }

    // Calculate age from DOB
    const dob = new Date(data?.dob);
    const ageDiff = Date.now() - dob.getTime();
    const ageDate = new Date(ageDiff);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);

    // Determine scope_type based on class
    let scope_type = "career"; // default for 11th, 12th, college
    if (["5", "6", "7"].includes(data?.class)) {
      scope_type = "sector";
    } else if (["8", "9", "10"].includes(data?.class)) {
      scope_type = "cluster";
    }

    // Prepare default values for quick signup
    const defaultPassword = encryptText("testTest#");
    const defaultMobile = "9999999999";
    const defaultName = data?.username; // Use username as name
    const defaultGender = "Mr";
    const defaultLanguage = "English";
    const defaultCountry = "India";
    
    // Determine education level
    const educationLevelMapping = {
      0: "School",
      1: "College", 
      2: "Completed Education",
    };
    
    let educationLevel = "School";
    if (data?.class === "college") {
      educationLevel = "College";
    }

    console.log("Quick signup - scope_type:", scope_type);

    // Insert user details into the database
    const result = await db.insert(USER_DETAILS).values({
      name: defaultName,
      gender: defaultGender,
      mobile: defaultMobile,
      birth_date: new Date(data?.dob),
      password: defaultPassword,
      username: data?.username,
      education: null,
      student: "yes",
      college: null,
      university: null,
      yearOfPassing: null,
      monthOfPassing: null,
      country: defaultCountry,
      language: defaultLanguage,
      education_level: educationLevel,
      education_qualification: null,
      experience: null,
      current_job: null,
      account_status: 'separated',
      scope_type: scope_type,
      grade: data?.class,
    });

    if (!result) {
      return NextResponse.json(
        { message: "Quick signup failed" },
        { status: 500 }
      );
    }

    // Get the created user
    const [user] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, data?.username));

    if (!user) {
      return NextResponse.json(
        { message: "User not found after quick signup" },
        { status: 404 }
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
        data: { user, token, quizCompleted: false },
        message: "Quick signup successful",
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
    console.error("Error in Quick Signup POST:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}