import { db } from '@/utils';
import { TESTS, USER_TESTS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { eq, inArray } from 'drizzle-orm'; // Adjust based on your ORM version
import { authenticate } from '@/lib/jwtMiddleware';

export async function GET(req, { params }) {
     // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const { careerGrpId } = params;

    try {

    
        // Fetch all tests 
        const tests = await db .select().from(TESTS);
            

        if (!tests.length) {
            return NextResponse.json({ message: 'No tests found' }, { status: 404 });
        }

        const testIds = tests.map(test => test.test_id);

        // Step 3: Fetch user task completion status
        const userTests = await db
            .select()
            .from(USER_TESTS)
            .where(inArray(USER_TESTS.test_id, testIds))
            .where(eq(USER_TESTS.user_id, userId)); 


        // Map userTasks by test_id for easy lookup
        const userTestMap = userTests.reduce((map, userTest) => {
            map[userTest.test_id] = userTest.completed;
            return map;
        }, {});

        // Combine tasks with user task status
        const testsWithStatus = tests.map(test => ({
            ...test,
            completed: userTestMap[test.test_id] || 'no' // Default to 'no' if no status found
        }));

        // Return the tasks with their completion status
        return NextResponse.json({ tasks: testsWithStatus }, { status: 200 });
        // // Return the tasks (tests)
        // return NextResponse.json({ tasks }, { status: 200 });

    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
    }
}
