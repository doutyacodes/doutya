import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware";
import {
  QUIZ_SEQUENCES,
  USER_DETAILS,
  USER_RESULTS,
  COMPLETED_EDUCATION,
  WORK_EXPERIENCE,
} from "@/utils/schema";
import { eq, and } from "drizzle-orm";
import { db } from "@/utils";
import axios from "axios";
import { getCurrentWeekOfAge } from "@/lib/getCurrentWeekOfAge";
import { generateCareerPrompt } from "../services/promptService";
import { GoogleGenerativeAI } from "@google/generative-ai";

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
export const maxDuration = 300;
export const dynamic = "force-dynamic";

// In-flight generation promise map to prevent race conditions & duplicate OpenAI calls for the same user
const inFlightCareerGenerations = new Map();

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
  const industry = url.searchParams.get("industry") || null;
  const regenerate = url.searchParams.get("regenerate") === "true";

  // Check if result2 already exists in the database for this user
  const existingResult = await db
    .select({
      id: USER_RESULTS.id,
      result2: USER_RESULTS.result2,
    })
    .from(USER_RESULTS)
    .where(and(eq(USER_RESULTS.user_id, userId), eq(USER_RESULTS.quiz_id, 2)))
    .execute();

  const hasExistingResult =
    existingResult.length > 0 &&
    existingResult[0].result2 !== null &&
    existingResult[0].result2 !== "";

  // 1. If result2 is already present in DB and client didn't request regeneration, return it immediately
  if (!regenerate && hasExistingResult) {
    console.log(`Returning cached result from DB for user ${userId}`);
    return NextResponse.json(
      { result: existingResult[0].result2 },
      { status: 200 }
    );
  }

  // 2. If no result exists and no industry is specified, instruct client to select an industry (204)
  if (industry == null && !hasExistingResult) {
    return new NextResponse(null, { status: 204 });
  }

  // 3. Concurrency check: If another generation request for this user is ALREADY in-flight, await its result
  if (inFlightCareerGenerations.has(userId)) {
    console.log(`Career generation already in-flight for user ${userId}, awaiting existing promise...`);
    try {
      const sharedResult = await inFlightCareerGenerations.get(userId);
      return NextResponse.json({ result: sharedResult }, { status: 200 });
    } catch (inFlightErr) {
      console.error(`In-flight generation failed for user ${userId}:`, inFlightErr);
    }
  }

  // 4. Start the generation promise and register it in the in-flight map
  const generationPromise = (async () => {
    const userDetails = await db
      .select({
        country: USER_DETAILS.country,
        birth_date: USER_DETAILS.birth_date,
        university: USER_DETAILS.university,
        educationLevel: USER_DETAILS.education_level,
        experience: USER_DETAILS.experience,
        educationQualification: USER_DETAILS.education_qualification,
        currentJob: USER_DETAILS.current_job,
        academicYearStart: USER_DETAILS.academicYearStart,
        academicYearEnd: USER_DETAILS.academicYearEnd,
        className: USER_DETAILS.class_name,
        grade: USER_DETAILS.grade,
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId))
      .execute();

    const country = userDetails[0]?.country || null;
    const currentAgeWeek = getCurrentWeekOfAge(userDetails[0]?.birth_date);

    // Fetch education and work experience for completed education users
    let educationWorkDescription = null;

    if (userDetails[0]?.grade === "completed-education") {
      const completedEducation = await db
        .select({
          degree: COMPLETED_EDUCATION.degree,
          field: COMPLETED_EDUCATION.field,
          institution: COMPLETED_EDUCATION.institution,
          start_date: COMPLETED_EDUCATION.start_date,
          end_date: COMPLETED_EDUCATION.end_date,
          is_currently_studying: COMPLETED_EDUCATION.is_currently_studying,
        })
        .from(COMPLETED_EDUCATION)
        .where(eq(COMPLETED_EDUCATION.user_id, userId))
        .execute();

      const workExperience = await db
        .select({
          job_title: WORK_EXPERIENCE.job_title,
          company: WORK_EXPERIENCE.company,
          start_date: WORK_EXPERIENCE.start_date,
          end_date: WORK_EXPERIENCE.end_date,
          is_currently_working: WORK_EXPERIENCE.is_currently_working,
          skills: WORK_EXPERIENCE.skills,
        })
        .from(WORK_EXPERIENCE)
        .where(eq(WORK_EXPERIENCE.user_id, userId))
        .execute();

      const formatDate = (date) => {
        if (!date) return "unknown";
        const d = new Date(date);
        const month = d.toLocaleDateString("en-US", { month: "long" });
        const year = d.getFullYear();
        return `${month} ${year}`;
      };

      let educationText = "";
      if (completedEducation.length > 0) {
        const educationDetails = completedEducation
          .map((edu) => {
            const duration =
              edu.start_date && edu.end_date
                ? `from ${formatDate(edu.start_date)} to ${formatDate(edu.end_date)}`
                : edu.is_currently_studying
                  ? `from ${formatDate(edu.start_date)} (currently studying)`
                  : "";

            return `${edu.degree} in ${edu.field}${edu.institution ? ` from ${edu.institution}` : ""}${duration ? ` ${duration}` : ""}`;
          })
          .join(", ");

        educationText = `Education: ${educationDetails}.`;
      }

      let workText = "";
      if (workExperience.length > 0) {
        const workDetails = workExperience
          .map((work) => {
            const duration =
              work.start_date && work.end_date && !work.is_currently_working
                ? `from ${formatDate(work.start_date)} to ${formatDate(work.end_date)}`
                : work.is_currently_working
                  ? `from ${formatDate(work.start_date)} (currently working)`
                  : work.start_date
                    ? `from ${formatDate(work.start_date)}`
                    : "";

            let workDetail = `${work.job_title}${work.company ? ` at ${work.company}` : ""}${duration ? ` ${duration}` : ""}`;
            if (work.skills) {
              workDetail += ` with skills in ${work.skills}`;
            }
            return workDetail;
          })
          .join(", ");

        workText = `Work Experience: ${workDetails}.`;
      }

      educationWorkDescription = [educationText, workText]
        .filter(Boolean)
        .join(" ");
    }

    let finalAge = 18;
    if (userDetails.length > 0 && userDetails[0].birth_date) {
      const birthDate = new Date(userDetails[0].birth_date);
      const today = new Date();

      let ageInNumber = today.getFullYear() - birthDate.getFullYear();
      const hasBirthdayPassed =
        today.getMonth() > birthDate.getMonth() ||
        (today.getMonth() === birthDate.getMonth() &&
          today.getDate() >= birthDate.getDate());

      finalAge = hasBirthdayPassed ? ageInNumber : ageInNumber - 1;
      console.log("userDetails finalAge", finalAge);
    }

    const personality2 = await db
      .select({
        typeSequence: QUIZ_SEQUENCES.type_sequence,
      })
      .from(QUIZ_SEQUENCES)
      .where(
        and(eq(QUIZ_SEQUENCES.user_id, userId), eq(QUIZ_SEQUENCES.quiz_id, 2))
      )
      .execute();

    const type2 = personality2[0]?.typeSequence || "RIA";

    const personality1 = await db
      .select({
        typeSequence: QUIZ_SEQUENCES.type_sequence,
      })
      .from(QUIZ_SEQUENCES)
      .where(
        and(eq(QUIZ_SEQUENCES.user_id, userId), eq(QUIZ_SEQUENCES.quiz_id, 1))
      )
      .execute();

    const type1 = personality1[0]?.typeSequence || "INTJ";

    const prompt = await generateCareerPrompt(
      userId,
      type1,
      type2,
      industry,
      country,
      finalAge,
      currentAgeWeek,
      language,
      languageOptions,
      educationWorkDescription
    );
    console.log("prompt generated for user", userId);
    
    console.log("prompt generated ", prompt);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 8000,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      `Input tokens careers result: ${response.data.usage.prompt_tokens}`
    );
    console.log(
      `Output tokens careers result: ${response.data.usage.completion_tokens}`
    );
    console.log(
      `Total tokens careers result : ${response.data.usage.total_tokens}`
    );

    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/\`\`\`json|\`\`\`/g, "").trim();

    // Upsert into user_results to guarantee no duplicate rows for the same user and quiz
    if (existingResult.length > 0) {
      await db
        .update(USER_RESULTS)
        .set({
          result2: responseText,
          type: industry == null ? "basic" : "advance",
          country: country,
        })
        .where(eq(USER_RESULTS.id, existingResult[0].id))
        .execute();
      console.log(`Updated existing user_results row ${existingResult[0].id} for user ${userId}`);
    } else {
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
      console.log(`Inserted new user_results row for user ${userId}`);
    }

    return responseText;
  })();

  inFlightCareerGenerations.set(userId, generationPromise);

  let responseText;
  try {
    responseText = await generationPromise;
  } finally {
    inFlightCareerGenerations.delete(userId);
  }

  return NextResponse.json({ result: responseText }, { status: 200 });
}
