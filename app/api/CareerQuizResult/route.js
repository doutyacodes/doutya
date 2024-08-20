import { db } from '@/utils';
import { CARRER_SEQUENCE, PERSONALITY_QUESTIONS, PERSONALITY_TYPES, RIASEC_SEQUENCE } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';

// Fetch personality types and return as a mapping from ID to type name
const fetchPersonalityTypes = async () => {
    const types = await db.select().from(PERSONALITY_TYPES);
    return types.reduce((acc, type) => {
        acc[type.id] = type.type_name;
        return acc;
    }, {});
};

// Fetch questions by personality type and map question IDs to their type
const fetchQuestionsByType = async () => {
    const questions = await db.select().from(PERSONALITY_QUESTIONS);
    return questions.reduce((acc, question) => {
        if (!acc[question.personality_types_id]) {
            acc[question.personality_types_id] = [];
        }
        acc[question.personality_types_id].push(question.id);
        return acc;
    }, {});
};

export async function POST(req) {
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
        return authResult.response;
    }

    const userData = authResult.decoded_Data;
    const userId = userData.userId;
    const resultDataArray = await req.json(); 
    
    try {
        // Fetch data from database
        const personalityTypes = await fetchPersonalityTypes();
        const questionsByType = await fetchQuestionsByType();

        // Initialize scores for each theme
        const scores = Object.fromEntries(Object.values(personalityTypes).map(type => [type, 0]));

        console.log("scores", scores);
        

        // Map optionId to score value
        const optionScores = {
            1: 0,  // Strongly Disagree
            2: 0,  // Disagree
            3: 0,  // Neutral
            4: 1,  // Agree
            5: 1   // Strongly Agree
        };

        // Calculate scores based on responses
        resultDataArray.forEach(response => {
            const { questionId, optionId, personaTypeId } = response;
            const themeName = personalityTypes[personaTypeId];

            // Ensure the question is valid and belongs to the specified persona type
            if (themeName && questionsByType[personaTypeId]?.includes(questionId)) {
                scores[themeName] += optionScores[optionId] || 0;
            }
        });
        console.log("scores check", scores);
        // // Determine the RIASEC type sequence based on highest scores
        // const sortedThemes = Object.entries(scores)
        //     .sort(([, a], [, b]) => b - a)  // Sort by score in descending order
        //     .map(([key]) => key[0]);  // Get the initial of each theme

        // const topThemes = Object.entries(scores)
        //     .sort(([, a], [, b]) => b - a)  // Sort by count in descending order
        //     .map(([key]) => key);  // Get the theme name

        //     console.log(topThemes);

        // Create a list of themes with their counts
        // const themesWithCounts = Object.entries(scores).map(([theme, count]) => ({ theme, count }));

        // // Determine the RIASEC type sequence based on counts
        // const riasecType = themesWithCounts
        //     .filter(({ count }) => count > 0)  // Include only themes with counts greater than 0
        //     .map(({ theme }) => theme[0])      // Get the initial of each theme
        //     .join('');                        // Join the initials to form the sequence


        // Find the highest score
        const maxScore = Math.max(...Object.values(scores));

        // Get themes with the highest score
        const highestScoredThemes = Object.entries(scores)
            .filter(([theme, count]) => count === maxScore)  // Filter themes with the highest score
            .map(([theme]) => theme[0]);                      // Get the initial of each theme

        // Join the initials to form the sequence
        const riasecType = highestScoredThemes.join('');


        // Insert RIASEC sequence into the database
        try {
            await db.insert(CARRER_SEQUENCE).values({
                type_sequence: riasecType,
                user_id: userId,
                createddate: new Date()
            });
        } catch (error) {
            console.error("Error inserting RIASEC sequence:", error);
            throw error;
        }
        console.log("riasecType", riasecType);
        
        return NextResponse.json({ message: 'RIASEC sequence successfully recorded' }, { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
