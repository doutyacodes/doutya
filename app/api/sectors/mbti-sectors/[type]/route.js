import { NextResponse } from "next/server";
import { db } from "@/utils";
import { MBTI_SECTOR_MAP, SECTOR } from "@/utils/schema";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";

export const maxDuration = 10;
export const dynamic = "force-dynamic";

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const mbtiType = params.type;
  
  if (!mbtiType || mbtiType.length > 4) {
    return NextResponse.json(
      { message: "Invalid MBTI type provided" },
      { status: 400 }
    );
  }

  try {
    // Get the MBTI sector mapping
    const mbtiMapping = await db
      .select()
      .from(MBTI_SECTOR_MAP)
      .where(eq(MBTI_SECTOR_MAP.mbti_type, mbtiType.toUpperCase()))
      .execute();

    if (mbtiMapping.length === 0) {
      return NextResponse.json(
        { message: "MBTI type not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(mbtiMapping[0], { status: 200 });
  } catch (error) {
    console.error("Error fetching MBTI sector mapping:", error);
    return NextResponse.json(
      { message: "Failed to fetch MBTI sector mapping" },
      { status: 500 }
    );
  }
}