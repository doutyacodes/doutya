import { NextResponse } from "next/server";
import { db } from "@/utils";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER_CAREER, CAREER_GROUP } from "@/utils/schema";

export const dynamic = "force-dynamic";

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // Fetch all careers for the user, joining the career group for career names
    const userCareers = await db
      .select({
        careerName: CAREER_GROUP.career_name,
        reasonForRecommendation: USER_CAREER.reason_for_recommendation,
        presentTrends: USER_CAREER.present_trends,
        futureProspects: USER_CAREER.future_prospects,
        userDescription: USER_CAREER.user_description,
        createdAt: USER_CAREER.created_at,
        country: USER_CAREER.country,
        careerId:USER_CAREER.career_group_id
      })
      .from(USER_CAREER)
      .leftJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
      .where(eq(USER_CAREER.user_id, userId))
      .execute();

    return NextResponse.json(userCareers, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "An error occurred" },
      { status: 500 }
    );
  }
}
