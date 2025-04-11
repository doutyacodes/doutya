import { db } from "@/utils";
import { MENTOR_AVAILABILITY_SLOTS } from "@/utils/schema";
import { eq, and } from 'drizzle-orm';
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const mentorId = params.mentorId;

  try {
    // Get all active slots for this mentor
    const slots = await db
      .select()
      .from(MENTOR_AVAILABILITY_SLOTS)
      .where(
        and(
          eq(MENTOR_AVAILABILITY_SLOTS.mentor_id, mentorId),
          eq(MENTOR_AVAILABILITY_SLOTS.is_active, true)
        )
      )
      .orderBy(
        MENTOR_AVAILABILITY_SLOTS.day_of_week,
        MENTOR_AVAILABILITY_SLOTS.start_time
      );

    return NextResponse.json({ slots }, { status: 200 });

  } catch (error) {
    console.error("Error fetching availability slots:", error);
    return NextResponse.json(
      { message: "Failed to fetch availability slots" },
      { status: 500 });
    }
  }