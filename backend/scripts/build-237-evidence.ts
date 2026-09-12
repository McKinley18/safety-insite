/**
 * §237 — EVIDENCE PACKAGE. ZERO provider calls, ZERO database operations.
 * No commit, no push, no tag, no deploy.
 */
import { createHash } from 'crypto';
import { execFileSync } from 'child_process';
import { mkdirSync, readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join } from 'path';

import { governedBindingFor } from './lib/expert-first-pass-instruction-vnext';
import {
  contractIdentities233, FIRST_PASS_CONTRACT_233_VERSION, build233SystemPrompt,
  buildExpert233WireSchema, POSTURE_SCHEMA_PROPERTY_233,
} from './lib/expert-233-posture-contract';
import { projectionIdentity233 } from './lib/expert-233-posture-projection';
import {
  contractIdentities235, FIRST_PASS_CONTRACT_235_VERSION, build235SystemPrompt,
  buildExpert235WireSchema,
} from './lib/expert-235-posture-contract';
import { projectionIdentity235 } from './lib/expert-235-posture-projection';
import { runContractConsistency235, consistencyIdentity235 }
  from './lib/expert-235-contract-consistency';
import { normalizationIdentity235 } from './lib/expert-235-wire-normalization';
import {
  contractIdentities237, FIRST_PASS_CONTRACT_237_VERSION, build237SystemPrompt,
  buildExpert237WireSchema, reconstruct233SystemPrompt, reconstruct233WireSchema,
  CESSATION_DERIVABILITY_237, POSTURE_DRIVER_ROLES_237, DRIVER_ROLE_DEFINITIONS_237,
  DRIVER_ROLE_REF_KIND_237, DECISION_CONTROLLING_ROLES_237, CESSATION_ROLE_237,
  DRIVER_ROLE_FIELD, PROVIDER_VISIBLE_RULES_237, RULES_RETAINED_FROM_235, RULES_REMOVED_FROM_235,
  POSTURE_SUBFIELDS_237, BASIS_ENTRY_SUBFIELDS_237,
} from './lib/expert-237-posture-contract';
import {
  projectionIdentity237, POSTURE_REFUSAL_CODES_237, CODES_RETIRED_FROM_235,
} from './lib/expert-237-posture-projection';
import {
  runContractConsistency237, RULE_REGISTRY_237_BASE, consistencyIdentity237,
  INHERITED_CITATION_OVERRIDES_237,
} from './lib/expert-237-contract-consistency';
import { SCENARIOS_237, FIXTURE_INPUT_237 } from './lib/expert-237-posture-fixtures';
import {
  DESIGN_238_VERSION, HOSTED_QUESTION_238, WHAT_IT_IS_NOT_238, SLOT_DESIGN_238, FRESHNESS_238,
  PASS_RULE_238, CALL_PLAN_238, NO_FURTHER_EXPERIMENT_LOOP_238, designIdentity238,
} from './lib/expert-238-final-confirmation-design';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-237-posture-architecture-closure-2026-09-11');
mkdirSync(OUT, { recursive: true });
const sha = (s: string | Buffer): string => createHash('sha256').update(s).digest('hex');
const abort = (m: string): never => { throw new Error(`§237 EVIDENCE ABORT: ${m}`); };

// ---------------------------------------------------------------- identity and prior packages

const PROT = join(OUT, 'PROTECTED-IDENTITIES-237.json');
execFileSync('npx', ['tsx', join(__dirname, 'verify-229-protected-identities.ts'), PROT],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const prot = JSON.parse(readFileSync(PROT, 'utf8')) as Record<string, any>;
const AUTHORIZED_COMPOSITE = '37ce9eb8e9db62288b0a4953072bb487f38beab962d4716ad74be47036e2e2cb';
if (prot.compositeIdentity !== AUTHORIZED_COMPOSITE) abort('protected composite identity changed');
if (prot.moduleCount !== 29 || prot.missingModules.length !== 0) abort('protected set not intact');

const LADDER = join(OUT, 'LADDER-237.json');
execFileSync('npx', ['tsx', join(__dirname, 'run-229-protected-ladder.ts'), LADDER],
  { cwd: join(ROOT, 'backend'), stdio: 'pipe' });
const ladder = JSON.parse(readFileSync(LADDER, 'utf8')) as Record<string, any>;
if (ladder.failed !== 0 || (ladder.suitesMissing as unknown[]).length !== 0) {
  abort('the protected ladder is not green');
}

/** §233 and §235 must be byte-identical to what §236 recorded. §237 is additive. */
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
if (implementationDigest233 !== '5517337ded68b7b8901dcb588355f98b4bdbf2dfe4ae54a4af0266af1d4ce5af') {
  abort(`the §233 implementation changed (${implementationDigest233})`);
}

const MODULES_235: Readonly<Record<string, string>> = {
  normalization: 'backend/scripts/lib/expert-235-wire-normalization.ts',
  contract: 'backend/scripts/lib/expert-235-posture-contract.ts',
  projection: 'backend/scripts/lib/expert-235-posture-projection.ts',
  consistency: 'backend/scripts/lib/expert-235-contract-consistency.ts',
  fixtures: 'backend/scripts/lib/expert-235-posture-fixtures.ts',
  suite: 'backend/scripts/test-235-posture-stabilization.ts',
};
const moduleDigests235 = Object.fromEntries(Object.entries(MODULES_235)
  .map(([k, p]) => [k, sha(readFileSync(join(ROOT, p)))]));
const stabilizationDigest235 = sha(JSON.stringify({
  moduleDigests235, contractIdentity235: contractIdentities235(),
  projectionIdentity: projectionIdentity235(), consistency: consistencyIdentity235(),
  normalization: normalizationIdentity235(), contractVersion: FIRST_PASS_CONTRACT_235_VERSION,
}));
if (stabilizationDigest235 !== '1f00a67ec9ecff5ba1c5b221ea057d63af8ce87062e520d6c61693623f03a4bd') {
  abort(`the §235 stabilization changed (${stabilizationDigest235})`);
}

for (const [label, dir] of [
  ['§233', 'expert-hazlenz-233-immediate-safety-posture-implementation-2026-09-11'],
  ['§234', 'expert-hazlenz-234-posture-discrimination-2026-09-11'],
  ['§235', 'expert-hazlenz-235-posture-contract-stabilization-2026-09-11'],
  ['§236', 'expert-hazlenz-236-stabilized-confirmation-2026-09-11'],
] as const) {
  const d = join(ROOT, 'verification', dir);
  const man = readFileSync(join(d, `REPORT-${label.slice(1)}.sha256`), 'utf8')
    .split('\n').filter(l => l.trim() && !l.startsWith('#'));
  for (const l of man) {
    const [dig, name] = l.split(/\s+/);
    if (sha(readFileSync(join(d, name))) !== dig) abort(`${label} evidence no longer verifies`);
  }
}

// ---------------------------------------------------------------- local validation

const consistency237 = runContractConsistency237();
if (!consistency237.allPassed) abort('the §237 contract consistency check does not pass');
const consistency235 = runContractConsistency235();
if (!consistency235.allPassed) abort('the §235 contract consistency check no longer passes');

const suites: Record<string, string> = {};
for (const [k, script] of [
  ['section237', 'test-237-posture-closure.ts'],
  ['section235', 'test-235-posture-stabilization.ts'],
  ['section233', 'test-233-posture-contract.ts'],
] as const) {
  try {
    suites[k] = execFileSync('npx', ['tsx', join(__dirname, script)],
      { cwd: join(ROOT, 'backend'), encoding: 'utf8' });
  } catch (e) { abort(`${script} failed: ${String(e).slice(0, 200)}`); }
}
writeFileSync(join(OUT, 'SECTION-237-LOCAL-SUITE-OUTPUT.txt'), suites.section237);
const countOf = (s: string): { passed: number; failed: number } => {
  const m = /(\d+) passed, (\d+) failed/.exec(s);
  return { passed: Number(m?.[1] ?? -1), failed: Number(m?.[2] ?? -1) };
};
const r237 = countOf(suites.section237);
const r235 = countOf(suites.section235);
const r233 = countOf(suites.section233);
if (r237.failed !== 0 || r235.failed !== 0 || r233.failed !== 0) abort('a suite reports failures');

let typecheck = 'PASS';
try { execFileSync('npx', ['tsc', '--noEmit', '-p', 'tsconfig.json'], { cwd: join(ROOT, 'backend'), stdio: 'pipe' }); }
catch { typecheck = 'FAIL'; }
if (typecheck !== 'PASS') abort('production typecheck fails');

// ---------------------------------------------------------------- documents

const BINDING = governedBindingFor([]);
const s233 = buildExpert233WireSchema(FIXTURE_INPUT_237, BINDING) as Record<string, any>;
const s235 = buildExpert235WireSchema(FIXTURE_INPUT_237, BINDING) as Record<string, any>;
const s237 = buildExpert237WireSchema(FIXTURE_INPUT_237, BINDING) as Record<string, any>;

const implementation = {
  artifact: 'SECTION-237-IMPLEMENTATION',
  version: 'hazlenz.expert.237.closure.v1',
  providerCalls: 0, databaseOperations: 0,
  commit: false, push: false, tag: false, deploy: false,

  posture: 'ADDITIVE SUCCESSOR TO §233. Neither §233 nor §235 is edited, so the digests the frozen '
    + '§236 protocol records still hold and §236 stays reproducible from the tree. §237 supersedes '
    + 'the §235 cessation design without rewriting it.',
  implementationDigest233, section233Unchanged: true,
  stabilizationDigest235, section235Unchanged: true,
  section236Rescored: false,
  priorEvidencePackagesVerified: ['§233', '§234', '§235', '§236'],

  reportItem1_wasCessationStateDeterministicallyDerivable: CESSATION_DERIVABILITY_237,

  reportItem2_authoritativeSourceStateUsed: {
    source: `immediateSafetyPosture.requiredBy[].${DRIVER_ROLE_FIELD}`,
    why: 'the reference to the candidate already exists in requiredBy and arrived correctly typed '
      + 'on nine of nine §236 calls. Attaching the judgment to it means no reference is written '
      + 'twice and there is no separate field to omit or malform.',
    vocabulary: POSTURE_DRIVER_ROLES_237,
    definitions: DRIVER_ROLE_DEFINITIONS_237,
    refKindBinding: DRIVER_ROLE_REF_KIND_237,
    derivedCessationSet: `requiredBy filtered on ${CESSATION_ROLE_237}`,
    derivationIsAFilterAndNothingMore: true,
  },

  reportItem3_duplicateProviderFieldRemovedOrRetained: {
    field: 'immediateSafetyPosture.establishedConditionsRequiringCessation',
    disposition: 'REMOVED',
    whyRemoved: [
      'it duplicated candidate identity: a second list of references to candidates the analysis had '
        + 'already named. Two of its three §235 rules did nothing but check the copy against its '
        + 'original, which is the anti-pattern the §237 authorization names.',
      'it was separately omissible, and §236 proved that empirically: every one of the four contract '
        + 'refusals came from that field, absent on three of nine and malformed on a fourth, while '
        + 'nothing else in the contract refused anything.',
      'it added no discriminating power in §236. On all six calls where it arrived, it agreed with '
        + 'the posture. The cross-check never once fired.',
    ],
    whatWasNotRemoved: 'THE JUDGMENT. Whether an established condition already requires cessation is '
      + 'irreducible and is still model-authored. Only the duplication is gone.',
    codesRetired: CODES_RETIRED_FROM_235,
    codesRetiredCount: CODES_RETIRED_FROM_235.length,
  },

  reportItem4_posturefloorImplementation: {
    invariant: 'if one or more authoritative established candidates independently require cessation, '
      + 'the immediate posture cannot be less protective than STOP.',
    code: 'ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE',
    rule: `any requiredBy entry whose ${DRIVER_ROLE_FIELD} is ${CESSATION_ROLE_237} and a posture `
      + 'other than STOP refuses the analysis.',
    enforcedFrom: 'authoritative basis state, not a redundant self-report',
    whatItDoesNotDo: [
      'it does not infer STOP because a hazard is serious',
      'it does not infer STOP because a candidate exists or is ACTIVE',
      'the permissive role is listed first in the vocabulary and in the instruction, so a real, '
        + 'present, properly controlled hazard has a truthful member to use',
    ],
    theOtherSide: 'NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER also refuses a STOP '
      + 'whose only drivers require controls, so the floor is enforced in both directions.',
  },

  reportItem5_treatmentOfResponseUncertainty: {
    semanticRule: 'ONLY UNCERTAINTY ABOUT A DECISION-CONTROLLING SAFETY PROPERTY MAY CHANGE THE '
      + 'IMMEDIATE WORK POSTURE BY REQUIRING VERIFICATION BEFORE CONTINUATION.',
    code: 'NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER',
    rule: 'a posture that does not permit continued work must carry at least one driver whose role '
      + `is in ${JSON.stringify(DECISION_CONTROLLING_ROLES_237)}.`,
    atLeastOneNotEveryOne: 'a legitimate hold that ALSO declares a follow-up question is admitted. '
      + 'The rule removes an escalation, never a declaration.',
    couldAnExistingPropertyHaveDoneThis: {
      candidate: 'unresolvedFactDeclarations[].affectedDecision, a governed enum of HAZARD_EXISTENCE '
        + '| HAZARD_SEVERITY | EXPOSURE | APPLICABILITY | REQUIRED_CONTROL | '
        + 'REGULATORY_INTERPRETATION',
      answer: 'NO, and the §236 evidence settles it rather than an argument. All six declarations '
        + 'across all nine §236 calls came back REQUIRED_CONTROL: on two legitimate holds, on a '
        + 'CONTINUE, on a CONTINUE_WITH_CONTROLS, on a STOP and on the C2 defect itself. The '
        + 'property has zero discriminating power on exactly the distinction it looks like it '
        + 'should carry.',
      thereforeAMinimalFieldWasNecessary: true,
      andItIsNarrowlyScoped: 'two of five members on one existing entry, transmitted with '
        + 'definitions and a worked contrast, and no new taxonomy anywhere else in the contract.',
    },
  },

  reportItem6_filesChanged: {
    created: [
      { path: 'backend/scripts/lib/expert-237-posture-contract.ts',
        role: 'the derivability record, the five-member driver-role vocabulary, the instruction '
          + 'block, the schema addition and reconstruction back to §233' },
      { path: 'backend/scripts/lib/expert-237-posture-projection.ts',
        role: 'delegates every §233 check unchanged, adds D1 to D4, retains §235 P8 and P9, and '
          + 'exposes the derived cessation set as a filter' },
      { path: 'backend/scripts/lib/expert-237-contract-consistency.ts',
        role: 'the bidirectional registry with two directions added for removal: nothing retired '
          + 'survives, and retention is byte-exact' },
      { path: 'backend/scripts/lib/expert-237-posture-fixtures.ts', role: 'the local scenarios' },
      { path: 'backend/scripts/test-237-posture-closure.ts', role: 'the local suite' },
      { path: 'backend/scripts/lib/expert-238-final-confirmation-design.ts',
        role: 'the six-call PROPOSAL. No case is authored and no call is authorized.' },
    ],
    modified: [],
    protectedModulesMutated: [],
    section233ModulesModified: [], section235ModulesModified: [],
    section235ModulesReusedUnchanged: ['expert-235-wire-normalization.ts (imported whole)',
      'expert-235-posture-fixtures.ts (candidate, declaration and clarification builders)',
      'expert-235-contract-consistency.ts (twenty-two registry entries inherited)'],
  },

  reportItem7_contractChanges: {
    removed: {
      postureProperty: 'establishedConditionsRequiringCessation',
      transmittedRules: RULES_REMOVED_FROM_235,
      refusalCodes: CODES_RETIRED_FROM_235,
    },
    added: {
      basisEntryMember: DRIVER_ROLE_FIELD,
      vocabularyMembers: POSTURE_DRIVER_ROLES_237.length,
      transmittedRules: PROVIDER_VISIBLE_RULES_237.slice(8),
      refusalCodes: POSTURE_REFUSAL_CODES_237.filter(c =>
        c !== 'RESUME_CONDITION_UNDER_PERMITTING_POSTURE'
        && c !== 'WIRE_OUTPUT_DID_NOT_ARRIVE_INTACT'),
    },
    retained: {
      rulesFrom235: RULES_RETAINED_FROM_235.length,
      registryEntriesInheritedFrom235: RULE_REGISTRY_237_BASE.length
        - PROVIDER_VISIBLE_RULES_237.slice(8).length,
      citationsRestatedBecauseTheSchemaMovedAroundThem:
        Object.keys(INHERITED_CITATION_OVERRIDES_237),
      whyRestated: 'POSTURE_BASIS_ITEM_MALFORMED cited the basis required list, which §237 changed '
        + 'by adding driverRole. C2 caught the stale citation on the first run, which is the '
        + 'consistency check earning its place on a removal slice.',
    },
    netPayload: {
      promptBytes233: build233SystemPrompt(0).length,
      promptBytes235: build235SystemPrompt(0).length,
      promptBytes237: build237SystemPrompt(0).length,
      schemaBytes233: JSON.stringify(s233).length,
      schemaBytes235: JSON.stringify(s235).length,
      schemaBytes237: JSON.stringify(s237).length,
      honestNote: 'the closure does NOT shrink the payload. The driver-role vocabulary and its '
        + 'definitions cost more than the removed property saved, roughly two per cent up on §235. '
        + 'What changed is not size but where the obligation sits.',
    },
    bidirectionalAlignment: {
      section237: `${consistency237.passed}/${consistency237.total} PASS`,
      section235StillGreen: `${consistency235.passed}/${consistency235.total} PASS`,
      noValidatorEnforcesAnUntransmittedRule: true,
      noTransmittedRuleLacksEnforcement: true,
      nothingRetiredSurvives: true,
    },
    reconstruction: {
      promptReducesTo233ByteForByte:
        reconstruct233SystemPrompt(build237SystemPrompt(0)) === build233SystemPrompt(0),
      schemaReducesTo233ByteForByte:
        JSON.stringify(reconstruct233WireSchema(FIXTURE_INPUT_237, BINDING))
          === JSON.stringify(s233),
      rootPropertiesAdded: Object.keys(s237.properties).length - Object.keys(s233.properties).length,
      postureSubPropertiesAdded: Object.keys(s237.properties.immediateSafetyPosture.properties).length
        - Object.keys((POSTURE_SCHEMA_PROPERTY_233 as any).properties).length,
      basisEntryMembersAdded: 1,
      postureSubfields: POSTURE_SUBFIELDS_237,
      basisEntrySubfields: BASIS_ENTRY_SUBFIELDS_237,
    },
  },

  reportItem8_localTestResults: {
    providerCalls: 0, databaseOperations: 0,
    suite: 'backend/scripts/test-237-posture-closure.ts',
    passed: r237.passed, failed: r237.failed,
    scenarioCount: SCENARIOS_237.length,
    fourteenAuthorizedItems: {
      '1_cessationDerivedIfPossible': 'ANSWERED NO, documented, and the derived set proven to be a '
        + 'filter on one enum member with no default and no inference',
      '2_omissionCannotRemoveTheStopFloor': 'PASS — there is no such field to omit; the floor comes '
        + 'from the basis',
      '3_malformedDuplicateCannotAffectPosture': 'PASS — a stray legacy list neither refuses, helps, '
        + 'nor manufactures a floor',
      '4_establishedStopPlusUnrelatedUnresolved': 'PASS — STOP preserved, declaration carried',
      '5_legitimateHoldRemainsHold': 'PASS — including a hold with a mixed basis',
      '6_cwcPlusResponseUncertaintyRemainsCwc': 'PASS — the trap refused, the correct posture admitted',
      '7_continuePlusAdministrativeUncertaintyRemainsContinue': 'PASS',
      '8_genuineControllingUncertaintyStillElevates': 'PASS',
      '9_noManufacturedDeclarationRequired': 'PASS — STOP with zero declarations',
      '10_noFalseStopInflation': 'PASS — swept at all four postures',
      '11_section235AlignmentSuiteGreen': `${r235.passed} passed, ${r235.failed} failed, and the `
        + '§235 consistency check is still green',
      '12_section233PostureSuiteGreen': `${r233.passed} passed, ${r233.failed} failed`,
      '13_protectedLadderGreen': `${ladder.passed} passed, ${ladder.failed} failed, `
        + `${(ladder.suitesMissing as unknown[]).length} missing, of ${ladder.suitesListed}`,
      '14_productionTypecheck': typecheck,
    },
    theChecksHaveTeeth: 'the suite removes a registry entry and asserts C1 fails, transmits a rule '
      + 'with no code and asserts C3 fails.',
  },

  reportItem9_regressionResults: {
    section233BehaviourUnchanged: 'all fourteen §233 scenarios produce the identical §233 code set '
      + 'and admission under the §237 projection',
    section235P8Equivalence: 'the §235 resume-coherence fixtures produce the same P8 outcome under '
      + '§237, so the retained rule is reimplemented rather than reinterpreted',
    section235SuiteUnaffected: `${r235.passed} passed, ${r235.failed} failed`,
    wireShape: 'no union type; no root property added; NO posture sub-property added, because the '
      + '§235 field is gone and nothing replaces it; exactly one basis-entry member added; the '
      + 'acceptance-list entry is byte-identical to §233',
    proseIndependence: 'every prose field replaced with arbitrary text changes no admission and no '
      + 'code',
  },

  reportItem10_protectedIdentity: {
    compositeIdentity: prot.compositeIdentity,
    moduleCount: prot.moduleCount,
    missingModules: prot.missingModules,
    unauthorizedMutations: 0,
    ladder: `${ladder.passed}/${ladder.suitesListed}`,
  },

  reportItem11_remainingKnownSemanticLimitations: [
    { id: 'L1', severity: 'MATERIAL, AND THE CENTRAL ONE',
      limitation: 'D4 IS A FLOOR, NOT A FIX. It refuses a hold whose drivers are all labelled '
        + 'response-only. A model that believes a response question IS decision-controlling will '
        + 'label it so, and no deterministic rule refutes that. §236 C2 would be caught only if the '
        + 'model labelled the unit-seven question UNRESOLVED_RESPONSE_OR_FOLLOW_UP.',
      whyItCannotBeClosedLocally: 'choosing the label is the semantic judgment. Refuting it would '
        + 'require reading the declaration prose, which invariant 3 forbids.',
      whatMeasuresIt: 'the §238 permissive slot, and nothing else can.' },
    { id: 'L2',
      limitation: 'the same is true of the cessation role. A model that never labels a cessation '
        + 'driver is never refused by the floor. This limitation is inherited from §235 P7 '
        + 'unchanged and is not claimed repaired.',
      disposition: 'disclosed. §236 gives the only evidence either way and it was favourable: both '
        + 'established-property STOP traps populated it correctly.' },
    { id: 'L3',
      limitation: 'relocating the obligation onto the basis entry is a reasoned bet that a member '
        + 'on an entry the model produced correctly nine times out of nine will arrive more '
        + 'reliably than a separate required array. It is not proven. A dropped role still refuses '
        + 'the analysis.',
      governedBy: 'invariant 27. A schema change is never evidence that a behavioural defect is '
        + 'repaired.' },
    { id: 'L4',
      limitation: 'the §237 contract is not wired to an assembly or an executor, because no '
        + 'provider call is authorized and an executor would be dead code.',
      disposition: 'the first step under hosted authorization, as §233 L3 and §235 L4 were' },
  ],

  reportItem13_estimatedSpend: {
    projectedUsd: CALL_PLAN_238.projectedSpendUsd,
    worstCaseUsd: CALL_PLAN_238.worstCaseSpendUsd,
    recommendedHardCeilingUsd: CALL_PLAN_238.recommendedHardCeilingUsd,
    basis: CALL_PLAN_238.costBasis,
  },

  successCondition: {
    derivabilityQuestionAnswered: true,
    duplicateProviderObligationRemoved: true,
    postureFloorPreservedFromAuthoritativeState: true,
    responseUncertaintyRuleImplementedGenerically: true,
    legitimateHoldAndRestraintPreserved: true,
    bidirectionalContractAlignmentMaintained: true,
    nothingRetiredSurvives: true,
    section233And235Unmodified: true,
    section234And236EvidenceUnmodified: true,
    semanticBehaviourChangeProven: false,
    semanticBehaviourChangeClaimed: false,
  },
};

const consistencyDoc = {
  artifact: 'SECTION-237-CONTRACT-CONSISTENCY', providerCalls: 0, databaseOperations: 0,
  result: consistency237.allPassed ? 'PASS' : 'FAIL',
  passed: consistency237.passed, total: consistency237.total, checks: consistency237.checks,
  providerVisibleRules: PROVIDER_VISIBLE_RULES_237,
  rulesRetainedFrom235: RULES_RETAINED_FROM_235,
  rulesRemovedFrom235: RULES_REMOVED_FROM_235,
  codesRetiredFrom235: CODES_RETIRED_FROM_235,
  inheritedCitationOverrides: INHERITED_CITATION_OVERRIDES_237,
  registry: RULE_REGISTRY_237_BASE,
  identity: consistencyIdentity237(),
  section235StillGreen: { passed: consistency235.passed, total: consistency235.total },
};

const contractIdentity = {
  artifact: 'SECTION-237-CONTRACT-IDENTITY',
  contractVersion: FIRST_PASS_CONTRACT_237_VERSION,
  baseContractVersion: FIRST_PASS_CONTRACT_233_VERSION,
  supersedes: FIRST_PASS_CONTRACT_235_VERSION,
  contractIdentities237: contractIdentities237(),
  projectionIdentity237: projectionIdentity237(),
  refusalCodes237: [...POSTURE_REFUSAL_CODES_237],
  driverRoles: POSTURE_DRIVER_ROLES_237,
  moduleDigests237: Object.fromEntries([
    ['contract', 'backend/scripts/lib/expert-237-posture-contract.ts'],
    ['projection', 'backend/scripts/lib/expert-237-posture-projection.ts'],
    ['consistency', 'backend/scripts/lib/expert-237-contract-consistency.ts'],
    ['fixtures', 'backend/scripts/lib/expert-237-posture-fixtures.ts'],
    ['suite', 'backend/scripts/test-237-posture-closure.ts'],
    ['design238', 'backend/scripts/lib/expert-238-final-confirmation-design.ts'],
  ].map(([k, p]) => [k, sha(readFileSync(join(ROOT, p as string)))])),
  implementationDigest233, stabilizationDigest235,
  protectedCompositeIdentity: prot.compositeIdentity,
};

const design238 = {
  artifact: 'SECTION-238-FINAL-CONFIRMATION-DESIGN', version: DESIGN_238_VERSION,
  providerCalls: 0, databaseOperations: 0, executionAuthorized: false,
  hostedQuestion: HOSTED_QUESTION_238,
  whatItIsNot: WHAT_IT_IS_NOT_238,
  slots: SLOT_DESIGN_238,
  freshness: FRESHNESS_238,
  passRule: PASS_RULE_238,
  callPlan: CALL_PLAN_238,
  noFurtherExperimentLoop: NO_FURTHER_EXPERIMENT_LOOP_238,
  identity: designIdentity238(),
  casesAuthored: 0,
  whyNotAuthoredYet: 'the gate §233 used before §234 and §235 used before §236. The product owner '
    + 'approves the composition, the budget and the pass rule first.',
};

const docs: readonly (readonly [string, unknown])[] = [
  ['SECTION-237-IMPLEMENTATION.json', implementation],
  ['SECTION-237-CONTRACT-CONSISTENCY.json', consistencyDoc],
  ['SECTION-237-CONTRACT-IDENTITY.json', contractIdentity],
  ['SECTION-238-FINAL-CONFIRMATION-DESIGN.json', design238],
];
for (const [n, d] of docs) writeFileSync(join(OUT, n), JSON.stringify(d, null, 2) + '\n');

if (existsSync(join(OUT, 'SECTION-237-REPORT.md'))) {
  const files = readdirSync(OUT)
    .filter(f => f !== 'REPORT-237.sha256' && f !== 'EVIDENCE-PACKAGE-DIGEST-237.json'
      && statSync(join(OUT, f)).isFile()).sort();
  const lines = files.map(f => `${sha(readFileSync(join(OUT, f)))}  ${f}`);
  writeFileSync(join(OUT, 'REPORT-237.sha256'),
    '# path convention: BARE_FILENAME — verify with: cd <this directory> && '
    + 'shasum -a 256 -c REPORT-237.sha256\n'
    + '# contents: FROZEN EVIDENCE ONLY. No living document is listed here.\n'
    + lines.join('\n') + '\n');
  writeFileSync(join(OUT, 'EVIDENCE-PACKAGE-DIGEST-237.json'), JSON.stringify({
    artifact: 'EVIDENCE-PACKAGE-DIGEST-237', fileCount: files.length,
    evidencePackageDigest: sha(lines.join('\n')),
    files: lines.map(l => ({ sha256: l.split('  ')[0], file: l.split('  ')[1] })),
  }, null, 2) + '\n');
  console.log(`manifest written: ${files.length} files`);
}

console.log('§237 EVIDENCE WRITTEN — 0 provider calls, 0 database operations');
console.log(`  cessation deterministically derivable   ${CESSATION_DERIVABILITY_237.answer}`);
console.log(`  duplicate provider field                REMOVED (${CODES_RETIRED_FROM_235.length} codes retired)`);
console.log(`  §237 local suite                        ${r237.passed} passed, ${r237.failed} failed`);
console.log(`  §237 / §235 contract consistency        ${consistency237.passed}/${consistency237.total} · ${consistency235.passed}/${consistency235.total}`);
console.log(`  §235 / §233 suites                      ${r235.passed} / ${r233.passed} passed, 0 failed`);
console.log(`  protected ladder / typecheck            ${ladder.passed}/${ladder.suitesListed} · ${typecheck}`);
console.log(`  §233 / §235 digests unchanged           true / true`);
console.log(`  protected composite                     ${prot.compositeIdentity}`);
