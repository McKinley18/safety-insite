process.env.RENDER = "true";
process.env.NODE_ENV = "test";
process.env.HAZLENZ_DISABLE_FULL_INTELLIGENCE_ON_RENDER = "false";

import { SafeScopeReasoningOrchestratorService } from "../reasoning-orchestrator/reasoning-orchestrator.service";

type Case = {
  name: string;
  observation: string;
  expectVague?: boolean;
  expectCitation?: RegExp;
  expectNeedsMoreEvidenceCitation?: RegExp;
  forbidCitation?: RegExp;
  expectNoCitation?: boolean;
  expectNoSpecificCitation?: boolean;
  expectNoPrimaryCitation?: boolean;
};

const cases: Case[] = [
  {
    name: "missing guard",
    observation: "missing guard",
    expectVague: true,
    expectNoSpecificCitation: true,
  },
  {
    name: "cord is damaged",
    observation: "cord is damaged",
    expectNeedsMoreEvidenceCitation: /1910\.(?:305\(g\)|334\(a\)\(2\)\(ii\))/,
    forbidCitation: /1910\.101|1910\.146/,
  },
  {
    name: "container is open",
    observation: "container is open",
    expectNeedsMoreEvidenceCitation: /1910\.1200/,
    forbidCitation: /1910\.101|1910\.147/,
  },
  {
    name: "cylinder is unsecured",
    observation: "cylinder is unsecured",
    expectCitation: /1910\.101/,
    forbidCitation: /1910\.147|1910\.146/,
  },
  {
    name: "there is a fall hazard",
    observation: "there is a fall hazard",
    expectVague: true,
    expectNoSpecificCitation: true,
  },
  {
    name: "material is near the walkway",
    observation: "material is near the walkway",
    expectVague: false,
    expectNeedsMoreEvidenceCitation: /1910\.22/,
  },
  {
    name: "panel has an opening",
    observation: "panel has an opening",
    expectNeedsMoreEvidenceCitation: /1910\.303/,
    forbidCitation: /1910\.101|1910\.146/,
  },
];

const service = new SafeScopeReasoningOrchestratorService();
const prohibited = /\b(review confirmed|violation confirmed|citation issued|noncompliant|definite violation|must cite|final citation)\b/i;

function gatherStandards(result: any) {
  return [
    ...(result.suggestedStandards || []),
    ...(result.primaryStandards || []),
    ...(result.supportingStandards || []),
    ...(result.needsMoreEvidenceStandards || []),
    ...(result.standardApplicability?.suggestedStandards || []),
    ...(result.standardApplicability?.needsMoreEvidenceStandards || []),
    ...(result.inspectionIntelligence?.candidateStandards || []),
    ...(result.standardsReasoning?.topDefensible || []),
  ];
}

function asText(value: any) {
  return JSON.stringify(value || []);
}

let failures = 0;

for (const testCase of cases) {
  const result = service.reason({ hazardObservation: testCase.observation }) as any;
  const intelligence = result.inspectionIntelligence as any;
  const standards = gatherStandards(result);
  const standardText = asText(standards);
  const specificCitationText = JSON.stringify({
    suggestedStandards: result.suggestedStandards || [],
    primaryStandards: result.primaryStandards || [],
    candidateStandards: intelligence.candidateStandards || [],
    primaryCitation: result.primaryCitation,
  });
  const needsMoreEvidenceText = JSON.stringify({
    needsMoreEvidenceStandards: result.needsMoreEvidenceStandards || [],
    applicabilityNeedsMoreEvidence: intelligence.standardApplicability?.needsMoreEvidenceStandards || [],
    standardApplicabilitySuggested: intelligence.standardApplicability?.suggestedStandards || [],
  });
  const evidenceQuestions = intelligence.evidenceGapQuestions || [];
  const candidateCitations = standards.map((standard: any) => String(standard?.citation || standard?.reference || standard?.standard || standard?.title || ""));

  const passed =
    (testCase.expectVague === undefined || intelligence.vagueInputAnalysis?.isVague === testCase.expectVague) &&
    !prohibited.test(`${standardText} ${specificCitationText} ${needsMoreEvidenceText}`) &&
    (!testCase.expectCitation || testCase.expectCitation.test(specificCitationText)) &&
    (!testCase.expectNeedsMoreEvidenceCitation || testCase.expectNeedsMoreEvidenceCitation.test(needsMoreEvidenceText)) &&
    (!testCase.forbidCitation || !testCase.forbidCitation.test(standardText)) &&
    (!testCase.expectNoCitation || candidateCitations.filter(Boolean).length === 0) &&
    (!testCase.expectNoSpecificCitation || !candidateCitations.some((citation) => /1910\.|30 CFR/.test(citation))) &&
    (!testCase.expectNoPrimaryCitation || !result.primaryCitation) &&
    evidenceQuestions.length >= 3;

  if (passed) {
    console.log(`PASS ${testCase.name}`);
  } else {
    failures += 1;
    console.error(`FAIL ${testCase.name}`, {
      isVague: intelligence.vagueInputAnalysis?.isVague,
      classification: result.classification,
      candidateFamily: result.candidateStandardFamily,
      familyCandidates: result.standardFamilyCandidates,
      standardApplicability: intelligence.standardApplicability,
      candidateStandards: standards,
      evidenceGapQuestions: evidenceQuestions,
      primaryCitation: result.primaryCitation,
    });
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`HazLenz vague candidate retention regression: ${cases.length} passed, 0 failed`);
