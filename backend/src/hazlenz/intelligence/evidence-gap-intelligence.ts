export interface EvidenceGapIntelligence {
  evidenceGaps: string[];
  criticalQuestions: string[];
  closureEvidenceNeeded: string[];
  confidenceLimitations: string[];
  recommendedNextStep: string;
}

const DOMAIN_MAP: Record<string, string[]> = {
  "Machine Guarding": [
    "conveyor",
    "pulley",
    "moving parts",
    "guard",
    "shaft",
    "belt",
    "nip point",
  ],
  Electrical: [
    "energized",
    "electrical",
    "conductor",
    "panel",
    "circuit",
    "shock",
    "arc flash",
  ],
  "Lockout / Stored Energy": [
    "lockout",
    "tagout",
    "de-energize",
    "stored energy",
    "blocked",
  ],
  "Fall Protection": [
    "fall",
    "roof edge",
    "unprotected edge",
    "ladder",
    "scaffold",
    "opening",
    "platform",
  ],
  "Mobile Equipment / Traffic": [
    "mobile equipment",
    "truck",
    "traffic",
    "berm",
    "backup alarm",
  ],
  "Confined Space": ["confined space", "permit", "engulfment"],
  "Trenching / Excavation": ["trench", "excavation", "soil"],
  Housekeeping: ["slip", "trip", "housekeeping"],
};

export function getEvidenceGapIntelligence(
  text: string,
  classification: string,
): EvidenceGapIntelligence {
  const norm = text.toLowerCase();
  const domain =
    Object.keys(DOMAIN_MAP).find(
      (d) =>
        classification.includes(d) ||
        DOMAIN_MAP[d].some((t) => norm.includes(t)),
    ) || "General";

  let evidenceGaps: string[] = [];
  let criticalQuestions: string[] = [];
  let closureEvidenceNeeded: string[] = [];
  let confidenceLimitations: string[] = [];
  let recommendedNextStep =
    "Confirm the hazard details and document the corrective action.";

  if (domain === "Machine Guarding") {
    evidenceGaps = [
      "Determine if moving part is accessible during normal operation.",
    ];
    criticalQuestions = [
      "Is a fixed or interlocked guard installed?",
      "Can a worker reach the danger zone?",
    ];
    closureEvidenceNeeded = ["corrected photo", "guard/interlock verification"];
    confidenceLimitations = [
      "unknown worker access",
      "unclear equipment state",
    ];
    recommendedNextStep =
      "Verify guard installation and document with photo evidence.";
  } else if (domain === "Electrical") {
    evidenceGaps = ["Confirm if component is energized."];
    criticalQuestions = [
      "What is the voltage involved?",
      "Was qualified work being performed?",
    ];
    closureEvidenceNeeded = ["supervisor sign-off", "inspection checklist"];
    confidenceLimitations = ["unknown voltage", "missing measurement"];
    recommendedNextStep =
      "Verify energy state and document protection measures.";
  } else if (domain === "Fall Protection") {
    evidenceGaps = ["Confirm fall height."];
    criticalQuestions = [
      "Is an unprotected edge or opening involved?",
      "Are guardrails or fall arrest systems present?",
    ];
    closureEvidenceNeeded = ["corrected photo", "fall protection inspection"];
    confidenceLimitations = [
      "unknown fall height",
      "unknown anchorage condition",
    ];
    recommendedNextStep = "Confirm fall protection adequacy before closure.";
  } else if (domain === "Mobile Equipment / Traffic") {
    evidenceGaps = ["Assess pedestrian/equipment traffic flow."];
    criticalQuestions = [
      "Are pedestrians or light vehicles exposed to mobile equipment?",
      "Were alarms, lights, cameras, berms, traffic routes, or spotters involved?",
      "Was the equipment moving, backing, dumping, or being maintained?",
      "Is line-of-fire exposure possible?",
    ];
    closureEvidenceNeeded = [
      "traffic control verification",
      "corrected photo",
      "supervisor sign-off",
    ];
    confidenceLimitations = [
      "unknown traffic pattern",
      "unknown worker awareness",
      "unknown equipment movement state",
    ];
    recommendedNextStep =
      "Verify traffic controls and line-of-fire protection.";
  } else if (domain === "Lockout / Stored Energy") {
    evidenceGaps = [
      "Determine whether the task is servicing/maintenance or normal production.",
    ];
    criticalQuestions = [
      "Were all energy sources isolated, locked, tagged, and verified?",
      "Is stored energy present?",
      "Were guards or interlocks removed, opened, or bypassed?",
      "Could the equipment start or move unexpectedly?",
    ];
    closureEvidenceNeeded = [
      "lockout verification",
      "zero-energy verification",
      "supervisor sign-off",
      "corrected photo",
    ];
    confidenceLimitations = [
      "unclear task type",
      "unknown energy state",
      "unknown stored energy condition",
    ];
    recommendedNextStep =
      "Verify energy isolation and document lockout before closure.";
  } else if (domain === "Confined Space") {
    evidenceGaps = [
      "Determine whether the space meets confined space or permit-required confined space criteria.",
    ];
    criticalQuestions = [
      "Is the space large enough to enter, limited in entry/exit, and not designed for continuous occupancy?",
      "Was atmospheric testing performed?",
      "Are engulfment, mechanical, electrical, chemical, or oxygen-deficiency hazards present?",
      "Is a permit, attendant, rescue plan, or ventilation required?",
    ];
    closureEvidenceNeeded = [
      "atmospheric test record",
      "permit verification",
      "rescue plan verification",
      "supervisor sign-off",
    ];
    confidenceLimitations = [
      "unknown atmospheric condition",
      "unknown entry status",
      "unknown rescue capability",
    ];
    recommendedNextStep =
      "Confirm space classification, atmospheric testing, and rescue controls before closure.";
  } else if (domain === "Trenching / Excavation") {
    evidenceGaps = [
      "Confirm excavation depth, worker entry, and protective system status.",
    ];
    criticalQuestions = [
      "What is the excavation depth?",
      "Are workers entering the excavation?",
      "What is the soil condition or classification?",
      "Are protective systems, safe access, spoil pile setbacks, water controls, and competent person inspections documented?",
    ];
    closureEvidenceNeeded = [
      "competent person review",
      "protective system verification",
      "safe access verification",
      "corrected photo",
    ];
    confidenceLimitations = [
      "unknown excavation depth",
      "unknown soil condition",
      "unknown worker entry status",
    ];
    recommendedNextStep =
      "Confirm competent person review and protective system adequacy before entry or closure.";
  } else if (domain === "Housekeeping") {
    evidenceGaps = [
      "Identify what created the walking-working surface hazard.",
    ];
    criticalQuestions = [
      "Is the exposure on a travelway, platform, stair, ladder, or elevated area?",
      "Was the condition temporary, recurring, or caused by process/material handling?",
      "Was the affected area barricaded or corrected?",
      "What prevention step will stop recurrence?",
    ];
    closureEvidenceNeeded = [
      "corrected photo",
      "housekeeping inspection checklist",
      "supervisor sign-off",
      "procedure or schedule update",
    ];
    confidenceLimitations = [
      "unknown exposure duration",
      "unknown surface condition",
      "unknown recurrence risk",
    ];
    recommendedNextStep =
      "Confirm correction, recurrence controls, and walking-working surface condition before closure.";
  } else {
    evidenceGaps = ["Review finding description for missing context."];
    criticalQuestions = [
      "What is the exact hazard?",
      "How are workers currently exposed?",
    ];
    closureEvidenceNeeded = ["corrected photo", "supervisor sign-off"];
    confidenceLimitations = ["generic hazard context"];
  }

  return {
    evidenceGaps,
    criticalQuestions,
    closureEvidenceNeeded,
    confidenceLimitations,
    recommendedNextStep,
  };
}
