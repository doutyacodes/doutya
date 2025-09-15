import axios from 'axios';
import { db } from "@/utils"; // Ensure this path is correct
import {
    CERTIFICATIONS,
    CERTIFICATION_QUIZ,
    CERTIFICATION_QUIZ_OPTIONS,
    COURSE_WEEKS,
    TOPICS_COVERED,
    ASSIGNMENTS,
    LEARNING_OUTCOMES,
    COURSE_OVERVIEW
} from "@/utils/schema"; // Ensure this path is correct
import { and, eq } from "drizzle-orm";
import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
import { generateCourseTestPrompt } from '../services/promptService';

export async function GenerateCourse(
    userId, 
    age, 
    level, 
    course, 
    scopeName, // Changed from 'career' to the more generic 'scopeName'
    courseId, 
    birthDate, 
    className, 
    type1, 
    type2,
    scopeType = 'career' // Added scopeType parameter with default for backward compatibility
) {
    try {
        const currentAgeWeek = getCurrentWeekOfAge(birthDate);

        // Pass scopeType to the prompt generation function
        const prompt = await generateCourseTestPrompt(
            userId, 
            scopeName, 
            course, 
            type1, 
            type2, 
            age, 
            level, 
            currentAgeWeek,
            scopeType // Add scope type to prompt generation
        );

        console.log("prompt", prompt);
        
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini", 
                messages: [{ role: "user", content: prompt }],
                max_tokens: 5000,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        console.log(`Input tokens Course generation: ${response.data.usage.prompt_tokens}`);
        console.log(`Output tokens Course generation: ${response.data.usage.completion_tokens}`);
        console.log(`Total tokens Course generation: ${response.data.usage.total_tokens}`);
        
        let responseText = response.data.choices[0].message.content.trim();
        responseText = responseText.replace(/```json|```/g, "").trim();
        console.log("responseText", responseText);
        
        let parsedData;

        try {
            parsedData = JSON.parse(responseText);
        } catch (error) {
            throw new Error("Failed to parse response data");
        }

        console.log("parsedData", parsedData);

        // Insert topics covered in a single batch
        await Promise.all(
            parsedData.topics_covered.map(async (topic) => {
                await db.insert(TOPICS_COVERED).values({
                    certification_id: courseId,
                    topic_name: topic
                });
            })
        );

        // Process quiz questions and options
        for (const questionData of parsedData.final_quiz) {
            // Insert question
            const questionInsert = await db.insert(CERTIFICATION_QUIZ).values({
                question: questionData.question,
                certification_id: courseId,
                age: age,
                class_name: className,
                level: level
            });

            const questionId = questionInsert[0].insertId;

            // Insert options for each question
            await Promise.all(
                questionData.options.map(async (option) => {
                    await db.insert(CERTIFICATION_QUIZ_OPTIONS).values({
                        question_id: questionId,
                        option_text: option.text,
                        is_answer: option.is_answer
                    });
                })
            );
        }

        return { success: true, message: "Course generated and saved successfully" };

    } catch (error) {
        console.error("Error in GenerateCourse:", error);
        throw new Error(`Failed to generate course: ${error.message}`);
    }
}