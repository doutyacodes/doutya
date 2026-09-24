import { NextResponse } from "next/server";
import { db } from "@/utils";
import { CAREER_GROUP, CAREER_NEWS } from "@/utils/schema";
import { eq, and, gte } from "drizzle-orm";
import axios from "axios";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const basePrompt = (career) => `
You are an expert news writer and your task is to generate **three recent, accurate, and concise news articles** specifically related to the career: "${career}". 

###  **Guidelines:**
1. Fetch the **latest news** about this career, including industry trends, updates, job market changes, or technological advancements.
2. Ensure the news content is **genuine and realistic** with references to **diverse and valid** news sources.
3. The news should be interesting and engaging for individuals pursuing or interested in this career.

---

###  **Output Format (Strict JSON Structure):**
[
    {
        "title": "<Title of the first news article>",
        "summary": "<A brief, clear, and engaging summary of the first news>",
        "source_url": "<A working, real, and valid source link>"
    },
    {
        "title": "<Title of the second news article>",
        "summary": "<A brief, clear, and engaging summary of the second news>",
        "source_url": "<A working, real, and valid source link>"
    },
    {
        "title": "<Title of the third news article>",
        "summary": "<A brief, clear, and engaging summary of the third news>",
        "source_url": "<A working, real, and valid source link>"
    }
]

---

###  **Conditions and Rules:**
1. **Title:**  
   - Concise and attention-grabbing (max 100 characters).  
   - Clearly reflect the main idea of the news.  
2. **Summary:**  
   - Summarize the key points in **2-3 sentences**.  
   - Ensure it captures the essence of the news effectively.  
3. **Source URL:**  
   - The \`source_url\` should link to **valid, working, and reputable news sources**.  
   - Use **diverse and trustworthy sources** (e.g., news agencies, industry blogs, professional journals, etc.)  
4. **Ensure JSON validity:**  
   - Strictly return the news content in **valid JSON format**.  
   - No extra text, comments, or explanations.  

---

###  **Important Instructions:**
- **DO NOT** include irrelevant information or commentary.  
- Only return the **JSON array** with the specified keys.  
- The news must be **credible, relevant, and properly formatted**.  
`;

function getTodayStart() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

async function fetchNews(career, retries = 0) {
  if (retries >= 2) {
    console.warn(`Max retries reached for ${career}. Skipping.`);
    return null;
  }

  try {
    const prompt = basePrompt(career);

    console.log(`Fetching news for career: ${career}` + (retries > 0 ? ` (retry ${retries})` : ""));

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2500,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Input tokens: ${response.data?.usage?.prompt_tokens}`);
    console.log(`Output tokens: ${response.data?.usage?.completion_tokens}`);
    console.log(`Total tokens: ${response.data?.usage?.total_tokens}`);

    let responseText = response.data?.choices?.[0]?.message?.content?.trim() || "";
    responseText = responseText.replace(/^\`\`\`json\s*/i, "").replace(/^\`\`\`\s*/, "").replace(/\s*\`\`\`$/, "").trim();

    const firstBracket = responseText.indexOf("[");
    const lastBracket = responseText.lastIndexOf("]");
    if (firstBracket !== -1 && lastBracket !== -1) {
      responseText = responseText.substring(firstBracket, lastBracket + 1);
    }

    console.log(`Response for ${career}:`, responseText);

    // Attempt parsing (retry on failure)
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      console.warn(`Failed to parse response for ${career}. Retrying...`);
      return await fetchNews(career, retries + 1);
    }

    return parsedData;
  } catch (error) {
    console.error(`Error fetching news for ${career}:`, error?.response?.data || error.message);
    if (retries < 1) {
      return await fetchNews(career, retries + 1);
    }
    return null;
  }
}

export async function GET(req) {
  console.log("Starting news fetch cron job...");

  try {
    const url = req?.url ? new URL(req.url) : null;
    const force = url?.searchParams?.get("force") === "true";
    const todayStart = getTodayStart();

    // 1. Fetch all careers from career_group table
    const careers = await db
      .select()
      .from(CAREER_GROUP)
      .execute();

    if (!careers.length) {
      console.log("No careers found.");
      return NextResponse.json({ message: "No careers to process" }, { status: 404 });
    }

    let processedCount = 0;
    let skippedCount = 0;

    for (const career of careers) {
      const { id, career_name: name } = career;

      // Skip if news already exists for today unless forced
      if (!force) {
        const existing = await db
          .select({ id: CAREER_NEWS.id })
          .from(CAREER_NEWS)
          .where(
            and(
              eq(CAREER_NEWS.scope_id, id),
              eq(CAREER_NEWS.scope_type, "career"),
              eq(CAREER_NEWS.status, "completed"),
              gte(CAREER_NEWS.created_at, todayStart)
            )
          )
          .limit(1)
          .execute();

        if (existing.length > 0) {
          console.log(`News already exists today for career ${name} (ID: ${id}), skipping.`);
          skippedCount++;
          continue;
        }
      }

      console.log(`Processing career: ${name}`);

      const newsData = await fetchNews(name);

      if (newsData && Array.isArray(newsData)) {
        console.log(`Saving news for ${name}:`, newsData);

        for (const news of newsData) {
          if (!news.title || !news.summary) continue;

          await db.insert(CAREER_NEWS).values({
            scope_id: id,
            scope_type: "career",
            title: (news.title || "").substring(0, 255),
            summary: news.summary || "",
            source_url: (news.source_url || "#").substring(0, 500),
            status: "completed",
            published_at: new Date(),
            created_at: new Date(),
          }).execute();
        }
        processedCount++;
      }
    }

    console.log(`News fetch cron job completed. Processed: ${processedCount}, Skipped: ${skippedCount}`);
    return NextResponse.json({
      message: "News fetched successfully",
      processed: processedCount,
      skipped: skippedCount
    }, { status: 200 });

  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json({ message: "Failed to fetch news", error: error.message }, { status: 500 });
  }
}
