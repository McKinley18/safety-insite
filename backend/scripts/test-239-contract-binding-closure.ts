/**
 * §239 LOCAL SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The twelve local proofs the §239 authorization enumerates, on GENERALIZED fixtures rather than on
 * the §238 observations, plus the regression that matters most: §239 must reproduce §237 exactly on
 * every §237 scenario, because a widening that changes anything else is not a widening.
 */
import { deepStrictEqual } from 'assert';

import { governedBindingFor } from './lib/expert-first-pass-instruction-vnext';
import {
  EXPERT_CONDITION_STATES,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { L3_UNDECIDED_STATES } from '../src/hazlenz/reasoning-l3/reasoning-contract.types';
import { POSTURE_REF_KINDS_233, POSTURE_PERMITS_CONTINUED_WORK, IMMEDIATE_SAFETY_POSTURES_233 }
  from './lib/expert-233-posture-contract';
import {
  build237SystemPrompt, build237PostureSchemaProperty, buildExpert237WireSchema,
  DRIVER_BLOCK_LINES_237, PROVIDER_VISIBLE_RULES_237, POSTURE_DRIVER_ROLES_237,
  DRIVER_ROLE_REF_KIND_237, CESSATION_ROLE_237, DECISION_CONTROLLING_ROLES_237,
} from './lib/expert-237-posture-contract';
import { projectPosture237, POSTURE_REFUSAL_CODES_237 } from './lib/expert-237-posture-projection';
import { runContractConsistency237 } from './lib/expert-237-contract-consistency';
import { SCENARIOS_237, fixtureSchema237 } from './lib/expert-237-posture-fixtures';
import {
  build239SystemPrompt, build239PostureSchemaProperty, buildExpert239WireSchema,
  reconstruct237SystemPrompt, reconstruct237DriverBlock, reconstruct237PostureSchemaProperty,
  reconstruct237WireSchema, contractIdentities239, assertWidensSection237Binding,
  DRIVER_BLOCK_LINES_239, PROVIDER_VISIBLE_RULES_239, POSTURE_DRIVER_ROLES_239,
  DRIVER_ROLE_REF_KINDS_239, CANDIDATE_STATE_REQUIREMENT_239, BINDINGS_BROADENED_239,
  RESIDUAL_NARROWNESS_239, UNRESOLVED_CANDIDATE_STATES_239, SETTLED_CANDIDATE_STATES_239,
  RULES_RETAINED_FROM_237, RULE_REPLACED_FROM_237, REPLACEMENT_BINDING_RULE_239,
  CANDIDATE_STATE_RULE_239, POSTURE_SUBFIELDS_239, BASIS_ENTRY_SUBFIELDS_239,
} from './lib/expert-239-posture-contract';
import {
  projectPosture239, deriveCessationDrivers239, deriveControllingDrivers239,
  projectionIdentity239, POSTURE_REFUSAL_CODES_239, CODES_ADDED_BY_239, CODES_RETIRED_FROM_237,
  BEHAVIOUR_CHANGED_FROM_237,
} from './lib/expert-239-posture-projection';
import {
  runContractConsistency239, RULE_REGISTRY_239_BASE, consistencyIdentity239,
  INHERITED_CITATION_OVERRIDES_239, ANALYSIS_FIELDS_READ_BY_PROJECTION_239,
} from './lib/expert-239-contract-consistency';
import {
  SCENARIOS_239, fixtureSchema239, FIXTURE_INPUT_239, analysis237, posture237, candidate,
  declaration, can, dec, raw, candidateWithoutState,
} from './lib/expert-239-posture-fixtures';

let passed = 0; const failures: string[] = [];
const ok = (name: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; return; }
  failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
};
const eq = (name: string, a: unknown, b: unknown): void => {
  try { deepStrictEqual(a, b); passed += 1; } catch {
    failures.push(`${name} -- ${JSON.stringify(a)?.slice(0, 180)} != ${JSON.stringify(b)?.slice(0, 180)}`);
  }
};
const setEq = (a: readonly string[], b: readonly string[]): boolean =>
  JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());

const SCHEMA = fixtureSchema239();
const BINDING = governedBindingFor([]);
const byId = (id: string) => SCENARIOS_239.find(s => s.id === id)!;
const run = (id: string) => projectPosture239(byId(id).payload, SCHEMA);

console.log('§239 UNRESOLVED DRIVER BINDING CLOSURE — LOCAL SUITE');
console.log('0 provider calls · 0 database operations\n');

// ================================================================ the twelve authorized proofs

{
  // ---- 1 and 2. An UNKNOWN or INSUFFICIENT_EVIDENCE candidate may control continuation.
  for (const [id, state] of [['U1', 'UNKNOWN'], ['U2', 'INSUFFICIENT_EVIDENCE']] as const) {
    const r = run(id);
    ok(`1/2 ${id} a ${state} candidate is admitted as a controlling driver`, r.admitted,
      r.codes.join(','));
    ok(`1/2 ${id} the controlling driver is derived, not authored`,
      r.derivedControllingDrivers.length === 1
      && r.derivedControllingDrivers[0].refKind === 'HAZARD_CANDIDATE');
    ok(`1/2 ${id} §237 refused this same output`,
      !projectPosture237(byId(id).payload, fixtureSchema237()).admitted
      && projectPosture237(byId(id).payload, fixtureSchema237()).codes
        .includes('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'));
  }
  // the whole governed unresolved vocabulary, not only the two states a fixture happens to use
  for (const state of UNRESOLVED_CANDIDATE_STATES_239) {
    const payload = analysis237({
      candidates: [candidate('sweep-candidate', state)],
      posture: posture237({ posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [can('sweep-candidate', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['establish it'] } }),
    });
    ok(`1/2 sweep ${state} is admitted`, projectPosture239(payload, SCHEMA).admitted);
  }

  // ---- 3. A declaration is still a valid controlling driver.
  ok('3 an unresolved declaration still controls continuation', run('U3').admitted,
    run('U3').codes.join(','));
  eq('3 §237 and §239 agree on the declaration carrier',
    projectPosture237(byId('U3').payload, fixtureSchema237()).admitted, run('U3').admitted);

  // ---- 4. ACTIVE candidate plus an unresolved role is refused.
  for (const id of ['X1', 'X2', 'X3']) {
    const r = run(id);
    ok(`4 ${id} refused`, !r.admitted);
    ok(`4 ${id} refused for the contradiction, under its own code`,
      r.codes.includes('UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE'), r.codes.join(','));
    ok(`4 ${id} fails closed and preserves`, !r.mayPresentAsCompletedAnalysis && r.posture === null
      && r.preserved !== null && r.preserved.admissible === false
      && r.preserved.requiresUpstreamRepair === true);
  }
  // the contradiction refuses on EVERY settled state, not only the one §238 produced
  for (const state of SETTLED_CANDIDATE_STATES_239) {
    const payload = analysis237({
      candidates: [candidate('settled-sweep', state)],
      posture: posture237({ posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [can('settled-sweep', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] } }),
    });
    const r = projectPosture239(payload, SCHEMA);
    ok(`4 sweep ${state} + controlling role is refused`, !r.admitted
      && r.codes.includes('UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE'));
  }
  // and the refusal is a REFUSAL, never a repair
  {
    const r = run('X1');
    ok('4 the contradictory state is not reinterpreted', r.posture === null);
    ok('4 no declaration is manufactured on the model\'s behalf',
      r.declarationSubordination.length === 0);
    const present = r.preserved?.presentFields as Record<string, any>;
    ok('4 the model\'s own fields are preserved verbatim',
      Array.isArray(present?.requiredBy) && present.requiredBy[0].driverRole
        === 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION');
  }

  // a repeated candidateKey cannot smuggle the contradiction past the state condition
  {
    const payload = analysis237({
      candidates: [candidate('duplicate-key', 'UNKNOWN'), candidate('duplicate-key', 'ACTIVE')],
      posture: posture237({ posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [can('duplicate-key', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] } }),
    });
    const r = projectPosture239(payload, SCHEMA);
    ok('4 a duplicated candidate key carrying two states is refused', !r.admitted
      && r.codes.includes('UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE'),
      r.codes.join(','));
  }

  // ---- 5. Established cessation behaviour is unchanged.
  {
    const r = run('S1');
    ok('5 an established cessation candidate under STOP is admitted', r.admitted, r.codes.join(','));
    eq('5 the derived set is exactly the filter', [...r.derivedCessationDrivers],
      [...deriveCessationDrivers239({ requiredBy: r.posture!.requiredBy })]);
    ok('5 the filter is one enum member',
      r.derivedCessationDrivers.every(d => d.driverRole === CESSATION_ROLE_237));
  }

  // ---- 6. The STOP floor is unchanged, in both directions.
  ok('6 a cessation driver under a less protective posture is refused',
    !run('S2').admitted && run('S2').codes
      .includes('ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE'));
  ok('6 a STOP whose only drivers require controls is refused',
    !run('S3').admitted && run('S3').codes
      .includes('NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'));
  // the floor sweep: a cessation driver admits at STOP and refuses everywhere else
  for (const p of IMMEDIATE_SAFETY_POSTURES_233) {
    const payload = analysis237({
      candidates: [candidate('floor-sweep')],
      posture: posture237({ posture: p,
        requiredBy: [can('floor-sweep', 'ESTABLISHED_CONDITION_REQUIRING_CESSATION')],
        controls: p === 'CONTINUE_WITH_CONTROLS'
          ? [{ control: 'a control', timing: 'DURING_CONTINUED_WORK' }] : [],
        resume: POSTURE_PERMITS_CONTINUED_WORK[p]
          ? { resolvedByDeclarationIds: [], correctionsRequired: [] }
          : { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] } }),
    });
    const r = projectPosture239(payload, SCHEMA);
    ok(`6 floor sweep ${p}`, r.admitted === (p === 'STOP'), r.codes.join(','));
  }

  // ---- 7. A legitimate hold remains valid.
  {
    const r = run('H1');
    ok('7 a legitimate hold with a mixed basis is admitted', r.admitted, r.codes.join(','));
    ok('7 the hold carries its follow-up declaration without escalating on it',
      r.posture!.requiredBy.some(d => d.driverRole === 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')
      && r.derivedControllingDrivers.length === 1);
  }

  // ---- 8. Response uncertainty cannot become controlling through role assignment.
  ok('8 a hold driven only by a follow-up question is refused',
    !run('R1').admitted && run('R1').codes
      .includes('NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'));
  ok('8 the response role does not become controlling by moving onto a candidate',
    !run('R2').admitted && run('R2').codes.includes('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'));
  ok('8 the response role is not in the decision-controlling set',
    !DECISION_CONTROLLING_ROLES_237.includes('UNRESOLVED_RESPONSE_OR_FOLLOW_UP'));
  // the same shape as R1 but carried on an undecided candidate: still refused, because the ROLE
  // decides and the carrier does not
  {
    const payload = analysis237({
      candidates: [candidate('carrier-test', 'UNKNOWN'), candidate('carrier-active')],
      posture: posture237({ posture: 'HOLD_PENDING_VERIFICATION',
        requiredBy: [raw('carrier-test', 'HAZARD_CANDIDATE', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP'),
          can('carrier-active', 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS')],
        resume: { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] } }),
    });
    const r = projectPosture239(payload, SCHEMA);
    ok('8 an undecided candidate cannot carry the response role into a hold', !r.admitted
      && r.codes.includes('DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND'));
  }
  ok('8 the limit is stated rather than claimed closed', run('R3').admitted);

  // ---- 9 and 12. A permissive posture with a false resume prerequisite is refused.
  for (const id of ['P1', 'P2']) {
    const r = run(id);
    ok(`9/12 ${id} refused`, !r.admitted
      && r.codes.includes('RESUME_CONDITION_UNDER_PERMITTING_POSTURE'), r.codes.join(','));
  }
  // both resume lists, both permitting postures, generalized
  for (const p of IMMEDIATE_SAFETY_POSTURES_233.filter(x => POSTURE_PERMITS_CONTINUED_WORK[x])) {
    for (const shape of ['corrections', 'declarations'] as const) {
      const payload = analysis237({
        candidates: [candidate('resume-sweep')],
        declarations: [declaration('decl-resume-sweep')],
        posture: posture237({ posture: p,
          requiredBy: [can('resume-sweep', 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS'),
            dec('decl-resume-sweep', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')],
          controls: p === 'CONTINUE_WITH_CONTROLS'
            ? [{ control: 'a control', timing: 'DURING_CONTINUED_WORK' }] : [],
          resume: shape === 'corrections'
            ? { resolvedByDeclarationIds: [], correctionsRequired: ['fit the missing part'] }
            : { resolvedByDeclarationIds: ['decl-resume-sweep'], correctionsRequired: [] } }),
      });
      const r = projectPosture239(payload, SCHEMA);
      ok(`9/12 resume sweep ${p} ${shape} refused`, !r.admitted
        && r.codes.includes('RESUME_CONDITION_UNDER_PERMITTING_POSTURE'), r.codes.join(','));
    }
  }

  // ---- 10 and 11. The generalized B1 and B2 shapes.
  {
    const r = run('U4');
    ok('10 the generalized B1 representation is admitted', r.admitted, r.codes.join(','));
    ok('10 one property stated on both carriers is not a duplicate refusal',
      r.derivedControllingDrivers.length === 3
      && new Set(r.derivedControllingDrivers.map(d => d.refKind)).size === 2);
    const x = run('X2');
    ok('11 the generalized B2 contradiction is refused', !x.admitted
      && x.codes.includes('UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE'));
    ok('11 a coherent driver in the same output does not rescue a contradictory one', !x.admitted);
  }
}

// ================================================================ the widening is a widening

{
  assertWidensSection237Binding(); passed += 1;
  ok('W.1 no role, reference kind, posture or field is added',
    POSTURE_DRIVER_ROLES_239.length === POSTURE_DRIVER_ROLES_237.length
    && setEq([...POSTURE_DRIVER_ROLES_239], [...POSTURE_DRIVER_ROLES_237])
    && setEq([...POSTURE_SUBFIELDS_239], ['posture', 'requiredBy',
      'acceptedWithoutImmediateAction', 'requiredControls', 'resumeCondition', 'whatHappensNow'])
    && setEq([...BASIS_ENTRY_SUBFIELDS_239], ['ref', 'refKind', 'driverRole']));
  ok('W.2 every §237 binding survives as the first member of its §239 set',
    POSTURE_DRIVER_ROLES_239.every(r =>
      DRIVER_ROLE_REF_KINDS_239[r][0] === DRIVER_ROLE_REF_KIND_237[r]));
  ok('W.3 exactly one role was broadened, and it is declared',
    BINDINGS_BROADENED_239.length === 1
    && BINDINGS_BROADENED_239[0].role === 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'
    && POSTURE_DRIVER_ROLES_239.filter(r => DRIVER_ROLE_REF_KINDS_239[r].length > 1).length === 1);
  ok('W.4 the residual narrowness is declared rather than silent',
    RESIDUAL_NARROWNESS_239.role === 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP'
    && DRIVER_ROLE_REF_KINDS_239.UNRESOLVED_RESPONSE_OR_FOLLOW_UP.length === 1
    && RESIDUAL_NARROWNESS_239.whyNotBroadened.length > 200);
  ok('W.5 the unresolved states are selected from the governed vocabulary, not invented',
    UNRESOLVED_CANDIDATE_STATES_239.every(s => EXPERT_CONDITION_STATES.includes(s))
    && UNRESOLVED_CANDIDATE_STATES_239.length === 2
    && setEq([...UNRESOLVED_CANDIDATE_STATES_239], [...L3_UNDECIDED_STATES]));
  ok('W.6 the unresolved and settled sets partition the vocabulary',
    UNRESOLVED_CANDIDATE_STATES_239.length + SETTLED_CANDIDATE_STATES_239.length
      === EXPERT_CONDITION_STATES.length
    && SETTLED_CANDIDATE_STATES_239.every(s => !UNRESOLVED_CANDIDATE_STATES_239.includes(s)));
  ok('W.7 the state condition applies to exactly the broadened role',
    Object.keys(CANDIDATE_STATE_REQUIREMENT_239).length === 1
    && CANDIDATE_STATE_REQUIREMENT_239.UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION
      === UNRESOLVED_CANDIDATE_STATES_239);
  ok('W.8 §239 retires no code and adds exactly one',
    CODES_RETIRED_FROM_237.length === 0 && CODES_ADDED_BY_239.length === 1
    && POSTURE_REFUSAL_CODES_239.length === POSTURE_REFUSAL_CODES_237.length + 1
    && POSTURE_REFUSAL_CODES_237.every(c => (POSTURE_REFUSAL_CODES_239 as readonly string[])
      .includes(c)));
  ok('W.9 §239 refuses nothing §237 admitted', BEHAVIOUR_CHANGED_FROM_237
    .refusesNothingSection237Admitted === true);
  ok('W.10 the rule set gains one rule and replaces one',
    PROVIDER_VISIBLE_RULES_239.length === PROVIDER_VISIBLE_RULES_237.length + 1
    && RULES_RETAINED_FROM_237.every(r => PROVIDER_VISIBLE_RULES_239.includes(r))
    && !PROVIDER_VISIBLE_RULES_239.includes(RULE_REPLACED_FROM_237)
    && PROVIDER_VISIBLE_RULES_239.includes(REPLACEMENT_BINDING_RULE_239)
    && PROVIDER_VISIBLE_RULES_239.includes(CANDIDATE_STATE_RULE_239));
  ok('W.11 the reference kinds are the §233 kinds',
    POSTURE_DRIVER_ROLES_239.every(r => DRIVER_ROLE_REF_KINDS_239[r]
      .every(k => POSTURE_REF_KINDS_233.includes(k))));
}

// ================================================================ reconstruction back to §237

{
  eq('R.1 the driver block reduces to §237 exactly',
    reconstruct237DriverBlock(DRIVER_BLOCK_LINES_239), [...DRIVER_BLOCK_LINES_237]);
  ok('R.2 the system prompt reduces to §237 byte for byte',
    reconstruct237SystemPrompt(build239SystemPrompt(0)) === build237SystemPrompt(0)
    && reconstruct237SystemPrompt(build239SystemPrompt(2)) === build237SystemPrompt(2));
  eq('R.3 the posture schema property reduces to §237 exactly',
    reconstruct237PostureSchemaProperty(build239PostureSchemaProperty()),
    build237PostureSchemaProperty());
  eq('R.4 the wire schema reduces to §237 exactly',
    reconstruct237WireSchema(FIXTURE_INPUT_239, BINDING),
    JSON.parse(JSON.stringify(buildExpert237WireSchema(FIXTURE_INPUT_239, BINDING))));
  const s237 = buildExpert237WireSchema(FIXTURE_INPUT_239, BINDING) as Record<string, any>;
  const s239 = buildExpert239WireSchema(FIXTURE_INPUT_239, BINDING) as Record<string, any>;
  ok('R.5 no root property and no posture sub-property is added',
    Object.keys(s239.properties).length === Object.keys(s237.properties).length
    && Object.keys(s239.properties.immediateSafetyPosture.properties).length
      === Object.keys(s237.properties.immediateSafetyPosture.properties).length);
  ok('R.6 the only schema change is the driverRole description',
    JSON.stringify(s239.properties.immediateSafetyPosture.properties.requiredBy.items.properties
      .driverRole.enum)
      === JSON.stringify(s237.properties.immediateSafetyPosture.properties.requiredBy.items
        .properties.driverRole.enum));
  ok('R.7 the prompt grows only by the carrier paragraph and the rule change',
    build239SystemPrompt(0).length > build237SystemPrompt(0).length
    && build239SystemPrompt(0).includes(DRIVER_BLOCK_LINES_239.join('\n')));
}

// ================================================================ contract consistency

{
  const c = runContractConsistency239();
  ok('C.0 every §239 consistency check passes', c.allPassed,
    c.checks.filter(x => !x.passed).map(x => `${x.id}: ${x.detail.join('; ')}`).join(' | '));
  ok('C.0b nine checks ran', c.total === 9);
  const c237 = runContractConsistency237();
  ok('C.0c the §237 consistency check is still green', c237.allPassed);

  // THE CHECKS HAVE TEETH. Break each direction and assert the right check fails.
  const dropped = RULE_REGISTRY_239_BASE
    .filter(e => e.code !== 'UNRESOLVED_DRIVER_ROLE_CONTRADICTS_CANDIDATE_STATE');
  ok('C.1 removing a registry entry fails C1',
    runContractConsistency239({ registry: dropped }).checks.find(x => x.id === 'C1')!.passed
      === false);
  ok('C.3 transmitting an uncited rule fails C3',
    runContractConsistency239({
      providerVisibleRules: [...PROVIDER_VISIBLE_RULES_239, 'RULE. An uncited invention.'],
    }).checks.find(x => x.id === 'C3')!.passed === false);
  ok('C.8 admitting a kind the instruction never offers fails C8',
    runContractConsistency239({
      refKinds: { ...DRIVER_ROLE_REF_KINDS_239,
        UNRESOLVED_RESPONSE_OR_FOLLOW_UP: ['UNRESOLVED_DECLARATION', 'HAZARD_CANDIDATE'] },
    }).checks.find(x => x.id === 'C8')!.passed === false);
  ok('C.8b narrowing a broadened role below its declaration fails C8',
    runContractConsistency239({
      refKinds: { ...DRIVER_ROLE_REF_KINDS_239,
        UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION: ['UNRESOLVED_DECLARATION'] },
    }).checks.find(x => x.id === 'C8')!.passed === false);

  ok('C.2 the citation restated for the widened rule is the one entry that moved',
    Object.keys(INHERITED_CITATION_OVERRIDES_239).length === 1
    && Object.keys(INHERITED_CITATION_OVERRIDES_239)[0]
      === 'DRIVER_ROLE_INCOMPATIBLE_WITH_REF_KIND');
  ok('C.4 the one analysis field outside the posture object is declared',
    ANALYSIS_FIELDS_READ_BY_PROJECTION_239.length === 2
    && ANALYSIS_FIELDS_READ_BY_PROJECTION_239
      .some(f => f.path === 'expertHazardCandidates[].assertedConditionState'));
}

// ================================================================ §237 regression, exactly

{
  const S237 = fixtureSchema237();
  for (const s of SCENARIOS_237) {
    const a = projectPosture237(s.payload, S237);
    const b = projectPosture239(s.payload, SCHEMA);
    ok(`G.1 ${s.id} admission unchanged`, a.admitted === b.admitted,
      `${a.codes.join(',')} vs ${b.codes.join(',')}`);
    ok(`G.2 ${s.id} code set unchanged`, setEq(a.codes, b.codes),
      `${a.codes.join(',')} vs ${b.codes.join(',')}`);
    eq(`G.3 ${s.id} derived cessation set unchanged`,
      [...a.derivedCessationDrivers], [...b.derivedCessationDrivers]);
    eq(`G.4 ${s.id} §233 codes unchanged`, [...a.codes233], [...b.codes233]);
    if (a.admitted && b.admitted) {
      eq(`G.5 ${s.id} the projected posture is identical`, a.posture, b.posture);
      eq(`G.6 ${s.id} the recommendation state is identical`,
        a.recommendationState, b.recommendationState);
    }
  }
  ok('G.7 the §237 scenario set was actually exercised', SCENARIOS_237.length >= 20);
}

// ================================================================ prose independence

{
  const PROSE_KEYS = new Set(['reasoning', 'evidenceBasis', 'whatHappensNow', 'reason', 'control',
    'missingFact', 'notEstablishedBecause', 'branchA', 'branchB', 'decisionIfA', 'decisionIfB',
    'decisionWhileUnresolved', 'whyNecessaryNow', 'question', 'whyItMatters', 'evidenceGap',
    'observationSpan', 'summary', 'quotedText', 'correctionRequired', 'affectedDecision']);
  const ARB = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor';
  const scrub = (v: unknown, key?: string): unknown => {
    if (Array.isArray(v)) return v.map(x => scrub(x, key));
    if (typeof v === 'object' && v !== null) {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>)
        .map(([k, x]) => [k, scrub(x, k)]));
    }
    if (typeof v === 'string' && key !== undefined && PROSE_KEYS.has(key)) return ARB;
    return v;
  };
  for (const s of SCENARIOS_239) {
    const before = projectPosture239(s.payload, SCHEMA);
    const after = projectPosture239(scrub(s.payload), SCHEMA);
    ok(`P.1 ${s.id} admission does not depend on prose`, before.admitted === after.admitted);
    ok(`P.2 ${s.id} codes do not depend on prose`, setEq(before.codes, after.codes));
  }
  // and the state condition is a label comparison, not a reading: the same analysis with the
  // candidate's reasoning rewritten to assert the opposite still admits or refuses identically
  const flipped = JSON.parse(JSON.stringify(byId('X1').payload)) as Record<string, any>;
  flipped.expertHazardCandidates[0].reasoning =
    'nobody can tell whether this is so; it is entirely unresolved and unknown';
  ok('P.3 prose cannot rescue a contradictory state',
    !projectPosture239(flipped, SCHEMA).admitted);
}

// ================================================================ all scenarios

for (const s of SCENARIOS_239) {
  const r = projectPosture239(s.payload, SCHEMA);
  ok(`S.1 ${s.id} admitted=${String(s.expectAdmitted)}`, r.admitted === s.expectAdmitted,
    `codes ${r.codes.join(',')}`);
  for (const c of s.expectCodes) {
    ok(`S.2 ${s.id} refuses on ${c}`, r.codes.includes(c), `got ${r.codes.join(',')}`);
  }
  if (s.expectAdmitted) {
    ok(`S.3 ${s.id} admitted with no codes`, r.codes.length === 0, r.codes.join(','));
    if (s.expectDerivedCessationCount !== undefined) {
      ok(`S.4 ${s.id} derived cessation count`,
        r.derivedCessationDrivers.length === s.expectDerivedCessationCount);
    }
    if (s.expectDerivedControllingCount !== undefined) {
      ok(`S.5 ${s.id} derived controlling count`,
        r.derivedControllingDrivers.length === s.expectDerivedControllingCount,
        `${r.derivedControllingDrivers.length}`);
    }
    eq(`S.6 ${s.id} the controlling set is exactly the filter`,
      [...r.derivedControllingDrivers],
      [...deriveControllingDrivers239({ requiredBy: r.posture!.requiredBy })]);
  } else {
    ok(`S.7 ${s.id} fails closed with preservation`, !r.mayPresentAsCompletedAnalysis
      && r.posture === null && r.preserved !== null && r.preserved.admissible === false);
  }
}

// ================================================================ every proof is discharged

{
  const discharged = new Set(SCENARIOS_239.flatMap(s => s.proves));
  for (let i = 1; i <= 12; i += 1) {
    ok(`A.${i} local proof ${i} has at least one fixture`, discharged.has(i));
  }
  ok('A.13 no scenario reuses a §238 subject', SCENARIOS_239.every(s => {
    const j = JSON.stringify(s.payload).toLowerCase();
    return !j.includes('blade') && !j.includes('lift') && !j.includes('oxygen')
      && !j.includes('hopper') && !j.includes('kiln') && !j.includes('spray');
  }));
}

// ================================================================ result

console.log(`${passed} passed, ${failures.length} failed`);
for (const f of failures) console.log(`  FAIL  ${f}`);
console.log('');
console.log(`contract     ${String(contractIdentities239().systemPromptNoGoverned).slice(0, 16)}…`);
console.log(`consistency  ${String(consistencyIdentity239().registryDigest).slice(0, 16)}…`);
console.log(`projection   ${String(projectionIdentity239().projectionVersion)}`);
console.log('');
console.log('This file proves a DETERMINISTIC ADMISSION RULE, and nothing else. §238 already showed');
console.log('that a provider produces the B1 representation; §239 shows that the contract now');
console.log('admits it and still refuses the B2 and C1 contradictions. No semantic claim is made');
console.log('here and none may be read from it.');
if (failures.length > 0) process.exitCode = 1;
