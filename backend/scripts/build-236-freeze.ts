/**
 * §236 — PRE-SPEND FREEZE. ZERO provider calls, ZERO database operations.
 *
 * Records, and refuses to write a freeze without, every item the §236 authorization requires before
 * the first provider call: the §233 implementation digest, the §235 stabilization state and digest,
 * the protected composite identity, all nine observations, the truth contract for each, the
 * expected posture, controlling property, established/unresolved status and cessation-driving
 * behaviour, the scoring rules, the provider configuration and the starting spend ledger.
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  INSTRUMENT_236_VERSION, IMPLEMENTATION_UNDER_TEST_236, AUTHORIZATION_236,
  AUTHORING_INDEPENDENCE_236, FRESHNESS_236, SCORING_RULES_236, CONFIRMATION_CASES_236,
  FROZEN_EXECUTION_CONFIGURATION_236, COST_EVIDENCE_236, CATEGORIES_236,
  runTruthPreflight236, callPlan236, instrumentDigest236, TERMINALS_236, FAILURE_CLASSES_236,
} from './lib/expert-236-confirmation-instrument';
import { assemblyIdentity236, ASSEMBLY_236_VERSION } from './lib/expert-236-assembly';
import { contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION }
  from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';
import { contractIdentities235, FIRST_PASS_CONTRACT_235_VERSION }
  from './lib/expert-235-posture-contract';
import { projectionIdentity235 } from './lib/expert-235-posture-projection';
import { runContractConsistency235, consistencyIdentity235 }
  from './lib/expert-235-contract-consistency';
import { normalizationIdentity235 } from './lib/expert-235-wire-normalization';

const ROOT = join(__dirname, '..', '..');
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-236-stabilized-confirmation-2026-09-11');
mkdirSync(OUT, { recursive: true });
const abort = (m: string): never => { throw new Error(`§236 FREEZE ABORT: ${m}`); };

// ---------------------------------------------------------------- §233 and §235 state

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
const implementationDigest233 = sha(JSON.stringify({
  moduleDigests233, contractIdentity233: contractIdentities233(),
  projectionIdentity: projectionIdentity233(), contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
}));
if (implementationDigest233 !== IMPLEMENTATION_UNDER_TEST_236.section233ImplementationDigest) {
  abort(`the §233 implementation has drifted (${implementationDigest233})`);
}

const MODULES_235: Readonly<Record<string, string>> = {
  normalization: 'backend/scripts/lib/expert-235-wire-normalization.ts',
  contract: 'backend/scripts/lib/expert-235-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-235-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-235-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-235-posture-fixtures.ts',
  suite: 'backend/scripts/test-235-posture-stabilization.ts',
};
const moduleDigests235 = Object.fromEntries(Object.entries(MODULES_235).map(([k, p]) => {
  if (!existsSync(join(ROOT, p))) abort(`§235 module missing: ${p}`);
  return [k, sha(readFileSync(join(ROOT, p)))];
}));
const stabilizationDigest235 = sha(JSON.stringify({
  moduleDigests235, contractIdentity235: contractIdentities235(),
  projectionIdentity: projectionIdentity235(), consistency: consistencyIdentity235(),
  normalization: normalizationIdentity235(), contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
}));

// the §235 evidence package must still verify, and the stabilization must still be self-consistent
const I235 = join(ROOT, 'verification',
  'expert-hazlenz-235-posture-contract-stabilization-2026-09-11');
const manifest235 = readFileSync(join(I235, 'REPORT-235.sha256'), 'utf8')
  .split('\n').filter(l => l.trim() && !l.startsWith('#'))
  .map(l => { const [d, n] = l.split(/\s+/);
    return { file: n, ok: sha(readFileSync(join(I235, n))) === d }; });
if (manifest235.some(m => !m.ok)) abort('the §235 evidence package does not verify');

const consistency = runContractConsistency235();
if (!consistency.allPassed) abort('the §235 contract consistency check does not pass');

// ---------------------------------------------------------------- protected identity

const PROT = join(OUT, 'PROTECTED-IDENTITIES-236-PRE-SPEND.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const prot = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;
if (prot.compositeIdentity !== IMPLEMENTATION_UNDER_TEST_236.protectedCompositeIdentity) {
  abort(`recomputed protected composite identity ${prot.compositeIdentity} differs`);
}
if (prot.moduleCount !== 29 || prot.missingModules.length !== 0) {
  abort('the 29-module protected identity is not intact');
}

// ---------------------------------------------------------------- cohort, truth, scoring

const preflight = runTruthPreflight236();
if (!preflight.allPassed) {
  for (const c of preflight.checks.filter(x => !x.passed)) {
    console.error(`  PREFLIGHT FAIL ${c.id}: ${c.detail.join(' | ')}`);
  }
  abort(`truth preflight ${preflight.passed}/${preflight.total}. The instrument is not frozen.`);
}

const plan = callPlan236();
if (plan.primaryCalls !== 9) abort('the call plan is not nine calls');
if (plan.hardCeilingUsd !== 1.40) abort('the hard ceiling is not the authorized USD 1.40');
if (plan.worstCaseSpendUsd > plan.hardCeilingUsd) abort('worst case exceeds the ceiling');

const assembly = assemblyIdentity236();
if ((assembly.caseCount as number) !== 9) abort('assembly did not produce nine calls');

/** The scorer is digested BEFORE the spend so it cannot have been shaped by the output. */
const CODE_UNDER_FREEZE: Readonly<Record<string, string>> = {
  instrumentModule: 'backend/scripts/lib/expert-236-confirmation-instrument.ts',
  assemblyModule: 'backend/scripts/lib/expert-236-assembly.ts',
  scorer: 'backend/scripts/score-236-confirmation.ts',
};
const codeDigests = Object.fromEntries(Object.entries(CODE_UNDER_FREEZE).map(([k, p]) => {
  if (!existsSync(join(ROOT, p))) abort(`§236 code file missing before the freeze: ${p}`);
  return [k, sha(readFileSync(join(ROOT, p)))];
}));

// ---------------------------------------------------------------- documents

const providerIdentity = {
  endpoint: EXPERT_HOSTED_INFERENCE_CONFIG.endpoint,
  requestedModel: EXPERT_HOSTED_INFERENCE_CONFIG.model,
  apiVersion: EXPERT_HOSTED_INFERENCE_CONFIG.apiVersion,
  thinking: 'disabled', cachingEnabled: false,
  inputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.inputUsdPerMTok,
  outputUsdPerMTok: EXPERT_HOSTED_INFERENCE_CONFIG.outputUsdPerMTok,
};

const instrumentDoc = {
  artifact: 'SECTION-236-INSTRUMENT', version: INSTRUMENT_236_VERSION,
  implementationUnderTest: IMPLEMENTATION_UNDER_TEST_236,
  authorization: AUTHORIZATION_236,
  authoringIndependence: AUTHORING_INDEPENDENCE_236,
  freshness: FRESHNESS_236,
  categories: CATEGORIES_236,
  caseCount: CONFIRMATION_CASES_236.length,
  cases: CONFIRMATION_CASES_236,
};

const truthDoc = {
  artifact: 'SECTION-236-TRUTH-CONTRACT', version: INSTRUMENT_236_VERSION,
  frozenBeforeAnyProviderCall: true,
  mayBeAuthoredOrAlteredAfterExecutionBegins: false,
  truthAxis: 'IS THE SAFETY PROPERTY THAT CONTROLS CONTINUED WORK ESTABLISHED OR UNRESOLVED? '
    + 'ESTABLISHED and safe with no new control owed -> CONTINUE. ESTABLISHED and safe only once a '
    + 'NEW control is in effect -> CONTINUE_WITH_CONTROLS. UNRESOLVED and its resolution controls '
    + 'continuation -> HOLD_PENDING_VERIFICATION. ESTABLISHED and unsafe, requiring cessation or '
    + 'isolation -> STOP.',
  frozenDisambiguation: 'carried forward from §234 verbatim: a control counts towards '
    + 'CONTINUE_WITH_CONTROLS only if it is NOT CURRENTLY IN EFFECT and must be put in effect '
    + 'because of the analysed condition.',
  postureCounts: Object.fromEntries(
    ['CONTINUE', 'CONTINUE_WITH_CONTROLS', 'HOLD_PENDING_VERIFICATION', 'STOP']
      .map(p => [p, CONFIRMATION_CASES_236.filter(c => c.expectedPosture === p).length])),
  cessationExpectationCounts: {
    MUST_BE_EMPTY: CONFIRMATION_CASES_236
      .filter(c => c.expectedCessationList === 'MUST_BE_EMPTY').length,
    MUST_BE_POPULATED: CONFIRMATION_CASES_236
      .filter(c => c.expectedCessationList === 'MUST_BE_POPULATED').length,
  },
  perCase: CONFIRMATION_CASES_236.map(c => ({
    caseId: c.caseId, category: c.category, sector: c.sector,
    decisionUnderAnalysis: c.decisionUnderAnalysis,
    expectedPosture: c.expectedPosture,
    controllingSafetyProperty: c.controllingSafetyProperty,
    controllingPropertyState: c.controllingPropertyState,
    expectedCessationList: c.expectedCessationList,
    expectedCessationDriver: c.expectedCessationDriver,
    activeWorkState: c.activeWorkState,
    controlsAlreadyInPlace: c.controlsAlreadyInPlace,
    newControlsRequired: c.newControlsRequired,
    verificationMayOccurConcurrentlyWithWork: c.verificationMayOccurConcurrentlyWithWork,
    requiredResumeCondition: c.requiredResumeCondition,
    legitimateSeparateUnresolvedProperties: c.legitimateSeparateUnresolvedProperties,
    whyEachOtherPostureIsWrong: c.whyEachOtherPostureIsWrong,
    truthAnchors: c.truthAnchors,
    establishedFacts: c.establishedFacts,
    expectedCandidateCountAtLeast: c.expectedCandidateCountAtLeast,
    expectedDeclarationCountAtLeast: c.expectedDeclarationCountAtLeast,
  })),
};

const preflightDoc = {
  artifact: 'SECTION-236-TRUTH-PREFLIGHT', version: INSTRUMENT_236_VERSION,
  machineChecked: true, ranBeforeFreeze: true, providerCalls: 0, databaseOperations: 0,
  result: preflight.allPassed ? 'PASS' : 'FAIL',
  passed: preflight.passed, total: preflight.total, checks: preflight.checks,
  repairsMadeBeforeFreeze: [
    'The first run failed P10 on A2 for the excluded term "racking", which appears in this cohort '
      + 'only inside the word "tracking". The FRESHNESS CHECKER was tightened to whole-word matching '
      + 'on the normalized text; no case, observation or expected answer was changed. §234 used a '
      + 'bare substring test, which over-flags and never under-flags, so it produced no false pass '
      + 'there and is left alone as frozen evidence.',
  ],
};

const scoringDoc = {
  artifact: 'SECTION-236-SCORING-RULES', version: INSTRUMENT_236_VERSION,
  frozenBeforeAnyProviderCall: true, mayBeChangedAfterExecution: false,
  ...SCORING_RULES_236,
  failureClasses: FAILURE_CLASSES_236,
  terminals: TERMINALS_236,
};

const protocolDoc = {
  artifact: 'SECTION-236-FROZEN-PROTOCOL', version: INSTRUMENT_236_VERSION,
  instrumentDigest: instrumentDigest236(),
  implementationDigest233,
  moduleDigests233,
  stabilizationDigest235,
  moduleDigests235,
  contractIdentity235: contractIdentities235(),
  projectionIdentity235: projectionIdentity235(),
  normalizationIdentity235: normalizationIdentity235(),
  consistencyIdentity235: consistencyIdentity235(),
  section235ContractConsistency: `${consistency.passed}/${consistency.total} PASS`,
  section235ManifestVerified: manifest235,
  protectedCompositeIdentity: prot.compositeIdentity,
  protectedModuleCount: prot.moduleCount,
  unauthorizedProtectedModuleMutations: 0,
  codeDigestsFrozenBeforeSpend: codeDigests,
  scorerWrittenBeforeFirstProviderCall: true,
  assemblyVersion: ASSEMBLY_236_VERSION,
  assemblyIdentity: assembly,
  providerIdentity,
  execution: FROZEN_EXECUTION_CONFIGURATION_236,
  costEvidence: COST_EVIDENCE_236,
  callPlan: plan,
  spendLedgerStart: {
    providerCallsMade: 0, spendUsd: 0,
    retryAllowance: 0,
    note: 'the authorization books exactly nine calls with no retry allowance. A transport failure '
      + 'terminates the run as EXECUTION INCOMPLETE and returns for authorization rather than being '
      + 'absorbed.',
  },
  section233Or235MayBeModifiedDuringExecution: false,
  databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,
};

const docs: readonly (readonly [string, unknown])[] = [
  ['SECTION-236-INSTRUMENT.json', instrumentDoc],
  ['SECTION-236-TRUTH-CONTRACT.json', truthDoc],
  ['SECTION-236-TRUTH-PREFLIGHT.json', preflightDoc],
  ['SECTION-236-SCORING-RULES.json', scoringDoc],
  ['SECTION-236-FROZEN-PROTOCOL.json', protocolDoc],
];
for (const [n, d] of docs) writeFileSync(join(OUT, n), JSON.stringify(d, null, 2) + '\n');

const packageDigest = sha(docs.map(([n, d]) => `${n}\n${JSON.stringify(d)}`).join('\n'));
writeFileSync(join(OUT, 'SECTION-236-PACKAGE-DIGEST.json'), JSON.stringify({
  artifact: 'SECTION-236-PACKAGE-DIGEST', version: INSTRUMENT_236_VERSION,
  frozenAt: new Date().toISOString(),
  files: docs.map(([n, d]) => ({ file: n, sha256: sha(JSON.stringify(d)) })),
  packageDigest,
  instrumentDigest: instrumentDigest236(),
  implementationDigest233, stabilizationDigest235,
  protectedCompositeIdentity: prot.compositeIdentity,
  providerCallsSoFar: 0, spendUsdSoFar: 0,
}, null, 2) + '\n');

console.log('§236 PRE-SPEND FREEZE WRITTEN — 0 provider calls, 0 database operations');
console.log(`  truth preflight             ${preflight.passed}/${preflight.total} PASS`);
console.log(`  §235 contract consistency   ${consistency.passed}/${consistency.total} PASS`);
console.log(`  §235 evidence manifest      ${manifest235.length}/${manifest235.length} verify`);
console.log(`  protected composite         ${prot.compositeIdentity}`);
console.log(`  §233 implementation digest  ${implementationDigest233}`);
console.log(`  §235 stabilization digest   ${stabilizationDigest235}`);
console.log(`  instrument digest           ${instrumentDigest236()}`);
console.log(`  package digest              ${packageDigest}`);
console.log(`  calls / projected / worst / ceiling  ${plan.primaryCalls} / USD `
  + `${plan.projectedSpendUsd} / USD ${plan.worstCaseSpendUsd} / USD ${plan.hardCeilingUsd}`);
