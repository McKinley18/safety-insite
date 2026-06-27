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
  expectObserved: RegExp[];
  expectFailure: RegExp[];
  expectExposure: RegExp[];
  expectConsequence: RegExp[];
  expectEvidenceGaps: RegExp[];
  expectControls: RegExp[];
  allowCautiousLanguage?: RegExp[];
};

function mockStandard(citation: string, title: string, rationale: string) {
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
    evidenceNeeded: ["Confirm condition, exposure, and control status."],
    advisoryOnly: true,
    requiresQualifiedReview: true,
    source: ["hazlenz_mechanism_chain_contract_regression"],
  };
}

function mockStandardsService() {
  return {
    async suggest(description: string, hazardCategory?: string) {
      const text = `${description || ""} ${hazardCategory || ""}`.toLowerCase();
      if (/\b(cylinder|oxygen|acetylene|compressed gas|valve cap|secured)\b/.test(text)) {
        return [mockStandard("29 CFR 1910.101", "Compressed gases", "Cylinder evidence supports compressed-gas reasoning.")];
      }
      if (/\b(used oil|waste oil|oil|oily waste|spill|leak|release|residue)\b/.test(text)) {
        return [mockStandard("29 CFR 1910.22(a)(2)", "Walking-working surfaces", "Spill or release contamination on the walking surface.")];
      }
      if (/\b(conveyor|tail pulley|guard|cleanup|maintenance|servicing)\b/.test(text)) {
        return [mockStandard("30 CFR 56.14107(a)", "Machine guarding", "Exposed moving part with cleanup exposure.")];
      }
      if (/\b(cord|cable|extension cord|panel|breaker|energized|conductors?)\b/.test(text)) {
        return [mockStandard("29 CFR 1910.305(g)(2)(iii)", "Electrical enclosure guarding", "Damaged cord or enclosure exposure.")];
      }
      if (/\b(scrap|hoses?|debris|clutter|walkway|aisle|travelway|pedestrian)\b/.test(text)) {
        return [mockStandard("29 CFR 1910.22(a)(3)", "Walking-working surfaces clear access", "Trip hazard along the pedestrian route.")];
      }
      return [mockStandard("29 CFR 1910.212(a)(1)", "Machine guarding", "Fallback candidate.")];
    },
  } as any;
}

function mockActionEngine() {
  return { async generateActionsFromReport() { return []; } } as any;
}

function mockKnowledgeRouter() {
  return {
    route(input: { text: string }) {
      const text = String(input.text || "").toLowerCase();
      if (/\b(cylinder|oxygen|acetylene|compressed gas|valve cap|secured)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "compressed_gas",
          equipmentFamily: "compressed_gas",
          taskMechanism: "stored_energy",
          shardKey: "osha_general_industry/compressed_gas/cylinder",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.92,
          reasons: ["compressed gas evidence detected"],
        };
      }
      if (/\b(used oil|waste oil|oil|oily waste|spill|leak|release|residue)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "walking_working_surfaces",
          equipmentFamily: "housekeeping",
          taskMechanism: "spill_release",
          shardKey: "osha_general_industry/walking_working_surfaces/housekeeping",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.9,
          reasons: ["release evidence detected"],
        };
      }
      if (/\b(conveyor|tail pulley|guard|cleanup|maintenance|servicing)\b/.test(text)) {
        return {
          jurisdiction: "msha",
          hazardFamily: "machine_guarding_loto",
          equipmentFamily: "conveyor",
          taskMechanism: "unexpected_startup",
          shardKey: "msha/machine_guarding_loto/conveyor",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.94,
          reasons: ["conveyor evidence detected"],
        };
      }
      if (/\b(cord|cable|extension cord|panel|breaker|energized|conductors?)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "electrical",
          equipmentFamily: "electrical",
          taskMechanism: "shock_exposure",
          shardKey: "osha_general_industry/electrical/electrical_cord",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.95,
          reasons: ["electrical evidence detected"],
        };
      }
      if (/\b(scrap|hoses?|debris|clutter|walkway|aisle|travelway|pedestrian)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "walking_working_surfaces",
          equipmentFamily: "housekeeping",
          taskMechanism: "trip_hazard",
          shardKey: "osha_general_industry/walking_working_surfaces/housekeeping",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.9,
          reasons: ["walking surface evidence detected"],
        };
      }
      return {
        jurisdiction: "osha_general_industry",
        hazardFamily: "unknown",
        equipmentFamily: "unknown",
        taskMechanism: "unknown",
        shardKey: "general/unknown",
        bundleIds: [],
        sourceKeys: [],
        confidence: 0.5,
        reasons: ["default routing"],
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

function includesAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
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
    name: "unsecured oxygen cylinder near walkway",
    text: "An oxygen cylinder is standing unsecured near a shop aisle where mobile equipment passes.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["oxygen cylinder", "unsecured", "shop aisle", "mobile equipment passes"],
    expectObserved: [/cylinder/i, /unsecured/i],
    expectFailure: [/tip/i, /valve/i, /impact/i, /release/i],
    expectExposure: [/travel path/i, /struck/i, /gas/i],
    expectConsequence: [/struck-by/i, /projectile/i, /fire/i, /impact/i],
    expectEvidenceGaps: [/cap/i, /restraint/i, /location/i, /connected/i],
    expectControls: [/secure/i, /relocate/i, /protect/i],
  },
  {
    name: "open used oil container near walkway",
    text: "An open container of used oil is sitting on the shop floor near a pedestrian walkway.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["open used oil container", "shop floor", "pedestrian walkway"],
    expectObserved: [/open/i, /used oil/i, /container/i],
    expectFailure: [/spill/i, /release/i, /leak/i],
    expectExposure: [/walking surface/i, /pedestrian/i, /floor/i],
    expectConsequence: [/slip/i, /fall/i, /environment/i],
    expectEvidenceGaps: [/label/i, /lid/i, /drain/i, /containment/i],
    expectControls: [/close/i, /contain/i, /clean/i, /label/i],
  },
  {
    name: "conveyor tail pulley missing guard during cleanup",
    text: "At an aggregate plant, the conveyor tail pulley is missing a guard and miners clean spilled material near the moving belt.",
    scopes: ["msha"],
    evidenceTexts: ["missing guard", "tail pulley", "cleanup", "moving belt"],
    expectObserved: [/conveyor/i, /tail pulley/i, /missing guard/i],
    expectFailure: [/nip/i, /caught/i, /entangl/i],
    expectExposure: [/cleanup/i, /moving/i, /access/i],
    expectConsequence: [/amputation/i, /crush/i, /fatal/i],
    expectEvidenceGaps: [/operating/i, /loto/i, /guard/i, /access/i],
    expectControls: [/lock out/i, /guard/i, /restrict access/i],
  },
  {
    name: "open breaker slot",
    text: "In the maintenance shop, an electrical panel has an open breaker slot and missing cover plate.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["open breaker slot", "missing cover plate"],
    expectObserved: [/electrical enclosure/i, /open slot/i, /missing cover/i],
    expectFailure: [/contact/i, /arc/i, /entry/i],
    expectExposure: [/energized/i, /approach/i, /work near/i],
    expectConsequence: [/shock/i, /arc/i, /burn/i],
    expectEvidenceGaps: [/clearance/i, /panel/i, /access/i, /servicing/i],
    expectControls: [/de-energize/i, /restrict access/i, /qualified/i],
  },
  {
    name: "damaged extension cord",
    text: "A portable grinder has a damaged power cord lying on a damp floor.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["damaged power cord", "damp floor"],
    expectObserved: [/damaged/i, /cord/i, /damp/i],
    expectFailure: [/shock/i, /leakage/i, /ground fault/i],
    expectExposure: [/wet/i, /hand/i, /surface/i, /travel/i],
    expectConsequence: [/shock/i, /electrocution/i, /trip/i],
    expectEvidenceGaps: [/gfc/i, /remove from service/i, /cord damage/i],
    expectControls: [/replace/i, /remove from service/i, /dry/i, /gfc/i],
  },
  {
    name: "scrap and hoses across walkway",
    text: "Scrap material and hoses are lying across a designated pedestrian walkway.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["scrap material", "hoses", "pedestrian walkway"],
    expectObserved: [/cord, hose, or lead/i, /pedestrian route/i],
    expectFailure: [/trip/i, /entangl/i, /stumble/i],
    expectExposure: [/pedestrian/i, /travel/i, /walk/i],
    expectConsequence: [/fall/i, /sprain/i, /strain/i],
    expectEvidenceGaps: [/specific material/i, /obstruction/i, /travelway/i, /emergency exit/i],
    expectControls: [/remove/i, /reroute/i, /clear/i],
  },
  {
    name: "vague area unsafe",
    text: "area unsafe",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["unsafe"],
    expectObserved: [/general safety or hazard concern reported with insufficient detail/i],
    expectFailure: [/unspecified physical defect/i, /unsafe worker behavior/i],
    expectExposure: [/employee proximity/i, /travel path/i],
    expectConsequence: [/possible injury or hazard involvement/i],
    expectEvidenceGaps: [/specific physical condition/i, /equipment name/i, /employee proximity/i],
    expectControls: [/isolate the area/i, /restrict access/i, /qualified safety professional/i],
    allowCautiousLanguage: [/review needed — more evidence required/i],
  },
];

function textOf(value: unknown): string {
  return JSON.stringify(value || {});
}

async function run() {
  let failures = 0;

  for (const scenario of scenarios) {
    const response = await service.classify(
      scenario.text,
      scenario.scopes,
      scenario.evidenceTexts,
      "standard_5x5",
    );

    const topMechanism = response.mechanismChain || {};
    const legacyChain = response.inspectionIntelligence?.mechanismChain || {};
    const combinedText = `${textOf(topMechanism)} ${textOf(legacyChain)} ${textOf(response)}`;

    const passed =
      response.requiresHumanReview === true &&
      typeof topMechanism === "object" &&
      typeof topMechanism.observedCondition === "string" &&
      topMechanism.observedCondition.length > 0 &&
      typeof topMechanism.failureMode === "string" &&
      topMechanism.failureMode.length > 0 &&
      typeof topMechanism.exposurePathway === "string" &&
      topMechanism.exposurePathway.length > 0 &&
      typeof topMechanism.potentialConsequence === "string" &&
      topMechanism.potentialConsequence.length > 0 &&
      Array.isArray(topMechanism.evidenceGaps) &&
      topMechanism.evidenceGaps.length > 0 &&
      Array.isArray(topMechanism.controlFocus) &&
      topMechanism.controlFocus.length > 0 &&
      includesAny(textOf(topMechanism), scenario.expectObserved) &&
      includesAny(textOf(topMechanism), scenario.expectFailure) &&
      includesAny(textOf(topMechanism), scenario.expectExposure) &&
      includesAny(textOf(topMechanism), scenario.expectConsequence) &&
      includesAny(textOf(topMechanism.evidenceGaps), scenario.expectEvidenceGaps) &&
      includesAny(textOf(topMechanism.controlFocus), scenario.expectControls) &&
      includesAny(textOf(legacyChain), scenario.expectObserved) &&
      includesAny(textOf(legacyChain), scenario.expectFailure) &&
      includesAny(textOf(legacyChain), scenario.expectExposure) &&
      includesAny(textOf(legacyChain), scenario.expectConsequence) &&
      !/\b(violation confirmed|citation issued|noncompliant|definite violation|must cite|final citation)\b/i.test(combinedText) &&
      (scenario.allowCautiousLanguage ? includesAny(combinedText, scenario.allowCautiousLanguage) : true);

    if (!passed) {
      failures += 1;
      console.error(`FAIL ${scenario.name}`, {
        mechanismChain: topMechanism,
        legacyChain,
        guardrails: response.guardrails,
        reviewStateLabel: response.reviewStateLabel,
        evidenceGapQuestions: response.evidenceGapQuestions,
        classification: response.classification,
        hazardCategory: response.hazardCategory,
        candidateStandardFamily: response.candidateStandardFamily,
      });
    } else {
      console.log(`PASS ${scenario.name}`);
    }
  }

  if (failures > 0) {
    process.exit(1);
  }

  console.log(`HazLenz mechanism-chain contract regression: ${scenarios.length} passed, 0 failed`);
}

run();
