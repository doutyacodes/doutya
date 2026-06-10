// import { NextResponse } from "next/server";
// import { db } from "@/utils";
// import { CAREER_GROUP, CAREER_NEWS } from "@/utils/schema";
// import axios from "axios";

// const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// const basePrompt = (career) => `
// You are an expert news writer and your task is to generate **three recent, accurate, and concise news articles** specifically related to the career: "${career}". 

// ###  **Guidelines:**
// 1. Fetch the **latest news** about this career, including industry trends, updates, job market changes, or technological advancements.
// 2. Ensure the news content is **genuine and realistic** with references to **diverse and valid** news sources.
// 3. The news should be interesting and engaging for individuals pursuing or interested in this career.

// ---

// ###  **Output Format (Strict JSON Structure):**
// [
//     {
//         "title": "<Title of the first news article>",
//         "summary": "<A brief, clear, and engaging summary of the first news>",
//         "source_url": "<A working, real, and valid source link>"
//     },
//     {
//         "title": "<Title of the second news article>",
//         "summary": "<A brief, clear, and engaging summary of the second news>",
//         "source_url": "<A working, real, and valid source link>"
//     },
//     {
//         "title": "<Title of the third news article>",
//         "summary": "<A brief, clear, and engaging summary of the third news>",
//         "source_url": "<A working, real, and valid source link>"
//     }
// ]

// ---

// ###  **Conditions and Rules:**
// 1. **Title:**  
//    - Concise and attention-grabbing (max 100 characters).  
//    - Clearly reflect the main idea of the news.  
// 2. **Summary:**  
//    - Summarize the key points in **2-3 sentences**.  
//    - Ensure it captures the essence of the news effectively.  
// 3. **Source URL:**  
//    - The \`source_url\` should link to **valid, working, and reputable news sources**.  
//    - Use **diverse and trustworthy sources** (e.g., news agencies, industry blogs, professional journals, etc.)  
// 4. **Ensure JSON validity:**  
//    - Strictly return the news content in **valid JSON format**.  
//    - No extra text, comments, or explanations.  

// ---

// ###  **Important Instructions:**
// - **DO NOT** include irrelevant information or commentary.  
// - Only return the **JSON array** with the specified keys.  
// - The news must be **credible, relevant, and properly formatted**.  
// `;

// async function fetchNews(career) {
//   try {
//     const prompt = basePrompt(career);

//     console.log(`Fetching news for career: ${career}`);

//     const response = await axios.post(
//       "https://api.openai.com/v1/chat/completions",
//       {
//         model: "gpt-4o-mini",  
//         messages: [{ role: "user", content: prompt }],
//         max_tokens: 2500,
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${OPENAI_API_KEY}`,
//           "Content-Type": "application/json",
//         },
//       }
//     );

    
//     console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
//     console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
//     console.log(`Total tokens Course generation: ${response.data.usage.total_tokens}`);

//     let responseText = response.data.choices[0].message.content.trim();
//     responseText = responseText.replace(/```json|```/g, "").trim();

//     console.log(`Response for ${career}:`, responseText);

//     // Attempt parsing (retry on failure)
//     let parsedData;
//     try {
//       parsedData = JSON.parse(responseText);
//     } catch (error) {
//       console.warn(`Failed to parse response for ${career}. Retrying...`);
//       return await fetchNews(career);  // Retry once on failure
//     }

//     return parsedData;
//   } catch (error) {
//     console.error(`Error fetching news for ${career}:`, error);
//     return null;
//   }
// }

// export async function GET() {
//   console.log("Starting news fetch cron job...");

//   try {
//     // 1. Fetch all careers from career_grp table
//     const careers = await db
//       .select()
//       .from(CAREER_GROUP)
//       .execute();

//     if (!careers.length) {
//       console.log("No careers found.");
//       return NextResponse.json({ message: "No careers to process" }, { status: 404 });
//     }

//     for (const career of careers) {
//       const { id, career_name:name } = career;
//       console.log(`Processing career: ${name}`);

//       const newsData = await fetchNews(name);

//       // Update this part in the GET function
//         if (newsData && Array.isArray(newsData)) {
//             console.log(`Saving news for ${name}:`, newsData);
        
//             for (const news of newsData) {
//                 await db.insert(CAREER_NEWS).values({
//                     career_id: id,
//                     title: news.title,
//                     summary: news.summary,
//                     source_url: news.source_url,
//                     published_at: new Date(),
//                     created_at: new Date(),
//                 }).execute();
//             }
//         }
//     }

//     console.log("News fetch cron job completed.");
//     return NextResponse.json({ message: "News fetched successfully" }, { status: 200 });

//   } catch (error) {
//     console.error("Error in cron job:", error);
//     return NextResponse.json({ message: "Failed to fetch news" }, { status: 500 });
//   }
// }
