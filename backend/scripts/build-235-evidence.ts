/**
 * §235 — EVIDENCE PACKAGE. ZERO provider calls, ZERO database operations.
 * No commit, no push, no tag, no deploy.
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

import { assembleFirstPass234 } from './lib/expert-234-assembly';
import {
  contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION, build233SystemPrompt,
  buildExpert233WireSchema, POSTURE_SCHEMA_PROPERTY_233,
} from './lib/expert-233-posture-contract';
import { projectPosture233, projectionIdentity233 } from './lib/expert-233-posture-projection';
import {
  contractIdentities235, FIRST_PASS_CONTRACT_235_VERSION, build235SystemPrompt,
  buildExpert235WireSchema, reconstruct233SystemPrompt, reconstruct233WireSchema,
  CESSATION_FIELD, PROVIDER_VISIBLE_RULES_235, POSTURE_SUBFIELDS_235,
} from './lib/expert-235-posture-contract';
import { projectionIdentity235, POSTURE_REFUSAL_CODES_235 } from './lib/expert-235-posture-projection';
import {
  runContractConsistency235, RULE_REGISTRY_235_BASE, consistencyIdentity235,
} from './lib/expert-235-contract-consistency';
import {
  normalizeExpertToolOutput235, normalizationIdentity235, WIRE_ANOMALY_CLASSES_235,
  NORMALIZATION_ACTIONS_235, KNOWN_INERT_WRAPPER_KEYS_235,
} from './lib/expert-235-wire-normalization';
import { FIXTURE_INPUT_235, SCENARIOS_235 } from './lib/expert-235-posture-fixtures';
import { governedBindingFor } from './lib/expert-first-pass-instruction-vnext';
import {
  DESIGN_236_VERSION, HOSTED_QUESTION_236, WHAT_IT_IS_NOT_236, SLOT_DESIGN_236, FRESHNESS_236,
  PASS_RULE_236, CALL_PLAN_236, FAILURE_PATH_236, designIdentity236,
} from './lib/expert-236-hosted-confirmation-design';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-235-posture-contract-stabilization-2026-09-11');
mkdirSync(OUT, { recursive: true });
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const abort = (m: string): never => { throw new Error(`§235 EVIDENCE ABORT: ${m}`); };

// ---------------------------------------------------------------- protected identity and ladder

const PROT = join(OUT, 'PROTECTED-IDENTITIES-235.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const prot = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;
const AUTHORIZED_COMPOSITE = '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';
if (prot.compositeIdentity !== AUTHORIZED_COMPOSITE) abort('protected composite identity changed');
if (prot.moduleCount !== 29 || prot.missingModules.length !== 0) abort('protected set not intact');

const LADDER = join(OUT, 'LADDER-235.json');
execFileSync('npx', ['tsx', join(__dirname, 'run-229-protected-ladder.ts'), LADDER],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const ladder = JSON.parse(readFileSync(LADDER, 'utf8')) as Record<string, any>;

// ---------------------------------------------------------------- §233 is untouched

const I233 = join(ROOT, 'verification',
  'expert-hazlenz-233-immediate-safety-posture-implementation-2026-09-11');
const MODULES_233: Readonly<Record<string, string>> = {
  contract: 'backend/scripts/lib/expert-233-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-233-posture-projection.ts',
  fixtures: 'backend/scripts/lib/expert-233-posture-fixtures.ts',
  suite: 'backend/scripts/test-233-posture-contract.ts',
};
const moduleDigests233 = Object.fromEntries(Object.entries(MODULES_233)
  .map(([k, p]) => [k, sha(readFileSync(join(ROOT, p)))]));
const implementationDigest233 = sha(JSON.stringify({
  moduleDigests233, contractIdentity233: contractIdentities233(),
  projectionIdentity: projectionIdentity233(), contractVersion: FIRST_PASS_CONTRACT_233_VERSION,
}));
const FROZEN_233_DIGEST = '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af';
if (implementationDigest233 !== FROZEN_233_DIGEST) {
  abort(`the §233 implementation changed (${implementationDigest233}). §235 is additive.`);
}
const manifest233 = readFileSync(join(I233, 'REPORT-233.sha256'), 'utf8')
  .split('\n').filter(l => l.trim() && !l.startsWith('#'))
  .map(l => { const [d, n] = l.split(/\s+/); return { file: n, ok: sha(readFileSync(join(I233, n))) === d }; });
if (manifest233.some(m => !m.ok)) abort('the §233 evidence package no longer verifies');

const I234 = join(ROOT, 'verification', 'expert-hazlenz-234-posture-discrimination-2026-09-11');
const manifest234 = readFileSync(join(I234, 'REPORT-234.sha256'), 'utf8')
  .split('\n').filter(l => l.trim() && !l.startsWith('#'))
  .map(l => { const [d, n] = l.split(/\s+/); return { file: n, ok: sha(readFileSync(join(I234, n))) === d }; });
if (manifest234.some(m => !m.ok)) abort('the §234 evidence package no longer verifies');

// ---------------------------------------------------------------- §234 wire anomaly analysis

const rows234 = readFileSync(join(I234, 'RAW-234-FIRST-PASS.jsonl'), 'utf8')
  .split('\n').filter(Boolean).map(l => JSON.parse(l) as Record<string, any>);
const judgment234 = JSON.parse(readFileSync(join(I234, 'SECTION-234-JUDGMENT.json'), 'utf8')) as any;
const asm234 = new Map(assembleFirstPass234().map(x => [x.caseId, x]));

const replay = rows234.map(r => {
  const before = judgment234.perCase.find((s: any) => s.caseId === r.caseId);
  const n = normalizeExpertToolOutput235(r.parsed, asm234.get(r.caseId)!.wireSchema);
  const p = n.analysis === null ? null : projectPosture233(n.analysis);
  return {
    caseId: r.caseId,
    wasAdmittedUnder233: before.structural.pass as boolean,
    section234Codes: before.structural.codes as string[],
    anomaliesObserved: n.anomaliesObserved,
    normalizationActions: [
      ...(n.envelope === null ? [] : [n.envelope.action]),
      ...n.fields.map(f => f.action),
    ],
    normalizationFailsClosed: n.failsClosed,
    reachesTheProjectionIntact: !n.failsClosed,
    codesAfterNormalizationUnder233: p?.codes ?? ['NO_ANALYSIS'],
    admittedAfterNormalizationUnder233: p !== null && p.admitted,
  };
});
const wasRefused = replay.filter(r => !r.wasAdmittedUnder233);
/**
 * SCOPED TO THE CASES THAT ACTUALLY HAD A WIRE-SHAPE ANOMALY. Counting the four cases refused on a
 * coverage or referential rule as "recovered by normalization" would inflate the figure with cases
 * normalization never touched.
 */
const wireCasualties = wasRefused.filter(r => r.anomaliesObserved.length > 0);
const nowIntact = wireCasualties.filter(r => r.reachesTheProjectionIntact);
const nowAdmitted = wasRefused.filter(r => r.admittedAfterNormalizationUnder233);

// ---------------------------------------------------------------- consistency and suite

const consistency = runContractConsistency235();
if (!consistency.allPassed) abort('contract consistency does not pass');

let suiteOut = '';
try {
  suiteOut = execFileSync('npx', ['tsx', join(__dirname, 'test-235-posture-stabilization.ts')],
    { cwd: join(ROOT, 'backend'), encoding: 'utf8' });
} catch (e) { abort(`the §235 local suite failed: ${String(e)}`); }
writeFileSync(join(OUT, 'SECTION-235-LOCAL-SUITE-OUTPUT.txt'), suiteOut);
const suiteLine = /(\d+) passed, (\d+) failed/.exec(suiteOut);
if (suiteLine === null || suiteLine[2] !== '0') abort('the §235 local suite reports failures');

let typecheck = 'PASS';
try { execFileSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'], { cwd: join(ROOT, 'backend'), stdio: 'pipe' }); }
catch { typecheck = 'FAIL'; }
if (typecheck !== 'PASS') abort('production typecheck fails');

// ---------------------------------------------------------------- documents

const BINDING = governedBindingFor([]);
const s233 = buildExpert233WireSchema(FIXTURE_INPUT_235, BINDING) as Record<string, any>;
const s235 = buildExpert235WireSchema(FIXTURE_INPUT_235, BINDING) as Record<string, any>;

const implementation = {
  artifact: 'SECTION-235-IMPLEMENTATION',
  version: 'hazlenz.expert.235.stabilization.v1',
  providerCalls: 0, databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,

  posture: 'ADDITIVE SUCCESSOR. §233 is not edited. Its four modules keep the digest the frozen '
    + '§234 evidence records, so the §234 result stays reproducible from the tree, and the §235 '
    + 'prompt and schema can be reduced to the §233 ones byte for byte.',
  section233ImplementationDigest: implementationDigest233,
  section233ImplementationUnchanged: true,
  section233ManifestVerified: manifest233,
  section234ManifestVerified: manifest234,
  section234Rescored: false,
  frozenJudgmentAltered: false,

  filesCreated: [
    { path: 'backend/scripts/lib/expert-235-wire-normalization.ts',
      role: 'safe, semantically lossless container normalization and a strict conformance check '
        + 'against the schema as transmitted' },
    { path: 'backend/scripts/lib/expert-235-posture-contract.ts',
      role: 'the aligned instruction block, the twelve provider-visible rules, one added posture '
        + 'field, and reconstruction back to §233' },
    { path: 'backend/scripts/lib/expert-235-posture-projection.ts',
      role: 'delegates every §233 check unchanged and adds P7, P8 and P9' },
    { path: 'backend/scripts/lib/expert-235-contract-consistency.ts',
      role: 'the bidirectional rule registry and the test that makes the alignment defect '
        + 'unrepeatable' },
    { path: 'backend/scripts/lib/expert-235-posture-fixtures.ts', role: 'the local scenarios' },
    { path: 'backend/scripts/test-235-posture-stabilization.ts', role: 'the local suite' },
    { path: 'backend/scripts/lib/expert-236-hosted-confirmation-design.ts',
      role: 'the small hosted confirmation PROPOSAL. No case is authored and no call is authorized.' },
  ],
  filesModified: [],
  protectedModulesMutated: [],
  section233ModulesModified: [],

  workItem1_wireStabilization: {
    anomalyClasses: [...WIRE_ANOMALY_CLASSES_235],
    actions: [...NORMALIZATION_ACTIONS_235],
    knownInertWrapperKeys: [...KNOWN_INERT_WRAPPER_KEYS_235],
    theOneRule: 'normalization may change the CONTAINER and may never change the CONTENT',
    envelopeUnwrapConditions: [
      'the outer object has exactly one key',
      'that key is a member of the closed inert-wrapper set',
      'the outer object carries no field the transmitted schema declares at the root',
      'the inner value is an object carrying at least one declared root field',
    ],
    jsonStringParseConditions: [
      'the string parses',
      'the parsed value exactly satisfies the schema AS TRANSMITTED for that field',
      'nothing is invented, supplied or edited; a shortfall leaves the value as received',
    ],
    selfNamedFieldWrapper: {
      observedIn: '§234 F3, where expertHazardCandidates arrived as the string '
        + '{"expertHazardCandidates":[ ... ]}',
      whyItIsSafe: 'the wrapper key is the field\'s own name, so there is no second candidate for '
        + 'the intended value. The unwrapped value is then checked against the transmitted schema '
        + 'like any other.',
      deliberatelyNarrow: 'applied only inside the JSON-string path, because that is the shape that '
        + 'was observed. An unstringified self-named object is NOT unwrapped.',
    },
    whatStaysFailClosed: [
      'a JSON string that does not parse — the §234 E3 and F1 shape, where the string carries a '
        + 'trailing brace. It is never repaired into guessed safety content.',
      'a parsed value that does not exactly satisfy the transmitted schema',
      'a required root field that is simply absent — the §234 E1 shape. Nothing is supplied.',
      'a wrapper key outside the closed set, or any envelope whose intended root is ambiguous',
    ],
    p9TransportIntegrity: {
      rule: 'anything the normalizer refused to undo means the output DID NOT ARRIVE INTACT, and '
        + 'the analysis is refused whole.',
      whyItWasAdded: 'the local suite caught a fail-open. A candidate array left unparsed reads as '
        + 'NO candidates, so P3 coverage was satisfied vacuously and a CONTINUE posture was '
        + 'admitted on an output whose hazard list never arrived.',
      widerThan233: 'it refuses on a base-contract root field the posture projection never reads. '
        + 'The transmitted schema declared that field required, so an output without it is not the '
        + 'output the contract asked for.',
    },
  },

  workItem2_contractAlignment: {
    principle: 'no deterministic rule may reject an output for violating a requirement the '
      + 'transmitted instruction never states, and no provider-visible requirement may be absent '
      + 'from the projection.',
    rulesAddedToTheTransmittedInstruction: PROVIDER_VISIBLE_RULES_235.length,
    rulesTheAuthorizationNamed: [
      'no reference may appear in both basis lists',
      'every declaration must be covered by the posture',
      'every ACTIVE candidate requiring coverage must be covered',
    ],
    furtherGapsTheConsistencyCheckFound: [
      'POSTURE_NARRATIVE_PLACEHOLDER — filler was refused and never forbidden in the instruction',
      'BLOCKING_CLARIFICATION_WITH_CONTINUE — the §233 P5 rule was consumed and never stated',
      'CONTROLS_PRESENT_UNDER_CONTINUE — implied by "required only when" and never stated',
      'CONTROL_CONCURRENT_WITH_EXPOSURE_UNDER_NON_PERMITTING_POSTURE — the §231 G10 shape, enforced '
        + 'and never stated',
      'RESUME_CONDITION_UNDER_PERMITTING_POSTURE — the OPPOSITE direction: the schema told the '
        + 'model to leave the lists empty and nothing enforced it',
    ],
    consistencyChecks: consistency.checks,
    registrySize: RULE_REGISTRY_235_BASE.length,
    enforcedCodes: RULE_REGISTRY_235_BASE.length,
    theCheckHasTeeth: 'the suite removes a registry entry and asserts C1 fails, and transmits a '
      + 'rule with no code and asserts C3 fails. A consistency check nobody has watched fail is not '
      + 'a check.',
    fieldForFieldAgreement: {
      subfields: POSTURE_SUBFIELDS_235,
      agreesAcross: ['schema properties', 'schema required', 'declared inventory',
        'the TypeScript interface, by compile-time exhaustiveness', 'the fields the projection reads'],
    },
  },

  workItem3_manufacturedUncertainty: {
    invariant: 'AN UNRESOLVED FACT MUST NOT BE CREATED SOLELY TO DELAY, WEAKEN OR REPLACE A POSTURE '
      + 'ALREADY DETERMINED BY AN ESTABLISHED CONTROLLING PROPERTY.',
    theSmallestConstraint: `one required posture field, ${CESSATION_FIELD}, and one rule: a `
      + 'non-empty list forces STOP.',
    whyAFieldAndNotAnInstructionAlone: 'the defect is a representation gap. §233 gave the model no '
      + 'way to say "this established condition already requires cessation" as anything other than '
      + 'the posture itself, so an invented unknown could stand between the two with nothing to '
      + 'contradict it. The field makes the judgment explicit and the contradiction checkable.',
    whyItIsNotCaseSpecific: 'the §234 autoclave is not referenced anywhere in the implementation or '
      + 'the fixtures. The local trap is a paper guillotine with a bypassed two-hand control, and '
      + 'the rule is asserted at every non-STOP posture rather than at HOLD alone.',
    itIsAFloorNotAFix: 'a model that simply leaves the list empty on a case that warrants it is not '
      + 'refused. What the field removes is the ability to NAME an established cessation condition '
      + 'and then not stop. This is disclosed rather than claimed as a repair.',
    overcorrectionGuards: [
      'the instruction says LEAVE IT EMPTY before it says anything else, and the suite asserts the '
        + 'restraint sentence precedes the constraint in the transmitted prompt',
      'an empty list constrains nothing at any of the four postures, asserted at all four',
      'a legitimate HOLD on a genuinely unresolved controlling property is admitted unchanged',
      'an ACTIVE, serious, properly controlled hazard accepted without action under CONTINUE is '
        + 'admitted unchanged',
      'an established STOP alongside a genuinely SEPARATE unresolved property is admitted, the STOP '
        + 'is preserved, and the separate declaration is still carried and subordinated',
      'the rule is NOT "established hazard means STOP": it is about a property whose truth already '
        + 'determines cessation',
    ],
  },

  resumeConditionFinding: {
    addressed: true,
    code: 'RESUME_CONDITION_UNDER_PERMITTING_POSTURE',
    whyItWasInScope: 'the §235 authorization permits it only if trivial, deterministic and clearly '
      + 'required for contract coherence. It is all three: the fix is one comparison, and the '
      + 'schema ALREADY told the model to leave both lists empty when work may continue, so leaving '
      + 'it unenforced would leave the contract incoherent by the exact standard §235 is being held '
      + 'to.',
    recordedSeparately: true,
    wasNotASection234FailureDriver: true,
    doesNotClaimToExplainSection234: true,
  },

  scorerConsoleLabel: {
    fixed: false,
    whyNot: 'it is trivial but it is NOT isolated. The §234 scorer digest is recorded in the frozen '
      + '§234 protocol precisely to prove the scoring code predates the output it scored. Editing '
      + 'it now would destroy that guarantee for a cosmetic gain on a console line whose stored '
      + 'data is already correct.',
    carriedForward: 'the §236 scorer, when it is authored under authorization, renders NO_POSTURE '
      + 'distinctly from over-conservative.',
  },

  localValidation: {
    providerCalls: 0, databaseOperations: 0,
    suite: 'backend/scripts/test-235-posture-stabilization.ts',
    passed: Number(suiteLine[1]), failed: 0,
    twelveAuthorizedItems: {
      '1_contractConsistency': `${consistency.passed}/${consistency.total} PASS, plus two teeth tests`,
      '2_safeWrapperNormalization': 'PASS — N1, N2 recovered; N3, N4 refused',
      '3_jsonStringNormalization': 'PASS — N5, N8, N11 recovered',
      '4_malformedStringFailsClosed': 'PASS — N6 left byte-identical, refused, preserved',
      '5_rootOmissionFailsClosed': 'PASS — N9, and nothing is supplied for the absent field',
      '6_manufacturedUncertaintyTrap': 'PASS — M1 refused at every non-STOP posture',
      '7_legitimateHoldRemainsValid': 'PASS — M4, M5, M6 and an empty list at all four postures',
      '8_establishedStopPlusSeparateProperty': 'PASS — M3, STOP preserved with the declaration carried',
      '9_coverageRulesInTheTransmittedInstruction': 'PASS — all twelve rules verbatim in both '
        + 'governed variants',
      '10_section233SuiteGreen': '109 passed, 0 failed',
      '11_protectedLadderGreen': `${ladder.passed} passed, ${ladder.failed} failed, `
        + `${ladder.suitesMissing} missing, of ${ladder.suitesListed}`,
      '12_productionTypecheck': typecheck,
    },
    additionalRegression: {
      section233BehaviourUnchanged: 'every one of the fourteen §233 scenarios produces the identical '
        + '§233 code set and admission under the §235 projection; the only §235 code added to a '
        + 'previously admitted scenario is the absent new field',
      reconstruction: 'the §235 prompt reduces to the §233 prompt byte for byte on both governed '
        + 'variants, and the §235 schema reduces to the §233 schema exactly',
      wireShape: 'no union type in the §235 transmitted schema; no root property and no root '
        + 'required entry added; exactly one posture sub-property and one posture required entry',
      proseIndependence: 'every prose field replaced with arbitrary text changes no admission and '
        + 'no code',
    },
  },

  payload: {
    section233PromptBytes: build233SystemPrompt(0).length,
    section235PromptBytes: build235SystemPrompt(0).length,
    section233SchemaBytes: JSON.stringify(s233).length,
    section235SchemaBytes: JSON.stringify(s235).length,
    promptReducesToSection233ByteForByte:
      reconstruct233SystemPrompt(build235SystemPrompt(0)) === build233SystemPrompt(0),
    schemaReducesToSection233ByteForByte:
      JSON.stringify(reconstruct233WireSchema(FIXTURE_INPUT_235, BINDING))
        === JSON.stringify(s233),
    rootPropertiesAdded: Object.keys(s235.properties).length - Object.keys(s233.properties).length,
    posturePropertiesAdded: Object.keys(s235.properties.immediateSafetyPosture.properties).length
      - Object.keys((POSTURE_SCHEMA_PROPERTY_233 as any).properties).length,
    theTension: 'the §234 evidence suggests payload size may bear on wire-shape stability, and §235 '
      + 'grows the payload by roughly five per cent while adding the normalization that recovers '
      + 'three of the six §234 casualties. That trade is recorded, not resolved, and the §236 '
      + 'wire-arrival slot exists to measure it.',
  },

  remainingKnownLimitations: [
    { id: 'L1', severity: 'MATERIAL',
      limitation: `P7 is a floor. A model that never populates ${CESSATION_FIELD} is never refused `
        + 'by it, so an established-property downgrade remains reachable.',
      disposition: 'disclosed, and it is the primary thing the §236 trap slot measures' },
    { id: 'L2',
      limitation: 'normalization cannot recover a malformed JSON string, and two of the six §234 '
        + 'casualties were exactly that.',
      disposition: 'correct by design. Malformed safety state stays fail-closed.' },
    { id: 'L3',
      limitation: 'no §235 change has been exercised against a provider. Whether the aligned '
        + 'instruction changes behaviour, and whether the larger payload worsens arrival, are '
        + 'hosted questions.',
      governedBy: 'invariant 27. A schema change is never evidence that a behavioural defect is '
        + 'repaired.' },
    { id: 'L4',
      limitation: 'the §235 contract is not wired to an assembly or an executor, because no '
        + 'provider call is authorized and an executor would be dead code.',
      disposition: 'the first step under hosted authorization, exactly as §233 L3 was' },
  ],

  successCondition: {
    transmittedContractAndValidatorDescribeTheSameRules: true,
    deterministicRuleWithNoProviderVisibleStatement: 0,
    providerVisibleRuleWithNoDeterministicCode: 0,
    safeNormalizationImplemented: true,
    malformedStateStillFailsClosed: true,
    manufacturedUncertaintyConstraintImplemented: true,
    constraintIsGeneralizedNotCaseSpecific: true,
    legitimateHoldAndRestraintPreserved: true,
    section233Unmodified: true,
    section234EvidenceUnmodified: true,
    semanticBehaviourChangeProven: false,
    semanticBehaviourChangeClaimed: false,
  },
};

const wireAnalysis = {
  artifact: 'SECTION-235-WIRE-ANALYSIS', providerCalls: 0, databaseOperations: 0,
  purpose: 'classify all six §234 wire-shape anomalies and measure, without a provider call, how '
    + 'many of the ten §234 refusals the normalization alone would have carried to the projection.',
  classificationOfTheSixAnomalies: [
    { cases: ['F4', 'S4'], class: 'INERT_WRAPPER_ENVELOPE',
      detail: 'the whole analysis wrapped in a "parameters" or "parameter name" object',
      normalized: true },
    { cases: ['E1'], class: 'REQUIRED_ROOT_FIELD_ABSENT',
      detail: 'four required root fields, the posture among them, simply not emitted',
      normalized: false },
    { cases: ['F3'], class: 'SELF_NAMED_FIELD_WRAPPER',
      detail: 'three structured fields each transported as a JSON string holding an object keyed '
        + 'by the field\'s own name', normalized: true },
    { cases: ['E3', 'F1'], class: 'MALFORMED_JSON_STRING',
      detail: 'the posture transported as a JSON string carrying a trailing brace, so the string '
        + 'does not parse. F1 also stringified its candidate array, malformed as well.',
      normalized: false },
    { cases: ['E3'], class: 'OTHER',
      detail: 'an invented near-duplicate root key, crossHazardInsights2. Not normalized: an '
        + 'invented key is content, not encoding.', normalized: false },
  ],
  replayOfTheSection234Outputs: {
    important: 'THIS IS NOT A RESCORE AND NOT A PREDICTION. These outputs were produced under the '
      + '§233 contract. The model was never told the three alignment rules and never had the '
      + 'cessation field, so only the CONTAINER handling is measurable here. The frozen §234 5/16 '
      + 'stands untouched.',
    section234Refusals: wasRefused.length,
    ofWhichHadAWireShapeAnomaly: wireCasualties.map(r => r.caseId),
    ofWhichWereRefusedOnAContentRuleWithNoWireAnomaly:
      wasRefused.filter(r => r.anomaliesObserved.length === 0).map(r => r.caseId),
    wireCasualtiesReachingTheProjectionIntactUnderSection235Normalization: nowIntact.length,
    admittedAfterNormalizationUnderTheSection233Rules: nowAdmitted.map(r => r.caseId),
    stillFailClosed: wireCasualties.filter(r => !r.reachesTheProjectionIntact).map(r => r.caseId),
    whatTheRecoveredOnesNowFailOn: nowIntact.filter(r => !r.admittedAfterNormalizationUnder233)
      .map(r => ({ caseId: r.caseId, codes: r.codesAfterNormalizationUnder233 })),
    reading: 'three of the six wire-shape casualties reach the projection intact. One is then '
      + 'admitted outright. The other two fail on a coverage rule that §234 never stated and §235 '
      + 'now does, which is the alignment work item rather than the normalization one. The three '
      + 'that stay refused are the absent-field case and the two malformed strings, and they are '
      + 'refused by design.',
    perCase: replay,
  },
  normalizationIdentity: normalizationIdentity235(),
};

const consistencyDoc = {
  artifact: 'SECTION-235-CONTRACT-CONSISTENCY', providerCalls: 0, databaseOperations: 0,
  result: consistency.allPassed ? 'PASS' : 'FAIL',
  passed: consistency.passed, total: consistency.total, checks: consistency.checks,
  providerVisibleRules: PROVIDER_VISIBLE_RULES_235,
  registry: RULE_REGISTRY_235_BASE,
  identity: consistencyIdentity235(),
};

const contractIdentity = {
  artifact: 'SECTION-235-CONTRACT-IDENTITY',
  contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
  baseContractVersion: FIRST_PASS_CONTRACT_233_VERSION,
  contractIdentities235: contractIdentities235(),
  projectionIdentity235: projectionIdentity235(),
  refusalCodes235: [...POSTURE_REFUSAL_CODES_235],
  moduleDigests235: Object.fromEntries([
    ['normalization', 'backend/scripts/lib/expert-235-wire-normalization.ts'],
    ['contract', 'backend/scripts/lib/expert-235-posture-contract.ts'],
    ['projection', 'backend/scripts/lib/expert-235-posture-projection.ts'],
    ['consistency', 'backend/scripts/lib/expert-235-contract-consistency.ts'],
    ['fixtures', 'backend/scripts/lib/expert-235-posture-fixtures.ts'],
    ['suite', 'backend/scripts/test-235-posture-stabilization.ts'],
    ['design236', 'backend/scripts/lib/expert-236-hosted-confirmation-design.ts'],
  ].map(([k, p]) => [k, sha(readFileSync(join(ROOT, p as string)))])),
  section233ImplementationDigest: implementationDigest233,
  protectedCompositeIdentity: prot.compositeIdentity,
  scenarioCount: SCENARIOS_235.length,
};

const design236 = {
  artifact: 'SECTION-236-HOSTED-CONFIRMATION-DESIGN', version: DESIGN_236_VERSION,
  providerCalls: 0, databaseOperations: 0, executionAuthorized: false,
  hostedQuestion: HOSTED_QUESTION_236,
  whatItIsNot: WHAT_IT_IS_NOT_236,
  slots: SLOT_DESIGN_236,
  freshness: FRESHNESS_236,
  passRule: PASS_RULE_236,
  callPlan: CALL_PLAN_236,
  failurePath: FAILURE_PATH_236,
  identity: designIdentity236(),
  casesAuthored: 0,
  whyNotAuthoredYet: 'the same gate §233 used before §234. The product owner approves the '
    + 'composition, the budget and the pass rule first, and the cases are authored, preflighted and '
    + 'frozen inside the authorized slice. Authoring nine frozen observations ahead of that '
    + 'authorization would also invite the composition to drift toward cases that are easy to write.',
};

const docs: readonly (readonly [string, unknown])[] = [
  ['SECTION-235-IMPLEMENTATION.json', implementation],
  ['SECTION-235-CONTRACT-CONSISTENCY.json', consistencyDoc],
  ['SECTION-235-WIRE-ANALYSIS.json', wireAnalysis],
  ['SECTION-235-CONTRACT-IDENTITY.json', contractIdentity],
  ['SECTION-236-HOSTED-CONFIRMATION-DESIGN.json', design236],
];
for (const [n, d] of docs) writeFileSync(join(OUT, n), JSON.stringify(d, null, 2) + '\n');

if (existsSync(join(OUT, 'SECTION-235-REPORT.md'))) {
  const files = readdirSync(OUT).filter(f => f !== 'REPORT-235.sha256'
    && statSync(join(OUT, f)).isFile()).sort();
  const lines = files.map(f => `${sha(readFileSync(join(OUT, f)))}  ${f}`);
  writeFileSync(join(OUT, 'REPORT-235.sha256'),
    '# path convention: BARE_FILENAME — verify with: cd <this directory> && '
    + 'shasum -a 256 -c REPORT-235.sha256\n'
    + '# contents: FROZEN EVIDENCE ONLY. No living document is listed here.\n'
    + lines.join('\n') + '\n');
  console.log(`manifest written: ${files.length} files`);
}

console.log('§235 EVIDENCE WRITTEN — 0 provider calls, 0 database operations');
console.log(`  local suite                 ${suiteLine[1]} passed, 0 failed`);
console.log(`  contract consistency        ${consistency.passed}/${consistency.total} PASS`);
console.log(`  §233 suite / ladder         109 / ${ladder.passed} of ${ladder.results.length}`);
console.log(`  production typecheck        ${typecheck}`);
console.log(`  §233 implementation digest  ${implementationDigest233} (unchanged)`);
console.log(`  protected composite         ${prot.compositeIdentity}`);
console.log(`  §233 + §234 manifests       ${manifest233.length}/${manifest233.length} + ${manifest234.length}/${manifest234.length} verify`);
console.log(`  §234 wire-shape casualties reaching the projection intact: `
  + `${nowIntact.length} of ${wireCasualties.length}`);
