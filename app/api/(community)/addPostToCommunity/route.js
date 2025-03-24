import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { COMMUNITY_POST } from '@/utils/schema';

export async function POST(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    // Parse JSON body instead of form data since we're sending JSON from the client
    const requestBody = await req.json();
    
    const contentType = requestBody.type; // 'text', 'image', 'video'
    const contentCaption = requestBody.content;
    const communityId = requestBody.communityId;
    const mediaPath = requestBody.mediaPath; // This will contain the file path from uploadImageToCPanel

    console.log('Request body:', requestBody);

    // Handle text content
    if (contentType === 'text') {
      await db.insert(COMMUNITY_POST).values({
        user_id: userId,
        community_id: communityId,
        type: contentType,
        caption: contentCaption,
        created_at: new Date(),
      });

      return NextResponse.json({ 
        success: true,
        message: 'Text post submitted successfully' 
      }, { status: 200 });
    }

    // Handle media posts (image/video)
    if (mediaPath && (contentType === 'image' || contentType === 'video')) {
      // Save post data in the database with the media path
      await db.insert(COMMUNITY_POST).values({
        user_id: userId,
        community_id: communityId,
        type: contentType,
        caption: contentCaption,
        created_at: new Date(),
        file_url: mediaPath, // Store the file path returned from CPanel upload
      });

      return NextResponse.json({ 
        success: true,
        message: 'Post submitted successfully',
        filePath: mediaPath 
      }, { status: 200 });
    }

    return NextResponse.json({ 
      success: false,
      message: 'Invalid post data' 
    }, { status: 400 });
    
  } catch (error) {
    console.error('Error adding post:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Internal server error' 
    }, { status: 500 });
  }
}
