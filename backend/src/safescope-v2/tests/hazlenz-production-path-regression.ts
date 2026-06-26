process.env.RENDER = "true";
process.env.NODE_ENV = "production";
process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER = "true";

import { EvidenceFusionService } from "../evidence/evidence-fusion.service";
import { SafescopeV2Service } from "../safescope-v2.service";
import { WorkspaceGovernanceAccessService } from "../workspace-governance-access/workspace-governance-access.service";

type Scenario = {
  name: string;
  text: string;
  scopes?: string[];
  evidenceTexts?: string[];
  expectClassification: RegExp;
  expectHazardCategory: RegExp;
  expectCandidateFamily: RegExp;
  expectCitations: RegExp[];
  forbidCitations?: RegExp[];
  expectPromotion?: RegExp;
  forbidPromotion?: RegExp;
  expectReview?: RegExp;
  allowNoSuggestedStandards?: boolean;
};

function standard(citation: string, title: string, rationale: string, jurisdiction: "osha_general_industry" | "osha_construction" | "msha" = "osha_general_industry", status: "candidate_standard" | "needs_more_evidence" = "candidate_standard") {
  return {
    citation,
    title,
    titleSummary: title,
    summary: title,
    agencyCode: citation.startsWith("30 CFR") ? "MSHA" : "OSHA",
    jurisdiction,
    score: status === "needs_more_evidence" ? 520 : 880,
    confidence: status === "needs_more_evidence" ? 0.38 : 0.92,
    candidateStatus: status,
    status,
    matchingReasons: [rationale],
    evidenceNeeded: ["Confirm condition, exposure, and control status."],
    advisoryOnly: true,
    requiresQualifiedReview: true,
    source: ["hazlenz_production_path_regression"],
  };
}

function mockStandardsService() {
  return {
    async suggest(description: string, hazardCategory?: string) {
      const text = `${description || ""} ${hazardCategory || ""}`.toLowerCase();
      const hasCord = /\b(cord|cable|extension cord|power cord|temporary wiring|flexible cord)\b/.test(text);
      const hasServicing = /\b(lockout|loto|tagout|servicing|maintenance|unexpected startup|hazardous energy)\b/.test(text);
      const hasContainer = /\b(container|tank|drum|bucket|can|jug|tote|pail)\b/.test(text);
      const hasCylinder = /\b(cylinder|oxygen|acetylene|compressed gas|valve cap|secured)\b/.test(text);
      const hasWalkway = /\b(walkway|aisle|floor|travelway|pedestrian|shop floor|maintenance area)\b/.test(text);
      const hasGuard = /\b(guard|guardrail|opening|panel|breaker|shaft|pulley|conveyor)\b/.test(text);

      if (hasCord && hasServicing) {
        return [
          standard("29 CFR 1910.147", "Control of hazardous energy", "Servicing and energy-isolation evidence supports LOTO."),
          standard("29 CFR 1910.1200", "Hazard communication", "Generic fallback should remain supporting only."),
        ];
      }

      if (hasCord) {
        return [
          standard("1910.147", "Lockout / Tagout", "Generic fallback should be demoted for a damaged cord."),
          standard("29 CFR 1910.331", "Electrical general requirements / work practices", "Broad electrical work-practice fallback."),
          standard("29 CFR 1910.1200", "Hazard communication", "Unrelated fallback should be suppressed."),
        ];
      }

      if (hasGuard) {
        return [
          standard("29 CFR 1910.212(a)(1)", "Machine guarding", "Generic guarding fallback."),
          standard("29 CFR 1910.28(b)(1)", "Fall protection", "Generic fall-protection fallback."),
        ];
      }

      if (hasContainer) {
        return [
          standard("29 CFR 1910.1200(f)(1)", "Hazard communication / container labeling", "Container identity review."),
          standard("29 CFR 1910.147", "Lockout / Tagout", "Should not overtake unlabeled container cases."),
        ];
      }

      if (hasCylinder) {
        return [
          standard("29 CFR 1910.101", "Compressed gases", "Cylinder evidence supports compressed-gas reasoning."),
          standard("29 CFR 1910.1200", "Hazard communication", "Supporting only."),
        ];
      }

      if (hasWalkway) {
        return [
          standard("29 CFR 1910.22(a)(2)", "Walking-working surfaces", "Travel path contamination or obstruction."),
          standard("29 CFR 1910.1200", "Hazard communication", "Fallback only."),
        ];
      }

      return [
        standard("29 CFR 1910.212(a)(1)", "Machine guarding", "Fallback review candidate."),
      ];
    },
  } as any;
}

function mockActionEngine() {
  return { async generateActionsFromReport() { return []; } } as any;
}

function mockKnowledgeRouter() {
  return {
    route(input: { text: string; scopes?: string[] }) {
      const text = `${input.text || ""} ${(input.scopes || []).join(" ")}`.toLowerCase();
      if (/\b(lockout|loto|tagout|servicing|maintenance|unexpected startup|hazardous energy)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "machine_guarding_loto",
          equipmentFamily: "general_equipment",
          taskMechanism: "unexpected_startup",
          shardKey: "osha_general_industry/machine_guarding_loto/general",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.96,
          reasons: ["LOTO evidence detected"],
        };
      }
      if (/\b(cord|cable|extension cord|power cord|flexible cord|panel|breaker|electrical|energized|conductors?|wire)\b/.test(text)) {
        return {
          jurisdiction: text.includes("msha") ? "msha" : "osha_general_industry",
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
      if (/\b(container|tank|drum|bucket|can|jug|tote|pail)\b/.test(text)) {
        return {
          jurisdiction: "osha_general_industry",
          hazardFamily: "hazard_communication",
          equipmentFamily: "container",
          taskMechanism: "identity_gap",
          shardKey: "osha_general_industry/hazard_communication/container",
          bundleIds: [],
          sourceKeys: [],
          confidence: 0.91,
          reasons: ["container evidence detected"],
        };
      }
      if (/\b(walkway|aisle|floor|travelway|pedestrian|debris|material)\b/.test(text)) {
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

function citationsFromResponse(response: any): string[] {
  const buckets = [
    response.suggestedStandards,
    response.primaryStandards,
    response.standards,
    response.supportingStandards,
    response.needsMoreEvidenceStandards,
    response.excludedStandards,
    response.inspectionIntelligence?.candidateStandards,
    response.inspectionIntelligence?.standardApplicability?.suggestedStandards,
    response.standardApplicability?.suggestedStandards,
    response.standardApplicability?.matchedRules,
    response.standardsTraceability?.suggestedCitations,
    response.standardsTraceability?.supportingCitations,
    response.standardsTraceability?.needsMoreEvidenceCitations,
    response.promotion?.approvedRecordCandidate?.authority?.citation ? [response.promotion.approvedRecordCandidate.authority.citation] : [],
    response.primaryCitation ? [response.primaryCitation] : [],
  ];

  return Array.from(
    new Set(
      buckets
        .flat()
        .map((item: any) => String(item?.citation || item?.standard || item?.authority?.citation || item || "").trim())
        .filter(Boolean),
    ),
  );
}

function frontFacingCitationsFromResponse(response: any): string[] {
  return Array.from(
    new Set(
      [
        response.suggestedStandards,
        response.primaryStandards,
        response.standards,
        response.standardsTraceability?.suggestedCitations,
        response.promotion?.approvedRecordCandidate?.authority?.citation ? [response.promotion.approvedRecordCandidate.authority.citation] : [],
        response.primaryCitation ? [response.primaryCitation] : [],
      ]
        .flat()
        .map((item: any) => String(item?.citation || item?.standard || item?.authority?.citation || item || "").trim())
        .filter(Boolean),
    ),
  );
}

function firstCitation(value: any): string {
  const list = Array.isArray(value) ? value : [];
  return String(list[0]?.citation || list[0]?.standard || list[0] || "").trim();
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
    name: "cord damaged osha gi",
    text: "Cord is damaged.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["Damaged cord"],
    expectClassification: /Electrical/i,
    expectHazardCategory: /electrical/i,
    expectCandidateFamily: /electrical/i,
    expectCitations: [/29 CFR 1910\.305\(g\)\(2\)\(iii\)/i],
    forbidCitations: [/1910\.147/i, /30 CFR 56\.12013/i],
    forbidPromotion: /1910\.147/i,
    expectReview: /Review/i,
  },
  {
    name: "cord damaged msha",
    text: "Cord is damaged.",
    scopes: ["msha"],
    evidenceTexts: ["Damaged cord"],
    expectClassification: /Electrical/i,
    expectHazardCategory: /electrical/i,
    expectCandidateFamily: /electrical/i,
    expectCitations: [/30 CFR 56\.12013/i],
    forbidCitations: [/1910\.147/i],
    forbidPromotion: /1910\.147/i,
    expectReview: /Review/i,
  },
  {
    name: "cord damaged no jurisdiction",
    text: "Cord is damaged.",
    scopes: [],
    evidenceTexts: ["Damaged cord"],
    expectClassification: /Electrical/i,
    expectHazardCategory: /electrical/i,
    expectCandidateFamily: /electrical/i,
    expectCitations: [],
    allowNoSuggestedStandards: true,
    expectReview: /Review/i,
  },
  {
    name: "frayed cord with exposed conductors",
    text: "Machine cord is frayed with exposed conductors.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["frayed cord", "exposed conductors"],
    expectClassification: /Electrical/i,
    expectHazardCategory: /electrical/i,
    expectCandidateFamily: /electrical/i,
    expectCitations: [/1910\.305|1910\.334/i],
    forbidCitations: [/1910\.147/i, /1910\.1200/i],
    expectReview: /Review/i,
  },
  {
    name: "cord damaged without evidence texts",
    text: "Cord is damaged.",
    scopes: ["osha_general_industry"],
    evidenceTexts: [],
    expectClassification: /Electrical/i,
    expectHazardCategory: /electrical/i,
    expectCandidateFamily: /electrical/i,
    expectCitations: [/1910\.305\(g\)\(2\)\(iii\)/i],
    forbidCitations: [/1910\.147/i],
    expectReview: /Review/i,
  },
  {
    name: "lockout before servicing",
    text: "Equipment must be locked out before servicing.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["locked out", "servicing"],
    expectClassification: /Lockout \/ Stored Energy|Machine Guarding/i,
    expectHazardCategory: /machine_guarding_loto|lockout|stored|machine_guarding/i,
    expectCandidateFamily: /machine_guarding_loto|loto|machine_guarding/i,
    expectCitations: [],
    allowNoSuggestedStandards: true,
    forbidCitations: [/1910\.305\(g\)\(2\)\(iii\)/i],
    expectReview: /Review/i,
  },
  {
    name: "equipment being serviced without lockout",
    text: "Equipment is being serviced without lockout.",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["serviced", "without lockout"],
    expectClassification: /Lockout \/ Stored Energy|Machine Guarding/i,
    expectHazardCategory: /machine_guarding_loto|lockout|stored/i,
    expectCandidateFamily: /machine_guarding_loto|loto/i,
    expectCitations: [/1910\.147/i],
    forbidCitations: [/1910\.305\(g\)\(2\)\(iii\)/i],
    expectReview: /Review/i,
  },
  {
    name: "meaningless input",
    text: "safety concern",
    scopes: ["osha_general_industry"],
    evidenceTexts: ["safety concern"],
    expectClassification: /Unclassified|Unknown/i,
    expectHazardCategory: /unknown|other/i,
    expectCandidateFamily: /unknown/i,
    expectCitations: [],
    allowNoSuggestedStandards: true,
    expectReview: /Review/i,
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

    const citations = citationsFromResponse(response);
    const frontFacingCitations = frontFacingCitationsFromResponse(response);
    const primaryCitation = String(response.primaryCitation || response.promotion?.approvedRecordCandidate?.authority?.citation || "");
    const topSuggestedCitation = firstCitation(response.suggestedStandards || response.primaryStandards || response.standards || []);
    const candidateStandardFamily = String(response.candidateStandardFamily || response.inspectionIntelligence?.standardApplicability?.matchedRules?.[0]?.hazardFamily || "");
    const classification = String(response.classification || "");
    const hazardCategory = String(response.hazardCategory || "");
    const standardsTraceability = response.standardsTraceability || {};
    const applicableSuggestions = response.inspectionIntelligence?.standardApplicability?.suggestedStandards || [];
    const promotionCitation = String(response.promotion?.approvedRecordCandidate?.authority?.citation || "");
    const reviewText = String(response.reviewStateLabel || "");

    const passed =
      scenario.expectClassification.test(classification) &&
      scenario.expectHazardCategory.test(hazardCategory) &&
      scenario.expectCandidateFamily.test(candidateStandardFamily) &&
      (scenario.expectReview ? scenario.expectReview.test(reviewText) : true) &&
      (response.requiresHumanReview === true) &&
      (scenario.allowNoSuggestedStandards ? true : (frontFacingCitations.length > 0 || applicableSuggestions.length > 0 || Boolean(primaryCitation))) &&
      scenario.expectCitations.every((pattern) => pattern.test(frontFacingCitations.join(" ") + " " + topSuggestedCitation + " " + primaryCitation + " " + promotionCitation)) &&
      !(scenario.forbidCitations || []).some((pattern) => pattern.test(frontFacingCitations.join(" ") + " " + topSuggestedCitation + " " + primaryCitation + " " + promotionCitation)) &&
      !(scenario.forbidPromotion && scenario.forbidPromotion.test(promotionCitation)) &&
      (scenario.expectPromotion ? scenario.expectPromotion.test(promotionCitation || primaryCitation) : true) &&
      !/^\s*(review|needs more evidence|candidate standard|suggested candidate standard)\s*$/i.test(topSuggestedCitation) &&
      !/^\s*(review|needs more evidence|candidate standard|suggested candidate standard)\s*$/i.test(primaryCitation) &&
      (!scenario.name.includes("cord damaged") || Number(standardsTraceability.scopeFilteredCandidateCount || 0) > 0);

    if (passed) {
      console.log(`PASS ${scenario.name}`);
    } else {
      failures += 1;
      console.error(`FAIL ${scenario.name}`, {
        classification,
        hazardCategory,
        candidateStandardFamily,
        topSuggestedCitation,
        primaryCitation,
        promotionCitation,
        citations,
        reviewText,
        standardsTraceability,
        applicableSuggestions,
      });
    }
  }

  if (failures > 0) {
    process.exit(1);
  }

  console.log(`HazLenz production path regression: ${scenarios.length} passed, 0 failed`);
}

run();
