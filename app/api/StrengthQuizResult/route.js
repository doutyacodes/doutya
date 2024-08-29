import { db } from '@/utils';
import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/jwtMiddleware';
import { and, eq } from 'drizzle-orm';
import { QUIZ_SEQUENCES, STRENGTH_QUESTIONS, STRENGTH_QUIZ_PROGRESS, STRENGTH_TYPES } from '@/utils/schema';

// Fetch personality types and return as a mapping from ID to type name
const fetchStrengthTypes = async () => {
    const types = await db.select().from(STRENGTH_TYPES);
    return types.reduce((acc, type) => {
        acc[type.id] = type.type_name;
        return acc;
    }, {});
};

// Fetch questions by strength type and map question IDs to their type
const fetchQuestionsByType = async () => {
    const questions = await db.select().from(STRENGTH_QUESTIONS);
    return questions.reduce((acc, question) => {
        if (!acc[question.strength_types_id]) {
            acc[question.strength_types_id] = [];
        }
        acc[question.strength_types_id].push(question.id);
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
                            .from(STRENGTH_QUIZ_PROGRESS)
                            .where(eq(STRENGTH_QUIZ_PROGRESS.user_id, userId),)

        // Fetch data from database
        const strengthTypes = await fetchStrengthTypes();
        const questionsByType = await fetchQuestionsByType();

        // Initialize scores for each theme
        const scores = Object.fromEntries(Object.values(strengthTypes).map(type => [type, 0]));

        // Map optionId to score value
        const optionScores = {
            1: 0,  // Disagree
            2: 0,  // Neutral
            3: 1,  // Agree
        };

        // Calculate scores based on responses
        savedProgress.forEach(({ question_id, option_id, strength_type_id }) => {

            const themeName = strengthTypes[strength_type_id];
            // Ensure the question is valid and belongs to the specified strength type
            if (themeName && questionsByType[strength_type_id]?.includes(question_id)) {
                scores[themeName] += optionScores[option_id] || 0;
            }
        });

        // Find the highest score
        const maxScore = Math.max(...Object.values(scores));

        // Get themes with the highest score
        const highestScoredThemes = Object.entries(scores)
        .filter(([theme, count]) => count === maxScore)  // Filter themes with the highest score
        .map(([theme]) => theme);   // Get the full name of each theme

        
        // Join the initials to form the sequence
        const selectedTypes = highestScoredThemes.join(', ');

        // Insert into the database
        try {

            // Update the existing record with the new sequence
            await db.update(QUIZ_SEQUENCES)
            .set({
                type_sequence: selectedTypes,
                isCompleted: true, // Update the type_sequence field
            })
            .where(
                and(
                    eq(QUIZ_SEQUENCES.user_id, userId),
                    eq(QUIZ_SEQUENCES.quiz_id, 3)
                )
            );
        } catch (error) {
            console.error("Error inserting Strength sequence:", error);
            throw error;
        }
        
        return NextResponse.json({ message: 'Strength sequence successfully recorded' }, { status: 201 });

    } catch (error) {
        console.error("Error processing request:", error);
        return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
    }
}
