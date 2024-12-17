import { authenticate } from '@/lib/jwtMiddleware';
import { db } from '@/utils';
import { INSTITUTION, INSTITUTION_COMMUNITY, INSTITUTION_COMMUNITY_POSTS, MODERATOR, USER_DETAILS } from '@/utils/schema';
import { and, desc, eq, or, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(req) {
  try {
    // Verify admin token
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    // Extract userId from decoded token
    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    // Fetch InstituteId ID from the database
    const institute = await db
      .select({
        institution_id: USER_DETAILS.institution_id,
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId))
      .limit(1);

    const institutionId = institute[0].institution_id;
      console.log('institutionId', institutionId);
      
    // Fetch community ID from the database
    const community = await db
      .select({
        community_id: INSTITUTION_COMMUNITY.id,
      })
      .from(INSTITUTION_COMMUNITY)
      .where(eq(INSTITUTION_COMMUNITY.institution_id, institutionId))
      .limit(1);

    if (!community || community.length === 0) {
      return NextResponse.json(
        { message: 'Community not found for the institution' },
        { status: 404 }
      );
    }

    const communityId = community[0].community_id;

        // Fetch all posts associated with the community ID, including the user name
        // const posts = await db
        //     .select({
        //     id: INSTITUTION_COMMUNITY_POSTS.id,
        //     posted_by_type: INSTITUTION_COMMUNITY_POSTS.posted_by_type,
        //     posted_by_id: INSTITUTION_COMMUNITY_POSTS.posted_by_id,
        //     file_url: INSTITUTION_COMMUNITY_POSTS.file_url,
        //     caption: INSTITUTION_COMMUNITY_POSTS.caption,
        //     type: INSTITUTION_COMMUNITY_POSTS.type,
        //     text_content: INSTITUTION_COMMUNITY_POSTS.text_content,
        //     created_at: INSTITUTION_COMMUNITY_POSTS.created_at,
        //     updated_at: INSTITUTION_COMMUNITY_POSTS.updated_at,
        //     user_name: sql`COALESCE(${INSTITUTION.name}, ${MODERATOR.name})`.as('user_name'), // Use SQL COALESCE for name
        //     })
        //     .from(INSTITUTION_COMMUNITY_POSTS)
        //     .leftJoin(INSTITUTION, and(
        //     eq(INSTITUTION.id, INSTITUTION_COMMUNITY_POSTS.posted_by_id),
        //     eq(INSTITUTION_COMMUNITY_POSTS.posted_by_type, 'SchoolAdmin')
        //     ))
        //     .leftJoin(MODERATOR, and(
        //     eq(MODERATOR.id, INSTITUTION_COMMUNITY_POSTS.posted_by_id),
        //     or(
        //         eq(INSTITUTION_COMMUNITY_POSTS.posted_by_type, 'Admin'),
        //         eq(INSTITUTION_COMMUNITY_POSTS.posted_by_type, 'ClassAdmin')
        //     )
        //     ))
        //     .where(eq(INSTITUTION_COMMUNITY_POSTS.community_id, communityId))
        //     .orderBy(desc(INSTITUTION_COMMUNITY_POSTS.created_at)); // Order by created_at descending;

        // Fetch all posts associated with the community ID, including the user name
            const posts = await db
            .select({
                id: INSTITUTION_COMMUNITY_POSTS.id,
                posted_by_type: INSTITUTION_COMMUNITY_POSTS.posted_by_type,
                posted_by_id: INSTITUTION_COMMUNITY_POSTS.posted_by_id,
                file_url: INSTITUTION_COMMUNITY_POSTS.file_url,
                caption: INSTITUTION_COMMUNITY_POSTS.caption,
                type: INSTITUTION_COMMUNITY_POSTS.type,
                text_content: INSTITUTION_COMMUNITY_POSTS.text_content,
                created_at: INSTITUTION_COMMUNITY_POSTS.created_at,
                updated_at: INSTITUTION_COMMUNITY_POSTS.updated_at,
                // Use COALESCE to get the name depending on the posted_by_type
                user_name: sql`
                    COALESCE(
                        ${INSTITUTION.name},
                        ${MODERATOR.name},
                        ${USER_DETAILS.name}
                    )`.as('user_name'),  // Added USER_DETAILS for student case
            })
            .from(INSTITUTION_COMMUNITY_POSTS)
            .leftJoin(INSTITUTION, and(
                eq(INSTITUTION.id, INSTITUTION_COMMUNITY_POSTS.posted_by_id),
                eq(INSTITUTION_COMMUNITY_POSTS.posted_by_type, 'SchoolAdmin')
            ))
            .leftJoin(MODERATOR, and(
                eq(MODERATOR.id, INSTITUTION_COMMUNITY_POSTS.posted_by_id),
                or(
                    eq(INSTITUTION_COMMUNITY_POSTS.posted_by_type, 'Admin'),
                    eq(INSTITUTION_COMMUNITY_POSTS.posted_by_type, 'ClassAdmin')
                )
            ))
            // Join USER_DETAILS table if posted_by_type is 'Student'
            .leftJoin(USER_DETAILS, eq(USER_DETAILS.id, INSTITUTION_COMMUNITY_POSTS.posted_by_id))
            .where(eq(INSTITUTION_COMMUNITY_POSTS.community_id, communityId))
            .orderBy(desc(INSTITUTION_COMMUNITY_POSTS.created_at)); // Order by created_at descending;

    // Return the posts
    return NextResponse.json(
      { posts },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
