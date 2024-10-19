import { db } from '@/utils';
import { CAREER_GROUP, CAREER_PATH, COMMUNITY_COMMENTS, COMMUNITY_POST, COMMUNITY_POST_LIKES, USER_DETAILS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray } from 'drizzle-orm'; // Adjust based on your ORM version
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req, { params }) {
  console.log('generating')
     // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const { communityId } = params;    

    try {
        // Fetch posts for the given community ID along with user details (for userName)
        const posts = await db
        .select({
            postId: COMMUNITY_POST.id,
            caption: COMMUNITY_POST.caption,
            fileUrl: COMMUNITY_POST.file_url,
            userName: USER_DETAILS.username // Fetch the userName from the USER_DETAILS table
        })
        .from(COMMUNITY_POST)
        .innerJoin(USER_DETAILS, eq(COMMUNITY_POST.user_id, USER_DETAILS.id)) // Join with USER_DETAILS to get the user name
        .where(eq(COMMUNITY_POST.community_id, communityId));

        // Map posts to include likes and comments
        const formattedPosts = await Promise.all(posts.map(async (post) => {
            const postId = post.postId;

            // Fetch likes count for the post
            const likesCount = await db
                .select()
                .from(COMMUNITY_POST_LIKES)
                .where(eq(COMMUNITY_POST_LIKES.post_id, postId));
            
            // Fetch comments for the post
            const comments = await db
                .select({
                    userName: USER_DETAILS.username,
                    content: COMMUNITY_COMMENTS.comment
                })
                .from(COMMUNITY_COMMENTS)
                .innerJoin(USER_DETAILS, eq(COMMUNITY_COMMENTS.user_id, USER_DETAILS.id))
                .where(eq(COMMUNITY_COMMENTS.post_id, postId));

            // Format the post with likes count and comments
            return {
                id: post.postId,
                type: post.fileUrl ? 'image' : 'text', // Determine post type
                fileUrl: post.fileUrl || null,
                caption: post.caption,
                userName: post.userName, // Now using the userName from the joined USER_DETAILS
                likes: likesCount.length, // Count of likes
                comments: comments.map(comment => ({
                    userName: comment.userName,
                    content: comment.content
                }))
            };
        }));

        // Send the formatted posts as a response
        return NextResponse.json({ posts: formattedPosts }, { status: 201 });

    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ message: 'Error fetching posts' }, { status: 500 });
    }
}