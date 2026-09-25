import axios from 'axios';
import { db } from "@/utils";
import {
    CERTIFICATIONS,
    CERTIFICATION_QUIZ,
    CERTIFICATION_QUIZ_OPTIONS,
    COURSE_WEEKS,
    TOPICS_COVERED,
    ASSIGNMENTS,
    LEARNING_OUTCOMES,
    COURSE_OVERVIEW
} from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
import { generateCourseTestPrompt } from '../services/promptService';

export async function GenerateCourse(
    userId,
    age,
    level,
    course,
    scopeName,
    courseId,
    birthDate,
    className,
    type1,
    type2,
    scopeType = 'career'
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
            scopeType
        );

        console.log("Generating course quiz prompt for scope:", scopeType, scopeName);

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

        console.log(`Input tokens Course generation: ${response.data?.usage?.prompt_tokens}`);
        console.log(`Output tokens Course generation: ${response.data?.usage?.completion_tokens}`);
        console.log(`Total tokens Course generation: ${response.data?.usage?.total_tokens}`);

        let responseText = response.data?.choices?.[0]?.message?.content?.trim() || "";
        responseText = responseText.replace(/^\`\`\`json\s*/i, "").replace(/^\`\`\`\s*/, "").replace(/\s*\`\`\`$/, "").trim();
        
        const firstBrace = responseText.indexOf('{');
        const lastBrace = responseText.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
            responseText = responseText.substring(firstBrace, lastBrace + 1);
        }

        let parsedData;
        try {
            parsedData = JSON.parse(responseText);
        } catch (error) {
            console.error("Failed to parse response data:", responseText);
            throw new Error("Failed to parse response data from AI");
        }

        // Insert topics covered
        if (parsedData.topics_covered && Array.isArray(parsedData.topics_covered)) {
            const existingTopics = await db
                .select({ id: TOPICS_COVERED.id })
                .from(TOPICS_COVERED)
                .where(eq(TOPICS_COVERED.certification_id, courseId))
                .limit(1);

            if (existingTopics.length === 0) {
                for (const topic of parsedData.topics_covered) {
                    if (!topic) continue;
                    await db.insert(TOPICS_COVERED).values({
                        certification_id: courseId,
                        topic_name: String(topic)
                    });
                }
            }
        }

        // Process quiz questions and options
        if (parsedData.final_quiz && Array.isArray(parsedData.final_quiz)) {
            for (const questionData of parsedData.final_quiz) {
                if (!questionData.question || !questionData.options) continue;

                // Insert question
                const questionInsert = await db.insert(CERTIFICATION_QUIZ).values({
                    question: questionData.question,
                    certification_id: courseId,
                    age: (age && !isNaN(age)) ? Number(age) : 18,
                    class_name: className || 'completed',
                    level: level || 'beginner'
                });

                const questionId = questionInsert[0].insertId;

                // Insert options for each question
                for (const option of questionData.options) {
                    if (!option || !option.text) continue;
                    await db.insert(CERTIFICATION_QUIZ_OPTIONS).values({
                        question_id: questionId,
                        option_text: option.text,
                        is_answer: option.is_answer === 'yes' ? 'yes' : 'no'
                    });
                }
            }
        }

        return { success: true, message: "Course generated and saved successfully" };

    } catch (error) {
        console.error("Error in GenerateCourse:", error?.response?.data || error.message);
        throw new Error(`Failed to generate course: ${error.message}`);
    }
}
