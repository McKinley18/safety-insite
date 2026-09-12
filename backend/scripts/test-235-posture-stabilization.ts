/**
 * §235 LOCAL SUITE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * The twelve local validation items the §235 authorization enumerates, in its order, plus the
 * regression that matters most: §233 must behave EXACTLY as it did, because the frozen §234
 * evidence depends on it.
 */
import { deepStrictEqual } from 'assert';

import { governedBindingFor } from './lib/expert-first-pass-instruction-vnext';
import {
  build233SystemPrompt, buildExpert233WireSchema, POSTURE_SCHEMA_PROPERTY_233,
  IMMEDIATE_SAFETY_POSTURES_233, POSTURE_FIELD,
} from './lib/expert-233-posture-contract';
import { projectPosture233 } from './lib/expert-233-posture-projection';
import { SCENARIOS_233 } from './lib/expert-233-posture-fixtures';
import {
  build235SystemPrompt, buildExpert235WireSchema, build235PostureSchemaProperty,
  reconstruct233SystemPrompt, reconstruct233PostureSchemaProperty, reconstruct233WireSchema,
  contractIdentities235, CESSATION_FIELD, PROVIDER_VISIBLE_RULES_235,
} from './lib/expert-235-posture-contract';
import { projectPosture235, projectionIdentity235 } from './lib/expert-235-posture-projection';
import {
  runContractConsistency235, RULE_REGISTRY_235_BASE, consistencyIdentity235,
} from './lib/expert-235-contract-consistency';
import { normalizationIdentity235 } from './lib/expert-235-wire-normalization';
import {
  SCENARIOS_235, fixtureSchema235, FIXTURE_INPUT_235, analysis235, posture235, candidate, hc,
} from './lib/expert-235-posture-fixtures';

let passed = 0; const failures: string[] = [];
const ok = (name: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; return; }
  failures.push(`${name}${detail ? ` -- ${detail}` : ''}`);
};
const eq = (name: string, a: unknown, b: unknown): void => {
  try { deepStrictEqual(a, b); passed += 1; } catch {
    failures.push(`${name} -- ${JSON.stringify(a)?.slice(0, 160)} != ${JSON.stringify(b)?.slice(0, 160)}`);
  }
};
const setEq = (a: readonly string[], b: readonly string[]): boolean =>
  JSON.stringify([...new Set(a)].sort()) === JSON.stringify([...new Set(b)].sort());

const SCHEMA = fixtureSchema235();
const BINDING = governedBindingFor([]);

console.log('§235 POSTURE CONTRACT STABILIZATION — LOCAL SUITE');
console.log('0 provider calls · 0 database operations\n');

// ================================================================ 1. contract consistency

{
  const r = runContractConsistency235();
  ok('1.1 contract consistency passes', r.allPassed,
    r.checks.filter(c => !c.passed).map(c => `${c.id}: ${c.detail.join('; ')}`).join(' | '));
  for (const c of r.checks) ok(`1.2 ${c.id} ${c.rule.slice(0, 54)}`, c.passed, c.detail.join('; '));

  // THE TEETH. A check nobody has watched fail is not a check.
  const cut = RULE_REGISTRY_235_BASE.filter(e => e.code !== 'POSTURE_BASIS_REF_DUPLICATED');
  const r1 = runContractConsistency235({ registry: cut });
  ok('1.3 C1 fails when a deterministic rule has no provider-visible statement',
    r1.checks.find(c => c.id === 'C1')?.passed === false);
  const r2 = runContractConsistency235({
    providerVisibleRules: [...PROVIDER_VISIBLE_RULES_235, 'RULE. a promise with nothing behind it.'],
  });
  ok('1.4 C3 fails when a provider-visible rule has no deterministic code',
    r2.checks.find(c => c.id === 'C3')?.passed === false);
}

// ================================================================ 2-5. normalization

for (const s of SCENARIOS_235.filter(x => x.family === 'NORMALIZATION')) {
  const r = projectPosture235(s.payload, SCHEMA);
  ok(`2.1 ${s.id} admitted=${String(s.expectAdmitted)}`, r.admitted === s.expectAdmitted,
    `codes ${r.codes.join(',')}`);
  for (const c of s.expectCodes) {
    ok(`2.2 ${s.id} refuses on ${c}`, r.codes.includes(c), `got ${r.codes.join(',')}`);
  }
  if (s.expectNormalizationAction !== undefined) {
    const actions = [
      ...(r.normalization.envelope === null ? [] : [r.normalization.envelope.action]),
      ...r.normalization.fields.map(f => f.action),
    ];
    ok(`2.3 ${s.id} normalization action ${s.expectNormalizationAction}`,
      actions.includes(s.expectNormalizationAction as never), `actions ${actions.join(',')}`);
  }
  if (s.expectFailsClosed === true) {
    ok(`4.1 ${s.id} normalization reports fail-closed`, r.normalization.failsClosed);
    ok(`4.2 ${s.id} may not be presented as a completed analysis`,
      !r.mayPresentAsCompletedAnalysis);
    ok(`4.3 ${s.id} carries no posture`, r.posture === null);
    ok(`4.4 ${s.id} preserves what was identified, inadmissibly`,
      r.preserved !== null && r.preserved.admissible === false
      && r.preserved.mayCloseTheAnalysis === false);
  }
  ok(`3.1 ${s.id} invents nothing`, r.normalization.semanticFieldsInventedOrRepaired === 0
    && r.normalization.changedContainerOnly === true);
}

{
  // 5. ROOT OMISSION SUPPLIES NOTHING. The field is absent before and absent after.
  const p = analysis235({ candidates: [candidate('c', 'CONTROLLED')], omitPosture: true });
  const r = projectPosture235(p, SCHEMA);
  ok('5.1 an absent root field is not invented',
    r.normalization.analysis !== null && !(POSTURE_FIELD in r.normalization.analysis));
  ok('5.2 an absent root field fails closed', !r.admitted && r.codes.includes('POSTURE_MISSING'));

  // A malformed string is left byte-identical to what arrived.
  const bad = SCENARIOS_235.find(x => x.id === 'N6')!.payload as Record<string, unknown>;
  const rb = projectPosture235(bad, SCHEMA);
  ok('4.5 a malformed JSON string is left exactly as received',
    rb.normalization.analysis?.[POSTURE_FIELD] === bad[POSTURE_FIELD]);
}

// ================================================================ 6. manufactured-uncertainty trap

{
  const trap = SCENARIOS_235.find(s => s.id === 'M1')!;
  const r = projectPosture235(trap.payload, SCHEMA);
  ok('6.1 the manufactured-uncertainty trap is refused', !r.admitted);
  ok('6.2 it is refused on the generalized rule, not on a case-specific patch',
    r.codes.includes('ESTABLISHED_CESSATION_CONDITION_WITH_NON_STOP_POSTURE'));
  ok('6.3 the refusal is a §235 invariant', r.invariantsViolated.includes('P7'));

  // the same shape at every non-STOP posture, so nothing about it is specific to HOLD
  for (const p of IMMEDIATE_SAFETY_POSTURES_233.filter(x => x !== 'STOP')) {
    const payload = analysis235({
      candidates: [candidate('established-cessation-condition')],
      posture: posture235({
        posture: p, requiredBy: [hc('established-cessation-condition')],
        cessation: [hc('established-cessation-condition')],
        controls: p === 'CONTINUE_WITH_CONTROLS'
          ? [{ control: 'a control', timing: 'BEFORE_WORK_RESUMES' }] : [],
        resume: p === 'HOLD_PENDING_VERIFICATION'
          ? { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] }
          : { resolvedByDeclarationIds: [], correctionsRequired: [] },
      }),
    });
    const rr = projectPosture235(payload, SCHEMA);
    ok(`6.4 a named cessation condition forbids ${p}`,
      rr.codes.includes('ESTABLISHED_CESSATION_CONDITION_WITH_NON_STOP_POSTURE'));
  }

  const good = SCENARIOS_235.find(s => s.id === 'M2')!;
  ok('6.5 the same facts reported as STOP are admitted',
    projectPosture235(good.payload, SCHEMA).admitted);
}

// ================================================================ 7. legitimate cases survive

for (const s of SCENARIOS_235.filter(x => x.family === 'RESTRAINT')) {
  const r = projectPosture235(s.payload, SCHEMA);
  ok(`7.1 ${s.id} ${s.name.slice(0, 58)}`, r.admitted, `codes ${r.codes.join(',')}`);
}
{
  // P7 must be silent whenever the cessation list is empty, at every posture.
  for (const p of IMMEDIATE_SAFETY_POSTURES_233) {
    const payload = analysis235({
      candidates: [candidate('an-active-hazard')],
      posture: posture235({
        posture: p, requiredBy: [hc('an-active-hazard')], cessation: [],
        controls: p === 'CONTINUE_WITH_CONTROLS'
          ? [{ control: 'a control', timing: 'BEFORE_WORK_RESUMES' }] : [],
        resume: (p === 'STOP' || p === 'HOLD_PENDING_VERIFICATION')
          ? { resolvedByDeclarationIds: [], correctionsRequired: ['a correction'] }
          : { resolvedByDeclarationIds: [], correctionsRequired: [] },
      }),
    });
    const r = projectPosture235(payload, SCHEMA);
    ok(`7.2 an empty cessation list constrains nothing at ${p}`, r.admitted,
      `codes ${r.codes.join(',')}`);
  }
}

// ================================================================ 8. established STOP + separate property

{
  const s = SCENARIOS_235.find(x => x.id === 'M3')!;
  const r = projectPosture235(s.payload, SCHEMA);
  ok('8.1 an established STOP with a separate unresolved property is admitted', r.admitted,
    `codes ${r.codes.join(',')}`);
  ok('8.2 the STOP is preserved', r.posture?.posture === 'STOP');
  ok('8.3 the separate declaration is still carried and subordinated',
    r.declarationSubordination.length === 1
    && r.declarationSubordination[0].authority === 'ADVISORY_NOT_AUTHORITATIVE');
  ok('8.4 the resume condition still names what must become true',
    (r.posture?.resumeCondition.resolvedByDeclarationIds.length ?? 0) > 0);
}

// ================================================================ 9. rules are provider-visible

{
  const prompt = build235SystemPrompt(0);
  const promptGoverned = build235SystemPrompt(2);
  const schemaJson = JSON.stringify(buildExpert235WireSchema(FIXTURE_INPUT_235, BINDING));
  for (const r of PROVIDER_VISIBLE_RULES_235) {
    ok(`9.1 transmitted verbatim: ${r.slice(7, 60)}`,
      prompt.includes(r) && promptGoverned.includes(r));
  }
  ok('9.2 the declaration-coverage rule is in the transmitted instruction',
    prompt.includes('Every unresolved-fact declaration you emit must appear in requiredBy or in '
      + 'acceptedWithoutImmediateAction.'));
  ok('9.3 the ACTIVE-candidate-coverage rule is in the transmitted instruction',
    prompt.includes('Every hazard candidate you mark ACTIVE must appear in requiredBy or in '
      + 'acceptedWithoutImmediateAction.'));
  ok('9.4 the mutual-exclusivity rule is in the transmitted instruction',
    prompt.includes('may appear in requiredBy OR in acceptedWithoutImmediateAction, never in both'));
  ok('9.5 the coverage rules are also visible in the schema',
    schemaJson.includes('Every ACTIVE candidate and every declaration you emit must appear in one '
      + 'of the two.'));
  ok('9.6 the manufactured-uncertainty instruction is transmitted',
    prompt.includes('Do not create an unresolved fact in order to delay, weaken or replace a '
      + 'posture that an'));
  ok('9.7 the restraint counterweight is transmitted before the constraint',
    prompt.indexOf('LEAVE IT EMPTY unless the facts as they stand ALREADY require cessation')
      < prompt.indexOf('If establishedConditionsRequiringCessation is not empty'));
}

// ================================================================ reconstruction and wire shape

{
  for (const n of [0, 2]) {
    eq(`X.1 the §235 prompt reconstructs the §233 prompt byte for byte (governed=${n})`,
      reconstruct233SystemPrompt(build235SystemPrompt(n)), build233SystemPrompt(n));
  }
  eq('X.2 the §235 posture schema property reconstructs the §233 property',
    reconstruct233PostureSchemaProperty(build235PostureSchemaProperty()),
    JSON.parse(JSON.stringify(POSTURE_SCHEMA_PROPERTY_233)));
  eq('X.3 the §235 wire schema reconstructs the §233 wire schema',
    reconstruct233WireSchema(FIXTURE_INPUT_235, BINDING),
    JSON.parse(JSON.stringify(buildExpert233WireSchema(FIXTURE_INPUT_235, BINDING))));

  const s233 = buildExpert233WireSchema(FIXTURE_INPUT_235, BINDING) as Record<string, any>;
  const s235 = buildExpert235WireSchema(FIXTURE_INPUT_235, BINDING) as Record<string, any>;
  eq('X.4 no root property is added', Object.keys(s235.properties).sort(),
    Object.keys(s233.properties).sort());
  eq('X.5 no root required entry is added', [...s235.required].sort(), [...s233.required].sort());
  const p233 = s233.properties[POSTURE_FIELD]; const p235 = s235.properties[POSTURE_FIELD];
  ok('X.6 exactly one posture sub-property is added',
    Object.keys(p235.properties).length === Object.keys(p233.properties).length + 1);
  ok('X.7 exactly one posture required entry is added',
    p235.required.length === p233.required.length + 1
    && p235.required.includes(CESSATION_FIELD));

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
  ok('X.8 the §235 transmitted schema contains no union type', unions(s235).length === 0,
    unions(s235).join(','));
}

// ================================================================ 10. §233 behaviour is unchanged

{
  /**
   * The §233 fixtures are PARTIAL analyses: they carry only the fields the §233 projection reads.
   * §235 P9 refuses an output that is missing any root field the transmitted schema declares, so
   * comparing them raw would measure the fixture's shape rather than §233's behaviour. Each is
   * completed here with the base root fields and nothing that the posture projection reads is
   * touched.
   */
  const complete = (a: Record<string, unknown>): Record<string, unknown> => ({
    crossHazardInsights: [], disagreements: [], uncertainty: { statements: [] },
    outcome: 'ANALYSIS_COMPLETE', expertExplanation: { summary: 'the explanation summary' },
    ...a,
  });
  for (const s of SCENARIOS_233) {
    const base = projectPosture233(s.analysis);
    const via235 = projectPosture235(complete(s.analysis as unknown as Record<string, unknown>), SCHEMA);
    ok(`10.1 §233 ${s.id} codes unchanged under §235`, setEq(via235.codes233, base.codes),
      `${via235.codes233.join(',')} vs ${base.codes.join(',')}`);
    ok(`10.2 §233 ${s.id} admission unchanged under §235`,
      (via235.base233?.admitted ?? false) === base.admitted);
    // and the only reason a previously admitted §233 scenario is now refused is the new field
    if (base.admitted) {
      ok(`10.3 §233 ${s.id} is refused by §235 only for the absent new field`,
        setEq(via235.codes235, ['CESSATION_LIST_MISSING']), via235.codes235.join(','));
    }
  }
}

// ================================================================ prose independence

{
  const PROSE_KEYS = new Set(['reasoning', 'evidenceBasis', 'whatHappensNow', 'reason', 'control',
    'missingFact', 'notEstablishedBecause', 'affectedDecision', 'branchA', 'branchB', 'decisionIfA',
    'decisionIfB', 'decisionWhileUnresolved', 'whyNecessaryNow', 'question', 'whyItMatters',
    'evidenceGap', 'observationSpan', 'summary', 'quotedText']);
  const ARB = 'lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod';
  const scrub = (v: unknown, key?: string): unknown => {
    if (Array.isArray(v)) return v.map(x => scrub(x, key));
    if (typeof v === 'object' && v !== null) {
      return Object.fromEntries(Object.entries(v as Record<string, unknown>)
        .map(([k, x]) => [k, scrub(x, k)]));
    }
    if (typeof v === 'string' && key !== undefined && PROSE_KEYS.has(key)) return ARB;
    if (typeof v === 'string' && key === undefined) return ARB; // array-of-string members
    return v;
  };
  for (const s of SCENARIOS_235) {
    // scenarios whose payload deliberately carries a serialized container are excluded: replacing
    // that string would replace the container under test, not the prose inside it
    if (s.expectNormalizationAction?.includes('JSON_STRING') === true
      || s.expectNormalizationAction === 'REFUSED_PARSED_VALUE_DOES_NOT_SATISFY_TRANSMITTED_SCHEMA'
      || s.id === 'N4') continue;
    const before = projectPosture235(s.payload, SCHEMA);
    const after = projectPosture235(scrub(s.payload), SCHEMA);
    ok(`P.1 ${s.id} admission does not depend on prose`, before.admitted === after.admitted);
    ok(`P.2 ${s.id} codes do not depend on prose`, setEq(before.codes, after.codes),
      `${before.codes.join(',')} vs ${after.codes.join(',')}`);
  }
}

// ================================================================ remaining scenario families

for (const s of SCENARIOS_235.filter(x => x.family === 'CESSATION_SHAPE'
  || x.family === 'RESUME_COHERENCE' || x.family === 'MANUFACTURED_UNCERTAINTY')) {
  const r = projectPosture235(s.payload, SCHEMA);
  ok(`S.1 ${s.id} admitted=${String(s.expectAdmitted)}`, r.admitted === s.expectAdmitted,
    `codes ${r.codes.join(',')}`);
  for (const c of s.expectCodes) {
    ok(`S.2 ${s.id} refuses on ${c}`, r.codes.includes(c), `got ${r.codes.join(',')}`);
  }
}

// ================================================================ result

console.log(`${passed} passed, ${failures.length} failed`);
for (const f of failures) console.log(`  FAIL  ${f}`);
console.log('');
console.log(`contract     ${String(contractIdentities235().systemPromptNoGoverned).slice(0, 16)}…`);
console.log(`consistency  ${String(consistencyIdentity235().registryDigest).slice(0, 16)}…`);
console.log(`projection   ${projectionIdentity235().projectionVersion}`);
console.log(`normalizer   ${normalizationIdentity235().version}`);
console.log('');
console.log('No claim is made here about what a model will choose. §235 aligns the contract and');
console.log('adds one constraint; whether the constraint changes behaviour is a hosted question.');
if (failures.length > 0) process.exitCode = 1;
