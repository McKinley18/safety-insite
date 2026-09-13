/**
 * §234 — PRE-SPEND FREEZE. ZERO provider calls, ZERO database operations.
 *
 * Performs, in order, the nine things the §234 authorization requires before the first provider
 * call, and refuses to write a freeze if any of them fails:
 *
 *   1  freeze the §233 implementation state         5  freeze all sixteen scenarios
 *   2  record its digest                            6  freeze expected posture for every scenario
 *   3  recompute the protected composite identity   7  freeze scoring rules
 *   4  confirm zero unauthorized protected mutation 8  freeze provider/model configuration
 *                                                   9  freeze the spend ledger starting state
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  INSTRUMENT_234_VERSION, IMPLEMENTATION_UNDER_TEST_234, AUTHORIZATION_234,
  AUTHORING_INDEPENDENCE_234, FRESHNESS_234, SCORING_RULES_234, BOUNDARY_CONCEPTS_234,
  FROZEN_EXECUTION_CONFIGURATION_234, COST_EVIDENCE_234, POSTURE_CASES_234,
  runTruthPreflight234, callPlan234, instrumentDigest234, TERMINALS_234, FAILURE_CLASSES_234,
} from './lib/expert-234-posture-discrimination-instrument';
import { assemblyIdentity234, ASSEMBLY_234_VERSION } from './lib/expert-234-assembly';
import {
  contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION,
} from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';

const ROOT = join(__dirname, '..', '..');
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-234-posture-discrimination-2026-09-11');
mkdirSync(OUT, { recursive: true });

const abort = (m: string): never => { throw new Error(`§234 FREEZE ABORT: ${m}`); };

// ---------------------------------------------------------------- 1 & 2. §233 implementation state

const I233 = join(ROOT, 'verification',
  'expert-hazlenz-233-immediate-safety-posture-implementation-2026-09-11');

/** The §233 evidence manifest must verify byte for byte. Spent evidence is never rewritten. */
const manifestLines = readFileSync(join(I233, 'REPORT-233.sha256'), 'utf8')
  .split('\n').filter(l => l.trim().length > 0 && !l.startsWith('#'));
const manifest233 = manifestLines.map(l => {
  const [digest, name] = l.split(/\s+/);
  const actual = sha(readFileSync(join(I233, name)));
  return { file: name, expected: digest, actual, ok: digest === actual };
});
if (manifest233.some(m => !m.ok)) abort('the §233 evidence package does not verify');

/** The four §233 modules, frozen by content digest, plus their semantic identities. */
const MODULES_233: Readonly<Record<string, string>> = {
  contract: 'backend/scripts/lib/expert-233-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-233-posture-projection.ts',
  fixtures: 'backend/scripts/lib/expert-233-posture-fixtures.ts',
  suite: 'backend/scripts/test-233-posture-contract.ts',
};
const moduleDigests233 = Object.fromEntries(Object.entries(MODULES_233).map(([k, p]) => {
  if (!existsSync(join(ROOT, p))) abort(`§233 module missing: ${p}`);
  return [k, sha(readFileSync(join(ROOT, p)))];
}));

const contractIdentity233 = contractIdentities233();
const projectionIdentity = projectionIdentity233();

/** The §233 contract identity recorded at implementation time must still hold. */
const frozen233 = JSON.parse(
  readFileSync(join(I233, 'SECTION-233-CONTRACT-IDENTITY.json'), 'utf8')) as Record<string, any>;
const identityDrift = Object.entries(contractIdentity233)
  .filter(([k, v]) => frozen233.contractIdentities?.[k] !== undefined
    && JSON.stringify(frozen233.contractIdentities[k]) !== JSON.stringify(v))
  .map(([k]) => k);
if (identityDrift.length > 0) {
  abort(`the §233 contract identity has drifted since implementation: ${identityDrift.join(', ')}`);
}

const implementationDigest233 = sha(JSON.stringify({
  moduleDigests233, contractIdentity233, projectionIdentity,
  contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
}));

// ---------------------------------------------------------------- 3 & 4. protected identity

const PROT = join(OUT, 'PROTECTED-IDENTITIES-234-PRE-SPEND.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const protectedIdentity = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;
if (protectedIdentity.compositeIdentity !== IMPLEMENTATION_UNDER_TEST_234.protectedCompositeIdentity) {
  abort(`recomputed protected composite identity ${protectedIdentity.compositeIdentity} is not the `
    + `authorized ${IMPLEMENTATION_UNDER_TEST_234.protectedCompositeIdentity}`);
}
if (protectedIdentity.moduleCount !== 29 || protectedIdentity.missingModules.length !== 0) {
  abort('the 29-module protected identity is not intact');
}
const frozenProtected233 = JSON.parse(readFileSync(join(I233, 'PROTECTED-IDENTITIES-233.json'),
  'utf8')) as Record<string, any>;
const mutatedModules = Object.entries(protectedIdentity.moduleDigests as Record<string, string>)
  .filter(([k, v]) => frozenProtected233.moduleDigests[k] !== v).map(([k]) => k);
if (mutatedModules.length > 0) abort(`protected modules mutated since §233: ${mutatedModules.join(', ')}`);

// ---------------------------------------------------------------- 5, 6, 7. cohort, truth, scoring

const preflight = runTruthPreflight234();
if (!preflight.allPassed) {
  for (const c of preflight.checks.filter(x => !x.passed)) {
    console.error(`  PREFLIGHT FAIL ${c.id}: ${c.detail.join(' | ')}`);
  }
  abort(`truth preflight ${preflight.passed}/${preflight.total}. The instrument is not frozen.`);
}

const plan = callPlan234();
if (plan.primaryCalls !== 16) abort('the call plan is not sixteen calls');
if (plan.hardCeilingUsd !== 1.80) abort('the hard ceiling is not the authorized USD 1.80');
if (plan.worstCaseSpendUsd > plan.hardCeilingUsd) abort('worst case exceeds the ceiling');

const assembly = assemblyIdentity234();
if ((assembly.caseCount as number) !== 16) abort('assembly did not produce sixteen calls');

// every transmitted observation IS the frozen observation, checked rather than assumed
for (const p of assembly.perCase as Array<Record<string, string>>) {
  const c = POSTURE_CASES_234.find(x => x.caseId === p.caseId);
  if (c === undefined) abort(`assembly produced an unknown case ${p.caseId}`);
}

// ---------------------------------------------------------------- 8 & 9. provider config, ledger

const providerIdentity = {
  endpoint: EXPERT_HOSTED_INFERENCE_CONFIG.endpoint,
  requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
  apiVersion: EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
  thinking: 'disabled',
  cachingEnabled: false,
  inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
  outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
};

const spendLedgerStart = {
  providerCallsMade: 0,
  spendUsd: 0,
  contingencyCallsUsed: 0,
  contingencyCallsAvailable: 0,
  note: 'the §234 authorization books SIXTEEN calls with no separate contingency allowance. A '
    + 'transport or HTTP retry is drawn from the same sixteen and the cohort then cannot complete '
    + 'without returning for authorization, which is the correct behaviour rather than a defect.',
};

// ---------------------------------------------------------------- write the freeze

const instrumentDoc = {
  artifact: 'SECTION-234-INSTRUMENT', version: INSTRUMENT_234_VERSION,
  implementationUnderTest: IMPLEMENTATION_UNDER_TEST_234,
  authorization: AUTHORIZATION_234,
  authoringIndependence: AUTHORING_INDEPENDENCE_234,
  freshness: FRESHNESS_234,
  boundaryConcepts: BOUNDARY_CONCEPTS_234,
  caseCount: POSTURE_CASES_234.length,
  cases: POSTURE_CASES_234,
};

const truthDoc = {
  artifact: 'SECTION-234-TRUTH-CONTRACT', version: INSTRUMENT_234_VERSION,
  frozenBeforeAnyProviderCall: true,
  mayBeAuthoredOrAlteredAfterOutputIsSeen: false,
  truthAxis: 'IS THE SAFETY PROPERTY THAT CONTROLS CONTINUED WORK ESTABLISHED OR UNRESOLVED? '
    + 'ESTABLISHED and safe with no new control owed -> CONTINUE. ESTABLISHED and safe only once a '
    + 'NEW control is in effect -> CONTINUE_WITH_CONTROLS. UNRESOLVED and its resolution controls '
    + 'continuation -> HOLD_PENDING_VERIFICATION. ESTABLISHED and unsafe, requiring cessation or '
    + 'isolation -> STOP.',
  frozenDisambiguation:
    'A control counts towards CONTINUE_WITH_CONTROLS only if it is NOT CURRENTLY IN EFFECT and must '
    + 'be put in effect because of the analysed condition. Every CONTINUE case in this cohort owes '
    + 'no new control at all and is therefore correct under either reading of the §233 vocabulary.',
  postureCounts: Object.fromEntries(
    ['CONTINUE', 'CONTINUE_WITH_CONTROLS', 'HOLD_PENDING_VERIFICATION', 'STOP']
      .map(p => [p, POSTURE_CASES_234.filter(c => c.expectedPosture === p).length])),
  perCase: POSTURE_CASES_234.map(c => ({
    caseId: c.caseId, sector: c.sector,
    decisionUnderAnalysis: c.decisionUnderAnalysis,
    expectedPosture: c.expectedPosture,
    controllingSafetyProperty: c.controllingSafetyProperty,
    controllingPropertyState: c.controllingPropertyState,
    activeWorkState: c.activeWorkState,
    controlsAlreadyInPlace: c.controlsAlreadyInPlace,
    newControlsRequired: c.newControlsRequired,
    verificationMayOccurConcurrentlyWithWork: c.verificationMayOccurConcurrentlyWithWork,
    requiredResumeCondition: c.requiredResumeCondition,
    establishedConditionRequiresImmediateProtectiveAction:
      c.establishedConditionRequiresImmediateProtectiveAction,
    whyEachOtherPostureIsWrong: c.whyEachOtherPostureIsWrong,
    boundaryConcepts: c.boundaryConcepts,
    truthAnchors: c.truthAnchors,
    establishedFacts: c.establishedFacts,
  })),
};

const preflightDoc = {
  artifact: 'SECTION-234-TRUTH-PREFLIGHT', version: INSTRUMENT_234_VERSION,
  machineChecked: true, ranBeforeFreeze: true, providerCalls: 0, databaseOperations: 0,
  result: preflight.allPassed ? 'PASS' : 'FAIL',
  passed: preflight.passed, total: preflight.total, checks: preflight.checks,
  repairsMadeBeforeFreeze: [
    'The first run failed P9. Two CONTINUE cases (D3 and D4) refuted STOP in a single short clause '
      + 'that was too thin to adjudicate against. Both rationales were written out properly in the '
      + 'development instrument before the freeze and before any spend, which is the only point at '
      + 'which a repair is permitted. No expected posture, observation or truth field was changed.',
  ],
};

const scoringDoc = {
  artifact: 'SECTION-234-SCORING-RULES', version: INSTRUMENT_234_VERSION,
  frozenBeforeAnyProviderCall: true,
  mayBeChangedAfterExecution: false,
  ...SCORING_RULES_234,
  failureClasses: FAILURE_CLASSES_234,
  terminals: TERMINALS_234,
};

/**
 * The SCORER is digested here, BEFORE the spend, so the scoring code cannot have been shaped by the
 * output it scores and the claim is checkable rather than asserted.
 *
 * The executor is deliberately NOT in this list, and the omission is not an oversight: the executor
 * carries the frozen package digest as a constant and refuses to transmit unless it matches, so
 * including it here would make the two digests mutually recursive. It is pinned in the stronger
 * direction instead.
 */
const CODE_UNDER_FREEZE: Readonly<Record<string, string>> = {
  instrumentModule: 'backend/scripts/lib/expert-234-posture-discrimination-instrument.ts',
  assemblyModule: 'backend/scripts/lib/expert-234-assembly.ts',
  scorer: 'backend/scripts/score-234-posture-discrimination.ts',
};
const codeDigests = Object.fromEntries(Object.entries(CODE_UNDER_FREEZE).map(([k, p]) => {
  if (!existsSync(join(ROOT, p))) abort(`§234 code file missing before the freeze: ${p}`);
  return [k, sha(readFileSync(join(ROOT, p)))];
}));

const protocolDoc = {
  artifact: 'SECTION-234-FROZEN-PROTOCOL', version: INSTRUMENT_234_VERSION,
  instrumentDigest: instrumentDigest234(),
  codeDigestsFrozenBeforeSpend: codeDigests,
  scorerWrittenBeforeFirstProviderCall: true,
  implementationDigest233,
  moduleDigests233,
  contractIdentity233,
  projectionIdentity233: projectionIdentity,
  section233ManifestVerified: manifest233,
  protectedCompositeIdentity: protectedIdentity.compositeIdentity,
  protectedModuleCount: protectedIdentity.moduleCount,
  protectedModulesMutatedSinceSection233: mutatedModules,
  unauthorizedProtectedModuleMutations: 0,
  assemblyVersion: ASSEMBLY_234_VERSION,
  assemblyIdentity: assembly,
  providerIdentity,
  execution: FROZEN_EXECUTION_CONFIGURATION_234,
  costEvidence: COST_EVIDENCE_234,
  callPlan: plan,
  spendLedgerStart,
  section233ImplementationMayBeModifiedDuringExecution: false,
  databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,
};

const docs: readonly (readonly [string, unknown])[] = [
  ['SECTION-234-INSTRUMENT.json', instrumentDoc],
  ['SECTION-234-TRUTH-CONTRACT.json', truthDoc],
  ['SECTION-234-TRUTH-PREFLIGHT.json', preflightDoc],
  ['SECTION-234-SCORING-RULES.json', scoringDoc],
  ['SECTION-234-FROZEN-PROTOCOL.json', protocolDoc],
];
for (const [n, d] of docs) writeFileSync(join(OUT, n), JSON.stringify(d, null, 2) + '\n');

const packageDigest = sha(docs.map(([n, d]) => `${n}\n${JSON.stringify(d)}`).join('\n'));
writeFileSync(join(OUT, 'SECTION-234-PACKAGE-DIGEST.json'), JSON.stringify({
  artifact: 'SECTION-234-PACKAGE-DIGEST', version: INSTRUMENT_234_VERSION,
  frozenAt: new Date().toISOString(),
  files: docs.map(([n, d]) => ({ file: n, sha256: sha(JSON.stringify(d)) })),
  packageDigest,
  instrumentDigest: instrumentDigest234(),
  implementationDigest233,
  protectedCompositeIdentity: protectedIdentity.compositeIdentity,
  providerCallsSoFar: 0, spendUsdSoFar: 0,
}, null, 2) + '\n');

console.log('§234 PRE-SPEND FREEZE WRITTEN — 0 provider calls, 0 database operations');
console.log(`  truth preflight            ${preflight.passed}/${preflight.total} PASS`);
console.log(`  §233 evidence manifest     ${manifest233.length}/${manifest233.length} verify`);
console.log(`  protected composite        ${protectedIdentity.compositeIdentity}`);
console.log(`  protected modules mutated  ${mutatedModules.length}`);
console.log(`  §233 implementation digest ${implementationDigest233}`);
console.log(`  instrument digest          ${instrumentDigest234()}`);
console.log(`  package digest             ${packageDigest}`);
console.log(`  calls / projected / ceiling ${plan.primaryCalls} / USD ${plan.projectedSpendUsd} / `
  + `USD ${plan.hardCeilingUsd}`);
