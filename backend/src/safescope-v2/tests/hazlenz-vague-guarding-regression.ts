process.env.RENDER = "true";
process.env.NODE_ENV = "test";
process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER = "false";

import { EvidenceFusionService } from "../evidence/evidence-fusion.service";
import { SafescopeV2Service } from "../safescope-v2.service";
import { WorkspaceGovernanceAccessService } from "../workspace-governance-access/workspace-governance-access.service";

type Case = {
  name: string;
  text: string;
  evidenceTexts: string[];
  scopes: string[];
  expectClassification: RegExp;
  forbidClassification?: RegExp;
  expectReviewLabel?: RegExp;
  expectSuggestedStandards?: RegExp;
  forbidSuggestedStandards?: RegExp;
  expectSuppressedStandards?: RegExp;
  expectQuestionsCount?: number;
  expectNoSuggestedStandards?: boolean;
};

function makeStandard(citation: string, title: string, rationale: string, jurisdiction = "osha_general_industry") {
  return {
    citation,
    title,
    titleSummary: title,
    summary: title,
    agencyCode: citation.startsWith("30 CFR") ? "MSHA" : "OSHA",
    jurisdiction,
    score: 640,
    confidence: 0.78,
    candidateStatus: "candidate_standard",
    status: "candidate_standard",
    matchingReasons: [rationale],
    evidenceNeeded: ["Confirm equipment, exposure, and control status."],
    advisoryOnly: true,
    requiresQualifiedReview: true,
    source: ["hazlenz_vague_guarding_regression"],
  };
}

function mockStandardsService() {
  return {
    async suggest(description: string, hazardCategory?: string) {
      const text = `${description || ""} ${hazardCategory || ""}`.toLowerCase();
      if (text.includes("conveyor") || text.includes("mine")) {
        return [
          makeStandard(
            "30 CFR 56.14107(a)",
            "Moving machine parts / guarding",
            "Potential mine conveyor guarding candidate.",
            "msha",
          ),
          makeStandard(
            "29 CFR 1910.212(a)(1)",
            "Machine guarding",
            "Fallback guarding candidate.",
          ),
        ];
      }

      if (text.includes("rotating shaft")) {
        return [
          makeStandard(
            "29 CFR 1910.219(c)",
            "Rotating parts / shaft guarding",
            "Direct machine-guarding candidate for an exposed shaft.",
          ),
          makeStandard(
            "29 CFR 1910.212(a)(1)",
            "Machine guarding",
            "Supporting machine-guarding candidate.",
          ),
        ];
      }

      if (text.includes("guardrail") || text.includes("platform")) {
        return [
          makeStandard(
            "29 CFR 1910.28(b)(1)",
            "Fall protection on elevated surfaces",
            "Direct fall-protection candidate for an elevated platform.",
          ),
        ];
      }

      return [
        makeStandard(
          "29 CFR 1910.212(a)(1)",
          "Machine guarding",
          "Generic guarding candidate for an unspecified guard concern.",
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
      const mine = /mine|aggregate|conveyor/i.test(text);
      const platform = /guardrail|platform|elevated/i.test(text);
      const shaft = /rotating shaft/i.test(text);
      return {
        jurisdiction: input.scopes?.some((scope) => scope.startsWith("msha")) || mine
          ? "msha"
          : "osha_general_industry",
        hazardFamily: shaft
          ? "machine_guarding"
          : platform
            ? "fall_protection"
            : "machine_guarding",
        equipmentFamily: shaft
          ? "machine_guarding"
          : platform
            ? "fall_protection"
            : mine
              ? "machine_guarding"
              : "general",
        taskMechanism: shaft
          ? "caught_in_entanglement"
          : platform
            ? "fall_to_lower_level"
            : "guarding_review",
        shardKey: shaft
          ? "osha_general_industry/machine_guarding/rotating_shaft"
          : platform
            ? "osha_general_industry/fall_protection/guardrail"
            : mine
              ? "msha/machine_guarding/conveyor"
              : "osha_general_industry/machine_guarding/general",
        bundleIds: [],
        sourceKeys: [],
        confidence: 0.88,
        reasons: ["vague guarding regression stub"],
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

const cases: Case[] = [
  {
    name: "missing guard",
    text: "missing guard",
    evidenceTexts: ["missing guard"],
    scopes: ["osha_general_industry"],
    expectClassification: /Machine Guarding/i,
    expectReviewLabel: /guarding issue|review/i,
    expectNoSuggestedStandards: true,
    expectQuestionsCount: 3,
  },
  {
    name: "missing guard on rotating shaft",
    text: "missing guard on rotating shaft",
    evidenceTexts: ["missing guard", "rotating shaft"],
    scopes: ["osha_general_industry"],
    expectClassification: /Machine Guarding/i,
    expectSuggestedStandards: /1910\.219|1910\.212/,
  },
  {
    name: "missing guardrail on elevated platform",
    text: "missing guardrail on elevated platform",
    evidenceTexts: ["missing guardrail", "elevated platform"],
    scopes: ["osha_general_industry"],
    expectClassification: /Fall Protection|Walking\/Working Surfaces/i,
    forbidClassification: /Machine Guarding/i,
    expectSuggestedStandards: /1910\.28/,
  },
  {
    name: "missing conveyor tail pulley guard at aggregate plant",
    text: "missing conveyor tail pulley guard at aggregate plant",
    evidenceTexts: ["conveyor tail pulley", "aggregate plant", "missing guard"],
    scopes: ["msha_mnm_surface"],
    expectClassification: /Machine Guarding/i,
    expectSuggestedStandards: /30 CFR 56\.14107/,
    forbidSuggestedStandards: /1910\.303/,
  },
];

let failures = 0;

async function run() {
  for (const testCase of cases) {
    const response = await service.classify(
      testCase.text,
      testCase.scopes,
      testCase.evidenceTexts,
      "standard_5x5",
    );

    const suggestedText = JSON.stringify(response.suggestedStandards || []);
    const excludedText = JSON.stringify(response.excludedStandards || []);
    const needsEvidenceText = JSON.stringify(response.needsMoreEvidenceStandards || []);
    const questions = (response.evidenceGapQuestions || []).map((q: any) => String(q?.question || q));
    const reviewState = String(response.reviewStateLabel || response.decisionExplainability?.decisionSummary || "");
    const questionChecks =
      !testCase.expectQuestionsCount ||
      questions.length >= testCase.expectQuestionsCount;
    const passed =
      testCase.expectClassification.test(String(response.classification || "")) &&
      (!testCase.forbidClassification || !testCase.forbidClassification.test(String(response.classification || ""))) &&
      (!testCase.expectReviewLabel || testCase.expectReviewLabel.test(reviewState)) &&
      (!testCase.expectSuggestedStandards || testCase.expectSuggestedStandards.test(suggestedText)) &&
      (!testCase.forbidSuggestedStandards || !testCase.forbidSuggestedStandards.test(suggestedText)) &&
      (!testCase.expectSuppressedStandards || testCase.expectSuppressedStandards.test(excludedText) || testCase.expectSuppressedStandards.test(needsEvidenceText)) &&
      (!testCase.expectNoSuggestedStandards || (response.suggestedStandards || []).length === 0) &&
      questionChecks &&
      response.requiresHumanReview === true;

    if (passed) {
      console.log(`PASS ${testCase.name}`);
    } else {
      failures += 1;
      console.error(`FAIL ${testCase.name}`, {
        classification: response.classification,
        reviewState,
        classificationOk: testCase.expectClassification.test(String(response.classification || "")),
        reviewOk: !testCase.expectReviewLabel || testCase.expectReviewLabel.test(reviewState),
        suggestedOk: !testCase.expectSuggestedStandards || testCase.expectSuggestedStandards.test(suggestedText),
        noSuggestedOk: !testCase.expectNoSuggestedStandards || (response.suggestedStandards || []).length === 0,
        questionOk: questionChecks,
        reviewNeededOk: response.requiresHumanReview === true,
        suggestedStandards: response.suggestedStandards,
        excludedStandards: response.excludedStandards,
        needsMoreEvidenceStandards: response.needsMoreEvidenceStandards,
        questions,
        requiresHumanReview: response.requiresHumanReview,
      });
    }
  }

  if (failures > 0) {
    process.exit(1);
  }

  console.log(`HazLenz vague guarding regression: ${cases.length} passed, 0 failed`);
}

run();
