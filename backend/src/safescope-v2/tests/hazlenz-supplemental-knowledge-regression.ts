process.env.RENDER = "true";
process.env.NODE_ENV = "test";
process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER = "false";

import { EvidenceFusionService } from "../evidence/evidence-fusion.service";
import { SafescopeV2Service } from "../safescope-v2.service";
import { WorkspaceGovernanceAccessService } from "../workspace-governance-access/workspace-governance-access.service";
import {
  buildSupplementalGuidance,
  getSupplementalKnowledgeForContext,
} from "../supplemental-knowledge/supplemental-guidance";

function makeStandard(citation: string, title: string, rationale: string, jurisdiction = "osha_general_industry") {
  return {
    citation,
    title,
    titleSummary: title,
    summary: title,
    agencyCode: citation.startsWith("30 CFR") ? "MSHA" : "OSHA",
    jurisdiction,
    score: 640,
    confidence: 0.82,
    candidateStatus: "candidate_standard",
    status: "candidate_standard",
    matchingReasons: [rationale],
    evidenceNeeded: ["Confirm equipment, exposure, and control status."],
    advisoryOnly: true,
    requiresQualifiedReview: true,
    source: ["hazlenz_supplemental_knowledge_regression"],
  };
}

function mockStandardsService() {
  return {
    async suggest(description: string) {
      const text = String(description || "").toLowerCase();
      if (text.includes("used oil") || text.includes("walkway") || text.includes("spill")) {
        return [
          makeStandard("29 CFR 1910.22(a)(2)", "Walking-working surfaces kept free of hazards", "Walking-surface contamination candidate."),
          makeStandard("29 CFR 1910.1200(f)(1)", "Hazard communication workplace labels", "Supporting HazCom candidate."),
        ];
      }
      if (text.includes("chemical") || text.includes("unlabeled")) {
        return [
          makeStandard("29 CFR 1910.1200(f)(6)", "Workplace labeling", "Primary HazCom candidate."),
        ];
      }
      if (text.includes("forklift") || text.includes("loader") || text.includes("pedestrian")) {
        return [
          makeStandard("29 CFR 1910.178", "Powered industrial trucks", "Mobile-equipment candidate."),
        ];
      }
      if (text.includes("shipping") || text.includes("placard") || text.includes("transport")) {
        return [
          makeStandard("49 CFR 172.302", "DOT marking and placarding candidate", "DOT transport candidate.", "dot"),
        ];
      }
      return [makeStandard("29 CFR 1910.1200(f)(6)", "Workplace labeling", "Generic HazCom candidate.")];
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
      const text = String(input.text || "").toLowerCase();
      const msha = input.scopes?.some((scope) => scope.startsWith("msha")) || /mine|aggregate|crusher/.test(text);
      if (text.includes("forklift") || text.includes("loader") || text.includes("truck")) {
        return {
          jurisdiction: msha ? "msha" : "osha_general_industry",
          hazardFamily: "mobile_equipment",
          equipmentFamily: "mobile_equipment",
          taskMechanism: "traffic_conflict",
          shardKey: "mobile_equipment/general",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.94,
          reasons: ["supplemental knowledge regression route"],
        };
      }
      if (text.includes("chemical") || text.includes("used oil") || text.includes("unlabeled")) {
        return {
          jurisdiction: msha ? "msha" : "osha_general_industry",
          hazardFamily: "hazard_communication",
          equipmentFamily: "container",
          taskMechanism: "container_labeling",
          shardKey: "hazcom/container",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.94,
          reasons: ["supplemental knowledge regression route"],
        };
      }
      return {
        jurisdiction: msha ? "msha" : "osha_general_industry",
        hazardFamily: "walking_working_surfaces",
        equipmentFamily: "general",
        taskMechanism: "spill_release",
        shardKey: "walking_working_surfaces/spill",
        bundleIds: [],
        sourceKeys: [],
        confidence: 0.94,
        reasons: ["supplemental knowledge regression route"],
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

let failures = 0;

function pass(name: string, condition: boolean, details?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
  } else {
    failures += 1;
    console.error(`FAIL ${name}`, details);
  }
}

async function run() {
  const helperHazcom = getSupplementalKnowledgeForContext({
    hazardCategory: "hazcom",
    classification: "unlabeled chemical container",
    observation: "Unlabeled closed chemical container on shelf in the maintenance room.",
  });
  pass(
    "helper hazcom aliases resolve supplemental guidance",
    helperHazcom.some((entry) => /NFPA fire and chemical storage guidance/i.test(entry.authorityName)),
    helperHazcom,
  );

  const helperMobile = buildSupplementalGuidance(
    getSupplementalKnowledgeForContext({
      hazardCategory: "mobile_equipment",
      classification: "forklift near pedestrians",
      observation: "A forklift is operating in the same aisle as pedestrians with no marked separation.",
    }),
  );
  pass(
    "helper mobile equipment returns supplemental guidance bundle",
    Boolean(helperMobile?.entries.length) &&
      /traffic-separation guidance/i.test(JSON.stringify(helperMobile)) &&
      /authorityBoundary/i.test(JSON.stringify(helperMobile)),
    helperMobile,
  );

  const spill = await service.classify(
    "An open container of used oil is sitting on the shop floor near a pedestrian walkway.",
    ["osha_general_industry"],
    ["open used oil container", "shop floor", "pedestrian walkway"],
  );
  pass(
    "spill case gets walking-surface primary and supplemental guidance",
    spill.suggestedStandards[0]?.citation === "29 CFR 1910.22(a)(2)" &&
      spill.supplementalGuidance?.entries?.some((entry: any) => entry.family === "walking_working_surfaces") &&
      !spill.suggestedStandards.some((standard: any) => /NFPA|ANSI|NIOSH|CGA/i.test(String(standard.citation || standard.title || standard.titleSummary || ""))),
    spill,
  );

  const hazcom = await service.classify(
    "An unlabeled closed chemical container is stored on a shelf in the maintenance room.",
    ["osha_general_industry"],
    ["unlabeled chemical container", "maintenance room"],
  );
  pass(
    "chemical container keeps HazCom primary and supplemental guidance separate",
    /29 CFR 1910\.1200/.test(String(hazcom.suggestedStandards[0]?.citation || "")) &&
      hazcom.supplementalGuidance?.entries?.some((entry: any) => entry.family === "hazcom") &&
      !hazcom.suggestedStandards.some((standard: any) => /NFPA|ANSI|NIOSH|CGA/i.test(String(standard.citation || standard.title || standard.titleSummary || ""))),
    hazcom,
  );

  const mobile = await service.classify(
    "A forklift is operating in the same aisle as pedestrians with no marked separation.",
    ["osha_general_industry"],
    ["forklift", "pedestrians", "same aisle", "no marked separation"],
  );
  pass(
    "mobile equipment case surfaces supplemental traffic guidance",
    mobile.suggestedStandards[0]?.citation === "29 CFR 1910.178" &&
      mobile.supplementalGuidance?.entries?.some((entry: any) => entry.family === "mobile_equipment"),
    mobile,
  );

  pass(
    "DOT guidance stays outside the supplemental registry",
    !getSupplementalKnowledgeForContext({
      hazardCategory: "hazcom",
      candidateStandardFamily: "hazcom",
      classification: "shipping and placarding context",
      observation: "Freight packages are prepared for shipping and placarding at the outbound hazmat dock.",
    }).some((entry) => /DOT/i.test(entry.authorityName)),
    getSupplementalKnowledgeForContext({
      hazardCategory: "hazcom",
      candidateStandardFamily: "hazcom",
      classification: "shipping and placarding context",
      observation: "Freight packages are prepared for shipping and placarding at the outbound hazmat dock.",
    }),
  );

  if (failures > 0) {
    process.exit(1);
  }

  console.log("HazLenz supplemental knowledge regression: 6 passed, 0 failed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
