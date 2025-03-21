import { db } from "@/utils"; // Ensure this path is correct
import {
  USER_DETAILS,
  CERTIFICATIONS,
  CAREER_GROUP,
  COURSE_OVERVIEW, // Add the table that holds course data
  USER_COURSE_PROGRESS // Include the USER_COURSE_PROGRESS table
} from "@/utils/schema"; // Ensure this path is correct
import { NextResponse } from "next/server";
import { authenticate } from "@/lib/jwtMiddleware"; // Ensure this path is correct
import { and, eq } from "drizzle-orm";
import { calculateAge } from "@/lib/ageCalculate";
import { GenerateCourse } from "@/app/api/utils/GenerateCourse";
import { calculateAcademicPercentage } from "@/lib/calculateAcademicPercentage";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
  // Authenticate the request
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  // Extract userId from decoded token
  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  const { courseId } = params;

  try {
    // Fetch user details and calculate age
    const user_data = await db
      .select({
        birth_date: USER_DETAILS.birth_date,
        education: USER_DETAILS.education,
        educationLevel: USER_DETAILS.education_level,
        academicYearStart : USER_DETAILS.academicYearStart,
        academicYearEnd : USER_DETAILS.academicYearEnd,
        className: USER_DETAILS.class_name
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));

    const birth_date = user_data[0].birth_date;
    const age = calculateAge(birth_date);

    const className = user_data[0]?.className
    const educationLevel = user_data[0]?.educationLevel
    const academicYearStart = user_data[0]?.academicYearStart
    const academicYearEnd = user_data[0]?.academicYearEnd
    const percentageCompleted = calculateAcademicPercentage(academicYearStart, academicYearEnd)

    const certificationData = await db
      .select({
        certificationName: CERTIFICATIONS.certification_name,
        careerGroupId: CERTIFICATIONS.career_group_id,
        careerName: CAREER_GROUP.career_name // Include career name from CAREER_GROUP
      })
      .from(CERTIFICATIONS)
      .leftJoin(
        CAREER_GROUP,
        eq(CERTIFICATIONS.career_group_id, CAREER_GROUP.id) // Join condition
      )
      .where(eq(CERTIFICATIONS.id, courseId));

    if (!certificationData.length) {
      return NextResponse.json(
        { message: "Certification not found" },
        { status: 404 }
      );
    }

    const { certificationName, careerName } = certificationData[0];

    // Check if course overview already exists for the given certification_id
    const existingCourseData = await db
      .select()
      .from(COURSE_OVERVIEW)
      .where(eq(COURSE_OVERVIEW.certification_id, courseId));

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

    if (existingCourseData.length > 0) {
      console.log("existig", existingCourseData);
      
      // If course overview exists, respond with that data including certification and career details
      return NextResponse.json(
        {
          courseOverview: existingCourseData,
          certificationName: certificationName,
          careerName: careerName,
          courseStatus: courseStatus // Include course status in response
        },
        { status: 200 }
      );
    }

    // Generate new course data if it does not exist
    // const generatedCourse = await GenerateCourse(age, certificationName, careerName, courseId, birth_date);
    const generatedCourse = await GenerateCourse(age, certificationName, careerName, courseId, birth_date, educationLevel, className, percentageCompleted);

    // Fetch the newly created course data after generation
    const newCourseData = await db
      .select()
      .from(COURSE_OVERVIEW)
      .where(eq(COURSE_OVERVIEW.certification_id, courseId));

    return NextResponse.json(
      {
        courseOverview: newCourseData,
        certificationName: certificationName,
        careerName: careerName,
        courseStatus: courseStatus // Include course status in response
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error fetching milestones data:", error);
    return NextResponse.json(
      { message: "Error processing request" },
      { status: 500 }
    );
  }
}
