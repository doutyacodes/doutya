import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { QUIZ_SEQUENCES, USER_CAREER,USER_DETAILS } from '@/utils/schema';
import { eq,and } from 'drizzle-orm';
import { db } from '@/utils';
import axios from 'axios';
import { validateCareer } from './validateCareer';
import { handleCareerData } from '../utils/handleCareerData';
import { calculateAge } from '@/lib/ageCalculate';

export async function POST(req)
{
  console.log('got')
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
      }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;

    const user_data = await db
                      .select({
                        birth_date:USER_DETAILS.birth_date,
                        education: USER_DETAILS.education
                      })
                      .from(USER_DETAILS)
                      .where(eq(USER_DETAILS.id, userId))

    const birth_date=user_data[0].birth_date
    const age=calculateAge(birth_date)   
    console.log("calculateAge", age) 
    // const age = 6
    const education=user_data[0].education
    const { career,country} = await req.json();
    console.log(career,country)
    // Call the validation function
    try {
      const validationResult = await validateCareer(career);

      if (!validationResult.isValid) {        
          return NextResponse.json({ message: validationResult.message }, { status: 400 });
      }

      // console.log("Career description:", validationResult.description);

    } catch (error) {
        return NextResponse.json({ message: error.message || "An unexpected error occurred" }, { status: 500 });
    }
      

    const personalityTypes = await db.select({
        typeSequence: QUIZ_SEQUENCES.type_sequence,
        quizId : QUIZ_SEQUENCES.quiz_id
        }).from(QUIZ_SEQUENCES) 
        .where(eq(QUIZ_SEQUENCES.user_id, userId))
        .execute();
  
    const type1 = personalityTypes.find(pt => pt.quizId === 1)?.typeSequence;
    const type2 = personalityTypes.find(pt => pt.quizId === 2)?.typeSequence;

    console.log(type1,type2)

   
    // const prompt = `Provide detailed information for the career named "${career}" in '${country}' based on the following criteria:

    // - Personality Type: ${type1}
    // - RIASEC Interest Types: ${type2}
    
    // For this career, include the following information:
    // - career_name: A brief title of the career.
    // - reason_for_recommendation: Why this career is suitable for someone with these interests.
    // - present_trends: Current trends and opportunities in the field.
    // - future_prospects: Predictions and potential growth in this career.
    // - user_description: A narrative description of the personality traits, strengths, and preferences of the user that make this career a good fit, written in full text format.
    // - roadmap: Create a step-by-step roadmap containing academics, extracurricular activities, and other activities for a ${age}-year-old until the age of 20-year-old aspiring to be a ${career} and education level is '${education}' in ${country}. 
    
    // The roadmap should be broken down into intervals of every **6 months**, starting from the initial age (${age}), and include the following types of milestones for each interval:
    // Make sure to use the names exactly as provided and not to deviate from these names:
    //   1. Educational Milestones
    //   2. Physical Milestones
    //   3. Mental Milestones
    //   4. Certification Milestones
    
    // Ensure that for each 6-month period, **each type** has at least one milestone, including **Certification Milestones**. 
    // For each milestone, provide:
    // - age: The numeric age value (e.g., 6, 6.5, 7, 7.5).
    // - milestones: An object containing:
    //   - Title: A short title of the milestone.
    //   - Description: A brief description of the milestone.
    //   - HowTo: Instructions or guidance on how to achieve the milestone.
    
    // Ensure the roadmap uses correct **half-year age intervals** (e.g., 6, 6.5, 7, 7.5, etc.) and that Certification Milestones are included and meaningful.
    
    // Ensure that the response is valid JSON, using the specified field names, but do not include the terms '${type1}' or 'RIASEC' in the data.
    // `;
    
    // const prompt = `Provide detailed information for the career named "${career}" in '${country}' based on the following criteria:

    // - Personality Type: ${type1}
    // - RIASEC Interest Types: ${type2}

    // For this career, include the following information:
    // - career_name: A brief title of the career.
    // - reason_for_recommendation: Why this career is suitable for someone with these interests.
    // - present_trends: Current trends and opportunities in the field.
    // - future_prospects: Predictions and potential growth in this career.
    // - user_description: A narrative description of the personality traits, strengths, and preferences of the user that make this career a good fit, written in full text format.
    // - roadmap: Create a step-by-step roadmap containing academics, extracurricular activities, and other activities for a ${age}-year-old until the age of 20-year-old aspiring to be a ${career} and education level is '${education}' in ${country}. 

    // The roadmap should be broken down into intervals of every **6 months**, starting from the initial age (${age}), and include the following types of milestones for each interval:
    // Make sure to use the names exactly as provided and not to deviate from these names:
    //   1. Educational Milestones
    //   2. Physical Milestones
    //   3. Mental Milestones
    //   4. Certification Milestones

    // Each of these milestone types should have **at least three milestones**, and each milestone should be separated with a '|' symbol. 

    // Ensure that the roadmap uses correct **half-year age intervals** (e.g., 6, 6.5, 7, 7.5, etc.) and that Certification Milestones are included and meaningful.

    // The structure should follow this format for each age interval:
    // {
    //   "age": <age>,
    //   "milestones": {
    //     "Educational Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
    //     "Physical Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
    //     "Mental Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
    //     "Certification Milestones": "<milestone1> | <milestone2> | <milestone3> | ..."
    //   }
    // }

    // Ensure that the response is valid JSON, using the specified field names.`;

    const prompt = `Provide detailed information for the career named "${career}" in '${country}' based on the following criteria:

    - Personality Type: ${type1}
    - RIASEC Interest Types: ${type2}

    For this career, include the following information:
    - career_name: A brief title of the career.
    - reason_for_recommendation: Why this career is suitable for someone with these interests.
    - present_trends: Current trends and opportunities in the field.
    - future_prospects: Predictions and potential growth in this career.
    - user_description: A narrative description of the personality traits, strengths, and preferences of the user that make this career a good fit, written in full text format.
    - roadmap: Create a step-by-step roadmap containing academics, extracurricular activities, and other activities for a ${age}-year-old until the age of 20-year-old aspiring to be a ${career} and education level is '${education}' in ${country}. 

    The roadmap should be broken down into intervals of every **6 months**, starting from the initial age (${age}), and include the following types of milestones for each interval:
    Make sure to use the names exactly as provided and not to deviate from these names:
      1. Educational Milestones
      2. Physical Milestones
      3. Mental Milestones
      4. Certification Milestones

    Each of these milestone types should have **at least three milestones**. If you have more milestones, please include them as well. Each milestone should be separated with a '|' symbol. 

    Certification Milestones should include specific relevant certifications that are recognized in the field of ${career}. For example, certifications might include professional qualifications, licensure, or industry-recognized certifications that would enhance the individual's qualifications for this career.

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



    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/```json|```/g, "").trim();

    console.log("responseText", responseText)
    let parsedData;
    
    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      return NextResponse.json(
        { message: "Failed to parse response data" },
        { status: 400 }
      );
    }

    // console.log([parsedData])

    try {
      await handleCareerData(userId, country, [parsedData]);
      return NextResponse.json({ message: 'Careers saved successfully' }, { status: 201 });
    } catch (error) {
      console.log("error", error);
      
        return NextResponse.json(
            { message: error.message || "An unexpected error occurred" },
            { status: 500 } // Internal Server Error
        );
    }
}