import axios from 'axios';

export async function validateCareer(career) {
    const validationPrompt = `Is "${career}" a valid career name? If yes, provide a brief description of this career and whether it has associated information available. Respond with JSON containing "is_valid" and "description" fields.`;

    let validationResponseText;

    try {
        const validationResponse = await axios.post(
            "https://api.openai.com/v1/chat/completions",
            {
                model: "gpt-4o-mini", // or 'gpt-4' if you have access
                messages: [{ role: "user", content: validationPrompt }],
                max_tokens: 500, // Adjust the token limit as needed
            },
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                    "Content-Type": "application/json",
                },
            }
        );

        validationResponseText = validationResponse.data.choices[0].message.content.trim();
        validationResponseText = validationResponseText.replace(/```json|```/g, "").trim();
        // console.log("validationResponseText", validationResponseText);
        

    } catch (error) {
        throw new Error("Failed to validate career name");
    }

    let validationParsedData;
    try {
        validationParsedData = JSON.parse(validationResponseText);

        if (!validationParsedData.is_valid) {
            return { isValid: false, message: "Invalid career name provided" };
        }

        return { isValid: true, description: validationParsedData.description };

    } catch (error) {
        throw new Error("Failed to parse validation response data");
    }
}
