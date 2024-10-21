import { db } from '@/utils'; // Database connection
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { COMMUNITY_COMMENTS, COMMUNITY_POST_POINTS } from '@/utils/schema'; // Import your schema for comments and points
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
    const data = await req.json(); // Get the request body

    const { postId, comment } = data;

    // Ensure postId is included in the request body
    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    // Check if the user has already commented on this post
    const existingComment = await db
      .select()
      .from(COMMUNITY_COMMENTS)
      .where(
        and(
          eq(COMMUNITY_COMMENTS.post_id, postId),
          eq(COMMUNITY_COMMENTS.user_id, userId)
        )
      );

    // Insert the Comment into the database
    try {
      // Insert the comment
      await db
        .insert(COMMUNITY_COMMENTS)
        .values({
          post_id: postId,
          user_id: userId, 
          comment: comment,
        });

      // Check if this is the first comment from the user on this post
      if (existingComment.length === 0) {
        // If it's the first comment, update the comment points
        const pointsRecord = await db
          .select()
          .from(COMMUNITY_POST_POINTS)
          .where(eq(COMMUNITY_POST_POINTS.post_id, postId));

        if (pointsRecord.length > 0) {
          // Update comment points if the record exists
          await db
            .update(COMMUNITY_POST_POINTS)
            .set({ comment_points: pointsRecord[0].comment_points + 1 }) // Increment the comment points
            .where(eq(COMMUNITY_POST_POINTS.post_id, postId));
        } else {
          // If there's no entry for points, create one
          await db
            .insert(COMMUNITY_POST_POINTS)
            .values({
              post_id: postId,
              like_points: 0,  
              comment_points: 1, // Increment for the first comment
            });
        }
      }

      return NextResponse.json({ message: 'Comment added successfully' }, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ message: 'Failed to add Comment' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error adding Comment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
