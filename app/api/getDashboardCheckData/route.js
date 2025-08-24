import { db } from '@/utils'; // Ensure this path is correct
import { QUIZ_SEQUENCES, USER_DETAILS, USER_EDUCATION_STAGE, USER_FEATURE_FLAGS } from '@/utils/schema'; // Ensure this path is correct
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware'; // Ensure this path is correct
import { eq, and } from 'drizzle-orm';

export async function GET(req) {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Fetch quiz sequence data
        const data = await db
            .select()
            .from(QUIZ_SEQUENCES)
            .where(eq(QUIZ_SEQUENCES.user_id, userId))
            .execute();

        // Fetch user details
        const userDetails = await db
            .select({
                country: USER_DETAILS.country,
                institutionId: USER_DETAILS.institution_id,
                instituteName: USER_DETAILS.institute_name,
                classId: USER_DETAILS.class_id,
                className: USER_DETAILS.class_name,
                academicYearStart: USER_DETAILS.academicYearStart,
                academicYearEnd: USER_DETAILS.academicYearEnd,
                scopeType: USER_DETAILS.scope_type,
                grade: USER_DETAILS.grade
            })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .execute();

        const userInfo = userDetails[0];
        const countryInfo = userInfo?.country;
        const countryAdded = !!(countryInfo && countryInfo.trim() !== '');

        const institutionDetailsAdded = !!(
            (userInfo?.institutionId || (userInfo?.instituteName && userInfo?.instituteName.trim() !== '')) &&
            (userInfo?.classId || (userInfo?.className && userInfo?.className.trim() !== '')) &&
            userInfo?.academicYearStart &&
            userInfo?.academicYearEnd
        );

        // Education stage check
        const educationStage = await db
            .select()
            .from(USER_EDUCATION_STAGE)
            .where(eq(USER_EDUCATION_STAGE.user_id, userId))
            .execute();

        const educationStageExists = educationStage.length > 0;
        const educationStageValue = educationStageExists ? educationStage[0].stage : null;
        const isEducationCompleted = educationStageValue === "completed_education";

        // ✅ Check if 'result_page_shown' flag is true in USER_FEATURE_FLAGS
        const resultPageFlag = await db
            .select({ seen: USER_FEATURE_FLAGS.seen })
            .from(USER_FEATURE_FLAGS)
            .where(
                and(
                    eq(USER_FEATURE_FLAGS.user_id, userId),
                    eq(USER_FEATURE_FLAGS.key, "result_page_shown")
                )
            )
            .execute();

        const resultPageShown = resultPageFlag.length > 0 && resultPageFlag[0].seen === true;

        // ✅ Return all combined info
        return NextResponse.json(
            {
                data,
                countryAdded,
                institutionDetailsAdded,
                educationStageExists,
                educationStage: educationStageValue,
                isEducationCompleted,
                scopeType: userInfo.scopeType,
                resultPageShown,
                grade: userInfo.grade
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching quiz sequences:', error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}