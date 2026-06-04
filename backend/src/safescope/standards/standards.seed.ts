export const standardsSeed = [

  // 🔌 ELECTRICAL
  {
    citation: "30 CFR 56.12016",
    title: "Work on electrically powered equipment",
    domain: "MSHA",
    hazardTags: ["Electrical"],
    keywordTriggers: ["energized", "exposed", "live", "wiring", "voltage"],
    equipmentTags: ["panel", "circuit", "breaker"],
    environmentTags: ["plant", "mine"],
    severityWeight: ["High", "Critical"],
    summaryPlain: "Electrical work must be de-energized before work begins.",
    recommendedActions: [
      "Apply lockout/tagout",
      "Verify zero energy",
      "Use insulated PPE"
    ]
  },

  {
    citation: "29 CFR 1910.333",
    title: "Selection and use of work practices",
    domain: "OSHA",
    hazardTags: ["Electrical"],
    keywordTriggers: ["electrical", "shock", "arc", "energized"],
    equipmentTags: ["wiring", "panel"],
    environmentTags: ["industrial", "plant"],
    severityWeight: ["High", "Critical"],
    summaryPlain: "Safe work practices must be used when working on electrical equipment.",
    recommendedActions: [
      "De-energize circuits",
      "Use protective equipment",
      "Follow safe work procedures"
    ]
  },

  // 🪜 FALL PROTECTION
  {
    citation: "29 CFR 1926.501",
    title: "Duty to have fall protection",
    domain: "OSHA",
    hazardTags: ["Fall Protection"],
    keywordTriggers: ["fall", "edge", "height", "unguarded"],
    equipmentTags: ["ladder", "roof", "platform"],
    environmentTags: ["construction"],
    severityWeight: ["High", "Critical"],
    summaryPlain: "Fall protection is required when working at heights.",
    recommendedActions: [
      "Install guardrails",
      "Use harness and lanyard",
      "Secure ladders"
    ]
  },

  {
    citation: "30 CFR 56.15005",
    title: "Safety belts and lines",
    domain: "MSHA",
    hazardTags: ["Fall Protection"],
    keywordTriggers: ["fall", "height", "elevated"],
    equipmentTags: ["platform", "ladder"],
    environmentTags: ["mine"],
    severityWeight: ["High", "Critical"],
    summaryPlain: "Safety belts and lines must be worn when required.",
    recommendedActions: [
      "Use fall protection systems",
      "Inspect harnesses"
    ]
  },

  // 🚜 MOBILE EQUIPMENT
  {
    citation: "30 CFR 56.14100",
    title: "Safety defects; examination, correction and records",
    domain: "MSHA",
    hazardTags: ["Mobile Equipment"],
    keywordTriggers: ["equipment", "defect", "vehicle", "inspection"],
    equipmentTags: ["truck", "loader", "dozer"],
    environmentTags: ["mine"],
    severityWeight: ["Moderate", "High"],
    summaryPlain: "Equipment defects affecting safety must be corrected.",
    recommendedActions: [
      "Inspect equipment before use",
      "Repair defects immediately"
    ]
  },

  {
    citation: "29 CFR 1910.178",
    title: "Powered industrial trucks",
    domain: "OSHA",
    hazardTags: ["Mobile Equipment"],
    keywordTriggers: ["forklift", "truck", "operator"],
    equipmentTags: ["forklift"],
    environmentTags: ["warehouse"],
    severityWeight: ["Moderate", "High"],
    summaryPlain: "Forklift operation must follow safety requirements.",
    recommendedActions: [
      "Train operators",
      "Maintain equipment",
      "Follow load limits"
    ]
  },

  // 🔒 LOCKOUT TAGOUT
  {
    citation: "29 CFR 1910.147",
    title: "The control of hazardous energy",
    domain: "OSHA",
    hazardTags: ["Lockout/Tagout"],
    keywordTriggers: ["lockout", "tagout", "energy", "maintenance"],
    equipmentTags: ["machine"],
    environmentTags: ["industrial"],
    severityWeight: ["High", "Critical"],
    summaryPlain: "Energy sources must be isolated during maintenance.",
    recommendedActions: [
      "Apply lockout/tagout procedures",
      "Verify isolation"
    ]
  },

  // 🔥 FIRE / EXPLOSION
  {
    citation: "30 CFR 56.4101",
    title: "Extinguishers; locations",
    domain: "MSHA",
    hazardTags: ["Fire/Explosion"],
    keywordTriggers: ["fire", "flammable", "combustible"],
    equipmentTags: ["fuel", "tank"],
    environmentTags: ["mine"],
    severityWeight: ["High"],
    summaryPlain: "Fire protection equipment must be available.",
    recommendedActions: [
      "Install extinguishers",
      "Remove ignition sources"
    ]
  },

  // 🧱 HOUSEKEEPING
  {
    citation: "29 CFR 1910.22",
    title: "Walking-working surfaces",
    domain: "OSHA",
    hazardTags: ["Housekeeping"],
    keywordTriggers: ["slip", "trip", "clutter"],
    equipmentTags: [],
    environmentTags: ["plant"],
    severityWeight: ["Moderate"],
    summaryPlain: "Work areas must be kept clean and orderly.",
    recommendedActions: [
      "Remove debris",
      "Maintain clear walkways"
    ]
  },

  // 🧰 PPE
  {
    citation: "29 CFR 1910.132",
    title: "General PPE requirements",
    domain: "OSHA",
    hazardTags: ["PPE"],
    keywordTriggers: ["ppe", "protection", "helmet", "gloves"],
    equipmentTags: [],
    environmentTags: ["industrial"],
    severityWeight: ["Moderate", "High"],
    summaryPlain: "Employees must use appropriate PPE.",
    recommendedActions: [
      "Provide PPE",
      "Ensure proper use"
    ]
  }

];
