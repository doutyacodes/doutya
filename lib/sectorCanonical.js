// lib/sectorCanonical.js
// Canonical metadata and mappings for the 6 official sectors

export const SECTOR_CANONICAL_MAP = {
  1: {
    id: 1,
    name: "Nature & Discovery",
    legacy_name: "Nature",
    primary_purpose:
      "Understand the natural world, or cultivate, manage and protect its living resources.",
    what_it_includes:
      "Fundamental science, mathematics, space science, Earth science, agriculture, forestry, fisheries, animal care and conservation.",
    key_domains: [
      "Fundamental Science",
      "Mathematics & Astrophysics",
      "Space & Earth Science",
      "Agriculture & Forestry",
      "Ecological Conservation",
      "Animal Sciences"
    ],
    why_suitable:
      "High developmental alignment for curious, observant thinkers who thrive on empirical research, scientific inquiry, and environmental stewardship.",
    recommended_stream:
      "Pure Sciences (Physics, Chemistry, Biology), Mathematics, Environmental Science, Agricultural Sciences",
    future_potential:
      "Rapidly expanding global opportunities in climate technology, sustainable agriculture, biodiversity analytics, and space exploration."
  },
  2: {
    id: 2,
    name: "Technology & Infrastructure",
    legacy_name: "Making",
    primary_purpose:
      "Create, build, maintain or operate technical systems and physical infrastructure.",
    what_it_includes:
      "Engineering, software, AI systems, manufacturing, construction, utilities, telecommunications, transport operation and technical trades.",
    key_domains: [
      "Software & AI Systems",
      "Core Engineering (Mechanical, Civil, Electrical)",
      "Intelligent Manufacturing",
      "Robotics & Automation",
      "Telecommunications & Utilities",
      "Physical Infrastructure"
    ],
    why_suitable:
      "Exceptional alignment for structured, analytical thinkers who enjoy designing systems, building functional solutions, and solving tangible technical challenges.",
    recommended_stream:
      "Engineering, Computer Science, Mathematics, Physical Sciences, Applied Technologies",
    future_potential:
      "High long-term growth driven by artificial intelligence, smart manufacturing, autonomous systems, robotics, and clean infrastructure."
  },
  3: {
    id: 3,
    name: "Health & Care",
    legacy_name: "Life",
    primary_purpose:
      "Protect, restore or support human health and personal functioning.",
    what_it_includes:
      "Medicine, nursing, dentistry, mental health, rehabilitation, clinical diagnostics, personal care and therapeutic services.",
    key_domains: [
      "Clinical Medicine & Surgery",
      "Biomedical & Laboratory Diagnostics",
      "Mental Health & Counseling",
      "Nursing & Patient Care",
      "Physiotherapy & Rehabilitation",
      "Pharmaceutical Sciences"
    ],
    why_suitable:
      "Strong developmental fit for empathetic, scientifically grounded individuals with high attention to detail and dedication to improving human wellbeing.",
    recommended_stream:
      "Medical Sciences, Biology, Chemistry, Biotechnology, Psychology, Health & Behavioral Sciences",
    future_potential:
      "Sustained global necessity with accelerating frontiers in precision healthcare, digital therapeutics, biotechnology, and public health systems."
  },
  4: {
    id: 4,
    name: "Business & Services",
    legacy_name: "Knowledge",
    primary_purpose:
      "Conduct commercial exchange, manage organisational resources or deliver customer services.",
    what_it_includes:
      "Business, finance, accounting, sales, procurement, administration, hospitality, retail, property transactions and customer services.",
    key_domains: [
      "Business Administration & Strategy",
      "Corporate Finance & Quantitative Analytics",
      "Accounting & Audit",
      "Marketing & Global Commerce",
      "Supply Chain & Operations",
      "Enterprise Technology"
    ],
    why_suitable:
      "Strong alignment for strategic, communicative individuals who understand economic coordination, resource efficiency, and organizational leadership.",
    recommended_stream:
      "Commerce, Economics, Business Administration, Accountancy, Financial Mathematics",
    future_potential:
      "Continuous leadership demand in fintech, data-driven enterprise strategy, international trade, supply chain management, and venture development."
  },
  5: {
    id: 5,
    name: "Society & Public Life",
    legacy_name: "Society",
    primary_purpose:
      "Educate people, uphold rights and public order, or support collective wellbeing.",
    what_it_includes:
      "Education, law, government, public policy, diplomacy, defence, policing, social work and community development.",
    key_domains: [
      "Law, Judiciary & Advocacy",
      "Public Policy & Civil Governance",
      "International Diplomacy",
      "Education & Academic Instruction",
      "Community & Social Development",
      "Public Administration"
    ],
    why_suitable:
      "Well-suited for principled, articulate communicators driven by civic responsibility, collective wellbeing, justice, and institutional governance.",
    recommended_stream:
      "Humanities, Legal Studies, Political Science, Public Policy, Sociology, International Relations",
    future_potential:
      "Vital long-term significance across modern governance, judicial tech, social policy design, human rights advocacy, and global diplomacy."
  },
  6: {
    id: 6,
    name: "Arts, Media & Sport",
    legacy_name: "Culture",
    primary_purpose:
      "Create expression, communicate stories and information, or deliver sporting performance and experiences.",
    what_it_includes:
      "Visual arts, performing arts, design, craft, film, TV, radio, digital media, journalism, sports and fitness.",
    key_domains: [
      "Visual Communication & UI/UX Design",
      "Journalism & Digital Media",
      "Film, Animation & Production",
      "Performing Arts & Music",
      "Sports Performance & Athletic Training",
      "Content Strategy & Creative Writing"
    ],
    why_suitable:
      "Exceptional alignment for imaginative, expressive creators who excel at visual communication, dynamic performance, and storytelling.",
    recommended_stream:
      "Fine Arts, Design, Mass Communication & Journalism, Literature, Sports Sciences, Media Production",
    future_potential:
      "High growth across digital content ecosystems, interactive entertainment, sports science, brand design, and creative media technology."
  }
};

export function getSectorCanonicalInfo(idOrName) {
  if (!idOrName && idOrName !== 0) return null;
  const numId = Number(idOrName);
  if (!isNaN(numId) && SECTOR_CANONICAL_MAP[numId]) {
    return SECTOR_CANONICAL_MAP[numId];
  }
  const str = String(idOrName).trim().toLowerCase();
  for (const info of Object.values(SECTOR_CANONICAL_MAP)) {
    if (
      info.name.toLowerCase() === str ||
      info.legacy_name.toLowerCase() === str
    ) {
      return info;
    }
  }
  if (str.includes("tech") || str.includes("making") || str.includes("infrastruct")) {
    return SECTOR_CANONICAL_MAP[2];
  }
  if (str.includes("nature") || str.includes("discovery")) {
    return SECTOR_CANONICAL_MAP[1];
  }
  if (str.includes("health") || str.includes("care") || str.includes("life")) {
    return SECTOR_CANONICAL_MAP[3];
  }
  if (
    str.includes("business") ||
    str.includes("service") ||
    str.includes("knowledge") ||
    str.includes("commerce")
  ) {
    return SECTOR_CANONICAL_MAP[4];
  }
  if (str.includes("society") || str.includes("public")) {
    return SECTOR_CANONICAL_MAP[5];
  }
  if (
    str.includes("art") ||
    str.includes("media") ||
    str.includes("sport") ||
    str.includes("culture")
  ) {
    return SECTOR_CANONICAL_MAP[6];
  }
  return null;
}

export function formatSectorDisplay(idOrName) {
  const info = getSectorCanonicalInfo(idOrName);
  if (info) {
    return {
      title: info.name,
      legacy: info.legacy_name,
      fullDisplay: info.name + " (" + info.legacy_name + ")",
      info,
    };
  }
  const raw = String(idOrName || "");
  return {
    title: raw,
    legacy: "",
    fullDisplay: raw,
    info: null,
  };
}

export function toCanonicalSectorName(idOrName) {
  const info = getSectorCanonicalInfo(idOrName);
  return info ? info.name : String(idOrName || "");
}

export function toDbSectorName(idOrName) {
  const info = getSectorCanonicalInfo(idOrName);
  return info ? info.legacy_name : String(idOrName || "");
}

export function enrichSectorItem(item) {
  if (!item || typeof item !== "object") return item;
  const lookupKey =
    item.scope_grp_id ??
    item.sector_id ??
    item.sectorId ??
    item.id ??
    item.name ??
    item.career_name;
  const info = getSectorCanonicalInfo(lookupKey);
  if (info) {
    return {
      ...item,
      canonical_name: info.name,
      name: info.name,
      legacy_name: info.legacy_name,
      display_name: info.name,
      full_display_name: info.name + " (" + info.legacy_name + ")",
      primary_purpose: item.primary_purpose || info.primary_purpose,
      what_it_includes: item.what_it_includes || info.what_it_includes,
      brief_overview: item.brief_overview || info.primary_purpose,
      why_suitable: item.why_suitable || info.why_suitable,
      recommended_stream: item.recommended_stream || info.recommended_stream,
      future_potential: item.future_potential || info.future_potential,
      key_domains: info.key_domains || []
    };
  }
  return item;
}
