import { db } from '@/utils'; // Database connection
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { COMMUNITY_POST_LIKES } from '@/utils/schema'; // Import your schema for likes
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
      return NextResponse.json({ message: 'Like removed successfully' }, { status: 200 });
    } else {
      // If no like exists, add it
      await db
        .insert(COMMUNITY_POST_LIKES)
        .values({
          post_id: postId,
          user_id: userId,  // User ID from the authenticated token
        });

      return NextResponse.json({ message: 'Like added successfully' }, { status: 201 });
    }

  } catch (error) {
    console.error('Error adding/removing like:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
