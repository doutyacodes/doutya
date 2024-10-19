import { db } from '@/utils'; // Database connection
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { COMMUNITY_COMMENTS, COMMUNITY_POST_LIKES } from '@/utils/schema'; // Import your schema for likes
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

    const {postId, comment} = data

    // Ensure postId is included in the request body
    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    // Insert the Comment into the database
    try {

      await db
        .insert(COMMUNITY_COMMENTS)
        .values({
          post_id: postId, // Post ID from the request
          user_id: userId,  // User ID from the authenticated token
          comment: comment
        });

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
