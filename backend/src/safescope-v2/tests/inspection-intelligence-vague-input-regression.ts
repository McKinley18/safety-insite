import { SafeScopeReasoningOrchestratorService } from '../reasoning-orchestrator/reasoning-orchestrator.service';
import { SafeScopeReasoningDomain } from '../reasoning-orchestrator/reasoning-orchestrator.types';

const service = new SafeScopeReasoningOrchestratorService();
const forbiddenFinalLanguage = /\b(violation confirmed|citation issued|noncompliant|definite violation|must cite|final citation)\b/i;
let failures = 0;

function humanText(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>): string {
  const intelligence = result.inspectionIntelligence;
  return JSON.stringify({
    condition: intelligence.conditionAssessment,
    hazards: intelligence.hazardCandidates,
    mechanism: intelligence.mechanismChain,
    standards: intelligence.candidateStandards,
    questions: intelligence.evidenceGapQuestions,
    actions: intelligence.correctiveActions,
  });
}

function commonPass(result: ReturnType<SafeScopeReasoningOrchestratorService['reason']>): boolean {
  const intelligence = result.inspectionIntelligence;
  return intelligence.guardrails.advisoryOnly
    && intelligence.guardrails.candidateStandardsOnly
    && intelligence.guardrails.doesNotDeclareViolation
    && intelligence.guardrails.requiresQualifiedReview
    && !forbiddenFinalLanguage.test(humanText(result));
}

type VagueTestCase = {
  observation: string;
  expectedDomain: SafeScopeReasoningDomain;
};

// Groups A-H: Vague cases (expected status: insufficient_evidence)
const vagueGroups: Record<string, VagueTestCase[]> = {
  'Group A (Electrical)': [
    { observation: 'panel looks bad', expectedDomain: 'electrical' },
    { observation: 'electrical issue', expectedDomain: 'electrical' },
    { observation: 'cord problem', expectedDomain: 'electrical' },
    { observation: 'breaker problem', expectedDomain: 'electrical' },
    { observation: 'exposed wire', expectedDomain: 'electrical' },
  ],
  'Group B (Fall & Walking Surface)': [
    { observation: 'trip hazard', expectedDomain: 'walking_working_surfaces' },
    { observation: 'slip issue', expectedDomain: 'walking_working_surfaces' },
    { observation: 'fall hazard', expectedDomain: 'fall_protection' },
    { observation: 'ladder issue', expectedDomain: 'fall_protection' },
    { observation: 'blocked walkway', expectedDomain: 'walking_working_surfaces' },
  ],
  'Group C (Chemical & Environmental)': [
    { observation: 'chemical issue', expectedDomain: 'hazard_communication' },
    { observation: 'open container', expectedDomain: 'hazard_communication' },
    { observation: 'spill', expectedDomain: 'hazard_communication' },
    { observation: 'no label', expectedDomain: 'hazard_communication' },
  ],
  'Group D (Machine & LOTO)': [
    { observation: 'guard issue', expectedDomain: 'machine_guarding_loto' },
    { observation: 'machine unsafe', expectedDomain: 'machine_guarding_loto' },
    { observation: 'lockout concern', expectedDomain: 'machine_guarding_loto' },
    { observation: 'guarding issue', expectedDomain: 'machine_guarding_loto' },
    { observation: 'loto issue', expectedDomain: 'machine_guarding_loto' },
  ],
  'Group E (Mobile Equipment & Traffic)': [
    { observation: 'forklift area unsafe', expectedDomain: 'mobile_equipment' },
    { observation: 'traffic issue', expectedDomain: 'mobile_equipment' },
    { observation: 'pedestrian safety', expectedDomain: 'mobile_equipment' },
    { observation: 'vehicle issue', expectedDomain: 'mobile_equipment' },
    { observation: 'blind corner', expectedDomain: 'mobile_equipment' },
  ],
  'Group F (Mining Context MSHA)': [
    { observation: 'mine safety issue', expectedDomain: 'ground_control' },
    { observation: 'berm problem', expectedDomain: 'ground_control' },
    { observation: 'highwall concern', expectedDomain: 'ground_control' },
    { observation: 'quarry safety', expectedDomain: 'ground_control' },
    { observation: 'mine hazard', expectedDomain: 'ground_control' },
  ],
  'Group G (Industrial Hygiene & Exposure)': [
    { observation: 'dust in area', expectedDomain: 'industrial_hygiene' },
    { observation: 'too loud', expectedDomain: 'industrial_hygiene' },
    { observation: 'heat concern', expectedDomain: 'industrial_hygiene' },
    { observation: 'fumes', expectedDomain: 'industrial_hygiene' },
    { observation: 'noise concern', expectedDomain: 'industrial_hygiene' },
  ],
  'Group H (General Vagueness)': [
    { observation: 'unsafe', expectedDomain: 'unknown' },
    { observation: 'needs fixed', expectedDomain: 'unknown' },
    { observation: 'hazard noted', expectedDomain: 'unknown' },
    { observation: 'something wrong', expectedDomain: 'unknown' },
    { observation: 'safety concern', expectedDomain: 'unknown' },
  ],
};

// Group I: Sufficient Evidence Bypasses
const groupICases = [
  'open breaker slot',
  'unlabeled container',
  'unlabeled chemical container',
  'missing guard on conveyor tail pulley',
  'blocked emergency exit',
  'frayed extension cord',
];

// Group J: False Positive Trap Bypasses
const groupJCases = [
  'Fall meeting is scheduled for Monday.',
  'Hot work permit filed and complete.',
  'Training record reviewed and current.',
  'User is locked out of account.',
  'Dust cover installed and secured on the equipment.',
];

console.log("==================================================");
console.log("Running HazLenz AI Vague Input Regression Suite");
console.log("==================================================\n");

// Run Groups A-H
for (const [groupName, cases] of Object.entries(vagueGroups)) {
  console.log(`Running ${groupName}...`);
  for (const test of cases) {
    const result = service.reason({ hazardObservation: test.observation });
    const intelligence = result.inspectionIntelligence;
    const analysis = intelligence.vagueInputAnalysis;

    const hasExpectedDomain = test.expectedDomain === 'unknown' || 
      intelligence.hazardCandidates.some(c => c.domain === test.expectedDomain);

    const passed = analysis?.isVague === true
      && intelligence.conditionAssessment.status === 'insufficient_evidence'
      && intelligence.candidateStandards.length === 0
      && result.primaryCitation === undefined
      && result.confidence.level === 'low'
      && intelligence.evidenceGapQuestions.length >= 3
      && hasExpectedDomain
      && commonPass(result);

    if (passed) {
      console.log(`  [PASS] ${test.observation}`);
    } else {
      failures += 1;
      console.error(`  [FAIL] ${test.observation}`, {
        isVague: analysis?.isVague,
        status: intelligence.conditionAssessment.status,
        candidates: intelligence.hazardCandidates,
        candidateStandards: intelligence.candidateStandards,
        questionsCount: intelligence.evidenceGapQuestions.length,
        primaryCitation: result.primaryCitation,
        confidenceLevel: result.confidence.level,
      });
    }
  }
}

// Run Group I
console.log("Running Group I (Sufficient Evidence Bypasses)...");
for (const observation of groupICases) {
  const result = service.reason({ hazardObservation: observation });
  const intelligence = result.inspectionIntelligence;
  const analysis = intelligence.vagueInputAnalysis;

  // Should NOT be vague
  const passed = analysis?.isVague === false
    && intelligence.conditionAssessment.status !== 'insufficient_evidence'
    && commonPass(result);

  if (passed) {
    console.log(`  [PASS] ${observation}`);
  } else {
    failures += 1;
    console.error(`  [FAIL] ${observation}`, {
      isVague: analysis?.isVague,
      status: intelligence.conditionAssessment.status,
    });
  }
}

// Run Group J
console.log("Running Group J (False Positive Trap Bypasses)...");
for (const observation of groupJCases) {
  const result = service.reason({ hazardObservation: observation });
  const intelligence = result.inspectionIntelligence;
  const analysis = intelligence.vagueInputAnalysis;

  // Should NOT be vague and status should be no_hazard_signal
  const passed = analysis?.isVague === false
    && intelligence.conditionAssessment.status === 'no_hazard_signal'
    && commonPass(result);

  if (passed) {
    console.log(`  [PASS] ${observation}`);
  } else {
    failures += 1;
    console.error(`  [FAIL] ${observation}`, {
      isVague: analysis?.isVague,
      status: intelligence.conditionAssessment.status,
    });
  }
}

const totalCases = Object.values(vagueGroups).reduce((sum, cases) => sum + cases.length, 0) + groupICases.length + groupJCases.length;
console.log("\n==================================================");
console.log(`Vague Input Regression Result: ${totalCases - failures}/${totalCases} passed`);
console.log("==================================================\n");

if (failures > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
