process.env.RENDER = "true";
process.env.NODE_ENV = "production";
process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER = "true";

import { EvidenceFusionService } from "../evidence/evidence-fusion.service";
import { SafescopeV2Service } from "../safescope-v2.service";
import { WorkspaceGovernanceAccessService } from "../workspace-governance-access/workspace-governance-access.service";

type Scenario = {
  name: string;
  text: string;
  evidenceTexts: string[];
  scopes: string[];
  expectClassification: RegExp;
  expectCandidateFamily: RegExp;
  expectHazardCategory: RegExp;
  expectCitation?: RegExp;
  expectNeedsMoreEvidence?: RegExp;
  forbidCitation?: RegExp;
  expectReviewState?: RegExp;
};

type StandardMode = "candidate_standard" | "needs_more_evidence";

function makeStandard(
  citation: string,
  title: string,
  rationale: string,
  jurisdiction: "osha_general_industry" | "osha_construction" | "msha" = "osha_general_industry",
  mode: StandardMode = "candidate_standard",
) {
  return {
    citation,
    title,
    titleSummary: title,
    summary: title,
    agencyCode: citation.startsWith("30 CFR") ? "MSHA" : "OSHA",
    jurisdiction,
    score: 700,
    confidence: mode === "needs_more_evidence" ? 0.42 : 0.9,
    candidateStatus: mode,
    status: mode,
    matchingReasons: [rationale],
    evidenceNeeded: ["Confirm observation context, exposure, and controls."],
    advisoryOnly: true,
    requiresQualifiedReview: true,
    source: ["hazlenz_vague_candidate_promotion_regression"],
  };
}

function mockStandardsService() {
  return {
    async suggest(description: string, hazardCategory?: string) {
      const text = `${description || ""} ${hazardCategory || ""}`.toLowerCase();

      if (/\b(cord|cable|extension cord|power cord|temporary wiring)\b/.test(text)) {
        return [
          makeStandard(
            "29 CFR 1910.305(g)(2)(iii)",
            "Flexible cords and cables",
            "Damaged flexible cord evidence is present but still needs a qualified applicability review.",
            "osha_general_industry",
            "needs_more_evidence",
          ),
          makeStandard(
            "29 CFR 1910.334(a)(2)(ii)",
            "Portable electric equipment and flexible cord use",
            "Cord damage plus use context can support an electrical candidate family.",
            "osha_general_industry",
            "needs_more_evidence",
          ),
        ];
      }

      if (/\b(guard|guarding|guardrail|opening|open slot|panel|breaker|shaft|pulley|conveyor)\b/.test(text)) {
        if (/\b(conveyor|mine|aggregate|crusher|tail pulley)\b/.test(text)) {
          return [
            makeStandard(
              "30 CFR 56.14107(a)",
              "Moving machine parts (guarding)",
              "Mine machine guarding candidate with incomplete exposure detail.",
              "msha",
              "needs_more_evidence",
            ),
          ];
        }

        if (/\b(guardrail|platform|edge|ladder|fall)\b/.test(text)) {
          return [
            makeStandard(
              "29 CFR 1910.28(b)(1)",
              "Fall protection on walking-working surfaces",
              "Platform/edge exposure needs more details before applicability is finalized.",
              "osha_general_industry",
              "needs_more_evidence",
            ),
          ];
        }

        return [
          makeStandard(
            "29 CFR 1910.212(a)(1)",
            "Machine guarding",
            "Guarding concern is plausible, but equipment/component details are still needed.",
            "osha_general_industry",
            "needs_more_evidence",
          ),
        ];
      }

      if (/\b(container|drum|bucket|tote|can|jug)\b/.test(text)) {
        if (/\b(cylinder|oxygen|acetylene|gas)\b/.test(text)) {
          return [
            makeStandard(
              "29 CFR 1910.101",
              "Compressed gases (general requirements)",
              "Cylinder evidence exists, so compressed-gas reasoning is allowed.",
              "osha_general_industry",
            ),
          ];
        }

        return [
          makeStandard(
            "29 CFR 1910.1200(f)(1)",
            "Labels on shipped containers / workplace chemical identity",
            "Unknown container contents need HazCom review but remain advisory.",
            "osha_general_industry",
            "needs_more_evidence",
          ),
        ];
      }

      if (/\b(cylinder|oxygen|acetylene|compressed gas|valve cap|unsecured)\b/.test(text)) {
        return [
          makeStandard(
            "29 CFR 1910.101",
            "Compressed gases (general requirements)",
            "Cylinder evidence is present, so compressed-gas reasoning is allowed.",
            "osha_general_industry",
          ),
        ];
      }

      if (/\b(walkway|aisle|travelway|floor|trip|debris|material)\b/.test(text)) {
        return [
          makeStandard(
            "29 CFR 1910.22(a)",
            "Walking-working surfaces housekeeping",
            "Walking-surface exposure is plausible but still low confidence.",
            "osha_general_industry",
            "needs_more_evidence",
          ),
        ];
      }

      return [
        makeStandard(
          "29 CFR 1910.212(a)(1)",
          "Machine guarding",
          "Fallback advisory candidate.",
          "osha_general_industry",
          "needs_more_evidence",
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
      const hasMine = /\b(mine|aggregate|crusher|quarry)\b/.test(text) || input.scopes?.some((scope) => scope.startsWith("msha"));
      if (/\b(cylinder|oxygen|acetylene|compressed gas)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "compressed_gas",
          equipmentFamily: "compressed_gas",
          taskMechanism: "stored_energy",
          shardKey: "osha_general_industry/compressed_gas/cylinder",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.92,
          reasons: ["compressed-gas evidence detected"],
        };
      }
      if (/\b(cord|panel|breaker|electrical|energized|wire)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "electrical",
          equipmentFamily: "electrical",
          taskMechanism: "shock_exposure",
          shardKey: "osha_general_industry/electrical/electrical_panel",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.93,
          reasons: ["electrical evidence detected"],
        };
      }
      if (/\b(guard|guardrail|platform|edge|ladder|fall)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "fall_protection",
          equipmentFamily: "walking_working_surfaces",
          taskMechanism: "fall_to_lower_level",
          shardKey: "osha_general_industry/fall_protection/fall_guardrail",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.91,
          reasons: ["fall protection evidence detected"],
        };
      }
      if (/\b(container|chemical|label|hazcom)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "hazard_communication",
          equipmentFamily: "chemical_container",
          taskMechanism: "identity_gap",
          shardKey: "osha_general_industry/hazard_communication/container",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.91,
          reasons: ["hazcom evidence detected"],
        };
      }
      if (hasMine && /\b(guard|conveyor|pulley|shaft|machine)\b/.test(text)) {
        return {
          jurisdiction: "msha",
          hazardFamily: "machine_guarding",
          equipmentFamily: "conveyor",
          taskMechanism: "caught_in",
          shardKey: "msha/machine_guarding/conveyor",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.94,
          reasons: ["mine guarding evidence detected"],
        };
      }
      if (/\b(walkway|aisle|floor|trip|debris|material)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "walking_working_surfaces",
          equipmentFamily: "housekeeping",
          taskMechanism: "slip_trip",
          shardKey: "osha_general_industry/walking_working_surfaces/housekeeping",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.9,
          reasons: ["walking surface evidence detected"],
        };
      }
      return {
        jurisdiction: "osha_general_industry",
        hazardFamily: "machine_guarding",
        equipmentFamily: "general",
        taskMechanism: "review",
        shardKey: "osha_general_industry/machine_guarding/general",
        bundleIds: [],
        sourceKeys: [],
        confidence: 0.7,
        reasons: ["fallback"],
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
    name: "cord is damaged",
    text: "Cord is damaged.",
    evidenceTexts: ["Damaged cord"],
    scopes: ["osha_general_industry"],
    expectClassification: /Electrical/i,
    expectCandidateFamily: /electrical/i,
    expectHazardCategory: /electrical/i,
    expectNeedsMoreEvidence: /1910\.305|1910\.334/,
    forbidCitation: /1910\.147/,
    expectReviewState: /review/i,
  },
  {
    name: "guard is missing",
    text: "Guard is missing.",
    evidenceTexts: ["missing guard"],
    scopes: ["osha_general_industry"],
    expectClassification: /Machine Guarding/i,
    expectCandidateFamily: /machine_guarding/i,
    expectHazardCategory: /machine_guarding/i,
    expectNeedsMoreEvidence: /1910\.212|1910\.219/,
    expectReviewState: /review/i,
  },
  {
    name: "container is open",
    text: "Container is open.",
    evidenceTexts: ["open container"],
    scopes: ["osha_general_industry"],
    expectClassification: /Hazard Communication/i,
    expectCandidateFamily: /hazcom/i,
    expectHazardCategory: /hazard_communication|hazardous_materials/i,
    expectNeedsMoreEvidence: /1910\.1200/,
    forbidCitation: /1910\.101/,
    expectReviewState: /review/i,
  },
  {
    name: "cylinder is unsecured",
    text: "Cylinder is unsecured.",
    evidenceTexts: ["unsecured cylinder"],
    scopes: ["osha_general_industry"],
    expectClassification: /Compressed Gas Cylinders/i,
    expectCandidateFamily: /compressed_gas/i,
    expectHazardCategory: /compressed_gas/i,
    expectCitation: /1910\.101/,
    forbidCitation: /1910\.147/,
    expectReviewState: /review/i,
  },
  {
    name: "material is near walkway",
    text: "Material is near the walkway.",
    evidenceTexts: ["material near walkway"],
    scopes: ["osha_general_industry"],
    expectClassification: /Walking\/Working Surfaces/i,
    expectCandidateFamily: /walking_working_surfaces/i,
    expectHazardCategory: /walking_working_surfaces|slip_trip_fall/i,
    expectNeedsMoreEvidence: /1910\.22/,
    expectReviewState: /review/i,
  },
];

const forbiddenReviewCitation = /\b(review|candidate standard|needs more evidence)\b/i;

function flattenStandards(result: any) {
  return [
    ...(result.suggestedStandards || []),
    ...(result.primaryStandards || []),
    ...(result.supportingStandards || []),
    ...(result.needsMoreEvidenceStandards || []),
    ...(result.inspectionIntelligence?.candidateStandards || []),
    ...(result.standardApplicability?.suggestedStandards || []),
    ...(result.standardApplicability?.needsMoreEvidenceStandards || []),
    ...(result.standardsTraceability?.suggestedCitations || []),
  ];
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

    const standards = flattenStandards(response);
    const standardsText = JSON.stringify(standards);
    const promotionCitation = String(response.promotion?.approvedRecordCandidate?.authority?.citation || "");
    const promotionTitle = String(response.promotion?.approvedRecordCandidate?.authority?.title || "");
    const reviewState = String(response.reviewStateLabel || "");

    const passed =
      scenario.expectClassification.test(String(response.classification || "")) &&
      scenario.expectCandidateFamily.test(String(response.candidateStandardFamily || "")) &&
      scenario.expectHazardCategory.test(String(response.hazardCategory || "")) &&
      (!scenario.expectCitation || scenario.expectCitation.test(standardsText)) &&
      (!scenario.expectNeedsMoreEvidence || scenario.expectNeedsMoreEvidence.test(standardsText)) &&
      (!scenario.forbidCitation || !scenario.forbidCitation.test(standardsText)) &&
      (!forbiddenReviewCitation.test(promotionCitation) && !forbiddenReviewCitation.test(promotionTitle)) &&
      (scenario.expectReviewState ? scenario.expectReviewState.test(reviewState) : true) &&
      response.requiresHumanReview === true &&
      response.hazardCategory !== "unknown" &&
      response.candidateStandardFamily !== "unknown" &&
      /review/i.test(reviewState) &&
      (response.standardsTraceability?.scopeFilteredCandidateCount || 0) > 0 &&
      (response.standardsTraceability?.needsMoreEvidenceCandidateCount || 0) >= 0 &&
      response.inspectionIntelligence?.guardrails?.advisoryOnly === true &&
      response.inspectionIntelligence?.guardrails?.candidateStandardsOnly === true &&
      response.inspectionIntelligence?.guardrails?.doesNotDeclareViolation === true &&
      response.inspectionIntelligence?.guardrails?.requiresQualifiedReview === true;

    if (passed) {
      console.log(`PASS ${scenario.name}`);
    } else {
      failures += 1;
      console.error(`FAIL ${scenario.name}`, {
        classification: response.classification,
        candidateStandardFamily: response.candidateStandardFamily,
        hazardCategory: response.hazardCategory,
        suggestedStandards: response.suggestedStandards,
        needsMoreEvidenceStandards: response.needsMoreEvidenceStandards,
        traceability: response.standardsTraceability,
        promotionCitation,
        promotionTitle,
        reviewState,
      });
    }
  }

  if (failures > 0) {
    process.exit(1);
  }

  console.log(`HazLenz vague candidate promotion regression: ${scenarios.length} passed, 0 failed`);
}

run();
