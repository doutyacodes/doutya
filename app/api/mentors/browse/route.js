import { NextResponse } from "next/server";
import { db } from "@/utils";
import { 
  MENTOR_PROFILES, 
  MENTOR_SKILLS, 
  USER_MENTOR_RELATIONSHIPS 
} from "@/utils/schema";
import { 
  eq, 
  like, 
  sql, 
  and, 
  or, 
  inArray 
} from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  const { searchParams } = new URL(req.url);
  
  // Filtering parameters
  const profession = searchParams.get('profession') || '';
  const searchQuery = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const offset = (page - 1) * limit;

  try {
    // Get Popular Professions (top 5)
    const popularProfessions = await db
      .select({
        profession: MENTOR_PROFILES.profession,
        count: sql`count(*)`.as('count')
      })
      .from(MENTOR_PROFILES)
      .where(eq(MENTOR_PROFILES.is_active, true))
      .groupBy(MENTOR_PROFILES.profession)
      .orderBy(sql`count DESC`)
      .limit(5);

    // Base query for mentors
    let mentorsQuery = db
      .select({
        mentor_id: MENTOR_PROFILES.mentor_id,
        full_name: MENTOR_PROFILES.full_name,
        profession: MENTOR_PROFILES.profession,
        experience_years: MENTOR_PROFILES.experience_years,
        profile_picture_url: MENTOR_PROFILES.profile_picture_url,
        bio: sql`SUBSTRING(${MENTOR_PROFILES.bio}, 1, 100)`.as('short_bio'),
        skills: sql`GROUP_CONCAT(DISTINCT ${MENTOR_SKILLS.skill_name} SEPARATOR ', ')`.as('skills')
      })
      .from(MENTOR_PROFILES)
      .leftJoin(MENTOR_SKILLS, eq(MENTOR_PROFILES.mentor_id, MENTOR_SKILLS.mentor_id))
      .where(
        and(
          eq(MENTOR_PROFILES.is_active, true),
          // Filter by profession if provided
          profession ? eq(MENTOR_PROFILES.profession, profession) : undefined,
          // Search by name or profession
          searchQuery 
            ? or(
                like(MENTOR_PROFILES.full_name, `%${searchQuery}%`),
                like(MENTOR_PROFILES.profession, `%${searchQuery}%`)
              )
            : undefined
        )
      )
      .groupBy(
        MENTOR_PROFILES.mentor_id, 
        MENTOR_PROFILES.full_name, 
        MENTOR_PROFILES.profession,
        MENTOR_PROFILES.experience_years,
        MENTOR_PROFILES.profile_picture_url,
        MENTOR_PROFILES.bio
      )
      .limit(limit)
      .offset(offset);

    // Execute mentors query
    const mentors = await mentorsQuery;

    // Check following status for each mentor
    const mentorIds = mentors.map(mentor => mentor.mentor_id);
    const followedMentors = await db
      .select({
        mentor_id: USER_MENTOR_RELATIONSHIPS.mentor_id,
        relationship_type: USER_MENTOR_RELATIONSHIPS.relationship_type
      })
      .from(USER_MENTOR_RELATIONSHIPS)
      .where(
        and(
          eq(USER_MENTOR_RELATIONSHIPS.user_id, userId),
          inArray(USER_MENTOR_RELATIONSHIPS.mentor_id, mentorIds)
      ));

    // Merge following status with mentors
    const mentorsWithFollowStatus = mentors.map(mentor => ({
      ...mentor,
      is_followed: followedMentors.some(
        followed => followed.mentor_id === mentor.mentor_id
      )
    }));

    // Total count for pagination
    const [countResult] = await db
      .select({ 
        count: sql`count(*)`.as('count') 
      })
      .from(MENTOR_PROFILES)
      .where(
        and(
          eq(MENTOR_PROFILES.is_active, true),
          profession ? eq(MENTOR_PROFILES.profession, profession) : undefined,
          searchQuery 
            ? or(
                like(MENTOR_PROFILES.full_name, `%${searchQuery}%`),
                like(MENTOR_PROFILES.profession, `%${searchQuery}%`)
              )
            : undefined
        )
      );

    return NextResponse.json({
      mentors: mentorsWithFollowStatus,
      popularProfessions: popularProfessions.map(p => p.profession),
      pagination: {
        total: countResult.count,
        page,
        limit,
        totalPages: Math.ceil(countResult.count / limit)
      }
    }, { status: 200 });

  } catch (error) {
    console.error("Error fetching mentors:", error);
    return NextResponse.json(
      { message: "Failed to fetch mentors" },
      { status: 500 }
    );
  }
}


// API for Following/Unfollowing a mentor
export async function POST(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }
  
    const userData = authResult.decoded_Data;
    const userId = userData.userId;
  
    try {
      const { mentorId, careerGroupId, action } = await req.json();
  console.log(mentorId, careerGroupId, action );
  
      if (action === 'follow') {
        // Add mentor relationship
        await db.insert(USER_MENTOR_RELATIONSHIPS)
          .values({
            user_id: userId,
            mentor_id: mentorId,
            career_group_id: careerGroupId,
            relationship_type: 'followed'
          });
      } else if (action === 'unfollow') {
        // Remove mentor relationship
        await db.delete(USER_MENTOR_RELATIONSHIPS)
          .where(
            and(
              eq(USER_MENTOR_RELATIONSHIPS.user_id, userId),
              eq(USER_MENTOR_RELATIONSHIPS.mentor_id, mentorId),
              eq(USER_MENTOR_RELATIONSHIPS.career_group_id, careerGroupId)
            )
          );
      }
  
      return NextResponse.json(
        { message: `Mentor ${action}ed successfully` },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error in mentor follow/unfollow:", error);
      return NextResponse.json(
        { message: "Failed to update mentor relationship" },
        { status: 500 }
      );
    }
  }