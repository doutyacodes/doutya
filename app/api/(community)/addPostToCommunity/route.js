import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { COMMUNITY_POST } from '@/utils/schema';
import fs from 'fs/promises'; // For async file operations
import path from 'path';

export async function POST(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const formData = await req.formData();
    const contentType = formData.get('type');
    const contentCaption = formData.get('content');
    const file = formData.get('file');
    const communityId = formData.get('communityId');

    // Log form data keys
    console.log('Form data keys:', [...formData.keys()]);

    // Handle text content
    if (contentType === 'text') {
      await db.insert(COMMUNITY_POST).values({
        user_id: userId,
        community_id: communityId,
        type: contentType,
        caption: contentCaption,
        created_at: new Date(),
      });

      return NextResponse.json({ message: 'Text post submitted successfully' }, { status: 200 });
    }

    // Handle file upload (image/video)
    if (file && (contentType === 'image' || contentType === 'video')) {
      const ext = path.extname(file.name);
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');

      // Generate unique filename
      const uniqueFilename = `${userId}_${timestamp}${ext}`;
      const cpanelBaseDir = '/home/devusr/public_html/doutya-api';

      // Use forward slashes and replace any backslashes
      let uploadDirectory = '';
      if (contentType === 'image') {
        uploadDirectory = path.join(cpanelBaseDir, 'photos', uniqueFilename).replace(/\\/g, '/');
      } else if (contentType === 'video') {
        uploadDirectory = path.join(cpanelBaseDir, 'videos', uniqueFilename).replace(/\\/g, '/');
      } else {
        return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
      }

      // Ensure the directory exists
      const dir = path.dirname(uploadDirectory);
      try {
        await fs.mkdir(dir, { recursive: true });
        console.log('Directory created or already exists:', dir);
      } catch (mkdirError) {
        console.error('Error creating directory:', mkdirError);
        return NextResponse.json({ message: 'Error creating directory' }, { status: 500 });
      }

      // Read file as a buffer
      const fileBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(fileBuffer);

      // Write the file
      try {
        await fs.writeFile(uploadDirectory, buffer);
        console.log('File successfully saved:', uploadDirectory);

        // Save post data in the database
        await db.insert(COMMUNITY_POST).values({
          user_id: userId,
          community_id: communityId,
          type: contentType,
          caption: contentCaption,
          created_at: new Date(),
          file_url: uniqueFilename, // Store the filename in DB
        });

        return NextResponse.json({ message: 'Post submitted successfully', filename: uniqueFilename }, { status: 200 });
      } catch (writeError) {
        console.error('Error writing file:', writeError);
        return NextResponse.json({ message: 'Error saving file' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Invalid file type or no file uploaded' }, { status: 400 });
  } catch (error) {
    console.error('Error adding post:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
