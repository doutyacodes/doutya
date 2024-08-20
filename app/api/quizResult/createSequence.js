import { db } from '@/utils';
import { QUIZ_SEQUENCES } from "@/utils/schema";

export const createSequence = async (resultDataArray, userId, quizId) => {
    // Define which questions belong to each part
    const parts = {
        firstPart: [1, 2, 3], // questionId for the first part
        secondPart: [4, 5, 6], // questionId for the second part
        thirdPart: [7, 8, 9],  // questionId for the third part
        fourthPart: [10, 11, 12]   // questionId for the fourth part
    };

    const letterMap = {
        1: 'E',
        2: 'I',
        3: 'S',
        4: 'N',
        5: 'T',
        6: 'F',
        7: 'J',
        8: 'P'
    };

    // Function to get analytic IDs for a given part
    const getAnalyticIds = (questions, part) => {
        return questions
            .filter(question => part.includes(question.questionId))
            .map(question => question.analyticId);
    };

    const quizParts = {
        firstPart: getAnalyticIds(resultDataArray, parts.firstPart),
        secondPart: getAnalyticIds(resultDataArray, parts.secondPart),
        thirdPart: getAnalyticIds(resultDataArray, parts.thirdPart),
        fourthPart: getAnalyticIds(resultDataArray, parts.fourthPart)
    };

    const getMostFrequentLetter = ids => {
        const frequency = new Map();

        ids.forEach(id => {
            const letter = letterMap[id];
            if (letter) {
                frequency.set(letter, (frequency.get(letter) || 0) + 1);
            }
        });

        let mostFrequentLetter = '';
        let maxCount = 0;

        frequency.forEach((count, letter) => {
            if (count > maxCount) {
                mostFrequentLetter = letter;
                maxCount = count;
            }
        });

        return mostFrequentLetter;
    };

    const result = {
        firstPart: getMostFrequentLetter(quizParts.firstPart),
        secondPart: getMostFrequentLetter(quizParts.secondPart),
        thirdPart: getMostFrequentLetter(quizParts.thirdPart),
        fourthPart: getMostFrequentLetter(quizParts.fourthPart)
    };

    const personalityType = `${result.firstPart}${result.secondPart}${result.thirdPart}${result.fourthPart}`;

    try {
        await db.insert(QUIZ_SEQUENCES).values({
            type_sequence: personalityType,
            user_id: userId,
            quiz_id: quizId,
            isCompleted: true,
            createddate: new Date()
        });
    } catch (error) {
        console.error("Error inserting personality sequence:", error);
        throw error;  // Rethrow the error to be caught by the calling function
    }
};
