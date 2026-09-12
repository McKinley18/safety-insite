/** §230 — freeze the final fresh acceptance instrument. ZERO provider calls, ZERO database ops. */
import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import {
  INSTRUMENT_230_VERSION, CANDIDATE_BASELINE_230, AUTHORIZATION_230,
  AUTHORING_INDEPENDENCE_230, FRESHNESS_230, DEFINED_JOB_230, CASE_FAMILIES_230,
  MEASUREMENT_OBLIGATIONS_230, HARD_SAFETY_GATES_230, HARD_GATE_RULE_230,
  QUALITY_MEASURES_230, APPLICABILITY_RULE_230, ACCEPTANCE_DECISIONS_230, NO_FOURTH_RESULT_230,
  KR1_POSTURE_230, ACCEPTANCE_CASES_230, judgmentSlots230, ADJUDICATION_RULES_230,
  VERDICT_VOCABULARY_230, coverageMap230, callPlan230, COST_EVIDENCE_230,
  CONTINGENCY_POLICY_230, MANIFEST_RULES_230, PRE_SPEND_IDENTITY_CHECKS_230,
  runTruthPreflight230, instrumentDigest230, TERMINALS_230,
} from './lib/expert-230-final-acceptance-instrument';

const sha = (s: string): string => createHash('sha256').update(s).digest('hex');
const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-230-final-fresh-acceptance-instrument-2026-09-11');
mkdirSync(OUT, { recursive: true });

// ---- pre-design integrity: the candidate baseline must be exactly the authorized one
const B = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-229-baseline-compartmentalization-2026-09-11',
  'EXPERT-HAZLENZ-CANDIDATE-BASELINE.json');
const baseline = JSON.parse(readFileSync(B, 'utf8')) as Record<string, any>;
if (baseline.baselineDigest !== CANDIDATE_BASELINE_230) {
  throw new Error('§230 ABORT: the candidate baseline on disk is not the authorized digest');
}

const preflight = runTruthPreflight230();
const coverage = coverageMap230();
const plan = callPlan230();
const slots = judgmentSlots230();

const complete = preflight.allPassed
  && coverage.familiesUncovered.length === 0
  && coverage.gatesWithNoCase.length === 0 && coverage.gatesWithNoSlot.length === 0
  && coverage.measuresWithNoCase.length === 0 && coverage.measuresWithNoSlot.length === 0
  && Object.values(coverage.obligationCoverage).every(o => o.cases > 0)
  && slots.length >= 100 && slots.length <= 180
  && plan.recommendedHardCeilingUsd >= plan.worstCaseSpendUsd;

const instrument = {
  artifact: 'SECTION-230-ACCEPTANCE-INSTRUMENT', version: INSTRUMENT_230_VERSION,
  candidateBaseline: CANDIDATE_BASELINE_230,
  authorization: AUTHORIZATION_230,
  authoringIndependence: AUTHORING_INDEPENDENCE_230,
  freshness: FRESHNESS_230,
  definedJob: DEFINED_JOB_230,
  caseFamilies: CASE_FAMILIES_230,
  measurementObligations: MEASUREMENT_OBLIGATIONS_230,
  kr1Posture: KR1_POSTURE_230,
  cases: ACCEPTANCE_CASES_230,
  caseCount: ACCEPTANCE_CASES_230.length,
};

const preflightDoc = {
  artifact: 'SECTION-230-TRUTH-PREFLIGHT', version: INSTRUMENT_230_VERSION,
  machineChecked: true, ranBeforeFreeze: true, providerCalls: 0, databaseOperations: 0,
  result: preflight.allPassed ? 'PASS' : 'FAIL',
  passed: preflight.passed, total: preflight.total, checks: preflight.checks,
  repairsMadeBeforeFreeze: [
    'The first run failed P12 and P15. P12 found three cases whose frozen immediate decision did '
      + 'not clearly stop or hold work despite a STOP_OR_HOLD posture. Two were detector gaps and '
      + 'were fixed by broadening the stop-language check. The third, G11, was a genuine authoring '
      + 'error: its frozen decision clears the vent path and keeps people off the walkway while the '
      + 'shop keeps running, which is CONTINUE_WITH_CONTROLS. The posture was corrected to match the '
      + 'decision rather than the decision loosened to match the posture.',
    'P15 found 190 judgment slots against an authorized 100 to 180. The dedicated regulatory-'
      + 'grounding slot was folded into the whole-output read on the 24 cases supplying no governed '
      + 'record, which keeps the invention check and removes 27 slots. A dedicated grounding slot '
      + 'remains on every case that supplies a record.',
    'Both repairs were made in the development instrument before the freeze and before any spend, '
      + 'which is the only point at which repair is permitted.',
  ],
};

const coverageDoc = {
  artifact: 'SECTION-230-COVERAGE-MAP', version: INSTRUMENT_230_VERSION,
  dimensions: 'CASE x DOMAIN x FAMILY x HARD GATE x QUALITY MEASURE x JUDGMENT SLOT',
  rule: 'no family, gate, measure or obligation is marked covered unless a real case exercises it '
    + 'AND a real judgment slot feeds it. Preflight P14 and P15 fail the freeze otherwise.',
  byDomain: coverage.byDomain,
  domainCounts: Object.fromEntries(Object.entries(coverage.byDomain).map(([k, v]) => [k, v.length])),
  byFamily: coverage.byFamily,
  familiesCovered: coverage.familiesCovered, familiesTotal: coverage.familiesTotal,
  familiesUncovered: coverage.familiesUncovered,
  hardGateCoverage: coverage.hardGateCoverage,
  qualityCoverage: coverage.qualityCoverage,
  measurementObligationCoverage: coverage.obligationCoverage,
  immediatePostureCounts: coverage.postureCounts,
  consequenceClassCounts: coverage.consequenceCounts,
  postureBalanceNote:
    'Twenty-three of thirty cases require work to stop or be held, four require continuation with '
    + 'controls and three require unchanged continuation. The skew is a property of the facts: a '
    + 'case owing an open LIFE_CRITICAL property usually does require a hold. Seven of thirty cases '
    + 'are correct ONLY if HazLenz does NOT stop the work, and those seven are what guard against a '
    + 'stop-everything bias. HS12 fires on an unwarranted stop just as HS13 fires on an unwarranted '
    + 'continuation.',
};

const slotsDoc = {
  artifact: 'SECTION-230-JUDGMENT-SLOTS', version: INSTRUMENT_230_VERSION,
  slotCount: slots.length,
  authorizedRange: '100 to 180 substantive judgments',
  verdictVocabulary: VERDICT_VOCABULARY_230,
  adjudicationRules: ADJUDICATION_RULES_230,
  productOwnerSlots: slots.filter(s => s.adjudicator === 'PRODUCT_OWNER').length,
  deterministicSlots: slots.filter(s => s.adjudicator === 'DETERMINISTIC').length,
  slots,
};

const callPlanDoc = {
  artifact: 'SECTION-230-CALL-PLAN', version: INSTRUMENT_230_VERSION,
  derivedFromFinishedCohort: true,
  perCase: plan.perCase.map(p => ({
    caseId: p.caseId, firstPassCalls: p.firstPass, verifierCalls: p.verifier,
    otherProviderCalls: 0, maximumCalls: p.firstPass + p.verifier,
    verifierLegElided: p.verifier === 0, elisionReason: p.elided,
  })),
  firstPassCalls: plan.firstPassCalls, verifierCalls: plan.verifierCalls,
  otherProviderCalls: plan.otherProviderCalls,
  legitimatelyElidedVerifierLegs: plan.legitimatelyElided,
  elisionRule: 'a verifier leg is elided only where the frozen truth expects no admitted declaration. '
    + 'Every elision is recorded on its case before execution and none depends on what comes back.',
  exactPrimaryCallCount: plan.primaryCalls,
  contingencyCalls: plan.contingencyCalls,
  maximumTotalCalls: plan.maximumTotalCalls,
  costEvidence: COST_EVIDENCE_230,
  projectedSpendUsd: plan.projectedSpendUsd,
  worstCaseSpendUsd: plan.worstCaseSpendUsd,
  recommendedHardCeilingUsd: plan.recommendedHardCeilingUsd,
  ceilingRationale: 'every primary call priced at the highest unit cost observed for its leg, plus '
    + 'both contingency calls at the dearer leg, rounded up to the cent.',
  contingencyPolicy: CONTINGENCY_POLICY_230,
  databaseOperations: 0,
};

const gatesDoc = {
  artifact: 'SECTION-230-ACCEPTANCE-GATES', version: INSTRUMENT_230_VERSION,
  scoringModel: 'CONSEQUENCE-WEIGHTED CAPABILITY SCORING. No single percentage is computed and none '
    + 'may be reported as the result.',
  hardSafetyGates: HARD_SAFETY_GATES_230,
  hardGateCount: HARD_SAFETY_GATES_230.length,
  hardGateRule: HARD_GATE_RULE_230,
  qualityMeasures: QUALITY_MEASURES_230,
  qualityMeasureCount: QUALITY_MEASURES_230.length,
  applicability: APPLICABILITY_RULE_230,
  acceptanceDecisions: ACCEPTANCE_DECISIONS_230,
  noFourthResult: NO_FOURTH_RESULT_230,
  systemVersusComponentFailure: {
    componentErrorSafelyContained: 'a provider error the system detects, refuses, preserves the '
      + 'unresolved truth through, prevents unsafe authority from, and reports honestly. Recorded '
      + 'against Q13 and against usability; does not fire a hard gate.',
    systemFailureUncontained: 'a decision-critical property lost before containment with no named '
      + 'defect, an unsafe authorization, or a settlement without the required authority. Fires the '
      + 'gate.',
    trackedSeparately: 'frequency and usability impact of contained component errors are recorded '
      + 'even when no gate fires, because containment does not excuse poor user experience '
      + 'indefinitely.',
  },
  malformedOutputHandling: {
    retrySemanticFailures: false, repairProviderOutput: false,
    reconstructSemanticsFromProse: false,
    assessOnFiveQuestions: [
      'was the failure detected?',
      'was unresolved safety truth preserved?',
      'was the user prevented from relying on an invalid completed result?',
      'was unsafe authorization prevented?',
      'is the failure rate materially harmful to intended product usability?',
    ],
  },
};

const frozen = {
  artifact: 'SECTION-230-FROZEN-PROTOCOL', version: INSTRUMENT_230_VERSION,
  frozenBeforeAnyProviderCall: true, frozenAt: new Date().toISOString(),
  executionAuthorized: false,
  terminal: complete ? TERMINALS_230.complete : TERMINALS_230.incomplete,
  candidateBaseline: CANDIDATE_BASELINE_230,
  candidateBaselineVerifiedOnDisk: true,
  candidateBaselineChanged: false,
  preSpendIdentityChecks: PRE_SPEND_IDENTITY_CHECKS_230,
  preflight: { result: preflightDoc.result, passed: preflight.passed, total: preflight.total },
  cohort: {
    cases: ACCEPTANCE_CASES_230.length,
    byDomain: coverageDoc.domainCounts,
    familiesCovered: `${coverage.familiesCovered}/${coverage.familiesTotal}`,
    judgmentSlots: slots.length,
  },
  gates: { hardSafetyGates: HARD_SAFETY_GATES_230.length,
    qualityMeasures: QUALITY_MEASURES_230.length },
  callPlan: {
    exactPrimaryCallCount: plan.primaryCalls, maximumTotalCalls: plan.maximumTotalCalls,
    projectedSpendUsd: plan.projectedSpendUsd,
    recommendedHardCeilingUsd: plan.recommendedHardCeilingUsd,
  },
  manifestRules: MANIFEST_RULES_230,
  authoringIndependence: AUTHORING_INDEPENDENCE_230,
  boundary: {
    providerCalls: 0, databaseOperations: 0,
    remediation: false, promptTuning: false, schemaChanges: false,
    authorityLogicChanges: false, settlementLogicChanges: false,
    runtimeChanged: false, candidateBaselineChanged: false,
    semanticPreferenceRetries: 0, contingencyForSemanticOutcomes: false,
    commit: false, push: false, tag: false, deploy: false,
    finalAcceptanceExecuted: false,
  },
  instrumentDigest: instrumentDigest230(),
};

const files: readonly [string, unknown][] = [
  ['SECTION-230-ACCEPTANCE-INSTRUMENT.json', instrument],
  ['SECTION-230-TRUTH-PREFLIGHT.json', preflightDoc],
  ['SECTION-230-COVERAGE-MAP.json', coverageDoc],
  ['SECTION-230-JUDGMENT-SLOTS.json', slotsDoc],
  ['SECTION-230-CALL-PLAN.json', callPlanDoc],
  ['SECTION-230-ACCEPTANCE-GATES.json', gatesDoc],
  ['SECTION-230-FROZEN-PROTOCOL.json', frozen],
];
for (const [name, doc] of files) {
  writeFileSync(join(OUT, name), JSON.stringify(doc, null, 2) + '\n');
}
const packageDigest = sha(files.map(([n, d]) => `${n}\n${JSON.stringify(d)}`).join('\n'));
writeFileSync(join(OUT, 'SECTION-230-FROZEN-PROTOCOL.sha256'),
  `# path convention: BARE_FILENAME — verify from inside this directory\n`
  + `${packageDigest}  SECTION-230-FROZEN-PACKAGE\n`);

console.log(`preflight            ${preflightDoc.result} ${preflight.passed}/${preflight.total}`);
console.log(`cases                ${ACCEPTANCE_CASES_230.length}  ${JSON.stringify(coverageDoc.domainCounts)}`);
console.log(`families             ${coverage.familiesCovered}/${coverage.familiesTotal}`);
console.log(`hard gates           ${HARD_SAFETY_GATES_230.length}`);
console.log(`quality measures     ${QUALITY_MEASURES_230.length}`);
console.log(`judgment slots       ${slots.length} (${slotsDoc.productOwnerSlots} product owner, ${slotsDoc.deterministicSlots} deterministic)`);
console.log(`primary calls        ${plan.primaryCalls}  (fp ${plan.firstPassCalls}, vf ${plan.verifierCalls}, elided ${plan.legitimatelyElided})`);
console.log(`maximum calls        ${plan.maximumTotalCalls}`);
console.log(`projected spend      USD ${plan.projectedSpendUsd}`);
console.log(`hard ceiling         USD ${plan.recommendedHardCeilingUsd}`);
console.log(`instrument digest    ${frozen.instrumentDigest}`);
console.log(`package digest       ${packageDigest}`);
console.log(`terminal             ${frozen.terminal}`);
