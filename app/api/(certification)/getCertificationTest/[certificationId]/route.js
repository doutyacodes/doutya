import { db } from '@/utils';
import { CERTIFICATION_QUIZ, CERTIFICATION_QUIZ_OPTIONS, CERTIFICATION_USER_PROGRESS, CERTIFICATIONS, USER_CERTIFICATION_COMPLETION, USER_DETAILS, } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq, inArray, sql } from 'drizzle-orm'; // Ensure these imports match your ORM version
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import axios from 'axios';
import { formattedAge } from '@/lib/formattedAge';

export const maxDuration = 60; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {

    // Authenticate user
    const authResult = await authenticate(request);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const { certificationId } = params;
    
    if (!certificationId) {
        return NextResponse.json({ message: 'Invalid certificationId' }, { status: 400 });
    }

    try {

        const birthDateResult = await db
            .select({ birth_date: USER_DETAILS.birth_date })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));

        const birth_date = birthDateResult[0]?.birth_date;
        const age = formattedAge(birth_date);
        console.log("age", age);

        const certification = await db
            .select({ certificationName: CERTIFICATIONS.certification_name })
            .from(CERTIFICATIONS)
            .where(
                and(
                    eq(CERTIFICATIONS.id, certificationId),
                    eq(CERTIFICATIONS.id, certificationId),
                )
            );

         const certificationName = certification[0].certificationName
         console.log(certificationName)
        // Check if questions exist in the database for the given Certification Name and age
        const existingQuestions = await db
            .select({
                questionId: CERTIFICATION_QUIZ.id,
                question: CERTIFICATION_QUIZ.question,
                optionId: CERTIFICATION_QUIZ_OPTIONS.id,
                option_text: CERTIFICATION_QUIZ_OPTIONS.option_text,
                is_answer: CERTIFICATION_QUIZ_OPTIONS.is_answer,
            })
            .from(CERTIFICATION_QUIZ)
            .innerJoin(CERTIFICATION_QUIZ_OPTIONS, eq(CERTIFICATION_QUIZ.id, CERTIFICATION_QUIZ_OPTIONS.question_id))
            .where(
                and(
                    eq(CERTIFICATION_QUIZ.certification_id, certificationId),
                    eq(CERTIFICATION_QUIZ.age, age)
                )
            )

            let totalAnswered = 0;

            // Check if isStarted is true in the  table
            const checkProgress = await db
                                .select({
                                    isStarted: USER_CERTIFICATION_COMPLETION.isStarted
                                })
                                .from(USER_CERTIFICATION_COMPLETION)
                                .where(
                                    and(
                                        eq(USER_CERTIFICATION_COMPLETION.user_id, userId),
                                        eq(USER_CERTIFICATION_COMPLETION.certification_id, certificationId)
                                    )
                                )
                                .execute();

            // Proceed only if a progress exists and isStarted is true
            if (checkProgress.length > 0 && checkProgress[0].isStarted) { 
                // Geting the total no of saved quiz from CERTIFICATION_USER_PROGRESS if isStarted is true
                const totalQuestionsAnswered = await db
                .select({
                    countQuestionIds: sql`COUNT(${CERTIFICATION_USER_PROGRESS.quiz_id})`
                })
                .from(CERTIFICATION_USER_PROGRESS)
                .where(
                    and(
                        eq(CERTIFICATION_USER_PROGRESS.user_id, userId),
                        eq(CERTIFICATION_USER_PROGRESS.certification_id, certificationId)
                    )
                )
                .execute();

                // The total number of questions answered
                totalAnswered = totalQuestionsAnswered[0]?.countQuestionIds || 0;
            }


         // If existing questions are found, format them and return
         if (existingQuestions.length > 0) {

            const formattedQuestions = existingQuestions.reduce((acc, row) => {
                const {questionId, question, optionId, option_text, is_answer } = row;

                // Find or create a question entry in the accumulator
                let questionEntry = acc.find(q => q.question === question);
                if (!questionEntry) {
                    questionEntry = { id: questionId, question, options: [] };
                    acc.push(questionEntry);
                }

                // Push the option to the options array
                questionEntry.options.push({
                    id: optionId,
                    text: option_text,
                    is_answer: is_answer === "yes" ? "yes" : "no", // Ensure is_answer is correctly set
                });

                return acc;
            }, []);

            return NextResponse.json({quizProgress: totalAnswered, questions: formattedQuestions}, { status: 200 });
        }
        
        // const prompt = `
        //     Create exactly 20 unique multiple-choice questions for the certification course named ${certificationName} for a ${age} year old.
        //     Each question should have 4 answer options, and one option should be marked as the correct answer using "is_answer": "yes" for the correct option and "is_answer": "no" for the others. Ensure that no questions and options are repeated, and the questions are appropriate for the age ${age}.
        //     Return all questions in a single array with no additional commentary or difficulty labels. The format for each question should be:

        //     {
        //         "question": "Question text here",
        //         "options": [
        //             { "text": "Option 1", "is_answer": "no" },
        //             { "text": "Option 2", "is_answer": "yes" },
        //             { "text": "Option 3", "is_answer": "no" },
        //             { "text": "Option 4", "is_answer": "no" }
        //         ]
        //     }

        //     Ensure the array contains exactly 20 questions.
        //     Only return the array of 20 questions, nothing else.
        // `;

        const prompt = `
            Create exactly 20 unique multiple-choice questions for the certification course named "${certificationName}" aimed at a ${age}-year-old.
            Each question must be unique, appropriate for a ${age}-year-old, and related to the course topic, "${certificationName}."
            For each question, provide exactly 4 answer options. One option must be marked as the correct answer using "is_answer": "yes" and the others should be marked with "is_answer": "no."
            Return all questions in a single JSON array, with each question following this format:
            
            {
                "question": "Your question text",
                "options": [
                    { "text": "Option 1", "is_answer": "no" },
                    { "text": "Option 2", "is_answer": "yes" },
                    { "text": "Option 3", "is_answer": "no" },
                    { "text": "Option 4", "is_answer": "no" }
                ]
            }
            
            Make sure there are exactly 20 questions, no more and no less, and that none of the questions or answer options are repeated.
            Return only the array of 20 questions, with no additional text or commentary.
            `;
            


              const response = await axios.post(
                "https://api.openai.com/v1/chat/completions",
                {
                  model: "gpt-4o-mini",
                  messages: [{ role: "user", content: prompt }],
                  max_tokens: 3000,
                },
                {
                  headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                  },
                }
              );
              console.log("response.data",response.data);
              let responseText = response.data.choices[0].message.content.trim();
              responseText = responseText.replace(/```json|```/g, "").trim();
              console.log("responseText",responseText);
              const parsedData = JSON.parse(responseText);
              console.log("Total Questioins: ", parsedData.length);
              
            // Save questions and options to the database
            const questionIds = [];
            const questionsWithOptions = []; // Array to store questions with their options

            for (const questionData of parsedData) {
                // Insert question into CERTIFICATION_QUIZ
                const questionInsert = await db.insert(CERTIFICATION_QUIZ).values({
                    question: questionData.question,
                    certification_id: certificationId, 
                    age: age
                });
            
                const questionId = questionInsert[0].insertId; // Adjust this according to your ORM's way of retrieving last insert ID
                questionIds.push(questionId); // Store the question ID for future reference
            
                const optionsArray = []; // Array to store options for the current question
            
                for (const option of questionData.options) {
                    // Insert options into CERTIFICATION_QUIZ_OPTIONS
                    const optionInsert = await db.insert(CERTIFICATION_QUIZ_OPTIONS).values({
                        question_id: questionId,
                        option_text: option.text,
                        is_answer: option.is_answer, // Convert to boolean
                    });
            
                    const optionId = optionInsert[0].insertId;
                    optionsArray.push({
                        id: optionId,
                        text: option.text,
                        is_answer: option.is_answer, 
                    });
                }
            
                // Push the question with its options to the main array
                questionsWithOptions.push({
                    id: questionId,
                    question: questionData.question,
                    options: optionsArray,
                });
            }
            
            // Prepare the response with quiz progress and questions
            return NextResponse.json({
                quizProgress: totalAnswered,
                questions: questionsWithOptions, // Return the questions with options
            }, { status: 200 });

    } catch (error) {
        console.error("Error fetching questions and answers:", error);
        return NextResponse.json({ message: 'Error fetching questions and answers' }, { status: 500 });
    }
}