import axios from 'axios';
import ALL_CLUSTERS from './clusters';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Helper function to extract cluster names from descriptions
const getClusterNames = () => {
  return ALL_CLUSTERS.map(cluster => cluster.split(':')[0].trim());
};

const generateClusterSortingPrompt = (mbtiType, riasecCode, classLevel) => `
You are an expert career counselor specializing in personality-based career guidance for children aged 5-7 years (class levels 1-7). Based on the provided personality type and interest code, select and rank the 5 most suitable career clusters from the 100 available clusters.

**User Profile:**
- Personality Type: ${mbtiType}
- Interest Code: ${riasecCode} 
- Class Level: ${classLevel} (Age: ~${classLevel + 4} years)

**Available Clusters (100 total):**
${ALL_CLUSTERS.map((cluster, index) => {
  const clusterName = cluster.split(':')[0].trim();
  const description = cluster.split(':')[1]?.trim() || '';
  return `${index + 1}. ${clusterName}: ${description}`;
}).join('\n')}

**Analysis Guidelines:**
- Consider age-appropriate career interests and developmental stage
- Match personality cognitive preferences with cluster characteristics
- Align interest patterns with cluster activities
- Think about long-term personality-career fit
- Consider introversion/extraversion needs
- Factor in thinking vs feeling decision-making styles
- Account for sensing vs intuition information processing
- Consider judging vs perceiving lifestyle preferences
- Select only the TOP 5 most suitable clusters from all 100 options

**Interest Code Mapping:**
- R (Realistic): Hands-on, practical, mechanical, outdoors
- I (Investigative): Analytical, scientific, research-oriented
- A (Artistic): Creative, expressive, aesthetic, original
- S (Social): Helping people, teaching, counseling, community-focused
- E (Enterprising): Leadership, persuasion, business, competitive
- C (Conventional): Organized, detail-oriented, structured, systematic

**Output Format (JSON only):**
{
  "sorted_clusters": [
    {
      "rank": 1,
      "cluster": "Exact Cluster Name",
      "suitability_score": 95,
      "reasoning": "Why this cluster is most suitable based on personality and interest profile"
    },
    {
      "rank": 2,
      "cluster": "Exact Cluster Name", 
      "suitability_score": 88,
      "reasoning": "Explanation for second choice"
    },
    {
      "rank": 3,
      "cluster": "Exact Cluster Name", 
      "suitability_score": 82,
      "reasoning": "Explanation for third choice"
    },
    {
      "rank": 4,
      "cluster": "Exact Cluster Name", 
      "suitability_score": 78,
      "reasoning": "Explanation for fourth choice"
    },
    {
      "rank": 5,
      "cluster": "Exact Cluster Name", 
      "suitability_score": 72,
      "reasoning": "Explanation for fifth choice"
    }
  ],
  "personality_summary": "Brief summary of how this personality and interest combination influences career cluster preferences",
  "development_notes": "Age-appropriate guidance for class level ${classLevel} students"
}

**Critical Instructions:**
- Return ONLY valid JSON, no additional text
- Select exactly 5 clusters from the provided list
- Use EXACT cluster names (only the part before the colon) as provided in the list above
- Suitability scores should range 70-100 and be realistic
- Reasoning should be specific to the personality and interest combination
- Consider developmental appropriateness for the age group
- Focus on natural interests and personality tendencies
- NEVER mention "MBTI", "RIASEC", or any assessment methodology terms in the response
- Use only generic terms like "personality traits", "interests", "preferences" in all descriptions
- Ensure selected clusters represent diverse career paths that align with the personality profile
`;

export async function generateClusterSorting(mbtiType, riasecCode, classLevel) {
  try {
    console.log(`Generating cluster sorting for MBTI: ${mbtiType}, RIASEC: ${riasecCode}, Class: ${classLevel}`);
    
    const prompt = generateClusterSortingPrompt(mbtiType, riasecCode, classLevel);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 4000,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Input tokens: ${response.data.usage.prompt_tokens}`);
    console.log(`Output tokens: ${response.data.usage.completion_tokens}`);
    console.log(`Total tokens for cluster sorting: ${response.data.usage.total_tokens}`);

    let responseText = response.data.choices[0].message.content.trim();
    responseText = responseText.replace(/```json|```/g, "").trim();

    console.log(`Response for ${mbtiType}+${riasecCode}:`, responseText);

    // Parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(responseText);
    } catch (parseError) {
      console.warn(`Failed to parse response for ${mbtiType}+${riasecCode}. Retrying...`);
      // Retry once on parse failure
      return await generateClusterSorting(mbtiType, riasecCode, classLevel);
    }

    // Validate the response structure
    if (!parsedData.sorted_clusters || !Array.isArray(parsedData.sorted_clusters) || parsedData.sorted_clusters.length !== 5) {
      throw new Error('Invalid response structure: must contain exactly 5 sorted_clusters');
    }

    // Extract cluster names from the descriptions (everything before the first colon)
    const CLUSTER_NAMES = ALL_CLUSTERS.map(cluster => cluster.split(':')[0].trim());

    // Validate that all returned clusters exist in our cluster list
    const returnedClusters = parsedData.sorted_clusters.map(c => c.cluster);
    const invalidClusters = returnedClusters.filter(cluster => !CLUSTER_NAMES.includes(cluster));

    if (invalidClusters.length > 0) {
      console.warn(`Invalid clusters returned: ${invalidClusters.join(', ')}. Retrying...`);
      // Retry once on invalid cluster names
      return await generateClusterSorting(mbtiType, riasecCode, classLevel);
    }
    // Validate that all clusters are unique
    const uniqueClusters = [...new Set(returnedClusters)];
    if (uniqueClusters.length !== 5) {
      console.warn(`Duplicate clusters returned. Retrying...`);
      // Retry once on duplicate clusters
      return await generateClusterSorting(mbtiType, riasecCode, classLevel);
    }

    return parsedData;
  } catch (error) {
    console.error(`Error generating cluster sorting for ${mbtiType}+${riasecCode}:`, error);
    throw error;
  }
}

// Helper function to validate MBTI type
export function validateMBTI(mbtiType) {
  if (!mbtiType || typeof mbtiType !== 'string' || mbtiType.length !== 4) {
    return false;
  }
  
  const validMBTI = /^[EI][SN][TF][JP]$/i;
  return validMBTI.test(mbtiType);
}

// Helper function to validate RIASEC code
export function validateRIASEC(riasecCode) {
  if (!riasecCode || typeof riasecCode !== 'string') {
    return false;
  }
  
  const validChars = /^[RIASEC]+$/i;
  return validChars.test(riasecCode) && riasecCode.length >= 1 && riasecCode.length <= 6;
}

// Helper function to validate class level
export function validateClassLevel(classLevel) {
  return Number.isInteger(classLevel) && classLevel >= 1 && classLevel <= 12;
}