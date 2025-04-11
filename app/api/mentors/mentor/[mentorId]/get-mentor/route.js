import { db } from "@/utils";
import { MENTOR_PROFILES, MENTOR_PRICING, MENTOR_AVAILABILITY_SLOTS } from "@/utils/schema";
import { eq } from 'drizzle-orm';
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
    console.log("olgger")
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const mentorId = params.mentorId;
console.log("mentorid", mentorId);

  try {
    // Get mentor profile with pricing
    const [mentorWithPricing] = await db
      .select({
        mentor_id: MENTOR_PROFILES.mentor_id,
        full_name: MENTOR_PROFILES.full_name,
        profession: MENTOR_PROFILES.profession,
        experience_years: MENTOR_PROFILES.experience_years,
        profile_picture_url: MENTOR_PROFILES.profile_picture_url,
        bio: MENTOR_PROFILES.bio,
        question_price: MENTOR_PRICING.question_price,
        one_on_one_session_price: MENTOR_PRICING.one_on_one_session_price,
        currency: MENTOR_PRICING.currency,
        slot_duration_minutes: MENTOR_AVAILABILITY_SLOTS.slot_duration_minutes,
      })
      .from(MENTOR_PROFILES)
      .leftJoin(MENTOR_PRICING, eq(MENTOR_PROFILES.mentor_id, MENTOR_PRICING.mentor_id))
      .leftJoin(MENTOR_AVAILABILITY_SLOTS, eq(MENTOR_PROFILES.mentor_id, MENTOR_AVAILABILITY_SLOTS.mentor_id))
      .where(eq(MENTOR_PROFILES.mentor_id, mentorId))
      .limit(1);

    if (!mentorWithPricing) {
      return NextResponse.json({ message: "Mentor not found" }, { status: 404 });
    }

    return NextResponse.json(mentorWithPricing, { status: 200 });

  } catch (error) {
    console.error("Error fetching mentor:", error);
    return NextResponse.json(
      { message: "Failed to fetch mentor details" },
      { status: 500 }
    );
  }
}