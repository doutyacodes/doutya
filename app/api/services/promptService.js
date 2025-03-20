// src/services/promptService.js

import { enhancePromptWithEducation, getUserEducationPromptData } from "@/utils/promptUtils";


    // Industry suggestions prompt
    export const generateIndustryPrompt = async (userId, type2, country, language, languageOptions) => {
    const educationData = await getUserEducationPromptData(userId);
    
    const basePrompt = `Provide a list of the 3 normal, 3 trending, and 3 off-beat sectors ${
        country ? "in " + country : ""
    } for an individual with RIASEC interest types of ${type2}. For each industry, include the following information:
        industry_name: A brief title of the industry.

        Ensure that the response is valid JSON, using the specified field names, but do not include the terms 'RIASEC' in the data.
        Provide the response ${languageOptions[language] || 'in English'} keeping the keys in english only. Give it as a single JSON data without any wrapping other than []`;
    
    return enhancePromptWithEducation(basePrompt, educationData);
    };

    // Career suggestions prompt
    export const generateCareerPrompt = async (userId, type1, type2, industry, country, finalAge, currentAgeWeek, language, languageOptions) => {
    const educationData = await getUserEducationPromptData(userId);
    
    const basePrompt = `Provide a list of the most suitable careers ${
        industry === "any" ? "" : `in the ${industry}`
    } ${
        country ? "in " + country : ""
    } for an individual who has an ${type1} personality type and RIASEC interest types of ${type2}. Include 3 traditional careers, 3 trending careers, 3 entrepreneurial careers, 3 offbeat careers, 3 creative careers, 3 hybrid careers, 3 sustainable and green careers, 3 social impact careers, 3 tech-driven careers, 3 experiential careers, and 3 digital and online careers. Additionally, provide ${
        finalAge >= 18
        ? "3 futuristic careers for individual aged " +
            finalAge +
            " in the year " +
            (new Date().getFullYear() + 3)
        : "3 futuristic careers for individual aged " +
            finalAge +
            " until they reach the age of 21."
    }(currently in week ${currentAgeWeek} of this age)
    Ensure that the recommended careers align at least 80% with how compatible the user is with each specific career. Do not overlap careers. For each career, include the following information:
            career_name: A brief title of the career.
            type: trending, offbeat, traditional, futuristic, entrepreneurial, normal, hybrid, creative, sustainable and green, social impact, tech-driven, experiential, digital and online.
            
            Ensure that the response is valid JSON, using the specified field names, but do not include the terms '${type1}' in the data. Provide the response ${
        languageOptions[language] || "in English"
    }, keeping the keys in English only, but the career names should be ${
        languageOptions[language] || "in English"
    }. Present it as a single JSON data array without any wrapping other than []`;
    
    return enhancePromptWithEducation(basePrompt, educationData);
    };

    // Career details prompt
    export const generateCareerDetailsPrompt = async (userId, careerName, type1, type2, country, education_country, currentYear) => {
    const educationData = await getUserEducationPromptData(userId);

    const basePrompt = `Provide a JSON array with a single element, containing detailed information for the career named "${careerName}" for an individual with personality type ${type1} and RIASEC interest types of ${type2}. The fields should be:
    {
        "career_name": "A brief title of the career.",
        "reason_for_recommendation": "Why this career is suitable for someone with these interests.",
        "match": "Percentage of how the user is compatible with this career.Only the number is needed",
        "expenses": "Price range to complete this career, in local currency of ${education_country ? education_country:country} , mention the country and explain shortly in a sentence or two.",
        "salary": "low level , mid level and high level salary scale in the country ${country ? country:education_country} in a short paragraph.",
        "present_trends": "Current trends and opportunities in the field.",
        "future_prospects": "Predictions and potential growth in this career from the year ${currentYear} to ${currentYear + 5}.",
        "beyond_prospects": "Predictions and potential growth in this career from the year ${currentYear + 6} and beyond.",
        "currentYear":${currentYear},
        "tillYear":${currentYear + 5},
        "user_description": "Personality traits, strengths, and preferences that make this career a good fit.",
        "leading_country": "Name the country with most opportunities for the career ${careerName} with short description including the opportunity(in a sentence or two).",
        "similar_jobs": "Provide similar careers name in a sentence for the career "${careerName}" for an individual with personality type ${type1} and RIASEC interest types of ${type2}."
    }.
    Ensure that the response is a valid JSON array with exactly one object, no explanations, and no additional text, using the specified field names, but do not include the terms '${type1}' and '${type2}' in the data.`;
    
    return enhancePromptWithEducation(basePrompt, educationData);
};
  
    // Roadmap prompt
    export const generateRoadmapPrompt = async (userId, career, type1, type2, age, currentAgeWeek, language, languageOptions) => {
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
        // - roadmap: Create a step-by-step roadmap containing academics, extracurricular activities, and other activities for a ${age}-year-old (currently in week ${currentAgeWeek} of this age) until the age of ${age + 1}-year-old aspiring to be a ${career} for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} The education level is '${education}'. 
        
        // The roadmap should be broken down into **intervals of every 6 months** (i.e., ${age}, ${age + 0.5}, ${age + 1}), and milestones must be provided for **each 6-month interval**. Ensure that each interval includes:
    
        // 1. Educational Milestones (divided into **Academic Milestones** and **Certification Milestones**)
        // 2. Physical Milestones
        // 3. Mental Milestones
    
        // Each of the **Educational**, **Physical**, and **Mental Milestones** should have **at least three milestones**. If you have more milestones, please include them as well. Each milestone should be separated with a '|' symbol.
    
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
        
        // const basePrompt = `Provide detailed information for the career named "${career}" based on the following criteria:
        // - Personality Type: ${type1}
        // - RIASEC Interest Types: ${type2}
        
        // For this career, include the following information:
        // - career_name: A brief title of the career.
        // - reason_for_recommendation: Why this career is suitable for someone with these interests.
        // - present_trends: Current trends and opportunities in the field.
        // - future_prospects: Predictions and potential growth in this career.
        // - user_description: A narrative description of the personality traits, strengths, and preferences of the user that make this career a good fit, written in full-text format.
        // - roadmap: Create a step-by-step roadmap containing academics, extracurricular activities, and other activities for a ${age}-year-old (currently in week ${currentAgeWeek} of this age) until the age of ${age + 1}-year-old aspiring to be a ${career} for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} The education level is '${education}'. 
        
        // The roadmap should be broken down into **intervals of every month** (i.e., ${age}, ${age + 0.1}, ${age + 0.2}, ${age + 0.3}, ${age + 0.4}, ${age + 0.5}, ${age + 0.6}, ${age + 0.7}, ${age + 0.8}, ${age + 0.9}, ${age + 0.10}, ${age + 0.11}, ${age + 1}), and milestones must be provided for **each monthly interval**. Ensure that each interval includes:
    
        // 1. Educational Milestones (divided into **Academic Milestones** and **Certification Milestones**)
        // 2. Physical Milestones
        // 3. Mental Milestones
    
        // Each of the **Educational**, **Physical**, and **Mental Milestones** should have **at least three milestones**. If you have more milestones, please include them as well. Each milestone should be separated with a '|' symbol.
    
        // The **Educational Milestones** should include:
        // - **Academic Milestones**: These should include formal education achievements (e.g., university, college) and any certifications from private or official organizations tied to the career (such as industry-standard certifications).
        // - **Certification Milestones**: These should be general certifications relevant to the career named "${career}", and **must not be tied to private companies, organizations, or vendors like CompTIA, Microsoft, etc..**. Only include the name of the course (do not include the platform or organization offering the course).
    
        // Each milestone should be structured as follows:
        // {
        // "age": <age_with_month>,
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
        

        const basePrompt = `Provide detailed information for the career named "${career}" based on the following criteria:
        - Personality Type: ${type1}
        - RIASEC Interest Types: ${type2}
        
        For this career, include the following information:
        - career_name: A brief title of the career.
        - reason_for_recommendation: Why this career is suitable for someone with these interests.
        - present_trends: Current trends and opportunities in the field.
        - future_prospects: Predictions and potential growth in this career.
        - user_description: A narrative description of the personality traits, strengths, and preferences of the user that make this career a good fit, written in full-text format.
        - roadmap: Create a step-by-step roadmap containing academics, extracurricular activities, and other activities for a ${age}-year-old (currently in week ${currentAgeWeek} of this age) until the age of ${age + 1}-year-old aspiring to be a ${career} for an individual who has an ${type1} personality type and RIASEC interest types of ${type2}'. 
        
        The roadmap should be broken down into **intervals of every 2 months** (i.e., ${age}, ${age + 0.2}, ${age + 0.4}, ${age + 0.6}, ${age + 0.8}, ${age + 0.10}, ${age + 1}), and milestones must be provided for **each 2-month interval**. Ensure that each interval includes:
    
        1. Educational Milestones (divided into **Academic Milestones** and **Certification Milestones**)
        2. Physical Milestones
        3. Mental Milestones
    
        Each of the **Educational**, **Physical**, and **Mental Milestones** should have **at least three milestones**. If you have more milestones, please include them as well. Each milestone should be separated with a '|' symbol.
    
        The **Educational Milestones** should include:
        - **Academic Milestones**: These should include formal education achievements (e.g., university, college) and any certifications from private or official organizations tied to the career (such as industry-standard certifications).
        - **Certification Milestones**: These should be general certifications relevant to the career named "${career}", and **must not be tied to private companies, organizations, or vendors like CompTIA, Microsoft, etc..**. Only include the name of the course (do not include the platform or organization offering the course).
    
        Each milestone should be structured as follows:
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
    
        Ensure that the response is valid JSON, using the specified field names. Provide the response ${languageOptions[language] || 'in English'}.`;
      
        return enhancePromptWithEducation(basePrompt, educationData);
    };


    export const generateSubjectsPrompt = async (userId, age, careerName, type1, type2, country, currentAgeWeek) => {
        const educationData = await getUserEducationPromptData(userId);
    
        const basePrompt = `for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and  ${age} (currently in week ${currentAgeWeek} of this age) pursuing a career in ${careerName}, identify the most essential academic subjects that provide a solid foundation for this career. Focus specifically on subjects directly related to ${careerName}, considering the educational standards of ${country}. The subjects should be suitable for multiple-choice questions (MCQs) and not merely general foundational subjects.
    
        Provide at least 5 to 10 key subjects relevant for this age, formatted as a JSON object where 'subject-data' as the key, and the value is an array of important subjects. The format should be as follows:
    
        {
        "subject-data": ["Subject1", "Subject2", "Subject3", ...]
        }
    
        Ensure that the response is valid JSON and the array includes only the most relevant subjects for the respective age, considering the career's requirements. Focus on subjects that pertain to theoretical knowledge, fundamental concepts, or history, while excluding practical or subjective areas unsuitable for MCQs.`;
  
        return enhancePromptWithEducation(basePrompt, educationData);
    };


    export const generateSubjectsTestsPrompt = async (userId, age, subjectName, type1, type2, currentAgeWeek) => {
        const educationData = await getUserEducationPromptData(userId);
    
        const basePrompt = `
            Create 10 multiple-choice questions in ${subjectName} for a ${age} year old (currently in week ${currentAgeWeek} of this age) for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and  ${age}.
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
  
        return enhancePromptWithEducation(basePrompt, educationData);
    };

    export const generateCourseTestPrompt = async (userId, career, course, type1, type2, age, currentAgeWeek) =>{

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

    const basePrompt = `
        Generate a comprehensive quiz for the career "${career}" with the course titled "${course}". The quiz should be designed for an individual who has an ${type1} personality type and RIASEC interest types of ${type2} and ${age} (currently in week ${currentAgeWeek} of this age).

        ### topics_covered:
        Before creating the quiz, generate a comprehensive list of topics that would be covered in this course. This should be a single consolidated list rather than divided by weeks. The number of topics should appropriately reflect the breadth and depth of the course content - don't limit to any specific number. Return this as a JSON array of strings:

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
