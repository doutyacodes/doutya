import axios from 'axios';
import { db } from "@/utils";
import { TESTS, TEST_QUESTIONS, TEST_ANSWERS } from "@/utils/schema"; // Ensure this path is correct
import { eq } from "drizzle-orm";
import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';

export async function GenerateTestQuiz(subjectId, subjectName, age, birthDate) {
    try {
        const currentAgeWeek = getCurrentWeekOfAge(birthDate)
        // Step 1: Generate questions using OpenAI API
        const prompt = `
            Create 10 multiple-choice questions in ${subjectName} for a ${age} year old (currently in week ${currentAgeWeek} of this age).
            Each question should have 4 answer options, and one option should be marked as the correct answer using "is_answer": "yes" for the correct option and "is_answer": "no" for the others.Make sure no questions and the options being repeated and the questions must be apt for the age ${age}. The questions should be unique and difficulty level should be hard.  
            Return all questions in a single array with no additional commentary or difficulty labels. The format for each question should be:

            {
            "question": "Question text here",
            "options": [
                { "text": "Option 1", "is_answer": "no" },
                { "text": "Option 2", "is_answer": "yes" },
                { "text": "Option 3", "is_answer": "no" },
                { "text": "Option 4", "is_answer": "no" }
            ]
            }

            Only return the array of 10 questions, nothing else.
            `;

        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini", // Update model if needed
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

        let responseText = response.data.choices[0].message.content.trim();
        responseText = responseText.replace(/```json|```/g, "").trim();
        const parsedData = JSON.parse(responseText);

        // Step 2: Insert into TESTS table
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const currentWeekNumber = 1;

        const [testResult] = await db.insert(TESTS).values({
            subject_id: subjectId,
            test_date: new Date(),
            age_group: age,
            year: currentYear,
            month: currentMonth,
            week_number: currentWeekNumber,
        }).execute();

        const testId = testResult.insertId;

        // Step 3: Insert questions and answers into TEST_QUESTIONS and TEST_ANSWERS
        for (const questionData of parsedData) {
            const [questionResult] = await db.insert(TEST_QUESTIONS).values({
                timer: 15, // 15 seconds for each question
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

        console.log("Test quiz generated and saved successfully.");
    } catch (error) {
        console.error("Error generating or saving test quiz:", error);
        throw error;
    }
}
