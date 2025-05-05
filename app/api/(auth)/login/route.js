import { db } from '@/utils';
import { USER_DETAILS, QUIZ_SEQUENCES, USER_EDUCATION_STAGE, USER_CAREER } from '@/utils/schema';
import { decryptText } from '@/utils/encryption';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

export async function POST(req) {
  try {
    const data = await req.json();
    const { username, password } = data;

    // Find the user in USER_DETAILS
    const [existingUser] = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.username, username))
      .execute();

    if (!existingUser) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    // Decrypt and validate password
    const decryptedPassword = decryptText(existingUser.password);
    if (decryptedPassword !== password) {
      return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: existingUser.id, 
        birth_date: existingUser.birth_date, 
        isVerified: existingUser.is_verified,
        plan: existingUser.plan_type,
        scope_type: existingUser.scope_type,  
      },
      process.env.JWT_SECRET_KEY
    );

    const userId = existingUser.id;
    let navigateUrl = '/default';

    // Fetch necessary data in parallel
    const [quizSequences, educationStage, userDetails, userCareers] = await Promise.all([
      db.select().from(QUIZ_SEQUENCES).where(eq(QUIZ_SEQUENCES.user_id, userId)).execute(),
      db.select().from(USER_EDUCATION_STAGE).where(eq(USER_EDUCATION_STAGE.user_id, userId)).execute(),
      db.select({
        country: USER_DETAILS.country,
        institutionId: USER_DETAILS.institution_id,
        instituteName: USER_DETAILS.institute_name,
        classId: USER_DETAILS.class_id,
        className: USER_DETAILS.class_name,
        academicYearStart: USER_DETAILS.academicYearStart,
        academicYearEnd: USER_DETAILS.academicYearEnd
      }).from(USER_DETAILS).where(eq(USER_DETAILS.id, userId)).execute(),
      db.select().from(USER_CAREER).where(eq(USER_CAREER.user_id, userId)).execute()
    ]);

    // Check quiz completion
    const quizMap = quizSequences.reduce((acc, quiz) => {
      acc[quiz.quiz_id] = quiz;
      return acc;
    }, {});

    const quiz1Completed = quizMap[1]?.type_sequence && quizMap[1].type_sequence !== "";
    const quiz2Completed = quizMap[2]?.type_sequence && quizMap[2].type_sequence !== "";
    const allQuizzesCompleted = quiz1Completed && quiz2Completed;

    if (!allQuizzesCompleted) {
      navigateUrl = '/default';
    } else {
      // Check education stage
      const educationStageExists = educationStage.length > 0;
      if (!educationStageExists) {
        navigateUrl = '/user/education-profile';
      } else {
        const educationStageValue = educationStage[0]?.stage;
        const isEducationCompleted = educationStageValue === "completed_education";

        const userInfo = userDetails[0];
        const countryAdded = !!(userInfo?.country && userInfo?.country.trim() !== '');

        if (!isEducationCompleted) {
          const institutionDetailsAdded = !!(
            (userInfo?.institutionId || (userInfo?.instituteName && userInfo?.instituteName.trim() !== '')) &&
            (userInfo?.classId || (userInfo?.className && userInfo?.className.trim() !== '')) &&
            userInfo?.academicYearStart &&
            userInfo?.academicYearEnd
          );

          if (!institutionDetailsAdded) {
            navigateUrl = '/education-details';
          }
        }

        if (!countryAdded) {
          navigateUrl = '/country';
        } else {
          const hasAddedCareers = userCareers.length > 0;
          
          // Determine the appropriate suggestion page based on scope_type
          if (hasAddedCareers) {
            navigateUrl = '/dashboard/careers/career-guide';
          } else {
            // Get the scope_type from existingUser and set the appropriate URL
            const scopeType = existingUser.scope_type || 'career';
            
            if (scopeType === 'career') {
              navigateUrl = '/dashboard/careers/career-suggestions';
            } else if (scopeType === 'sector') {
              navigateUrl = '/dashboard_kids/sector-suggestion';
            } else if (scopeType === 'cluster') {
              navigateUrl = '/dashboard_junior/cluster-suggestion';
            }
          }
        }
      }
    }

    // Create the response
    const response = NextResponse.json({
      token,
      birth_date: existingUser.birth_date,
      planType: existingUser.plan_type,
      navigateUrl
    }, { status: 200 });

    // Set the auth_token cookie
    response.cookies.set("auth_token", token, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;

  } catch (error) {
    console.error("Error in login route:", error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

