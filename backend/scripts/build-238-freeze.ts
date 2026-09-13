/**
 * §238 — PRE-SPEND FREEZE. ZERO provider calls, ZERO database operations.
 *
 * Records, and refuses to write a freeze without, everything the §238 authorization requires before
 * the first provider call: the §237 architecture state and digest, the protected composite
 * identity, all six observations, the truth contracts, the expected posture, controlling property,
 * driver references and driverRoles, the expected unresolved-fact and declaration behaviour, the
 * scoring rules, the provider configuration, the starting spend state, and the four preregistered
 * product-level options if §238 fails.
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_HOSTED_INFERENCE_CONFIG,
} from '../src/hazlenz/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  INSTRUMENT_238_VERSION, IMPLEMENTATION_UNDER_TEST_238, AUTHORIZATION_238,
  AUTHORING_INDEPENDENCE_238, FRESHNESS_238, SCORING_RULES_238, CONFIRMATION_CASES_238,
  FROZEN_EXECUTION_CONFIGURATION_238, CATEGORIES_238,
  runTruthPreflight238, callPlan238, instrumentDigest238, TERMINALS_238,
} from './lib/expert-238-confirmation-instrument';
import { assemblyIdentity238, ASSEMBLY_238_VERSION } from './lib/expert-238-assembly';
import { contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION }
  from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';
import { contractIdentities235, FIRST_PASS_CONTRACT_235_VERSION }
  from './lib/expert-235-posture-contract';
import { projectionIdentity235 } from './lib/expert-235-posture-projection';
import { consistencyIdentity235 } from './lib/expert-235-contract-consistency';
import { normalizationIdentity235 } from './lib/expert-235-wire-normalization';
import {
  contractIdentities237, FIRST_PASS_CONTRACT_237_VERSION, POSTURE_DRIVER_ROLES_237,
  DRIVER_ROLE_DEFINITIONS_237, PROVIDER_VISIBLE_RULES_237,
} from './lib/expert-237-posture-contract';
import { projectionIdentity237 } from './lib/expert-237-posture-projection';
import { runContractConsistency237, consistencyIdentity237 }
  from './lib/expert-237-contract-consistency';
import { NO_FURTHER_EXPERIMENT_LOOP_238 } from './lib/expert-238-final-confirmation-design';

const ROOT = join(__dirname, '..', '..');
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-238-final-posture-confirmation-2026-09-11');
mkdirSync(OUT, { recursive: true });
const abort = (m: string): never => { throw new Error(`§238 FREEZE ABORT: ${m}`); };

// ---------------------------------------------------------------- architecture state

const dig = (files: Readonly<Record<string, string>>): Record<string, string> =>
  Object.fromEntries(Object.entries(files).map(([k, p]) => {
    if (!existsSync(join(ROOT, p))) abort(`module missing: ${p}`);
    return [k, sha(readFileSync(join(ROOT, p)))];
  }));

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
if (implementationDigest233 !== IMPLEMENTATION_UNDER_TEST_238.section233ImplementationDigest) {
  abort(`§233 drifted (${implementationDigest233})`);
}

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
if (stabilizationDigest235 !== IMPLEMENTATION_UNDER_TEST_238.section235StabilizationDigest) {
  abort(`§235 drifted (${stabilizationDigest235})`);
}

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

const I237 = join(ROOT, 'verification',
  'expert-hazlenz-237-posture-architecture-closure-2026-09-11');
const manifest237 = readFileSync(join(I237, 'REPORT-237.sha256'), 'utf8')
  .split('\n').filter(l => l.trim() && !l.startsWith('#'))
  .map(l => { const [d, n] = l.split(/\s+/);
    return { file: n, ok: sha(readFileSync(join(I237, n))) === d }; });
if (manifest237.some(m => !m.ok)) abort('the §237 evidence package does not verify');

const consistency = runContractConsistency237();
if (!consistency.allPassed) abort('the §237 contract consistency check does not pass');

// ---------------------------------------------------------------- protected identity

const PROT = join(OUT, 'PROTECTED-IDENTITIES-238-PRE-SPEND.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const prot = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;
if (prot.compositeIdentity !== IMPLEMENTATION_UNDER_TEST_238.protectedCompositeIdentity) {
  abort(`recomputed protected composite identity ${prot.compositeIdentity} differs`);
}
if (prot.moduleCount !== 29 || prot.missingModules.length !== 0) abort('protected set not intact');

// ---------------------------------------------------------------- cohort and truth

const preflight = runTruthPreflight238();
if (!preflight.allPassed) {
  for (const c of preflight.checks.filter(x => !x.passed)) {
    console.error(`  PREFLIGHT FAIL ${c.id}: ${c.detail.join(' | ')}`);
  }
  abort(`truth preflight ${preflight.passed}/${preflight.total}`);
}

const plan = callPlan238();
if (plan.primaryCalls !== 6) abort('the call plan is not six calls');
if (plan.hardCeilingUsd !== 0.85) abort('the hard ceiling is not the authorized USD 0.85');
if (plan.worstCaseSpendUsd > plan.hardCeilingUsd) abort('worst case exceeds the ceiling');

const assembly = assemblyIdentity238();
if ((assembly.caseCount as number) !== 6) abort('assembly did not produce six calls');

const codeDigests = dig({
  instrumentModule: 'backend/scripts/lib/expert-238-confirmation-instrument.ts',
  designModule: 'backend/scripts/lib/expert-238-final-confirmation-design.ts',
  assemblyModule: 'backend/scripts/lib/expert-238-assembly.ts',
  scorer: 'backend/scripts/score-238-confirmation.ts',
});

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
  artifact: 'SECTION-238-INSTRUMENT', version: INSTRUMENT_238_VERSION,
  implementationUnderTest: IMPLEMENTATION_UNDER_TEST_238,
  authorization: AUTHORIZATION_238,
  authoringIndependence: AUTHORING_INDEPENDENCE_238,
  freshness: FRESHNESS_238,
  categories: CATEGORIES_238,
  driverRoleVocabulary: POSTURE_DRIVER_ROLES_237,
  driverRoleDefinitions: DRIVER_ROLE_DEFINITIONS_237,
  caseCount: CONFIRMATION_CASES_238.length,
  cases: CONFIRMATION_CASES_238,
};

const truthDoc = {
  artifact: 'SECTION-238-TRUTH-CONTRACT', version: INSTRUMENT_238_VERSION,
  frozenBeforeAnyProviderCall: true, mayBeChangedAfterExecutionBegins: false,
  truthAxis: 'IS THE SAFETY PROPERTY THAT CONTROLS CONTINUED WORK ESTABLISHED OR UNRESOLVED? '
    + 'Carried forward from §234 and §236 verbatim.',
  driverRoleTruthIsPresenceNotIdentity:
    'the model authors its own candidateKeys and declarationIds, so the truth freezes whether each '
    + 'decision-carrying role must appear AT_LEAST_ONE time or NONE. That is decidable from the '
    + 'output with no prose and no adjudication.',
  postureCounts: Object.fromEntries(
    ['CONTINUE', 'CONTINUE_WITH_CONTROLS', 'HOLD_PENDING_VERIFICATION', 'STOP']
      .map(p => [p, CONFIRMATION_CASES_238.filter(c => c.expectedPosture === p).length])),
  rolePresenceCounts: {
    cessationRequired: CONFIRMATION_CASES_238.filter(c =>
      c.expectedRolePresence.ESTABLISHED_CONDITION_REQUIRING_CESSATION === 'AT_LEAST_ONE').length,
    cessationForbidden: CONFIRMATION_CASES_238.filter(c =>
      c.expectedRolePresence.ESTABLISHED_CONDITION_REQUIRING_CESSATION === 'NONE').length,
    controllingRequired: CONFIRMATION_CASES_238.filter(c =>
      c.expectedRolePresence.UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION === 'AT_LEAST_ONE').length,
    controllingForbidden: CONFIRMATION_CASES_238.filter(c =>
      c.expectedRolePresence.UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION === 'NONE').length,
    controllingNotScored: CONFIRMATION_CASES_238.filter(c =>
      c.expectedRolePresence.UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION === 'NOT_SCORED').length,
  },
  perCase: CONFIRMATION_CASES_238.map(c => ({
    caseId: c.caseId, category: c.category, sector: c.sector,
    decisionUnderAnalysis: c.decisionUnderAnalysis,
    expectedPosture: c.expectedPosture,
    controllingSafetyProperty: c.controllingSafetyProperty,
    controllingPropertyState: c.controllingPropertyState,
    expectedControllingDriverRole: c.expectedControllingDriverRole,
    expectedControllingDriverDescription: c.expectedControllingDriverDescription,
    expectedRolePresence: c.expectedRolePresence,
    distractor: c.distractor,
    declarationRequiredForThePosture: c.declarationRequiredForThePosture,
    activeWorkState: c.activeWorkState,
    controlsAlreadyInPlace: c.controlsAlreadyInPlace,
    newControlsRequired: c.newControlsRequired,
    requiredResumeCondition: c.requiredResumeCondition,
    whyEachOtherPostureIsWrong: c.whyEachOtherPostureIsWrong,
    truthAnchors: c.truthAnchors,
    establishedFacts: c.establishedFacts,
    obviousCatastrophicEvent: c.obviousCatastrophicEvent,
  })),
};

const preflightDoc = {
  artifact: 'SECTION-238-TRUTH-PREFLIGHT', version: INSTRUMENT_238_VERSION,
  machineChecked: true, ranBeforeFreeze: true, providerCalls: 0, databaseOperations: 0,
  result: preflight.allPassed ? 'PASS' : 'FAIL',
  passed: preflight.passed, total: preflight.total, checks: preflight.checks,
  repairsMadeBeforeFreeze: [
    'The first run failed P8 on C2, whose refutation of STOP was a single short clause too thin to '
      + 'adjudicate against. It was written out properly in the development instrument before the '
      + 'freeze and before any spend. No observation, expected posture, expected role or truth '
      + 'field was changed.',
  ],
};

const scoringDoc = {
  artifact: 'SECTION-238-SCORING-RULES', version: INSTRUMENT_238_VERSION,
  frozenBeforeAnyProviderCall: true, mayBeChangedAfterExecution: false,
  ...SCORING_RULES_238,
  terminals: TERMINALS_238,
};

const optionsDoc = {
  artifact: 'SECTION-238-PREREGISTERED-FAILURE-OPTIONS',
  frozenBeforeAnyProviderCall: true,
  whyFrozenNow: 'the §238 authorization requires the four product-level options to be frozen with '
    + 'the instrument, so that a failure is classified against a written list rather than against '
    + 'whatever seems reasonable once the result is known.',
  ...NO_FURTHER_EXPERIMENT_LOOP_238,
  noFurtherPromptTuningOrMicroCohortWithoutExplicitAuthorization: true,
};

const protocolDoc = {
  artifact: 'SECTION-238-FROZEN-PROTOCOL', version: INSTRUMENT_238_VERSION,
  instrumentDigest: instrumentDigest238(),
  implementationDigest233, moduleDigests233,
  stabilizationDigest235, moduleDigests235,
  closureDigest237, moduleDigests237,
  contractIdentity237: contractIdentities237(),
  projectionIdentity237: projectionIdentity237(),
  consistencyIdentity237: consistencyIdentity237(),
  section237ContractConsistency: `${consistency.passed}/${consistency.total} PASS`,
  section237ManifestVerified: manifest237,
  providerVisibleRules237: PROVIDER_VISIBLE_RULES_237,
  protectedCompositeIdentity: prot.compositeIdentity,
  protectedModuleCount: prot.moduleCount,
  unauthorizedProtectedModuleMutations: 0,
  codeDigestsFrozenBeforeSpend: codeDigests,
  scorerWrittenBeforeFirstProviderCall: true,
  assemblyVersion: ASSEMBLY_238_VERSION,
  assemblyIdentity: assembly,
  providerIdentity,
  execution: FROZEN_EXECUTION_CONFIGURATION_238,
  callPlan: plan,
  spendLedgerStart: { providerCallsMade: 0, spendUsd: 0, retryAllowance: 0 },
  section233Or235Or237MayBeModifiedDuringExecution: false,
  databaseOperations: 0, commit: false, push: false, tag: false, deploy: false,
};

const docs: readonly (readonly [string, unknown])[] = [
  ['SECTION-238-INSTRUMENT.json', instrumentDoc],
  ['SECTION-238-TRUTH-CONTRACT.json', truthDoc],
  ['SECTION-238-TRUTH-PREFLIGHT.json', preflightDoc],
  ['SECTION-238-SCORING-RULES.json', scoringDoc],
  ['SECTION-238-PREREGISTERED-FAILURE-OPTIONS.json', optionsDoc],
  ['SECTION-238-FROZEN-PROTOCOL.json', protocolDoc],
];
for (const [n, d] of docs) writeFileSync(join(OUT, n), JSON.stringify(d, null, 2) + '\n');

const packageDigest = sha(docs.map(([n, d]) => `${n}\n${JSON.stringify(d)}`).join('\n'));
writeFileSync(join(OUT, 'SECTION-238-PACKAGE-DIGEST.json'), JSON.stringify({
  artifact: 'SECTION-238-PACKAGE-DIGEST', version: INSTRUMENT_238_VERSION,
  frozenAt: new Date().toISOString(),
  files: docs.map(([n, d]) => ({ file: n, sha256: sha(JSON.stringify(d)) })),
  packageDigest, instrumentDigest: instrumentDigest238(),
  implementationDigest233, stabilizationDigest235, closureDigest237,
  protectedCompositeIdentity: prot.compositeIdentity,
  providerCallsSoFar: 0, spendUsdSoFar: 0,
}, null, 2) + '\n');

console.log('§238 PRE-SPEND FREEZE WRITTEN — 0 provider calls, 0 database operations');
console.log(`  truth preflight              ${preflight.passed}/${preflight.total} PASS`);
console.log(`  §237 contract consistency    ${consistency.passed}/${consistency.total} PASS`);
console.log(`  §237 evidence manifest       ${manifest237.length}/${manifest237.length} verify`);
console.log(`  protected composite          ${prot.compositeIdentity}`);
console.log(`  §233 / §235 / §237 digests   ${implementationDigest233.slice(0, 12)}… / ${stabilizationDigest235.slice(0, 12)}… / ${closureDigest237.slice(0, 12)}…`);
console.log(`  instrument digest            ${instrumentDigest238()}`);
console.log(`  package digest               ${packageDigest}`);
console.log(`  calls / projected / worst / ceiling  ${plan.primaryCalls} / USD ${plan.projectedSpendUsd} / USD ${plan.worstCaseSpendUsd} / USD ${plan.hardCeilingUsd}`);
