import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const generateSectorSortingPrompt = (mbtiType, riasecCode, classLevel) => `
You are an expert career counselor specializing in personality-based career guidance for children aged 5-7 years (class levels 1-7). Based on the provided personality type and interest code, sort the 6 career sectors from most to least suitable.

**User Profile:**
- Personality Type: ${mbtiType}
- Interest Code: ${riasecCode} 
- Class Level: ${classLevel} (Age: ~${classLevel + 4} years)

**Available Sectors:**
1. **Nature** - Earth systems, agriculture, environmental conservation, renewable resources 
2. **Making** - Engineering, technology, manufacturing, building systems and infrastructure  `${*}`
3. **Life** - Healthcare, medicine, human wellbeing, biological sciences `${*}`
4. **Knowledge** - Research, education, discovery, academic  `${*}`
5. **Society** - Governance, business, law, economic systems, human organization `${*}`
6. **Culture** - Arts, entertainment, creativity, sports, cultural expression

**Analysis Guidelines:**
- Consider age-appropriate career interests and developmental stage
- Match personality cognitive preferences with sector characteristics
- Align interest patterns with sector activities
- Think about long-term personality-career fit
- Consider introversion/extraversion needs
- Factor in thinking vs feeling decision-making styles
- Account for sensing vs intuition information processing
- Consider judging vs perceiving lifestyle preferences

**Interest Code Mapping:**
- R (Realistic): Hands-on, practical, mechanical, outdoors
- I (Investigative): Analytical, scientific, research-oriented
- A (Artistic): Creative, expressive, aesthetic, original
- S (Social): Helping people, teaching, counseling, community-focused
- E (Enterprising): Leadership, persuasion, business, competitive
- C (Conventional): Organized, detail-oriented, structured, systematic

**Output Format (JSON only):**
{
  "sorted_sectors": [
    {
      "rank": 1,
      "sector": "Sector Name",
      "suitability_score": 95,
      "reasoning": "Why this sector is most suitable based on personality and interest profile"
    },
    {
      "rank": 2,
      "sector": "Sector Name", 
      "suitability_score": 85,
      "reasoning": "Explanation for second choice"
    },
    // ... continue for all 6 sectors
  ],
  "personality_summary": "Brief summary of how this personality and interest combination influences career preferences",
  "development_notes": "Age-appropriate guidance for class level ${classLevel} students"
}

**Important Instructions:**
- Return ONLY valid JSON, no additional text
- Include all 6 sectors in ranking order
- Suitability scores should range 60-100 and be realistic
- Reasoning should be specific to the personality and interest combination
- Consider developmental appropriateness for the age group
- Focus on natural interests and personality tendencies
- NEVER mention "MBTI", "RIASEC", or any assessment methodology terms in the response
- Use only generic terms like "personality traits", "interests", "preferences" in all descriptions
`;

export async function generateSectorSorting(mbtiType, riasecCode, classLevel) {
  try {
    console.log(`Generating sector sorting for MBTI: ${mbtiType}, RIASEC: ${riasecCode}, Class: ${classLevel}`);
    
    const prompt = generateSectorSortingPrompt(mbtiType, riasecCode, classLevel);

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 2000,
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
    console.log(`Total tokens for sector sorting: ${response.data.usage.total_tokens}`);

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
      return await generateSectorSorting(mbtiType, riasecCode, classLevel);
    }

    // Validate the response structure
    if (!parsedData.sorted_sectors || !Array.isArray(parsedData.sorted_sectors) || parsedData.sorted_sectors.length !== 6) {
      throw new Error('Invalid response structure: missing or invalid sorted_sectors array');
    }

    // Ensure all required sectors are present
    const requiredSectors = ['Nature', 'Making', 'Life', 'Knowledge', 'Society', 'Culture'];
    const responseSectors = parsedData.sorted_sectors.map(s => s.sector);
    const missingSectors = requiredSectors.filter(s => !responseSectors.includes(s));
    
    if (missingSectors.length > 0) {
      throw new Error(`Missing required sectors: ${missingSectors.join(', ')}`);
    }

    return parsedData;
  } catch (error) {
    console.error(`Error generating sector sorting for ${mbtiType}+${riasecCode}:`, error);
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

// Helper function to validate class level (ages 5-7 typically in classes 1-7 in some systems)
export function validateClassLevel(classLevel) {
  return Number.isInteger(classLevel) && classLevel >= 1 && classLevel <= 12;
}