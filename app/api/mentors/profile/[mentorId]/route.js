import { NextResponse } from 'next/server';
import { MENTOR_PROFILES, MENTOR_SKILLS, MENTOR_HIGHLIGHTS, MENTOR_PRICING, USER_MENTOR_RELATIONSHIPS } from '@/utils/schema';
import { eq, and } from 'drizzle-orm';
import { db } from '@/utils';
import { authenticate } from '@/lib/jwtMiddleware';

const BASE_IMAGE_URL = 'https://wowfy.in/doutya-api/photos/';

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const mentorId = params.mentorId;

  try {
    // Fetch Mentor Profile
    const [mentorProfile] = await db
      .select({
        mentor_id: MENTOR_PROFILES.mentor_id,
        full_name: MENTOR_PROFILES.full_name,
        profession: MENTOR_PROFILES.profession,
        experience_years: MENTOR_PROFILES.experience_years,
        bio: MENTOR_PROFILES.bio,
        contact_email: MENTOR_PROFILES.contact_email,
        profile_picture: MENTOR_PROFILES.profile_picture_url
      })
      .from(MENTOR_PROFILES)
      .where(eq(MENTOR_PROFILES.mentor_id, mentorId));

    // Fetch Mentor Skills
    const mentorSkills = await db
      .select({
        skill_name: MENTOR_SKILLS.skill_name,
        proficiency_level: MENTOR_SKILLS.proficiency_level
      })
      .from(MENTOR_SKILLS)
      .where(eq(MENTOR_SKILLS.mentor_id, mentorId));

    // Fetch Mentor Highlights
    const mentorHighlights = await db
      .select({
        highlight_type: MENTOR_HIGHLIGHTS.highlight_type,
        title: MENTOR_HIGHLIGHTS.title,
        description: MENTOR_HIGHLIGHTS.description,
        date: MENTOR_HIGHLIGHTS.date
      })
      .from(MENTOR_HIGHLIGHTS)
      .where(eq(MENTOR_HIGHLIGHTS.mentor_id, mentorId));

    // Fetch Mentor Pricing
    const [mentorPricing] = await db
      .select({
        question_price: MENTOR_PRICING.question_price,
        one_on_one_session_price: MENTOR_PRICING.one_on_one_session_price,
        currency: MENTOR_PRICING.currency
      })
      .from(MENTOR_PRICING)
      .where(eq(MENTOR_PRICING.mentor_id, mentorId));

    // Check Follow Status
    const [followStatus] = await db
      .select({ relationship_type: USER_MENTOR_RELATIONSHIPS.relationship_type })
      .from(USER_MENTOR_RELATIONSHIPS)
      .where(
        and(
          eq(USER_MENTOR_RELATIONSHIPS.user_id, userId),
          eq(USER_MENTOR_RELATIONSHIPS.mentor_id, mentorId)
        )
      );

    return NextResponse.json({
      mentor: {
        ...mentorProfile,
        profile_picture: mentorProfile.profile_picture 
          ? `${BASE_IMAGE_URL}${mentorProfile.profile_picture}` 
          : null,
        skills: mentorSkills,
        highlights: mentorHighlights,
        pricing: mentorPricing,
        is_followed: !!followStatus
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching mentor profile:", error);
    return NextResponse.json(
      { message: "Failed to fetch mentor profile" },
      { status: 500 }
    );
  }
}