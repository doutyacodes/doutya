// import axios from 'axios';
// import { db } from "@/utils";
// import { TESTS, TEST_QUESTIONS, TEST_ANSWERS } from "@/utils/schema"; 
// import { eq } from "drizzle-orm";
// import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
// import { generateSubjectsTestsPrompt } from '../services/promptService';

// export async function GenerateTestQuiz(userId, subjectId, subjectName, age, birthDate, className, type1, type2, country ) {
//     try {

//         const currentAgeWeek = getCurrentWeekOfAge(birthDate)

//           const prompt = await generateSubjectsTestsPrompt(
//             userId, age, subjectName, type1, type2, currentAgeWeek, className, country
//           );

//         console.log("prompt", prompt);
          

//         const response = await axios.post(
//             "https://api.openai.com/v1/chat/completions",
//             {
//                 model: "gpt-4o-mini", // Update model if needed
//                 messages: [{ role: "user", content: prompt }],
//                 max_tokens: 2500,
//             },
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//                     "Content-Type": "application/json",
//                 },
//             }
//         );

//         console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
//         console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
//         console.log(`Total tokens Test quiz: ${response.data.usage.total_tokens}`);

//         let responseText = response.data.choices[0].message.content.trim();
//         responseText = responseText.replace(/```json|```/g, "").trim();
//         const parsedData = JSON.parse(responseText);

//         // Step 2: Insert into TESTS table
//         // const currentYear = new Date().getFullYear();
//         // const currentMonth = new Date().getMonth() + 1;

//         /* Setting these below values as the Generated tests are basically only for te initial week of joining  */
//         const currentYear = 1;
//         const currentMonth = 1;
//         const currentWeekNumber = 1; 

//         const [testResult] = await db.insert(TESTS).values({
//             subject_id: subjectId,
//             test_date: new Date(),
//             age_group: age,
//             year: currentYear,
//             month: currentMonth,
//             week_number: currentWeekNumber,
//             class_name: className,
//         }).execute();

//         const testId = testResult.insertId;

//         // Step 3: Insert questions and answers into TEST_QUESTIONS and TEST_ANSWERS
//         for (const questionData of parsedData) {
//             const [questionResult] = await db.insert(TEST_QUESTIONS).values({
//                 timer: 40, // 15 seconds for each question
//                 question: questionData.question,
//                 test_id: testId,
//             }).execute();

//             const questionId = questionResult.insertId;

//             // Insert options as answers for each question
//             for (const option of questionData.options) {
//                 await db.insert(TEST_ANSWERS).values({
//                     test_questionId: questionId,
//                     test_id: testId,
//                     answer_text: option.text,
//                     answer: option.is_answer === "yes" ? "yes" : "no",
//                 }).execute();
//             }
//         }

//         console.log("Test quiz generated and saved successfully.");
//     } catch (error) {
//         console.error("Error generating or saving test quiz:", error);
//         throw error;
//     }
// }

import axios from 'axios';
import { db } from "@/utils";
import { TESTS, TEST_QUESTIONS, TEST_ANSWERS, SUBJECT_GENERATION_STATUS } from "@/utils/schema"; 
import { eq } from "drizzle-orm";
import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
import { generateSubjectsTestsPrompt } from '../services/promptService';

export async function GenerateTestQuiz(userId, subjectId, subjectName, age, birthDate, className, type1, type2, country, testKeyHash = null) {
    try {
        console.log(`Starting test generation for subject: ${subjectName}, keyHash: ${testKeyHash}`);

        const currentAgeWeek = getCurrentWeekOfAge(birthDate);

        const prompt = await generateSubjectsTestsPrompt(
            userId, age, subjectName, type1, type2, currentAgeWeek, className, country
        );

        console.log("prompt", prompt);

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 2500,
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
        console.log(`Total tokens Test quiz: ${response.data.usage.total_tokens}`);

        let responseText = response.data.choices[0].message.content.trim();
        responseText = responseText.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(responseText);

        // Setting these values as the Generated tests are basically only for the initial week of joining
        const currentYear = 1;
        const currentMonth = 1;
        const currentWeekNumber = 1; 

        // Step 2: Insert into TESTS table
        const [testResult] = await db.insert(TESTS).values({
            subject_id: subjectId,
            test_date: new Date(),
            age_group: age,
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
                    .update(SUBJECT_GENERATION_STATUS)
                    .set({ status: 'failed' })
                    .where(eq(SUBJECT_GENERATION_STATUS.key_hash, testKeyHash));
                
                console.log(`Updated test generation status to failed for keyHash: ${testKeyHash}`);
            } catch (updateError) {
                console.error(`Failed to update test generation status for keyHash: ${testKeyHash}:`, updateError);
            }
        }
        
        throw error;
    }
}