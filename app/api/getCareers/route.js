import { db } from "@/utils"; // Ensure this path is correct
import { CAREER_GROUP, USER_CAREER, USER_DETAILS } from "@/utils/schema"; // Ensure this path is correct
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware"; // Ensure this path is correct
import { eq } from "drizzle-orm";
import { formattedAge } from "@/lib/formattedAge";
import { calculateWeekFromTimestamp } from "../utils/calculateWeekFromTimestamp";

export async function GET(req) {
  // Authenticate the request
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  // Extract userId from decoded token
  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {

    const data = await db
      .select({
        id: USER_CAREER.id, // User career ID (can be null if no career entry)
        career_group_id: CAREER_GROUP.id, // Career group ID (can be null if no career entry)
        career_name: CAREER_GROUP.career_name, // Career name from CAREER_GROUP table (can be null if no career entry)
        birth_date: USER_DETAILS.birth_date, // Birth date from USER_DETAILS table
        joined_date: USER_DETAILS.joined_date, 
        created_at: USER_CAREER.created_at, // Creation date from USER_CAREER (can be null if no career entry)
        planType: USER_DETAILS.plan_type, // Plan type from USER_DETAILS
      })
      .from(USER_DETAILS) // Start from USER_DETAILS
      .leftJoin(USER_CAREER, eq(USER_CAREER.user_id, USER_DETAILS.id)) // Left join on USER_CAREER
      .leftJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id)) // Left join on CAREER_GROUP
      .where(eq(USER_DETAILS.id, userId)); // Filter by user ID

    // Extract birth_date and calculate the age
    const birthDate = data[0]?.birth_date;
    const age = birthDate ? formattedAge(birthDate) : null;
    console.log("birthDate", birthDate);
    const planType = data[0]?.planType;

    // Loop through the career data and calculate the weekData for each entry
    const carrerData = data.reduce((acc, career) => {
      if (career.career_name !== null) {
        const joinedAt = career.joined_date;
        const weekData = joinedAt ? calculateWeekFromTimestamp(joinedAt) : null;
        // Push the career entry with weekData into the result array
        acc.push({
          ...career,
          weekData,
        });
      }
      return acc;
    }, []);

    // Respond with the modified career data and age
    return NextResponse.json({ carrerData, age, planType }, { status: 201 });
  } catch (error) {
    console.error("Error fetching career data:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}

