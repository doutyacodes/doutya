import { db } from '@/utils'; // Ensure this path is correct
import { QUIZ_SEQUENCES, USER_DETAILS, USER_EDUCATION_STAGE } from '@/utils/schema'; // Ensure this path is correct
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware'; // Ensure this path is correct
import { eq } from 'drizzle-orm';

export async function GET(req) {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response; // Respond with authentication error
    }

    // Extract userId from decoded token
    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    try {
        // Fetch data for the given userId
        const data = await db
        .select()
        .from(QUIZ_SEQUENCES)
        .where(eq(QUIZ_SEQUENCES.user_id, userId)) // Ensure userId is an integer
        .execute();

        // Check if the user's country and institution details are added
        const userDetails = await db
        .select({
            country: USER_DETAILS.country,
            institutionId: USER_DETAILS.institution_id,
            instituteName: USER_DETAILS.institute_name,
            classId: USER_DETAILS.class_id,
            className: USER_DETAILS.class_name,
            academicYearStart: USER_DETAILS.academicYearStart,
            academicYearEnd: USER_DETAILS.academicYearEnd
        })
        .from(USER_DETAILS)
        .where(eq(USER_DETAILS.id, userId))
        .execute();

        const userInfo = userDetails[0];
        const countryInfo = userInfo?.country;

        // Check if country is added
        const countryAdded = !!(countryInfo && countryInfo.trim() !== '');

        // Check if institution details are added
        // This will be true if either:
        // 1. The user has selected an institution (institution_id is set)
        // 2. The user has manually entered an institution name (institute_name is set)
        // Also verify that either class_id or class_name is set, and academic year fields are filled
        const institutionDetailsAdded = !!(
        (userInfo?.institutionId || (userInfo?.instituteName && userInfo?.instituteName.trim() !== '')) &&
        (userInfo?.classId || (userInfo?.className && userInfo?.className.trim() !== '')) &&
        userInfo?.academicYearStart && 
        userInfo?.academicYearEnd
        );

        // Check if user has an entry in USER_EDUCATION_STAGE
        const educationStage = await db
        .select()
        .from(USER_EDUCATION_STAGE)
        .where(eq(USER_EDUCATION_STAGE.user_id, userId))
        .execute();

        const educationStageExists = educationStage.length > 0; // true if entry exists, false otherwise

        return NextResponse.json(
        {
            data,
            countryAdded, // true or false
            institutionDetailsAdded, // true or false
            educationStageExists, // true if entry exists, false otherwise

        },
        { status: 200 }
        );

    } catch (error) {
        console.error('Error fetching quiz sequences:', error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
