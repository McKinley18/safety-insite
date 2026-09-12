/**
 * §239 — EVIDENCE PACKAGE AND SUCCESSOR CANDIDATE FREEZE. ZERO provider calls, ZERO database
 * operations. No commit, no push, no tag, no deploy.
 *
 * Runs the whole local programme, verifies every prior evidence package still verifies from the
 * tree, proves §233, §235 and §237 are byte-identical to what §238 froze, and only then computes
 * and freezes the successor candidate digest.
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

import { governedBindingFor } from './lib/expert-first-pass-instruction-vnext';
import {
  EXPERT_CONDITION_STATES,
} from '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { L3_UNDECIDED_STATES } from '../src/safescope-v2/reasoning-l3/reasoning-contract.types';
import {
  contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION,
} from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';
import {
  contractIdentities235, FIRST_PASS_CONTRACT_235_VERSION,
} from './lib/expert-235-posture-contract';
import { projectionIdentity235 } from './lib/expert-235-posture-projection';
import { runContractConsistency235, consistencyIdentity235 }
  from './lib/expert-235-contract-consistency';
import { normalizationIdentity235 } from './lib/expert-235-wire-normalization';
import {
  contractIdentities237, FIRST_PASS_CONTRACT_237_VERSION, build237SystemPrompt,
  buildExpert237WireSchema, PROVIDER_VISIBLE_RULES_237, DRIVER_ROLE_REF_KIND_237,
} from './lib/expert-237-posture-contract';
import { projectionIdentity237, POSTURE_REFUSAL_CODES_237 }
  from './lib/expert-237-posture-projection';
import { runContractConsistency237, consistencyIdentity237 }
  from './lib/expert-237-contract-consistency';
import { SCENARIOS_237, fixtureSchema237 } from './lib/expert-237-posture-fixtures';
import { projectPosture237 } from './lib/expert-237-posture-projection';
import {
  contractIdentities239, FIRST_PASS_CONTRACT_239_VERSION, build239SystemPrompt,
  buildExpert239WireSchema, reconstruct237SystemPrompt, reconstruct237WireSchema,
  DRIVER_ROLE_REF_KINDS_239, CANDIDATE_STATE_REQUIREMENT_239, BINDINGS_BROADENED_239,
  RESIDUAL_NARROWNESS_239, UNRESOLVED_CANDIDATE_STATES_239, SETTLED_CANDIDATE_STATES_239,
  PROVIDER_VISIBLE_RULES_239, RULES_RETAINED_FROM_237, RULE_REPLACED_FROM_237,
  REPLACEMENT_BINDING_RULE_239, CANDIDATE_STATE_RULE_239, POSTURE_SUBFIELDS_239,
  BASIS_ENTRY_SUBFIELDS_239, UNRESOLVED_CARRIER_LINES_239,
} from './lib/expert-239-posture-contract';
import {
  projectionIdentity239, POSTURE_REFUSAL_CODES_239, CODES_ADDED_BY_239, CODES_RETIRED_FROM_237,
  BEHAVIOUR_CHANGED_FROM_237, projectPosture239,
} from './lib/expert-239-posture-projection';
import {
  runContractConsistency239, RULE_REGISTRY_239_BASE, consistencyIdentity239,
  INHERITED_CITATION_OVERRIDES_239, ANALYSIS_FIELDS_READ_BY_PROJECTION_239,
} from './lib/expert-239-contract-consistency';
import {
  SCENARIOS_239, FIXTURE_INPUT_239, fixtureSchema239,
} from './lib/expert-239-posture-fixtures';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-239-contract-binding-closure-2026-09-11');
mkdirSync(OUT, { recursive: true });
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const abort = (m: string): never => { throw new Error(`§239 EVIDENCE ABORT: ${m}`); };
const dig = (m: Record<string, string>): Record<string, string> =>
  Object.fromEntries(Object.entries(m).map(([k, p]) => [k, sha(readFileSync(join(ROOT, p)))]));

// ---------------------------------------------------------------- 3. protected identity

const PROT = join(OUT, 'PROTECTED-IDENTITIES-239.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const prot = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;
const AUTHORIZED_COMPOSITE = '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';
if (prot.compositeIdentity !== AUTHORIZED_COMPOSITE) abort('protected composite identity changed');
if (prot.moduleCount !== 29 || prot.missingModules.length !== 0) abort('protected set not intact');

const LADDER = join(OUT, 'LADDER-239.json');
execFileSync('npx', ['tsx', join(__dirname, 'run-229-protected-ladder.ts'), LADDER],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const ladder = JSON.parse(readFileSync(LADDER, 'utf8')) as Record<string, any>;
if (ladder.failed !== 0 || (ladder.suitesMissing as unknown[]).length !== 0) {
  abort('the protected ladder is not green');
}

// ---------------------------------------------------------------- 2 and 6. base identities

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
if (implementationDigest233 !== '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af') {
  abort(`the §233 implementation changed (${implementationDigest233})`);
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
if (stabilizationDigest235 !== '1f00a67ec9ecff5ba1c5b221ea057d63af8ce87062e520d6c61693623f03a4bd') {
  abort(`the §235 stabilization changed (${stabilizationDigest235})`);
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
/** The value the frozen §238 protocol recorded for the implementation it put under test. */
if (closureDigest237 !== '1820bfd10ae3ab9105bd4233e97d97500267c6361cf520c60438383540461755') {
  abort(`the §237 closure changed (${closureDigest237})`);
}

// ---------------------------------------------------------------- 5. evidence integrity

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

/** The frozen §238 judgment is READ to confirm it is untouched. It is never rewritten. */
const J238 = join(ROOT, 'verification',
  'expert-hazlenz-238-final-posture-confirmation-2026-09-11', 'SECTION-238-JUDGMENT.json');
const judgment238 = JSON.parse(readFileSync(J238, 'utf8')) as Record<string, any>;
const judgmentDigest238 = sha(readFileSync(J238, 'utf8'));
if (judgmentDigest238
  !== 'bc8807c8abef83bfe1103cf8d9961e5623786215f45a3d6660dc807431e72d86') {
  abort('the frozen §238 judgment has been modified');
}

// ---------------------------------------------------------------- 4. contract consistency

const consistency239 = runContractConsistency239();
if (!consistency239.allPassed) abort('the §239 contract consistency check does not pass');
const consistency237 = runContractConsistency237();
if (!consistency237.allPassed) abort('the §237 contract consistency check no longer passes');
const consistency235 = runContractConsistency235();
if (!consistency235.allPassed) abort('the §235 contract consistency check no longer passes');

// ---------------------------------------------------------------- 1. local integrated regression

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
writeFileSync(join(OUT, 'SECTION-239-LOCAL-SUITE-OUTPUT.txt'), suites.section239);
const countOf = (s: string): { passed: number; failed: number } => {
  const m = /(\d+) passed, (\d+) failed/.exec(s);
  return { passed: Number(m?.[1] ?? -1), failed: Number(m?.[2] ?? -1) };
};
const r239 = countOf(suites.section239);
const r237 = countOf(suites.section237);
const r235 = countOf(suites.section235);
const r233 = countOf(suites.section233);
if ([r239, r237, r235, r233].some(r => r.failed !== 0)) abort('a suite reports failures');

let typecheck = 'PASS';
try {
  execFileSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'],
    { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
} catch { typecheck = 'FAIL'; }
if (typecheck !== 'PASS') abort('production typecheck fails');

/**
 * EXPERIMENT-SCOPE TYPECHECK (§239), never to be reported as `tsc clean`. The posture stack is not
 * in the production program, so §237 and §238 were never typechecked. Two PRE-EXISTING annotation
 * errors exist in those frozen modules; both are erased at emit and neither has a runtime effect.
 * They are ALLOWED BY NAME here and nothing else is, so a new error in the §239 stack fails loudly.
 */
const KNOWN_PREEXISTING_TYPE_ERRORS: readonly string[] = [
  'scripts/lib/expert-237-posture-contract.ts(193,47): error TS2552: Cannot find name '
    + "'POSTURE_REF_KINDS_237'. Did you mean 'POSTURE_REF_KINDS_233'?",
  "scripts/lib/expert-238-final-confirmation-design.ts(18,3): error TS1355: A 'const' assertions "
    + 'can only be applied to references to enum members, or string, number, boolean, array, or '
    + 'object literals.',
];
let scopeOut = '';
try {
  execFileSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.scripts-239.json'],
    { cwd: join(ROOT, 'backend'), encoding: 'utf8', stdio: 'pipe' });
} catch (e: any) { scopeOut = String(e.stdout ?? ''); }
const scopeErrors = scopeOut.split('\n').map(l => l.trim()).filter(l => l.includes('error TS'));
const unexpectedTypeErrors = scopeErrors.filter(l => !KNOWN_PREEXISTING_TYPE_ERRORS.includes(l));
if (unexpectedTypeErrors.length > 0) {
  abort(`the §239 scope typecheck reports a new error: ${unexpectedTypeErrors[0]}`);
}

// ---------------------------------------------------------------- 6. behavioural equivalence

const S237 = fixtureSchema237();
const S239 = fixtureSchema239();
const equivalence = SCENARIOS_237.map(s => {
  const a = projectPosture237(s.payload, S237);
  const b = projectPosture239(s.payload, S239);
  return {
    id: s.id,
    identical: a.admitted === b.admitted
      && JSON.stringify([...a.codes].sort()) === JSON.stringify([...b.codes].sort()),
  };
});
if (equivalence.some(e => !e.identical)) {
  abort('§239 does not reproduce §237 on a §237 scenario');
}

// ---------------------------------------------------------------- the diagnostic replay

execFileSync('npx', ['tsx', join(__dirname, 'replay-238-under-239.ts'), '--write'],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const replay = JSON.parse(readFileSync(join(OUT,
  'SECTION-239-DIAGNOSTIC-REPLAY-OF-238.json'), 'utf8')) as Record<string, any>;
if ((replay.mismatches as unknown[]).length !== 0) abort('the diagnostic replay does not match');

// ---------------------------------------------------------------- documents

const BINDING = governedBindingFor([]);
const s237 = buildExpert237WireSchema(FIXTURE_INPUT_239, BINDING) as Record<string, any>;
const s239 = buildExpert239WireSchema(FIXTURE_INPUT_239, BINDING) as Record<string, any>;

const moduleDigests239 = dig({
  contract: 'backend/scripts/lib/expert-239-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-239-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-239-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-239-posture-fixtures.ts',
  suite: 'backend/scripts/test-239-contract-binding-closure.ts',
  replay: 'backend/scripts/replay-238-under-239.ts',
  typecheckScope: 'backend/tsconfig.scripts-239.json',
});

const implementation = {
  artifact: 'SECTION-239-IMPLEMENTATION',
  version: 'hazlenz.expert.239.binding-closure.v1',
  providerCalls: 0, databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,

  posture: 'ADDITIVE SUCCESSOR TO §237. Neither §233, §235 nor §237 is edited, so the digests the '
    + 'frozen §238 protocol records still hold and §238 stays reproducible from the tree. §239 '
    + 'widens one §237 binding rule without rewriting §237.',
  implementationDigest233, section233Unchanged: true,
  stabilizationDigest235, section235Unchanged: true,
  closureDigest237, section237Unchanged: true,
  section238Rescored: false,
  section238JudgmentDigest: judgmentDigest238,
  section238VerdictPreserved: judgment238.verdict ?? judgment238.result ?? 'FAILED',
  priorEvidencePackagesVerified: evidenceIntegrity,

  theThreeSection238RefusalsTreatedSeparately: {
    B1: { classification: 'CONTRACT-BINDING DEFECT', disposition: 'REPAIRED',
      what: 'the §237 binding admitted UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION only on a '
        + 'declaration. The model attached it to a candidate it had itself marked '
        + 'INSUFFICIENT_EVIDENCE, which is the governed vocabulary\'s own way of naming a condition '
        + 'the analysis could not place.' },
    B2: { classification: 'CORRECT FAIL-CLOSED REFUSAL', disposition: 'PRESERVED, AND GIVEN ITS '
        + 'OWN CODE SO IT CAN NEVER AGAIN BE COUNTED AS B1',
      what: 'the same role on a candidate marked ACTIVE. The model\'s two labels contradict each '
        + 'other and the analysis is refused rather than reinterpreted, repaired or supplemented.' },
    C1: { classification: 'CORRECT FAIL-CLOSED REFUSAL', disposition: 'PRESERVED UNTOUCHED',
      what: 'a corrective action written into resumeCondition under CONTINUE_WITH_CONTROLS. P8 is '
        + 'carried forward from §235 through §237 without a character changed.' },
    notRepairedToImproveTheHistoricalScore: true,
  },

  reportItem1_whatWasBroadened: {
    broadened: BINDINGS_BROADENED_239,
    binding: DRIVER_ROLE_REF_KINDS_239,
    bindingUnderSection237: DRIVER_ROLE_REF_KIND_237,
    stateCondition: CANDIDATE_STATE_REQUIREMENT_239,
    unresolvedCandidateStates: [...UNRESOLVED_CANDIDATE_STATES_239],
    settledCandidateStates: [...SETTLED_CANDIDATE_STATES_239],
    vocabularySource: 'EXPERT_CONDITION_STATES, filtered. No synonym is introduced and no state is '
      + 'inferred from prose.',
    governedVocabularyAgreesOneLayerDown: JSON.stringify([...UNRESOLVED_CANDIDATE_STATES_239].sort())
      === JSON.stringify([...L3_UNDECIDED_STATES].sort()),
    governedVocabularySize: EXPERT_CONDITION_STATES.length,
    rolesAdded: 0, refKindsAdded: 0, posturesAdded: 0, fieldsAdded: 0,
  },

  reportItem2_whatWasDeliberatelyNotBroadened: RESIDUAL_NARROWNESS_239,

  reportItem3_howB2IsPreserved: {
    code: 'UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE',
    rule: 'a candidate carrying UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION whose own '
      + 'assertedConditionState is not a governed unresolved member refuses the analysis.',
    comparisonIsBetweenTwoModelAuthoredLabels: true,
    reinterpretsActiveAsUnknown: false,
    repairsTheState: false,
    createsADeclarationOnTheModelBehalf: false,
    failsClosedOnAnAbsentState: true,
  },

  reportItem4_contractAlignment: {
    schema: 'the driverRole description states the broadened binding and the state condition',
    transmittedInstruction: 'a carrier paragraph is inserted before the rules, one §237 rule is '
      + 'replaced and one rule is added',
    validator: 'D2 becomes a set membership test and D2S is added',
    projection: 'the derived controlling set is exposed as a filter, so no downstream code needs to '
      + 'know which carrier held the role',
    consistencyBindings: `${consistency239.passed}/${consistency239.total} PASS`,
    bidirectionalInvariantFrom235: 'MAINTAINED, with C8 added in the direction B1 failed: every '
      + 'reference kind the validator admits is stated to the provider, and every carrier the '
      + 'instruction offers is admitted by the validator.',
    section237StillGreen: `${consistency237.passed}/${consistency237.total}`,
    section235StillGreen: `${consistency235.passed}/${consistency235.total}`,
    rulesRetainedFrom237: RULES_RETAINED_FROM_237.length,
    ruleReplaced: RULE_REPLACED_FROM_237,
    replacementRule: REPLACEMENT_BINDING_RULE_239,
    ruleAdded: CANDIDATE_STATE_RULE_239,
    carrierParagraphLines: UNRESOLVED_CARRIER_LINES_239.length,
    registryEntries: RULE_REGISTRY_239_BASE.length,
    citationsRestated: Object.keys(INHERITED_CITATION_OVERRIDES_239),
    analysisFieldsReadOutsideThePostureObject: ANALYSIS_FIELDS_READ_BY_PROJECTION_239,
  },

  reportItem5_reconstruction: {
    promptReducesTo237ByteForByte:
      reconstruct237SystemPrompt(build239SystemPrompt(0)) === build237SystemPrompt(0),
    schemaReducesTo237ByteForByte:
      JSON.stringify(reconstruct237WireSchema(FIXTURE_INPUT_239, BINDING))
        === JSON.stringify(s237),
    rootPropertiesAdded: Object.keys(s239.properties).length - Object.keys(s237.properties).length,
    postureSubPropertiesAdded:
      Object.keys(s239.properties.immediateSafetyPosture.properties).length
        - Object.keys(s237.properties.immediateSafetyPosture.properties).length,
    basisEntryMembersAdded: 0,
    postureSubfields: POSTURE_SUBFIELDS_239,
    basisEntrySubfields: BASIS_ENTRY_SUBFIELDS_239,
    promptBytes237: build237SystemPrompt(0).length,
    promptBytes239: build239SystemPrompt(0).length,
    schemaBytes237: JSON.stringify(s237).length,
    schemaBytes239: JSON.stringify(s239).length,
  },

  reportItem6_localProofs: {
    providerCalls: 0, databaseOperations: 0,
    suite: 'backend/scripts/test-239-contract-binding-closure.ts',
    passed: r239.passed, failed: r239.failed,
    scenarioCount: SCENARIOS_239.length,
    fixturesAreGeneralized: 'no subject, fact pattern or candidate key from §234, §236, §237 or '
      + '§238 appears in the §239 fixtures. Each proof is discharged on a synthetic case built for '
      + 'the SHAPE rather than on the observation that exposed it.',
    twelveAuthorizedProofs: {
      '1_unknownCandidateMayControl': 'PASS, and swept across the whole unresolved vocabulary',
      '2_insufficientEvidenceCandidateMayControl': 'PASS',
      '3_unresolvedDeclarationStillControls': 'PASS, identical to §237',
      '4_activeCandidatePlusUnresolvedRoleRefused': 'PASS, and swept across all six settled states',
      '5_establishedCessationBehaviourUnchanged': 'PASS',
      '6_stopFloorUnchanged': 'PASS, swept at all four postures and in both directions',
      '7_legitimateHoldStillValid': 'PASS, on a mixed basis',
      '8_responseUncertaintyCannotBecomeControlling': 'PASS, and it cannot be smuggled in by '
        + 'changing the carrier either',
      '9_permissivePostureWithFalseResumePrerequisiteRefused': 'PASS, both resume lists, both '
        + 'permitting postures',
      '10_generalizedB1Admitted': 'PASS',
      '11_generalizedB2Refused': 'PASS',
      '12_generalizedC1Refused': 'PASS',
    },
    theChecksHaveTeeth: 'the suite removes a registry entry and asserts C1 fails, transmits an '
      + 'uncited rule and asserts C3 fails, widens a binding the instruction does not offer and '
      + 'asserts C8 fails, and narrows the broadened binding below its own declaration and asserts '
      + 'C8 fails again.',
  },

  reportItem7_regression: {
    section237ScenarioEquivalence: `${equivalence.length}/${equivalence.length} identical admission `
      + 'and identical code set under §239',
    section237Suite: `${r237.passed} passed, ${r237.failed} failed`,
    section235Suite: `${r235.passed} passed, ${r235.failed} failed`,
    section233Suite: `${r233.passed} passed, ${r233.failed} failed`,
    protectedLadder: `${ladder.passed}/${ladder.suitesListed}, ${ladder.failed} failed, `
      + `${(ladder.suitesMissing as unknown[]).length} missing`,
    productionTypecheck: typecheck,
    experimentScopeTypecheck239: unexpectedTypeErrors.length === 0
      ? `PASS with ${scopeErrors.length} pre-existing frozen-module annotation errors allowed by name`
      : 'FAIL',
    preExistingTypeErrorsDisclosed: KNOWN_PREEXISTING_TYPE_ERRORS,
    protectedCompositeIdentity: prot.compositeIdentity,
    protectedModulesMutated: [],
    proseIndependence: 'every prose field in every §239 scenario replaced with arbitrary text '
      + 'changes no admission and no code, and rewriting a candidate\'s reasoning to assert the '
      + 'opposite does not rescue a contradictory state.',
  },

  reportItem8_diagnosticReplayOfSpentEvidence: {
    whatItIs: replay.whatThisIs,
    whatItIsNot: replay.whatThisIsNot,
    results: (replay.results as Record<string, any>[]).map(r => ({
      caseId: r.caseId,
      section237: r.section237.admitted ? 'ADMITTED' : 'REFUSED',
      section239: r.section239.admitted ? 'ADMITTED' : 'REFUSED',
      codes239: r.section239.codes,
    })),
    mismatches: replay.mismatches,
    section238RawUnmodified: true, section238JudgmentUnmodified: true,
  },

  reportItem9_filesChanged: {
    created: [
      { path: 'backend/scripts/lib/expert-239-posture-contract.ts',
        role: 'the widened binding, the governed unresolved-state selection, the carrier paragraph, '
          + 'the rule replacement and reconstruction back to §237' },
      { path: 'backend/scripts/lib/expert-239-posture-projection.ts',
        role: 'delegates every §233 check unchanged, widens D2, adds D2S, and retains D1, D3, D4, '
          + 'P8 and P9 exactly as §237 left them' },
      { path: 'backend/scripts/lib/expert-239-contract-consistency.ts',
        role: 'the bidirectional registry with the two directions a widening breaks' },
      { path: 'backend/scripts/lib/expert-239-posture-fixtures.ts',
        role: 'the generalized local scenarios' },
      { path: 'backend/scripts/test-239-contract-binding-closure.ts', role: 'the local suite' },
      { path: 'backend/scripts/replay-238-under-239.ts',
        role: 'the diagnostic replay of spent §238 evidence. Not an acceptance cohort.' },
      { path: 'backend/scripts/build-239-evidence.ts', role: 'this evidence package' },
      { path: 'backend/tsconfig.scripts-239.json', role: 'the experiment-scope typecheck' },
    ],
    modified: [],
    protectedModulesMutated: [],
    section233ModulesModified: [], section235ModulesModified: [], section237ModulesModified: [],
    section238EvidenceModified: [],
  },

  successCondition: {
    b1RepairedWithoutWeakeningB2: true,
    b1RepairedWithoutWeakeningC1: true,
    bindingBroadenedOnlyAsFarAsAuthorized: true,
    governedVocabularyUsedRatherThanSynonyms: true,
    unresolvedStateNeverInferredFromProse: true,
    bidirectionalContractAlignmentMaintained: true,
    section233And235And237Unmodified: true,
    section238EvidenceAndVerdictUnmodified: true,
    semanticBehaviourChangeProven: false,
    semanticBehaviourChangeClaimed: false,
  },
};

const consistencyDoc = {
  artifact: 'SECTION-239-CONTRACT-CONSISTENCY', providerCalls: 0, databaseOperations: 0,
  result: consistency239.allPassed ? 'PASS' : 'FAIL',
  passed: consistency239.passed, total: consistency239.total, checks: consistency239.checks,
  providerVisibleRules: PROVIDER_VISIBLE_RULES_239,
  rulesRetainedFrom237: RULES_RETAINED_FROM_237,
  ruleReplacedFrom237: RULE_REPLACED_FROM_237,
  replacementRule: REPLACEMENT_BINDING_RULE_239,
  ruleAdded: CANDIDATE_STATE_RULE_239,
  codesRetiredFrom237: CODES_RETIRED_FROM_237,
  codesAddedBy239: CODES_ADDED_BY_239,
  inheritedCitationOverrides: INHERITED_CITATION_OVERRIDES_239,
  registry: RULE_REGISTRY_239_BASE,
  identity: consistencyIdentity239(),
  section237StillGreen: { passed: consistency237.passed, total: consistency237.total },
  section235StillGreen: { passed: consistency235.passed, total: consistency235.total },
};

const contractIdentity = {
  artifact: 'SECTION-239-CONTRACT-IDENTITY',
  contractVersion: FIRST_PASS_CONTRACT_239_VERSION,
  baseContractVersion: FIRST_PASS_CONTRACT_233_VERSION,
  supersedes: FIRST_PASS_CONTRACT_237_VERSION,
  contractIdentities239: contractIdentities239(),
  projectionIdentity239: projectionIdentity239(),
  refusalCodes239: [...POSTURE_REFUSAL_CODES_239],
  refusalCodes237: [...POSTURE_REFUSAL_CODES_237],
  behaviourChangedFrom237: BEHAVIOUR_CHANGED_FROM_237,
  moduleDigests239, moduleDigests237, moduleDigests235, moduleDigests233,
  implementationDigest233, stabilizationDigest235, closureDigest237,
  protectedCompositeIdentity: prot.compositeIdentity,
};

/** THE SUCCESSOR CANDIDATE. Computed last, from everything above. */
const bindingClosureDigest239 = sha(JSON.stringify({
  moduleDigests239, contractIdentity239: contractIdentities239(),
  projectionIdentity: projectionIdentity239(), consistency: consistencyIdentity239(),
  contractVersion: FIRST_PASS_CONTRACT_239_VERSION,
}));

const successorCandidateDigest = sha(JSON.stringify({
  bindingClosureDigest239, closureDigest237, stabilizationDigest235, implementationDigest233,
  protectedCompositeIdentity: prot.compositeIdentity,
  ladder: { passed: ladder.passed, listed: ladder.suitesListed, failed: ladder.failed },
  suites: { section239: r239, section237: r237, section235: r235, section233: r233 },
  consistency: { section239: consistency239.passed, section237: consistency237.passed,
    section235: consistency235.passed },
  evidenceIntegrity,
}));

const freeze = {
  artifact: 'SECTION-239-SUCCESSOR-CANDIDATE-FREEZE',
  version: 'hazlenz.expert.239.successor-candidate.v1',
  providerCalls: 0, databaseOperations: 0,
  frozenAt: new Date().toISOString(),

  status: 'SUCCESSOR CANDIDATE. NOT ACCEPTED.',
  whatFreezingMeans: 'the implementation under test for the final fresh Expert acceptance is fixed '
    + 'at these digests. Nothing here is a claim that the candidate is correct, and no acceptance '
    + 'may be read from a local closure.',
  whatWouldAcceptItIs: 'ONE genuinely fresh final Expert acceptance evaluating HazLenz as a '
    + 'complete product capability, designed after this freeze and preregistered before any '
    + 'provider call.',

  successorCandidateDigest,
  bindingClosureDigest239,
  closureDigest237, stabilizationDigest235, implementationDigest233,
  contractVersion: FIRST_PASS_CONTRACT_239_VERSION,
  moduleDigests239,

  preparationSteps: {
    '1_completeLocalIntegratedRegression': {
      section239: `${r239.passed} passed, ${r239.failed} failed`,
      section237: `${r237.passed} passed, ${r237.failed} failed`,
      section235: `${r235.passed} passed, ${r235.failed} failed`,
      section233: `${r233.passed} passed, ${r233.failed} failed`,
      protectedLadder: `${ladder.passed}/${ladder.suitesListed}`,
      productionTypecheck: typecheck,
      experimentScopeTypecheck: unexpectedTypeErrors.length === 0 ? 'PASS' : 'FAIL',
    },
    '2_governedIdentityVerification': {
      contractIdentity: contractIdentities239().systemPromptNoGoverned,
      driverRoles: contractIdentities239().driverRoles,
      driverRoleRefKinds: contractIdentities239().driverRoleRefKinds,
      candidateStateRequirement: contractIdentities239().candidateStateRequirement,
      governedVocabularyUnchanged: EXPERT_CONDITION_STATES.length === 8,
    },
    '3_protectedIdentityVerification': {
      compositeIdentity: prot.compositeIdentity, moduleCount: prot.moduleCount,
      missingModules: prot.missingModules, unauthorizedMutations: 0,
    },
    '4_contractConsistencyVerification': {
      section239: `${consistency239.passed}/${consistency239.total}`,
      section237: `${consistency237.passed}/${consistency237.total}`,
      section235: `${consistency235.passed}/${consistency235.total}`,
    },
    '5_evidenceIntegrityVerification': evidenceIntegrity,
    '6_behaviouralEquivalenceForUnaffectedPaths': {
      section237Scenarios: `${equivalence.filter(e => e.identical).length}/${equivalence.length} `
        + 'identical',
      section233And235And237DigestsUnchanged: true,
      protectedLadderIdenticalToSection237Run: ladder.failed === 0,
      whatChanged: BEHAVIOUR_CHANGED_FROM_237,
    },
    '7_successorCandidateDigestGeneration': successorCandidateDigest,
    '8_successorFreeze': 'THIS DOCUMENT',
  },

  knownLimitations: [
    { id: 'K1', severity: 'MATERIAL, AND THE CENTRAL ONE',
      limitation: 'SEMANTIC POSTURE CORRECTNESS IS NOT MATHEMATICALLY GUARANTEED. The contract '
        + 'refuses incoherent representations; it cannot make a judgment correct.' },
    { id: 'K2',
      limitation: 'driverRole remains MODEL-AUTHORED SEMANTIC JUDGMENT. A model that believes a '
        + 'response question is decision-controlling will label it so, and no deterministic rule '
        + 'refutes that without reading prose. §239 fixture R3 holds that limit as a test rather '
        + 'than a footnote.' },
    { id: 'K3',
      limitation: 'EXACT-PROPERTY IDENTITY remains a known contained limitation, carried forward '
        + 'from KR-1 unchanged.' },
    { id: 'K4',
      limitation: 'HUMAN REVIEW REMAINS PART OF THE PRODUCT SAFETY BOUNDARY.' },
    { id: 'K5',
      limitation: 'FAIL-CLOSED CONTRACT REJECTION REMAINS POSSIBLE when model state is internally '
        + 'contradictory, and §239 adds one more way for that to happen. B2 and C1 are evidence '
        + 'that it does happen. A refused analysis yields no result to the user.' },
    { id: 'K6',
      limitation: 'THE RESIDUAL NARROWNESS §239 DECLARED. UNRESOLVED_RESPONSE_OR_FOLLOW_UP is '
        + 'still bound to declarations alone. If a model attaches it to an undecided candidate the '
        + 'analysis is refused, exactly as B1 was refused. No evidence of that shape exists, the '
        + 'authorization did not extend to it, and it is disclosed rather than speculatively '
        + 'broadened.',
      whatWouldMeasureIt: 'the fresh final acceptance' },
    { id: 'K7',
      limitation: 'THE BROADENING ADMITS OUTPUTS §237 REFUSED, including a controlling driver under '
        + 'a posture that permits work. That coherence question is the same one §237 left open for '
        + 'declarations and §239 neither closes it nor makes it worse.' },
    { id: 'K8',
      limitation: 'NO §239 CHANGE HAS BEEN EXERCISED AGAINST A PROVIDER. The diagnostic replay uses '
        + 'spent §238 bytes and is not evidence of behaviour. Invariant 27 governs: a schema or '
        + 'contract change is never evidence that a behavioural defect is repaired.' },
  ],

  whatThisFreezeDoesNotClaim: [
    'it does not claim §238 passed. §238 FAILED and the verdict is preserved.',
    'it does not claim the semantic distinction is guaranteed. §238 demonstrated it on six of six '
      + 'fresh cases, which is evidence and not a rate.',
    'it does not claim local architecture closure proves universal safety correctness.',
    'it does not claim the successor is accepted. It is a candidate.',
  ],
};

const docs: readonly (readonly [string, unknown])[] = [
  ['SECTION-239-IMPLEMENTATION.json', implementation],
  ['SECTION-239-CONTRACT-CONSISTENCY.json', consistencyDoc],
  ['SECTION-239-CONTRACT-IDENTITY.json', contractIdentity],
  ['SECTION-239-SUCCESSOR-CANDIDATE-FREEZE.json', freeze],
];
for (const [n, d] of docs) writeFileSync(join(OUT, n), JSON.stringify(d, null, 2) + '\n');

if (existsSync(join(OUT, 'SECTION-239-REPORT.md'))) {
  const files = readdirSync(OUT)
    .filter(f => f !== 'REPORT-239.sha256' && f !== 'EVIDENCE-PACKAGE-DIGEST-239.json'
      && statSync(join(OUT, f)).isFile()).sort();
  const lines = files.map(f => `${sha(readFileSync(join(OUT, f)))}  ${f}`);
  writeFileSync(join(OUT, 'REPORT-239.sha256'),
    '# path convention: BARE_FILENAME — verify with: cd <this directory> && '
    + 'shasum -a 256 -c REPORT-239.sha256\n'
    + '# contents: FROZEN EVIDENCE ONLY. No living document is listed here.\n'
    + lines.join('\n') + '\n');
  writeFileSync(join(OUT, 'EVIDENCE-PACKAGE-DIGEST-239.json'), JSON.stringify({
    artifact: 'EVIDENCE-PACKAGE-DIGEST-239', fileCount: files.length,
    evidencePackageDigest: sha(lines.join('\n')),
    files: lines.map(l => ({ sha256: l.split('  ')[0], file: l.split('  ')[1] })),
  }, null, 2) + '\n');
  console.log(`manifest written: ${files.length} files`);
}

console.log('§239 EVIDENCE WRITTEN — 0 provider calls, 0 database operations');
console.log(`  B1 binding broadened                    ${BINDINGS_BROADENED_239.length} role, ${CODES_ADDED_BY_239.length} code added, ${CODES_RETIRED_FROM_237.length} retired`);
console.log(`  §239 local suite                        ${r239.passed} passed, ${r239.failed} failed`);
console.log(`  §239 / §237 / §235 consistency          ${consistency239.passed}/${consistency239.total} · ${consistency237.passed}/${consistency237.total} · ${consistency235.passed}/${consistency235.total}`);
console.log(`  §237 / §235 / §233 suites               ${r237.passed} / ${r235.passed} / ${r233.passed} passed, 0 failed`);
console.log(`  §237 scenario equivalence               ${equivalence.filter(e => e.identical).length}/${equivalence.length} identical`);
console.log(`  protected ladder / typecheck            ${ladder.passed}/${ladder.suitesListed} · ${typecheck}`);
console.log(`  prior evidence packages verified        ${evidenceIntegrity.map(e => e.section).join(' ')}`);
console.log(`  §233 / §235 / §237 digests unchanged    true / true / true`);
console.log(`  protected composite                     ${prot.compositeIdentity}`);
console.log(`  SUCCESSOR CANDIDATE DIGEST              ${successorCandidateDigest}`);
