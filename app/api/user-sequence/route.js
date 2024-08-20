import { db } from "@/utils";
import { PERSONALITY_SEQUENCE } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('data[userId]');
        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }
        const result = await db.select({
            typeSequence: PERSONALITY_SEQUENCE.type_sequence
        }).from(PERSONALITY_SEQUENCE).where(eq(PERSONALITY_SEQUENCE.user_id, userId));
        if (result.length === 0) {
            return NextResponse.json({ error: 'User sequence not found' }, { status: 404 });
        }
        return NextResponse.json(result)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}