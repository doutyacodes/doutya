import { NextResponse } from "next/server";
import { db } from "@/utils";
import { eq } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { handleCareerData } from "../utils/handleCareerData";
import { QUIZ_SEQUENCES, USER_DETAILS } from "@/utils/schema";
import { calculateAge } from "@/lib/ageCalculate";
import axios from "axios";

export const maxDuration = 40; // This function can run for a maximum of 5 seconds
export const dynamic = 'force-dynamic';

export async function POST(req) {

    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
        }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const data = await req.json(); 
    const {results} = data

    try {

         // Fetch user details to get the country
         const userDetails = await db
            .select()
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId))
            .execute();

        if (userDetails.length === 0) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 } // Not Found
            );
        }

        const country = userDetails[0].country;
        // console.log("results", results);
        const education = userDetails[0].education;

        const birth_date = userDetails[0].birth_date
        const age = calculateAge(birth_date)  

        // console.log("Real age", rage);
        // const age = 8

        const personalityTypes = await db.select({
            typeSequence: QUIZ_SEQUENCES.type_sequence,
            quizId : QUIZ_SEQUENCES.quiz_id
            }).from(QUIZ_SEQUENCES) 
            .where(eq(QUIZ_SEQUENCES.user_id, userId))
            .execute();
      
        const type1 = personalityTypes.find(pt => pt.quizId === 1)?.typeSequence;
        const type2 = personalityTypes.find(pt => pt.quizId === 2)?.typeSequence;
    
        console.log(type1,type2)

        // Array to store the updated results with roadmaps
        const updatedResults = [];

        // Loop over each career result and fetch the roadmap data
        for (const career of results) {
            console.log("career.career_name", career.career_name);
            
            const prompt = `Provide detailed information for the career named "${career.career_name}" in '${country}' based on the following criteria:

            - Personality Type: ${type1}
            - RIASEC Interest Types: ${type2}

            For this career, include the following information:

            - roadmap: Create a step-by-step roadmap containing academics, extracurricular activities, and other activities for a ${age}-year-old until the age of 20-year-old aspiring to be a ${career.career_name} and education level is '${education}' in ${country}. 
                The roadmap should be broken down into intervals of every **6 months**, starting from the initial age (${age}), and include the following types of milestones for each interval:
                Make sure to use the names exactly as provided and not to deviate from these names:
                1. Educational Milestones
                2. Physical Milestones
                3. Mental Milestones
                4. Certification Milestones

                Each of these milestone types should have **at least three milestones**. If you have more milestones, please include them as well. Each milestone should be separated with a '|' symbol. 

                Certification Milestones should include specific relevant certifications that are recognized in the field of ${career.career_name}. For example, certifications might include professional qualifications, licensure, or industry-recognized certifications that would enhance the individual's qualifications for this career.

                Ensure that the roadmap uses correct **half-year age intervals** (e.g., 6, 6.5, 7, 7.5, etc.) and that Certification Milestones are included and meaningful.

                The structure should follow this format for each age interval:
                {
                "age": <age>,
                "milestones": {
                    "Educational Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
                    "Physical Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
                    "Mental Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
                    "Certification Milestones": "<milestone1> | <milestone2> | <milestone3> | ..."
                }
                }

            Ensure that the response is valid JSON, using the specified field names.`;

            console.log("yhe prompt");
            

            // Send the prompt to OpenAI API
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

            let roadmapData = response.data.choices[0].message.content.trim();
            roadmapData = roadmapData.replace(/```json|```/g, "").trim();

            // Parse the roadmap data as JSON
            const roadmapJson = JSON.parse(roadmapData);

            // Merge the roadmap data with the career data
            const updatedCareer = {
                ...career,
                roadmap: roadmapJson
            };

            // Add the updated career data to the array
            updatedResults.push(updatedCareer);
        }
        
        // console.log("updatedResults", updatedResults)
        // console.log("updatedResults", JSON.stringify(updatedResults, null, 2));

        await handleCareerData(userId, country, updatedResults);
        return NextResponse.json({ message: 'Careers saved successfully' }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { message: error.message || "An unexpected error occurred" },
            { status: 500 } // Internal Server Error
        );
    }
}
