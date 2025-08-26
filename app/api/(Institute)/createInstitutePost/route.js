// import { NextResponse } from 'next/server';
// import { join } from 'path';
// import { mkdir, writeFile } from 'fs/promises';
// import os from 'os';
// import SFTPClient from 'ssh2-sftp-client';
// import { db } from '@/utils';
// import { INSTITUTION_COMMUNITY, INSTITUTION_COMMUNITY_POSTS, USER_DETAILS } from '@/utils/schema';
// import { eq } from 'drizzle-orm';
// import { authenticate } from '@/lib/jwtMiddleware';

// export async function POST(req) {
//   // Verify admin token
//   const authResult = await authenticate(req);
//   if (!authResult.authenticated) {
//       return authResult.response;
//   }

//   // Extract userId from decoded token
//   const userData = authResult.decoded_Data;
//   const userId = userData.userId;

//   try {
//     // Parse the multipart form data
//     const formData = await req.formData();

//     // Extract fields
//     const type = formData.get('type');
//     const caption = formData.get('caption');
//     const text = formData.get('text');
//     const file = formData.get('file');

//     console.log(formData)

//     // Validate required fields
//     if (!type) {
//       return NextResponse.json(
//         { message: 'Missing required fields' }, 
//         { status: 400 }
//       );
//     }

//     // Fetch InstituteId ID from the database
//     const institute = await db
//       .select({
//         institution_id: USER_DETAILS.institution_id,
//       })
//       .from(USER_DETAILS)
//       .where(eq(USER_DETAILS.id, userId))
//       .limit(1);

//     const institutionId = institute[0].institution_id;
//       console.log('institutionId', institutionId);


//     // Fetch the community ID from the database
//     const community = await db
//     .select({
//         community_id: INSTITUTION_COMMUNITY.id,
//     })
//     .from(INSTITUTION_COMMUNITY)
//     .where(eq(INSTITUTION_COMMUNITY.institution_id, institutionId))
//     .limit(1);

//     if (!community || community.length === 0) {
//         return NextResponse.json(
//             { message: 'Community not found for the institution' },
//             { status: 404 }
//         );
//     }

//     const communityId = community[0].community_id;


//     // Prepare data for database insertion
//     const postData = {
//       community_id: communityId,
//       posted_by_type: 'Student',
//       posted_by_id: userId,
//       type: type === 'text' ? 'Text' : type === 'video' ? 'Video' : 'Image',
//       caption: caption || null,
//       text_content: type === 'text' ? text : null,
//     };

//     // Handle file upload if not a text post
//     if (type !== 'text' && file instanceof File) {
//       // Generate unique filename
//       const timestamp = Date.now();
//       const originalName = file.name;
//       const fileName = `${timestamp}-${type}-${originalName}`;
      
//       // Define local temp path
//       const tempDir = os.tmpdir();
//       const localFilePath = join(tempDir, fileName);

//       // Ensure temp directory exists
//       await mkdir(tempDir, { recursive: true });

//       // Write file to temp location
//       const bytes = await file.arrayBuffer();
//       const buffer = Buffer.from(bytes);
//       await writeFile(localFilePath, buffer);

//       // Upload to SFTP
//       const sftp = new SFTPClient();
//       await sftp.connect({
//         host: '68.178.163.247',
//         port: 22,
//         username: 'devusr',
//         password: 'Wowfyuser#123',
//       });

//       const cPanelDirectory = '/home/devusr/public_html/testusr/images';
//       await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);

//       // Close SFTP connection
//       await sftp.end();

//       // Store file URL in database
//       postData.file_url = `/${fileName}`;
//     }

//     // Insert post into database
//     const insertedPost = await db.insert(INSTITUTION_COMMUNITY_POSTS).values(postData);

//     return NextResponse.json(
//       {
//         message: 'Post created successfully',
//         postId: insertedPost[0].insertId
//       },
//       { status: 200 }
//     );

//   } catch (error) {
//     console.error('Error creating community post:', error);

//     return NextResponse.json(
//       {
//         error: 'Failed to create community post',
//         details: error.message
//       },
//       { status: 500 }
//     );
//   }
// }

// export const runtime = 'nodejs'; // Required for server-only features

// export const api = {
//   bodyParser: false, // Disables automatic body parsing
// };