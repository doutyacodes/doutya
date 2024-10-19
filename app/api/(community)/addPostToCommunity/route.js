import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { COMMUNITY_POST } from '@/utils/schema';
import fs from 'fs';
import path from 'path';
import { Client } from 'basic-ftp';
import { FTP_BASE_PATH, uploadToFtp } from '@/utils/ftpConfig';


export async function POST(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const formData = await req.formData();
    console.log(formData);

    const contentType = formData.get('type'); // Post type: 'image', 'video', 'text'
    const contentCaption = formData.get('content'); // The caption or text content
    // const contentCaption = 'Sample Caption'
    const file = formData.get('file'); // Image or video file, if uploaded
    const communityId = formData.get('communityId')

    console.log("contentType", contentType);

    if (contentType === 'text') {
      // Save post as text content, no file upload required
      await db.insert(COMMUNITY_POST).values({
        user_id: userId,
        community_id: communityId, // Example community ID, adjust based on form data
        caption: contentCaption,
        created_at: new Date(),
      });

      return NextResponse.json({ message: 'Text post submitted successfully' }, { status: 200 });
    }

    // If contentType is 'image' or 'video', proceed with file upload
    if (file && (contentType === 'image' || contentType === 'video')) {
      const ext = path.extname(file.name);
      const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '');

      // Generate a unique filename
      const uniqueFilename = `${userId}_${timestamp}${ext}`;
      let uploadDirectory = '';
      let fileUrl = '';

      // Set upload directory based on contentType
      if (contentType === 'image') {
        uploadDirectory = path.join(process.cwd(), 'public', 'uploads', 'posts','images', uniqueFilename);
        fileUrl = `/uploads/posts/images/${uniqueFilename}`;
      } else if (contentType === 'video') {
        uploadDirectory = path.join(process.cwd(), 'public', 'uploads', 'posts', 'videos', uniqueFilename);
        fileUrl = `/uploads/posts/videos/${uniqueFilename}`;
      } else {
        return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
      }

      // Ensure the directory exists
      const dir = path.dirname(uploadDirectory);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true }); // Create directory if it doesn't exist
      }

      // Save the file to the server
      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(uploadDirectory, buffer);

      // Set upload directory based on contentType
      // if (contentType === 'image') {
      //   uploadDirectory = '/uploads/posts/images/';
      // } else if (contentType === 'video') {
      //   uploadDirectory = '/uploads/posts/videos/';
      // } else {
      //   return NextResponse.json({ message: 'Unsupported file type' }, { status: 400 });
      // }

      // const filePath = `${FTP_BASE_PATH}${uploadDirectory}${uniqueFilename}`;

      // // Convert the file to buffer
      // const buffer = Buffer.from(await file.arrayBuffer());

      // // Upload the file via FTP
      // await uploadToFtp(buffer, filePath); // Use the FTP utility function

      // Save post data in the database
      await db.insert(COMMUNITY_POST).values({
        user_id: userId,
        community_id: communityId, // Example community ID, adjust based on form data
        caption: contentCaption,
        created_at: new Date(),
        file_url: `${fileUrl}`, // Save relative file URL to the DB
      });

      return NextResponse.json({ 
        message: 'Post submitted successfully', 
        fileUrl: `${uploadDirectory}${uniqueFilename}` 
      }, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid file type or no file uploaded' }, { status: 400 });
  } catch (error) {
    console.error('Error adding post:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
