import { InspectionCitationRecoveryService } from '../inspection-intelligence/inspection-citation-recovery.service';
import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';

type Scenario = {
  name: string;
  observation: string;
  siteType?: string;
  expectedTop: RegExp;
  forbiddenTop?: RegExp;
  expectedMechanism: RegExp[];
  expectedConsequence: RegExp[];
  expectedEvidenceGaps: RegExp[];
  expectedControlThemes: RegExp[];
  noCompressedGas?: boolean;
  spillRanking?: boolean;
  hazcomPrimary?: boolean;
  requireEvidenceGaps?: boolean;
};

const reasoning = new SafeScopeReasoningOrchestratorService();
const recovery = new InspectionCitationRecoveryService();
const prohibited = /violation confirmed|citation issued|\bnoncompliant\b|definite violation|must cite|final citation/i;
let failures = 0;

function scopesFor(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>, siteType?: string): string[] {
  if (result.jurisdictionAssessment.likelyJurisdiction === 'msha') {
    const mineType = result.inspectionIntelligence.miningContext.mineType;
    if (mineType === 'underground_metal_nonmetal') return ['msha_mnm_underground'];
    if (mineType === 'surface_coal') return ['msha_coal_surface'];
    if (mineType === 'underground_coal') return ['msha_coal_underground'];
    return ['msha_mnm_surface'];
  }
  if (result.jurisdictionAssessment.likelyJurisdiction === 'osha_construction') return ['osha_construction'];
  if (result.jurisdictionAssessment.likelyJurisdiction === 'osha_general_industry') return ['osha_general'];
  return siteType?.includes('construction') ? ['osha_construction'] : ['all'];
}

function inspect(observation: string, siteType?: string) {
  const result = reasoning.reason({ hazardObservation: observation, siteType });
  const output = recovery.recover({
    observation,
    suggestedStandards: [],
    excludedStandards: [],
    inspectionIntelligence: result.inspectionIntelligence,
    scopes: scopesFor(result, siteType),
  });
  return { result, output };
}

function citationIndex(citations: string[], pattern: RegExp): number {
  return citations.findIndex((citation) => pattern.test(citation));
}

function pass(name: string, condition: boolean, details?: unknown) {
  if (condition) {
    console.log(`PASS ${name}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${name}`, details);
}

const scenarios: Scenario[] = [
  {
    name: 'open used oil near walkway',
    observation: 'An open container of used oil is sitting on the shop floor near a pedestrian walkway.',
    siteType: 'shop',
    expectedTop: /1910\.22|1926\.25|56\.20003|56\.4102/,
    forbiddenTop: /1910\.1200|1926\.59/,
    expectedMechanism: [/spill|release/i, /walkway|pedestrian|floor/i],
    expectedConsequence: [/slip|fall/i, /environment/i],
    expectedEvidenceGaps: [/drain/i, /source/i, /release|leak/i],
    expectedControlThemes: [/barricade/i, /stop/i, /correct/i],
    noCompressedGas: true,
    spillRanking: true,
  },
  {
    name: 'leaking oily waste bucket',
    observation: 'A five-gallon bucket containing oily waste is leaking onto the floor near the maintenance area.',
    siteType: 'maintenance shop',
    expectedTop: /1910\.22|1926\.25|56\.20003|56\.4102/,
    forbiddenTop: /1910\.1200|1926\.59/,
    expectedMechanism: [/leak|release/i, /floor/i],
    expectedConsequence: [/slip|fall/i, /environment/i],
    expectedEvidenceGaps: [/drain/i, /release|leak/i, /chemical|container/i],
    expectedControlThemes: [/barricade/i, /stop/i, /correct/i],
    noCompressedGas: true,
    spillRanking: true,
  },
  {
    name: 'unlabeled closed chemical shelf',
    observation: 'An unlabeled closed chemical container is stored on a shelf in the maintenance room.',
    siteType: 'warehouse',
    expectedTop: /1910\.1200|1926\.59/,
    forbiddenTop: /1910\.22|1926\.25|56\.20003/,
    expectedMechanism: [/under-specified|not yet specific/i, /hazard signal/i],
    expectedConsequence: [/cannot be ranked|more condition|evidence/i],
    expectedEvidenceGaps: [],
    expectedControlThemes: [],
    noCompressedGas: true,
    hazcomPrimary: true,
    requireEvidenceGaps: true,
  },
  {
    name: 'oil spill across walkway',
    observation: 'Oil has spilled across a designated pedestrian walkway near the lube storage area.',
    siteType: 'shop',
    expectedTop: /1910\.22|1926\.25|56\.20003/,
    forbiddenTop: /1910\.1200|1926\.59/,
    expectedMechanism: [/spill|release/i, /walkway|pedestrian/i],
    expectedConsequence: [/slip|fall/i],
    expectedEvidenceGaps: [/source/i, /drain/i, /release|leak/i],
    expectedControlThemes: [/barricade/i, /stop/i, /correct/i],
    noCompressedGas: true,
    spillRanking: true,
  },
  {
    name: 'oily residue near drain',
    observation: 'Oily residue is visible on the floor around a drain near the maintenance bay.',
    siteType: 'shop',
    expectedTop: /1910\.22|1926\.25|56\.20003|56\.4102|57\.4102/,
    forbiddenTop: /1910\.1200|1926\.59/,
    expectedMechanism: [/residue|release/i, /drain|floor/i],
    expectedConsequence: [/slip|fall/i, /environment/i],
    expectedEvidenceGaps: [/drain/i, /containment/i, /source|release|leak/i],
    expectedControlThemes: [/barricade/i, /stop/i, /correct/i],
    noCompressedGas: true,
    spillRanking: true,
  },
];

for (const scenario of scenarios) {
  const { result, output } = inspect(scenario.observation, scenario.siteType);
  const citations = output.suggestedStandards.map((standard) => standard.citation);
  const topCitation = citations[0] || '';
  const text = JSON.stringify({ result, output });
  const mechanismText = JSON.stringify(result.inspectionIntelligence.mechanismOfInjury);
  const reasonsText = JSON.stringify(output);

  let passed =
    result.inspectionIntelligence.guardrails.advisoryOnly &&
    result.inspectionIntelligence.guardrails.candidateStandardsOnly &&
    result.inspectionIntelligence.guardrails.doesNotDeclareViolation &&
    result.conclusionBoundary.doesNotDeclareViolation &&
    !prohibited.test(text) &&
    scenario.expectedTop.test(topCitation) &&
    scenario.expectedMechanism.every((pattern) => pattern.test(mechanismText)) &&
    scenario.expectedConsequence.every((pattern) => pattern.test(mechanismText)) &&
    scenario.expectedEvidenceGaps.every((pattern) => result.inspectionIntelligence.evidenceGapQuestions.some((question) => pattern.test(question) || pattern.test(result.inspectionIntelligence.mechanismOfInjury.evidenceGaps.join(' ')))) &&
    scenario.expectedControlThemes.every((pattern) => result.inspectionIntelligence.mechanismOfInjury.controlThemes.some((theme) => pattern.test(theme))) &&
    output.suggestedStandards.length > 0;

  if (scenario.forbiddenTop) {
    passed = passed && !scenario.forbiddenTop.test(topCitation);
  }

  if (scenario.noCompressedGas) {
    passed =
      passed &&
      !result.inspectionIntelligence.hazardCandidates.some((candidate) => candidate.domain === 'compressed_gas') &&
      !output.suggestedStandards.some((standard) => /1910\.(?:101|104)|1926\.350|56\.1600[56]|57\.1600[56]/.test(standard.citation));
  }

  if (scenario.spillRanking) {
    const walkingIndex = citationIndex(citations, /1910\.22|1926\.25|56\.20003|56\.4102|57\.4102/);
    const hazcomIndex = citationIndex(citations, /1910\.1200|1926\.59/);
    passed = passed && walkingIndex >= 0 && (hazcomIndex === -1 || walkingIndex < hazcomIndex);
  }

  if (scenario.hazcomPrimary) {
    const hazcomIndex = citationIndex(citations, /1910\.1200|1926\.59/);
    const walkingIndex = citationIndex(citations, /1910\.22|1926\.25|56\.20003|56\.4102|57\.4102/);
    passed = passed && hazcomIndex === 0 && (walkingIndex === -1 || hazcomIndex < walkingIndex);
  }

  if (scenario.requireEvidenceGaps) {
    passed = passed && result.inspectionIntelligence.evidenceGapQuestions.length > 0;
  }

  if (!passed) {
    console.error(`FAIL ${scenario.name}`, {
      topCitation,
      citations,
      mechanism: result.inspectionIntelligence.mechanismOfInjury,
      evidenceGapQuestions: result.inspectionIntelligence.evidenceGapQuestions,
      controlThemes: result.inspectionIntelligence.mechanismOfInjury.controlThemes,
      suggestions: output.suggestedStandards.map((standard) => ({
        citation: standard.citation,
        score: standard.directnessScore,
        reasons: standard.matchingReasons,
      })),
      excluded: output.excludedStandards.map((standard) => standard.citation),
      supporting: output.supportingStandards.map((standard) => standard.citation),
      reasonsText,
    });
    failures += 1;
  } else {
    console.log(`PASS ${scenario.name}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`HazLenz spill/release citation ranking: ${scenarios.length} passed, 0 failed`);
