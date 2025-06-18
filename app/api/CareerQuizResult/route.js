import { db } from '@/utils';
import { CARRER_SEQUENCE, PERSONALITY_QUESTIONS, PERSONALITY_TYPES, QUIZ_SEQUENCES, RIASEC_SEQUENCE, USER_CAREER_PROGRESS } from '@/utils/schema';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { and, eq } from 'drizzle-orm';

// Fetch personality types and return as a mapping from ID to type name
const fetchPersonalityTypes = async () => {
    const types = await db.select().from(PERSONALITY_TYPES);
    return types.reduce((acc, type) => {
        acc[type.id] = type.type_name;
        return acc;
    }, {});
};

const fetchQuestionsByType = async () => {
    // Query the full range of questions, not just 61-90
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
    
    try {
        const savedProgress = await db
                            .select()
                            .from(USER_CAREER_PROGRESS)
                            .where(eq(USER_CAREER_PROGRESS.user_id, userId),)

        console.log("savedProgress data:", savedProgress);

        // Fetch data from database
        const personalityTypes = await fetchPersonalityTypes();
        console.log("personalityTypes", personalityTypes)

        // Initialize scores for each theme
        const scores = Object.fromEntries(Object.values(personalityTypes).map(type => [type, 0])); 
        
        console.log("Initial scores:", scores)

        // Map optionId to score value
        const optionScores = {
            1: 0,  // Strongly Disagree
            2: 0,  // Disagree
            3: 0,  // Neutral
            4: 1,  // Agree
            5: 2   // Strongly Agree
        };

        // Calculate scores based on responses - skip questionsByType validation
        savedProgress.forEach(({ option_id, personality_type_id }) => {
            const themeName = personalityTypes[personality_type_id];
            
            if (themeName) {
                const scoreToAdd = optionScores[option_id] || 0;
                scores[themeName] += scoreToAdd;
                console.log(`Adding ${scoreToAdd} to ${themeName}, new score: ${scores[themeName]}`);
            }
        });

        // Log the individual scores for each type
        console.log("Scores After Calculations:", scores);
        
        // Sort scores from highest to lowest
        const sortedScores = Object.entries(scores)
            .sort((a, b) => b[1] - a[1]); // Sort by score in descending order
                
        // Get top 3 scores, handling ties properly
        let topTypes = [];
        let includedCount = 0;
        let lastIncludedScore = null;
        
        // Process scores in descending order
        for (const [theme, score] of sortedScores) {
            // If we already have 3 types AND this score is different from the last included one
            if (includedCount >= 3 && score !== lastIncludedScore) {
                break;
            }
            
            // Add this type
            topTypes.push(theme[0]); // First letter of theme name
            lastIncludedScore = score;
            includedCount++;
        }
        
        // Join the initials to form the sequence
        const riasecType = topTypes.join('');
        console.log("riasecType with tie handling:", riasecType);
        
        // Insert RIASEC sequence into the database
        try {
            // Update the existing record with the new riasecType
            await db.update(QUIZ_SEQUENCES)
            .set({
                type_sequence: riasecType,
                isCompleted: true, // Update the type_sequence field
            })
            .where(
                and(
                    eq(QUIZ_SEQUENCES.user_id, userId),
                    eq(QUIZ_SEQUENCES.quiz_id, 2)
                )
            );
        } catch (error) {
            console.error("Error Generating results:", error);
            throw error;
        }
        
        return NextResponse.json({ 
            message: 'Results Generated successfully recorded', 
            // scores, 
            // riasecType 
        }, { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}