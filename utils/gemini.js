import axios from "axios";

const API_KEY = process.env.GEMINI_API_KEY;

export async function generateMCQs(prompt) {
  try {
    // 1️⃣ Count input tokens
    const inputTokenRes = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:countTokens",
      {
        contents: [
          {
            parts: [
              {
                text:
                  "You are an expert educator who creates accurate, well-structured multiple-choice questions. For mathematical problems, you always solve them completely before creating options and ensure exactly one correct answer exists.\n\n" +
                  prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": API_KEY,
        },
      }
    );

    const inputTokens = inputTokenRes.data.totalTokens;
    console.log("📥 Input Tokens:", inputTokens);

    // 2️⃣ Generate content
    const response = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent",
      {
        contents: [
          {
            parts: [
              {
                text:
                  "You are an expert educator who creates accurate, well-structured multiple-choice questions. For mathematical problems, you always solve them completely before creating options and ensure exactly one correct answer exists.\n\n" +
                  prompt,
              },
            ],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": API_KEY,
        },
      }
    );

    const output =
      response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    console.log("📝 Model Output:", output);

    // 3️⃣ Count output tokens
    const outputTokenRes = await axios.post(
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:countTokens",
      {
        contents: [
          {
            parts: [{ text: output }],
          },
        ],
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": API_KEY,
        },
      }
    );

    const outputTokens = outputTokenRes.data.totalTokens;
    console.log("📤 Output Tokens:", outputTokens);
    console.log("🔢 Total Tokens:", inputTokens + outputTokens);

    return {
      inputTokens,
      output,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
    };
  } catch (error) {
    console.error("❌ Error in generateMCQs:", error.response?.data || error.message);
    throw error;
  }
}
