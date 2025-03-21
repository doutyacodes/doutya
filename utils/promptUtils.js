// src/utils/promptUtils.js

import { and, eq } from "drizzle-orm";
import { 
  USER_EDUCATION_STAGE, 
  SCHOOL_EDUCATION, 
  COLLEGE_EDUCATION, 
  COMPLETED_EDUCATION,
  WORK_EXPERIENCE,
  USER_SKILLS,
  USER_DETAILS,
  CAREER_PREFERENCES,
} from "@/utils/schema";
import { db } from "@/utils";
import { calculateAcademicPercentage } from "@/lib/calculateAcademicPercentage";

// Fetch user education data and format for prompts
export const getUserEducationPromptData = async ( userId ) => {
    console.log("user id inthe get user Eduation", userId)
  try {
    // Get education stage
    const educationStageData = await db
      .select()
      .from(USER_EDUCATION_STAGE)
      .where(eq(USER_EDUCATION_STAGE.user_id, userId));
    
    if (!educationStageData.length) {
      return {
        educationLevel: null,
        educationData: null,
        promptSegment: ""
      };
    }
    
    const educationStage = educationStageData[0].stage;
    
    // Get user details for academic year info
    const userDetails = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId));
    
    const academicYearStart = userDetails[0]?.academicYearStart;
    const academicYearEnd = userDetails[0]?.academicYearEnd;
    const percentageCompleted = calculateAcademicPercentage(academicYearStart, academicYearEnd);
    const className = userDetails[0]?.class_name || "completed";
    
    let educationData = null;
    let workData = null;
    let skillsData = null;
    
    // Fetch education data based on stage
    if (educationStage === "school") {
      educationData = await db
        .select()
        .from(SCHOOL_EDUCATION)
        .where(eq(SCHOOL_EDUCATION.user_id, userId));
    } else if (educationStage === "college") {
      educationData = await db
        .select()
        .from(COLLEGE_EDUCATION)
        .where(eq(COLLEGE_EDUCATION.user_id, userId));
    } else if (educationStage === "completed_education") {
      educationData = await db
        .select()
        .from(COMPLETED_EDUCATION)
        .where(eq(COMPLETED_EDUCATION.user_id, userId));
      
      // For completed education, also get work experience and skills
      workData = await db
        .select()
        .from(WORK_EXPERIENCE)
        .where(eq(WORK_EXPERIENCE.user_id, userId));
      
      skillsData = await db
        .select()
        .from(USER_SKILLS)
        .where(eq(USER_SKILLS.user_id, userId));
    }

    // Fetch user preference from career_preferences table
    const userPreferences = await db
    .select()
    .from(CAREER_PREFERENCES)
    .where(eq(CAREER_PREFERENCES.userId, userId));

    let preferenceType = null;

    if (userPreferences.length) {
      const prefs = userPreferences[0];

      if (educationStage === "school") {
        preferenceType = prefs.schoolPref;
      } else if (educationStage === "college") {
        preferenceType = prefs.collegePref;
      }  else if (educationStage === "completed_education") {
            if (workData && workData.length === 0) {
                preferenceType = prefs.noJobPref; // New preference for no job case
            } else {
                preferenceType = prefs.completedPref;
            }
      }
    }
    
    // Create prompt segment based on education stage and preference type
    let promptSegment = "";
    
    // Generate prompt segment based on education stage, data, and preference type
    promptSegment = generatePromptSegment(
      educationStage, 
      educationData, 
      workData, 
      skillsData, 
      preferenceType,
      className,
      percentageCompleted
    );
    
    return {
      educationLevel: educationStage,
      educationData,
      workData,
      skillsData,
      className,
      percentageCompleted,
      promptSegment
    };
  } catch (error) {
    console.error("Error fetching user education data:", error);
    return {
      educationLevel: null,
      educationData: null,
      promptSegment: ""
    };
  }
};

// Generate education-specific prompt segment
const generatePromptSegment = (
  educationStage, 
  educationData, 
  workData, 
  skillsData, 
  preferenceType,
  className,
  percentageCompleted
) => {
  if (!educationData || educationData.length === 0) {
    console.log("in segement returen")
    return "";
  }
  
  // Base prompt segment for any academic context
  const academicContext = (educationStage === 'school' || educationStage === 'college') 
    ? ` in ${className} with ${percentageCompleted}% of the academic year completed` 
    : '';
  

// School-specific prompt
if (educationStage === "school") {
    const isHigherSecondary = educationData[0]?.is_higher_secondary;
    const mainSubject = isHigherSecondary ? educationData[0]?.main_subject : null; // Only include for higher secondary
    const description = educationData[0]?.description; // User-provided information
    
    if (preferenceType === "subject_based") {
      return `using the education for a student in school${academicContext}${isHigherSecondary ? ` in higher secondary focused on ${mainSubject}` : ""}${description ? ` (additional information provided: ${description})` : ""}.`;
    } else if (preferenceType === "mixed") {
      return `using the education and their Career-Personality Assessment for a student in school${academicContext}${isHigherSecondary ? ` in higher secondary with background in ${mainSubject}` : ""}${description ? ` (user-provided details: ${description})` : ""}.`;
    } else {
      // interests_only - no need to mention subject
      return `based on their Career-Personality Assessment for a student in school ${description ? ` (user-provided details: ${description})` : ""}.`;
    }
  }
  
  // College-specific prompt
  else if (educationStage === "college") {
    console.log("in college")
    const formattedEducation = educationData.map(ed => {
      return `${ed.degree} in ${ed.field}${ed.year_of_study ? ` (Year ${ed.year_of_study})` : ""}${ed.is_completed ? " (Completed)" : ""}`;
    }).join(", ");
    
    const additionalDetails = educationData.filter(ed => ed.description).map(ed => ed.description).join(", ");
    
    if (preferenceType === "education_based") {
      return `based on the education they have for a college student${academicContext} pursuing ${formattedEducation}${additionalDetails ? ` (user-provided details: ${additionalDetails})` : ""}.`;
    } else if (preferenceType === "mixed") {
        console.log("in college mixed")

      return `based on the education they have and their Career-Personality Assessment for a college student${academicContext} with academic background in ${formattedEducation}${additionalDetails ? ` (user-provided details: ${additionalDetails})` : ""}.`;
    } else {
      // interests_only
      return `based on their Career-Personality Assessment for a college student ${additionalDetails ? ` (user-provided details: ${additionalDetails})` : ""}.`;
    }
  }
  
  // Completed education prompt
  else if (educationStage === "completed_education") {
    const formattedEducation = educationData.map(ed => {
      return `${ed.degree} in ${ed.field}`;
    }).join(", ");
    
    const additionalDetails = educationData.filter(ed => ed.description).map(ed => ed.description).join(", ");
    
    let workExperience = "";
    if (workData && workData.length > 0) {
      workExperience = workData.map(work => {
        return `${work.job_title} (${work.years_of_experience} year${work.years_of_experience === 1 ? "" : "s"})`;
      }).join(", ");
    }
    
    let skills = "";
    if (skillsData && skillsData.length > 0) {
      skills = skillsData.map(skill => skill.skill_name).join(", ");
    }

    // If the user has no job, check for the type of career suggestions they want
    if (!workExperience) {
        if (preferenceType === "education_based") {
            return `based on the education they have for a professional with educational background in ${formattedEducation}${additionalDetails ? ` (user-provided details: ${additionalDetails})` : ""}.`;
        } else if (preferenceType === "mixed_all") {
            return`based on the education and their Career-Personality Assessmen for a professional with educational background in ${formattedEducation} ${additionalDetails ? ` (user-provided details: ${additionalDetails})` : ""}.`;
        }
        else {
            // interests_only
            return `based on their Career-Personality Assessment for a professional ${additionalDetails ? ` (user-provided details: ${additionalDetails})` : ""}.`;
        }
    }
    
    if (preferenceType === "education_based") {
      return `based on the education they have for a professional with educational background in ${formattedEducation}${additionalDetails ? ` (user-provided details: ${additionalDetails})` : ""}.`;
    } else if (preferenceType === "job_based" && workExperience) {
      return `based on the job they are doing for a professional working as ${workExperience}${skills ? ` with skills in ${skills}` : ""}.`;
    } else if (preferenceType === "mixed_all") {
      let segment = `based on the education,job and their Career-Personality Assessment for a professional with educational background in ${formattedEducation}`;
      if (workExperience) segment += ` and work experience as ${workExperience}`;
      if (skills) segment += ` with skills in ${skills}`;
      if (additionalDetails) segment += ` (user-provided details: ${additionalDetails})`;
      return segment + ".";
    } else {
      // interests_only
      return `based on their Career-Personality Assessment for a professional ${additionalDetails ? ` (user-provided details: ${additionalDetails})` : ""}.`;
    }
  }
  
  return "";
};

// Helper to generate a complete prompt with education context
export const enhancePromptWithEducation = (basePrompt, educationData) => {
  if (!educationData || !educationData.promptSegment) {

    console.log("educationData", educationData, "educationData.promptSegment", educationData.promptSegment)

    console.log("in enhancePromptWithEducation returen")

    return basePrompt;
  }

  console.log("after tye enhance ")
  
  // This will replace any placeholder text in the prompt or add the education context where appropriate
  const enhancedPrompt = basePrompt.replace(
    /for an individual/g, 
    `for an individual ${educationData.promptSegment}`
  );
  
  return enhancedPrompt;
};