import { db } from "@/utils";import { 
  ONE_ON_ONE_SESSIONS, 
  MENTOR_AVAILABILITY_SLOTS,
  MENTOR_PRICING 
} from "@/utils/schema";
import { eq, and } from 'drizzle-orm';
import { authenticate } from "@/lib/jwtMiddleware";
import { NextResponse } from 'next/server';

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  
  try {
    const { mentorId, slotId } = await req.json();
    
    if (!mentorId || !slotId) {
      return NextResponse.json({ 
        message: "Mentor ID and Slot ID are required" 
      }, { status: 400 });
    }
    
    // Check if slot is available
    const [slot] = await db
      .select()
      .from(MENTOR_AVAILABILITY_SLOTS)
      .where(
        and(
          eq(MENTOR_AVAILABILITY_SLOTS.slot_id, slotId),
          eq(MENTOR_AVAILABILITY_SLOTS.mentor_id, mentorId),
          eq(MENTOR_AVAILABILITY_SLOTS.is_active, true),
          eq(MENTOR_AVAILABILITY_SLOTS.is_booked, false)
        )
      )
      .limit(1);
      
    if (!slot) {
      return NextResponse.json({ 
        message: "The selected time slot is not available or has already been booked" 
      }, { status: 400 });
    }
    
    // Get mentor pricing
    const [pricing] = await db
      .select()
      .from(MENTOR_PRICING)
      .where(eq(MENTOR_PRICING.mentor_id, mentorId))
      .limit(1);
      
    if (!pricing) {
      return NextResponse.json({ message: "Mentor pricing not found" }, { status: 404 });
    }
    
    // Calculate session times based on day of week and time slots
    const now = new Date();
    const startTime = new Date();
    
    // Find the next occurrence of the day of week
    const currentDay = startTime.getDay();
    const daysToAdd = (slot.day_of_week - currentDay + 7) % 7;
    startTime.setDate(startTime.getDate() + daysToAdd);
    
    // Set the time from the slot
    const [startHours, startMinutes] = slot.start_time.split(':');
    startTime.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);
    
    // Calculate end time
    const endTime = new Date(startTime);
    const [endHours, endMinutes] = slot.end_time.split(':');
    endTime.setHours(parseInt(endHours, 10), parseInt(endMinutes, 10), 0, 0);
    
    // Transaction: Create session and mark slot as booked
    await db.transaction(async (tx) => {
      // Create one-on-one session
      await tx.insert(ONE_ON_ONE_SESSIONS).values({
        user_id: userId,
        mentor_id: mentorId,
        availability_slot_id: slotId,
        session_status: "scheduled",
        start_time: startTime,
        end_time: endTime,
        total_price: pricing.one_on_one_session_price,
        payment_status: "paid", // Assume payment is successful for now
        created_at: now
      });
      
      // Mark slot as booked
      await tx
        .update(MENTOR_AVAILABILITY_SLOTS)
        .set({
          is_booked: true,
          booked_by_user_id: userId,
          booking_timestamp: now
        })
        .where(eq(MENTOR_AVAILABILITY_SLOTS.slot_id, slotId));
    });
    
    return NextResponse.json({
      message: "One-on-One session booked successfully",
      start_time: startTime,
      end_time: endTime
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error booking one-on-one session:", error);
    return NextResponse.json(
      { message: "Failed to book one-on-one session" },
      { status: 500 }
    );
  }
}