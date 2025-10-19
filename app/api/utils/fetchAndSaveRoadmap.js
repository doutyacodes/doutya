// import axios from 'axios';
// import { db } from "@/utils"; // Ensure this path is correct
// import {
//     MILESTONES,
//     USER_MILESTONES,
//     MILESTONE_CATEGORIES,
//     USER_CAREER_STATUS,
//     CERTIFICATIONS,
//     MILESTONE_SUBCATEGORIES
// } from "@/utils/schema"; // Ensure this path is correct
// import { and, eq } from "drizzle-orm";
// import { getCurrentWeekOfAge } from '@/lib/getCurrentWeekOfAge';
// import { generateCareerDetailsPrompt, generateRoadmapPrompt } from '../services/promptService';

// const languageOptions = {
//     en: 'in English',
//     hi: 'in Hindi',
//     mar: 'in Marathi',
//     ur: 'in Urdu',
//     sp: 'in Spanish',
//     ben: 'in Bengali',
//     assa: 'in Assamese',
//     ge: 'in German',
//     mal:'in malayalam',
//     tam:'in Tamil'
//   };

//   export const maxDuration = 300;
// export const dynamic = 'force-dynamic';

//   export async function fetchAndSaveRoadmap(userId, userCareerID, birth_date, age, careerGroupID, career, type1, type2,language) {
//     console.log("userCareerID:",userCareerID, "age:",age, "career:",career, "type1:",type1, "type2:",type2);
//     try {
//         const currentAgeWeek = getCurrentWeekOfAge(birth_date)
//         const prompt = await generateRoadmapPrompt(
//             userId, career, type1, type2, age, currentAgeWeek, language, languageOptions
//            );

//         console.log("prompt", prompt)

//         const response = await axios.post(
//             "https://api.openai.com/v1/chat/completions",
//             {
//                 model: "gpt-4o-mini",
//                 messages: [{ role: "user", content: prompt }],
//                 max_tokens: 5500,
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
//         console.log(`Total tokens Roadmap: ${response.data.usage.total_tokens}`);

//         let responseText = response.data.choices[0].message.content.trim();
//         responseText = responseText.replace(/```json|```/g, "").trim();
//         console.log("responseText", responseText)
//         let parsedData;

//         try {
//             parsedData = JSON.parse(responseText);
//         } catch (error) {
//             throw new Error("Failed to parse response data");
//         }
//         try {
//             const milestonesForFrontend = [];  // Array to store the milestones in your desired format
//             // Check if roadmap is an array and iterate over each milestone data
//             if (Array.isArray(parsedData.roadmap)) {
//                 for (const milestoneData of parsedData.roadmap) {
//                     if (milestoneData && typeof milestoneData.age === 'number' && milestoneData.milestones) {
//                         const milestoneAge = milestoneData.age;

//                         for (const [category, subcategories] of Object.entries(milestoneData.milestones)) {
//                             const categoryResult = await db
//                                 .select({ id: MILESTONE_CATEGORIES.id })
//                                 .from(MILESTONE_CATEGORIES)
//                                 .where(eq(MILESTONE_CATEGORIES.name, category))
//                                 .execute();

//                             if (categoryResult.length === 0) {
//                                 console.log(`Milestone category ${category} not found.`);
//                                 continue;
//                             }

//                             const categoryId = categoryResult[0].id;

//                             // Handle subcategories within Educational Milestones
//                             if (category === "Educational Milestones") {
//                                 for (const [subcategory, milestones] of Object.entries(subcategories)) {
//                                     const subcategoryResult = await db
//                                         .select({ id: MILESTONE_SUBCATEGORIES.id })
//                                         .from(MILESTONE_SUBCATEGORIES)
//                                         .where(eq(MILESTONE_SUBCATEGORIES.name, subcategory))
//                                         .execute();

//                                     if (subcategoryResult.length === 0) {
//                                         console.log(`Subcategory ${subcategory} not found.`);
//                                         continue;
//                                     }

//                                     const subcategoryId = subcategoryResult[0].id;

//                                     if (subcategory !== "Certification Milestones") {
//                                         // Handle non-certification milestones (e.g., Academic Milestones)
//                                         const milestoneEntries = milestones.split('|')
//                                             .map(desc => desc.trim())
//                                             .filter(desc => desc && desc !== '-' && desc !== "N/A");

//                                         for (const desc of milestoneEntries) {
//                                             const insertMilestone = await db
//                                                 .insert(MILESTONES)
//                                                 .values({
//                                                     category_id: categoryId,
//                                                     subcategory_id: subcategoryId,
//                                                     description: desc,
//                                                     completion_status: false,
//                                                     date_achieved: null,
//                                                     milestone_age: milestoneAge
//                                                 })
//                                                 .execute();

//                                             const milestoneId = insertMilestone[0].insertId;

//                                             // Link the milestone with the user career
//                                             await db.insert(USER_MILESTONES).values({
//                                                 user_career_id: userCareerID,
//                                                 milestone_id: milestoneId
//                                             }).execute();

//                                             // Push to frontend array only if milestoneAge matches the given age
//                                             if (milestoneAge === age) {
//                                                 milestonesForFrontend.push({
//                                                     milestoneId: milestoneId,
//                                                     milestoneDescription: desc,
//                                                     milestoneCategoryName: category,
//                                                     milestoneSubcategoryName: subcategory,
//                                                     milestoneCompletionStatus: false,
//                                                     milestoneDateAchieved: null
//                                                 });
//                                             }
//                                         }
//                                     } else {
//                                         // Handle Certification Milestones
//                                         for (const certification of milestones) {
//                                             const { milestone_description, certification_course_name } = certification;

//                                             // Insert the certification milestone into MILESTONES table
//                                             const insertMilestone = await db
//                                                 .insert(MILESTONES)
//                                                 .values({
//                                                     category_id: categoryId,
//                                                     subcategory_id: subcategoryId,
//                                                     description: milestone_description,
//                                                     completion_status: false,
//                                                     date_achieved: null,
//                                                     milestone_age: milestoneAge
//                                                 })
//                                                 .execute();

//                                             const milestoneId = insertMilestone[0].insertId;

//                                             // Check if a certification with the same name, age, and career_group_id already exists
//                                             const existingCertification = await db
//                                                 .select()
//                                                 .from(CERTIFICATIONS)
//                                                 .where(
//                                                     and(
//                                                         eq(CERTIFICATIONS.certification_name, certification_course_name),
//                                                         eq(CERTIFICATIONS.age, milestoneAge),
//                                                         eq(CERTIFICATIONS.career_group_id, careerGroupID)
//                                                     )
//                                                 )
//                                                 .execute();

//                                             if (existingCertification.length === 0) {
//                                                 // Insert the certification if not found
//                                                 await db
//                                                     .insert(CERTIFICATIONS)
//                                                     .values({
//                                                         certification_name: certification_course_name,
//                                                         age: milestoneAge,
//                                                         career_group_id: careerGroupID,
//                                                         milestone_id: milestoneId
//                                                     })
//                                                     .execute();
//                                             }

//                                             // Link the certification milestone with the user career
//                                             await db.insert(USER_MILESTONES).values({
//                                                 user_career_id: userCareerID,
//                                                 milestone_id: milestoneId
//                                             }).execute();

//                                             // Push to frontend array only if milestoneAge matches the given age
//                                             if (milestoneAge === age) {
//                                                 milestonesForFrontend.push({
//                                                     milestoneId: milestoneId,
//                                                     milestoneDescription: milestone_description,
//                                                     milestoneCategoryName: category,
//                                                     milestoneSubcategoryName: subcategory,
//                                                     milestoneCompletionStatus: false,
//                                                     milestoneDateAchieved: null
//                                                 });
//                                             }
//                                         }
//                                     }
//                                 }
//                             } else {
//                                 // Handle other non-educational categories like Physical or Mental Milestones
//                                 const milestoneEntries = subcategories.split('|')
//                                     .map(desc => desc.trim())
//                                     .filter(desc => desc && desc !== '-' && desc !== "N/A");

//                                 for (const desc of milestoneEntries) {
//                                     const insertMilestone = await db
//                                         .insert(MILESTONES)
//                                         .values({
//                                             category_id: categoryId,
//                                             description: desc,
//                                             completion_status: false,
//                                             date_achieved: null,
//                                             milestone_age: milestoneAge
//                                         })
//                                         .execute();

//                                     const milestoneId = insertMilestone[0].insertId;

//                                     // Link the milestone with the user career
//                                     await db.insert(USER_MILESTONES).values({
//                                         user_career_id: userCareerID,
//                                         milestone_id: milestoneId
//                                     }).execute();

//                                     // Push to frontend array only if milestoneAge matches the given age
//                                     if (milestoneAge === age) {
//                                         milestonesForFrontend.push({
//                                             milestoneId: milestoneId,
//                                             milestoneDescription: desc,
//                                             milestoneCategoryName: category,
//                                             milestoneCompletionStatus: false,
//                                             milestoneDateAchieved: null
//                                         });
//                                     }
//                                 }
//                             }
//                         }

//                     } else {
//                         console.error("Invalid milestone data:", milestoneData);
//                         throw new Error("Invalid milestone data encountered.");
//                     }
//                 }
//                 // Return the milestones array for the frontend
//                 return milestonesForFrontend;
//             }
//         } catch (error) {
//             console.error("Error processing milestones data:", error);
//             throw new Error("Error processing milestones data:", error);
//         }
//     } catch (error) {
//         console.error("Error fetching or saving roadmap:", error);
//         throw error; // Rethrow the error to be caught by the caller
//     }
// }

import axios from "axios";
import { db } from "@/utils";
import {
  MILESTONES,
  USER_MILESTONES,
  MILESTONE_CATEGORIES,
  USER_CAREER_STATUS,
  CERTIFICATIONS,
  MILESTONE_SUBCATEGORIES,
} from "@/utils/schema";
import { and, eq } from "drizzle-orm";
import {
  generateCareerDetailsPrompt,
  generateRoadmapPrompt,
} from "../services/promptService";

const languageOptions = {
  en: "in English",
  hi: "in Hindi",
  mar: "in Marathi",
  ur: "in Urdu",
  sp: "in Spanish",
  ben: "in Bengali",
  assa: "in Assamese",
  ge: "in German",
  mal: "in malayalam",
  tam: "in Tamil",
};

export const maxDuration = 300;
export const dynamic = "force-dynamic";

export async function fetchAndSaveRoadmap(
  userId,
  scopeId,
  classLevel,
  currentMonth,
  parentScopeId,
  scopeName,
  type1,
  type2,
  language,
  scopeType = "career",
  sectorDescription = null,
  educationWorkDescription = null
) {
  console.log(
    `scopeId: ${scopeId}, classLevel: ${classLevel}, currentMonth: ${currentMonth}, scopeType: ${scopeType}, scopeName: ${scopeName}, type1: ${type1}, type2: ${type2}`
  );

  try {
    // Use the modified generateRoadmapPrompt function with class level and current month
    const prompt = await generateRoadmapPrompt(
      userId,
      scopeType,
      scopeName,
      type1,
      type2,
      classLevel,
      currentMonth,
      language,
      languageOptions,
      sectorDescription,
      educationWorkDescription,
    );

    console.log("prompt", prompt);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 5500,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Input tokens Roadmap: ${response.data.usage.prompt_tokens}`);
    console.log(`Output tokens Roadmap: ${response.data.usage.completion_tokens}`);
    console.log(`Total tokens Roadmap: ${response.data.usage.total_tokens}`);

    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/```json|```/g, "").trim();
    console.log("responseText", responseText);

    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      throw new Error("Failed to parse response data");
    }

    try {
      const milestonesForFrontend = []; // Array to store the milestones in your desired format

      // Check if roadmap is an array and iterate over each milestone data
      if (Array.isArray(parsedData.roadmap)) {
        for (const milestoneData of parsedData.roadmap) {
          if (
            milestoneData &&
            typeof milestoneData.interval === "number" &&
            milestoneData.milestones
          ) {
            const milestoneInterval = milestoneData.interval;

            for (const [category, subcategories] of Object.entries(
              milestoneData.milestones
            )) {
              const categoryResult = await db
                .select({ id: MILESTONE_CATEGORIES.id })
                .from(MILESTONE_CATEGORIES)
                .where(eq(MILESTONE_CATEGORIES.name, category))
                .execute();

              if (categoryResult.length === 0) {
                console.log(`Milestone category ${category} not found.`);
                continue;
              }

              const categoryId = categoryResult[0].id;

              // Handle subcategories within Educational Milestones
              if (category === "Educational Milestones") {
                for (const [subcategory, milestones] of Object.entries(
                  subcategories
                )) {
                  const subcategoryResult = await db
                    .select({ id: MILESTONE_SUBCATEGORIES.id })
                    .from(MILESTONE_SUBCATEGORIES)
                    .where(eq(MILESTONE_SUBCATEGORIES.name, subcategory))
                    .execute();

                  if (subcategoryResult.length === 0) {
                    console.log(`Subcategory ${subcategory} not found.`);
                    continue;
                  }

                  const subcategoryId = subcategoryResult[0].id;

                  if (subcategory !== "Certification Milestones") {
                    // Handle non-certification milestones (e.g., Academic Milestones)
                    const milestoneEntries = milestones
                      .split("|")
                      .map((desc) => desc.trim())
                      .filter((desc) => desc && desc !== "-" && desc !== "N/A");

                    for (const desc of milestoneEntries) {
                      // Create milestone values object with dynamic fields based on scope type
                      const milestoneValues = {
                        category_id: categoryId,
                        subcategory_id: subcategoryId,
                        description: desc,
                        class_level: classLevel,
                        milestone_interval: milestoneInterval,
                      };

                      // Add scope-specific fields
                      if (scopeType === "sector") {
                        milestoneValues.sector_id = scopeId;
                      } else if (scopeType === "cluster") {
                        milestoneValues.cluster_id = scopeId;
                      }

                      const insertMilestone = await db
                        .insert(MILESTONES)
                        .values(milestoneValues)
                        .execute();

                      const milestoneId = insertMilestone[0].insertId;

                      // Link the milestone with the user scope using the new schema
                      await db
                        .insert(USER_MILESTONES)
                        .values({
                          scope_id: parentScopeId,
                          scope_type: scopeType,
                          milestone_id: milestoneId,
                          user_id: userId,
                        })
                        .execute();

                      // Push to frontend array only if milestoneInterval matches the current month
                      if (milestoneInterval === currentMonth) {
                        milestonesForFrontend.push({
                          milestoneId: milestoneId,
                          milestoneDescription: desc,
                          milestoneCategoryName: category,
                          milestoneSubcategoryName: subcategory,
                          milestoneCompletionStatus: false,
                          milestoneDateAchieved: null,
                        });
                      }
                    }
                  } else {
                    // Handle Certification Milestones
                    for (const certification of milestones) {
                      const {
                        milestone_description,
                        certification_course_name,
                      } = certification;

                      // Create milestone values object with dynamic fields based on scope type
                      const milestoneValues = {
                        category_id: categoryId,
                        subcategory_id: subcategoryId,
                        description: milestone_description,
                        class_level: classLevel,
                        milestone_interval: milestoneInterval,
                      };

                      // Add scope-specific fields
                      if (scopeType === "sector") {
                        milestoneValues.sector_id = scopeId;
                      } else if (scopeType === "cluster") {
                        milestoneValues.cluster_id = scopeId;
                      }

                      // Insert the certification milestone into MILESTONES table
                      const insertMilestone = await db
                        .insert(MILESTONES)
                        .values(milestoneValues)
                        .execute();

                      const milestoneId = insertMilestone[0].insertId;

                      // Check if a certification with the same name, interval, class, and scope already exists
                      const existingCertification = await db
                        .select()
                        .from(CERTIFICATIONS)
                        .where(
                          and(
                            eq(
                              CERTIFICATIONS.certification_name,
                              certification_course_name
                            ),
                            eq(CERTIFICATIONS.class_level, classLevel),
                            eq(
                              CERTIFICATIONS.milestone_interval,
                              milestoneInterval
                            ),
                            eq(CERTIFICATIONS.scope_id, parentScopeId),
                            eq(CERTIFICATIONS.scope_type, scopeType)
                          )
                        )
                        .execute();

                      if (existingCertification.length === 0) {
                        // Insert the certification with the updated schema
                        await db
                          .insert(CERTIFICATIONS)
                          .values({
                            certification_name: certification_course_name,
                            class_level: classLevel,
                            milestone_interval: milestoneInterval,
                            scope_id: parentScopeId,
                            scope_type: scopeType,
                            milestone_id: milestoneId,
                          })
                          .execute();
                      }

                      // Link the certification milestone with the user scope
                      await db
                        .insert(USER_MILESTONES)
                        .values({
                          scope_id: parentScopeId,
                          scope_type: scopeType,
                          milestone_id: milestoneId,
                          user_id: userId,
                        })
                        .execute();

                      // Push to frontend array only if milestoneInterval matches the current month
                      if (milestoneInterval === currentMonth) {
                        milestonesForFrontend.push({
                          milestoneId: milestoneId,
                          milestoneDescription: milestone_description,
                          milestoneCategoryName: category,
                          milestoneSubcategoryName: subcategory,
                          milestoneCompletionStatus: false,
                          milestoneDateAchieved: null,
                          certificationName: certification_course_name,
                        });
                      }
                    }
                  }
                }
              } else {
                // Handle other non-educational categories like Physical or Mental Milestones
                const milestoneEntries = subcategories
                  .split("|")
                  .map((desc) => desc.trim())
                  .filter((desc) => desc && desc !== "-" && desc !== "N/A");

                for (const desc of milestoneEntries) {
                  // Create milestone values object with dynamic fields based on scope type
                  const milestoneValues = {
                    category_id: categoryId,
                    description: desc,
                    class_level: classLevel,
                    milestone_interval: milestoneInterval,
                  };

                  // Add scope-specific fields
                  if (scopeType === "sector") {
                    milestoneValues.sector_id = scopeId;
                  } else if (scopeType === "cluster") {
                    milestoneValues.cluster_id = scopeId;
                  }

                  const insertMilestone = await db
                    .insert(MILESTONES)
                    .values(milestoneValues)
                    .execute();

                  const milestoneId = insertMilestone[0].insertId;

                  // Link the milestone with the user scope
                  await db
                    .insert(USER_MILESTONES)
                    .values({
                      scope_id: parentScopeId,
                      scope_type: scopeType,
                      milestone_id: milestoneId,
                      user_id: userId,
                    })
                    .execute();

                  // Push to frontend array only if milestoneInterval matches the current month
                  if (milestoneInterval === currentMonth) {
                    milestonesForFrontend.push({
                      milestoneId: milestoneId,
                      milestoneDescription: desc,
                      milestoneCategoryName: category,
                      milestoneCompletionStatus: false,
                      milestoneDateAchieved: null,
                    });
                  }
                }
              }
            }
          } else {
            console.error("Invalid milestone data:", milestoneData);
            throw new Error("Invalid milestone data encountered.");
          }
        }
        // Return the milestones array for the frontend
        return milestonesForFrontend;
      }
    } catch (error) {
      console.error("Error processing milestones data:", error);
      throw new Error(`Error processing milestones data: ${error.message}`);
    }
  } catch (error) {
    console.error("Error fetching or saving roadmap:", error);
    throw error; // Rethrow the error to be caught by the caller
  }
}