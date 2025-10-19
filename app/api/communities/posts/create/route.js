// File: /api/communities/posts/create/route.js
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
    const { communityId, title, content, imageUrl, createdByType } = data;

    // Validate that at least one content type is provided
    if (!title && !content && !imageUrl) {
      return NextResponse.json(
        { success: false, message: "Post must have at least title, content, or image" },
        { status: 400 }
      );
    }

    // Insert new post
    const result = await db
      .insert(COMMUNITY_POSTS)
      .values({
        community_id: parseInt(communityId),
        created_by_id: parseInt(createdById),
        created_by_type: createdByType,
        parent_post_id: null,
        title: title || null,
        content: content || null,
        image_url: imageUrl || null,
        created_at: new Date(),
        is_deleted: false,
        is_edited: false,
      })
      .execute();

    const postId = result[0].insertId;

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

    const newPost = {
      id: postId,
      community_id: parseInt(communityId),
      created_by_id: parseInt(createdById),
      created_by_type: createdByType,
      title: title || null,
      content: content || null,
      image_url: imageUrl || null,
      created_at: new Date(),
      is_edited: false,
      authorName,
      likeCount: 0,
      isLikedByUser: false,
      commentCount: 0,
    };

    return NextResponse.json(
      { success: true, post: newPost, message: "Post created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json(
      { success: false, message: error.message || "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
