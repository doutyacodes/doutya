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
    const postId = await req.json(); // Get the request body
    
    // Ensure postId is included in the request body
    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    // Insert the like into the database
    try {

        // Check if the like already exists
    const existingLike = await db
        .select()
        .from(COMMUNITY_POST_LIKES)
        .where(
            and(
                eq(COMMUNITY_POST_LIKES.post_id, postId),
                eq(COMMUNITY_POST_LIKES.user_id, userId)
            )
        )
        if (existingLike.length > 0) {
            return NextResponse.json({ message: 'User has already liked this post' }, { status: 409 }); // Conflict
        }

      await db
        .insert(COMMUNITY_POST_LIKES)
        .values({
          post_id: postId, // Post ID from the request
          user_id: userId,  // User ID from the authenticated token
        });

      return NextResponse.json({ message: 'Like added successfully' }, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ message: 'Failed to add like' }, { status: 500 });
    }

  } catch (error) {
    console.error('Error adding like:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
