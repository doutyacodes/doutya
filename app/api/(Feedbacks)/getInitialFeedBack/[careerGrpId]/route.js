// import { db } from '@/utils';
// import { CAREER_GROUP, CAREER_SUBJECTS, SUBJECTS, TESTS, USER_CAREER, USER_DETAILS, USER_EDUCATION_STAGE, USER_TESTS } from '@/utils/schema';
// import { NextResponse } from 'next/server';
// import { and, eq, inArray } from 'drizzle-orm'; // Adjust based on your ORM version
// import { authenticate } from '@/lib/jwtMiddleware';
// import { calculateAge } from '@/lib/ageCalculate';
// import axios from 'axios';
// import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
// import { calculateAcademicPercentage } from '@/lib/calculateAcademicPercentage';
// import { generateInitialFeedBackPrompt } from '@/app/api/services/promptService';

// const languageOptions = {
//   en: 'in English',
//   hi: 'in Hindi',
//   mar: 'in Marathi',
//   ur: 'in Urdu',
//   sp: 'in Spanish',
//   ben: 'in Bengali',
//   assa: 'in Assamese',
//   ge: 'in German',
//   tam:'in Tamil',
//   mal:'in malayalam'
// };

// export const maxDuration = 40; // This function can run for a maximum of 5 seconds
// export const dynamic = 'force-dynamic';


// export async function GET(req, { params }) {
//   console.log('generating')
//      // Authenticate user
//     const authResult = await authenticate(req);
//     if (!authResult.authenticated) {
//         return authResult.response;
//       }

//     const userData = authResult.decoded_Data;
//     const userId = userData.userId;

//     const language = req.headers.get('accept-language') || 'en';

//     const { careerGrpId } = params;

//     try {

//          // Check the user's plan type in the USER_DETAILS table
//             const planTypeResult = await db
//             .select({ planType: USER_DETAILS.plan_type })
//             .from(USER_DETAILS)
//             .where(eq(USER_DETAILS.id, userId));

//           const planType = planTypeResult[0]?.planType;

//           // If plan type is 'base', return an early response
//           if (planType === 'base') {
//             return NextResponse.json({ message: 'Upgrade to Pro to access this feature' }, { status: 403 });
//           }

//             // Step 1: Check if feedback is already present in the USER_CAREER table
//             const userCareer = await db
//             .select({
//                 feedback: USER_CAREER.feedback,
//                 type1: USER_CAREER.type1,
//                 type2: USER_CAREER.type2,
//                 country: USER_CAREER.country,
//             })
//             .from(USER_CAREER)
//             .where(and(eq(USER_CAREER.user_id, userId), eq(USER_CAREER.career_group_id, careerGrpId)));

//             console.log("userCareer", userCareer);


//             // If feedback exists, return it
//             if (userCareer.length > 0 && userCareer[0].feedback && userCareer[0].feedback !== 'null') {
//                 console.log("Present");
//                 return NextResponse.json({ feedback: userCareer[0].feedback }, { status: 200 });
//             }

//             // Step 2: If feedback is not present, fetch required fields to generate feedback
//             const birthDateResult = await db
//                 .select({ 
//                   birth_date: USER_DETAILS.birth_date,
//                   // education:USER_DETAILS.education,
//                   // educationLevel: USER_DETAILS.education_level,
//                   academicYearStart : USER_DETAILS.academicYearStart,
//                   academicYearEnd : USER_DETAILS.academicYearEnd,
//                   className: USER_DETAILS.class_name
//                  })
//                 .from(USER_DETAILS)
//                 .where(eq(USER_DETAILS.id, userId));

//             const birth_date = birthDateResult[0]?.birth_date;
//             const age = calculateAge(birth_date);
//             const currentAgeWeek = getCurrentWeekOfAge(birth_date)

//             const className = birthDateResult[0]?.className || 'completed';
//             const academicYearStart = birthDateResult[0]?.academicYearStart
//             const academicYearEnd = birthDateResult[0]?.academicYearEnd

//             const percentageCompleted = calculateAcademicPercentage(academicYearStart, academicYearEnd)

//             // Get education stage
//               const educationStageData = await db
//                 .select()
//                 .from(USER_EDUCATION_STAGE)
//                 .where(eq(USER_EDUCATION_STAGE.user_id, userId));
                          
//               const educationStage = educationStageData[0].stage;

//             // Fetch career name from the CAREER_GROUP table
//             const careerGroup = await db
//                 .select({ career_name: CAREER_GROUP.career_name })
//                 .from(CAREER_GROUP)
//                 .where(eq(CAREER_GROUP.id, careerGrpId));

//             const career_name = careerGroup[0]?.career_name;
//             const { type1, type2, country } = userCareer[0];

                      
//           //   const FINAL_PROMPT = `Provide a simple and concise feedback for an individual of age ${age} (currently in week ${currentAgeWeek} of this age)${
//           //     (educationStage === 'school' || educationStage === 'college') 
//           //     ? ` in ${className} with ${percentageCompleted}% of the academic year completed, who is pursuing their education in ${education}` 
//           //     : ` who has completed ${education}`
//           // } with a ${type1} personality type and ${type2} RIASEC interest types in the field of ${career_name}${country ? " in " + country : ""}. The feedback should highlight key areas for improvement in this career in order to excel in this career what the person has to change. Avoid lengthy descriptions and complex formatting. Ensure the response is valid JSON and exclude the terms '${type1}' and 'RIASEC' from the data. Provide the output ${languageOptions[language] || 'in English'} as a single paragraph without additional wrapping other than {}.`;


          
//             const FINAL_PROMPT = `Provide a simple and concise feedback for an individual of age ${age} (currently in week ${currentAgeWeek} of this age)${
//                 (educationStage === 'school' || educationStage === 'college') 
//                 ? ` in ${className} with ${percentageCompleted}% of the academic year completed, who is pursuing their education` 
//                 : ` who has completed education`
//             } with a ${type1} personality type and ${type2} RIASEC interest types in the field of ${career_name}${country ? " in " + country : ""}. The feedback should highlight key areas for improvement in this career in order to excel in this career what the person has to change. Avoid lengthy descriptions and complex formatting. Ensure the response is valid JSON and exclude the terms '${type1}' and 'RIASEC' from the data. Provide the output ${languageOptions[language] || 'in English'} as a single paragraph without additional wrapping other than {}.`;


//               // const FINAL_PROMPT = await generateInitialFeedBackPrompt(
//               //   userId, type1, type2, age, career_name, country, currentAgeWeek, languageOptions, language
//               // );
          
//               const response = await axios.post(
//                 "https://api.openai.com/v1/chat/completions",
//                 {
//                   model: "gpt-4o-mini",
//                   messages: [{ role: "user", content: FINAL_PROMPT }],
//                   max_tokens: 1500,
//                 },
//                 {
//                   headers: {
//                     Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//                     "Content-Type": "application/json",
//                   },
//                 }
//               );
              
//               console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
//               console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
//               console.log(`Total tokens: ${response.data.usage.total_tokens}`);
//               console.log("API request completed.");

//               let responseText = response.data.choices[0].message.content.trim();
//               responseText = responseText.replace(/```json|```/g, "").trim();
//               console.log("responseText",responseText);
//               const parsedFeedback = JSON.parse(responseText);
//               console.log(parsedFeedback)

//             // Step 4: Save the generated feedback in the USER_CAREER table
//             await db
//                 .update(USER_CAREER)
//                 .set({
//                     feedback: parsedFeedback.feedback, // Update the type_sequence field
//                 })
//                 .where(and(eq(USER_CAREER.user_id, userId), eq(USER_CAREER.career_group_id, careerGrpId)));

//             // Return the generated feedback
//             return NextResponse.json({ feedback: parsedFeedback.feedback }, { status: 200 });



//     } catch (error) {
//         console.error("Error fetching or generating feedback:", error);
//         return NextResponse.json({ message: 'Error fetching or generating feedback' }, { status: 500 });
//     }
// }


import { db } from '@/utils';
import { 
    CAREER_GROUP, 
    CLUSTER,
    SECTOR,
    USER_CAREER, 
    USER_CLUSTER,
    USER_SECTOR,
    USER_DETAILS, 
    USER_EDUCATION_STAGE,
    USER_FEEDBACK
} from '@/utils/schema';
import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { authenticate } from '@/lib/jwtMiddleware';
import { calculateAge } from '@/lib/ageCalculate';
import axios from 'axios';
import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
import { calculateAcademicPercentage } from '@/lib/calculateAcademicPercentage';

const languageOptions = {
  en: 'in English',
  hi: 'in Hindi',
  mar: 'in Marathi',
  ur: 'in Urdu',
  sp: 'in Spanish',
  ben: 'in Bengali',
  assa: 'in Assamese',
  ge: 'in German',
  tam: 'in Tamil',
  mal: 'in Malayalam'
};

export const maxDuration = 40;
export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    console.log('Generating feedback');
    
    // Authenticate user
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const language = req.headers.get('accept-language') || 'en';
    const { careerGrpId:scopeId } = params; // Changed from careerGrpId to scopeId

    try {
        // Get user's details including scope_type and plan_type
        const userDetailsResult = await db
            .select({ 
                birth_date: USER_DETAILS.birth_date,
                education: USER_DETAILS.education,
                educationLevel: USER_DETAILS.education_level,
                academicYearStart: USER_DETAILS.academicYearStart,
                academicYearEnd: USER_DETAILS.academicYearEnd,
                className: USER_DETAILS.class_name,
                joined_date: USER_DETAILS.joined_date,
                scope_type: USER_DETAILS.scope_type,
                plan_type: USER_DETAILS.plan_type
            })
            .from(USER_DETAILS)
            .where(eq(USER_DETAILS.id, userId));
        
        if (!userDetailsResult.length) {
            return NextResponse.json({ message: 'User details not found.' }, { status: 404 });
        }

        const userDetails = userDetailsResult[0];
        const planType = userDetails.plan_type;
        const scopeType = userDetails.scope_type || 'career';

        // Check plan type
        if (planType === 'base') {
            return NextResponse.json({ message: 'Upgrade to Pro to access this feature' }, { status: 403 });
        }

        // Step 1: Check if feedback is already present in USER_FEEDBACK table
        const existingFeedback = await db
            .select({
                feedback: USER_FEEDBACK.feedback
            })
            .from(USER_FEEDBACK)
            .where(
                and(
                    eq(USER_FEEDBACK.user_id, userId),
                    eq(USER_FEEDBACK.feedback_type, scopeType),
                    // We'll need to add a scope_id field to USER_FEEDBACK table or use a compound key
                    // For now, assuming we identify by user_id + feedback_type + created date proximity
                )
            )
            .orderBy(USER_FEEDBACK.created_at)
            .limit(1);

        // If feedback exists and is recent, return it
        if (existingFeedback.length > 0 && existingFeedback[0].feedback) {
            console.log("Existing feedback found");
            return NextResponse.json({ feedback: existingFeedback[0].feedback }, { status: 200 });
        }

        // Calculate age and education details
        const birth_date = userDetails.birth_date;
        const age = calculateAge(birth_date);
        const currentAgeWeek = getCurrentWeekOfAge(birth_date);
        const className = userDetails.className || 'completed';
        const academicYearStart = userDetails.academicYearStart;
        const academicYearEnd = userDetails.academicYearEnd;
        const percentageCompleted = calculateAcademicPercentage(academicYearStart, academicYearEnd);

        // Get education stage
        const educationStageData = await db
            .select()
            .from(USER_EDUCATION_STAGE)
            .where(eq(USER_EDUCATION_STAGE.user_id, userId));
                      
        const educationStage = educationStageData[0]?.stage || 'completed';

        // Fetch scope-specific information
        let scopeInfo = {};
        let scopeName = '';
        let country = '';
        let type1 = '';
        let type2 = '';

        if (scopeType === 'career') {
            // Fetch career information
            const careerData = await db
                .select({
                    careerGroupId: USER_CAREER.career_group_id,
                    country: USER_CAREER.country,
                    type1: USER_CAREER.type1,
                    type2: USER_CAREER.type2,
                    careerName: CAREER_GROUP.career_name
                })
                .from(USER_CAREER)
                .innerJoin(CAREER_GROUP, eq(USER_CAREER.career_group_id, CAREER_GROUP.id))
                .where(
                    and(
                        eq(USER_CAREER.user_id, userId),
                        eq(USER_CAREER.career_group_id, scopeId)
                    )
                );
            
            if (!careerData.length) {
                return NextResponse.json({ message: 'No career information found for this user.' }, { status: 404 });
            }
            
            scopeInfo = careerData[0];
            scopeName = scopeInfo.careerName;
            country = scopeInfo.country;
            type1 = scopeInfo.type1;
            type2 = scopeInfo.type2;
        } 
        else if (scopeType === 'cluster') {
            // Fetch cluster information
            const clusterData = await db
                .select({
                    clusterId: USER_CLUSTER.cluster_id,
                    mbtiType: USER_CLUSTER.mbti_type,
                    riasecCode: USER_CLUSTER.riasec_code,
                    clusterName: CLUSTER.name,
                    description: CLUSTER.brief_overview
                })
                .from(USER_CLUSTER)
                .innerJoin(CLUSTER, eq(USER_CLUSTER.cluster_id, CLUSTER.id))
                .where(
                    and(
                        eq(USER_CLUSTER.user_id, userId),
                        eq(USER_CLUSTER.cluster_id, scopeId)
                    )
                );
            
            if (!clusterData.length) {
                return NextResponse.json({ message: 'No cluster information found for this user.' }, { status: 404 });
            }
            
            scopeInfo = clusterData[0];
            scopeName = scopeInfo.clusterName;
            type1 = scopeInfo.mbtiType || '';
            type2 = scopeInfo.riasecCode || '';
        } 
        else if (scopeType === 'sector') {
            // Fetch sector information
            const sectorData = await db
                .select({
                    sectorId: USER_SECTOR.sector_id,
                    mbtiType: USER_SECTOR.mbti_type,
                    sectorName: SECTOR.name,
                    description: SECTOR.brief_overview
                })
                .from(USER_SECTOR)
                .innerJoin(SECTOR, eq(USER_SECTOR.sector_id, SECTOR.id))
                .where(
                    and(
                        eq(USER_SECTOR.user_id, userId),
                        eq(USER_SECTOR.sector_id, scopeId)
                    )
                );
            
            if (!sectorData.length) {
                return NextResponse.json({ message: 'No sector information found for this user.' }, { status: 404 });
            }
            
            scopeInfo = sectorData[0];
            scopeName = scopeInfo.sectorName;
            type1 = scopeInfo.mbtiType || '';
        }

        // Helper functions for prompt generation
        const getLabel = (scopeType, scopeName) => {
            if (scopeType === "career") return `pursuing a career in ${scopeName}`;
            if (scopeType === "cluster") return `exploring the cluster "${scopeName}"`;
            if (scopeType === "sector") return `navigating the sector "${scopeName}"`;
        };
        
        const getTitle = (scopeType) => {
            if (scopeType === "career") return "career";
            if (scopeType === "cluster") return "cluster";
            if (scopeType === "sector") return "sector";
        };

        // Generate the prompt based on scope type
        const personalityInfo = type1 && type2 ? ` with a ${type1} personality type and ${type2} interest types` : 
                               type1 ? ` with a ${type1} personality type` : '';
        
        const locationInfo = country ? ` in ${country}` : '';
        
        const educationInfo = (educationStage === 'school' || educationStage === 'college') 
            ? ` in ${className} with ${percentageCompleted}% of the academic year completed, who is pursuing their education` 
            : ` who has completed education`;

        const FINAL_PROMPT = `Provide a simple and concise feedback for an individual of age ${age} (currently in week ${currentAgeWeek} of this age)${educationInfo}${personalityInfo} who is ${getLabel(scopeType, scopeName)}${locationInfo}. The feedback should highlight key areas for improvement in this ${getTitle(scopeType)} and what the person needs to change in order to excel in this field. Avoid lengthy descriptions and complex formatting. Ensure the response is valid JSON and exclude the specific personality type terms from the data. Provide the output ${languageOptions[language] || 'in English'} as a single paragraph without additional wrapping other than {}.`;

        // Call OpenAI API
        const response = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: FINAL_PROMPT }],
                max_tokens: 1500,
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );
        
        console.log(`Input tokens of Initaial Feedback: ${response.data.usage.prompt_tokens}`);
        console.log(`Output tokens Initaial Feedback: ${response.data.usage.completion_tokens}`);
        console.log(`Total tokens Initaial Feedback: ${response.data.usage.total_tokens}`);
        console.log("API request completed.");

        let responseText = response.data.choices[0].message.content.trim();
        responseText = responseText.replace(/```json|```/g, "").trim();
        console.log("responseText", responseText);
        
        const parsedFeedback = JSON.parse(responseText);
        console.log(parsedFeedback);

        // Step 4: Save the generated feedback in the USER_FEEDBACK table
        await db
            .insert(USER_FEEDBACK)
            .values({
                user_id: userId,
                feedback: parsedFeedback.feedback,
                feedback_type: scopeType,
            });

        // Return the generated feedback
        return NextResponse.json({ 
            feedback: parsedFeedback.feedback,
            feedback_type: scopeType,
            scope_name: scopeName 
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching or generating feedback:", error);
        return NextResponse.json({ message: 'Error fetching or generating feedback' }, { status: 500 });
    }
}