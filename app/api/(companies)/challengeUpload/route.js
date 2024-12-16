import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import SFTPClient from "ssh2-sftp-client";
import { COMPANY_CHALLENGES, COMPANY_CHALLENGE_PROGRESS } from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";
import jwt from "jsonwebtoken";
import os from "os";
import { db } from "@/utils";
import { and, eq } from "drizzle-orm";

export async function POST(request) {
  const { token, challenge_id, image } = await request.json();

  // Define the local temp directory dynamically based on platform
  const localTempDir = os.tmpdir();
  const fileName = `${Date.now()}-${challenge_id}.png`;
  const localFilePath = path.join(localTempDir, fileName);
  const cPanelDirectory = "/home/devusr/public_html/testusr/images";

  // Authenticate user
  // const authResult = await authenticate(request, true);
  // if (!authResult.authenticated) {
  //   return authResult.response;
  // }

  let userId = null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    userId = decoded.userId;
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error.message === "jwt expired"
            ? "Token has expired"
            : "Authentication failed",
      },
      { status: 401 }
    );
  }

  let challengeExists;
  if (userId) {
    // Check if the challenge exists for the given ID
    const challenge = await db
      .select()
      .from(COMPANY_CHALLENGES)
      .where(eq(COMPANY_CHALLENGES.id, challenge_id))
      .limit(1)
      .execute();

    if (challenge.length > 0) {
      challengeExists = challenge[0];
    } else {
      return NextResponse.json(
        { error: "Challenge not found." },
        { status: 404 }
      );
    }
  }

  try {
    if (!fs.existsSync(localTempDir)) {
      fs.mkdirSync(localTempDir, { recursive: true });
    }

    // Decode base64 image and save temporarily on server
    const base64Image = image.split(";base64,").pop();
    fs.writeFileSync(localFilePath, base64Image, { encoding: "base64" });

    // SFTP Connection details
    const sftp = new SFTPClient();
    await sftp.connect({
      host: "68.178.163.247",
      port: 22, // Default port for SFTP
      username: "devusr",
      password: "Wowfyuser#123",
    });

    // Upload image to cPanel directory
    await sftp.put(localFilePath, `${cPanelDirectory}/${fileName}`);
    await sftp.end();

    // Save challenge progress data in COMPANY_CHALLENGE_PROGRESS table
    const challengeRecord = await db.insert(COMPANY_CHALLENGE_PROGRESS).values({
      user_id: userId,
      challenge_id: challengeExists.id,
      company_id:challengeExists.company_id,
      department_id:challengeExists.department_id,
      image: `${fileName}`,
      is_started: true,
      challenge_type:"upload",
      is_completed: true,
    });
 
    // Clean up temporary file
    fs.unlinkSync(localFilePath);

    return NextResponse.json(
      {
        message: "Challenge progress and image saved successfully",
        challenge: challengeRecord,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error uploading image:", error);

    return NextResponse.json(
      {
        error: "Failed to upload image and save challenge progress",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
