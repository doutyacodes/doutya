import { db } from '@/utils'; // Ensure this path is correct
import { CAREER_GROUP, QUIZ_SEQUENCES, USER_CAREER, MILESTONES, MILESTONE_CATEGORIES, USER_MILESTONES, RESULTS1, USER_DETAILS } from '@/utils/schema'; // Ensure this path is correct
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware'; // Ensure this path is correct
import { desc, eq, and, inArray } from 'drizzle-orm';
import { formattedAge } from '@/lib/formattedAge';

export async function GET(req) {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    // Extract userId from decoded token
    const userData = authResult.decoded_Data;
    const userId = userData.userId;



    try {

        const user_data = await db
                        .select({
                        birth_date:USER_DETAILS.birth_date,
                        })
                        .from(USER_DETAILS)
                        .where(eq(USER_DETAILS.id, userId))

        const birth_date=user_data[0].birth_date
        const age = formattedAge(birth_date)
        // console.log("birth_date", age);
        // return NextResponse.json({ message: 'Careers GOt successfully' }, { status: 201 });

        // Fetch data for the given userId
        // const data = await db
        //     .select()
        //     .from(USER_CAREER)
        //     .where(eq(USER_CAREER.user_id, userId))
        //     .orderBy(desc(USER_CAREER.created_at))
        //     .execute();

        // const data = await db
        //     .select({
        //         careerName: CAREER_GROUP.career_name, // Select the career_name from CAREER_GROUP
        //         userCareerData: USER_CAREER // Select all columns from USER_CAREER
        //     })
        //     .from(USER_CAREER)
        //     .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id)) // Join on the career_group_id
        //     .where(eq(USER_CAREER.user_id, userId))
        //     .orderBy(desc(USER_CAREER.created_at))
        //     .execute();

    
        const data = await db
            .select({
                id: USER_CAREER.id,
                userId: USER_CAREER.user_id,
                careerGrpId: CAREER_GROUP.id,
                careerName: CAREER_GROUP.career_name, // This gets the career name from the CAREER_GROUP table
                reasonForRecommendation: USER_CAREER.reason_for_recommendation,
                // roadmap: USER_CAREER.roadmap,
                presentTrends: USER_CAREER.present_trends,
                futureProspects: USER_CAREER.future_prospects,
                userDescription: USER_CAREER.user_description,
                createdAt: USER_CAREER.created_at,
                type2: USER_CAREER.type2,
                type1: USER_CAREER.type1,
                country: USER_CAREER.country,
            })
            .from(USER_CAREER)
            .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id)) // Join on the career_group_id
            .where(eq(USER_CAREER.user_id, userId))
            .execute();

        const personalityTypes = await db.select({
            typeSequence: QUIZ_SEQUENCES.type_sequence,
            quizId: QUIZ_SEQUENCES.quiz_id
        }).from(QUIZ_SEQUENCES)
            .where(eq(QUIZ_SEQUENCES.user_id, userId))
            .execute();

        const type1 = personalityTypes.find(pt => pt.quizId === 1)?.typeSequence;
        const type2 = personalityTypes.find(pt => pt.quizId === 2)?.typeSequence;

        const userCareerIds = data.map(record => record.id);
       
        // Fetch user milestones
        const userMilestones = await db
        .select({
            userCareerId: USER_MILESTONES.user_career_id,
            milestoneId: USER_MILESTONES.milestone_id,
            // milestoneTitle: MILESTONES.title,
            milestoneDescription: MILESTONES.description,
            // milestoneHowTo: MILESTONES.how_to,
            milestoneCategoryName: MILESTONE_CATEGORIES.name,
            milestoneCompletionStatus: MILESTONES.completion_status,
            milestoneDateAchieved: MILESTONES.date_achieved,
            milestoneAge: MILESTONES.milestone_age,
        })
        .from(USER_MILESTONES)
        .innerJoin(MILESTONES, eq(USER_MILESTONES.milestone_id, MILESTONES.id))
        .innerJoin(MILESTONE_CATEGORIES, eq(MILESTONES.category_id, MILESTONE_CATEGORIES.id))
        .where(
            and(
                inArray(USER_MILESTONES.user_career_id, userCareerIds) ,// Use inArray here,
                eq(MILESTONES.milestone_age, age)
            )
        )



        // console.log("userMilestones", userMilestones)

        // Generate feedback for each record asynchronously
        const resultData = await Promise.all(data.map(async (record) => {

            //extracts the strengths and weaknesses of the user
            const type_sequences = await db
                .select({
                    typeSequence: QUIZ_SEQUENCES.type_sequence
                })
                .from(QUIZ_SEQUENCES)
                .where(
                    and(
                        eq(QUIZ_SEQUENCES.user_id, userId),
                        eq(QUIZ_SEQUENCES.quiz_id, 1)
                    )
                )
                .execute();
            const type = type_sequences[0].typeSequence
            const results = await db.select().from(RESULTS1).where(eq(RESULTS1.type_sequence, type));
            const strengths=results[0].strengths
            const weaknesses=results[0].weaknesses
                
            // Filter milestones associated with this user career
            const milestonesForCareer = userMilestones.filter(m => m.userCareerId === record.id);
            return {
                id: record.id,
                user_id: record.userId,
                career_group_id: record.careerGrpId,
                career_name: record.careerName,
                reason_for_recommendation: record.reasonForRecommendation,
                present_trends: record.presentTrends,
                future_prospects: record.futureProspects,
                user_description: record.userDescription,
                created_at: record.createdAt,
                strengths: strengths,
                weaknesses: weaknesses,
                milestones: milestonesForCareer
            };

        }));

        // Respond with the fetched data
        return NextResponse.json(resultData, { status: 201 });

    } catch (error) {
        console.error('Error fetching career dat:', error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
