import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_DETAILS } from "@/utils/schema";
import { encryptText } from "@/utils/encryption";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { verifyGoogleToken } from "@/lib/googleAuth";

export async function POST(req) {
  try {
    const data = await req.json();
    const { idToken, name, gender, mobile, dob, grade, stream, course, institutionType, instituteName } = data;

    if (!idToken) {
      return NextResponse.json(
        { message: "Google ID token is required" },
        { status: 400 }
      );
    }

    // 1. Verify Google Token
    let googleProfile;
    try {
      googleProfile = await verifyGoogleToken(idToken);
    } catch (err) {
      return NextResponse.json(
        { message: err.message || "Invalid Google token" },
        { status: 401 }
      );
    }

    // 2. Check if user already exists
    const [existingUser] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, googleProfile.email))
      .execute();

    let user;
    const finalName = (name || googleProfile.name || googleProfile.email.split("@")[0]).trim();
    const finalGender = gender || "Mr";
    const finalDob = dob ? new Date(dob) : null;

    // 3. Determine scope_type & education_level
    let scope_type = "career";
    if (institutionType === "School" && grade) {
      if (["5", "6", "7"].includes(grade)) {
        scope_type = "sector";
      } else if (["8", "9", "10"].includes(grade)) {
        scope_type = "cluster";
      }
    }

    let education_level = "Other";
    if (institutionType === "School") education_level = "School";
    else if (institutionType === "College") education_level = "College";

    if (existingUser) {
      // User exists, update missing fields
      await db
        .update(USER_DETAILS)
        .set({
          name: finalName,
          gender: finalGender,
          birth_date: finalDob || existingUser.birth_date,
          grade: grade || existingUser.grade,
          user_stream: stream || existingUser.user_stream,
          education: course || existingUser.education,
          education_level: education_level || existingUser.education_level,
          scope_type: scope_type || existingUser.scope_type,
        })
        .where(eq(USER_DETAILS.id, existingUser.id))
        .execute();

      user = { ...existingUser, name: finalName, grade: grade || existingUser.grade };
    } else {
      // Create new user record
      const randomPassword = crypto.randomUUID();
      const encryptedPassword = encryptText(randomPassword);

      const result = await db.insert(USER_DETAILS).values({
        name: finalName,
        gender: finalGender,
        mobile: mobile || null,
        birth_date: finalDob,
        password: encryptedPassword,
        username: googleProfile.email,
        institute_name: instituteName || null,
        class_name: grade ? `Class ${grade}` : null,
        grade: grade || null,
        user_stream: stream || null,
        education: course || null,
        education_level,
        country: "India",
        institution_id: null,
        class_id: null,
        division_id: null,
        stream_id: null,
        course_id: null,
        language: "English",
        account_status: "separated",
        scope_type,
        user_role: "Individual",
        plan_type: "base",
        is_verified: true, // auto-verified for individual signups
      });

      const newUserId = result[0].insertId;
      const [newUserData] = await db
        .select()
        .from(USER_DETAILS)
        .where(eq(USER_DETAILS.id, newUserId))
        .execute();

      user = newUserData || {
        id: newUserId,
        name: finalName,
        username: googleProfile.email,
        birth_date: finalDob,
        is_verified: true,
        plan_type: "base",
        scope_type,
        grade,
      };
    }

    // 4. Generate JWT
    const jwtSecret = process.env.JWT_SECRET_KEY || "doutyajWtsecRet";
    const token = jwt.sign(
      {
        userId: user.id,
        birth_date: user.birth_date,
        isVerified: user.is_verified,
        plan: user.plan_type || "base",
        scope_type: user.scope_type || scope_type,
      },
      jwtSecret
    );

    const isJunior = ["5", "6", "7"].includes(grade);
    const dashboardUrl = isJunior ? "/dashboard_junior" : "/dashboard";

    const response = NextResponse.json(
      {
        status: "LOGGED_IN",
        message: "Account created successfully",
        data: { user, token },
        token,
        class: grade,
        dashboardUrl,
        navigateUrl: dashboardUrl,
      },
      { status: 201 }
    );

    response.cookies.set("auth_token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch (error) {
    console.error("Error in Google complete-signup:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred during signup" },
      { status: 500 }
    );
  }
}
