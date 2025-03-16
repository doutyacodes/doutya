// File: /app/api/education-profile/route.js
import { 
  USER_EDUCATION_STAGE, 
  SCHOOL_EDUCATION, 
  COLLEGE_EDUCATION, 
  COMPLETED_EDUCATION, 
  WORK_EXPERIENCE, 
  USER_SKILLS, 
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
        // Delete any existing school education for this user
        await tx.delete(SCHOOL_EDUCATION).where(eq(SCHOOL_EDUCATION.user_id, userId));
        
        // Insert new school education data
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
        // Delete any existing college education for this user
        await tx.delete(COLLEGE_EDUCATION).where(eq(COLLEGE_EDUCATION.user_id, userId));
        
        // Insert new college education data
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
        // Delete any existing completed education for this user
        await tx.delete(COMPLETED_EDUCATION).where(eq(COMPLETED_EDUCATION.user_id, userId));
        
        // Insert new completed education data
        if (data.completedEducation && data.completedEducation.length > 0) {
          for (const education of data.completedEducation) {
            await tx.insert(COMPLETED_EDUCATION).values({
              user_id: userId,
              degree: education.degree,
              field: education.field,
              description: education.description,
            });
          }
        }

        // 5. Handle work experience if applicable
        await tx.delete(WORK_EXPERIENCE).where(eq(WORK_EXPERIENCE.user_id, userId));
        if (data.workExperience && data.workExperience.length > 0) {
          for (const experience of data.workExperience) {
            await tx.insert(WORK_EXPERIENCE).values({
              user_id: userId,
              job_title: experience.jobTitle,
              years_of_experience: experience.yearsOfExperience,
            });
          }
        }

        // 6. Handle skills if applicable
        await tx.delete(USER_SKILLS).where(eq(USER_SKILLS.user_id, userId));
        if (data.skills && data.skills.length > 0) {
          for (const skill of data.skills) {
            await tx.insert(USER_SKILLS).values({
              user_id: userId,
              skill_name: skill.skillName,
            });
          }
        }
      }

      // 7. Update career preferences
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
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    
    // Fetch all education data for this user
    const [
      educationStage,
      schoolEducation,
      collegeEducation,
      completedEducation,
      workExperience,
      skills,
      careerPreferences
    ] = await Promise.all([
      db.select().from(USER_EDUCATION_STAGE).where(eq(USER_EDUCATION_STAGE.user_id, userId)).limit(1),
      db.select().from(SCHOOL_EDUCATION).where(eq(SCHOOL_EDUCATION.user_id, userId)),
      db.select().from(COLLEGE_EDUCATION).where(eq(COLLEGE_EDUCATION.user_id, userId)),
      db.select().from(COMPLETED_EDUCATION).where(eq(COMPLETED_EDUCATION.user_id, userId)),
      db.select().from(WORK_EXPERIENCE).where(eq(WORK_EXPERIENCE.user_id, userId)),
      db.select().from(USER_SKILLS).where(eq(USER_SKILLS.user_id, userId)),
      db.select().from(CAREER_PREFERENCES).where(eq(CAREER_PREFERENCES.userId, userId)).limit(1)
    ]);

    return NextResponse.json({
      educationStage: educationStage[0]?.stage || null,
      schoolEducation: schoolEducation[0] || null,
      collegeEducation: collegeEducation || [],
      completedEducation: completedEducation || [],
      workExperience: workExperience || [],
      skills: skills || [],
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