import axios from 'axios';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export const CANONICAL_SECTORS = [
  'Nature & Discovery',
  'Technology & Infrastructure',
  'Health & Care',
  'Business & Services',
  'Society & Public Life',
  'Arts, Media & Sport'
];

const generateSectorSortingPrompt = (mbtiType, riasecCode, classLevel, age) => {
  const hasRiasec = riasecCode && riasecCode !== "NONE" && riasecCode !== "N/A";

  const userProfileSection = hasRiasec
    ? `**User Profile:**
  - Personality Type: ${mbtiType}
  - Interest Code: ${riasecCode}
  - Class Level: ${classLevel} (Age: ${age} years)`
    : `**User Profile:**
  - Personality Type: ${mbtiType}
  - Class Level: ${classLevel} (Age: ${age} years)`;

  const introText = hasRiasec
    ? `You are an expert career counselor specializing in personality-based career guidance for children of class 1 to 7. Based on the provided personality type and interest code, sort the 6 career sectors from most to least suitable.`
    : `You are an expert career counselor specializing in personality-based career guidance for children of class 1 to 7. Based on the provided personality type, sort the 6 career sectors from most to least suitable for this child.`;

  const analysisGuidelines = hasRiasec
    ? `**Analysis Guidelines:**
  - Consider age-appropriate career interests and developmental stage for children of class ${classLevel}
  - Match personality cognitive preferences and interest patterns with each sector's primary purpose and what it includes
  - Think about long-term personality-career fit
  - Consider introversion/extraversion needs
  - Factor in thinking vs feeling decision-making styles
  - Account for sensing vs intuition information processing
  - Consider judging vs perceiving lifestyle preferences

  **Interest Code Mapping:**
  - R (Realistic): Hands-on, practical, mechanical, outdoors (aligns strongly with Technology & Infrastructure, Nature & Discovery)
  - I (Investigative): Analytical, scientific, research-oriented (aligns strongly with Nature & Discovery, Health & Care, Technology & Infrastructure)
  - A (Artistic): Creative, expressive, aesthetic, original (aligns strongly with Arts, Media & Sport)
  - S (Social): Helping, caring, counseling, healing, educating (aligns strongly with Health & Care, Society & Public Life)
  - E (Enterprising): Leadership, persuasion, business management, organizing (aligns strongly with Business & Services, Society & Public Life)
  - C (Conventional): Organized, detail-oriented, structured, systematic (aligns strongly with Business & Services, Technology & Infrastructure)`
    : `**Analysis Guidelines:**
  - Consider age-appropriate learning styles and developmental stage for children of class ${classLevel} (Age: ${age} years)
  - Match the child's personality cognitive preferences and natural curiosity with each sector's primary purpose and what it includes:
    * Nature & Discovery: exploring living systems, animals, earth, space, science, and nature
    * Technology & Infrastructure: building, engineering, coding, machines, and practical problem-solving
    * Health & Care: empathy, biology, helping others, healing, and personal wellbeing
    * Business & Services: organizing, teamwork, commercial curiosity, planning, and customer services
    * Society & Public Life: teaching, fairness, rules, community service, and public wellbeing
    * Arts, Media & Sport: creative expression, visual arts, storytelling, music, and sports
  - Consider introversion/extraversion needs (collaborative vs independent exploration)
  - Factor in thinking vs feeling decision-making styles (logic/systems vs empathy/people)
  - Account for sensing vs intuition information processing (concrete/hands-on vs imaginative/conceptual)
  - Consider judging vs perceiving lifestyle preferences (structured projects vs open-ended discovery)`;

  return `
  ${introText}

  ${userProfileSection}

  **Available Sectors (6 total):**
  1. **Nature & Discovery**
     - Primary purpose: Understand the natural world, or cultivate, manage and protect its living resources.
     - What it includes: Fundamental science, mathematics, space science, Earth science, agriculture, forestry, fisheries, animal care and conservation.

  2. **Technology & Infrastructure**
     - Primary purpose: Create, build, maintain or operate technical systems and physical infrastructure.
     - What it includes: Engineering, software, AI systems, manufacturing, construction, utilities, telecommunications, transport operation and technical trades.

  3. **Health & Care**
     - Primary purpose: Protect, restore or support human health and personal functioning.
     - What it includes: Medicine, nursing, dentistry, mental health, rehabilitation, clinical diagnostics, personal care and therapeutic services.

  4. **Business & Services**
     - Primary purpose: Conduct commercial exchange, manage organisational resources or deliver customer services.
     - What it includes: Business, finance, accounting, sales, procurement, administration, hospitality, retail, property transactions and customer services.

  5. **Society & Public Life**
     - Primary purpose: Educate people, uphold rights and public order, or support collective wellbeing.
     - What it includes: Education, law, government, public policy, diplomacy, defence, policing, social work and community development.

  6. **Arts, Media & Sport**
     - Primary purpose: Create expression, communicate stories and information, or deliver sporting performance and experiences.
     - What it includes: Creative arts, design, publishing, journalism, entertainment, performance, heritage and professional sport.

  ${analysisGuidelines}

  **Important Note:**
  Focus on finding the best overall developmental fit for the child rather than rigid category matching. Rank all 6 sectors from rank 1 (most suitable) to rank 6 (least suitable).

  **Output Format (JSON only):**
  {
    "sorted_sectors": [
      {
        "rank": 1,
        "sector": "Sector Name",
        "reasoning": "Why this sector is most suitable based on the child's personality profile and developmental interests"
      },
      {
        "rank": 2,
        "sector": "Sector Name", 
        "reasoning": "Explanation for second choice"
      },
      // ... continue for all 6 sectors
    ],
    "personality_summary": "Brief summary of how this personality influences learning preferences and early career sector interests",
    "development_notes": "Age-appropriate guidance for class level ${classLevel} students"
  }

  **Important Instructions:**
  - Return ONLY valid JSON, no additional text
  - Include all 6 sectors in ranking order using these EXACT sector names:
    * "Nature & Discovery"
    * "Technology & Infrastructure"
    * "Health & Care"
    * "Business & Services"
    * "Society & Public Life"
    * "Arts, Media & Sport"
  - Reasoning should be specific to the child's personality traits and reference what the sector includes in an age-appropriate way
  - Consider developmental appropriateness for class level ${classLevel}
  - Focus on natural interests and personality tendencies
  - NEVER mention "MBTI", "RIASEC", or any assessment methodology terms in the response
  - Use only generic terms like "personality traits", "preferences", "strengths" in all descriptions
`;
};

const normalizeSectorName = (name) => {
  if (!name || typeof name !== 'string') return '';
  const trimmed = name.trim();
  const cleaned = trimmed.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').trim();

  for (const canonical of CANONICAL_SECTORS) {
    const canonicalClean = canonical.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9 ]/g, '').trim();
    if (cleaned === canonicalClean || cleaned.includes(canonicalClean) || canonicalClean.includes(cleaned)) {
      return canonical;
    }
  }

  // Fallbacks for legacy/abbreviated sector names
  if (cleaned.includes('nature')) return 'Nature & Discovery';
  if (cleaned.includes('tech') || cleaned.includes('making') || cleaned.includes('infrastruct')) return 'Technology & Infrastructure';
  if (cleaned.includes('health') || cleaned.includes('life') || cleaned.includes('care')) return 'Health & Care';
  if (cleaned.includes('business') || cleaned.includes('service') || cleaned.includes('commerce')) return 'Business & Services';
  if (cleaned.includes('society') || cleaned.includes('public') || cleaned.includes('law')) return 'Society & Public Life';
  if (cleaned.includes('art') || cleaned.includes('media') || cleaned.includes('sport') || cleaned.includes('culture')) return 'Arts, Media & Sport';

  return trimmed;
};

export async function generateSectorSorting(mbtiType, riasecCode = "NONE", classLevel, age) {
  try {
    console.log(`Generating sector sorting for MBTI: ${mbtiType}, RIASEC: ${riasecCode}, Class: ${classLevel}, Age: ${age}`);

    const prompt = generateSectorSortingPrompt(mbtiType, riasecCode, classLevel, age);

    console.log("Prompt", prompt);
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

    console.log(`Input tokens sector sorting: ${response.data.usage.prompt_tokens}`);
    console.log(`Output tokens sector sorting: ${response.data.usage.completion_tokens}`);
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
      return await generateSectorSorting(mbtiType, riasecCode, classLevel, age);
    }

    // Validate the response structure
    if (!parsedData.sorted_sectors || !Array.isArray(parsedData.sorted_sectors) || parsedData.sorted_sectors.length !== 6) {
      throw new Error('Invalid response structure: missing or invalid sorted_sectors array');
    }

    // Normalize sector names to canonical names
    parsedData.sorted_sectors = parsedData.sorted_sectors.map(s => ({
      ...s,
      sector: normalizeSectorName(s.sector)
    }));

    // Ensure all required canonical sectors are present
    const responseSectors = parsedData.sorted_sectors.map(s => s.sector);
    const missingSectors = CANONICAL_SECTORS.filter(s => !responseSectors.includes(s));

    if (missingSectors.length > 0) {
      console.warn(`Missing required sectors: ${missingSectors.join(', ')}. Retrying...`);
      return await generateSectorSorting(mbtiType, riasecCode, classLevel, age);
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
  if (!riasecCode || riasecCode === "NONE" || riasecCode === "N/A") {
    return true;
  }

  const validChars = /^[RIASEC]+$/i;
  return validChars.test(riasecCode) && riasecCode.length >= 1 && riasecCode.length <= 6;
}

// Helper function to validate class level
export function validateClassLevel(classLevel) {
  return Number.isInteger(classLevel) && classLevel >= 1 && classLevel <= 12;
}
