/**
 * §233 LOCAL SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Proves the six §232 deterministic invariants directly, the fourteen §233 scenarios, the additive
 * reconstruction chain, and the two properties that make the remediation more than a new field:
 * that no prose is read for meaning, and that declaration-level action strings are no longer
 * independent authorities.
 *
 * It proves NOTHING about whether a model picks the right posture. That is hosted.
 */

import {
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_DEFINITIONS_233, POSTURE_DISTINCTIONS_233,
  POSTURE_PERMITS_CONTINUED_WORK, POSTURE_PROTECTIVE_RANK, POSTURE_FIELD,
  buildExpert233WireSchema, reconstruct210jWireSchema,
  build233SystemPrompt, reconstruct226SystemPrompt, contractIdentities233, analysisFormat233,
  FIRST_PASS_CONTRACT_233_VERSION,
} from './lib/expert-233-posture-contract';
import { buildExpert210jWireSchema } from './lib/expert-210j-first-pass-contract';
import { build226SystemPrompt } from './lib/expert-226-property-selection-capability';
import {
  projectPosture233, projectRecommendationState233, checkRecommendationNotLessProtective233,
  declarationActionAuthority233, POSTURE_REFUSAL_CODES_233, CODE_TO_INVARIANT_233,
  projectionIdentity233,
} from './lib/expert-233-posture-projection';
import { SCENARIOS_233, analysis, posture } from './lib/expert-233-posture-fixtures';
import { EXPERT_INPUT_CONTRACT_VERSION, type ExpertAnalysisInput }
  from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

let passed = 0; const failures: string[] = [];
function ok(name: string, cond: boolean, detail = ''): void {
  if (cond) { passed += 1; return; }
  failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
}
const codesOf = (a: unknown): string[] => [...projectPosture233(a).codes];
const admits = (a: unknown): boolean => projectPosture233(a).admitted;

const INPUT: ExpertAnalysisInput = {
  contractVersion: EXPERT_INPUT_CONTRACT_VERSION,
  analysisId: 'ANL-233-LOCAL',
  authoritativeSources: [{ sourceId: 'OBS-233', sourceType: 'observation',
    text: 'a local fixture observation used only to build a schema' }],
  inspectionContext: { location: 'local', task: 'schema construction' },
  jurisdiction: 'US',
  allowedHazardFamilies: ['machinery'],
  deterministicFindings: [], governedStandards: [], answeredClarifications: [],
};
const GOV = { governedEvidenceSourceIds: [] as string[] };

// ================================================================ A. contract and reconstruction

const base210j = buildExpert210jWireSchema(INPUT, GOV);
const s233 = buildExpert233WireSchema(INPUT, GOV);
ok('A1 exactly one root property added',
  Object.keys(s233.properties as object).length
    === Object.keys(base210j.properties as object).length + 1);
ok('A1 the added property is the posture',
  (s233.properties as Record<string, unknown>)[POSTURE_FIELD] !== undefined);
ok('A1 exactly one required entry added',
  (s233.required as string[]).length === (base210j.required as string[]).length + 1
  && (s233.required as string[]).includes(POSTURE_FIELD));
ok('A2 reconstruction reproduces the §210J schema byte for byte',
  JSON.stringify(reconstruct210jWireSchema(INPUT, GOV)) === JSON.stringify(base210j));
ok('A3 the prompt successor carries the posture block',
  build233SystemPrompt(0).includes('IMMEDIATE SAFETY POSTURE. One per analysis, always'));
for (const n of [0, 2]) {
  ok(`A4 reconstruction reproduces the §226 prompt byte for byte (governedCount=${n})`,
    reconstruct226SystemPrompt(build233SystemPrompt(n)) === build226SystemPrompt(n));
}
ok('A5 the §210J base is not mutated by building the successor',
  JSON.stringify(buildExpert210jWireSchema(INPUT, GOV)) === JSON.stringify(base210j));
ok('A5 building twice is stable',
  JSON.stringify(buildExpert233WireSchema(INPUT, GOV)) === JSON.stringify(s233));
ok('A6 four postures, the permissive one first',
  IMMEDIATE_SAFETY_POSTURES_233.length === 4 && IMMEDIATE_SAFETY_POSTURES_233[0] === 'CONTINUE');
ok('A7 every posture is defined, ranked and carries a continuation flag',
  IMMEDIATE_SAFETY_POSTURES_233.every(p =>
    typeof POSTURE_DEFINITIONS_233[p] === 'string' && POSTURE_DEFINITIONS_233[p].length > 40
    && typeof POSTURE_PERMITS_CONTINUED_WORK[p] === 'boolean'
    && typeof POSTURE_PROTECTIVE_RANK[p] === 'number'));
ok('A7 the three named collapses are carried as data', POSTURE_DISTINCTIONS_233.length === 3);
ok('A7 the enum reaches the model in the schema',
  JSON.stringify((s233.properties as Record<string, any>)[POSTURE_FIELD])
    .includes('HOLD_PENDING_VERIFICATION'));
/**
 * A7b THE WIRE SHAPE GUARD. The §210J schema that §231 transmitted thirty times contains zero
 * union types, so a nullable member here would be an unproven shape on a contract that cannot be
 * exercised without a provider call. The first draft of §233 introduced two and they were removed.
 */
{
  const strip = require('../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider');
  const asSent = strip.stripAnthropicUnsupportedKeywords(strip.applyStrictSchemaWrapper(
    buildExpert233WireSchema(INPUT, GOV)));
  let unions = 0;
  const walk = (n: unknown): void => {
    if (n === null || typeof n !== 'object') return;
    const o = n as Record<string, unknown>;
    if (Array.isArray(o.type)) unions += 1;
    for (const k of Object.keys(o)) walk(o[k]);
  };
  walk(asSent);
  ok('A7b the transmitted §233 schema introduces no union type', unions === 0,
    `${unions} union type(s) found`);
  ok('A7b the posture survives the strict wrapper and stays required',
    (asSent.properties as Record<string, unknown>)[POSTURE_FIELD] !== undefined
    && (asSent.required as string[]).includes(POSTURE_FIELD));
}

ok('A8 every refusal code maps to a §232 invariant',
  POSTURE_REFUSAL_CODES_233.every(c => CODE_TO_INVARIANT_233[c] !== undefined));
ok('A9 format detection is presence, never a guess',
  analysisFormat233({ [POSTURE_FIELD]: {} }) === 'SUCCESSOR_233'
  && analysisFormat233({}) === 'LEGACY_PRE_233');

// ================================================================ B. the fourteen scenarios

for (const s of SCENARIOS_233) {
  const r = projectPosture233(s.analysis);
  ok(`B ${s.id} ${s.name} -- admitted=${s.expectAdmitted}`, r.admitted === s.expectAdmitted,
    `got admitted=${r.admitted} codes=${r.codes.join(',')}`);
  for (const c of s.expectCodes) {
    ok(`B ${s.id} raises ${c}`, r.codes.includes(c as never), `got ${r.codes.join(',') || 'none'}`);
  }
  if (s.expectAdmitted) {
    ok(`B ${s.id} yields a recommendation state`, r.recommendationState !== null);
    ok(`B ${s.id} may be presented as a completed analysis`, r.mayPresentAsCompletedAnalysis);
  } else {
    ok(`B ${s.id} may NOT be presented as a completed analysis`, !r.mayPresentAsCompletedAnalysis);
    ok(`B ${s.id} preserves what was identified`, r.preserved !== null
      && r.preserved.recordKind === 'STRUCTURALLY_INVALID_POSTURE'
      && r.preserved.admissible === false && r.preserved.mayCloseTheAnalysis === false);
  }
}

// ================================================================ C. the six invariants, directly

// ---- P1
ok('P1 a missing posture is refused', codesOf(analysis({})).includes('POSTURE_MISSING'));
ok('P1 a non-object posture is refused',
  codesOf({ ...analysis({}), immediateSafetyPosture: 'STOP' }).includes('POSTURE_NOT_AN_OBJECT'));
ok('P1 an out-of-vocabulary posture is refused',
  codesOf(analysis({ posture: posture({ posture: 'PAUSE' }) })).includes('POSTURE_VALUE_INVALID'));
ok('P1 a blank narrative is refused',
  codesOf(analysis({ posture: posture({ posture: 'CONTINUE', whatHappensNow: '   ' }) }))
    .includes('POSTURE_NARRATIVE_MISSING'));
ok('P1 a filler narrative is refused',
  codesOf(analysis({ posture: posture({ posture: 'CONTINUE', whatHappensNow: 'TBD' }) }))
    .includes('POSTURE_NARRATIVE_PLACEHOLDER'));
ok('P1 a malformed basis item is refused',
  codesOf(analysis({ candidates: [{ candidateKey: 'k', assertedConditionState: 'CONTROLLED' }],
    posture: { ...posture({ posture: 'CONTINUE' }), requiredBy: [{ ref: 'k' }] } }))
    .includes('POSTURE_BASIS_ITEM_MALFORMED'));

// ---- P2
ok('P2 an unresolved candidate reference is refused',
  codesOf(analysis({ posture: posture({ posture: 'CONTINUE',
    requiredBy: [{ ref: 'ghost', refKind: 'HAZARD_CANDIDATE' }] }) }))
    .includes('POSTURE_BASIS_REF_UNRESOLVED'));
ok('P2 an unresolved declaration reference is refused',
  codesOf(analysis({ posture: posture({ posture: 'CONTINUE',
    requiredBy: [{ ref: 'ghost', refKind: 'UNRESOLVED_DECLARATION' }] }) }))
    .includes('POSTURE_BASIS_REF_UNRESOLVED'));
ok('P2 a reference in both lists is refused',
  codesOf(analysis({
    candidates: [{ candidateKey: 'k', assertedConditionState: 'ACTIVE' }],
    posture: posture({ posture: 'CONTINUE', requiredBy: [{ ref: 'k', refKind: 'HAZARD_CANDIDATE' }],
      accepted: [{ ref: 'k', refKind: 'HAZARD_CANDIDATE', reason: 'both at once' }] }),
  })).includes('POSTURE_BASIS_REF_DUPLICATED'));
ok('P2 an unresolved resume reference is refused',
  codesOf(analysis({ posture: posture({ posture: 'STOP',
    resume: { resolvedByDeclarationIds: ['ghost'], correctionsRequired: [] } }) }))
    .includes('RESUME_CONDITION_REF_UNRESOLVED'));

// ---- P3
ok('P3 an uncovered ACTIVE candidate is refused',
  codesOf(analysis({ candidates: [{ candidateKey: 'k', assertedConditionState: 'ACTIVE' }],
    posture: posture({ posture: 'CONTINUE' }) })).includes('ACTIVE_CANDIDATE_NOT_COVERED'));
ok('P3 an uncovered declaration is refused',
  codesOf(analysis({ declarations: [{ declarationId: 'UF1' }],
    posture: posture({ posture: 'CONTINUE' }) })).includes('DECLARATION_NOT_COVERED'));
ok('P3 a non-ACTIVE candidate forces nothing',
  admits(analysis({ candidates: [{ candidateKey: 'k', assertedConditionState: 'INSUFFICIENT_EVIDENCE' }],
    posture: posture({ posture: 'CONTINUE' }) })));
ok('P3 acceptance discharges coverage without forcing a restriction',
  admits(analysis({ candidates: [{ candidateKey: 'k', assertedConditionState: 'ACTIVE' }],
    posture: posture({ posture: 'CONTINUE',
      accepted: [{ ref: 'k', refKind: 'HAZARD_CANDIDATE', reason: 'real, present, nothing owed today' }] }) })));

// ---- P4
ok('P4 HOLD naming nothing that must become true is refused',
  codesOf(analysis({ posture: posture({ posture: 'HOLD_PENDING_VERIFICATION' }) }))
    .includes('RESUME_CONDITION_EMPTY'));
ok('P4 STOP with an empty resume condition is refused',
  codesOf(analysis({ posture: posture({ posture: 'STOP',
    resume: { resolvedByDeclarationIds: [], correctionsRequired: [] } }) }))
    .includes('RESUME_CONDITION_EMPTY'));
ok('P4 a malformed resume condition is refused',
  codesOf({ ...analysis({}), immediateSafetyPosture: {
    ...posture({ posture: 'STOP' }), resumeCondition: 'soon' } })
    .includes('POSTURE_RESUME_CONDITION_MALFORMED'));
ok('P4 STOP on an established hazard resumes on a correction alone',
  admits(analysis({ candidates: [{ candidateKey: 'k', assertedConditionState: 'ACTIVE' }],
    posture: posture({ posture: 'STOP', requiredBy: [{ ref: 'k', refKind: 'HAZARD_CANDIDATE' }],
      resume: { resolvedByDeclarationIds: [], correctionsRequired: ['refit the guard'] } }) })));
ok('P4 a permitting posture needs no resume condition',
  admits(analysis({ posture: posture({ posture: 'CONTINUE' }) })));

// ---- P5
const blocking = (p: string): unknown => analysis({
  declarations: [{ declarationId: 'UF1' }],
  clarifications: [{ clarificationId: 'CQ1', criticality: 'BLOCKING',
    answersUnresolvedFactDeclarationId: 'UF1' }],
  posture: posture({ posture: p, requiredBy: [{ ref: 'UF1', refKind: 'UNRESOLVED_DECLARATION' }],
    controls: p === 'CONTINUE_WITH_CONTROLS'
      ? [{ control: 'supervise the task', timing: 'DURING_CONTINUED_WORK' }] : [],
    resume: p === 'HOLD_PENDING_VERIFICATION' || p === 'STOP'
      ? { resolvedByDeclarationIds: ['UF1'], correctionsRequired: [] }
      : { resolvedByDeclarationIds: [], correctionsRequired: [] } }),
});
ok('P5 a BLOCKING clarification forbids CONTINUE',
  codesOf(blocking('CONTINUE')).includes('BLOCKING_CLARIFICATION_WITH_CONTINUE'));
ok('P5 a BLOCKING clarification permits CONTINUE_WITH_CONTROLS',
  admits(blocking('CONTINUE_WITH_CONTROLS')));
ok('P5 a BLOCKING clarification permits HOLD', admits(blocking('HOLD_PENDING_VERIFICATION')));
ok('P5 an unbound BLOCKING clarification does not fire the check',
  admits(analysis({ clarifications: [{ clarificationId: 'CQ1', criticality: 'BLOCKING' }],
    posture: posture({ posture: 'CONTINUE' }) })));

// ---- P6
ok('P6 CONTINUE_WITH_CONTROLS without controls is refused',
  codesOf(analysis({ posture: posture({ posture: 'CONTINUE_WITH_CONTROLS' }) }))
    .includes('CONTROLS_MISSING_FOR_CONTINUE_WITH_CONTROLS'));
ok('P6 controls under CONTINUE are refused',
  codesOf(analysis({ posture: posture({ posture: 'CONTINUE',
    controls: [{ control: 'x', timing: 'DURING_CONTINUED_WORK' }] }) }))
    .includes('CONTROLS_PRESENT_UNDER_CONTINUE'));
ok('P6 a concurrent control under STOP is refused',
  codesOf(analysis({ posture: posture({ posture: 'STOP',
    controls: [{ control: 'survey while running', timing: 'DURING_CONTINUED_WORK' }],
    resume: { resolvedByDeclarationIds: [], correctionsRequired: ['fix it'] } }) }))
    .includes('CONTROL_CONCURRENT_WITH_EXPOSURE_UNDER_NON_PERMITTING_POSTURE'));
ok('P6 a before-resume control under STOP is permitted',
  admits(analysis({ posture: posture({ posture: 'STOP',
    controls: [{ control: 'isolate before re-entry', timing: 'BEFORE_WORK_RESUMES' }],
    resume: { resolvedByDeclarationIds: [], correctionsRequired: ['fix it'] } }) })));

// ---- P6 monotonicity and completeness
const holdOk = projectPosture233(SCENARIOS_233.find(s => s.id === 'S3')!.analysis);
const authorised = holdOk.posture!;
const derived = holdOk.recommendationState!;
ok('P6 the derived state is not less protective than its own posture',
  checkRecommendationNotLessProtective233(derived, authorised).length === 0);
ok('P6 a non-permitting posture carries the protective sequence',
  derived.workMayContinue === false && (derived.protectiveSequence?.length ?? 0) === 4);
const weakened = { ...derived, posture: 'CONTINUE' as const, postureRank: 0,
  workMayContinue: true, operationalConsequenceRequired: false, protectiveSequence: null };
const wcodes = checkRecommendationNotLessProtective233(weakened, authorised);
ok('P6 a weakened recommendation is refused',
  wcodes.includes('RECOMMENDATION_LESS_PROTECTIVE_THAN_POSTURE')
  && wcodes.includes('RECOMMENDATION_CONTRADICTS_POSTURE')
  && wcodes.includes('RECOMMENDATION_OMITS_OPERATIONAL_CONSEQUENCE'));
ok('P6 dropping required controls is refused',
  checkRecommendationNotLessProtective233({ ...derived, requiredControls: [] },
    { ...authorised, requiredControls: [{ control: 'c', timing: 'BEFORE_WORK_RESUMES' }] })
    .includes('RECOMMENDATION_DROPS_REQUIRED_CONTROLS'));
ok('P6 dropping the resume condition is refused',
  checkRecommendationNotLessProtective233(
    { ...derived, resumeCondition: { resolvedByDeclarationIds: [], correctionsRequired: [] } },
    authorised).includes('RECOMMENDATION_DROPS_RESUME_CONDITION'));
for (const p of IMMEDIATE_SAFETY_POSTURES_233) {
  const st = projectRecommendationState233({ posture: p, requiredBy: [],
    acceptedWithoutImmediateAction: [], requiredControls: [],
    resumeCondition: { resolvedByDeclarationIds: [], correctionsRequired: [] },
    whatHappensNow: 'x' });
  ok(`P6 ${p} projects a consequence consistent with its own definition`,
    st.workMayContinue === POSTURE_PERMITS_CONTINUED_WORK[p]
    && st.operationalConsequenceRequired === !POSTURE_PERMITS_CONTINUED_WORK[p]
    && st.derivedFrom === 'AUTHORITATIVE_POSTURE' && st.proseParticipatedInDerivation === false);
}

// ================================================================ D. subordination and no prose

const auth = declarationActionAuthority233();
ok('D1 a declaration action string is not an authoritative work posture',
  auth.isAuthoritativeWorkPosture === false && auth.mayContradictTheAnalysisPosture === false
  && auth.survivesForCompatibility === true && auth.carriedVerbatim === true
  && auth.repairedOrRewritten === false && auth.theSingleAuthorityIs === POSTURE_FIELD);
const s6 = projectPosture233(SCENARIOS_233.find(s => s.id === 'S6')!.analysis);
ok('D2 every declaration is marked advisory and bound to the single posture',
  s6.declarationSubordination.length === 2
  && s6.declarationSubordination.every(x => x.authority === 'ADVISORY_NOT_AUTHORITATIVE'
    && x.mayContradictAuthoritativePosture === false
    && x.authoritativePostureIs === 'HOLD_PENDING_VERIFICATION'));
ok('D2 the contradictory legacy strings survive verbatim and decide nothing',
  s6.declarationSubordination.some(x => x.decisionWhileUnresolved === 'continue running with heightened caution')
  && s6.admitted && s6.recommendationState!.workMayContinue === false);

// D3 the direct proof of invariant 3: prose changes do not move admission
const proseSensitive: string[] = [];
for (const s of SCENARIOS_233) {
  const before = projectPosture233(s.analysis);
  const mutated = JSON.parse(JSON.stringify(s.analysis)) as Record<string, any>;
  const p = mutated[POSTURE_FIELD];
  if (p !== undefined && p !== null && typeof p === 'object') {
    if (typeof p.whatHappensNow === 'string' && p.whatHappensNow !== 'N/A') {
      p.whatHappensNow = 'zzz arbitrary replacement text carrying no stop or continue vocabulary';
    }
    if (Array.isArray(p.requiredControls)) {
      p.requiredControls = p.requiredControls.map((x: any) => ({ ...x, control: 'zzz arbitrary' }));
    }
    if (Array.isArray(p.acceptedWithoutImmediateAction)) {
      p.acceptedWithoutImmediateAction =
        p.acceptedWithoutImmediateAction.map((x: any) => ({ ...x, reason: 'zzz arbitrary' }));
    }
    if (p.resumeCondition !== null && typeof p.resumeCondition === 'object'
      && Array.isArray(p.resumeCondition.correctionsRequired)) {
      p.resumeCondition = { ...p.resumeCondition,
        correctionsRequired: p.resumeCondition.correctionsRequired.map(() => 'zzz arbitrary') };
    }
  }
  for (const d of (mutated.unresolvedFactDeclarations ?? [])) {
    if (typeof d.decisionWhileUnresolved === 'string') d.decisionWhileUnresolved = 'zzz arbitrary';
  }
  const after = projectPosture233(mutated);
  if (before.admitted !== after.admitted
    || JSON.stringify(before.codes) !== JSON.stringify(after.codes)) proseSensitive.push(s.id);
}
ok('D3 replacing every prose field changes no admission and no code',
  proseSensitive.length === 0, `prose-sensitive scenarios: ${proseSensitive.join(',')}`);
ok('D3 the projection declares that it reads no prose for meaning',
  projectionIdentity233().readsProseForMeaning === false
  && projectionIdentity233().derivesPostureFromAnything === false);

// ================================================================ E. restraint guard

ok('E1 STOP is fully expressible with zero declarations',
  admits(SCENARIOS_233.find(s => s.id === 'S10')!.analysis)
  && (SCENARIOS_233.find(s => s.id === 'S10')!.analysis.unresolvedFactDeclarations.length === 0));
ok('E2 an ACTIVE candidate can be accepted without action under CONTINUE',
  admits(analysis({ candidates: [{ candidateKey: 'thermal', assertedConditionState: 'ACTIVE' }],
    posture: posture({ posture: 'CONTINUE',
      accepted: [{ ref: 'thermal', refKind: 'HAZARD_CANDIDATE',
        reason: 'inherent to the machine and adequately controlled on the facts stated' }] }) })));
ok('E3 nothing active and nothing owed forces no basis at all',
  admits(analysis({ posture: posture({ posture: 'CONTINUE' }) })));
const forcedStops = SCENARIOS_233.filter(s => {
  const r = projectPosture233(s.analysis);
  return !r.admitted && r.codes.some(c => c === 'ACTIVE_CANDIDATE_NOT_COVERED')
    && s.analysis.expertHazardCandidates.every(x => x.assertedConditionState !== 'ACTIVE');
});
ok('E4 no refusal demands a posture where no candidate is active', forcedStops.length === 0);

// ================================================================ report

const identity = { ...contractIdentities233(), ...projectionIdentity233() };
console.log('§233 IMMEDIATE SAFETY POSTURE — LOCAL SUITE');
console.log(`contract ${FIRST_PASS_CONTRACT_233_VERSION}`);
console.log('PROVIDER CALLS 0 · DATABASE OPERATIONS 0\n');
for (const f of failures) console.log(`  FAIL  ${f}`);
console.log(`\n${passed} passed, ${failures.length} failed`);
console.log(`system prompt (no governed) ${String(identity.systemPromptNoGoverned).slice(0, 16)}…`);
console.log(`schema property              ${String(identity.schemaProperty).slice(0, 16)}…`);
console.log('\nNo semantic posture-degree claim is made or implied. That requires a hosted run.');
if (failures.length > 0) process.exit(1);
