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
  },
  2: {
    id: 2,
    name: "Technology & Infrastructure",
    legacy_name: "Making",
    primary_purpose:
      "Create, build, maintain or operate technical systems and physical infrastructure.",
    what_it_includes:
      "Engineering, software, AI systems, manufacturing, construction, utilities, telecommunications, transport operation and technical trades.",
  },
  3: {
    id: 3,
    name: "Health & Care",
    legacy_name: "Life",
    primary_purpose:
      "Protect, restore or support human health and personal functioning.",
    what_it_includes:
      "Medicine, nursing, dentistry, mental health, rehabilitation, clinical diagnostics, personal care and therapeutic services.",
  },
  4: {
    id: 4,
    name: "Business & Services",
    legacy_name: "Knowledge",
    primary_purpose:
      "Conduct commercial exchange, manage organisational resources or deliver customer services.",
    what_it_includes:
      "Business, finance, accounting, sales, procurement, administration, hospitality, retail, property transactions and customer services.",
  },
  5: {
    id: 5,
    name: "Society & Public Life",
    legacy_name: "Society",
    primary_purpose:
      "Educate people, uphold rights and public order, or support collective wellbeing.",
    what_it_includes:
      "Education, law, government, public policy, diplomacy, defence, policing, social work and community development.",
  },
  6: {
    id: 6,
    name: "Arts, Media & Sport",
    legacy_name: "Culture",
    primary_purpose:
      "Create expression, communicate stories and information, or deliver sporting performance and experiences.",
    what_it_includes:
      "Visual arts, performing arts, design, craft, film, TV, radio, digital media, journalism, sports and fitness.",
  },
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
    };
  }
  return item;
}
