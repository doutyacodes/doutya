import { NextResponse } from "next/server";
import { db } from "@/utils";
import { COMPANIES } from "@/utils/schema";
import { authenticate } from "@/lib/jwtMiddleware";

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  try {
    const companies = await db.select().from(COMPANIES).execute();

    return NextResponse.json({
      companies,
    });
  } catch (error) {
    console.error("Error fetching companies:", error);
    return NextResponse.json(
      { error: "Failed to fetch companies." },
      { status: 500 }
    );
  }
}
