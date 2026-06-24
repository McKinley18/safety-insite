process.env.RENDER = "true";
process.env.NODE_ENV = "production";
process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER = "true";

import { EvidenceFusionService } from "../evidence/evidence-fusion.service";
import { SafescopeV2Service } from "../safescope-v2.service";
import { WorkspaceGovernanceAccessService } from "../workspace-governance-access/workspace-governance-access.service";

type Scenario = {
  name: string;
  text: string;
  scopes: string[];
  evidenceTexts: string[];
  expectClassification: RegExp;
  forbidClassification?: RegExp;
  expectStandards: RegExp[];
  forbidStandards?: RegExp[];
  forbidHazardDomains?: RegExp[];
  forbidRawTerms?: RegExp[];
};

function makeStandard(citation: string, title: string, rationale: string) {
  return {
    citation,
    title,
    titleSummary: title,
    summary: title,
    agencyCode: citation.startsWith("30 CFR") ? "MSHA" : "OSHA",
    jurisdiction: citation.startsWith("30 CFR") ? "msha" : "osha_general_industry",
    score: 700,
    confidence: 0.9,
    candidateStatus: "candidate_standard",
    status: "candidate_standard",
    matchingReasons: [rationale],
    evidenceNeeded: ["Confirm observation context, exposure, and controls."],
    advisoryOnly: true,
    requiresQualifiedReview: true,
    source: ["classify_path_regression"],
  };
}

function mockStandardsService() {
  return {
    async suggest(description: string, hazardCategory?: string) {
      const text = `${description || ""} ${hazardCategory || ""}`.toLowerCase();
      const classifierSaysMobile = /mobile equipment|traffic/i.test(hazardCategory || "");
      const spillEvidence =
        /\b(oil|used oil|waste oil|spill|leak|release|residue|liquid)\b/i.test(text) &&
        /\b(floor|walkway|aisle|travelway|pedestrian walkway|walking surface|shop floor|maintenance area|maintenance bay|travel path|path)\b/i.test(
          text,
        );
      const housekeepingEvidence =
        /\b(scrap|hoses?|debris|clutter|trip hazard)\b/i.test(text) &&
        /\b(walkway|aisle|travelway|pedestrian walkway|walking surface|shop floor)\b/i.test(text);

      if (classifierSaysMobile) {
        return [
          makeStandard(
            "30 CFR 56.9100(a)",
            "Rules of the road / traffic control",
            "Direct match: mobile equipment and pedestrian interaction.",
          ),
        ];
      }

      if (spillEvidence || housekeepingEvidence) {
        return [
          makeStandard(
            "29 CFR 1910.22(a)(2)",
            "Walking-working surfaces free of spill or release contamination",
            "Direct match: walking surface contamination from a release.",
          ),
          makeStandard(
            "29 CFR 1910.22(a)",
            "Walking-working surface housekeeping and clear access",
            "Supporting match: travel path should remain clear and dry.",
          ),
        ];
      }

      return [
        makeStandard(
          "29 CFR 1910.1200(f)(1)",
          "Hazard communication / container labeling",
          "Fallback label or chemical identity support.",
        ),
      ];
    },
  } as any;
}

function mockActionEngine() {
  return {
    async generateActionsFromReport() {
      return [];
    },
  } as any;
}

function mockKnowledgeRouter() {
  return {
    route(input: { text: string; scopes?: string[] }) {
      const text = (input.text || "").toLowerCase();
      const mobile =
        /\b(forklift|loader|haul truck|truck|mobile equipment|backing|traffic control|spotter)\b/i.test(
          text,
        );
      return {
        jurisdiction: "osha_general_industry",
        hazardFamily: mobile ? "mobile_equipment" : "walking_working_surfaces",
        equipmentFamily: mobile ? "mobile_equipment" : "housekeeping",
        taskMechanism: mobile ? "traffic" : "spill_release",
        shardKey: mobile
          ? "osha_general_industry/mobile_equipment/traffic"
          : "osha_general_industry/walking_working_surfaces/housekeeping",
        bundleIds: [],
        sourceKeys: [],
        confidence: 0.95,
        reasons: ["classify-path regression stub"],
      };
    },
  } as any;
}

function mockKnowledgeShardService() {
  return {
    getShardSummary() {
      return { matchedShardCount: 0, citations: [] };
    },
  } as any;
}

const service = new SafescopeV2Service(
  mockActionEngine(),
  new EvidenceFusionService(),
  mockStandardsService(),
  undefined as any,
  {} as any,
  {} as any,
  {} as any,
  new WorkspaceGovernanceAccessService(),
  mockKnowledgeRouter(),
  mockKnowledgeShardService(),
);

const scenarios: Scenario[] = [
  {
    name: "open used oil near walkway",
    text: "An open container of used oil is sitting on the shop floor near a pedestrian walkway.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["open used oil container", "shop floor", "pedestrian walkway"],
    expectClassification: /Walking\/Working Surfaces|Housekeeping|Spill|Release/i,
    forbidClassification: /Mobile Equipment \/ Traffic/i,
    expectStandards: [/1910\.22\(a\)\(2\)/, /1910\.22\(a\)/],
    forbidStandards: [/1910\.101|1910\.104|1926\.350/i],
    forbidHazardDomains: [/compressed_gas/i, /mobile_equipment/i],
    forbidRawTerms: [/compressed gas cylinder/i, /1910\.101/i, /1926\.350/i],
  },
  {
    name: "oil spill across walkway",
    text: "Oil has spilled across a designated pedestrian walkway near the lube storage area.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["oil spill", "pedestrian walkway", "lube storage area"],
    expectClassification: /Walking\/Working Surfaces|Housekeeping|Spill|Release/i,
    forbidClassification: /Mobile Equipment \/ Traffic/i,
    expectStandards: [/1910\.22\(a\)\(2\)/, /1910\.22\(a\)/],
    forbidStandards: [/1910\.101|1910\.104|1926\.350/i],
    forbidHazardDomains: [/compressed_gas/i, /mobile_equipment/i],
    forbidRawTerms: [/compressed gas cylinder/i, /1910\.101/i, /1926\.350/i],
  },
  {
    name: "forklift in aisle with pedestrians",
    text: "A forklift is operating in the same aisle as pedestrians with no marked separation.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["forklift", "pedestrians", "marked separation"],
    expectClassification: /Mobile Equipment \/ Traffic/i,
    expectStandards: [/1910\.178/i],
    forbidStandards: [/1910\.22\(a\)\(2\)/i],
  },
  {
    name: "scrap and hoses across walkway",
    text: "Scrap material and hoses are lying across a designated pedestrian walkway.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["scrap material", "hoses", "pedestrian walkway"],
    expectClassification: /Walking\/Working Surfaces|Housekeeping/i,
    forbidClassification: /Mobile Equipment \/ Traffic/i,
    expectStandards: [/1910\.22\(a\)\(3\)/, /1910\.22\(a\)/],
    forbidStandards: [/1910\.178|56\.9100/i],
    forbidHazardDomains: [/mobile_equipment/i, /compressed_gas/i],
    forbidRawTerms: [/compressed gas cylinder/i, /1910\.101/i, /1926\.350/i],
  },
];

async function run() {
  let failures = 0;

  for (const scenario of scenarios) {
    const response = await service.classify(
      scenario.text,
      scenario.scopes,
      scenario.evidenceTexts,
      "standard_5x5",
    );

    const suggested = response.suggestedStandards || [];
    const suggestedCitations = suggested.map((standard: any) => standard.citation || "");
    const inspectionCitations = (response.inspectionIntelligence?.candidateStandards || []).map(
      (standard: any) => standard.citation || "",
    );
    const classificationText = String(response.classification || "");
    const topSuggested = suggestedCitations[0] || "";
    const topInspection = inspectionCitations[0] || "";
    const text = JSON.stringify(response);
    const combinedCitationText = `${suggestedCitations.join(" ")} ${inspectionCitations.join(" ")}`;

    const passed =
      scenario.expectClassification.test(classificationText) &&
      (!scenario.forbidClassification || !scenario.forbidClassification.test(classificationText)) &&
      scenario.expectStandards.every((pattern) => pattern.test(combinedCitationText)) &&
      (!scenario.forbidStandards || !scenario.forbidStandards.some((pattern) => pattern.test(combinedCitationText))) &&
      (!scenario.forbidHazardDomains || !scenario.forbidHazardDomains.some((pattern) => pattern.test(JSON.stringify(response.inspectionIntelligence?.hazardCandidates || [])))) &&
      (!scenario.forbidRawTerms || !scenario.forbidRawTerms.some((pattern) => pattern.test(text))) &&
      response.inspectionIntelligence?.guardrails?.advisoryOnly === true &&
      response.inspectionIntelligence?.guardrails?.candidateStandardsOnly === true &&
      response.inspectionIntelligence?.guardrails?.doesNotDeclareViolation === true &&
      response.inspectionIntelligence?.guardrails?.requiresQualifiedReview === true &&
      (topSuggested.length > 0 || topInspection.length > 0);

    if (passed) {
      console.log(`PASS ${scenario.name}`);
    } else {
      failures += 1;
      console.error(`FAIL ${scenario.name}`, {
        classification: response.classification,
        suggestedCitations,
        inspectionCitations,
        hazardCandidates: response.inspectionIntelligence?.hazardCandidates,
        topSuggested,
        topInspection,
      });
    }
  }

  if (failures > 0) {
    process.exit(1);
  }

  console.log(`HazLenz classify path regression: ${scenarios.length} passed, 0 failed`);
}

run();
