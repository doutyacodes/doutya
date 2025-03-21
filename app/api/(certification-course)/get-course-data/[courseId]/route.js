import { db } from "@/utils"; // Ensure this path is correct
import {
  USER_DETAILS,
  CERTIFICATIONS,
  CAREER_GROUP,
  COURSE_OVERVIEW,
  COURSE_WEEKS,
  TOPICS_COVERED,
  ASSIGNMENTS,
  LEARNING_OUTCOMES,
  USER_COURSE_PROGRESS,
} from "@/utils/schema"; // Ensure this path is correct
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware"; // Ensure this path is correct
import { eq, and } from "drizzle-orm";
import { calculateAge } from "@/lib/ageCalculate";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const { courseId } = params;

  try {
    const user_data = await db
      .select({
        birth_date: USER_DETAILS.birth_date,
        education: USER_DETAILS.education,
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    const birth_date = user_data[0]?.birth_date;
    const age = calculateAge(birth_date);

    const certificationData = await db
      .select({
        certificationName: CERTIFICATIONS.certification_name,
        careerGroupId: CERTIFICATIONS.career_group_id,
        careerName: CAREER_GROUP.career_name,
      })
      .from(CERTIFICATIONS)
      .leftJoin(
        CAREER_GROUP,
        eq(CERTIFICATIONS.career_group_id, CAREER_GROUP.id)
      )
      .where(eq(CERTIFICATIONS.id, courseId));

    if (!certificationData.length) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    const courseData = await db
    .select({
      week_id: COURSE_WEEKS.id,
      week_number: COURSE_WEEKS.week_number,
      topic_name: TOPICS_COVERED.topic_name,
      assignment_description: ASSIGNMENTS.assignment_description,
      outcome_description: LEARNING_OUTCOMES.outcome_description,
    })
    .from(COURSE_WEEKS)
    .leftJoin(
      TOPICS_COVERED,
      and(
        eq(TOPICS_COVERED.week_id, COURSE_WEEKS.id),
        eq(TOPICS_COVERED.certification_id, courseId)
      )
    )
    .leftJoin(
      ASSIGNMENTS,
      and(
        eq(ASSIGNMENTS.week_id, COURSE_WEEKS.id),
        eq(ASSIGNMENTS.certification_id, courseId)
      )
    )
    .leftJoin(
      LEARNING_OUTCOMES,
      and(
        eq(LEARNING_OUTCOMES.week_id, COURSE_WEEKS.id),
        eq(LEARNING_OUTCOMES.certification_id, courseId)
      )
    )
    .orderBy(COURSE_WEEKS.week_number);

    const weeks = courseData.reduce((acc, row) => {
      const existingWeek = acc.find(w => w.week_number === row.week_number);

      if (existingWeek) {
        if (row.topic_name && !existingWeek.topics.includes(row.topic_name)) {
          existingWeek.topics.push(row.topic_name);
        }
        if (row.assignment_description && !existingWeek.assignments.includes(row.assignment_description)) {
          existingWeek.assignments.push(row.assignment_description);
        }
        if (row.outcome_description && !existingWeek.learningOutcomes.includes(row.outcome_description)) {
          existingWeek.learningOutcomes.push(row.outcome_description);
        }
      } else {
        acc.push({
          week_number: row.week_number,
          topics: row.topic_name ? [row.topic_name] : [],
          assignments: row.assignment_description ? [row.assignment_description] : [],
          learningOutcomes: row.outcome_description ? [row.outcome_description] : [],
        });
      }
      return acc;
    }, []);

    // Fetch course status from USER_COURSE_PROGRESS
    const courseProgressData = await db
      .select({
        status: USER_COURSE_PROGRESS.status
      })
      .from(USER_COURSE_PROGRESS)
      .where(
        and(
          eq(USER_COURSE_PROGRESS.user_id, userId),
          eq(USER_COURSE_PROGRESS.certification_id, courseId)
        )
      );

    const courseStatus = courseProgressData.length > 0 ? courseProgressData[0].status : null;

    return NextResponse.json({
      certificationName: certificationData[0].certificationName,
      careerName: certificationData[0].careerName,
      courseStatus,
      userAge: age,
      weeks,
    });

  } catch (error) {
    console.error("Error fetching course data:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
