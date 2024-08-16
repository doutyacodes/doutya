import { db } from '@/utils';
import { ANALYTICS_QUESTION, ANSWERS, OPTIONS, PERSONALITY_SEQUENCE, QUESTIONS, TASKS, USER_DETAILS, USER_PROGRESS, USER_TASKS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';
import { createSequence } from './createSequence';


export async function POST(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const resultDataArray = await req.json(); 
    
    try {

            // Check if records already exist for this user
            const existingRecords = await db
            .select()
            .from(USER_PROGRESS)
            .where(eq(USER_PROGRESS.user_id, userId))
            .execute();
    
            if (existingRecords.length > 0) {
                // If records exist, return a response indicating the records are already created
                return NextResponse.json({ message: 'Records already created for this user.' }, { status: 400 });
            }

            const insertData = resultDataArray.map(data => ({
              user_id: userId,
              question_id: data.questionId,
              option_id: data.optionId,
              analytic_id: data.analyticId,
              created_at: new Date(),
            }));
          
            // Assuming your ORM/DB client supports batch inserts:
            await db.insert(USER_PROGRESS).values(insertData);
          
            console.log(`Inserted ${insertData.length} records into USER_PROGRESS.`);

            // Create sequence and insert into PERSONALITY_SEQUENCE
            try {
                await createSequence(resultDataArray, userId);
                return NextResponse.json({ message: 'Success' }, { status: 201 });
            } catch (createSequenceError) {
                console.error("Error creating personality sequence:", createSequenceError);
                return NextResponse.json({ message: 'Error creating personality sequence' }, { status: 500 });
            }


    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}