// import { NextResponse } from 'next/server';
// import { authenticate } from '@/lib/jwtMiddleware';
// import { 
//   QUIZ_SEQUENCES, 
//   USER_ASSESSMENT_REPORTS, 
//   USER_DETAILS, 
//   USER_FEATURE_FLAGS,
//   USER_RESULTS,
//   USER_CLUSTER,
//   CLUSTER,
//   USER_SECTOR,
//   SECTOR,
//   MBTI_SECTOR_MAP
// } from '@/utils/schema';
// import { db } from '@/utils';
// import { and, desc, eq, inArray, not } from 'drizzle-orm';
// import path from 'path';
// import fs from 'fs';
// import axios from 'axios';

// export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

// const languageOptions = {
//   en: 'english',
//   hi: 'hindi',
//   mar: 'marathi',
//   ur: 'urdu',
//   sp: 'spanish',
//   ben: 'bengali',
//   assa: 'assamese',
//   ge: 'german',
//   mal: 'malayalam',
//   tam: 'tamil'
// };

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
//     // Get user basic details (always fetch fresh)
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

//     // Update feature flag (always do this)
//     const existingFlag = await db
//       .select()
//       .from(USER_FEATURE_FLAGS)
//       .where(and(
//         eq(USER_FEATURE_FLAGS.user_id, userId),
//         eq(USER_FEATURE_FLAGS.key, "result_page_shown")
//       ))
//       .execute();

//     if (existingFlag.length === 0) {
//       await db.insert(USER_FEATURE_FLAGS).values({
//         user_id: userId,
//         key: "result_page_shown",
//         seen: true,
//       }).execute();
//     } else {
//       await db
//         .update(USER_FEATURE_FLAGS)
//         .set({ seen: true })
//         .where(and(
//           eq(USER_FEATURE_FLAGS.user_id, userId),
//           eq(USER_FEATURE_FLAGS.key, "result_page_shown")
//         ))
//         .execute();
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

//     const userAge = calculateAge(userDetails[0].birthDate);
//     const scopeType = userDetails[0].scopeType;

//     // Check if cached report exists
//     const existingReport = await db
//       .select()
//       .from(USER_ASSESSMENT_REPORTS)
//       .where(and(
//         eq(USER_ASSESSMENT_REPORTS.user_id, userId),
//         eq(USER_ASSESSMENT_REPORTS.is_kid, 0) // Only adults now
//       ))
//       .orderBy(desc(USER_ASSESSMENT_REPORTS.created_at))
//       .limit(1)
//       .execute();

//     // If cached report exists, update with fresh user data and return
//     if (existingReport.length > 0) {
//       console.log('Found cached report, updating with fresh user data...');
      
//       const cachedReportData = existingReport[0].report_data;
      
//       // Update the cached report with fresh user data
//       const updatedReport = {
//         ...cachedReportData,
//         user_profile: {
//           ...cachedReportData.user_profile,
//           name: userDetails[0].name, // Always use fresh name
//           age: userAge, // Always use fresh age
//           career_focus: scopeType, // Always use fresh scope
//           assessment_date: existingReport[0].assessment_date,
//           is_kid: false
//         }
//       };

//       // Update the cached report in database with fresh user data
//       await db
//         .update(USER_ASSESSMENT_REPORTS)
//         .set({ 
//           report_data: updatedReport
//         })
//         .where(eq(USER_ASSESSMENT_REPORTS.id, existingReport[0].id))
//         .execute();

//       return NextResponse.json(updatedReport, { status: 200 });
//     }

//     // No cached report found, generate new one
//     console.log('No cached report found, generating new assessment...');

//     // Get assessment results
//     const assessmentSequences = await db
//       .select({
//         quizId: QUIZ_SEQUENCES.quiz_id,
//         typeSequence: QUIZ_SEQUENCES.type_sequence
//       })
//       .from(QUIZ_SEQUENCES)
//       .where(
//         and(
//           eq(QUIZ_SEQUENCES.user_id, userId),
//           inArray(QUIZ_SEQUENCES.quiz_id, [1, 2]) // Both personality and career assessments
//         )
//       )
//       .execute();

//     // Check if required assessments are completed
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

//     console.log(`User Age: ${userAge}, Scope Type: ${scopeType}, Assessments completed: Personality: ${personalityType}, Career: ${careerType}`);

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

//     // Fetch scope-specific data based on scopeType
//     let scopeSpecificData = null;
//     let scopeDataString = '';

//     if (scopeType === 'career') {
//       // Fetch from USER_RESULTS table
//       const userResults = await db
//         .select({
//           result2: USER_RESULTS.result2
//         })
//         .from(USER_RESULTS)
//         .where(eq(USER_RESULTS.user_id, userId))
//         .execute();

//       if (userResults.length > 0 && userResults[0].result2) {
//         try {
//           scopeSpecificData = JSON.parse(userResults[0].result2);
//           scopeDataString = `Career Data: ${userResults[0].result2}`;
//         } catch (e) {
//           console.error('Error parsing career data:', e);
//           scopeDataString = `Career Data: ${userResults[0].result2}`;
//         }
//       }
//     } else if (scopeType === 'cluster') {
//       // Fetch from USER_CLUSTER and CLUSTER tables
//       const existingUserClusters = await db
//         .select({
//           cluster_id: USER_CLUSTER.cluster_id,
//           selected: USER_CLUSTER.selected
//         })
//         .from(USER_CLUSTER)
//         .where(eq(USER_CLUSTER.user_id, userId))
//         .execute();

//       if (existingUserClusters.length > 0) {
//         const clusterIds = existingUserClusters.map(uc => uc.cluster_id);
        
//         const clusters = await Promise.all(clusterIds.map(async (id) => {
//           const result = await db
//             .select({
//               id: CLUSTER.id,
//               name: CLUSTER.name,
//               description: CLUSTER.description,
//               related_jobs: CLUSTER.related_jobs
//             })
//             .from(CLUSTER)
//             .where(eq(CLUSTER.id, id))
//             .execute();
//           return result[0];
//         }));

//         scopeSpecificData = clusters.filter(Boolean);
//         scopeDataString = `Cluster Data: ${JSON.stringify(scopeSpecificData)}`;
//       }

//     } else if (scopeType === 'sector') {
//       // Fetch from MBTI_SECTOR_MAP based on personality type, then get sector details
//       const mbtiMapping = await db
//         .select({
//           sector_1_id: MBTI_SECTOR_MAP.sector_1_id,
//           sector_2_id: MBTI_SECTOR_MAP.sector_2_id,
//           sector_3_id: MBTI_SECTOR_MAP.sector_3_id
//         })
//         .from(MBTI_SECTOR_MAP)
//         .where(eq(MBTI_SECTOR_MAP.mbti_type, personalityType.toUpperCase()))
//         .execute();

//       let matchingSectors = [];
//       let otherSectors = [];
//       let matchingSectorIds = [];

//       if (mbtiMapping.length > 0) {
//         // Get the matching sector IDs from the mapping (sector_1_id, sector_2_id, sector_3_id)
//         const mapping = mbtiMapping[0];
//         matchingSectorIds = [mapping.sector_1_id, mapping.sector_2_id, mapping.sector_3_id];
        
//         // Fetch matching sector details
//         matchingSectors = await Promise.all(matchingSectorIds.map(async (sectorId) => {
//           const result = await db
//             .select({
//               id: SECTOR.id,
//               name: SECTOR.name,
//               description: SECTOR.description
//             })
//             .from(SECTOR)
//             .where(eq(SECTOR.id, sectorId))
//             .execute();
//           return result[0];
//         }));

//         matchingSectors = matchingSectors.filter(Boolean);
//       }

//       // Fetch all other sectors (excluding the matching ones)
//       const allOtherSectors = await db
//         .select({
//           id: SECTOR.id,
//           name: SECTOR.name,
//           description: SECTOR.description
//         })
//         .from(SECTOR)
//         .where(matchingSectorIds.length > 0 ? not(inArray(SECTOR.id, matchingSectorIds)) : undefined)
//         .execute();

//       otherSectors = allOtherSectors;

//       // Structure the data
//       scopeSpecificData = {
//         matching_sectors: matchingSectors,
//         other_sectors: otherSectors
//       };
      
//       scopeDataString = `Sector Data: Matching Sectors - ${JSON.stringify(matchingSectors)}, Other Available Sectors - ${JSON.stringify(otherSectors)}`;
//     }
//     // Generate comprehensive AI analysis
//     const comprehensivePrompt = `
//       Generate a structured and detailed personality and career assessment report for a user with the following information:

//       User Profile:
//       - Age: ${userAge || 'Not specified'}
//       - Career Focus: ${scopeType}
//       - Assessment Results: Based on personality and career interest assessments

//       Inputs:
//       - Personality Description: ${personalityData.description}
//       - Personality Strengths: ${personalityData.strengths}
//       - Personality Areas for Growth: ${personalityData.weaknesses}
//       - Personality Type: ${personalityType}
//       - Career Type: ${careerType}
//       ${scopeDataString ? `- ${scopeDataString}` : ''}

//       Please provide a structured JSON response with the following format:
//       {
//         "personality_analysis": {
//           "type": "${personalityData.personalityType || 'Personality Type'}",
//           "overview": "Comprehensive description of this personality type",
//           "advantages": ["At least 4-6 detailed advantages explained clearly"],
//           "disadvantages": ["At least 4-6 detailed disadvantages explained clearly"],
//           "strengths": ["At least 4-6 key strengths described in detail"],
//           "weaknesses": ["At least 4-6 key weaknesses described in detail"],
//           "behavioral_tendencies": "Detailed explanation of how this personality type usually behaves across different situations such as work, relationships, and decision-making"
//         },
//         "career_interest_analysis": {
//           "type": "${personalityData.careerType || 'Career Interest Type'}",
//           "overview": "Comprehensive description of this career interest type",
//           "advantages": ["At least 4-6 detailed advantages related to career preferences"],
//           "disadvantages": ["At least 4-6 detailed disadvantages or limitations"],
//           "strengths": ["At least 4-6 strong points relevant to this career type"],
//           "weaknesses": ["At least 4-6 weaker points or risks relevant to this career type"],
//           "work_style_preferences": "Detailed explanation of how people with this career type prefer to work, including environment, collaboration style, and motivation factors"
//         },
//         "combined_insights": {
//           "alignment": "In-depth explanation of how the personality type and career type complement each other, with at least 3-5 examples",
//           "potential_conflicts": "Detailed description of possible clashes or difficulties, with at least 3-5 examples",
//           "career_fit_summary": "Thorough summary of how well this combination aligns with the user's career focus",
//           "guidance": "Actionable and practical advice on how to maximize strengths, manage weaknesses, and achieve long-term success"
//         }${scopeSpecificData ? `,
//         "scope_specific_recommendations": {
//           "relevant_options": "Detailed analysis of how the user's personality and career interests align with their specific ${scopeType} options",
//           "development_areas": "Areas to focus on for success in their chosen ${scopeType} path"
//         }` : ''}
//       }

//       IMPORTANT:
//       - Each list (advantages, disadvantages, strengths, weaknesses) should include multiple well-developed items, not just 1-2 generic points.
//       - Write in professional, natural, and human-like language, not robotic bullet points.
//       - Avoid explicit references to MBTI, RIASEC, or their full names. Only use 'personality type' and 'career type'.
//       - Make the response detailed enough to feel like a professional report.
//       ${scopeSpecificData ? `- Incorporate the provided ${scopeType} data into your recommendations and analysis.` : ''}
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

//     console.log(`API Usage - Input: ${aiResponse.data.usage.prompt_tokens}, Output: ${aiResponse.data.usage.completion_tokens}`);

//     let aiResponseText = aiResponse.data.choices[0].message.content.trim();
//     aiResponseText = aiResponseText.replace(/```json|```/g, "").trim();
    
//     let comprehensiveResults;
//     try {
//       comprehensiveResults = JSON.parse(aiResponseText);
//     } catch (parseError) {
//       console.error('Error parsing AI response:', parseError);
//       return NextResponse.json({ error: "Error processing assessment results" }, { status: 500 });
//     }

//     // Structure final response (removing any MBTI/RIASEC references)
//     const finalResponse = {
//       user_profile: {
//         name: userDetails[0].name,
//         age: userAge,
//         career_focus: scopeType,
//         assessment_date: new Date().toISOString().split('T')[0],
//         is_kid: false
//       },
//       assessment_overview: {
//         assessment_completion: "100%",
//         scope_type: scopeType
//       },
//       detailed_results: comprehensiveResults,
//       scope_data: scopeSpecificData, // Include the raw scope data for frontend use if needed
//     };

//     // Save the generated report to database
//     console.log('Saving new assessment report to database...');
    
//     const currentDate = new Date();
    
//     await db.insert(USER_ASSESSMENT_REPORTS).values({
//       user_id: userId,
//       assessment_date: currentDate,
//       is_kid: 0, // Always 0 now since we removed kids functionality
//       report_data: finalResponse
//     }).execute();

//     console.log('Assessment report saved successfully');

//     return NextResponse.json(finalResponse, { status: 200 });

//   } catch (error) {
//     console.error('Error in assessment API:', error);
//     return NextResponse.json(
//       { error: "Internal server error while processing assessment results" },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { 
  QUIZ_SEQUENCES, 
  USER_ASSESSMENT_REPORTS, 
  USER_DETAILS, 
  USER_FEATURE_FLAGS,
  USER_RESULTS,
  USER_CLUSTER,
  CLUSTER,
  USER_SECTOR,
  SECTOR,
  MBTI_SECTOR_MAP,
  PERSONALITY_PROFILES // Added new table
} from '@/utils/schema';
import { db } from '@/utils';
import { and, desc, eq, inArray, not } from 'drizzle-orm';
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
    // Get user basic details (always fetch fresh)
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

    // Update feature flag (always do this)
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
    const scopeType = userDetails[0].scopeType;
    const userName = userDetails[0].name;

    // Check if cached report exists
    const existingReport = await db
      .select()
      .from(USER_ASSESSMENT_REPORTS)
      .where(and(
        eq(USER_ASSESSMENT_REPORTS.user_id, userId),
        eq(USER_ASSESSMENT_REPORTS.is_kid, 0) // Only adults now
      ))
      .orderBy(desc(USER_ASSESSMENT_REPORTS.created_at))
      .limit(1)
      .execute();

    // If cached report exists, update with fresh user data and return
    if (existingReport.length > 0) {
      console.log('Found cached report, updating with fresh user data...');
      
      const cachedReportData = existingReport[0].report_data;
      
      // Update the cached report with fresh user data
      const updatedReport = {
        ...cachedReportData,
        user_profile: {
          ...cachedReportData.user_profile,
          name: userName, // Always use fresh name
          age: userAge, // Always use fresh age
          career_focus: scopeType, // Always use fresh scope
          assessment_date: existingReport[0].assessment_date,
          is_kid: false
        }
      };

      // Update the cached report in database with fresh user data
      await db
        .update(USER_ASSESSMENT_REPORTS)
        .set({ 
          report_data: updatedReport
        })
        .where(eq(USER_ASSESSMENT_REPORTS.id, existingReport[0].id))
        .execute();

      return NextResponse.json(updatedReport, { status: 200 });
    }

    // No cached report found, generate new one
    console.log('No cached report found, generating new assessment...');

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
          inArray(QUIZ_SEQUENCES.quiz_id, [1, 2]) // Both personality and career assessments
        )
      )
      .execute();

    // Check if required assessments are completed
    const personalityResult = assessmentSequences.find(seq => seq.quizId === 1);
    const careerResult = assessmentSequences.find(seq => seq.quizId === 2);
    
    if (!personalityResult) {
      return NextResponse.json(
        { message: 'Please complete the Personality Assessment to view results.' },
        { status: 202 }
      );
    }

    if (!careerResult) {
      return NextResponse.json(
        { message: 'Please complete the Career Assessment to view comprehensive results.' },
        { status: 202 }
      );
    }

    const personalityType = personalityResult.typeSequence;
    const careerType = careerResult.typeSequence;

    console.log(`User Age: ${userAge}, Scope Type: ${scopeType}, Assessments completed: Personality: ${personalityType}, Career: ${careerType}`);

    // Fetch personality data from database instead of file
    const personalityProfile = await db
      .select({
        data: PERSONALITY_PROFILES.data
      })
      .from(PERSONALITY_PROFILES)
      .where(eq(PERSONALITY_PROFILES.code, personalityType.toUpperCase()))
      .execute();

    if (personalityProfile.length === 0) {
      return NextResponse.json({ error: "Personality profile not found" }, { status: 404 });
    }

    const personalityData = personalityProfile[0].data;

    // Fetch scope-specific data based on scopeType with new fields
    let scopeSpecificData = null;
    let scopeDataString = '';

    if (scopeType === 'career') {
      // Fetch from USER_RESULTS table (no change here)
      const userResults = await db
        .select({
          result2: USER_RESULTS.result2
        })
        .from(USER_RESULTS)
        .where(eq(USER_RESULTS.user_id, userId))
        .execute();

      if (userResults.length > 0 && userResults[0].result2) {
        try {
          scopeSpecificData = JSON.parse(userResults[0].result2);
          scopeDataString = `Career Data: ${userResults[0].result2}`;
        } catch (e) {
          console.error('Error parsing career data:', e);
          scopeDataString = `Career Data: ${userResults[0].result2}`;
        }
      }
    } else if (scopeType === 'cluster') {
      // Fetch from USER_CLUSTER and CLUSTER tables with new fields
      const existingUserClusters = await db
        .select({
          cluster_id: USER_CLUSTER.cluster_id,
          selected: USER_CLUSTER.selected
        })
        .from(USER_CLUSTER)
        .where(eq(USER_CLUSTER.user_id, userId))
        .execute();

      if (existingUserClusters.length > 0) {
        const clusterIds = existingUserClusters.map(uc => uc.cluster_id);
        
        const clusters = await Promise.all(clusterIds.map(async (id) => {
          const result = await db
            .select({
              id: CLUSTER.id,
              name: CLUSTER.name,
              why_suitable: CLUSTER.why_suitable,
              related_jobs: CLUSTER.related_jobs,
              sector: CLUSTER.sector,
              ideal_stream: CLUSTER.ideal_stream,
              brief_overview: CLUSTER.brief_overview,
              future_potential: CLUSTER.future_potential
            })
            .from(CLUSTER)
            .where(eq(CLUSTER.id, id))
            .execute();
          return result[0];
        }));

        scopeSpecificData = clusters.filter(Boolean);
        scopeDataString = `Cluster Data: ${JSON.stringify(scopeSpecificData)}`;
      }

    } else if (scopeType === 'sector') {
      // Fetch from MBTI_SECTOR_MAP based on personality type, then get sector details with new fields
      const mbtiMapping = await db
        .select({
          sector_1_id: MBTI_SECTOR_MAP.sector_1_id,
          sector_2_id: MBTI_SECTOR_MAP.sector_2_id,
          sector_3_id: MBTI_SECTOR_MAP.sector_3_id
        })
        .from(MBTI_SECTOR_MAP)
        .where(eq(MBTI_SECTOR_MAP.mbti_type, personalityType.toUpperCase()))
        .execute();

      let matchingSectors = [];
      let matchingSectorIds = [];

      if (mbtiMapping.length > 0) {
        // Get the matching sector IDs from the mapping
        const mapping = mbtiMapping[0];
        matchingSectorIds = [mapping.sector_1_id, mapping.sector_2_id, mapping.sector_3_id];
        
        // Fetch matching sector details with new fields
        matchingSectors = await Promise.all(matchingSectorIds.map(async (sectorId) => {
          const result = await db
            .select({
              id: SECTOR.id,
              name: SECTOR.name,
              brief_overview: SECTOR.brief_overview,
              why_suitable: SECTOR.why_suitable,
              future_potential: SECTOR.future_potential,
              recommended_stream: SECTOR.recommended_stream
            })
            .from(SECTOR)
            .where(eq(SECTOR.id, sectorId))
            .execute();
          return result[0];
        }));

        matchingSectors = matchingSectors.filter(Boolean);
      }

      // Structure the data
      scopeSpecificData = {
        matching_sectors: matchingSectors,
      };
      
      scopeDataString = `Sector Data: Matching Sectors - ${JSON.stringify(matchingSectors)}`;
    }

    // Generate comprehensive AI analysis (excluding personality_analysis since it comes from DB)
    const comprehensivePrompt = `
      Generate a structured and detailed career assessment report for ${userName} with the following information:

      User Profile:
      - Name: ${userName}
      - Age: ${userAge || 'Not specified'}
      - Career Focus: ${scopeType}
      - Assessment Results: Based on personality and career assessments

      Inputs:
      - Career Assessment Type: ${careerType}
      ${scopeDataString ? `- ${scopeDataString}` : ''}

      Please provide a structured JSON response with the following format:
      {
        "career_analysis": {
          "overview": "Comprehensive description of ${userName}'s career preferences and work style",
          "advantages": ["At least 4-6 detailed advantages that ${userName} possesses in their career approach"],
          "disadvantages": ["At least 4-6 detailed disadvantages or limitations that ${userName} should be aware of"],
          "strengths": ["At least 4-6 key strengths that ${userName} can leverage in their career"],
          "weaknesses": ["At least 4-6 weaker points or risks that ${userName} should work on"],
          "work_style_preferences": "Detailed explanation of how ${userName} prefers to work, including environment, collaboration style, and motivation factors"
        },
        "combined_insights": {
          "alignment": "In-depth explanation of how ${userName}'s personality and career preferences complement each other, with at least 3-5 examples",
          "potential_conflicts": "Detailed description of possible clashes or difficulties ${userName} might face, with at least 3-5 examples",
          "career_fit_summary": "Thorough summary of how well ${userName}'s combination aligns with their career focus",
          "guidance": "Actionable and practical advice for ${userName} on how to maximize strengths, manage weaknesses, and achieve long-term success"
        }${scopeSpecificData ? `,
        "scope_specific_recommendations": {
          "relevant_options": "Detailed analysis of how ${userName}'s personality and career preferences align with their specific ${scopeType} options",
          "development_areas": "Areas ${userName} should focus on for success in their chosen ${scopeType} path"
        }` : ''}
      }

      IMPORTANT:
      - Write directly to ${userName} using "you" and personalized language
      - Each list should include multiple well-developed items, not just 1-2 generic points
      - Write in professional, natural, and human-like language, not robotic bullet points
      - Avoid using terms like "career type" or "career interest type" - use more professional language
      - Make the response detailed enough to feel like a professional report
      ${scopeSpecificData ? `- Incorporate the provided ${scopeType} data into your recommendations and analysis for ${userName}` : ''}
      - Speak directly to ${userName} about their specific situation and potential
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

    console.log(`Input tokens career_analysis: ${aiResponse.data.usage.prompt_tokens}`);
    console.log(`Output tokens career_analysis: ${aiResponse.data.usage.completion_tokens}`);
    console.log(`Total tokens career_analysis: ${aiResponse.data.usage.total_tokens}`);

    let aiResponseText = aiResponse.data.choices[0].message.content.trim();
    aiResponseText = aiResponseText.replace(/```json|```/g, "").trim();
    
    let comprehensiveResults;
    try {
      comprehensiveResults = JSON.parse(aiResponseText);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return NextResponse.json({ error: "Error processing assessment results" }, { status: 500 });
    }

    // Structure final response (combining personality data from DB and AI-generated career analysis)
    const finalResponse = {
      user_profile: {
        name: userName,
        age: userAge,
        career_focus: scopeType,
        assessment_date: new Date().toISOString().split('T')[0],
        is_kid: false
      },
      assessment_overview: {
        assessment_completion: "100%",
        scope_type: scopeType
      },
      detailed_results: {
        personality_analysis: personalityData, // From database
        ...comprehensiveResults // AI-generated career analysis and insights
      },
      scope_data: scopeSpecificData, // Include the raw scope data for frontend use if needed
    };

    // Save the generated report to database
    console.log('Saving new assessment report to database...');
    
    const currentDate = new Date();
    
    await db.insert(USER_ASSESSMENT_REPORTS).values({
      user_id: userId,
      assessment_date: currentDate,
      is_kid: 0, // Always 0 now since we removed kids functionality
      report_data: finalResponse
    }).execute();

    console.log('Assessment report saved successfully');

    return NextResponse.json(finalResponse, { status: 200 });

  } catch (error) {
    console.error('Error in assessment API:', error);
    return NextResponse.json(
      { error: "Internal server error while processing assessment results" },
      { status: 500 }
    );
  }
}