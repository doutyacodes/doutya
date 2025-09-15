import { NextResponse } from "next/server";
import { db } from "@/utils";
import { CAREER_NEWS, COMMUNITY, CAREER_GROUP, CLUSTER, SECTOR } from "@/utils/schema";
import { eq, desc, and, gte } from "drizzle-orm";
import { authenticate } from "@/lib/jwtMiddleware";
import axios from "axios";


export const maxDuration = 300; // This function can run for a maximum of 300 seconds
export const dynamic = 'force-dynamic';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const getScopeLabel = (scopeType, scopeLabel) => {
  if (scopeType === "career") return `the career: "${scopeLabel}"`;
  if (scopeType === "cluster") return `the career cluster: "${scopeLabel}"`;
  if (scopeType === "sector") return `the career sector: "${scopeLabel}"`;
};

const basePrompt = (scopeType, scopeLabel) => `
You are an expert news writer and your task is to generate **three recent, accurate, and concise news articles** specifically related to ${getScopeLabel(scopeType, scopeLabel)}.

###  **Guidelines:**
1. Fetch the **latest news** about this ${scopeType}, including industry trends, updates, job market changes, or technological advancements.
2. Ensure the news content is **genuine and realistic** with references to **diverse and valid** news sources.
3. The news should be interesting and engaging for individuals pursuing or interested in this ${scopeType}.

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
   - The \`source_url\` MUST be links to REAL, EXISTING articles that actually exist on the web.
   - Only use homepage URLs of major publications (like nytimes.com, forbes.com, techcrunch.com) if you cannot find a specific article URL.
   - DO NOT invent or create fake article paths or URLs - only use URLs to real articles you know exist.
   - Prioritize mainstream news sites, industry publications, and educational institutions that are likely to have content about this ${scopeType}.
   - If unsure about a specific article URL, use the publication's main domain instead.
4. **Ensure JSON validity:**  
   - Strictly return the news content in **valid JSON format**.  
   - No extra text, comments, or explanations.  

---

###  **Important Instructions:**
- **DO NOT** include irrelevant information or commentary.  
- Only return the **JSON array** with the specified keys.  
- The news must be **credible, relevant, and properly formatted**.  
- **NEVER invent URLs** - only use real, working URLs to actual sites and articles.
`;

async function fetchNews(scopeId, scopeType, scopeName) {
  try {
    const prompt = basePrompt(scopeType, scopeName);
    console.log(`Generating news for ${scopeType}: ${scopeName}`);

    // First create entries with pending status
    for (let i = 0; i < 3; i++) {
      await db.insert(CAREER_NEWS).values({
        scope_id: scopeId,
        scope_type: scopeType,
        title: `Generating news for ${scopeName}...`,
        summary: "News is being generated. Please check back shortly.",
        source_url: "#",
        published_at: new Date(),
        created_at: new Date(),
        status: "pending"
      }).execute();
    }

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

    console.log(`Input tokens News generation: ${response.data.usage.prompt_tokens}`);
    console.log(`Output tokens News generation: ${response.data.usage.completion_tokens}`);
    console.log(`Total tokens News generation: ${response.data.usage.total_tokens}`);

    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/```json|```/g, "").trim();

    // Attempt parsing
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (error) {
      console.error(`Failed to parse response for ${scopeName}:`, error);
      
      // Update pending entries to failed
      const pendingEntries = await db
        .select({ id: CAREER_NEWS.id })
        .from(CAREER_NEWS)
        .where(
          and(
            eq(CAREER_NEWS.scope_id, scopeId),
            eq(CAREER_NEWS.scope_type, scopeType),
            eq(CAREER_NEWS.status, "pending")
          )
        )
        .execute();
      
      for (const entry of pendingEntries) {
        await db
          .update(CAREER_NEWS)
          .set({ status: "failed" })
          .where(eq(CAREER_NEWS.id, entry.id))
          .execute();
      }
      
      return null;
    }

    // Get the pending entries to update
    const pendingEntries = await db
      .select({ id: CAREER_NEWS.id })
      .from(CAREER_NEWS)
      .where(
        and(
          eq(CAREER_NEWS.scope_id, scopeId),
          eq(CAREER_NEWS.scope_type, scopeType),
          eq(CAREER_NEWS.status, "pending")
        )
      )
      .limit(3)
      .execute();

    // Update the pending entries with the actual news
    for (let i = 0; i < Math.min(pendingEntries.length, parsedData.length); i++) {
      await db
        .update(CAREER_NEWS)
        .set({
          title: parsedData[i].title,
          summary: parsedData[i].summary,
          source_url: parsedData[i].source_url,
          status: "completed"
        })
        .where(eq(CAREER_NEWS.id, pendingEntries[i].id))
        .execute();
    }

    return parsedData;
  } catch (error) {
    console.error(`Error generating news for ${scopeType} ${scopeName}:`, error);
    
    // Update pending entries to failed
    const pendingEntries = await db
      .select({ id: CAREER_NEWS.id })
      .from(CAREER_NEWS)
      .where(
        and(
          eq(CAREER_NEWS.scope_id, scopeId),
          eq(CAREER_NEWS.scope_type, scopeType),
          eq(CAREER_NEWS.status, "pending")
        )
      )
      .execute();
    
    for (const entry of pendingEntries) {
      await db
        .update(CAREER_NEWS)
        .set({ status: "failed" })
        .where(eq(CAREER_NEWS.id, entry.id))
        .execute();
    }
    
    return null;
  }
}

// Function to wait and check if news generation is complete
async function waitForNewsGeneration(scopeId, scopeType, maxAttempts = 10, delayMs = 2000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Check if news is ready
    const news = await db
      .select()
      .from(CAREER_NEWS)
      .where(
        and(
          eq(CAREER_NEWS.scope_id, scopeId),
          eq(CAREER_NEWS.scope_type, scopeType),
          eq(CAREER_NEWS.status, "completed"),
          gte(CAREER_NEWS.created_at, getTodayStart())
        )
      )
      .orderBy(desc(CAREER_NEWS.created_at))
      .execute();

    if (news.length > 0) {
      return news; // News is ready
    }

    // Check if generation has failed
    const failedNews = await db
      .select()
      .from(CAREER_NEWS)
      .where(
        and(
          eq(CAREER_NEWS.scope_id, scopeId),
          eq(CAREER_NEWS.scope_type, scopeType),
          eq(CAREER_NEWS.status, "failed"),
          gte(CAREER_NEWS.created_at, getTodayStart())
        )
      )
      .execute();

    if (failedNews.length > 0) {
      return null; // Generation has failed
    }

    // Wait before checking again
    await new Promise(resolve => setTimeout(resolve, delayMs));
  }
  
  return null; // Max attempts reached, assume failure
}

// Helper function to get the start of today in UTC
function getTodayStart() {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
}

// Helper function to get scope name based on scope type and ID
async function getScopeName(scopeType, scopeId) {
  try {
    let result;
    
    if (scopeType === "career") {
      result = await db
        .select({ name: CAREER_GROUP.career_name })
        .from(CAREER_GROUP)
        .where(eq(CAREER_GROUP.id, scopeId))
        .limit(1)
        .execute();
    } else if (scopeType === "cluster") {
      result = await db
        .select({ name: CLUSTER.name })
        .from(CLUSTER)
        .where(eq(CLUSTER.id, scopeId))
        .limit(1)
        .execute();
    } else if (scopeType === "sector") {
      result = await db
        .select({ name: SECTOR.name })
        .from(SECTOR)
        .where(eq(SECTOR.id, scopeId))
        .limit(1)
        .execute();
    }
    
    return result && result.length > 0 ? result[0].name : null;
  } catch (error) {
    console.error(`Error fetching scope name for ${scopeType} ID ${scopeId}:`, error);
    return null;
  }
}

export async function GET(req, { params }) {
  try {
    // Authenticate the request
    const authResult = await authenticate(req);
    if (!authResult.authenticated) {
      return authResult.response;
    }

    const communityId = parseInt(params.communityId);

    if (isNaN(communityId)) {
      return NextResponse.json(
        { message: "Invalid community ID" },
        { status: 400 }
      );
    }

    // Fetch scope info from COMMUNITY table
    const communityDetails = await db
      .select({ 
        scopeId: COMMUNITY.scope_id,
        scopeType: COMMUNITY.scope_type
      })
      .from(COMMUNITY)
      .where(eq(COMMUNITY.id, communityId))
      .limit(1);

    if (!communityDetails.length) {
      return NextResponse.json(
        { message: "Community not found" },
        { status: 404 }
      );
    }

    const scopeId = communityDetails[0].scopeId;
    const scopeType = communityDetails[0].scopeType;

    // Check if we have today's news that is completed
    const todayStart = getTodayStart();
    
    const existingNews = await db
      .select()
      .from(CAREER_NEWS)
      .where(
        and(
          eq(CAREER_NEWS.scope_id, scopeId),
          eq(CAREER_NEWS.scope_type, scopeType),
          eq(CAREER_NEWS.status, "completed"),
          gte(CAREER_NEWS.created_at, todayStart)
        )
      )
      .orderBy(desc(CAREER_NEWS.created_at))
      .execute();

    if (existingNews.length > 0) {
      // We have today's news already generated
      return NextResponse.json(
        { 
          message: "News fetched successfully", 
          news: existingNews,
          source: "cached"
        },
        { status: 200 }
      );
    }

    // Check if news generation is already in progress
    const pendingNews = await db
      .select()
      .from(CAREER_NEWS)
      .where(
        and(
          eq(CAREER_NEWS.scope_id, scopeId),
          eq(CAREER_NEWS.scope_type, scopeType),
          eq(CAREER_NEWS.status, "pending"),
          gte(CAREER_NEWS.created_at, todayStart)
        )
      )
      .execute();

    if (pendingNews.length > 0) {
      // News generation is already in progress, wait for it to complete
      const completedNews = await waitForNewsGeneration(scopeId, scopeType);
      
      if (completedNews) {
        return NextResponse.json(
          { 
            message: "News fetched successfully", 
            news: completedNews,
            source: "waited"
          },
          { status: 200 }
        );
      } else {
        // If we couldn't get completed news, return the most recent news we have
        const fallbackNews = await db
          .select()
          .from(CAREER_NEWS)
          .where(
            and(
              eq(CAREER_NEWS.scope_id, scopeId),
              eq(CAREER_NEWS.scope_type, scopeType)
            )
          )
          .orderBy(desc(CAREER_NEWS.created_at))
          .limit(3)
          .execute();
          
        return NextResponse.json(
          { 
            message: "Could not generate fresh news, returning most recent available", 
            news: fallbackNews,
            source: "fallback"
          },
          { status: 200 }
        );
      }
    }

    // No recent news and no pending generation, so get scope name and generate new news
    const scopeName = await getScopeName(scopeType, scopeId);

    if (!scopeName) {
      return NextResponse.json(
        { message: `${scopeType} not found with ID ${scopeId}` },
        { status: 404 }
      );
    }
    
    // Start news generation
    const newsGeneration = fetchNews(scopeId, scopeType, scopeName);
    
    // Don't wait for it to complete, instead check for any news we can return immediately
    const mostRecentNews = await db
      .select()
      .from(CAREER_NEWS)
      .where(
        and(
          eq(CAREER_NEWS.scope_id, scopeId),
          eq(CAREER_NEWS.scope_type, scopeType)
        )
      )
      .orderBy(desc(CAREER_NEWS.created_at))
      .limit(3)
      .execute();

    return NextResponse.json(
      { 
        message: "News generation initiated. Returning most recent available news.", 
        news: mostRecentNews,
        source: "generation_started"
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in GET news:", error);
    return NextResponse.json(
      { 
        message: error.message || "An unexpected error occurred" 
      },
      { status: 500 }
    );
  }
}