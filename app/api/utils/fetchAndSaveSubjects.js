// fetchAndSaveSubjects.js

import { db } from '@/utils';
import { CAREER_SUBJECTS, SUBJECTS } from '@/utils/schema';
import axios from 'axios';
import { and, eq, inArray } from 'drizzle-orm';


export const maxDuration = 60; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

// Function to fetch subjects from OpenAI
const fetchSubjectsFromOpenAI = async (careerName, country) => {
    console.log("careerName, country", careerName, country);
    
    const prompt = `For someone pursuing a career in ${careerName}, identify the 5 most fundamental academic subjects essential for building a solid foundation in this career. Consider the following age groups and provide the crucial subjects for each, based on the educational standards of ${country}:

                    1. Age Group 6-9
                    2. Age Group 10-13
                    3. Age Group 14-17 

                    Format the response as a JSON object where each age group is a key, and the value is an array of subjects that are important for that age group in ${country}. Only include subjects that can be effectively tested through multiple-choice questions (MCQs). For example:

                    {
                    "6-9": ["Subject1", "Subject2", "Subject3", "Subject4", "Subject5"],
                    "10-13": ["Subject1", "Subject2", "Subject3", "Subject4", "Subject5"],
                    "14-17": ["Subject1", "Subject2", "Subject3", "Subject4", "Subject5"]
                    }

                    Ensure that each array contains only the most relevant subjects for each respective age group, based on the career's requirements and the educational standards of ${country}. Specifically, include subjects that can be effectively assessed through MCQs, such as those related to theoretical knowledge, history, or basic concepts, and exclude practical or subjective areas where MCQs might not be suitable.`

    try {
    const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini", 
          messages: [{ role: "user", content: prompt }],
          max_tokens: 1500, // Adjust the token limit as needed
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );
  
        
        // Extract response text
        let responseText = response.data.choices[0].message.content.trim();
        responseText = responseText.replace(/```json|```/g, "").trim();
        console.log("responseText:", responseText);


        const subjectsByAge = JSON.parse(responseText);

        console.log("Parsed subjects by age:", subjectsByAge);
        return subjectsByAge;
      } catch (error) {
        console.error('Error fetching subjects from OpenAI:', error);
        throw error;
      }

};

const saveSubjectsToDatabase = async (careerId, subjectsByAge) => {
    try {
        const insertPromises = [];
        const subjectIds = new Map();

        for (const [ageGroup, subjects] of Object.entries(subjectsByAge)) {
            const minAge = parseInt(ageGroup.split('-')[0]);
            const maxAge = parseInt(ageGroup.split('-')[1]);
            console.log("min:", minAge, "max:", maxAge);
            const existingSubjects = await db
                                    .select({ subject_name: SUBJECTS.subject_name, subject_id: SUBJECTS.subject_id })
                                    .from(SUBJECTS)
                                    .where(
                                        and(
                                            inArray(SUBJECTS.subject_name, subjects),
                                            eq(SUBJECTS.min_age, minAge),
                                            eq(SUBJECTS.max_age, maxAge)
                                        )
                                    );   

            const existingSubjectNames = new Set(existingSubjects.map(subject => subject.subject_name));
            const existingSubjectMap = new Map(existingSubjects.map(subject => [subject.subject_name, subject.subject_id]));
            console.log("existingSubjectNames", existingSubjectNames);
            
            // Filter out subjects that already exist
            const newSubjects = subjects.filter(subject => !existingSubjectNames.has(subject));
            console.log("newSubjects", newSubjects);

            // Insert new subjects
            newSubjects.forEach(subject => {
                insertPromises.push(
                    db.insert(SUBJECTS).values({ subject_name: subject, min_age: minAge, max_age: maxAge }).execute()
                );
            });
            console.log('InsertPRom');

            // Await the insert promises
            await Promise.all(insertPromises);

            // Fetch IDs for all relevant subjects (existing + newly inserted)
            const allSubjectNames = [...existingSubjectNames, ...newSubjects];

            const ids = await db
                .select({ subject_name: SUBJECTS.subject_name, subject_id: SUBJECTS.subject_id })
                .from(SUBJECTS)
                .where(
                    and(
                        inArray(SUBJECTS.subject_name, allSubjectNames),
                        eq(SUBJECTS.min_age, minAge), // Filter by min_age
                        eq(SUBJECTS.max_age, maxAge)  // Filter by max_age
                    )
                )
                .execute();

            console.log('allSubjects');
            ids.forEach(subject => {
                subjectIds.set(subject.subject_name, subject.subject_id);
            });

            const careerSubjectPromises = subjects.map(subject => {
                const subjectId = subjectIds.get(subject);
                console.log(`Inserting career_id: ${careerId}, subject_id: ${subjectId}`);
                return db.insert(CAREER_SUBJECTS).values({
                    career_id: careerId,
                    subject_id: subjectId
                }).execute()
            });
            console.log('After CAreer Subject Pomise');
            await Promise.all(careerSubjectPromises);
        }

        console.log('Subjects and their relationships saved successfully.');
    } catch (error) {
        console.error('Error saving subjects to database:', error);
        throw error;
    }
};



// Main function to fetch and save subjects
export const processCareerSubjects = async (careerName, careerId, country) => {
    try {
        const subjects = await fetchSubjectsFromOpenAI(careerName, country);
        console.log("got subjexts");
        
        await saveSubjectsToDatabase(careerId, subjects);
    } catch (error) {
        console.error('Error processing career subjects:', error);
    }
};
