import { NextResponse } from "next/server";
import { db } from "@/utils";
import { eq, and } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { QUIZ_SEQUENCES, USER_CAREER, USER_DETAILS, } from "@/utils/schema";
import { saveCareer } from "../utils/saveCareer";

export const maxDuration = 40; // This function can run for a maximum of 40 seconds
export const dynamic = "force-dynamic";

export async function POST(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const data = await req.json();
  const { results, locationData } = data; // Added locationData from request

  try {
    // Check user's plan type from USER_DETAILS table
    const userDetails = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId))
      .execute();

    if (userDetails.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 } // Not Found
      );
    }

    const { plan_type } = userDetails[0];

    // Check for existing user career in USER_CAREER table
    const existingUserCareer = await db
      .select()
      .from(USER_CAREER)
      .where(eq(USER_CAREER.user_id, userId))
      .execute();

    console.log("Existing User Career:", existingUserCareer);
    
    // Step 3: If plan type is 'base', check if the user already has a career saved
    if (plan_type === 'base' && existingUserCareer.length >= 2 ) {
      return NextResponse.json(
        { message: "Base plan users can only add up to two career paths. Upgrade to Pro to add more." },
        { status: 403 } // Forbidden
      );
    }

    // Call saveCareer and handle the response
    const existingCareers = await db
      .select()
      .from(USER_CAREER) // Assuming USER_CAREERS is the table where career data is stored
      .where(eq(USER_CAREER.user_id, userId))
      .execute();

    const isFirstTime = existingCareers.length === 0;

    if (existingCareers.length >= 5) {
      return NextResponse.json(
        { message: "Career limit reached. You can only save up to 5 careers." },
        { status: 400 } // Bad Request
      );
    }

    const country = userDetails[0].country;

    const personalityTypes = await db
      .select({
        typeSequence: QUIZ_SEQUENCES.type_sequence,
        quizId: QUIZ_SEQUENCES.quiz_id,
      })
      .from(QUIZ_SEQUENCES)
      .where(eq(QUIZ_SEQUENCES.user_id, userId))
      .execute();

    const type1 = personalityTypes.find((pt) => pt.quizId === 1)?.typeSequence;
    const type2 = personalityTypes.find((pt) => pt.quizId === 2)?.typeSequence;
    
    console.log("results", results);
    console.log("locationData", locationData);

    const careerNames = results.map((item) => item.career_name);
    console.log("Career Names:", careerNames);

    // Save the careers with location data
    const saveCareerResponse = await saveCareer(
      careerNames,
      country,
      userId,
      type1,
      type2,
      locationData // Pass location data to saveCareer function
    );

    return NextResponse.json(
      { message: saveCareerResponse.message, isFirstTime },
      { status: saveCareerResponse.status }
    );
  } catch (error) {
    return NextResponse.json(
      { message: error.message || "An unexpected error occurred" },
      { status: 500 } // Internal Server Error
    );
  }
}