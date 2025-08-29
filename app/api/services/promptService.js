// src/services/promptService.js

import { enhancePromptWithEducation, getUserEducationPromptData } from "@/utils/promptUtils";

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

    // Industry suggestions prompt
    export const generateIndustryPrompt = async (userId, type2, country, language, languageOptions) => {
    const educationData = await getUserEducationPromptData(userId);

    const basePrompt = `Generate a list of 3 normal, 3 trending, and 3 off-beat industries${
        country ? " in " + country : ""
    } suitable for an individual with interest types: ${type2}.
    
    For each industry, provide the following in JSON format:
        - industry_name: A brief title of the industry.
    Important instructions:
    - Do not include the word 'RIASEC' anywhere in the data.
    - Keep the JSON keys in English.
    - The values (industry names) should be in ${languageOptions[language] || "English"}.
    - Output only a single valid JSON array ([]) with all industries, without any extra text.`;

    return enhancePromptWithEducation(basePrompt, educationData);
    };

    // Career suggestions prompt
    export const generateCareerPrompt = async (userId, type1, type2, industry, country, finalAge, currentAgeWeek, language, languageOptions) => {
    const educationData = await getUserEducationPromptData(userId);
    
    const basePrompt = `Provide a list of the most suitable careers ${
        industry === "any" ? "" : `in the ${industry}`
    } ${
        country ? "in " + country : ""
    } for an individual who has an ${type1} personality type and RIASEC interest types of ${type2}. Include 3 traditional careers, 3 trending careers, 3 AI-proof career 3 entrepreneurial careers, 3 offbeat careers, 3 creative careers, 3 hybrid careers, 3 sustainable and green careers, 3 social impact careers, 3 tech-driven careers, 3 experiential careers, and 3 digital and online careers. Additionally, provide ${
        finalAge >= 18
        ? "3 futuristic careers for individual aged " +
            finalAge +
            " in the year " +
            (new Date().getFullYear() + 3)
        : "3 futuristic careers for individual aged " +
            finalAge +
            " until they reach the age of 21."
    }(currently in week ${currentAgeWeek} of this age)
    Ensure that the recommended careers align at least 80% with how compatible the user is with each specific career. Do not overlap careers. 
        For each career, include the following information:
            career_name: A brief title of the career.
            type: trending, offbeat, traditional, futuristic, ai-proof, entrepreneurial, normal, hybrid, creative, sustainable and green, social impact, tech-driven, experiential, digital and online.
            description: Why this specific career is suitable for this user based on their ${type1} personality type and ${type2} RIASEC interests. Explain the alignment with their personality traits and interests.
            brief_overview: A concise description of what this career involves, key responsibilities, and typical work environment.
            future_potential: Future growth prospects, emerging opportunities, job market outlook, salary expectations, and career advancement possibilities in this field.

            Ensure that the response is valid JSON with the following structure for each career:
            {
            "career_name": "Career Title",
            "type": "career type",
            "description": "Why suitable for this user",
            "brief_overview": "What the career involves",
            "future_potential": "Growth and opportunities"
            }
            Do not include the terms '${type1}' in the data.
        languageOptions[language] || "in English"
    }, keeping the keys in English only, but the career names should be ${
        languageOptions[language] || "in English"
    }. Present it as a single JSON data array without any wrapping other than []`;
    
    return enhancePromptWithEducation(basePrompt, educationData);
    };

    // Career details prompt
    export const generateCareerDetailsPrompt = async (userId, careerName, type1, type2, country, education_country, currentYear) => {
    const educationData = await getUserEducationPromptData(userId);

    const basePrompt = `Generate detailed information for the career "${careerName}" for an individual with personality type ${type1} and interest types ${type2}.  

    The response must be a JSON array with exactly one object containing the following fields:
    {
        "career_name": "A brief title of the career.",
        "reason_for_recommendation": "Why this career is suitable for someone with these interests.",
        "match": "Percentage of compatibility with this career (number only).",
        "expenses": "Estimated cost to pursue this career in the local currency of ${education_country ? education_country : country}, mention the country and explain briefly in 1–2 sentences.",
        "salary": "Salary scale (low, mid, high) in ${country ? country : education_country}, summarized in a short paragraph.",
        "present_trends": "Current trends and opportunities in this career.",
        "future_prospects": "Predictions and potential growth from ${currentYear} to ${currentYear + 5}.",
        "beyond_prospects": "Predictions and growth from ${currentYear + 6} onward.",
        "currentYear": ${currentYear},
        "tillYear": ${currentYear + 5},
        "user_description": "Personality traits, strengths, and preferences that make this career a good fit.",
        "leading_country": "Country with the most opportunities for ${careerName}, with a short 1–2 sentence description of opportunities.",
        "similar_jobs": "List of similar careers to ${careerName}."
    }

    Rules:
    - Do not include the terms '${type1}' or '${type2}' in the data.
    - Response must be a valid JSON array with exactly one object.
    - No explanations, comments, or text outside of the JSON.`;

    return enhancePromptWithEducation(basePrompt, educationData);
    };

    // Roadmap prompt
    export const generateRoadmapPrompt = async (userId, scopeType, scopeName, type1, type2, age, currentAgeWeek, language, languageOptions) => {
        const educationData = await getUserEducationPromptData(userId);
        
        // const basePrompt = `Provide detailed information for the career named "${career}" based on the following criteria:
        // - Personality Type: ${type1}
        // - RIASEC Interest Types: ${type2}
        
        // For this career, include the following information:
        // - career_name: A brief title of the career.
        // - reason_for_recommendation: Why this career is suitable for someone with these interests.
        // - present_trends: Current trends and opportunities in the field.
        // - future_prospects: Predictions and potential growth in this career.
        // - user_description: A narrative description of the personality traits, strengths, and preferences of the user that make this career a good fit, written in full-text format.
        // - roadmap: Create a step-by-step roadmap containing academics, extracurricular activities, and other activities for a ${age}-year-old (currently in week ${currentAgeWeek} of this age) until the age of ${age + 1}-year-old aspiring to be a ${career} for an individual who has an ${type1} personality type and RIASEC interest types of ${type2}'. 
        
        // The roadmap should be broken down into **intervals of every 2 months** (i.e., ${age}, ${age + 0.2}, ${age + 0.4}, ${age + 0.6}, ${age + 0.8}, ${age + 0.10}, ${age + 1}), and milestones must be provided for **each 2-month interval**. Ensure that each interval includes:
    
        // 1. Educational Milestones (divided into **Academic Milestones** and **Certification Milestones**)
        // 2. Physical Milestones
        // 3. Mental Milestones
    
        // Each of the **Educational**, **Physical**, and **Mental Milestones** should have **three milestones**. Each milestone should be separated with a '|' symbol.
    
        // The **Educational Milestones** should include:
        // - **Academic Milestones**: These should include formal education achievements (e.g., university, college) and any certifications from private or official organizations tied to the career (such as industry-standard certifications).
        // - **Certification Milestones**: These should be general certifications relevant to the career named "${career}", and **must not be tied to private companies, organizations, or vendors like CompTIA, Microsoft, etc..**. Only include the name of the course (do not include the platform or organization offering the course).
    
        // Each milestone should be structured as follows:
        // {
        // "age": <age>,
        // "milestones": {
        //     "Educational Milestones": {
        //     "Academic Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
        //     "Certification Milestones": [
        //         {
        //         "milestone_description": "<description1>",
        //         "certification_course_name": "<certification_name1>"
        //         },
        //         {
        //         "milestone_description": "<description2>",
        //         "certification_course_name": "<certification_name2>"
        //         },
        //         {
        //         "milestone_description": "<description3>",
        //         "certification_course_name": "<certification_name3>"
        //         }
        //     ]
        //     },
        //     "Physical Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
        //     "Mental Milestones": "<milestone1> | <milestone2> | <milestone3> | ..."
        // }
        // }
    
        // Ensure that the response is valid JSON, using the specified field names. Provide the response ${languageOptions[language] || 'in English'}.`;
      
        const getLabel = (scopeType, careerLabel) => {
            if (scopeType === "career") return `aspiring to be a ${careerLabel}`;
            if (scopeType === "cluster") return `exploring the cluster "${careerLabel}"`;
            if (scopeType === "sector") return `navigating the sector "${careerLabel}"`;
          };
          
          const getTitle = (scopeType) => {
            if (scopeType === "career") return "career";
            if (scopeType === "cluster") return "cluster";
            if (scopeType === "sector") return "sector";
          };
          
          const basePrompt = `You are tasked with generating a personalized roadmap and guidance based on the user's current career exploration progress.
          
          The user's current exploration scope is: **${scopeType}**
          
          This scope refers to:
          - **Sector**: A broad domain of related professional paths (e.g., health, technology, education) that includes various clusters and careers.
          - **Cluster**: A group of closely related careers or disciplines within a sector.
          - **Career**: A specific job or role a person can prepare for directly.
          
          Currently, we are generating the roadmap for the given **${getTitle(scopeType)}** named **"${scopeName}"**.
          
          The roadmap must consider:
          - Personality Type: ${type1}
          - RIASEC Interest Types: ${type2}
          
          For this ${getTitle(scopeType)}, include the following information:
          - career_name: A brief title of the ${getTitle(scopeType)}.
          - reason_for_recommendation: Why this ${getTitle(scopeType)} fits someone with these interests.
          - present_trends: Current trends and opportunities in this ${getTitle(scopeType)}.
          - future_prospects: Predictions and potential growth in this ${getTitle(scopeType)}.
          - user_description: A narrative of the user's traits and how they align with this ${getTitle(scopeType)}.
          
          Now, create a step-by-step roadmap specifically tailored for ${getLabel(scopeType, scopeName)} until the age of ${age + 1}-year-old for an individual who has an interest in ${type2}, starting from age ${age} (currently in week ${currentAgeWeek}), broken down into **2-month intervals**:
          (${age}, ${age + 0.2}, ${age + 0.4}, ${age + 0.6}, ${age + 0.8}, ${age + 1})
          
          Each interval must contain:
          1. Educational Milestones (divided into **Academic Milestones** and **Certification Milestones**)
          2. **Physical Milestones**
          3. **Mental Milestones**

         Each of the **Educational**, **Physical**, and **Mental Milestones** should have **three milestones**. Each milestone should be separated with a '|' symbol.

         The **Educational Milestones** should include:
        - **Academic Milestones**: These should include formal education achievements (e.g., university, college) and any certifications from private or official organizations tied to the selected ${scopeType === "career" ? "career" : scopeType === "cluster" ? "cluster" : "sector"}.
        - **Certification Milestones**: These should be general certifications relevant to the selected ${scopeType === "career" ? "career named \"" + scopeName + "\"" : scopeType === "cluster" ? "cluster \"" + scopeName + "\"" : "sector \"" + scopeName + "\""}, and **must not be tied to private companies, organizations, or vendors like CompTIA, Microsoft, etc.** Only include the name of the course (do not include the platform or organization offering the course).
          
          Each milestone group must include exactly **three items** and follow this format:
          
        {
            "age": <age>,
            "milestones": {
                "Educational Milestones": {
                "Academic Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
                "Certification Milestones": [
                    {
                    "milestone_description": "<description1>",
                    "certification_course_name": "<certification_name1>"
                    },
                    {
                    "milestone_description": "<description2>",
                    "certification_course_name": "<certification_name2>"
                    },
                    {
                    "milestone_description": "<description3>",
                    "certification_course_name": "<certification_name3>"
                    }
                ]
                },
                "Physical Milestones": "<milestone1> | <milestone2> | <milestone3> | ...",
                "Mental Milestones": "<milestone1> | <milestone2> | <milestone3> | ..."
            }
        }
          
          Guidelines:
          - If the ${getTitle(scopeType)} is a **career**, give a full detailed roadmap as above.
          - If it is a **cluster**, follow the exact same format but ensure milestones are **structured and versatile** (not limited to a single role).
          - If it is a **sector**, follow the same format but make the milestones **simpler and more general** (broadly applicable to many paths).
          
          Ensure the final output is valid JSON and structured cleanly. Use the following language: ${languageOptions[language] || 'English'}.
          `;
          
        return enhancePromptWithEducation(basePrompt, educationData);
    };


    export const  generateSubjectsPrompt = async (userId, age, scopeName, type1, type2, country, currentAgeWeek, scopeType) => {

        const educationData = await getUserEducationPromptData(userId);
    
        // const basePrompt = `for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and  ${age} (currently in week ${currentAgeWeek} of this age) pursuing a career in ${careerName}, identify the most essential academic subjects that provide a solid foundation for this career. Focus specifically on subjects directly related to ${careerName}, considering the educational standards of ${country}. The subjects should be suitable for multiple-choice questions (MCQs) and not merely general foundational subjects.
    
        // Provide at least 5 to 10 key subjects relevant for this age, formatted as a JSON object where 'subject-data' as the key, and the value is an array of important subjects. The format should be as follows:
    
        // {
        // "subject-data": ["Subject1", "Subject2", "Subject3", ...]
        // }
    
        // Ensure that the response is valid JSON and the array includes only the most relevant subjects for the respective age, considering the career's requirements. Focus on subjects that pertain to theoretical knowledge, fundamental concepts, or history, while excluding practical or subjective areas unsuitable for MCQs.`;
  
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
          
          const basePrompt = `For an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and ${age} (currently in week ${currentAgeWeek} of this age), ${getLabel(scopeType, scopeName)}, identify the most essential academic subjects that provide a solid foundation for this ${getTitle(scopeType)}.
          
          Focus specifically on subjects directly related to the ${getTitle(scopeType)} of "${scopeName}", considering the educational standards of ${country}. The subjects should be suitable for multiple-choice questions (MCQs) and not merely general foundational subjects.
          
          Provide at least 5 to 10 key subjects relevant for this age, formatted as a JSON object where 'subject-data' is the key, and the value is an array of important subjects. The format should be as follows:
          
          {
            "subject-data": ["Subject1", "Subject2", "Subject3", ...]
          }
          
          Ensure that the response is valid JSON and the array includes only the most relevant subjects for the respective age, considering the ${getTitle(scopeType)}'s requirements. Focus on subjects that pertain to theoretical knowledge, fundamental concepts, or history, while excluding practical or subjective areas unsuitable for MCQs.`;

          
        return enhancePromptWithEducation(basePrompt, educationData);
    };


    export const generateSubjectsTestsPrompt = async (userId, age, subjectName, type1, type2, currentAgeWeek) => {
        const educationData = await getUserEducationPromptData(userId);
    
        const basePrompt = `
            Create 10 multiple-choice questions in ${subjectName} for a ${age} year old (currently in week ${currentAgeWeek} of this age) for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and  ${age}.
            Each question should have 4 answer options, and one option should be marked as the correct answer using "is_answer": "yes" for the correct option and "is_answer": "no" for the others.Make sure no questions and the options being repeated and the questions must be apt for the age ${age}. 
            The questions should be unique and difficulty level should be hard.   
            Ensure that the quiz questions are appropriately challenging:
            1. The incorrect options (distractors) should be plausible and related to the course content
            2. Avoid making the correct answer obviously different from the distractors in format, length, or category
            3. All options should be of similar difficulty level and domain
            4. Ensure distractors represent common misconceptions or partial understandings rather than clearly incorrect statements
            5. All options must be in the same conceptual category - avoid having one option that clearly stands out from others
            6. All options should have similar phrasing styles, terminology levels, and length
            7. For numerical questions, wrong answers should reflect common calculation errors or plausible alternative values
            8. Avoid instances where the correct answer is the only complete, grammatically correct, or specific option 
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
  
        return enhancePromptWithEducation(basePrompt, educationData);
    };

    export const generateCourseTestPrompt = async (userId, scopeName, course, type1, type2, age, level, currentAgeWeek, scopeType) =>{

        const educationData = await getUserEducationPromptData(userId);

        /* old prompt with course */
    /*     const basePrompt = `

        Generate a detailed course for the career "${career}" with the course titled "${course}". The course should be designed for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and  ${age} (currently in week ${currentAgeWeek} of this age). Include a full course structure for a 3-week certifiable course. Each week should include topics covered, assignments, and learning outcomes.

        For each week, include:
        1. **Topics Covered:** Provide the specific topics that will be taught each week, as an array of strings.
        2. **Assignments:** Include the practical assignments or tasks students need to complete by the end of the week, as an array of strings.
        3. **Learning Outcomes:** Describe the key skills and knowledge the user will gain after completing the week, as an array of strings.

        - **Prerequisites:** Provide prerequisites or recommended background knowledge as an array of strings.
        - **Skills Acquired:** Provide skills students will develop as an array of strings.
        - **Real-World Applications:** Provide real-world applications as an array of strings, showing how the acquired skills apply in a professional context.

        ### Course Structure:
        Use the following structure for the course, ensuring consistency in output:

        "course_structure": {
            "Week 1": {
                "Topics Covered": [
                    "Topic 1",
                    "Topic 2",
                    "Topic 3"
                ],
                "Assignments": [
                    "Assignment 1",
                    "Assignment 2"
                ],
                "Learning Outcomes": [
                    "Outcome 1",
                    "Outcome 2"
                ]
            },
            "Week 2": {
                "Topics Covered": [
                    "Topic 4",
                    "Topic 5",
                    "Topic 6"
                ],
                "Assignments": [
                    "Assignment 3",
                    "Assignment 4"
                ],
                "Learning Outcomes": [
                    "Outcome 3",
                    "Outcome 4"
                ]
            },
            "Week 3": {
                "Topics Covered": [
                    "Topic 7",
                    "Topic 8",
                    "Topic 9"
                ],
                "Assignments": [
                    "Assignment 5",
                    "Assignment 6"
                ],
                "Learning Outcomes": [
                    "Outcome 5",
                    "Outcome 6"
                ]
            }
        }

    ### final_quiz:
    key name should be(final_quiz)
    For the quiz, provide 20 questions covering key concepts and skills from the course.
    For each question, provide exactly 4 answer options. Only one option should be marked as the correct answer using "is_answer": "yes" and the others should be marked with "is_answer": "no."

    Ensure that the quiz questions are appropriately challenging:
    1. The incorrect options (distractors) should be plausible and related to the course content
    2. Avoid making the correct answer obviously different from the distractors in format, length, or category
    3. All options should be of similar difficulty level and domain
    5. Ensure distractors represent common misconceptions or partial understandings rather than clearly incorrect statements

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

        Ensure that the response is valid JSON, using the specified field names.
    `; */

    // const basePrompt = `
    //     Generate a comprehensive quiz for the career "${career}" with the course titled "${course}". The quiz should be designed for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and ${age} (currently in week ${currentAgeWeek} of this age).

    //     ### topics_covered:
    //     Before creating the quiz, generate a comprehensive list of topics that would be covered in this course. This should be a single consolidated list rather than divided by weeks. The number of topics should appropriately reflect the breadth and depth of the course content - don't limit to any specific number. Return this as a JSON array of strings:

    //     "topics_covered": [
    //         "Topic A",
    //         "Topic B",
    //         "Topic C",
    //         ...
    //     ]

    //     ### final_quiz:
    //     For the quiz, provide 20 questions covering key concepts and skills from the course.
    //     For each question, provide exactly 4 answer options. Only one option should be marked as the correct answer using "is_answer": "yes" and the others should be marked with "is_answer": "no."

    //     Ensure that the quiz questions are appropriately challenging:
    //     1. The incorrect options (distractors) should be plausible and related to the course content
    //     2. Avoid making the correct answer obviously different from the distractors in format, length, or category
    //     3. All options should be of similar difficulty level and domain
    //     4. Ensure distractors represent common misconceptions or partial understandings rather than clearly incorrect statements

    //     Return all questions in a single JSON array, with each question following this format:

    //     {
    //         "question": "Your question text",
    //         "options": [
    //             { "text": "Option 1", "is_answer": "no" },
    //             { "text": "Option 2", "is_answer": "yes" },
    //             { "text": "Option 3", "is_answer": "no" },
    //             { "text": "Option 4", "is_answer": "no" }
    //         ]
    //     }

    //     Make sure there are exactly 20 questions, no more and no less, and that none of the questions or answer options are repeated.

    //     Ensure that the response is valid JSON, using the specified field names.
    //     `;

    // const basePrompt = `
    //     Generate a comprehensive quiz for the career "${scopeName}" with the course titled "${course}". The quiz should be designed for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and ${age} (currently in week ${currentAgeWeek} of this age).

    //     ### Difficulty Level: ${level}
    //     This quiz should reflect a ${level} difficulty level (beginner, intermediate, or advanced) with appropriately challenging content.

    //     ### topics_covered:
    //     Before creating the quiz, generate a comprehensive list of 10 topics that would be covered in this course. This should be a single consolidated list rather than divided by weeks. The number of topics should appropriately reflect the breadth and depth of the course content - don't limit to any specific number. Return this as a JSON array of strings:

    //     "topics_covered": [
    //         "Topic A",
    //         "Topic B",
    //         "Topic C",
    //         ...
    //     ]

    //     ### final_quiz:
    //     For the quiz, provide 20 questions covering key concepts and skills from the course.
    //     For each question, provide exactly 4 answer options. Only one option should be marked as the correct answer using "is_answer": "yes" and the others should be marked with "is_answer": "no."

    //     Ensure that the quiz questions are appropriately challenging:
    //     1. The incorrect options (distractors) should be plausible and related to the course content
    //     2. Avoid making the correct answer obviously different from the distractors in format, length, or category
    //     3. All options should be of similar difficulty level and domain
    //     4. Ensure distractors represent common misconceptions or partial understandings rather than clearly incorrect statements
    //     5. All options must be in the same conceptual category - avoid having one option that clearly stands out from others
    //     6. All options should have similar phrasing styles, terminology levels, and length
    //     7. For numerical questions, wrong answers should reflect common calculation errors or plausible alternative values
    //     8. Avoid instances where the correct answer is the only complete, grammatically correct, or specific option

    //     Adjust the difficulty based on the selected level (${level}):
    //     - For beginner level: Focus on foundational concepts with clear but still clear distinctions
    //     - For intermediate level: Include more nuanced concepts and require deeper understanding to distinguish between options
    //     - For advanced level: Present sophisticated concepts with subtle distinctions that require expert-level understanding

    //     Return all questions in a single JSON array, with each question following this format:

    //     {
    //         "question": "Your question text",
    //         "options": [
    //             { "text": "Option 1", "is_answer": "no" },
    //             { "text": "Option 2", "is_answer": "yes" },
    //             { "text": "Option 3", "is_answer": "no" },
    //             { "text": "Option 4", "is_answer": "no" }
    //         ]
    //     }

    //     Make sure there are exactly 20 questions, no more and no less, and that none of the questions or answer options are repeated.

    //     Ensure that the response is valid JSON, using the specified field names.
    //     `;

    const basePrompt = `
        Generate a comprehensive quiz for the ${scopeType === "career" ? 'career' : scopeType === "cluster" ? 'given cluster' : 'selected sector'} "${scopeName}" with the course titled "${course}". The quiz should be designed for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and ${age} (currently in week ${currentAgeWeek} of this age).

        ### Difficulty Level: ${level}
        This quiz should reflect a ${level} difficulty level (beginner, intermediate, or advanced) with appropriately challenging content.

        ### topics_covered:
        Before creating the quiz, generate a comprehensive list of 10 topics that would be covered in this course. This should be a single consolidated list rather than divided by weeks. The number of topics should appropriately reflect the breadth and depth of the course content - don't limit to any specific number. Return this as a JSON array of strings:

        "topics_covered": [
            "Topic A",
            "Topic B",
            "Topic C",
            ...
        ]

        ### final_quiz:
        For the quiz, provide 20 questions covering key concepts and skills from the course.
        For each question, provide exactly 4 answer options. Only one option should be marked as the correct answer using "is_answer": "yes" and the others should be marked with "is_answer": "no."

        Ensure that the quiz questions are appropriately challenging:
        1. The incorrect options (distractors) should be plausible and related to the course content
        2. Avoid making the correct answer obviously different from the distractors in format, length, or category
        3. All options should be of similar difficulty level and domain
        4. Ensure distractors represent common misconceptions or partial understandings rather than clearly incorrect statements
        5. All options must be in the same conceptual category - avoid having one option that clearly stands out from others
        6. All options should have similar phrasing styles, terminology levels, and length
        7. For numerical questions, wrong answers should reflect common calculation errors or plausible alternative values
        8. Avoid instances where the correct answer is the only complete, grammatically correct, or specific option

        Adjust the difficulty based on the selected level (${level}):
        - For beginner level: Focus on foundational concepts with clear but still clear distinctions
        - For intermediate level: Include more nuanced concepts and require deeper understanding to distinguish between options
        - For advanced level: Present sophisticated concepts with subtle distinctions that require expert-level understanding

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

        Ensure that the response is valid JSON, using the specified field names.
        `;


    return enhancePromptWithEducation(basePrompt, educationData);
    }

    export const generateInitialFeedBackPrompt = async (userId, type1, type2, age, career_name, country, currentAgeWeek, languageOptions, language) =>{

        const educationData = await getUserEducationPromptData(userId);

        const basePrompt = `Provide a simple and concise feedback for an individual of age ${age} (currently in week ${currentAgeWeek} of this age) with a ${type1} personality type and ${type2} RIASEC interest types in the field of ${career_name}${country ? " in " + country : ""}. 
        The feedback should highlight key areas for improvement in this career in order to excel in this career what the person has to change. Avoid lengthy descriptions and complex formatting. Ensure the response is valid JSON and exclude the terms '${type1}' and 'RIASEC' from the data.
        Provide the output ${languageOptions[language] || 'in English'} as a single paragraph without additional wrapping other than {}.`;

    return enhancePromptWithEducation(basePrompt, educationData);
    }