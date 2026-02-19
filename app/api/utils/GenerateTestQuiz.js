import axios from 'axios';
import { db } from "@/utils";
import { TESTS, TEST_QUESTIONS, TEST_ANSWERS, GENERATION_STATUS } from "@/utils/schema"; 
import { eq, and } from "drizzle-orm";
import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
import { generateSubjectsTestsPrompt } from '../services/promptService';
import { generateMCQs } from '@/utils/gemini';

export async function GenerateTestQuiz(userId, subjectId, subjectName, className, country, testKeyHash = null, scopeType, scopeName, sectorDescription, userStream) {
                                    //    userId, subjectId, subjectName, className, country, testKeyHash, scopeType
    try {
        console.log(`Starting test generation for subject: ${subjectName}, keyHash: ${testKeyHash}`);

        const prompt = await generateSubjectsTestsPrompt(
            userId, subjectName, className, country, scopeType,  scopeName, sectorDescription, userStream
        );

        console.log("prompt", prompt);

        // const response = await axios.post(
        //     "https://api.openai.com/v1/chat/completions",
        //     {
        //         model: "gpt-4.1-mini",
        //         messages: [{ role: "user", content: prompt }],
        //         max_tokens: 2500,
        //     },
        //     {
        //         headers: {
        //             Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        //             "Content-Type": "application/json",
        //         },
        //     }
        // );

         const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert educator who creates accurate, well-structured multiple-choice questions. For mathematical problems, you always solve them completely before creating options and ensure exactly one correct answer exists."
                    },
                    {
                        role: "user", 
                        content: prompt
                    }
                ],
                max_tokens: 4000, // Increased from 2500
                temperature: 0.3, // Lower temperature for more consistent mathematical accuracy
                top_p: 0.9,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        // Deepseek Test
        // const response = await axios.post(
        //     "https://api.deepseek.com/chat/completions",
        //     {
        //         model: "deepseek-chat",  // or "deepseek-chat, deepseek-reasoner"
        //         messages: [
        //         {
        //             role: "system",
        //             content: "You are an expert educator who creates accurate, well-structured multiple-choice questions. For mathematical problems, you always solve them completely before creating options and ensure exactly one correct answer exists."
        //         },
        //         {
        //             role: "user",
        //             content: prompt
        //         }
        //         ],
        //         max_tokens: 5000,
        //         temperature: 0.3,
        //         top_p: 0.9,
        //     },
        //     {
        //         headers: {
        //         Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
        //         "Content-Type": "application/json",
        //         },
        //     }
        // );

        // Gemini Test

        // const response = await axios.post(
        // "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
        // {
        //     contents: [
        //     {
        //         parts: [
        //         { text: "You are an expert educator who creates accurate, well-structured multiple-choice questions. For mathematical problems, you always solve them completely before creating options and ensure exactly one correct answer exists.\n\n" + prompt }
        //         ]
        //     }
        //     ]
        // },
        // {
        //     headers: {
        //     "Content-Type": "application/json",
        //     "X-goog-api-key": process.env.GEMINI_API_KEY,
        //     },
        // }
        // );
                

        console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
        console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
        console.log(`Total tokens Test quiz: ${response.data.usage.total_tokens}`);

        let responseText = response.data.choices[0].message.content.trim();
        responseText = responseText.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(responseText);

        /* gemini */

        // let responseText = response.data.candidates[0].content.parts[0].text.trim();
        // responseText = responseText.replace(/```json|```/g, "").trim();
        // const parsedData = JSON.parse(responseText);


        // const result = await generateMCQs(prompt);

        // let responseText = result.output.trim();  // now comes from result
        // responseText = responseText.replace(/```json|```/g, "").trim();
        // const parsedData = JSON.parse(responseText);


        // Setting these values as the Generated tests are basically only for the initial week of joining
        const currentYear = 1;
        const currentMonth = 1;
        const currentWeekNumber = 1; 

        // Step 2: Insert into TESTS table
        const [testResult] = await db.insert(TESTS).values({
            subject_id: subjectId,
            test_date: new Date(),
            year: currentYear,
            month: currentMonth,
            week_number: currentWeekNumber,
            class_name: className,
        }).execute();

        const testId = testResult.insertId;

        // Step 3: Insert questions and answers into TEST_QUESTIONS and TEST_ANSWERS
        for (const questionData of parsedData) {
            const [questionResult] = await db.insert(TEST_QUESTIONS).values({
                timer: 40, // 15 seconds for each question
                question: questionData.question,
                test_id: testId,
            }).execute();

            const questionId = questionResult.insertId;

            // Insert options as answers for each question
            for (const option of questionData.options) {
                await db.insert(TEST_ANSWERS).values({
                    test_questionId: questionId,
                    test_id: testId,
                    answer_text: option.text,
                    answer: option.is_answer === "yes" ? "yes" : "no",
                }).execute();
            }
        }

        console.log(`Test quiz generated and saved successfully for keyHash: ${testKeyHash}`);
        
    } catch (error) {
        console.error(`Error generating or saving test quiz for keyHash: ${testKeyHash}:`, error);
        
        // If testKeyHash is provided, update the generation status to failed
        if (testKeyHash) {
            try {
                await db
                    .update(GENERATION_STATUS)
                    .set({ status: 'failed' })
                    .where(
                        and(
                            eq(GENERATION_STATUS.key_hash, testKeyHash),
                            eq(GENERATION_STATUS.generation_type, 'test')
                        )
                    );
                
                console.log(`Updated test generation status to failed for keyHash: ${testKeyHash}`);
            } catch (updateError) {
                console.error(`Failed to update test generation status for keyHash: ${testKeyHash}:`, updateError);
            }
        }
        
        throw error;
    }
}