// app\api\submitChallenge\route.js
import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import { eq, and } from 'drizzle-orm';
import { USER_DETAILS, CHALLENGE_PROGRESS } from '@/utils/schema';

export async function POST(req) {

    try {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const formData = await req.formData();
    const file = formData.get('file');
    const id=formData.get('id')
    const week = formData.get('week');

    console.log('iddd',id)
    const file_name=file.name

    if (!file) {
        return NextResponse.json({ message: 'File is required' }, { status: 400 });
    }

    const user_data = await db
        .select({
            birth_date: USER_DETAILS.birth_date,
        })
        .from(USER_DETAILS)
        .where(eq(USER_DETAILS.id, userId))
    const birth_date = user_data[0].birth_date

    const challengeProgress = await db
        .insert(CHALLENGE_PROGRESS)
        .values({
            user_id: userId,
            challenge_id: id,
            image: file_name, 
            status: 'pending',
            created_at: new Date(),
            school_id: 1, 
            week: week
        });
    
    return NextResponse.json({ message: 'Challenge progress submitted successfully' }, { status: 200 });
    }catch (error) {
        console.error('Error inserting challenge progress:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}