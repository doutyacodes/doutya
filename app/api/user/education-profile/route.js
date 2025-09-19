// File: /app/api/user/education-profile/route.js
import { 
  USER_EDUCATION_STAGE, 
  SCHOOL_EDUCATION, 
  COLLEGE_EDUCATION, 
  COMPLETED_EDUCATION, 
  WORK_EXPERIENCE, 
  CAREER_PREFERENCES 
} from "@/utils/schema";
import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import { db } from "@/utils";

export async function POST(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const data = await req.json();
    
    // Begin transaction
    return await db.transaction(async (tx) => {
      // 1. Update or insert user education stage
      await tx
        .insert(USER_EDUCATION_STAGE)
        .values({
          user_id: userId,
          stage: data.educationStage,
        })
        .onDuplicateKeyUpdate({ set: { stage: data.educationStage } });

      // 2. Handle school education if applicable
      if (data.educationStage === "school") {
        await tx.delete(SCHOOL_EDUCATION).where(eq(SCHOOL_EDUCATION.user_id, userId));
        
        if (data.schoolEducation) {
          await tx.insert(SCHOOL_EDUCATION).values({
            user_id: userId,
            is_higher_secondary: data.schoolEducation.isHigherSecondary,
            main_subject: data.schoolEducation.mainSubject,
            description: data.schoolEducation.description,
          });
        }
      }

      // 3. Handle college education if applicable
      if (data.educationStage === "college") {
        await tx.delete(COLLEGE_EDUCATION).where(eq(COLLEGE_EDUCATION.user_id, userId));
        
        if (data.collegeEducation && data.collegeEducation.length > 0) {
          for (const education of data.collegeEducation) {
            await tx.insert(COLLEGE_EDUCATION).values({
              user_id: userId,
              degree: education.degree,
              field: education.field,
              year_of_study: education.yearOfStudy,
              is_completed: education.isCompleted,
              description: education.description,
            });
          }
        }
      }

      // 4. Handle completed education if applicable
      if (data.educationStage === "completed_education") {
        // Clear existing data
        await tx.delete(COMPLETED_EDUCATION).where(eq(COMPLETED_EDUCATION.user_id, userId));
        await tx.delete(WORK_EXPERIENCE).where(eq(WORK_EXPERIENCE.user_id, userId));

        // Insert completed education entries
        if (data.completedEducation && data.completedEducation.length > 0) {
          for (const education of data.completedEducation) {
            await tx.insert(COMPLETED_EDUCATION).values({
              user_id: userId,
              degree: education.degree,
              field: education.field,
              institution: education.institution,
              start_date: education.startDate ? new Date(education.startDate + "-01") : null,
              end_date: education.isCurrentlyStudying ? null : (education.endDate ? new Date(education.endDate + "-01") : null),
              is_currently_studying: education.isCurrentlyStudying || false,
              description: education.description,
            });
          }
        }

        // Insert work experience entries
        if (data.workExperience && data.workExperience.length > 0) {
          for (const experience of data.workExperience) {
            await tx.insert(WORK_EXPERIENCE).values({
              user_id: userId,
              job_title: experience.jobTitle,
              company: experience.company,
              start_date: experience.startDate ? new Date(experience.startDate + "-01") : null,
              end_date: experience.isCurrentlyWorking ? null : (experience.endDate ? new Date(experience.endDate + "-01") : null),
              is_currently_working: experience.isCurrentlyWorking || false,
              skills: experience.skills, // stays inside work experience
              years_of_experience: experience.yearsOfExperience || null,
              description: experience.description,
            });
          }
        }
      }

      // 5. Update career preferences (only if provided)
      if (data.careerPreferences) {
        await tx
          .insert(CAREER_PREFERENCES)
          .values({
            userId: userId,
            schoolPref: data.careerPreferences.schoolPref,
            collegePref: data.careerPreferences.collegePref,
            completedPref: data.careerPreferences.completedPref,
            noJobPref: data.careerPreferences.noJobPref,
          })
          .onDuplicateKeyUpdate({
            set: {
              schoolPref: data.careerPreferences.schoolPref,
              collegePref: data.careerPreferences.collegePref,
              completedPref: data.careerPreferences.completedPref,
              noJobPref: data.careerPreferences.noJobPref,
            },
          });
      }

      return NextResponse.json({ success: true });
    });
  } catch (error) {
    console.error("Error updating education profile:", error);
    return NextResponse.json(
      { error: "Failed to update education profile" },
      { status: 500 }
    );
  }
}

// GET endpoint to fetch user's education profile
export async function GET(req) {
  try {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    
    // Fetch all education data for this user
    const [
      educationStage,
      schoolEducation,
      collegeEducation,
      completedEducation,
      workExperience,
      careerPreferences
    ] = await Promise.all([
      db.select().from(USER_EDUCATION_STAGE).where(eq(USER_EDUCATION_STAGE.user_id, userId)).limit(1),
      db.select().from(SCHOOL_EDUCATION).where(eq(SCHOOL_EDUCATION.user_id, userId)),
      db.select().from(COLLEGE_EDUCATION).where(eq(COLLEGE_EDUCATION.user_id, userId)),
      db.select().from(COMPLETED_EDUCATION).where(eq(COMPLETED_EDUCATION.user_id, userId)),
      db.select().from(WORK_EXPERIENCE).where(eq(WORK_EXPERIENCE.user_id, userId)),
      db.select().from(CAREER_PREFERENCES).where(eq(CAREER_PREFERENCES.userId, userId)).limit(1)
    ]);

    // Transform data to match the new UI structure
    const completedEntries = [];
    
    // Add education entries
    if (completedEducation && completedEducation.length > 0) {
      completedEducation.forEach(edu => {
        completedEntries.push({
          type: "education",
          degree: edu.degree,
          field: edu.field,
          institution: edu.institution,
          startDate: edu.start_date ? edu.start_date.toISOString().substring(0, 7) : "",
          endDate: edu.end_date ? edu.end_date.toISOString().substring(0, 7) : "",
          isCurrentlyStudying: edu.is_currently_studying,
          description: edu.description,
          jobTitle: "",
          company: "",
          isCurrentlyWorking: false,
          skills: ""
        });
      });
    }

    // Add work entries
    if (workExperience && workExperience.length > 0) {
      workExperience.forEach(work => {
        completedEntries.push({
          type: "work",
          degree: "",
          field: "",
          institution: "",
          startDate: work.start_date ? work.start_date.toISOString().substring(0, 7) : "",
          endDate: work.end_date ? work.end_date.toISOString().substring(0, 7) : "",
          isCurrentlyStudying: false,
          description: work.description,
          jobTitle: work.job_title,
          company: work.company,
          isCurrentlyWorking: work.is_currently_working,
          skills: work.skills || ""
        });
      });
    }

    return NextResponse.json({
      educationStage: educationStage[0]?.stage || null,
      schoolEducation: schoolEducation[0] || null,
      collegeEducation: collegeEducation || [],
      completedEntries: completedEntries,
      // Legacy format for backward compatibility
      completedEducation: completedEducation || [],
      workExperience: workExperience || [],
      careerPreferences: careerPreferences[0] || null
    });
  } catch (error) {
    console.error("Error fetching education profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch education profile" },
      { status: 500 }
    );
  }
}