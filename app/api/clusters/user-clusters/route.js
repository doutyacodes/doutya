// app/api/clusters/user-clusters/route.js
import { NextResponse } from "next/server";
import { db } from "@/utils";
import { eq, and } from "drizzle-orm/expressions";
import { authenticate } from "@/lib/jwtMiddleware";
import { USER_CLUSTER, USER_DETAILS, CLUSTER, QUIZ_SEQUENCES } from "@/utils/schema";
import axios from "axios";

export const maxDuration = 60; // Increased for OpenAI API calls
export const dynamic = "force-dynamic";

// Helper function to get age information
const calculateAge = (birthDate) => {
  if (!birthDate) return { age: 25, currentAgeWeek: 0 }; // Default age if not available
  
  const birthDateObj = new Date(birthDate);
  const now = new Date();
  
  // Calculate age
  let age = now.getFullYear() - birthDateObj.getFullYear();
  const monthDiff = now.getMonth() - birthDateObj.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDateObj.getDate())) {
    age--;
  }
  
  // Calculate weeks into current age
  const lastBirthday = new Date(now.getFullYear() - (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birthDateObj.getDate()) ? 1 : 0), 
                                birthDateObj.getMonth(), 
                                birthDateObj.getDate());
  
  const millisecondsPerWeek = 1000 * 60 * 60 * 24 * 7;
  const currentAgeWeek = Math.floor((now - lastBirthday) / millisecondsPerWeek);
  
  return { age, currentAgeWeek };
};

// Function to generate clusters using OpenAI
async function generateClusters(userData) {
  const mbti = userData.personality_type ;
  const riasec = userData.riasec_code ; 
  const { age, currentAgeWeek } = calculateAge(userData.birth_date);
  
  // Construct the OpenAI prompt with sector and stream information
  const prompt = `
You are an expert career guidance counselor and psychologist with deep knowledge of MBTI personality types, RIASEC interest models, career sectors, and age-appropriate career exploration.

Generate a list of **exactly 8 suitable career clusters** for the following user:

- MBTI Personality Type: ${mbti}
- RIASEC Interest Types: ${riasec} (comma-separated)
- Age: ${age} years old (currently in week ${currentAgeWeek} of this age)

### Objective:
Identify 8 distinct career clusters that align with the user's MBTI and RIASEC types, and are developmentally appropriate for their current age. Each career cluster should represent a **broad professional or academic field** that includes multiple possible career paths. The goal is to guide the user toward areas of interest that suit their personality and stage of development.

### Guidelines:
- All clusters must be **suitable for the user's current age**
- Ensure alignment with both MBTI and RIASEC characteristics
- Each cluster should be **clearly distinct** from the others
- Use friendly, engaging, age-appropriate language
- Include **10 example job roles** under each cluster
- Specify the **sector** each cluster belongs to (e.g., Technology, Healthcare, Education, Finance, Creative Arts, Government, Non-profit, Manufacturing, etc.)
- Recommend the **most ideal academic stream/field of study** for this cluster based on the user's profile
- Explain why this cluster is suitable for this specific user based on their MBTI and RIASEC profile
- Provide a brief overview of what this cluster involves
- Describe the future potential and growth prospects in this career cluster

### Output Format:
Return the result as a **valid JSON array** named \`career_clusters\`, with each item structured like this:

\`\`\`json
"career_clusters": [
  {
    "title": "Cluster Name",
    "why_suitable": "Why this cluster is specifically suitable for this user based on their MBTI type, RIASEC interests, and age. Explain the alignment with their personality traits and interests.",
    "brief_overview": "Brief description of what this cluster involves, key activities, and work environment.",
    "future_potential": "Future growth prospects, emerging opportunities, job market outlook, and career advancement possibilities in this field.",
    "sector": "Primary sector this cluster belongs to (e.g., Technology, Healthcare, Education, etc.)",
    "ideal_stream": "Most suitable academic stream/field of study for this user to pursue this cluster (e.g., Computer Science, Medicine, Business Administration, etc.)",
    "related_jobs": [
      "Job Title 1",
      "Job Title 2",
      ...
      "Job Title 10"
    ]
  },
  ...
  // exactly 8 items in total
]
\`\`\`

### Additional Instructions:
- Return **exactly 8 clusters**
- Each cluster must contain **exactly 10 unique job titles**
- Ensure job titles are realistic, varied, and age-appropriate
- Avoid repetition in cluster names or job titles
- Choose sectors from common industry categories: Technology, Healthcare, Education, Finance, Creative Arts, Government, Non-profit, Manufacturing, Retail, Hospitality, Media & Entertainment, Legal, Consulting, Real Estate, Transportation, Energy, Agriculture, etc.
- For ideal_stream, suggest specific academic fields like: Computer Science, Medicine, Engineering, Business Administration, Psychology, Marketing, Graphic Design, Journalism, Law, etc.
- Ensure the entire response is a **valid JSON object**, using correct field names and no extra text or formatting

Only return the JSON response, and nothing else.
`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 6000, // Increased token limit for additional fields
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
    console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
    console.log(`Total tokens Course generation: ${response.data.usage.total_tokens}`);

    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/`json|`/g, "").trim();
    console.log("responseText", responseText);
    
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
      return parsedData.career_clusters || [];
    } catch (error) {
      console.error("Failed to parse response data:", error);
      throw new Error("Failed to parse response data");
    }
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw new Error("Failed to generate clusters");
  }
}

// Function to save generated clusters to database
async function saveClusters(clusters, userId, userData) {
  const savedClusters = [];
  const userClusters = [];

  for (const clusterData of clusters) {
    try {
      // Check if a cluster with this name already exists
      const existingCluster = await db
        .select()
        .from(CLUSTER)
        .where(eq(CLUSTER.name, clusterData.title))
        .execute();

      let clusterId;

      if (existingCluster.length > 0) {
        // Use existing cluster, but update it with new sector and stream info if needed
        clusterId = existingCluster[0].id;
        
        // Update the existing cluster with new fields if they don't exist
        await db
          .update(CLUSTER)
          .set({
            why_suitable: clusterData.why_suitable,
            brief_overview: clusterData.brief_overview,
            future_potential: clusterData.future_potential,
            sector: clusterData.sector,
            ideal_stream: clusterData.ideal_stream,
            related_jobs: JSON.stringify(clusterData.related_jobs),
            updated_at: new Date()
          })
          .where(eq(CLUSTER.id, clusterId))
          .execute();
      } else {
        // Create new cluster with all fields
        const insertResult = await db
          .insert(CLUSTER)
          .values({
            name: clusterData.title,
            why_suitable: clusterData.why_suitable,
            brief_overview: clusterData.brief_overview,
            future_potential: clusterData.future_potential,
            sector: clusterData.sector,
            ideal_stream: clusterData.ideal_stream,
            related_jobs: JSON.stringify(clusterData.related_jobs),
            created_at: new Date(),
            updated_at: new Date()
          })
          .execute();
        
        // Get the inserted ID (depends on your DB driver)
        const lastInsertId = insertResult[0].insertId;
        clusterId = lastInsertId;
      }

      // Check if user-cluster association already exists
      const existingUserCluster = await db
        .select()
        .from(USER_CLUSTER)
        .where(and(
          eq(USER_CLUSTER.user_id, userId),
          eq(USER_CLUSTER.cluster_id, clusterId)
        ))
        .execute();

      if (existingUserCluster.length === 0) {
        // Associate cluster with user
        await db
          .insert(USER_CLUSTER)
          .values({
            user_id: userId,
            cluster_id: clusterId,
            mbti_type: userData.personality_type,
            riasec_code: userData.riasec_code,
            selected: false,
            created_at: new Date()
          })
          .execute();
      }

      // Get the full cluster for returning to frontend
      const fullCluster = await db
        .select()
        .from(CLUSTER)
        .where(eq(CLUSTER.id, clusterId))
        .execute();

      savedClusters.push(fullCluster[0]);
      
      // Get the user cluster association
      const userCluster = await db
        .select()
        .from(USER_CLUSTER)
        .where(and(
          eq(USER_CLUSTER.user_id, userId),
          eq(USER_CLUSTER.cluster_id, clusterId)
        ))
        .execute();
        
      userClusters.push(userCluster[0]);
    } catch (error) {
      console.error("Error saving cluster:", error);
      // Continue with the next cluster even if this one fails
    }
  }

  return { savedClusters, userClusters };
}

// GET endpoint to retrieve user's clusters
export async function GET(req) {
  const authResult = await authenticate(req);
  if (!authResult.authenticated) {
    return authResult.response;
  }

  const userData = authResult.decoded_Data;
  const userId = userData.userId;

  try {
    // First, get basic user data including plan type
    const userDetails = await db
      .select()
      .from(USER_DETAILS)
      .where(eq(USER_DETAILS.id, userId))
      .execute();

    if (userDetails.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Get user's quiz results - MBTI (Quiz ID 1)
    const mbtiQuiz = await db
      .select()
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, userId),
          eq(QUIZ_SEQUENCES.quiz_id, 1),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        )
      )
      .execute();

    // Get user's quiz results - RIASEC (Quiz ID 2)
    const riasecQuiz = await db
      .select()
      .from(QUIZ_SEQUENCES)
      .where(
        and(
          eq(QUIZ_SEQUENCES.user_id, userId),
          eq(QUIZ_SEQUENCES.quiz_id, 2),
          eq(QUIZ_SEQUENCES.isCompleted, true)
        )
      )
      .execute();

    const personalityType = mbtiQuiz.length > 0 ? mbtiQuiz[0].type_sequence : "";
    const riasecCode = riasecQuiz.length > 0 ? riasecQuiz[0].type_sequence : "";

    // Compile full user data
    const fullUserData = {
      ...userDetails[0],
      personality_type: personalityType,
      riasec_code: riasecCode,
      ...calculateAge(userDetails[0].birth_date)
    };

    // Check if user already has cluster associations
    const existingUserClusters = await db
      .select({
        id: USER_CLUSTER.id,
        user_id: USER_CLUSTER.user_id,
        cluster_id: USER_CLUSTER.cluster_id,
        mbti_type: USER_CLUSTER.mbti_type,
        riasec_code: USER_CLUSTER.riasec_code,
        selected: USER_CLUSTER.selected,
        created_at: USER_CLUSTER.created_at
      })
      .from(USER_CLUSTER)
      .where(eq(USER_CLUSTER.user_id, userId))
      .execute();

    let clusters = [];
    let userClusters = [];

    if (existingUserClusters.length > 0) {
      // User already has clusters, fetch the full cluster details
      const clusterIds = existingUserClusters.map(uc => uc.cluster_id);
      
      // Fetch all clusters with new fields
      clusters = await Promise.all(clusterIds.map(async (id) => {
        const result = await db
          .select({
            id: CLUSTER.id,
            name: CLUSTER.name,
            why_suitable: CLUSTER.why_suitable,
            brief_overview: CLUSTER.brief_overview,
            future_potential: CLUSTER.future_potential,
            sector: CLUSTER.sector,
            ideal_stream: CLUSTER.ideal_stream,
            related_jobs: CLUSTER.related_jobs,
            created_at: CLUSTER.created_at,
            updated_at: CLUSTER.updated_at
          })
          .from(CLUSTER)
          .where(eq(CLUSTER.id, id))
          .execute();
        return result[0];
      }));
      
      userClusters = existingUserClusters;

      // Check if existing clusters need to be regenerated (if they don't have sector/stream data)
      const needsRegeneration = clusters.some(cluster => !cluster.sector || !cluster.ideal_stream || !cluster.brief_overview || !cluster.future_potential);
      
      if (needsRegeneration) {
        console.log("Existing clusters missing sector/stream data, regenerating...");
        try {
          // Regenerate clusters with new fields
          const generatedClusters = await generateClusters(fullUserData);
          
          // Save updated clusters to database
          const savedData = await saveClusters(generatedClusters, userId, fullUserData);
          
          clusters = savedData.savedClusters;
          userClusters = savedData.userClusters;
        } catch (error) {
          console.error("Error regenerating clusters:", error);
          // Continue with existing data if regeneration fails
        }
      }
    } else {
      // User doesn't have clusters yet, generate and save them
      try {
        // Generate clusters based on user data
        const generatedClusters = await generateClusters(fullUserData);
        
        // Save to database and get full data
        const savedData = await saveClusters(generatedClusters, userId, fullUserData);
        
        clusters = savedData.savedClusters;
        userClusters = savedData.userClusters;
      } catch (error) {
        console.error("Error generating clusters:", error);
        return NextResponse.json(
          { message: "Failed to generate clusters" },
          { status: 500 }
        );
      }
    }

    // Process clusters to include parsed related_jobs
    const processedClusters = clusters.map(cluster => ({
      ...cluster,
      related_jobs: typeof cluster.related_jobs === 'string' 
        ? JSON.parse(cluster.related_jobs) 
        : cluster.related_jobs
    }));

    // Prepare and return the response
    return NextResponse.json({
      userData: {
        plan_type: fullUserData.plan_type || "base",
        personality_type: fullUserData.personality_type,
        riasec_code: fullUserData.riasec_code,
        age: fullUserData.age,
        current_age_week: fullUserData.currentAgeWeek
      },
      clusters: processedClusters,
      userClusters
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user clusters:", error);
    return NextResponse.json(
      { message: "Failed to fetch user clusters" },
      { status: 500 }
    );
  }
}