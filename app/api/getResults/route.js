import { db } from "@/utils";
import { RESULTS1 } from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";

export async function GET(req)
{
    try {
        const { searchParams } = new URL(req.url);
        const type_sequence = searchParams.get('data[0][typeSequence]');
        if (!type_sequence) {
            return NextResponse.json({ error: 'Type sequence is required' }, { status: 400 });
        }
        const results = await db.select().from(RESULTS1).where(eq(RESULTS1.type_sequence, type_sequence));

        if (results.length === 0) {
            return NextResponse.json({ error: 'No results found for the given type sequence' }, { status: 404 });
        }
        return NextResponse.json(results);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}