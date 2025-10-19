// File: /api/communities/posts/like/route.js
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMMUNITY_POSTS_LIKES } from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    
    const data = await req.json();
    const { postId, userType } = data;

    // Check if already liked
    const existingLike = await db
      .select()
      .from(COMMUNITY_POSTS_LIKES)
      .where(
        and(
          eq(COMMUNITY_POSTS_LIKES.post_id, parseInt(postId)),
          eq(COMMUNITY_POSTS_LIKES.liked_by_id, parseInt(userId)),
          eq(COMMUNITY_POSTS_LIKES.liked_by_type, userType)
        )
      )
      .execute();

    if (existingLike.length > 0) {
      // Unlike - delete the like
      await db
        .delete(COMMUNITY_POSTS_LIKES)
        .where(
          and(
            eq(COMMUNITY_POSTS_LIKES.post_id, parseInt(postId)),
            eq(COMMUNITY_POSTS_LIKES.liked_by_id, parseInt(userId)),
            eq(COMMUNITY_POSTS_LIKES.liked_by_type, userType)
          )
        )
        .execute();

      return NextResponse.json(
        { success: true, action: "unliked" },
        { status: 200 }
      );
    } else {
      // Like - insert new like
      await db
        .insert(COMMUNITY_POSTS_LIKES)
        .values({
          post_id: parseInt(postId),
          liked_by_id: parseInt(userId),
          liked_by_type: userType,
          created_at: new Date(),
        })
        .execute();

      return NextResponse.json(
        { success: true, action: "liked" },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Error liking/unliking post:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
