/**
 * §247 -- DRIVER-ROLE JUSTIFICATION AND K6 REPRESENTABILITY. ZERO PROVIDER CALLS. ZERO DB OPS.
 *
 * Proves the representation locally, and states what it would and would NOT have done to the
 * historical §243 mechanisms. It does not rescore §243 and does not claim anything about changed
 * model generation: a schema cannot prove that, and only the frozen hosted confirmation can.
 */
import {
  applyStrictSchemaWrapper, stripAnthropicUnsupportedKeywords,
} from '../src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider';
import {
  build247PostureSchemaProperty, buildBasisEntryUnion247, admissiblePairs247,
  expressiblePairsUnder239, reconstruct239PostureSchemaProperty, build247SystemPrompt,
  reconstruct239SystemPrompt, EPISTEMIC_CHARACTERS_247, ROLE_EPISTEMIC_CHARACTERS_247,
  CONTROLLING_ROLES_247, contractIdentities247, ROLE_JUSTIFICATION_FIELD,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-247-posture-contract';
import {
  build239PostureSchemaProperty, build239SystemPrompt, POSTURE_DRIVER_ROLES_239,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-239-posture-contract';
import {
  checkRoleJustification247, roleJustificationEffect247,
} from '../src/safescope-v2/expert-hazlenz/contract/expert-247-role-justification-projection';

let passed = 0; let failed = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, detail = ''): void => {
  if (cond) { passed++; console.log(`ok    ${id}${detail ? '  [' + detail + ']' : ''}`); }
  else { failed++; failures.push(id); console.log(`FAIL  ${id}${detail ? '  [' + detail + ']' : ''}`); }
};
const keys = (node: unknown, k: string): number => {
  if (Array.isArray(node)) return node.reduce((a: number, v) => a + keys(v, k), 0);
  if (!node || typeof node !== 'object') return 0;
  return Object.entries(node as Record<string, unknown>)
    .reduce((a, [kk, v]) => a + (kk === k ? 1 : 0) + keys(v, k), 0);
};

console.log('---- A. K6 representability ----');
const union = buildBasisEntryUnion247() as Record<string, any>;
ok('A1 the basis entry is a union', Array.isArray(union.anyOf));
ok('A2 anyOf is used, never oneOf -- the provider subset rejects oneOf',
  union.anyOf !== undefined && (union as any).oneOf === undefined);
const pairs = union.anyOf.flatMap((b: any) =>
  b.properties.refKind.enum.map((k: string) => `${b.properties.driverRole.const}|${k}`));
ok('A3 the union expresses exactly the 6 admissible role/carrier pairs', pairs.length === 6,
  `${pairs.length} pairs`);
ok('A4 the admissible set equals DRIVER_ROLE_REF_KINDS_239, generated not restated',
  JSON.stringify([...pairs].sort())
    === JSON.stringify(admissiblePairs247().map(p => `${p.role}|${p.refKind}`).sort()));
ok('A5 zero inadmissible combinations remain expressible',
  expressiblePairsUnder239().length - pairs.length === 4 && pairs.length === 6,
  `§239 could express ${expressiblePairsUnder239().length}, §247 expresses ${pairs.length}`);
ok('A6 every branch pins its role with const', union.anyOf.every((b: any) =>
  typeof b.properties.driverRole.const === 'string'));
ok('A7 the follow-up role cannot be placed on a hazard candidate -- the M2/K6 shape',
  !pairs.includes('UNRESOLVED_RESPONSE_OR_FOLLOW_UP|HAZARD_CANDIDATE'));

console.log('\n---- B. provider pipeline compatibility, offline ----');
const sent = stripAnthropicUnsupportedKeywords(
  applyStrictSchemaWrapper(build247PostureSchemaProperty())) as Record<string, any>;
const sentUnion = sent.properties.requiredBy.items;
ok('B1 anyOf survives the strict wrapper and the §108 compatibility strip',
  Array.isArray(sentUnion.anyOf) && sentUnion.anyOf.length === 5);
ok('B2 const survives both', sentUnion.anyOf.every((b: any) =>
  typeof b.properties.driverRole.const === 'string'));
ok('B3 the strict wrapper adds additionalProperties:false inside every branch',
  sentUnion.anyOf.every((b: any) => b.additionalProperties === false));
ok('B4 the strict wrapper reaches the nested justification object too',
  sentUnion.anyOf.every((b: any) => b.properties[ROLE_JUSTIFICATION_FIELD].additionalProperties === false));
ok('B5 no minLength reaches the provider', keys(sent, 'minLength') === 0);
ok('B6 no minItems reaches the provider', keys(sent, 'minItems') === 0);
ok('B7 no oneOf and no allOf anywhere in the transmitted schema',
  keys(sent, 'oneOf') === 0 && keys(sent, 'allOf') === 0);

console.log('\n---- C. additive successor: §239 is reconstructible ----');
ok('C1 the §247 posture property reduces to §239 byte for byte',
  JSON.stringify(reconstruct239PostureSchemaProperty(build247PostureSchemaProperty()))
    === JSON.stringify(build239PostureSchemaProperty()));
ok('C2 the §247 system prompt reduces to §239 byte for byte',
  reconstruct239SystemPrompt(build247SystemPrompt(0)) === build239SystemPrompt(0)
  && reconstruct239SystemPrompt(build247SystemPrompt(2)) === build239SystemPrompt(2));
ok('C3 §247 adds no driver role and removes none',
  POSTURE_DRIVER_ROLES_239.length === 5 && union.anyOf.length === 5);

console.log('\n---- D. the epistemic vocabulary ----');
ok('D1 exactly the four kinds the authorization requires', EPISTEMIC_CHARACTERS_247.length === 4);
ok('D2 no controlling role admits a manufactured possibility',
  CONTROLLING_ROLES_247.every(r =>
    !ROLE_EPISTEMIC_CHARACTERS_247[r].includes('MANUFACTURED_OR_SPECULATIVE')));
ok('D3 the follow-up role is where a manufactured possibility may go',
  ROLE_EPISTEMIC_CHARACTERS_247.UNRESOLVED_RESPONSE_OR_FOLLOW_UP
    .includes('MANUFACTURED_OR_SPECULATIVE'));
ok('D4 an established role admits only an established condition',
  ROLE_EPISTEMIC_CHARACTERS_247.ESTABLISHED_CONDITION_REQUIRING_CESSATION.length === 1);

console.log('\n---- E. deterministic non-invention ----');
const eff = roleJustificationEffect247();
ok('E1 the projection enforces representation and adjudicates no workplace fact',
  eff.enforcesRepresentationalConsistency && !eff.decidesWhetherTheWorkplaceFactIsTrue
  && !eff.readsMeaningOutOfProse && !eff.repairsAnEntry && !eff.coercesARole);

const J = (over: Record<string, unknown> = {}): Record<string, unknown> => ({
  epistemicCharacter: 'ESTABLISHED_CONDITION',
  factualBasis: 'the observation states it',
  unresolvedElement: null,
  whyDecisionMaterial: 'it changes what may proceed now',
  whyControllingNotFollowUp: 'the answer changes who may be where',
  alongsideControlConsidered: null,
  whyAlongsideControlInsufficient: null,
  dischargingControlRef: null,
  ...over,
});

console.log('\n---- F. the historical mechanisms ----');

// C5: a cessation driver on an observation that states a banksman.
const c5Bad = checkRoleJustification247(
  [{ ref: 'c1', refKind: 'HAZARD_CANDIDATE',
    driverRole: 'ESTABLISHED_CONDITION_REQUIRING_CESSATION', roleJustification: J() }], []);
ok('F1 C5: a cessation driver that never confronts the alongside control is refused',
  c5Bad.codes.includes('CESSATION_DRIVER_WITHOUT_ALONGSIDE_CONTROL_ASSESSMENT'));
const c5Good = checkRoleJustification247(
  [{ ref: 'c1', refKind: 'HAZARD_CANDIDATE',
    driverRole: 'ESTABLISHED_CONDITION_REQUIRING_CESSATION',
    roleJustification: J({ alongsideControlConsidered: 'banksman in radio contact',
      whyAlongsideControlInsufficient: 'the agreed stop signal is not acknowledged' }) }], []);
ok('F2 C5: a cessation driver that DOES confront it is admitted -- the content is never judged',
  c5Good.admitted);

// M8 / M1: a controls driver with no per-driver link to a control.
const m8Controls = checkRoleJustification247(
  [{ ref: 'c2', refKind: 'HAZARD_CANDIDATE',
    driverRole: 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS', roleJustification: J() }],
  [{ control: 'move the second man', timing: 'BEFORE_WORK_RESUMES' }]);
ok('F3 M8/M1: a controls driver with no discharging control is refused',
  m8Controls.codes.includes('CONTROLS_DRIVER_WITHOUT_DISCHARGING_CONTROL'));
const m8Dangling = checkRoleJustification247(
  [{ ref: 'c2', refKind: 'HAZARD_CANDIDATE',
    driverRole: 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS',
    roleJustification: J({ dischargingControlRef: 'a procedure already in force' }) }],
  [{ control: 'move the second man', timing: 'BEFORE_WORK_RESUMES' }]);
ok('F4 M8: a discharging reference that matches none of the model own controls is refused',
  m8Dangling.codes.includes('DISCHARGING_CONTROL_NOT_IN_REQUIRED_CONTROLS'));
const m8Ok = checkRoleJustification247(
  [{ ref: 'c2', refKind: 'HAZARD_CANDIDATE',
    driverRole: 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS',
    roleJustification: J({ dischargingControlRef: 'move the second man' }) }],
  [{ control: 'move the second man', timing: 'BEFORE_WORK_RESUMES' }]);
ok('F5 M8: a controls driver tied to one of its own controls is admitted', m8Ok.admitted);

// M8 storm cell: a future contingency the model itself labels manufactured.
const m8Storm = checkRoleJustification247(
  [{ ref: 'd1', refKind: 'UNRESOLVED_DECLARATION',
    driverRole: 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
    roleJustification: J({ epistemicCharacter: 'MANUFACTURED_OR_SPECULATIVE',
      unresolvedElement: 'whether the cell later closes inside the trigger distance' }) }], []);
ok('F6 M8: a fact the model labels manufactured cannot control continuation',
  m8Storm.codes.includes('MANUFACTURED_FACT_IN_CONTROLLING_ROLE'));
ok('F7 M8: and it is counted, never repaired into another role', m8Storm.manufacturedCount === 1
  && !m8Storm.admitted);

// G5: preserved §244 expectation -- this representation does NOT bar it.
const g5 = checkRoleJustification247(
  [{ ref: 'd2', refKind: 'UNRESOLVED_DECLARATION',
    driverRole: 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION',
    roleJustification: J({ epistemicCharacter: 'UNRESOLVED_DECISION_CRITICAL',
      unresolvedElement: 'whether the hold-to-run mode is functional' }) }], []);
ok('F8 G5: a hold-to-run fact labelled decision-critical is STILL ADMITTED -- §244 expectation held',
  g5.admitted);

// M2 / K6, at the schema level rather than the projection level.
ok('F9 M2/K6: the emitted shape is unrepresentable rather than refused after the fact',
  !pairs.includes('UNRESOLVED_RESPONSE_OR_FOLLOW_UP|HAZARD_CANDIDATE'));

console.log('\n---- G. identity ----');
const id = contractIdentities247();
ok('G1 the contract identity records 6 admissible and 0 inadmissible',
  id.admissiblePairs === 6 && id.inadmissibleExpressible === 0);
ok('G2 the identity records anyOf + const, not oneOf',
  id.unionKeyword === 'anyOf' && id.discriminatorKeyword === 'const');

console.log(`\n${passed} passed, ${failed} failed`);
if (failures.length) console.log('FAILED:\n  ' + failures.join('\n  '));
console.log('PROVIDER CALLS: 0   DATABASE OPERATIONS: 0   COMMIT: no   PUSH: no   DEPLOY: no');
process.exit(failed ? 1 : 0);
