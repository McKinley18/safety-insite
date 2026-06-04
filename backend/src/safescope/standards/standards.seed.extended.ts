export const extendedStandards = [

  // 🪜 FALL PROTECTION (EXPANDED)
  {
    citation: "29 CFR 1926.1053",
    title: "Ladders",
    domain: "OSHA",
    hazardTags: ["Fall Protection"],
    keywordTriggers: ["ladder", "climb", "rung", "unstable"],
    equipmentTags: ["ladder"],
    environmentTags: ["construction"],
    severityWeight: ["Moderate", "High"],
    summaryPlain: "Ladders must be used safely and maintained.",
    recommendedActions: [
      "Inspect ladders",
      "Secure ladder base",
      "Maintain 3-point contact"
    ]
  },

  {
    citation: "30 CFR 56.11001",
    title: "Safe access",
    domain: "MSHA",
    hazardTags: ["Fall Protection"],
    keywordTriggers: ["access", "walkway", "platform"],
    equipmentTags: [],
    environmentTags: ["mine"],
    severityWeight: ["Moderate", "High"],
    summaryPlain: "Safe means of access must be provided.",
    recommendedActions: [
      "Provide safe walkways",
      "Install guardrails"
    ]
  },

  // 🚜 MOBILE EQUIPMENT (EXPANDED)
  {
    citation: "30 CFR 56.14130",
    title: "Seat belts",
    domain: "MSHA",
    hazardTags: ["Mobile Equipment"],
    keywordTriggers: ["seatbelt", "operator", "vehicle"],
    equipmentTags: ["truck", "loader"],
    environmentTags: ["mine"],
    severityWeight: ["Moderate", "High"],
    summaryPlain: "Seat belts must be worn.",
    recommendedActions: [
      "Ensure seat belt use",
      "Enforce operator safety"
    ]
  },

  {
    citation: "29 CFR 1910.178(l)",
    title: "Operator training",
    domain: "OSHA",
    hazardTags: ["Mobile Equipment"],
    keywordTriggers: ["training", "operator", "forklift"],
    equipmentTags: ["forklift"],
    environmentTags: ["warehouse"],
    severityWeight: ["Moderate"],
    summaryPlain: "Operators must be trained.",
    recommendedActions: [
      "Provide operator certification",
      "Conduct refresher training"
    ]
  },

  // 🔒 LOCKOUT/TAGOUT (EXPANDED)
  {
    citation: "30 CFR 56.12017",
    title: "Lockout procedures",
    domain: "MSHA",
    hazardTags: ["Lockout/Tagout"],
    keywordTriggers: ["lockout", "energy", "repair"],
    equipmentTags: ["machine"],
    environmentTags: ["mine"],
    severityWeight: ["High", "Critical"],
    summaryPlain: "Energy must be isolated during repair.",
    recommendedActions: [
      "Apply locks",
      "Verify de-energization"
    ]
  },

  // 🔥 FIRE / EXPLOSION (EXPANDED)
  {
    citation: "29 CFR 1910.157",
    title: "Fire extinguishers",
    domain: "OSHA",
    hazardTags: ["Fire/Explosion"],
    keywordTriggers: ["fire", "extinguisher", "flammable"],
    equipmentTags: [],
    environmentTags: ["industrial"],
    severityWeight: ["Moderate", "High"],
    summaryPlain: "Fire extinguishers must be accessible.",
    recommendedActions: [
      "Maintain extinguishers",
      "Train personnel"
    ]
  },

  // 🧱 HOUSEKEEPING (EXPANDED)
  {
    citation: "30 CFR 56.20003",
    title: "Housekeeping",
    domain: "MSHA",
    hazardTags: ["Housekeeping"],
    keywordTriggers: ["debris", "clutter", "spill"],
    equipmentTags: [],
    environmentTags: ["mine"],
    severityWeight: ["Moderate"],
    summaryPlain: "Work areas must be clean.",
    recommendedActions: [
      "Clean work areas",
      "Remove hazards"
    ]
  },

  // 🧰 PPE (EXPANDED)
  {
    citation: "30 CFR 56.15002",
    title: "Hard hats",
    domain: "MSHA",
    hazardTags: ["PPE"],
    keywordTriggers: ["helmet", "head", "protection"],
    equipmentTags: [],
    environmentTags: ["mine"],
    severityWeight: ["Moderate"],
    summaryPlain: "Hard hats must be worn.",
    recommendedActions: [
      "Wear hard hats",
      "Inspect PPE"
    ]
  },

  // 🧠 HAZARD COMMUNICATION
  {
    citation: "29 CFR 1910.1200",
    title: "Hazard communication",
    domain: "OSHA",
    hazardTags: ["Hazard Communication"],
    keywordTriggers: ["chemical", "label", "sds"],
    equipmentTags: [],
    environmentTags: ["industrial"],
    severityWeight: ["Moderate", "High"],
    summaryPlain: "Hazards must be communicated.",
    recommendedActions: [
      "Label chemicals",
      "Provide SDS sheets"
    ]
  }

];
