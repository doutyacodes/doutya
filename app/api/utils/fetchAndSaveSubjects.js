import { getCurrentWeekOfAge } from "@/lib/getCurrentWeekOfAge";
import { db } from "@/utils";
import { CAREER_SUBJECTS, SUBJECTS, GENERATION_STATUS } from "@/utils/schema";
import axios from "axios";
import { and, eq, inArray } from "drizzle-orm";
import { generateSubjectsPrompt } from "../services/promptService";
import crypto from 'crypto';

export const maxDuration = 300;
export const dynamic = "force-dynamic";

// Helper function to generate unique key hash for subject generation
const generateKeyHash = (scopeId, scopeType, className, country, type1, type2) => {
    const keyString = `${scopeId}-${scopeType}-${className}-${country}-${type1 || ''}-${type2 || ''}`;
    return crypto.createHash('sha256').update(keyString).digest('hex');
};

// Function to fetch subjects from OpenAI with scope type support
const fetchSubjectsFromOpenAI = async (userId, scopeName, country, birthDate, type1, type2, scopeType, className,sectorDescription) => {
  console.log(`${scopeType}: ${scopeName}, country: ${country}, scopeType: ${scopeType} , className:${className}`);

  const currentAgeWeek = getCurrentWeekOfAge(birthDate);
  const prompt = await generateSubjectsPrompt(
    userId, scopeName, country, currentAgeWeek, scopeType, className,sectorDescription
  );
  console.log("prompt", prompt);
  
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
    console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
    console.log(`Total tokens Subjects: ${response.data.usage.total_tokens}`);

    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/```json|```/g, "").trim();
    console.log("responseText:", responseText);

    const subjectsByAge = JSON.parse(responseText);

    console.log("Parsed subjects by age:", subjectsByAge);
    return subjectsByAge;
  } catch (error) {
    console.error("Error fetching subjects from OpenAI:", error);
    throw error;
  }
};

const saveSubjectsToDatabase = async (scopeId, subjectsByAge, className, scopeType) => {
    try {
      console.log("in try", scopeId, subjectsByAge, className, scopeType);
      const subjectIds = new Map();
  
      for (const [ageGroup, subjects] of Object.entries(subjectsByAge)) {
  
        const subjectList = Array.isArray(subjects) ? subjects : [subjects];
  
        // Fetch existing subjects for the given age range
        const existingSubjects = await db
          .select({
            subject_name: SUBJECTS.subject_name,
            subject_id: SUBJECTS.subject_id,
          })
          .from(SUBJECTS)
          .where(
            and(
              inArray(SUBJECTS.subject_name, subjectList),
              eq(SUBJECTS.class_name, className),
            )
          );

          console.log("existingSubjects", existingSubjects);
  
        const existingSubjectNames = new Set(
          existingSubjects.map((subject) => subject.subject_name)
        );
        const existingSubjectMap = new Map(
          existingSubjects.map((subject) => [
            subject.subject_name,
            subject.subject_id,
          ])
        );
  
        const newSubjects = subjectList.filter(
          (subject) => !existingSubjectNames.has(subject)
        );
  
        // Insert new subjects and await insertion
        if (newSubjects.length > 0) {
          await db
            .insert(SUBJECTS)
            .values(
              newSubjects.map((subject) => ({
                subject_name: subject,
                class_name: className
              }))
            )
            .execute();
        }
  
        // Fetch IDs for all subjects (both new and existing)
        const allSubjectNames = [...existingSubjectNames, ...newSubjects];
  
        const ids = await db
          .select({
            subject_name: SUBJECTS.subject_name,
            subject_id: SUBJECTS.subject_id,
          })
          .from(SUBJECTS)
          .where(
            and(
              inArray(SUBJECTS.subject_name, allSubjectNames),
              eq(SUBJECTS.class_name, className),
            )
          )
          .execute();
  
        ids.forEach((subject) => {
          subjectIds.set(subject.subject_name, subject.subject_id);
        });
  
        // Insert the relationships between scope and subjects using the new schema
        const scopeSubjectPromises = subjectList.map((subject) => {
          const subjectId = subjectIds.get(subject);
          return db
            .insert(CAREER_SUBJECTS)
            .values({
              scope_id: scopeId,
              scope_type: scopeType,
              subject_id: subjectId,
            })
            .execute();
        });
  
        await Promise.all(scopeSubjectPromises);
      }
  
      console.log(`${scopeType} subjects and their relationships saved successfully.`);
    } catch (error) {
      console.error(`Error saving ${scopeType} subjects to database:`, error);
      throw error;
    }
  };
  
  // Main function to fetch and save subjects with scope type support and generation status handling
  export const processCareerSubjects = async (
    userId,
    scopeName,
    scopeId,
    country,
    birthDate,
    className,
    type1, 
    type2,
    scopeType = "career",
    sectorDescription = null,
    keyHash = null // Optional parameter to pass keyHash from calling function
  ) => {
  try {
    // Generate keyHash if not provided
    if (!keyHash) {
      keyHash = generateKeyHash(scopeId, scopeType, className, country, type1, type2);
    }

    console.log(`Starting subject generation for keyHash: ${keyHash}`);
    
    const subjectsByAge = await fetchSubjectsFromOpenAI(
      userId,
      scopeName,
      country,
      birthDate,
      type1,
      type2,
      scopeType,
      className,
      sectorDescription
    );
    
    const subjects = subjectsByAge["subject-data"];
    await saveSubjectsToDatabase(scopeId, subjects, className, scopeType);
    
    console.log(`Subject generation completed successfully for keyHash: ${keyHash}`);
    
  } catch (error) {
    console.error(`Error processing ${scopeType} subjects for keyHash: ${keyHash}:`, error);
    
  // If keyHash is provided, update the generation status to failed
  if (keyHash) {
    try {
      await db
        .update(GENERATION_STATUS)
        .set({ status: 'failed' })
        .where(
          and(
            eq(GENERATION_STATUS.key_hash, keyHash),
            eq(GENERATION_STATUS.generation_type, 'subject')
          )
        );
      
      console.log(`Updated generation status to failed for keyHash: ${keyHash}`);
    } catch (updateError) {
      console.error(`Failed to update generation status for keyHash: ${keyHash}:`, updateError);
    }
  }
    
    throw error;
  }
};