import { z } from "zod";

export const educationProfileSchema = z.object({
  educationStage: z.enum(["school", "college", "completed_education"]),
  
  // School-specific fields
  isHigherSecondary: z.boolean().optional(),
  mainSubject: z.string().optional(),
  schoolDescription: z.string().optional(),
  schoolPreference: z.enum(["subject_based", "personality_based", "mixed"]).optional(),
  
  // College-specific fields
  degrees: z.array(
    z.object({
      degree: z.string().min(1, "Degree is required"),
      field: z.string().min(1, "Field is required"),
      yearOfStudy: z.string().optional(),
      isCompleted: z.boolean().optional()
    })
  ).optional(),
  collegeDescription: z.string().optional(),
  collegePreference: z.enum(["education_based", "personality_based", "mixed"]).optional(),
  
  // Completed education fields
  completedDegrees: z.array(
    z.object({
      degree: z.string().min(1, "Degree is required"),
      field: z.string().min(1, "Field is required"),
    })
  ).optional(),
  completedDescription: z.string().optional(),
  
  // Work experience fields
  isCurrentlyWorking: z.boolean().optional(),
  jobs: z.array(
    z.object({
      jobTitle: z.string().min(1, "Job title is required"),
      yearsOfExperience: z.string().min(1, "Years of experience is required"),
    })
  ).optional(),
  
  // Skills fields
  skills: z.array(
    z.object({
      skillName: z.string().min(1, "Skill name is required"),
    })
  ).optional(),
  
  // Career preferences for completed education
  completedPreference: z.enum(["education_based", "job_based", "personality_based", "mixed_all"]).optional(),
  noJobPreference: z.enum(["education_based", "personality_based", "mixed"]).optional(),
}).refine(data => {
  // If school is selected, ensure school preference is provided
  if (data.educationStage === "school") {
    return !!data.schoolPreference;
  }
  return true;
}, {
  message: "School preference is required when school is selected",
  path: ["schoolPreference"]
}).refine(data => {
  // If college is selected, ensure college preference is provided
  if (data.educationStage === "college") {
    return !!data.collegePreference;
  }
  return true;
}, {
  message: "College preference is required when college is selected",
  path: ["collegePreference"]
}).refine(data => {
  // If completed education is selected and user is currently working, ensure completed preference is provided
  if (data.educationStage === "completed_education" && data.isCurrentlyWorking) {
    return !!data.completedPreference;
  }
  return true;
}, {
  message: "Career preference is required",
  path: ["completedPreference"]
}).refine(data => {
  // If completed education is selected and user is not currently working, ensure no job preference is provided
  if (data.educationStage === "completed_education" && !data.isCurrentlyWorking) {
    return !!data.noJobPreference;
  }
  return true;
}, {
  message: "Career preference is required",
  path: ["noJobPreference"]
}).refine(data => {
  // If higher secondary is selected, ensure main subject is provided
  if (data.educationStage === "school" && data.isHigherSecondary) {
    return !!data.mainSubject;
  }
  return true;
}, {
  message: "Main subject is required for higher secondary students",
  path: ["mainSubject"]
});