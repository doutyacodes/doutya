// File: /api/communities/posts/comment/route.js
// ============================================================

import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMMUNITY_POSTS, USER_DETAILS, MODERATOR } from "@/utils/schema";
import { eq } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const userData = authResult.decoded_Data;
    const createdById = userData.userId;

    const data = await req.json();
    const { parentPostId, content, communityId, createdByType } = data;

    if (!content || !content.trim()) {
      return NextResponse.json(
        { success: false, message: "Comment content is required" },
        { status: 400 }
      );
    }

    // Insert new comment/reply
    const result = await db
      .insert(COMMUNITY_POSTS)
      .values({
        community_id: parseInt(communityId),
        created_by_id: parseInt(createdById),
        created_by_type: createdByType,
        parent_post_id: parseInt(parentPostId),
        title: null,
        content: content.trim(),
        image_url: null,
        created_at: new Date(),
        is_deleted: false,
        is_edited: false,
      })
      .execute();

    const commentId = result[0].insertId;

    // Get author name
    let authorName = "Anonymous";
    if (createdByType === "user") {
      const user = await db
        .select({ name: USER_DETAILS.name })
        .from(USER_DETAILS)
        .where(eq(USER_DETAILS.id, createdById))
        .execute();
      if (user.length > 0) authorName = user[0].name;
    } else if (createdByType === "moderator") {
      const moderator = await db
        .select({ name: MODERATOR.name })
        .from(MODERATOR)
        .where(eq(MODERATOR.id, createdById))
        .execute();
      if (moderator.length > 0) authorName = moderator[0].name;
    }

    const newComment = {
      id: commentId,
      community_id: parseInt(communityId),
      created_by_id: parseInt(createdById),
      created_by_type: createdByType,
      content: content.trim(),
      created_at: new Date(),
      is_edited: false,
      authorName,
      likeCount: 0,
      isLikedByUser: false,
      replyCount: 0,
    };

    return NextResponse.json(
      { success: true, comment: newComment, message: "Comment posted successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating comment:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}