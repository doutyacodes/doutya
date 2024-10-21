import { db } from '@/utils'; // Database connection
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { COMMUNITY_POST_LIKES, COMMUNITY_POST_POINTS } from '@/utils/schema'; // Import your schema for likes
import { and, eq } from 'drizzle-orm';

export async function POST(req) {
  try {
    // Authenticate the user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId; // Get the user ID from the token
    const { postId } = await req.json(); // Get the request body with postId
    // Ensure postId is included in the request body
    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    // Check if the user has already liked the post
    const existingLike = await db
      .select()
      .from(COMMUNITY_POST_LIKES)
      .where(
        and(
          eq(COMMUNITY_POST_LIKES.post_id, postId),
          eq(COMMUNITY_POST_LIKES.user_id, userId)
        )
      );

    if (existingLike.length > 0) {
      // If a like exists, remove it (unlike)
      await db
        .delete(COMMUNITY_POST_LIKES)
        .where(
          and(
            eq(COMMUNITY_POST_LIKES.post_id, postId),
            eq(COMMUNITY_POST_LIKES.user_id, userId)
          )
        );

      // Decrease the like points for the post
      const pointsRecord = await db
        .select()
        .from(COMMUNITY_POST_POINTS)
        .where(eq(COMMUNITY_POST_POINTS.post_id, postId));

        await db
        .update(COMMUNITY_POST_POINTS)
        .set({ like_points: pointsRecord[0].like_points - 1 })
        .where(eq(COMMUNITY_POST_POINTS.post_id, postId));

      return NextResponse.json({ message: 'Like removed successfully' }, { status: 200 });
    } else {
      // If no like exists, add it
      await db
        .insert(COMMUNITY_POST_LIKES)
        .values({
          post_id: postId,
          user_id: userId,  // User ID from the authenticated token
        });

      // Ensure the points entry exists
      const pointsRecord = await db
        .select()
        .from(COMMUNITY_POST_POINTS)
        .where(eq(COMMUNITY_POST_POINTS.post_id, postId));

        if (pointsRecord.length === 0) {
          // Initialize with default points if not present
          await db
            .insert(COMMUNITY_POST_POINTS)
            .values({
              post_id: postId,
              like_points: 0,    
              comment_points: 0,    
            });
        }

        // Increase the like points for the post
      await db
      .update(COMMUNITY_POST_POINTS)
      .set({ like_points: pointsRecord[0].like_points + 1 })
      .where(eq(COMMUNITY_POST_POINTS.post_id, postId));

      return NextResponse.json({ message: 'Like added successfully' }, { status: 201 });
    }

  } catch (error) {
    console.error('Error adding/removing like:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
