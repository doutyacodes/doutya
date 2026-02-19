import { NextResponse } from "next/server";
import { db } from "@/utils";
import { USER_DETAILS } from "@/utils/schema";
import jwt from "jsonwebtoken";
import { eq, or } from "drizzle-orm/expressions";

export async function POST(req) {
  try {
    const data = await req.json();

    // ── 1. Validate required fields ──────────────────────────────────────────
    const required = ["name", "username", "password", "gender", "mobile", "dob", "institutionType"];
    for (const field of required) {
      if (!data[field]) {
        return NextResponse.json(
          { message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // ── 2. Check for duplicate username / mobile ─────────────────────────────
    const existingUser = await db
      .select()
      .from(USER_DETAILS)
      .where(
        or(
          eq(USER_DETAILS.username, data.username),
          eq(USER_DETAILS.mobile, data.mobile)
        )
      );

    if (existingUser.length > 0) {
      const message =
        existingUser[0].username === data.username
          ? "Username already exists"
          : "Phone number already exists";
      return NextResponse.json({ message }, { status: 400 });
    }

    // ── 3. Determine scope_type from institution type + grade ────────────────
    let scope_type = "career"; // default for college / working professional

    if (data.institutionType === "School" && data.grade) {
      if (["5", "6", "7"].includes(data.grade)) {
        scope_type = "sector";
      } else if (["8", "9", "10"].includes(data.grade)) {
        scope_type = "cluster";
      }
      // grades 11, 12 → "career" (default)
    }

    // ── 4. Build education_level string ─────────────────────────────────────
    let education_level = "Other";
    if (data.institutionType === "School") education_level = "School";
    else if (data.institutionType === "College") education_level = "College";

    // ── 5. Insert user ───────────────────────────────────────────────────────
    const result = await db.insert(USER_DETAILS).values({
      name: data.name,
      gender: data.gender,
      mobile: data.mobile,
      birth_date: new Date(data.dob),
      password: data.password,
      username: data.username,

      // Institution info stored as free-text (not linked to DB tables)
      institute_name: data.instituteName || null,   // optional
      class_name: data.grade ? `Class ${data.grade}` : null,

      // Structured academic info
      grade: data.grade || null,                    // "5"–"12" for school, null for others
      user_stream: data.stream || null,             // "Science (PCM)" etc. for 11/12
      education: data.course || data.currentRole || null, // course for college, role for others
      education_level,
        
      country: data.country,

      // No FK references — this user is not linked to any institution in DB
      institution_id: null,
      class_id: null,
      division_id: null,
      stream_id: null,
      course_id: null,

      language: "English",
      account_status: "separated",
      scope_type,
      user_role: "Individual",

      // ✅ Individual (mall kiosk) signups are auto-verified
      is_verified: true,
    });

    if (!result) {
      return NextResponse.json(
        { message: "User registration failed" },
        { status: 500 }
      );
    }

    // ── 6. Fetch the newly created user ──────────────────────────────────────
    const [user] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, data.username));

    if (!user) {
      return NextResponse.json(
        { message: "User not found after registration" },
        { status: 404 }
      );
    }

    // ── 7. Generate JWT ──────────────────────────────────────────────────────
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

    // ── 8. Respond ───────────────────────────────────────────────────────────
    const response = NextResponse.json(
      {
        data: { user, token },
        message: "Account created successfully",
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
    console.error("Error in quick-signup POST:", error);
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}