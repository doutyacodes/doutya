import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import { QUIZ_SEQUENCES, USER_DETAILS, USER_RESULTS } from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@/utils";
import axios from "axios";
import { getCurrentWeekOfAge } from "@/lib/getCurrentWeekOfAge";
import { generateCareerPrompt } from "../services/promptService";

const languageOptions = {
  en: "in English",
  hi: "in Hindi",
  mar: "in Marathi",
  ur: "in Urdu",
  sp: "in Spanish",
  ben: "in Bengali",
  assa: "in Assamese",
  ge: "in German",
  mal: "in malayalam",
  tam: "in Tamil",
};
export const maxDuration = 300; // This function can run for a maximum of 5 seconds
export const dynamic = "force-dynamic";

export async function GET(req) {
  console.log("got");
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  const language = req.headers.get("accept-language") || "en";

  const url = new URL(req.url);

  const userDetails = await db
    .select({
      country: USER_DETAILS.country,
      birth_date: USER_DETAILS.birth_date,
      university: USER_DETAILS.university,
      educationLevel: USER_DETAILS.education_level,
      experience: USER_DETAILS.experience,
      educationQualification: USER_DETAILS.education_qualification,
      currentJob: USER_DETAILS.current_job,
      academicYearStart : USER_DETAILS.academicYearStart,
      academicYearEnd : USER_DETAILS.academicYearEnd,
      className: USER_DETAILS.class_name
    })
    .from(USER_DETAILS)
    .where(eq(USER_DETAILS.id, userId))
    .execute();
  // console.log("userDetails",userDetails);
  const country = userDetails[0].country; // Access the country
  const currentAgeWeek = getCurrentWeekOfAge(userDetails[0].birth_date)
  
  let finalAge = 18;
  if (userDetails.length > 0) {
    console.log("in the condition" )
    const birthDate = new Date(userDetails[0].birth_date); // Access the birth date from the first result
    const today = new Date(); // Get today's date

    // Calculate age in years
    let ageInNumber = today.getFullYear() - birthDate.getFullYear();

    // Adjust for whether the birthday has occurred this year
    const hasBirthdayPassed =
      today.getMonth() > birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() &&
        today.getDate() >= birthDate.getDate());

    finalAge = hasBirthdayPassed ? ageInNumber : ageInNumber - 1;

    console.log("userDetails finalAge", finalAge); // Log the calculated age
  } else {
    console.log("No user found with the given ID");
  }
  const industry = url.searchParams.get("industry") || null; // Get industry from URL parameters



  if (industry == null) {
    const existingResult = await db
      .select({
        result2: USER_RESULTS.result2,
      })
      .from(USER_RESULTS)
      .where(and(eq(USER_RESULTS.user_id, userId)))
      .execute();

    // console.log(existingResult);

    if (existingResult.length > 0 && existingResult[0].result2 !== null) {
      // If result2 is already present, return it
      console.log("Returning cached result");
      return NextResponse.json(
        { result: existingResult[0].result2 },
        { status: 200 }
      );
    } else if (existingResult.length === 0) {
      return new NextResponse(null, { status: 204 });
    }
  }

 
  const personality2 = await db
    .select({
      typeSequence: QUIZ_SEQUENCES.type_sequence,
    })
    .from(QUIZ_SEQUENCES)
    .where(
      and(eq(QUIZ_SEQUENCES.user_id, userId), eq(QUIZ_SEQUENCES.quiz_id, 1))
    )
    .execute();

  const type2 = personality2[0].typeSequence;

  const personality1 = await db
    .select({
      typeSequence: QUIZ_SEQUENCES.type_sequence,
    })
    .from(QUIZ_SEQUENCES)
    .where(
      and(eq(QUIZ_SEQUENCES.user_id, userId), eq(QUIZ_SEQUENCES.quiz_id, 1))
    )
    .execute();

  const type1 = personality1[0].typeSequence;
  const type3 = null;

  let jobDescription = "";

  if (userDetails[0].educationLevel === "Completed Education" && userDetails[0].experience === null) {
    jobDescription = `has completed the education and is looking for a job with educational qualification of ${userDetails[0].educationQualification}, graduated from ${userDetails[0].university} university.`;
  } else if (userDetails[0].educationLevel === "Completed Education" && userDetails[0].experience !== null) {
    jobDescription = `currently has a job in ${userDetails[0].currentJob} with ${userDetails[0].experience} years of experience, and is looking for a career change with educational qualification of ${userDetails[0].educationQualification}, graduated from ${userDetails[0].university} university. Please exclude careers involving ${userDetails[0].currentJob}.`;
  }

  const prompt = await generateCareerPrompt(
    userId, 
    type1,
    type2, 
    industry,
    country, 
    finalAge,
    currentAgeWeek, 
    language, 
    languageOptions
  );
  console.log("prompt", prompt)

  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 7000, // Adjust the token limit as needed
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  console.log(`Input tokens careers result: ${response.data.usage.prompt_tokens}`);
  console.log(`Output tokens careers result: ${response.data.usage.completion_tokens}`);
  console.log(`Total tokens careers result : ${response.data.usage.total_tokens}`);

  let responseText = response.data.choices[0].message.content.trim();
  responseText = responseText.replace(/```json|```/g, "").trim();

  // Store the new result in the user_results table
  await db
    .insert(USER_RESULTS)
    .values({
      user_id: userId,
      result2: responseText,
      quiz_id: 2,
      type: industry == null ? "basic" : "advance",
      country: country,
    })
    .execute();

  // return NextResponse.json({ result: responseText });
  return NextResponse.json({ result: responseText }, { status: 200 });
}
