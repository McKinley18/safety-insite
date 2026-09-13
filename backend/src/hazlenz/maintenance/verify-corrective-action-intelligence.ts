import { getEvidenceGapIntelligence } from "../intelligence/evidence-gap-intelligence";
import { getCorrectiveActionIntelligence } from "../intelligence/corrective-action-intelligence";

const scenarios = [
  {
    name: "Unguarded conveyor tail pulley",
    classification: "Machine Guarding",
    text: "unguarded conveyor tail pulley with exposed nip point near walkway",
    risk: { riskScore: 8, requiresShutdown: true },
    sourceAnalysis: {
      primaryRegulatoryBasis: [{ title: "Machine guarding regulation" }],
    },
  },
  {
    name: "Exposed energized conductor in open panel",
    classification: "Electrical",
    text: "open electrical panel with exposed energized conductor",
    risk: { riskScore: 9, imminentDanger: true },
    sourceAnalysis: {
      primaryRegulatoryBasis: [{ title: "Electrical regulation" }],
    },
  },
  {
    name: "Unprotected roof edge",
    classification: "Fall Protection",
    text: "worker exposed to unprotected roof edge without guardrail",
    risk: { riskScore: 8 },
    sourceAnalysis: {
      primaryRegulatoryBasis: [{ title: "Fall protection regulation" }],
    },
  },
  {
    name: "Mobile equipment backing near pedestrians",
    classification: "Mobile Equipment / Traffic",
    text: "haul truck backing near pedestrians with unclear spotter controls",
    risk: { riskScore: 7 },
    sourceAnalysis: {
      primaryRegulatoryBasis: [],
      bestPracticeGuidance: [{ title: "Traffic best practice" }],
    },
  },
  {
    name: "Confined space tank entry",
    classification: "Confined Space",
    text: "tank entry with unknown atmospheric testing and rescue plan",
    risk: { riskScore: 8 },
    sourceAnalysis: {
      primaryRegulatoryBasis: [{ title: "Confined space regulation" }],
    },
  },
  {
    name: "Trench excavation without protective system",
    classification: "Trenching / Excavation",
    text: "workers entering trench excavation without visible protective system",
    risk: { riskScore: 9, requiresShutdown: true },
    sourceAnalysis: {
      primaryRegulatoryBasis: [{ title: "Excavation regulation" }],
    },
  },
  {
    name: "Winter weather mobile equipment visibility",
    classification: "Mobile Equipment / Traffic",
    text: "winter weather visibility issue with mobile equipment defroster and windshield obstruction",
    risk: { riskScore: 6 },
    sourceAnalysis: {
      primaryRegulatoryBasis: [],
      bestPracticeGuidance: [{ title: "MSHA Winter Safety Alert" }],
    },
  },
];

for (const scenario of scenarios) {
  const evidenceGap = getEvidenceGapIntelligence(
    scenario.text,
    scenario.classification,
  );

  const result = getCorrectiveActionIntelligence(
    scenario.classification,
    scenario.risk,
    {
      officialGuidance: [],
      incidentLearning: [],
      bestPracticeGuidance: [],
      internalContext: [],
      supportingReferences: [],
      ...scenario.sourceAnalysis,
    },
    evidenceGap,
  );

  console.log("\n---");
  console.log(`Scenario: ${scenario.name}`);
  console.log(`Immediate Actions: ${result.immediateActions.length}`);
  console.log(`Verification Actions: ${result.verificationActions.length}`);
  console.log(`Closure Requirements: ${result.closureRequirements.join(", ")}`);
  console.log(`Escalation: ${result.escalationRecommendation}`);
  console.log(`Priority Rationale: ${result.actionPriorityRationale}`);
  console.log(
    `First Immediate Action: ${result.immediateActions[0]?.title || "none"}`,
  );
}
