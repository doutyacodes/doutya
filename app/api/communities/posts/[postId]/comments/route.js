// File: /api/communities/posts/[postId]/comments/route.js
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMMUNITY_POSTS, COMMUNITY_POSTS_LIKES, USER_DETAILS, MODERATOR } from "@/utils/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const { postId } = params;
    const userData = authResult.decoded_Data;
    const currentUserId = userData.userId;

    // Get direct comments (first level only)
    const comments = await db
      .select({
        id: COMMUNITY_POSTS.id,
        community_id: COMMUNITY_POSTS.community_id,
        created_by_id: COMMUNITY_POSTS.created_by_id,
        created_by_type: COMMUNITY_POSTS.created_by_type,
        content: COMMUNITY_POSTS.content,
        created_at: COMMUNITY_POSTS.created_at,
        is_edited: COMMUNITY_POSTS.is_edited,
      })
      .from(COMMUNITY_POSTS)
      .where(
        and(
          eq(COMMUNITY_POSTS.parent_post_id, parseInt(postId)),
          eq(COMMUNITY_POSTS.is_deleted, false)
        )
      )
      .orderBy(desc(COMMUNITY_POSTS.created_at))
      .execute();

    // Enrich comments with author info, like count, and reply count
    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        // Get author name
        let authorName = "Anonymous";
        if (comment.created_by_type === "user") {
          const user = await db
            .select({ name: USER_DETAILS.name })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, comment.created_by_id))
            .execute();
          if (user.length > 0) authorName = user[0].name;
        } else if (comment.created_by_type === "moderator") {
          const moderator = await db
            .select({ name: MODERATOR.name })
            .from(MODERATOR)
            .where(eq(MODERATOR.id, comment.created_by_id))
            .execute();
          if (moderator.length > 0) authorName = moderator[0].name;
        }

        // Get like count
        const likeCountResult = await db
          .select({ count: sql`COUNT(*)` })
          .from(COMMUNITY_POSTS_LIKES)
          .where(eq(COMMUNITY_POSTS_LIKES.post_id, comment.id))
          .execute();
        const likeCount = parseInt(likeCountResult[0]?.count || 0);

        // Check if current user liked this comment
        const userLiked = await db
          .select()
          .from(COMMUNITY_POSTS_LIKES)
          .where(
            and(
              eq(COMMUNITY_POSTS_LIKES.post_id, comment.id),
              eq(COMMUNITY_POSTS_LIKES.liked_by_id, currentUserId),
              eq(COMMUNITY_POSTS_LIKES.liked_by_type, "user")
            )
          )
          .execute();
        const isLikedByUser = userLiked.length > 0;

        // Get reply count
        const replyCountResult = await db
          .select({ count: sql`COUNT(*)` })
          .from(COMMUNITY_POSTS)
          .where(
            and(
              eq(COMMUNITY_POSTS.parent_post_id, comment.id),
              eq(COMMUNITY_POSTS.is_deleted, false)
            )
          )
          .execute();
        const replyCount = parseInt(replyCountResult[0]?.count || 0);

        return {
          ...comment,
          authorName,
          likeCount,
          isLikedByUser,
          replyCount,
        };
      })
    );

    return NextResponse.json(
      { success: true, comments: enrichedComments },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching comments:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
