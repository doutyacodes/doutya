import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { QUIZ_SEQUENCES, USER_DETAILS, USER_FEATURE_FLAGS } from '@/utils/schema';
import { db } from '@/utils';
import { and, eq, inArray } from 'drizzle-orm';
import { RESULTS1 } from '@/utils/schema';
import path from 'path';
import fs from 'fs';
import axios from 'axios';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';


const languageOptions = {
  en: 'english',
  hi: 'hindi',
  mar: 'marathi',
  ur: 'urdu',
  sp: 'spanish',
  ben: 'bengali',
  assa: 'assamese',
  ge: 'german',
  mal: 'malayalam',
  tam: 'tamil'
};
// export async function GET(req) {
//   console.log('got user id function')
//   const authResult = await authenticate(req);
//   if (!authResult.authenticated) {
//     return authResult.response;
//   }

//   const userData = authResult.decoded_Data;

//   const userId = userData.userId;

//   const shortLanguage = req.headers.get('accept-language') || 'en';
//   const language = languageOptions[shortLanguage] || 'english';

//   console.log(userId)

//   const type_sequences = await db
//     .select({
//       typeSequence: QUIZ_SEQUENCES.type_sequence
//     })
//     .from(QUIZ_SEQUENCES)
//     .where(
//       and(
//         eq(QUIZ_SEQUENCES.user_id, userId),
//         eq(QUIZ_SEQUENCES.quiz_id, 1)
//       )
//     )
//     .execute();


//   // Check if type_sequences is an empty array
//   if (type_sequences.length === 0) {
//     return NextResponse.json(
//       { message: 'You need to complete the Personality test to view the results.' },
//       { status: 202 }
//     );
//   }

//   const type = type_sequences[0].typeSequence
//   console.log(type)

//   const jsonFilePath = path.join(process.cwd(), 'public', 'results', `${language}_result.json`);
//   if (!fs.existsSync(jsonFilePath)) {
//     return NextResponse.json({ error: "Results file not found" }, { status: 404 });
//   }
//   const fileContents = fs.readFileSync(jsonFilePath, 'utf8');
//   const results = JSON.parse(fileContents);
//   // const results = await db.select().from(RESULTS1).where(eq(RESULTS1.type_sequence, type));

//   const filteredResults = results.filter(result => result.type_sequence === type);
//   if (filteredResults.length === 0) {
//     return NextResponse.json({ error: "No matching results found" }, { status: 404 });
//   }

//   let careers = [];
//   if (Array.isArray(filteredResults[0].most_suitable_careers)) {
//     careers = filteredResults[0].most_suitable_careers;
//   } else if (typeof filteredResults[0].most_suitable_careers === 'string') {
//     // Regex to split by commas only outside parentheses
//     careers = filteredResults[0].most_suitable_careers.split(/,(?![^(]*\))/).map(career => career.trim());
//   }

//   const description = filteredResults[0].description;

//   const prompt = `
//     Based on the following personality description: "${description}", provide a match percentage for each of these careers: ${careers.join(', ')}.
//     The match percentage should reflect how well the personality fits each career. Give it as a single JSON data without any wrapping other than []`;

//   const response = await axios.post(
//     "https://api.openai.com/v1/chat/completions",
//     {
//       model: "gpt-4o-mini",
//       messages: [{ role: "user", content: prompt }],
//       max_tokens: 4000, // Adjust the token limit as needed
//     },
//     {
//       headers: {
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//     }
//   );

//   console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
//   console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
//   console.log(`Total tokens user id: ${response.data.usage.total_tokens}`);


//   let responseText = response.data.choices[0].message.content.trim();
//   responseText = responseText.replace(/```json|```/g, "").trim();



//   const careerMatches = JSON.parse(responseText);

//   const updatedResults = filteredResults.map(result => ({
//     ...result,
//     most_suitable_careers: careers.map((career, index) => ({
//       career,
//       match_percentage: careerMatches[index] || "N/A" // Use index to align with the response
//     }))
//   }));


//   return NextResponse.json(updatedResults, { status: 200 });
// }

// export async function GET(req) {
//   console.log('Getting comprehensive assessment results...');
  
//   const authResult = await authenticate(req);
//   if (!authResult.authenticated) {
//     return authResult.response;
//   }

//   const userData = authResult.decoded_Data;
//   const userId = userData.userId;
//   const shortLanguage = req.headers.get('accept-language') || 'en';
//   const language = languageOptions[shortLanguage] || 'english';

//   try {
//     // Get user basic details
//     const userDetails = await db
//       .select({
//         name: USER_DETAILS.name,
//         birthDate: USER_DETAILS.birth_date,
//         scopeType: USER_DETAILS.scope_type
//       })
//       .from(USER_DETAILS)
//       .where(eq(USER_DETAILS.id, userId))
//       .execute();

//     if (userDetails.length === 0) {
//       return NextResponse.json(
//         { message: 'User details not found. Please complete your profile.' },
//         { status: 404 }
//       );
//     }

//     // Get both personality and career assessment results
//     const assessmentSequences = await db
//       .select({
//         quizId: QUIZ_SEQUENCES.quiz_id,
//         typeSequence: QUIZ_SEQUENCES.type_sequence
//       })
//       .from(QUIZ_SEQUENCES)
//       .where(
//         and(
//           eq(QUIZ_SEQUENCES.user_id, userId),
//           inArray(QUIZ_SEQUENCES.quiz_id, [1, 2]) // 1 for personality (MBTI), 2 for career (RIASEC)
//         )
//       )
//       .execute();

//     // Check if both assessments are completed
//     const personalityResult = assessmentSequences.find(seq => seq.quizId === 1);
//     const careerResult = assessmentSequences.find(seq => seq.quizId === 2);

//     if (!personalityResult) {
//       return NextResponse.json(
//         { message: 'Please complete the Personality Assessment to view results.' },
//         { status: 202 }
//       );
//     }

//     if (!careerResult) {
//       return NextResponse.json(
//         { message: 'Please complete the Career Assessment to view comprehensive results.' },
//         { status: 202 }
//       );
//     }

//     const personalityType = personalityResult.typeSequence;
//     const careerType = careerResult.typeSequence;

//     console.log(`Personality Type: ${personalityType}, Career Type: ${careerType}`);

//     // Read personality data from file
//     const personalityFilePath = path.join(process.cwd(), 'public', 'results', `${language}_result.json`);
//     if (!fs.existsSync(personalityFilePath)) {
//       return NextResponse.json({ error: "Personality results file not found" }, { status: 404 });
//     }

//     const personalityFileContents = fs.readFileSync(personalityFilePath, 'utf8');
//     const personalityResults = JSON.parse(personalityFileContents);
//     const personalityData = personalityResults.find(result => result.type_sequence === personalityType);

//     if (!personalityData) {
//       return NextResponse.json({ error: "Personality data not found" }, { status: 404 });
//     }

//     // Calculate user's age
//     const calculateAge = (birthDate) => {
//       if (!birthDate) return null;
//       const today = new Date();
//       const birth = new Date(birthDate);
//       let age = today.getFullYear() - birth.getFullYear();
//       const monthDiff = today.getMonth() - birth.getMonth();
//       if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//         age--;
//       }
//       return age;
//     };

//     // Generate comprehensive assessment using AI
//     const comprehensivePrompt = `
//     Generate a comprehensive personality and career assessment report for a user with the following information:
    
//     User Profile:
//     - Personality Type: ${personalityType}
//     - Career Interest Type: ${careerType}
//     - Age: ${calculateAge(userDetails[0].birthDate) || 'Not specified'}
//     - Career Focus: ${userDetails[0].scopeType}
    
//     Personality Description: ${personalityData.description}
//     Personality Strengths: ${personalityData.strengths}
//     Personality Areas for Growth: ${personalityData.weaknesses}
    
//     Please provide a structured JSON response with the following sections:
//     {
//       "executive_summary": "A brief 2-3 sentence overview combining both personality and career aspects",
//       "personality_insights": {
//         "core_traits": "Detailed explanation of key personality characteristics",
//         "behavioral_patterns": "How this personality type typically behaves in various situations",
//         "communication_style": "Preferred communication methods and approaches"
//       },
//       "career_alignment": {
//         "ideal_work_environment": "Description of optimal workplace conditions",
//         "leadership_style": "Natural leadership tendencies and approach",
//         "collaboration_preferences": "How they work best with others"
//       },
//       "development_opportunities": {
//         "growth_areas": "Key areas for personal and professional development",
//         "skill_recommendations": "Specific skills to focus on developing",
//         "learning_preferences": "Best ways for this person to acquire new knowledge"
//       },
//       "career_recommendations": {
//         "top_career_matches": [
//           {
//             "career": "Career title",
//             "match_percentage": 85,
//             "reasoning": "Why this career fits well"
//           }
//         ],
//         "industries_to_explore": ["Industry 1", "Industry 2", "Industry 3"],
//         "roles_to_avoid": ["Role type 1", "Role type 2"]
//       },
//       "action_plan": {
//         "immediate_steps": ["Step 1", "Step 2", "Step 3"],
//         "long_term_goals": ["Goal 1", "Goal 2"],
//         "networking_advice": "Specific networking strategies for this personality type"
//       }
//     }
    
//     Make sure the response is professional, actionable, and tailored to the specific combination of personality and career interest types. Focus on practical insights and avoid using technical terms like MBTI or RIASEC.
//     `;

//     const aiResponse = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-4o-mini",
//         messages: [{ role: "user", content: comprehensivePrompt }],
//         max_tokens: 4000,
//         temperature: 0.7
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     console.log(`AI Usage - Input: ${aiResponse.data.usage.prompt_tokens}, Output: ${aiResponse.data.usage.completion_tokens}, Total: ${aiResponse.data.usage.total_tokens}`);

//     let aiResponseText = aiResponse.data.choices[0].message.content.trim();
//     aiResponseText = aiResponseText.replace(/```json|```/g, "").trim();
    
//     let comprehensiveResults;
//     try {
//       comprehensiveResults = JSON.parse(aiResponseText);
//     } catch (parseError) {
//       console.error('Error parsing AI response:', parseError);
//       return NextResponse.json({ error: "Error processing assessment results" }, { status: 500 });
//     }

//     // Structure the final response
//     const finalResponse = {
//       user_profile: {
//         name: userDetails[0].name,
//         age: calculateAge(userDetails[0].birthDate),
//         career_focus: userDetails[0].scopeType,
//         assessment_date: new Date().toISOString().split('T')[0]
//       },
//       assessment_overview: {
//         personality_type_code: personalityType,
//         career_interest_code: careerType,
//         assessment_completion: "100%"
//       },
//       detailed_results: comprehensiveResults,
//       next_steps: {
//         recommended_actions: comprehensiveResults.action_plan?.immediate_steps || [],
//         follow_up_assessments: [
//           "Skills Assessment",
//           "Values Clarification Exercise",
//           "Career Exploration Workshop"
//         ]
//       }
//     };

//     return NextResponse.json(finalResponse, { status: 200 });

//   } catch (error) {
//     console.error('Error in assessment API:', error);
//     return NextResponse.json(
//       { error: "Internal server error while processing assessment results" },
//       { status: 500 }
//     );
//   }
// }

export async function GET(req) {
  console.log('Getting comprehensive assessment results...');
  
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;
  const shortLanguage = req.headers.get('accept-language') || 'en';
  const language = languageOptions[shortLanguage] || 'english';

  try {
    // Get user basic details
    const userDetails = await db
      .select({
        name: USER_DETAILS.name,
        birthDate: USER_DETAILS.birth_date,
        scopeType: USER_DETAILS.scope_type
      })
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId))
      .execute();

    if (userDetails.length === 0) {
      return NextResponse.json(
        { message: 'User details not found. Please complete your profile.' },
        { status: 404 }
      );
    }

    const existingFlag = await db
      .select()
      .from(USER_FEATURE_FLAGS)
      .where(and(
        eq(USER_FEATURE_FLAGS.user_id, userId),
        eq(USER_FEATURE_FLAGS.key, "result_page_shown")
      ))
      .execute();

    if (existingFlag.length === 0) {
      await db.insert(USER_FEATURE_FLAGS).values({
        user_id: userId,
        key: "result_page_shown",
        seen: true,
      }).execute();
    } else {
      await db
        .update(USER_FEATURE_FLAGS)
        .set({ seen: true })
        .where(and(
          eq(USER_FEATURE_FLAGS.user_id, userId),
          eq(USER_FEATURE_FLAGS.key, "result_page_shown")
        ))
        .execute();
    }

    // Calculate user's age
    const calculateAge = (birthDate) => {
      if (!birthDate) return null;
      const today = new Date();
      const birth = new Date(birthDate);
      let age = today.getFullYear() - birth.getFullYear();
      const monthDiff = today.getMonth() - birth.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
      }
      return age;
    };

    const userAge = calculateAge(userDetails[0].birthDate);
    const isKid = userAge && userAge >= 6 && userAge <= 9;

    // Get assessment results
    const assessmentSequences = await db
      .select({
        quizId: QUIZ_SEQUENCES.quiz_id,
        typeSequence: QUIZ_SEQUENCES.type_sequence
      })
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, userId),
          inArray(QUIZ_SEQUENCES.quiz_id, isKid ? [1] : [1, 2]) // Kids only have MBTI test
        )
      )
      .execute();

    // Check if required assessments are completed
    const personalityResult = assessmentSequences.find(seq => seq.quizId === 1);
    
    if (!personalityResult) {
      return NextResponse.json(
        { message: 'Please complete the Personality Assessment to view results.' },
        { status: 202 }
      );
    }

    // For adults, check career assessment too
    let careerResult = null;
    if (!isKid) {
      careerResult = assessmentSequences.find(seq => seq.quizId === 2);
      if (!careerResult) {
        return NextResponse.json(
          { message: 'Please complete the Career Assessment to view comprehensive results.' },
          { status: 202 }
        );
      }
    }

    const personalityType = personalityResult.typeSequence;
    const careerType = careerResult?.typeSequence || null;

    console.log(`User Age: ${userAge}, Is Kid: ${isKid}, Personality Type: ${personalityType}, Career Type: ${careerType}`);

    // Read personality data from file
    const personalityFilePath = path.join(process.cwd(), 'public', 'results', `${language}_result.json`);
    if (!fs.existsSync(personalityFilePath)) {
      return NextResponse.json({ error: "Personality results file not found" }, { status: 404 });
    }

    const personalityFileContents = fs.readFileSync(personalityFilePath, 'utf8');
    const personalityResults = JSON.parse(personalityFileContents);
    const personalityData = personalityResults.find(result => result.type_sequence === personalityType);

    if (!personalityData) {
      return NextResponse.json({ error: "Personality data not found" }, { status: 404 });
    }

    let finalResponse;

    if (isKid) {
      // FOR KIDS: Use simple career matching with percentages
      let careers = [];
      if (Array.isArray(personalityData.most_suitable_careers)) {
        careers = personalityData.most_suitable_careers;
      } else if (typeof personalityData.most_suitable_careers === 'string') {
        careers = personalityData.most_suitable_careers.split(/,(?![^(]*\))/).map(career => career.trim());
      }

      const kidPrompt = `
        Based on this personality description for a ${userAge}-year-old child: "${personalityData.description}", 
        provide a match percentage for each of these careers: ${careers.join(', ')}.
        Make the response child-friendly and encouraging and should reflect how well the personality fits each career. Give it as a single JSON array with career and match_percentage fields as a single JSON data without any wrapping other than [].
      `;

    // const prompt = `
    // Based on the following personality description: "${description}", provide a match percentage for each of these careers: ${careers.join(', ')}.
    // The match percentage should reflect how well the personality fits each career. Give it as a single JSON data without any wrapping other than []`;

      const careerResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: kidPrompt }],
          max_tokens: 1000,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`Kids API Usage - Input: ${careerResponse.data.usage.prompt_tokens}, Output: ${careerResponse.data.usage.completion_tokens}`);

      let careerResponseText = careerResponse.data.choices[0].message.content.trim();
      careerResponseText = careerResponseText.replace(/```json|```/g, "").trim();
      
      const careerMatches = JSON.parse(careerResponseText);

      // Structure response for kids
      finalResponse = {
        user_profile: {
          name: userDetails[0].name,
          age: userAge,
          career_focus: "exploration", // Kids are in exploration phase
          assessment_date: new Date().toISOString().split('T')[0],
          is_kid: true
        },
        assessment_overview: {
          personality_type_code: personalityType,
          assessment_completion: "100%",
          user_type: "kid"
        },
        detailed_results: {
          executive_summary: `${userDetails[0].name} shows wonderful potential in many areas! This personality type is known for being ${personalityData.strengths.split(',').slice(0, 2).join(' and ')}.`,
          personality_insights: {
            core_traits: personalityData.description,
            fun_facts: personalityData.strengths,
            things_to_practice: personalityData.weaknesses
          },
          career_recommendations: {
            top_career_matches: careerMatches.map(match => ({
              career: match.career,
              match_percentage: match.match_percentage,
              reasoning: `This could be a great fit because of your natural talents!`
            })),
            fun_activities: [
              "Try drawing or creative projects",
              "Play games that involve problem-solving",
              "Spend time in nature and explore",
              "Read books about different jobs",
              "Help others when you can"
            ]
          },
          development_opportunities: {
            growth_areas: "Every day is a chance to learn something new and exciting!",
            skill_recommendations: "Focus on what makes you happy and curious.",
            learning_preferences: "Learn through play, exploration, and asking lots of questions!"
          }
        }
      };
    } else {
      // FOR ADULTS: Use comprehensive AI analysis
      const comprehensivePrompt = `
      Generate a comprehensive personality and career assessment report for a user with the following information:
      
      User Profile:
      - Personality Type: ${personalityType}
      - Career Interest Type: ${careerType}
      - Age: ${userAge || 'Not specified'}
      - Career Focus: ${userDetails[0].scopeType}
      
      Personality Description: ${personalityData.description}
      Personality Strengths: ${personalityData.strengths}
      Personality Areas for Growth: ${personalityData.weaknesses}
      
      Please provide a structured JSON response with the following sections:
      {
        "executive_summary": "A brief 2-3 sentence overview combining both personality and career aspects",
        "personality_insights": {
          "core_traits": "Detailed explanation of key personality characteristics",
          "behavioral_patterns": "How this personality type typically behaves in various situations",
          "communication_style": "Preferred communication methods and approaches"
        },
        "career_alignment": {
          "ideal_work_environment": "Description of optimal workplace conditions",
          "leadership_style": "Natural leadership tendencies and approach",
          "collaboration_preferences": "How they work best with others"
        },
        "development_opportunities": {
          "growth_areas": "Key areas for personal and professional development",
          "skill_recommendations": "Specific skills to focus on developing",
          "learning_preferences": "Best ways for this person to acquire new knowledge"
        },
        "career_recommendations": {
          "top_career_matches": [
            {
              "career": "Career title",
              "match_percentage": 85,
              "reasoning": "Why this career fits well"
            }
          ],
          "industries_to_explore": ["Industry 1", "Industry 2", "Industry 3"],
          "roles_to_avoid": ["Role type 1", "Role type 2"]
        },
        "action_plan": {
          "immediate_steps": ["Step 1", "Step 2", "Step 3"],
          "long_term_goals": ["Goal 1", "Goal 2"],
          "networking_advice": "Specific networking strategies for this personality type"
        }
      }
      
      Make sure the response is professional, actionable, and tailored to the specific combination of personality and career interest types.
      `;

      const aiResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: comprehensivePrompt }],
          max_tokens: 4000,
          temperature: 0.7
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(`Adult API Usage - Input: ${aiResponse.data.usage.prompt_tokens}, Output: ${aiResponse.data.usage.completion_tokens}`);

      let aiResponseText = aiResponse.data.choices[0].message.content.trim();
      aiResponseText = aiResponseText.replace(/```json|```/g, "").trim();
      
      let comprehensiveResults;
      try {
        comprehensiveResults = JSON.parse(aiResponseText);
      } catch (parseError) {
        console.error('Error parsing AI response:', parseError);
        return NextResponse.json({ error: "Error processing assessment results" }, { status: 500 });
      }

      // Structure response for adults
      finalResponse = {
        user_profile: {
          name: userDetails[0].name,
          age: userAge,
          career_focus: userDetails[0].scopeType,
          assessment_date: new Date().toISOString().split('T')[0],
          is_kid: false
        },
        assessment_overview: {
          personality_type_code: personalityType,
          career_interest_code: careerType,
          assessment_completion: "100%",
          user_type: "adult"
        },
        detailed_results: comprehensiveResults,
        next_steps: {
          recommended_actions: comprehensiveResults.action_plan?.immediate_steps || [],
          follow_up_assessments: [
            "Skills Assessment",
            "Values Clarification Exercise",
            "Career Exploration Workshop"
          ]
        }
      };
    }

    return NextResponse.json(finalResponse, { status: 200 });

  } catch (error) {
    console.error('Error in assessment API:', error);
    return NextResponse.json(
      { error: "Internal server error while processing assessment results" },
      { status: 500 }
    );
  }
}