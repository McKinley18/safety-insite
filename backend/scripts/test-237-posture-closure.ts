/**
 * §237 LOCAL SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The fourteen local validation items the §237 authorization enumerates, plus the regression that
 * matters most: §233 must behave exactly as it did, because the frozen §234 and §236 evidence both
 * depend on it.
 */
import { deepStrictEqual } from 'assert';

import { governedBindingFor } from './lib/expert-first-pass-instruction-vnext';
import {
  build233SystemPrompt, buildExpert233WireSchema, POSTURE_SCHEMA_PROPERTY_233,
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_FIELD, POSTURE_PERMITS_CONTINUED_WORK,
} from './lib/expert-233-posture-contract';
import { projectPosture233 } from './lib/expert-233-posture-projection';
import { SCENARIOS_233 } from './lib/expert-233-posture-fixtures';
import { runContractConsistency235 } from './lib/expert-235-contract-consistency';
import { SCENARIOS_235, fixtureSchema235 } from './lib/expert-235-posture-fixtures';
import {
  build237SystemPrompt, buildExpert237WireSchema, build237PostureSchemaProperty,
  reconstruct233SystemPrompt, reconstruct233PostureSchemaProperty, reconstruct233WireSchema,
  contractIdentities237, CESSATION_DERIVABILITY_237, POSTURE_DRIVER_ROLES_237,
  DRIVER_ROLE_FIELD, DRIVER_ROLE_REF_KIND_237, CESSATION_ROLE_237,
  PROVIDER_VISIBLE_RULES_237, RULES_RETAINED_FROM_235, RULES_REMOVED_FROM_235,
} from './lib/expert-237-posture-contract';
import {
  projectPosture237, deriveCessationDrivers237, projectionIdentity237, CODES_RETIRED_FROM_235,
} from './lib/expert-237-posture-projection';
import {
  runContractConsistency237, RULE_REGISTRY_237_BASE, consistencyIdentity237,
} from './lib/expert-237-contract-consistency';
import {
  SCENARIOS_237, fixtureSchema237, FIXTURE_INPUT_237, analysis237, posture237, candidate, drv,
} from './lib/expert-237-posture-fixtures';

let passed = 0; const failures: string[] = [];
const ok = (name: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; return; }
  failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
};
const eq = (name: string, a: unknown, b: unknown): void => {
  try { deepStrictEqual(a, b); passed += 1; } catch {
    failures.push(`${name} -- ${JSON.stringify(a)?.slice(0, 150)} != ${JSON.stringify(b)?.slice(0, 150)}`);
  }
};
const setEq = (a: readonly string[], b: readonly string[]): boolean =>
  JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());

const SCHEMA = fixtureSchema237();
const BINDING = governedBindingFor([]);
const byId = (id: string) => SCENARIOS_237.find(s => s.id === id)!;
const run = (id: string) => projectPosture237(byId(id).payload, SCHEMA);

console.log('§237 FINAL POSTURE ARCHITECTURE CLOSURE — LOCAL SUITE');
console.log('0 provider calls · 0 database operations\n');

// ================================================================ 1. derivation, and the derived set

{
  ok('1.1 the derivability question is answered NO and documented',
    CESSATION_DERIVABILITY_237.answer === 'NO'
    && CESSATION_DERIVABILITY_237.theSemanticInformationThatExistsOnlyHere.length > 200);
  ok('1.2 every governed candidate property is enumerated and none carries consequence',
    CESSATION_DERIVABILITY_237.everyGovernedCandidateProperty.length >= 8
    && CESSATION_DERIVABILITY_237.everyGovernedCandidateProperty
      .every(p => p.carriesConsequence === false));
  ok('1.3 each rejected derivation rule carries its reason',
    CESSATION_DERIVABILITY_237.candidateRulesConsideredAndRejected.length >= 4
    && CESSATION_DERIVABILITY_237.candidateRulesConsideredAndRejected
      .every(r => r.rejected.length > 60));

  // THE DERIVED SET IS A FILTER AND NOTHING MORE.
  for (const s of SCENARIOS_237) {
    const r = projectPosture237(s.payload, SCHEMA);
    if (!r.admitted || r.posture === null) continue;
    eq(`1.4 ${s.id} the derived set is exactly the filter`,
      [...r.derivedCessationDrivers], [...deriveCessationDrivers237(r.posture)]);
    eq(`1.5 ${s.id} the filter is one enum member`,
      [...r.derivedCessationDrivers],
      r.posture.requiredBy.filter(d => d.driverRole === CESSATION_ROLE_237));
    if (s.expectDerivedCessationCount !== undefined) {
      ok(`1.6 ${s.id} derives ${s.expectDerivedCessationCount} cessation driver(s)`,
        r.derivedCessationDrivers.length === s.expectDerivedCessationCount);
    }
  }
  ok('1.7 the projection declares the set derived rather than authored',
    projectionIdentity237().cessationSetIsDerivedNotAuthored === true);
}

// ================================================================ 2 & 3. the retired field

{
  const schemaJson = JSON.stringify(buildExpert237WireSchema(FIXTURE_INPUT_237, BINDING));
  ok('2.1 the retired field is absent from the transmitted schema',
    !schemaJson.includes('establishedConditionsRequiringCessation'));
  ok('2.2 the retired field is absent from the transmitted prompt',
    !build237SystemPrompt(0).includes('establishedConditionsRequiringCessation'));
  const l1 = run('L1');
  ok('2.3 the STOP floor holds with no such field anywhere', l1.admitted
    && l1.derivedCessationDrivers.length === 1 && l1.posture?.posture === 'STOP');
  ok('2.4 no retired §235 code can be produced',
    CODES_RETIRED_FROM_235.every(c => !l1.codes.includes(c)));

  const l2 = run('L2');
  ok('3.1 a malformed stray legacy list neither refuses nor helps',
    l2.admitted && l2.derivedCessationDrivers.length === 1);
  const l3 = run('L3');
  ok('3.2 a populated stray legacy list cannot manufacture a floor',
    l3.admitted && l3.derivedCessationDrivers.length === 0
    && l3.posture?.posture === 'CONTINUE_WITH_CONTROLS');
  ok('3.3 duplicate provider authority no longer exists',
    CODES_RETIRED_FROM_235.every(c => !l2.codes.includes(c) && !l3.codes.includes(c)));
}

// ================================================================ 4-10. semantics

{
  const f3 = run('F3');
  ok('4.1 established STOP with a separate unresolved property stays STOP',
    f3.admitted && f3.posture?.posture === 'STOP');
  ok('4.2 the separate declaration is still carried and subordinated',
    f3.declarationSubordination.length === 1
    && f3.declarationSubordination[0].authority === 'ADVISORY_NOT_AUTHORITATIVE');

  for (const id of ['R4', 'R5']) {
    const r = run(id);
    ok(`5.1 ${id} a legitimate HOLD remains a HOLD`, r.admitted
      && r.posture?.posture === 'HOLD_PENDING_VERIFICATION', r.codes.join(','));
  }

  ok('6.1 a hold driven only by response uncertainty is refused',
    !run('R1').admitted
    && run('R1').codes.includes('NON_PERMITTING_POSTURE_WITHOUT_DECISION_CONTROLLING_DRIVER'));
  ok('6.2 the same facts at CONTINUE_WITH_CONTROLS are admitted, declaration and all',
    run('R2').admitted && run('R2').posture?.posture === 'CONTINUE_WITH_CONTROLS');
  ok('7.1 CONTINUE with an administrative uncertainty is admitted', run('R3').admitted);
  ok('8.1 a genuine decision-controlling uncertainty still elevates to HOLD',
    run('R4').admitted && run('R4').posture?.posture === 'HOLD_PENDING_VERIFICATION');
  ok('9.1 a STOP needs no declaration at all', run('F4').admitted
    && run('F4').declarationSubordination.length === 0);

  for (const id of ['T1', 'T2', 'T3']) {
    ok(`10.1 ${id} no false STOP inflation`, run(id).admitted
      && run(id).derivedCessationDrivers.length === 0, run(id).codes.join(','));
  }

  // NOTHING FORCES STOP WITHOUT A CESSATION ROLE, at any posture, swept.
  for (const p of IMMEDIATE_SAFETY_POSTURES_233) {
    const permits = POSTURE_PERMITS_CONTINUED_WORK[p];
    const payload = analysis237({
      candidates: [candidate('an-active-hazard', 'ACTIVE')],
      declarations: [
        { declarationId: 'd-controlling', missingFact: 'x', observationSourceId: 'OBS-237-FIXTURE',
          observationSpan: 'x', notEstablishedBecause: 'x', affectedDecision: 'EXPOSURE',
          branchA: 'a', decisionIfA: 'a', branchB: 'b', decisionIfB: 'b',
          decisionWhileUnresolved: 'x', whyNecessaryNow: 'x' }],
      posture: posture237({
        posture: p,
        requiredBy: permits
          ? [drv('an-active-hazard', p === 'CONTINUE'
            ? 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION'
            : 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS'),
          drv('d-controlling', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')]
          : [drv('an-active-hazard', 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION'),
            drv('d-controlling', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')],
        controls: p === 'CONTINUE_WITH_CONTROLS'
          ? [{ control: 'a control', timing: 'BEFORE_WORK_RESUMES' }] : [],
        resume: permits ? { resolvedByDeclarationIds: [], correctionsRequired: [] }
          : { resolvedByDeclarationIds: ['d-controlling'], correctionsRequired: [] },
      }),
    });
    const r = projectPosture237(payload, SCHEMA);
    ok(`10.2 no cessation role means no floor at ${p}`, r.admitted
      && r.derivedCessationDrivers.length === 0, r.codes.join(','));
  }

  // A cessation role forbids every posture except STOP.
  for (const p of IMMEDIATE_SAFETY_POSTURES_233.filter(x => x !== 'STOP')) {
    const payload = analysis237({
      candidates: [candidate('established-cessation')],
      posture: posture237({
        posture: p,
        requiredBy: [drv('established-cessation', 'ESTABLISHED_CONDITION_REQUIRING_CESSATION')],
        controls: p === 'CONTINUE_WITH_CONTROLS'
          ? [{ control: 'a control', timing: 'BEFORE_WORK_RESUMES' }] : [],
        resume: p === 'HOLD_PENDING_VERIFICATION'
          ? { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] }
          : { resolvedByDeclarationIds: [], correctionsRequired: [] },
      }),
    });
    ok(`10.3 a cessation driver forbids ${p}`,
      projectPosture237(payload, SCHEMA).codes
        .includes('ESTABLISHED_CESSATION_DRIVER_WITH_NON_STOP_POSTURE'));
  }
}

// ================================================================ 11. contract alignment

{
  const r237 = runContractConsistency237();
  ok('11.1 the §237 contract consistency check passes', r237.allPassed,
    r237.checks.filter(c => !c.passed).map(c => `${c.id}: ${c.detail.join('; ')}`).join(' | '));
  for (const c of r237.checks) ok(`11.2 ${c.id} ${c.rule.slice(0, 52)}`, c.passed, c.detail.join('; '));

  const cut = RULE_REGISTRY_237_BASE.filter(e => e.code !== 'POSTURE_DRIVER_ROLE_MISSING');
  ok('11.3 C1 fails when a deterministic rule has no provider-visible statement',
    runContractConsistency237({ registry: cut }).checks.find(c => c.id === 'C1')?.passed === false);
  ok('11.4 C3 fails when a provider-visible rule has no deterministic code',
    runContractConsistency237({
      providerVisibleRules: [...PROVIDER_VISIBLE_RULES_237, 'RULE. a promise with nothing behind it.'],
    }).checks.find(c => c.id === 'C3')?.passed === false);

  // THE §235 SUITE'S OWN CHECK MUST STILL PASS. §235 is untouched on disk and stays coherent.
  ok('11.5 the §235 contract consistency check is still green', runContractConsistency235().allPassed);

  // P8 equivalence with §235 on the scenarios that govern it.
  const s235 = fixtureSchema235();
  for (const id of ['R1', 'R2']) {
    const sc = SCENARIOS_235.find(x => x.id === id)!;
    const under237 = projectPosture237(sc.payload, s235);
    const expected = sc.expectCodes.includes('RESUME_CONDITION_UNDER_PERMITTING_POSTURE');
    ok(`11.6 §235 ${id} P8 outcome is unchanged under §237`,
      under237.codes.includes('RESUME_CONDITION_UNDER_PERMITTING_POSTURE') === expected);
  }

  ok('11.7 the eight retained rules are §235 originals and all four removals are gone',
    RULES_RETAINED_FROM_235.length === 8 && RULES_REMOVED_FROM_235.length === 4
    && RULES_REMOVED_FROM_235.every(r => !build237SystemPrompt(0).includes(r)));
}

// ================================================================ 12. §233 behaviour is unchanged

{
  const complete = (a: Record<string, unknown>): Record<string, unknown> => ({
    crossHazardInsights: [], disagreements: [], uncertainty: { statements: [] },
    outcome: 'ANALYSIS_COMPLETE', expertExplanation: { summary: 'the explanation summary' },
    ...a,
  });
  for (const s of SCENARIOS_233) {
    const base = projectPosture233(s.analysis);
    const via = projectPosture237(complete(s.analysis as unknown as Record<string, unknown>), SCHEMA);
    ok(`12.1 §233 ${s.id} codes unchanged under §237`, setEq(via.codes233, base.codes),
      `${via.codes233.join(',')} vs ${base.codes.join(',')}`);
    ok(`12.2 §233 ${s.id} admission unchanged under §237`,
      (via.base233?.admitted ?? false) === base.admitted);
  }
}

// ================================================================ reconstruction and wire shape

{
  for (const n of [0, 2]) {
    eq(`X.1 the §237 prompt reconstructs the §233 prompt byte for byte (governed=${n})`,
      reconstruct233SystemPrompt(build237SystemPrompt(n)), build233SystemPrompt(n));
  }
  eq('X.2 the §237 posture schema property reconstructs the §233 property',
    reconstruct233PostureSchemaProperty(build237PostureSchemaProperty()),
    JSON.parse(JSON.stringify(POSTURE_SCHEMA_PROPERTY_233)));
  eq('X.3 the §237 wire schema reconstructs the §233 wire schema',
    reconstruct233WireSchema(FIXTURE_INPUT_237, BINDING),
    JSON.parse(JSON.stringify(buildExpert233WireSchema(FIXTURE_INPUT_237, BINDING))));

  const s233 = buildExpert233WireSchema(FIXTURE_INPUT_237, BINDING) as Record<string, any>;
  const s237 = buildExpert237WireSchema(FIXTURE_INPUT_237, BINDING) as Record<string, any>;
  eq('X.4 no root property is added', Object.keys(s237.properties).sort(),
    Object.keys(s233.properties).sort());
  const p233 = s233.properties[POSTURE_FIELD]; const p237 = s237.properties[POSTURE_FIELD];
  eq('X.5 NO posture sub-property is added — the §235 field is gone and nothing replaces it',
    Object.keys(p237.properties).sort(), Object.keys(p233.properties).sort());
  ok('X.6 exactly one basis-entry member is added',
    Object.keys(p237.properties.requiredBy.items.properties).length
      === Object.keys(p233.properties.requiredBy.items.properties).length + 1
    && p237.properties.requiredBy.items.required.includes(DRIVER_ROLE_FIELD));
  ok('X.7 the acceptance list entry is untouched',
    JSON.stringify(p237.properties.acceptedWithoutImmediateAction.items)
      === JSON.stringify(p233.properties.acceptedWithoutImmediateAction.items));

  const unions = (node: unknown, path = '$'): string[] => {
    if (Array.isArray(node)) return node.flatMap((v, i) => unions(v, `${path}[${i}]`));
    if (typeof node !== 'object' || node === null) return [];
    const o = node as Record<string, unknown>;
    const hits: string[] = [];
    if (Array.isArray(o.type)) hits.push(`${path}.type`);
    for (const kw of ['anyOf', 'oneOf', 'allOf']) if (o[kw] !== undefined) hits.push(`${path}.${kw}`);
    for (const [k, v] of Object.entries(o)) hits.push(...unions(v, `${path}.${k}`));
    return hits;
  };
  ok('X.8 the §237 transmitted schema contains no union type', unions(s237).length === 0);

  // every role is defined, transmitted, and bound to exactly one reference kind
  for (const r of POSTURE_DRIVER_ROLES_237) {
    ok(`X.9 ${r} is transmitted and bound to a reference kind`,
      build237SystemPrompt(0).includes(r) && JSON.stringify(s237).includes(r)
      && DRIVER_ROLE_REF_KIND_237[r] !== undefined);
  }
  ok('X.10 the permissive role is listed first',
    POSTURE_DRIVER_ROLES_237[0] === 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION');
}

// ================================================================ prose independence

{
  const PROSE_KEYS = new Set(['reasoning', 'evidenceBasis', 'whatHappensNow', 'reason', 'control',
    'missingFact', 'notEstablishedBecause', 'branchA', 'branchB', 'decisionIfA', 'decisionIfB',
    'decisionWhileUnresolved', 'whyNecessaryNow', 'question', 'whyItMatters', 'evidenceGap',
    'observationSpan', 'summary', 'quotedText']);
  const ARB = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor';
  const scrub = (v: unknown, key?: string): unknown => {
    if (Array.isArray(v)) return v.map(x => scrub(x, key));
    if (typeof v === 'object' && v !== null) {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>)
        .map(([k, x]) => [k, scrub(x, k)]));
    }
    if (typeof v === 'string' && key !== undefined && PROSE_KEYS.has(key)) return ARB;
    if (typeof v === 'string' && key === undefined) return ARB;
    return v;
  };
  for (const s of SCENARIOS_237) {
    if (s.id === 'K2' || s.id === 'K3') continue; // a serialized container, not prose
    const before = projectPosture237(s.payload, SCHEMA);
    const after = projectPosture237(scrub(s.payload), SCHEMA);
    ok(`P.1 ${s.id} admission does not depend on prose`, before.admitted === after.admitted);
    ok(`P.2 ${s.id} codes do not depend on prose`, setEq(before.codes, after.codes));
  }
}

// ================================================================ all scenarios

for (const s of SCENARIOS_237) {
  const r = projectPosture237(s.payload, SCHEMA);
  ok(`S.1 ${s.id} admitted=${String(s.expectAdmitted)}`, r.admitted === s.expectAdmitted,
    `codes ${r.codes.join(',')}`);
  for (const c of s.expectCodes) {
    ok(`S.2 ${s.id} refuses on ${c}`, r.codes.includes(c), `got ${r.codes.join(',')}`);
  }
  if (!r.admitted) {
    ok(`S.3 ${s.id} fails closed with preservation`, !r.mayPresentAsCompletedAnalysis
      && r.posture === null && r.preserved !== null && r.preserved.admissible === false);
  }
}

// ================================================================ result

console.log(`${passed} passed, ${failures.length} failed`);
for (const f of failures) console.log(`  FAIL  ${f}`);
console.log('');
console.log(`contract     ${String(contractIdentities237().systemPromptNoGoverned).slice(0, 16)}…`);
console.log(`consistency  ${String(consistencyIdentity237().registryDigest).slice(0, 16)}…`);
console.log(`derivable    ${CESSATION_DERIVABILITY_237.answer}`);
console.log('');
console.log('No claim is made here about what a model will choose. §237 removes a duplicate');
console.log('obligation and adds one governed distinction; whether that changes behaviour is a');
console.log('hosted question and six calls are proposed to ask it.');
if (failures.length > 0) process.exitCode = 1;
