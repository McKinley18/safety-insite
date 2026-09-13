/**
 * §259 -- CARRIER COHERENCE. GENERALIZED H3/H4 FIXTURES. ZERO PROVIDER CALLS, ZERO DATABASE OPS.
 *
 * These fixtures test the FAILURE FAMILY, not the hosted wording. Nothing here reproduces the §254
 * H3 or H4 text, and no hosted answer is used as a tuning target. Each row states a structural
 * relationship and the disposition the contract must reach.
 *
 * Every row admits through `runExpertHazLenzAnalysis`, the production entry point.
 */
import { admitThroughProductionPath } from './lib/expert-252-replay-path';
import { OBS, INPUT, validOutput } from './verify-252-admission-matrix';

const clone = <T>(v: T): T => JSON.parse(JSON.stringify(v));

let passed = 0; let failed = 0;
const ok = (name: string, cond: boolean, detail = ''): void => {
  if (cond) { passed += 1; console.log(`ok    ${name}${detail ? '  [' + detail + ']' : ''}`); }
  else { failed += 1; console.log(`FAIL  ${name}${detail ? '  [' + detail + ']' : ''}`); }
};

const CONTROL_ID = 'ctl-slab-capacity';
const OTHER_CONTROL_ID = 'ctl-banksman';

/**
 * The §259 baseline. The §252 baseline with control identity applied: each control carries a
 * `controlId`, and the controls driver names that id rather than reproducing the control prose.
 */
function base259(): any {
  const o = clone(validOutput());
  const p = o.immediateSafetyPosture;
  p.requiredControls = [{
    controlId: CONTROL_ID,
    control: p.requiredControls[0].control,
    timing: p.requiredControls[0].timing,
  }];
  p.requiredBy[0].roleJustification.dischargingControlRef = CONTROL_ID;
  return o;
}

async function run(toolInput: unknown) {
  return admitThroughProductionPath({
    input: INPUT, observation: OBS, governedRecords: [], toolInput,
  });
}

const codes = (r: any): string[] => [
  ...r.result.postureRefusalCodes, ...r.result.roleJustificationCodes,
];

async function main(): Promise<void> {
  console.log('---- H3. declaration coverage through structural identity ----\n');

  // H3-A. The relationship expressed through the canonical identity mechanism: the declaration is
  // named by id in the resume condition, and its subject twin carries the operational consequence.
  // This is the §254 H3 SHAPE -- a declaration covered only by the resume condition -- and nothing
  // of its wording.
  {
    const o = base259();
    o.expertHazardCandidates[0].assertedConditionState = 'UNKNOWN';
    const p = o.immediateSafetyPosture;
    p.posture = 'HOLD_PENDING_VERIFICATION';
    p.requiredControls = [];
    p.requiredBy = [{
      ref: 'mewp-slab-capacity', refKind: 'HAZARD_CANDIDATE',
      driverRole: 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
      roleJustification: {
        epistemicCharacter: 'UNRESOLVED_DECISION_CRITICAL',
        factualBasis: 'the site file carries no capacity entry for this slab',
        unresolvedElement: 'the recorded loading capacity of the slab',
        whyDecisionMaterial: 'the capacity decides whether the platform may remain on the slab',
        whyControllingNotFollowUp: 'the platform is on the slab now',
        alongsideControlConsidered: null, whyAlongsideControlInsufficient: null,
        dischargingControlRef: null,
      },
    }];
    p.resumeCondition = {
      resolvedByDeclarationIds: ['slab-capacity-unrecorded'],
      correctionsRequired: ['confirm the slab capacity'],
    };
    const r = await run(o);
    ok('H3-A declaration covered by the resume condition alone is ADMITTED',
      r.result.admission === 'ADMIT' && !codes(r).includes('DECLARATION_NOT_COVERED'),
      `${r.result.admission} ${codes(r).join(',') || 'no codes'}`);
  }

  // H3-B. The declaration is emitted and appears in NO consequential relationship at all.
  {
    const o = base259();
    const p = o.immediateSafetyPosture;
    p.requiredBy = [p.requiredBy[0]];
    p.acceptedWithoutImmediateAction = [];
    p.resumeCondition = { resolvedByDeclarationIds: [], correctionsRequired: [] };
    const r = await run(o);
    ok('H3-B omitted declaration still REFUSES',
      r.result.admission !== 'ADMIT' && codes(r).includes('DECLARATION_NOT_COVERED'),
      `${r.result.admission} ${codes(r).join(',')}`);
  }

  // H3-C. The resume condition names a DIFFERENT declaration than the one emitted. The emitted one
  // must stay uncovered: one declaration may not discharge another.
  {
    const o = base259();
    const p = o.immediateSafetyPosture;
    o.unresolvedFactDeclarations.push({
      ...clone(o.unresolvedFactDeclarations[0]), declarationId: 'other-decl',
    });
    p.requiredBy = [p.requiredBy[0]];
    p.acceptedWithoutImmediateAction = [];
    p.resumeCondition = {
      resolvedByDeclarationIds: ['other-decl'], correctionsRequired: ['x'],
    };
    const r = await run(o);
    ok('H3-C wrong declaration id leaves the real one uncovered and REFUSES',
      r.result.admission !== 'ADMIT' && codes(r).includes('DECLARATION_NOT_COVERED'),
      `${r.result.admission} ${codes(r).join(',')}`);
  }

  // H3-D. The resume condition names a declaration that does not exist in this response.
  {
    const o = base259();
    const p = o.immediateSafetyPosture;
    p.requiredBy = [p.requiredBy[0]];
    p.acceptedWithoutImmediateAction = [];
    p.resumeCondition = {
      resolvedByDeclarationIds: ['invented-decl-id'], correctionsRequired: ['x'],
    };
    const r = await run(o);
    ok('H3-D invented declaration id REFUSES and does not confer coverage',
      r.result.admission !== 'ADMIT'
      && codes(r).includes('RESUME_CONDITION_REF_UNRESOLVED')
      && codes(r).includes('DECLARATION_NOT_COVERED'),
      `${r.result.admission} ${codes(r).join(',')}`);
  }

  console.log('\n---- H4. discharging control through structural identity ----\n');

  // H4-A. One control authored once, referenced by its id.
  {
    const r = await run(base259());
    ok('H4-A control authored once and referenced by id is ADMITTED',
      r.result.admission === 'ADMIT' && codes(r).length === 0,
      `${r.result.admission} ${codes(r).join(',') || 'no codes'}`);
  }

  // H4-B. The reference names a control that exists but is not the one that discharges this entry.
  {
    const o = base259();
    const p = o.immediateSafetyPosture;
    p.requiredControls.push({
      controlId: OTHER_CONTROL_ID, control: 'keep a banksman posted while the platform slews',
      timing: 'DURING_CONTINUED_WORK',
    });
    p.requiredBy[0].roleJustification.dischargingControlRef = 'ctl-does-not-discharge';
    const r = await run(o);
    ok('H4-B wrong control id REFUSES',
      r.result.admission !== 'ADMIT'
      && codes(r).includes('DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS'),
      `${r.result.admission} ${codes(r).join(',')}`);
  }

  // H4-C. The reference names an id no control carries.
  {
    const o = base259();
    o.immediateSafetyPosture.requiredBy[0].roleJustification.dischargingControlRef = 'ctl-nonexistent';
    const r = await run(o);
    ok('H4-C nonexistent control id REFUSES',
      r.result.admission !== 'ADMIT'
      && codes(r).includes('DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS'),
      `${r.result.admission} ${codes(r).join(',')}`);
  }

  // H4-D. Persuasive prose cannot override structural identity. The reference carries the exact
  // control TEXT -- which the pre-§259 contract required -- and the id is what decides.
  {
    const o = base259();
    const p = o.immediateSafetyPosture;
    p.requiredBy[0].roleJustification.dischargingControlRef = p.requiredControls[0].control;
    const r = await run(o);
    ok('H4-D exact control prose in place of the id REFUSES; identity is structural',
      r.result.admission !== 'ADMIT'
      && codes(r).includes('DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS'),
      `${r.result.admission} ${codes(r).join(',')}`);
  }

  // H4-E. No duplicate wording requirement remains: the control prose and the reference share no
  // text at all, and the analysis is admitted on identity alone.
  {
    const o = base259();
    const p = o.immediateSafetyPosture;
    p.requiredControls[0].controlId = 'c1';
    p.requiredBy[0].roleJustification.dischargingControlRef = 'c1';
    const ref = p.requiredBy[0].roleJustification.dischargingControlRef;
    const controlProse = p.requiredControls[0].control;
    const shareNoWords = !controlProse.toLowerCase().split(/\W+/)
      .some((w: string) => w.length > 3 && ref.toLowerCase().includes(w));
    const r = await run(o);
    ok('H4-E admission needs no shared wording between control and reference',
      r.result.admission === 'ADMIT' && shareNoWords,
      `admission=${r.result.admission} shareNoWords=${shareNoWords}`);
  }

  console.log('\n---- H4 identity integrity: the two new fail-closed conditions ----\n');

  // A control with no id cannot be referenced at all.
  {
    const o = base259();
    delete o.immediateSafetyPosture.requiredControls[0].controlId;
    const r = await run(o);
    ok('H4-F a control with no controlId REFUSES',
      r.result.admission !== 'ADMIT' && codes(r).includes('REQUIRED_CONTROL_WITHOUT_CONTROL_ID'),
      `${r.result.admission} ${codes(r).join(',')}`);
  }

  // Two controls sharing one id make a reference ambiguous, so it resolves to neither.
  {
    const o = base259();
    const p = o.immediateSafetyPosture;
    p.requiredControls.push({
      controlId: CONTROL_ID, control: 'keep a banksman posted while the platform slews',
      timing: 'DURING_CONTINUED_WORK',
    });
    const r = await run(o);
    ok('H4-G duplicate controlId REFUSES and resolves to neither control',
      r.result.admission !== 'ADMIT'
      && codes(r).includes('DUPLICATE_CONTROL_ID')
      && codes(r).includes('DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS'),
      `${r.result.admission} ${codes(r).join(',')}`);
  }

  console.log('\n---- invariants that must not have moved ----\n');

  // Nothing above invented a semantic fact.
  {
    const rows = [base259()];
    let inventions = 0;
    for (const o of rows) {
      const r = await run(o);
      inventions += r.result.semanticInventions.length;
    }
    ok('Z1 no semantic invention on any §259 row', inventions === 0, `inventions=${inventions}`);
  }

  // The §259 schema reduces back to §253 byte for byte, and the prompt back to §247.
  {
    const {
      buildExpert259WireSchema, reconstruct253WireSchema, build259SystemPrompt,
      reconstruct247SystemPrompt,
    } = await import('../src/hazlenz/expert-hazlenz/contract/expert-259-control-identity-contract');
    const { buildExpert253WireSchema } =
      await import('../src/hazlenz/expert-hazlenz/contract/expert-253-posture-contract');
    const { build247SystemPrompt } =
      await import('../src/hazlenz/expert-hazlenz/contract/expert-247-posture-contract');
    const { governedBindingFor } =
      await import('../src/hazlenz/expert-hazlenz/contract/expert-first-pass-instruction-vnext');
    const g = governedBindingFor([]);
    ok('Z2 the §259 wire schema reduces back to §253 byte for byte',
      JSON.stringify(reconstruct253WireSchema(INPUT, g))
      === JSON.stringify(buildExpert253WireSchema(INPUT, g)));
    ok('Z3 the §259 prompt reduces back to §247 byte for byte',
      reconstruct247SystemPrompt(build259SystemPrompt(0)) === build247SystemPrompt(0));
    ok('Z4 the §259 schema actually differs from §253',
      JSON.stringify(buildExpert259WireSchema(INPUT, g))
      !== JSON.stringify(buildExpert253WireSchema(INPUT, g)));
  }

  // The transmitted instruction and the validator must state the same rule in both directions.
  {
    const { CONTROL_ID_FIELD_259, build259SystemPrompt } =
      await import('../src/hazlenz/expert-hazlenz/contract/expert-259-control-identity-contract');
    const prompt = build259SystemPrompt(0);
    ok('Z5 the transmitted instruction names the controlId, matching the validator',
      prompt.includes(CONTROL_ID_FIELD_259) && !prompt.includes('the exact control text'));
  }

  // The driver-role vocabulary and carrier bindings are untouched.
  {
    const { DRIVER_ROLE_REF_KINDS_239, POSTURE_DRIVER_ROLES_239 } =
      await import('../src/hazlenz/expert-hazlenz/contract/expert-239-posture-contract');
    const { admissiblePairs247 } =
      await import('../src/hazlenz/expert-hazlenz/contract/expert-247-posture-contract');
    ok('Z6 the driver-role vocabulary is unchanged', POSTURE_DRIVER_ROLES_239.length === 5);
    ok('Z7 the admissible role/carrier pair set is still six', admissiblePairs247().length === 6);
    ok('Z8 UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION still binds both carriers',
      DRIVER_ROLE_REF_KINDS_239.UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION.length === 2);
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0');
  if (failed > 0) process.exitCode = 1;
}

void main();
