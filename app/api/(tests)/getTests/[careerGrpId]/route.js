import { db } from '@/utils';
import { USER_CAREER, CHALLENGES, TASKS, USER_TASKS } from '@/utils/schema';
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
        // // Step 1: Fetch the career group for the user
        // const userCareer = await db
        //     .select()
        //     .from(USER_CAREER)
        //     .where(eq(USER_CAREER.user_id, userId))
        //     .limit(1);

        // if (!userCareer.length) {
        //     return NextResponse.json({ message: 'User career not found' }, { status: 404 });
        // }

        // Step 2: Fetch all challenges matching the career_group_id
        const challenges = await db
            .select()
            .from(CHALLENGES)
            .where(eq(CHALLENGES.career_group_id, careerGrpId));

        if (!challenges.length) {
            return NextResponse.json({ message: 'No tests found for this career group' }, { status: 404 });
        }

        const challengeIds = challenges.map(challenge => challenge.challenge_id);

        // Step 2: Fetch all tasks (tests) associated with these challenges
        const tasks = await db
            .select()
            .from(TASKS)
            .where(inArray(TASKS.challenge_id, challengeIds));

        if (!tasks.length) {
            return NextResponse.json({ message: 'No tasks found for these challenges' }, { status: 404 });
        }

        const taskIds = tasks.map(task => task.task_id);

        // Step 3: Fetch user task completion status
        const userTasks = await db
            .select()
            .from(USER_TASKS)
            .where(inArray(USER_TASKS.task_id, taskIds))
            .where(eq(USER_TASKS.user_id, userId)); 

        // Map userTasks by task_id for easy lookup
        const userTasksMap = userTasks.reduce((map, userTask) => {
            map[userTask.task_id] = userTask.completed;
            return map;
        }, {});

        // Combine tasks with user task status
        const tasksWithStatus = tasks.map(task => ({
            ...task,
            completed: userTasksMap[task.task_id] || 'no' // Default to 'no' if no status found
        }));

        // Return the tasks with their completion status
        return NextResponse.json({ tasks: tasksWithStatus }, { status: 200 });
        // // Return the tasks (tests)
        // return NextResponse.json({ tasks }, { status: 200 });

    } catch (error) {
        console.error("Error fetching tasks:", error);
        return NextResponse.json({ message: 'Error fetching tasks' }, { status: 500 });
    }
}
