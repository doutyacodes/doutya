import { db } from "@/utils"; // Ensure this path is correct
import { CAREER_GROUP, USER_CAREER } from "@/utils/schema"; // Ensure this path is correct
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware"; // Ensure this path is correct
import { eq } from "drizzle-orm";

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
    // Fetch only the required data: career_group_id and career_name
    const data = await db
      .select({
        id: USER_CAREER.id,
        career_group_id: CAREER_GROUP.id,
        career_name: CAREER_GROUP.career_name, // This gets the career name from the CAREER_GROUP table
      })
      .from(USER_CAREER)
      .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id)) // Join on the career_group_id
      .where(eq(USER_CAREER.user_id, userId));

    // Respond with the fetched data (career_group_id and career_name)
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Error fetching career data:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
