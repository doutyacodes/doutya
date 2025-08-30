import { NextResponse } from "next/server";
import { db } from "@/utils";
import { SECTOR } from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";

export const maxDuration = 300; // This function can run for a maximum of 10 seconds
export const dynamic = "force-dynamic";

export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    // Get all sectors from the database
    const sectors = await db
      .select()
      .from(SECTOR)
      .execute();

    return NextResponse.json(sectors, { status: 200 });
  } catch (error) {
    console.error("Error fetching sectors:", error);
    return NextResponse.json(
      { message: "Failed to fetch sectors" },
      { status: 500 }
    );
  }
}