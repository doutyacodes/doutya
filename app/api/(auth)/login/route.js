import { db } from '@/utils';
import { USER_DETAILS, QUIZ_SEQUENCES, USER_EDUCATION_STAGE, USER_CAREER } from '@/utils/schema';
import { decryptText } from '@/utils/encryption';
import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// export async function POST(req) {
//   try {
//     const data = await req.json();
//     const { username, password } = data;

//     // Find the user in USER_DETAILS
//     const [existingUser] = await db
//       .select()
//       .from(USER_DETAILS)
//       .where(eq(USER_DETAILS.username, username))
//       .execute();

//     // If user is not found
//     if (!existingUser) {
//       return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
//     }

//     // Decrypt stored password and check if it matches
//     const decryptedPassword = decryptText(existingUser.password);

//     if (decryptedPassword !== password) {
//       return NextResponse.json({ message: 'Invalid username or password.' }, { status: 401 });
//     }

//     // Generate JWT token
//     const token = jwt.sign(
//       { 
//         userId: existingUser.id, 
//         birth_date: existingUser.birth_date, 
//         isVerified: existingUser.is_verified 
//       },
//       process.env.JWT_SECRET_KEY
//     );

//     // Get user ID
//     const userId = existingUser.id;
//     let navigateUrl = '/default'; // Default fallback

//     // Step 1: Check if both quizzes have been completed - Exit early if not
//     const quizSequences = await db
//     .select()
//     .from(QUIZ_SEQUENCES)
//     .where(eq(QUIZ_SEQUENCES.user_id, userId))
//     .execute();

//     // Group quizzes by quiz_id
//     const quizMap = {};
//     quizSequences.forEach(quiz => {
//     quizMap[quiz.quiz_id] = quiz;
//     });

//     // Check if both quiz 1 and 2 have non-empty type_sequence
//     const quiz1Completed = quizMap[1]?.type_sequence && quizMap[1].type_sequence !== "";
//     const quiz2Completed = quizMap[2]?.type_sequence && quizMap[2].type_sequence !== "";
//     const allQuizzesCompleted = quiz1Completed && quiz2Completed;

//     if (!allQuizzesCompleted) {
//       return NextResponse.json({
//         token,
//         birth_date: existingUser.birth_date,
//         planType: existingUser.plan_type,
//         navigateUrl: '/default', // If any quiz is incomplete
//       }, { status: 200 });
//     }

//       // Step 2: Check education stage - Exit early if not set
//       const educationStage = await db
//       .select()
//       .from(USER_EDUCATION_STAGE)
//       .where(eq(USER_EDUCATION_STAGE.user_id, userId))
//       .execute();

//     const educationStageExists = educationStage.length > 0;
    
//     if (!educationStageExists) {
//       return NextResponse.json({
//         token,
//         birth_date: existingUser.birth_date,
//         planType: existingUser.plan_type,
//         navigateUrl: '/user/education-profile',
//       }, { status: 200 });
//     }

//     const educationStageValue = educationStage[0].stage;
//     const isEducationCompleted = educationStageValue === "completed_education";

//  // Step 3: Get user details for subsequent checks
//     const userDetails = await db
//       .select({
//         country: USER_DETAILS.country,
//         institutionId: USER_DETAILS.institution_id,
//         instituteName: USER_DETAILS.institute_name,
//         classId: USER_DETAILS.class_id,
//         className: USER_DETAILS.class_name,
//         academicYearStart: USER_DETAILS.academicYearStart,
//         academicYearEnd: USER_DETAILS.academicYearEnd
//       })
//       .from(USER_DETAILS)
//       .where(eq(USER_DETAILS.id, userId))
//       .execute();

//     const userInfo = userDetails[0];
//     const countryInfo = userInfo?.country;
//     const countryAdded = !!(countryInfo && countryInfo.trim() !== '');

//     // If education not completed, check institution details first
//     if (!isEducationCompleted) {
//       const institutionDetailsAdded = !!(
//         (userInfo?.institutionId || (userInfo?.instituteName && userInfo?.instituteName.trim() !== '')) &&
//         (userInfo?.classId || (userInfo?.className && userInfo?.className.trim() !== '')) &&
//         userInfo?.academicYearStart && 
//         userInfo?.academicYearEnd
//       );

//       if (!institutionDetailsAdded) {
//         return NextResponse.json({
//           token,
//           birth_date: existingUser.birth_date,
//           planType: existingUser.plan_type,
//           navigateUrl: '/education-details',
//         }, { status: 200 });
//       }
//     }

//     // For both education completed and not completed paths: Check country
//     if (!countryAdded) {
//       return NextResponse.json({
//         token,
//         birth_date: existingUser.birth_date,
//         planType: existingUser.plan_type,
//         navigateUrl: '/country',
//       }, { status: 200 });
//     }

//     // Check if user has added any careers - this is the final check
//     const userCareers = await db
//       .select()
//       .from(USER_CAREER)
//       .where(eq(USER_CAREER.user_id, userId))
//       .execute();

//     const hasAddedCareers = userCareers.length > 0;
//     navigateUrl = hasAddedCareers ? 
//       '/dashboard/careers/career-guide' : 
//       '/dashboard/careers/career-suggestions';

//     // Final response with all checks passed
//     const response = NextResponse.json(
//       {
//       token,
//       birth_date: existingUser.birth_date,
//       planType: existingUser.plan_type,
//       navigateUrl,
//     }, { status: 200 });

//     // Set the auth_token cookie
//     response.cookies.set("auth_token", token, {
//       path: "/",
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "strict",
//     });
//   return response;   

//   } catch (error) {
//     console.error("Error in login route:", error);
//     return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
//   }
// }

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
        isVerified: existingUser.is_verified 
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
          navigateUrl = hasAddedCareers 
            ? '/dashboard/careers/career-guide' 
            : '/dashboard/careers/career-suggestions';
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

