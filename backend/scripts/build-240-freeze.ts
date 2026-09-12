/**
 * §240 — FINAL FRESH SUCCESSOR ACCEPTANCE INSTRUMENT: PRE-FREEZE VERIFICATION AND FREEZE.
 *
 * ZERO provider calls. ZERO database operations. No commit, no push, no tag, no deploy.
 * No remediation, no candidate change, no prompt change, no schema change, no protected-module
 * change.
 *
 * It verifies every item the §240 authorization lists as a pre-freeze check and ABORTS WITHOUT
 * WRITING A FREEZE if any of them is incomplete. Only after all of them pass does it write the
 * evidence package and the frozen instrument digest.
 *
 * The §239 evidence package is READ and never written. `replay-238-under-239.ts` is invoked
 * WITHOUT `--write`, so the spent §238 bytes and the frozen §239 replay artifact are untouched.
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import { contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION }
  from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';
import { contractIdentities235, FIRST_PASS_CONTRACT_235_VERSION }
  from './lib/expert-235-posture-contract';
import { projectionIdentity235 } from './lib/expert-235-posture-projection';
import { runContractConsistency235, consistencyIdentity235 }
  from './lib/expert-235-contract-consistency';
import { normalizationIdentity235 } from './lib/expert-235-wire-normalization';
import { contractIdentities237, FIRST_PASS_CONTRACT_237_VERSION }
  from './lib/expert-237-posture-contract';
import { projectionIdentity237 } from './lib/expert-237-posture-projection';
import { runContractConsistency237, consistencyIdentity237 }
  from './lib/expert-237-contract-consistency';
import { contractIdentities239, FIRST_PASS_CONTRACT_239_VERSION }
  from './lib/expert-239-posture-contract';
import { projectionIdentity239 } from './lib/expert-239-posture-projection';
import { runContractConsistency239, consistencyIdentity239 }
  from './lib/expert-239-contract-consistency';
import {
  INSTRUMENT_240_VERSION, CANDIDATE_UNDER_TEST_240, AUTHORIZATION_240,
  AUTHORING_INDEPENDENCE_240, FRESHNESS_240, DEFINED_JOB_240, CAPABILITY_AXES_240, AXIS_RULE_240,
  HARD_SAFETY_GATES_240, HARD_GATE_RULE_240, QUALITY_MEASURES_240, APPLICABILITY_RULE_240,
  CONTAINMENT_MODEL_240, HUMAN_REVIEW_SHAPES_240, HUMAN_REVIEW_CONTAINMENT_RULE_240,
  EXACT_PROPERTY_TREATMENT_240, K6_TREATMENT_240, TYPESCRIPT_PROVENANCE_240,
  STRUCTURAL_RELIABILITY_MEASURES_240, STRUCTURAL_RELIABILITY_RULE_240,
  ACCEPTANCE_DECISIONS_240, DECISION_RULE_240, NO_FIFTH_OUTCOME_240,
  GOVERNED_RECORD_TEXT_OBLIGATION_240, ALL_GOVERNED_RECORDS_240, ACCEPTANCE_CASES_240,
  judgmentSlots240, ADJUDICATION_RULES_240, coverageMap240, COST_EVIDENCE_240,
  CONTINGENCY_POLICY_240, callPlan240, CALL_PLAN_RATIONALE_240,
  FROZEN_EXECUTION_CONFIGURATION_240, EXECUTION_INSTRUCTIONS_240, MANIFEST_RULES_240,
  PRE_SPEND_IDENTITY_CHECKS_240, runTruthPreflight240, instrumentDigest240, TERMINALS_240,
} from './lib/expert-240-final-acceptance-instrument';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification',
  'expert-hazlenz-240-final-fresh-acceptance-instrument-2026-09-11');
mkdirSync(OUT, { recursive: true });
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const abort = (m: string): never => { throw new Error(`§240 FREEZE ABORT: ${m}`); };
const dig = (m: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(m).map(([k, p]) => [k, sha(readFileSync(join(ROOT, p)))]));

const checks: { id: string; name: string; passed: boolean; detail: string }[] = [];
const rec = (id: string, name: string, passed: boolean, detail: string): void => {
  checks.push({ id, name, passed, detail });
  if (!passed) abort(`${id} ${name}: ${detail}`);
};

// ---------------------------------------------------------------- protected identity and ladder

const PROT = join(OUT, 'PROTECTED-IDENTITIES-240.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const prot = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;
rec('F1', 'protected composite identity',
  prot.compositeIdentity === CANDIDATE_UNDER_TEST_240.protectedCompositeIdentity
  && prot.moduleCount === CANDIDATE_UNDER_TEST_240.protectedModuleCount
  && (prot.missingModules as unknown[]).length === 0,
  `${String(prot.compositeIdentity)}, ${String(prot.moduleCount)} modules, `
  + `${(prot.missingModules as unknown[]).length} missing`);

const LADDER = join(OUT, 'LADDER-240.json');
execFileSync('npx', ['tsx', join(__dirname, 'run-229-protected-ladder.ts'), LADDER],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const ladder = JSON.parse(readFileSync(LADDER, 'utf8')) as Record<string, any>;
rec('F2', 'protected ladder',
  ladder.failed === 0 && (ladder.suitesMissing as unknown[]).length === 0,
  `${String(ladder.passed)}/${String(ladder.suitesListed)}, ${String(ladder.failed)} failed`);

// ---------------------------------------------------------------- candidate stack digests

const moduleDigests233 = dig({
  contract: 'backend/scripts/lib/expert-233-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-233-posture-projection.ts',
  fixtures: 'backend/scripts/lib/expert-233-posture-fixtures.ts',
  suite: 'backend/scripts/test-233-posture-contract.ts',
});
const implementationDigest233 = sha(JSON.stringify({
  moduleDigests233, contractIdentity233: contractIdentities233(),
  projectionIdentity: projectionIdentity233(), contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
}));
rec('F3', '§233 implementation digest',
  implementationDigest233 === CANDIDATE_UNDER_TEST_240.implementationDigest233,
  implementationDigest233);

const moduleDigests235 = dig({
  normalization: 'backend/scripts/lib/expert-235-wire-normalization.ts',
  contract: 'backend/scripts/lib/expert-235-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-235-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-235-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-235-posture-fixtures.ts',
  suite: 'backend/scripts/test-235-posture-stabilization.ts',
});
const stabilizationDigest235 = sha(JSON.stringify({
  moduleDigests235, contractIdentity235: contractIdentities235(),
  projectionIdentity: projectionIdentity235(), consistency: consistencyIdentity235(),
  normalization: normalizationIdentity235(), contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
}));
rec('F4', '§235 stabilization digest',
  stabilizationDigest235 === CANDIDATE_UNDER_TEST_240.stabilizationDigest235,
  stabilizationDigest235);

const moduleDigests237 = dig({
  contract: 'backend/scripts/lib/expert-237-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-237-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-237-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-237-posture-fixtures.ts',
  suite: 'backend/scripts/test-237-posture-closure.ts',
});
const closureDigest237 = sha(JSON.stringify({
  moduleDigests237, contractIdentity237: contractIdentities237(),
  projectionIdentity: projectionIdentity237(), consistency: consistencyIdentity237(),
  contractVersion: FIRST_PASS_CONTRACT_237_VERSION,
}));
rec('F5', '§237 closure digest',
  closureDigest237 === CANDIDATE_UNDER_TEST_240.closureDigest237, closureDigest237);

const moduleDigests239 = dig({
  contract: 'backend/scripts/lib/expert-239-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-239-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-239-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-239-posture-fixtures.ts',
  suite: 'backend/scripts/test-239-contract-binding-closure.ts',
  replay: 'backend/scripts/replay-238-under-239.ts',
  typecheckScope: 'backend/tsconfig.scripts-239.json',
});
const bindingClosureDigest239 = sha(JSON.stringify({
  moduleDigests239, contractIdentity239: contractIdentities239(),
  projectionIdentity: projectionIdentity239(), consistency: consistencyIdentity239(),
  contractVersion: FIRST_PASS_CONTRACT_239_VERSION,
}));
rec('F6', '§239 binding closure digest',
  bindingClosureDigest239 === CANDIDATE_UNDER_TEST_240.bindingClosureDigest239,
  bindingClosureDigest239);

// ---------------------------------------------------------------- governed identities

const freeze239 = JSON.parse(readFileSync(join(ROOT, 'verification',
  'expert-hazlenz-239-contract-binding-closure-2026-09-11',
  'SECTION-239-SUCCESSOR-CANDIDATE-FREEZE.json'), 'utf8')) as Record<string, any>;
const gov = freeze239.preparationSteps['2_governedIdentityVerification'] as Record<string, string>;
const ci = contractIdentities239();
rec('G1', 'governed contract identity, the §239 system prompt digest',
  ci.systemPromptNoGoverned === gov.contractIdentity, String(ci.systemPromptNoGoverned));
rec('G2', 'governed driver roles', ci.driverRoles === gov.driverRoles, String(ci.driverRoles));
rec('G3', 'governed driver role reference kinds',
  ci.driverRoleRefKinds === gov.driverRoleRefKinds, String(ci.driverRoleRefKinds));
rec('G4', 'governed candidate-state requirement',
  ci.candidateStateRequirement === gov.candidateStateRequirement,
  String(ci.candidateStateRequirement));
rec('G5', 'governed vocabulary unchanged',
  JSON.stringify(ci.unresolvedCandidateStates) === JSON.stringify(['INSUFFICIENT_EVIDENCE', 'UNKNOWN'])
  && (ci.settledCandidateStates as unknown[]).length === 6,
  JSON.stringify(ci.unresolvedCandidateStates));

// ---------------------------------------------------------------- contract alignment

const consistency239 = runContractConsistency239();
const consistency237 = runContractConsistency237();
const consistency235 = runContractConsistency235();
rec('A1', 'contract alignment, both directions',
  consistency239.allPassed && consistency237.allPassed && consistency235.allPassed,
  `§239 ${consistency239.passed}/${consistency239.total}, §237 ${consistency237.passed}/`
  + `${consistency237.total}, §235 ${consistency235.passed}/${consistency235.total}`);

// ---------------------------------------------------------------- local regression

const suites: Record<string, string> = {};
for (const [k, script] of [
  ['section239', 'test-239-contract-binding-closure.ts'],
  ['section237', 'test-237-posture-closure.ts'],
  ['section235', 'test-235-posture-stabilization.ts'],
  ['section233', 'test-233-posture-contract.ts'],
] as const) {
  try {
    suites[k] = execFileSync('npx', ['tsx', join(__dirname, script)],
      { cwd: join(ROOT, 'backend'), encoding: 'utf8' });
  } catch (e) { abort(`${script} failed: ${String(e).slice(0, 300)}`); }
}
const countOf = (s: string): { passed: number; failed: number } => {
  const m = /(\d+) passed, (\d+) failed/.exec(s);
  return { passed: Number(m?.[1] ?? -1), failed: Number(m?.[2] ?? -1) };
};
const r239 = countOf(suites.section239); const r237 = countOf(suites.section237);
const r235 = countOf(suites.section235); const r233 = countOf(suites.section233);
rec('R1', 'local integrated regression',
  [r239, r237, r235, r233].every(r => r.failed === 0 && r.passed > 0),
  `§239 ${r239.passed}, §237 ${r237.passed}, §235 ${r235.passed}, §233 ${r233.passed}`);

// ---------------------------------------------------------------- typecheck inventory

let production = 'PASS';
try {
  execFileSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'],
    { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
} catch { production = 'FAIL'; }
rec('T1', 'production typecheck', production === 'PASS', production);

let scopeOut = '';
try {
  execFileSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.scripts-240.json'],
    { cwd: join(ROOT, 'backend'), encoding: 'utf8', stdio: 'pipe' });
} catch (e: any) { scopeOut = String(e.stdout ?? ''); }
const scopeErrors = scopeOut.split('\n').map(l => l.trim()).filter(l => l.includes('error TS'));
const known = [...TYPESCRIPT_PROVENANCE_240.knownPreExistingErrors];
const unexpected = scopeErrors.filter(l => !known.includes(l));
const missing = known.filter(l => !scopeErrors.includes(l));
rec('T2', '§240 experiment-scope typecheck reports exactly the two disclosed errors',
  unexpected.length === 0 && missing.length === 0 && scopeErrors.length === known.length,
  `${scopeErrors.length} errors, ${unexpected.length} unexpected, ${missing.length} missing`);

// ---------------------------------------------------------------- evidence integrity

const PRIOR: readonly (readonly [string, string])[] = [
  ['233', 'expert-hazlenz-233-immediate-safety-posture-implementation-2026-09-11'],
  ['234', 'expert-hazlenz-234-posture-discrimination-2026-09-11'],
  ['235', 'expert-hazlenz-235-posture-contract-stabilization-2026-09-11'],
  ['236', 'expert-hazlenz-236-stabilized-confirmation-2026-09-11'],
  ['237', 'expert-hazlenz-237-posture-architecture-closure-2026-09-11'],
  ['238', 'expert-hazlenz-238-final-posture-confirmation-2026-09-11'],
];
const evidenceIntegrity = PRIOR.map(([label, dir]) => {
  const d = join(ROOT, 'verification', dir);
  const man = readFileSync(join(d, `REPORT-${label}.sha256`), 'utf8')
    .split('\n').filter(l => l.trim() && !l.startsWith('#'));
  const bad = man.filter(l => {
    const [digest, name] = l.split(/\s+/);
    return sha(readFileSync(join(d, name))) !== digest;
  });
  if (bad.length > 0) abort(`the §${label} evidence package no longer verifies`);
  return { section: `§${label}`, files: man.length, verifies: true };
});
const P239 = join(ROOT, 'verification', 'expert-hazlenz-239-contract-binding-closure-2026-09-11');
const man239 = JSON.parse(
  readFileSync(join(P239, 'EVIDENCE-PACKAGE-DIGEST-239.json'), 'utf8')) as Record<string, any>;
const bad239 = (man239.files as { sha256: string; file: string }[])
  .filter(f => sha(readFileSync(join(P239, f.file))) !== f.sha256);
rec('E1', '§233 to §239 evidence packages verify from the tree',
  bad239.length === 0 && evidenceIntegrity.length === 6,
  `${evidenceIntegrity.length} prior packages, §239 ${man239.fileCount} files, `
  + `${bad239.length} mismatched`);

// ---------------------------------------------------------------- §239 contract-binding behaviour

const replayOut = execFileSync('npx', ['tsx', join(__dirname, 'replay-238-under-239.ts')],
  { cwd: join(ROOT, 'backend'), encoding: 'utf8' });
const line = (id: string): string =>
  replayOut.split('\n').find(l => l.trim().startsWith(id)) ?? '';
rec('B1', 'B1 admitted under the §239 binding',
  /B1 .*§239 ADMITTED/.test(line('B1')), line('B1').trim());
rec('B2', 'B2 still refused, under its own code',
  /B2 .*§239 REFUSED/.test(line('B2'))
  && line('B2').includes('UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE'),
  line('B2').trim());
rec('C1', 'C1 still refused on resume coherence',
  /C1 .*§239 REFUSED/.test(line('C1'))
  && line('C1').includes('RESUME_CONDITION_UNDER_PERMITTING_POSTURE'),
  line('C1').trim());
rec('B0', 'the diagnostic replay reports zero mismatches',
  /mismatches against the repair's expectation: 0/.test(replayOut), 'zero');
rec('B9', 'the §238 verdict is untouched and still FAILED',
  sha(readFileSync(join(ROOT, 'verification',
    'expert-hazlenz-238-final-posture-confirmation-2026-09-11', 'SECTION-238-JUDGMENT.json')))
  === 'bc8807c8abef83bfe1103cf8d9961e5623786215f45a3d6660dc807431e72d86', 'unmodified');

// ---------------------------------------------------------------- the successor candidate digest

const successorCandidateDigest = sha(JSON.stringify({
  bindingClosureDigest239, closureDigest237, stabilizationDigest235, implementationDigest233,
  protectedCompositeIdentity: prot.compositeIdentity,
  ladder: { passed: ladder.passed, listed: ladder.suitesListed, failed: ladder.failed },
  suites: { section239: r239, section237: r237, section235: r235, section233: r233 },
  consistency: { section239: consistency239.passed, section237: consistency237.passed,
    section235: consistency235.passed },
  evidenceIntegrity,
}));
rec('S1', 'successor candidate digest recomputes to the frozen §239 value',
  successorCandidateDigest === CANDIDATE_UNDER_TEST_240.successorCandidateDigest,
  successorCandidateDigest);

// ---------------------------------------------------------------- the instrument itself

const preflight = runTruthPreflight240();
rec('I1', 'all twenty-four truth contracts pass the §240 preflight', preflight.allPassed,
  `${preflight.passed}/${preflight.total}`);

const cov = coverageMap240();
const plan = callPlan240();
const slots = judgmentSlots240();
rec('I2', 'cohort composition', ACCEPTANCE_CASES_240.length === 24
  && Object.values(cov.byDomain).every(x => x.length === 8), JSON.stringify(cov.byDomain).slice(0, 60));
rec('I3', 'every hard gate has a case and a slot',
  cov.gatesWithNoCase.length === 0 && cov.gatesWithNoSlot.length === 0,
  `${HARD_SAFETY_GATES_240.length} gates`);
rec('I4', 'every quality threshold has a case and a slot',
  cov.measuresWithNoCase.length === 0 && cov.measuresWithNoSlot.length === 0,
  `${QUALITY_MEASURES_240.length} measures`);
rec('I5', 'judgment volume inside the authorized envelope',
  slots.length >= 120 && slots.length <= 160, `${slots.length} slots`);
rec('I6', 'call plan and spend estimate complete',
  plan.primaryCalls === 32 && plan.maximumTotalCalls === 34
  && plan.worstCaseSpendUsd <= plan.recommendedHardCeilingUsd,
  `${plan.primaryCalls} primary, USD ${plan.projectedSpendUsd} projected, `
  + `USD ${plan.worstCaseSpendUsd} worst, USD ${plan.recommendedHardCeilingUsd} ceiling`);

const instrumentDigest = instrumentDigest240();

// ---------------------------------------------------------------- documents

const write = (name: string, doc: unknown): string => {
  const body = typeof doc === 'string' ? doc : JSON.stringify(doc, null, 2) + '\n';
  writeFileSync(join(OUT, name), body);
  return sha(body);
};

write('SECTION-240-PRE-FREEZE-CHECKS.json', {
  artifact: 'SECTION-240-PRE-FREEZE-CHECKS', providerCalls: 0, databaseOperations: 0,
  rule: 'if any check here is incomplete the instrument is NOT frozen. This file is written only '
    + 'after every one of them passed.',
  checks, passed: checks.filter(c => c.passed).length, total: checks.length,
});

write('SECTION-240-TRUTH-PREFLIGHT.json', {
  artifact: 'SECTION-240-TRUTH-PREFLIGHT', providerCalls: 0, databaseOperations: 0,
  result: preflight.allPassed ? 'PASS' : 'FAIL',
  passed: preflight.passed, total: preflight.total, checks: preflight.checks,
  whatARepairMeant: 'the preflight raised findings on the DEVELOPMENT instrument and every one was '
    + 'repaired in it BEFORE this freeze. P1 found one owed property whose wording lexically '
    + 'restated its own established fact. P17 found two cases using an excluded prior-section '
    + 'subject term. P26, added after the first three were repaired, found that five permissive '
    + 'cases declared a gate that only fires on a non-permitting posture, that three cases declared '
    + 'a measure or gate no slot fed, and that two slots fed a gate their case did not declare. '
    + 'NO CHECK WAS WEAKENED, NO THRESHOLD MOVED AND NO GATE WAS RETIRED: each repair corrected the '
    + 'instrument to say what it meant.',
});

write('SECTION-240-INSTRUMENT.json', {
  artifact: 'SECTION-240-INSTRUMENT', version: INSTRUMENT_240_VERSION,
  providerCalls: 0, databaseOperations: 0,
  candidateUnderTest: CANDIDATE_UNDER_TEST_240, authorization: AUTHORIZATION_240,
  authoringIndependence: AUTHORING_INDEPENDENCE_240, freshness: FRESHNESS_240,
  definedJob: DEFINED_JOB_240, capabilityAxes: CAPABILITY_AXES_240, axisRule: AXIS_RULE_240,
  hardSafetyGates: HARD_SAFETY_GATES_240, hardGateRule: HARD_GATE_RULE_240,
  qualityMeasures: QUALITY_MEASURES_240, applicabilityRule: APPLICABILITY_RULE_240,
  containmentModel: CONTAINMENT_MODEL_240,
  humanReviewShapes: HUMAN_REVIEW_SHAPES_240, humanReviewRule: HUMAN_REVIEW_CONTAINMENT_RULE_240,
  exactPropertyTreatment: EXACT_PROPERTY_TREATMENT_240, k6Treatment: K6_TREATMENT_240,
  typescriptProvenance: TYPESCRIPT_PROVENANCE_240,
  structuralReliability: STRUCTURAL_RELIABILITY_MEASURES_240,
  structuralReliabilityRule: STRUCTURAL_RELIABILITY_RULE_240,
  acceptanceDecisions: ACCEPTANCE_DECISIONS_240, decisionRule: DECISION_RULE_240,
  noFifthOutcome: NO_FIFTH_OUTCOME_240,
  governedRecordTextObligation: GOVERNED_RECORD_TEXT_OBLIGATION_240,
  governedRecords: ALL_GOVERNED_RECORDS_240,
  adjudicationRules: ADJUDICATION_RULES_240,
  costEvidence: COST_EVIDENCE_240, contingencyPolicy: CONTINGENCY_POLICY_240,
  callPlan: plan, callPlanRationale: CALL_PLAN_RATIONALE_240,
  frozenExecutionConfiguration: FROZEN_EXECUTION_CONFIGURATION_240,
  executionInstructions: EXECUTION_INSTRUCTIONS_240,
  manifestRules: MANIFEST_RULES_240, preSpendIdentityChecks: PRE_SPEND_IDENTITY_CHECKS_240,
  terminals: TERMINALS_240,
});

write('SECTION-240-TRUTH-CONTRACT.json', {
  artifact: 'SECTION-240-TRUTH-CONTRACT', providerCalls: 0, databaseOperations: 0,
  caseCount: ACCEPTANCE_CASES_240.length, cases: ACCEPTANCE_CASES_240,
});

write('SECTION-240-JUDGMENT-SLOTS.json', {
  artifact: 'SECTION-240-JUDGMENT-SLOTS', providerCalls: 0, databaseOperations: 0,
  total: slots.length,
  productOwner: slots.filter(s => s.adjudicator === 'PRODUCT_OWNER').length,
  deterministic: slots.filter(s => s.adjudicator === 'DETERMINISTIC').length,
  slots,
});

write('SECTION-240-COVERAGE-MAP.json', {
  artifact: 'SECTION-240-COVERAGE-MAP', providerCalls: 0, databaseOperations: 0, ...cov,
});

write('SECTION-240-CANDIDATE-IDENTITY.json', {
  artifact: 'SECTION-240-CANDIDATE-IDENTITY', providerCalls: 0, databaseOperations: 0,
  successorCandidateDigest, bindingClosureDigest239, closureDigest237, stabilizationDigest235,
  implementationDigest233,
  protectedCompositeIdentity: prot.compositeIdentity, protectedModuleCount: prot.moduleCount,
  moduleDigests239, moduleDigests237, moduleDigests235, moduleDigests233,
  contractVersion: FIRST_PASS_CONTRACT_239_VERSION,
  contractIdentities239: ci, projectionIdentity239: projectionIdentity239(),
  consistencyIdentity239: consistencyIdentity239(),
  suites: { section239: r239, section237: r237, section235: r235, section233: r233 },
  consistency: { section239: `${consistency239.passed}/${consistency239.total}`,
    section237: `${consistency237.passed}/${consistency237.total}`,
    section235: `${consistency235.passed}/${consistency235.total}` },
  ladder: { passed: ladder.passed, listed: ladder.suitesListed, failed: ladder.failed },
  evidenceIntegrity,
  productionTypecheck: production,
  experimentScopeTypecheck240: 'PASS with exactly 2 pre-existing frozen-module annotation errors '
    + 'allowed by name',
  preExistingTypeErrors: known,
  contractBindingBehaviour: {
    note: 'READ-ONLY DIAGNOSTIC ON SPENT §238 EVIDENCE. Not a rescore, not an acceptance cohort, '
      + 'and not evidence of any semantic behaviour. It confirms only that the deterministic rule '
      + '§239 changed is the rule that refused B1, and that B2 and C1 still refuse.',
    b1: 'ADMITTED', b2: 'REFUSED / UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE',
    c1: 'REFUSED / RESUME_CONDITION_UNDER_PERMITTING_POSTURE',
    section238VerdictPreserved: 'FAILED',
  },
});

const freezeDoc = {
  artifact: 'SECTION-240-INSTRUMENT-FREEZE',
  version: INSTRUMENT_240_VERSION,
  providerCalls: 0, databaseOperations: 0,
  frozenAt: new Date().toISOString(),
  status: 'FROZEN INSTRUMENT. NOT EXECUTED. NO ACCEPTANCE HAS BEEN MEASURED.',
  whatFreezingMeans: 'the twenty-four cases, their truth contracts, the hard gates, the quality '
    + 'thresholds, the judgment slots, the containment model, the decision rules, the call plan and '
    + 'the spend ceiling are fixed at this digest. Nothing here is a claim about the candidate.',
  whatWouldAnswerTheProductQuestion: 'executing this instrument once, under a separate '
    + 'product-owner authorization, against the successor candidate named below.',
  frozenInstrumentDigest: instrumentDigest,
  successorCandidateDigest,
  candidateUnderTest: CANDIDATE_UNDER_TEST_240,
  cohort: { cases: 24, byDomain: cov.byDomain, postures: cov.postureCounts,
    declaringCases: cov.declaringCases, owedProperties: cov.owedProperties },
  hardGates: HARD_SAFETY_GATES_240.length,
  qualityMeasures: QUALITY_MEASURES_240.length,
  judgmentSlots: slots.length,
  callPlan: plan,
  decisionRule: DECISION_RULE_240,
  preFreezeChecks: `${checks.filter(c => c.passed).length}/${checks.length}`,
  truthPreflight: `${preflight.passed}/${preflight.total}`,
  executionAuthorized: false,
  terminal: TERMINALS_240.frozen,
  whatThisFreezeDoesNotClaim: [
    'it does not claim the successor candidate is accepted. No provider call has been made against '
      + 'it under this instrument.',
    'it does not claim independent external validation. This session authored the cases, the truth '
      + 'and the scoring rules, having read the whole programme record.',
    'it does not claim the exact-property limitation is closed. K3 is measured, not resolved.',
    'it does not claim the scoped TypeScript stack is universally type-clean. Two frozen-module '
      + 'annotation errors are disclosed and were not repaired.',
    'it does not claim twenty-four cases measure a population rate. Invariant 28 still holds.',
  ],
};
write('SECTION-240-INSTRUMENT-FREEZE.json', freezeDoc);

// ---------------------------------------------------------------- manifest and package digest

const FILES = [
  'LADDER-240.json', 'PROTECTED-IDENTITIES-240.json', 'SECTION-240-CANDIDATE-IDENTITY.json',
  'SECTION-240-COVERAGE-MAP.json', 'SECTION-240-INSTRUMENT-FREEZE.json',
  'SECTION-240-INSTRUMENT.json', 'SECTION-240-JUDGMENT-SLOTS.json',
  'SECTION-240-PRE-FREEZE-CHECKS.json', 'SECTION-240-TRUTH-CONTRACT.json',
  'SECTION-240-TRUTH-PREFLIGHT.json',
];
const withReport = existsSync(join(OUT, 'SECTION-240-REPORT.md'))
  ? [...FILES, 'SECTION-240-REPORT.md'] : FILES;
const entries = withReport.map(f => ({ file: f, sha256: sha(readFileSync(join(OUT, f))) }));
writeFileSync(join(OUT, 'REPORT-240.sha256'),
  entries.map(e => `${e.sha256}  ${e.file}`).join('\n') + '\n');
writeFileSync(join(OUT, 'EVIDENCE-PACKAGE-DIGEST-240.json'), JSON.stringify({
  artifact: 'EVIDENCE-PACKAGE-DIGEST-240',
  pathConvention: MANIFEST_RULES_240.pathConvention,
  fileCount: entries.length,
  evidencePackageDigest: sha(JSON.stringify(entries)),
  files: entries.map(e => ({ sha256: e.sha256, file: e.file })),
}, null, 2) + '\n');

console.log('§240 FINAL FRESH SUCCESSOR ACCEPTANCE INSTRUMENT — FREEZE');
console.log(`  pre-freeze checks           ${checks.filter(c => c.passed).length}/${checks.length}`);
console.log(`  truth preflight             ${preflight.passed}/${preflight.total}`);
console.log(`  cases                       ${ACCEPTANCE_CASES_240.length}`);
console.log(`  judgment slots              ${slots.length}`);
console.log(`  hard gates                  ${HARD_SAFETY_GATES_240.length}`);
console.log(`  quality measures            ${QUALITY_MEASURES_240.length}`);
console.log(`  primary calls               ${plan.primaryCalls} (max ${plan.maximumTotalCalls})`);
console.log(`  projected spend             USD ${plan.projectedSpendUsd}`);
console.log(`  worst case                  USD ${plan.worstCaseSpendUsd}`);
console.log(`  recommended hard ceiling    USD ${plan.recommendedHardCeilingUsd}`);
console.log(`  successor candidate digest  ${successorCandidateDigest}`);
console.log(`  FROZEN INSTRUMENT DIGEST    ${instrumentDigest}`);
console.log(`\n${TERMINALS_240.frozen}`);
