/**
 * §261 — THE DETERMINISTIC CONFIRMATION RULE AND THE PRODUCT STATE DERIVATION.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. Every case below is a literal structure, because
 * the rule is a pure function of closed-vocabulary fields and anything it needed beyond them would
 * itself be a defect.
 *
 * Covers §261 local test requirements 4, 5, 6, 7 and 8, plus the restraint and vocabulary
 * properties that keep the rule from drifting in either direction.
 */
import {
  CONFIRMATION_RULE_VERSION, deriveConfirmationRequired,
  deriveConfirmationRequiredFromAnalysis,
} from '../src/hazlenz/expert-hazlenz-product/expert-confirmation-rule';
import {
  ANALYSIS_PRODUCERS, ANALYSIS_STATES, MACHINE_DERIVABLE_ANALYSIS_STATES,
  classifyExistingExecution, claimPermitsProviderSpend, deriveAnalysisState,
} from '../src/hazlenz/expert-hazlenz-product/expert-analysis-authority';
import {
  POSTURE_PERMITS_CONTINUED_WORK, IMMEDIATE_SAFETY_POSTURES_233,
} from '../src/hazlenz/expert-hazlenz/contract/expert-233-posture-contract';

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};

const driver = (refKind: string, ref: string, driverRole: string) => ({ refKind, ref, driverRole });
const posture = (p: string, requiredBy: unknown[]) => ({
  posture: p,
  requiredBy,
  acceptedWithoutImmediateAction: [],
  requiredControls: [],
  resumeCondition: { resolvedByDeclarationIds: [], correctionsRequired: [] },
  whatHappensNow: 'prose that the rule must never read',
});

console.log('\n---- R1. the frozen total posture-permissiveness map is used, not restated ----\n');

ok('R1-A the map is total over the four postures',
  IMMEDIATE_SAFETY_POSTURES_233.every(p => typeof POSTURE_PERMITS_CONTINUED_WORK[p] === 'boolean'),
  `${IMMEDIATE_SAFETY_POSTURES_233.length} postures`);
ok('R1-B the map is exactly CONTINUE/CONTINUE_WITH_CONTROLS permitting, HOLD/STOP not',
  POSTURE_PERMITS_CONTINUED_WORK.CONTINUE === true
  && POSTURE_PERMITS_CONTINUED_WORK.CONTINUE_WITH_CONTROLS === true
  && POSTURE_PERMITS_CONTINUED_WORK.HOLD_PENDING_VERIFICATION === false
  && POSTURE_PERMITS_CONTINUED_WORK.STOP === false);
ok('R1-C every admitted posture value maps deterministically, none is guessed',
  IMMEDIATE_SAFETY_POSTURES_233.every(p => {
    const d = deriveConfirmationRequired(posture(p, []));
    return d.failedClosed === false && d.posturePermitsContinuedWork === POSTURE_PERMITS_CONTINUED_WORK[p];
  }));

console.log('\n---- R2 (req. 4 and 7). no relevant unresolved driver: confirmation NOT required ----\n');

const r2a = deriveConfirmationRequired(posture('CONTINUE',
  [driver('HAZARD_CANDIDATE', 'hc-1', 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION')]));
ok('R2-A ordinary CONTINUE with an established-condition driver requires no confirmation',
  r2a.confirmationRequired === false && r2a.failedClosed === false && r2a.triggers.length === 0);

const r2b = deriveConfirmationRequired(posture('CONTINUE_WITH_CONTROLS',
  [driver('HAZARD_CANDIDATE', 'hc-1', 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS')]));
ok('R2-B CONTINUE_WITH_CONTROLS driven only by an established condition requires no confirmation',
  r2b.confirmationRequired === false && r2b.triggers.length === 0);

const r2c = deriveConfirmationRequired(posture('STOP',
  [driver('HAZARD_CANDIDATE', 'hc-1', 'ESTABLISHED_CONDITION_REQUIRING_CESSATION')]));
ok('R2-C an established-condition cessation driver ALONE never triggers confirmation',
  r2c.confirmationRequired === false && r2c.triggers.length === 0,
  '§255 bounded the continuation-controlling/follow-up distinction, not established conditions');

const r2d = deriveConfirmationRequired(posture('CONTINUE', []));
ok('R2-D an empty requiredBy requires no confirmation and does not fail closed',
  r2d.confirmationRequired === false && r2d.failedClosed === false);

console.log('\n---- R3 (req. 5). branch (a): an unresolved-property-controlling claim ----\n');

const r3a = deriveConfirmationRequired(posture('HOLD_PENDING_VERIFICATION',
  [driver('UNRESOLVED_DECLARATION', 'decl-1', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')]));
ok('R3-A HOLD driven by a controlling unresolved claim REQUIRES confirmation',
  r3a.confirmationRequired === true && r3a.failedClosed === false
  && r3a.triggers.length === 1 && r3a.triggers[0].branch === 'A_CONTROLLING_CLAIM');
ok('R3-B the trigger is identified structurally by refKind:ref, never by prose',
  r3a.triggers[0].refKind === 'UNRESOLVED_DECLARATION' && r3a.triggers[0].ref === 'decl-1');

const r3c = deriveConfirmationRequired(posture('STOP',
  [driver('UNRESOLVED_DECLARATION', 'decl-2', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')]));
ok('R3-C branch (a) fires on a NON-permitting posture too; it is not gated on permissiveness',
  r3c.confirmationRequired === true && r3c.triggers[0].branch === 'A_CONTROLLING_CLAIM',
  'this is the over-restriction direction §254 observed');

const r3d = deriveConfirmationRequired(posture('CONTINUE',
  [driver('HAZARD_CANDIDATE', 'hc-9', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')]));
ok('R3-D branch (a) fires on a HAZARD_CANDIDATE carrier as well as a declaration carrier',
  r3d.confirmationRequired === true, '§239 binds the role to both ref kinds');

console.log('\n---- R4 (req. 6). branch (b): follow-up classification while work continues ----\n');

const r4a = deriveConfirmationRequired(posture('CONTINUE_WITH_CONTROLS',
  [driver('UNRESOLVED_DECLARATION', 'decl-3', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')]));
ok('R4-A a permitted posture with an unresolved follow-up REQUIRES confirmation',
  r4a.confirmationRequired === true && r4a.failedClosed === false
  && r4a.triggers.length === 1 && r4a.triggers[0].branch === 'B_FOLLOW_UP_WHILE_PERMITTING',
  'the under-restriction direction §254 did not observe and nothing excludes');

const r4b = deriveConfirmationRequired(posture('CONTINUE',
  [driver('UNRESOLVED_DECLARATION', 'decl-4', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')]));
ok('R4-B branch (b) fires on CONTINUE as well, because CONTINUE permits work',
  r4b.confirmationRequired === true && r4b.triggers[0].branch === 'B_FOLLOW_UP_WHILE_PERMITTING');

const r4c = deriveConfirmationRequired(posture('HOLD_PENDING_VERIFICATION',
  [driver('UNRESOLVED_DECLARATION', 'decl-5', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')]));
ok('R4-C RESTRAINT: a follow-up under a NON-permitting posture does NOT trigger confirmation',
  r4c.confirmationRequired === false && r4c.triggers.length === 0,
  'work is already held, so nothing continues on the follow-up classification');

const r4d = deriveConfirmationRequired(posture('STOP',
  [driver('UNRESOLVED_DECLARATION', 'decl-6', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')]));
ok('R4-D RESTRAINT: the same under STOP does not trigger confirmation either',
  r4d.confirmationRequired === false);

console.log('\n---- R5. BOTH directions are preserved; neither branch is the whole rule ----\n');

ok('R5-A branch (a) alone is insufficient: R4-A would be missed without branch (b)',
  r4a.confirmationRequired === true
  && r4a.triggers.every(t => t.branch === 'B_FOLLOW_UP_WHILE_PERMITTING'));
ok('R5-B branch (b) alone is insufficient: R3-C would be missed without branch (a)',
  r3c.confirmationRequired === true
  && r3c.triggers.every(t => t.branch === 'A_CONTROLLING_CLAIM'));

const r5c = deriveConfirmationRequired(posture('CONTINUE_WITH_CONTROLS', [
  driver('HAZARD_CANDIDATE', 'hc-1', 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS'),
  driver('UNRESOLVED_DECLARATION', 'decl-7', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP'),
  driver('UNRESOLVED_DECLARATION', 'decl-8', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION'),
]));
ok('R5-C a mixed posture collects EVERY triggering entry, not the first',
  r5c.confirmationRequired === true && r5c.triggers.length === 2
  && r5c.triggers.some(t => t.branch === 'A_CONTROLLING_CLAIM')
  && r5c.triggers.some(t => t.branch === 'B_FOLLOW_UP_WHILE_PERMITTING'),
  'the confirmation subject binds to all of them');

console.log('\n---- R6 (req. 8). unknown or invalid structured state FAILS CLOSED ----\n');

const failClosedCases: readonly [string, unknown, string][] = [
  ['posture absent', null, 'POSTURE_ABSENT'],
  ['posture undefined', undefined, 'POSTURE_ABSENT'],
  ['posture is a string', 'HOLD_PENDING_VERIFICATION', 'POSTURE_NOT_AN_OBJECT'],
  ['posture is an array', [], 'POSTURE_NOT_AN_OBJECT'],
  ['posture value outside the closed vocabulary',
    posture('CONTINUE_IF_SUPERVISED', []), 'POSTURE_VALUE_NOT_IN_CLOSED_VOCABULARY'],
  ['posture value is not a string', { posture: 3, requiredBy: [] },
    'POSTURE_VALUE_NOT_IN_CLOSED_VOCABULARY'],
  ['requiredBy is not an array', { posture: 'CONTINUE', requiredBy: {} },
    'REQUIRED_BY_NOT_AN_ARRAY'],
  ['requiredBy is absent', { posture: 'CONTINUE' }, 'REQUIRED_BY_NOT_AN_ARRAY'],
  ['a requiredBy entry is not an object', posture('CONTINUE', ['decl-1']),
    'REQUIRED_BY_ENTRY_NOT_AN_OBJECT'],
  ['a driverRole is outside the closed vocabulary',
    posture('CONTINUE', [driver('UNRESOLVED_DECLARATION', 'd', 'PROBABLY_FINE')]),
    'DRIVER_ROLE_NOT_IN_CLOSED_VOCABULARY'],
  ['a driverRole is absent',
    posture('CONTINUE', [{ refKind: 'UNRESOLVED_DECLARATION', ref: 'd' }]),
    'DRIVER_ROLE_NOT_IN_CLOSED_VOCABULARY'],
  ['a refKind is outside the closed vocabulary',
    posture('CONTINUE', [driver('FREEFORM_NOTE', 'd', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')]),
    'REF_KIND_NOT_IN_CLOSED_VOCABULARY'],
];
for (const [label, value, code] of failClosedCases) {
  const d = deriveConfirmationRequired(value);
  ok(`R6 ${label} fails closed`,
    d.confirmationRequired === true && d.failedClosed === true && d.failClosedCode === code
    && d.triggers.length === 0, code);
}
ok('R6-Z a failed-closed determination is DISTINGUISHABLE from a substantive requirement',
  deriveConfirmationRequired(null).failedClosed === true && r3a.failedClosed === false
  && r3a.confirmationRequired === deriveConfirmationRequired(null).confirmationRequired,
  'same flag, different meaning, and both are recorded');

console.log('\n---- R7. the rule reads structure only; prose cannot move it ----\n');

const persuasive = posture('CONTINUE', [
  driver('HAZARD_CANDIDATE', 'hc-1', 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION'),
]);
(persuasive as any).whatHappensNow =
  'An unresolved property controls whether work may continue and a human must confirm this.';
ok('R7-A prose asserting a controlling unresolved property does NOT trigger confirmation',
  deriveConfirmationRequired(persuasive).confirmationRequired === false,
  'no prose is read and no model is asked');

const quiet = posture('CONTINUE_WITH_CONTROLS',
  [driver('UNRESOLVED_DECLARATION', 'decl-9', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP')]);
(quiet as any).whatHappensNow = 'Everything is settled. No confirmation of any kind is needed.';
ok('R7-B prose asserting nothing is needed does NOT suppress a structural trigger',
  deriveConfirmationRequired(quiet).confirmationRequired === true);

ok('R7-C the whole-analysis entry point reads the posture field and agrees with the direct call',
  deriveConfirmationRequiredFromAnalysis({ immediateSafetyPosture: r3a.posture === null ? null
    : posture('HOLD_PENDING_VERIFICATION',
      [driver('UNRESOLVED_DECLARATION', 'decl-1', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION')]),
  }).confirmationRequired === true);
ok('R7-D an analysis carrying no posture field fails closed rather than reading as settled',
  deriveConfirmationRequiredFromAnalysis({ hazardCandidates: [] }).failedClosed === true);

console.log('\n---- R8. the §260 design check against the §254 shapes ----\n');
//
// NOT A RESCORE OF §254 AND NO CAPABILITY CLAIM IS MADE. §254 measured what a model produced; this
// asserts only that the frozen rule fires on the shapes §260 said it fires on. The inputs are the
// posture SHAPES recorded in the frozen design table, reconstructed as literals here.

const designCheck: readonly [string, string, string, boolean][] = [
  ['H1', 'CONTINUE', 'ESTABLISHED_CONDITION_REQUIRING_NO_IMMEDIATE_ACTION', false],
  ['H2', 'STOP', 'ESTABLISHED_CONDITION_REQUIRING_CESSATION', false],
  ['H3', 'HOLD_PENDING_VERIFICATION', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION', true],
  ['H4', 'CONTINUE_WITH_CONTROLS', 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP', true],
  ['H5', 'HOLD_PENDING_VERIFICATION', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION', true],
  ['H6', 'HOLD_PENDING_VERIFICATION', 'UNRESOLVED_PROPERTY_CONTROLLING_CONTINUATION', true],
];
for (const [id, p, role, expected] of designCheck) {
  const refKind = role.startsWith('ESTABLISHED') ? 'HAZARD_CANDIDATE' : 'UNRESOLVED_DECLARATION';
  const d = deriveConfirmationRequired(posture(p, [driver(refKind, `${id}-ref`, role)]));
  ok(`R8 ${id} ${p} -> confirmation ${expected ? 'required' : 'not required'}`,
    d.confirmationRequired === expected, role);
}
ok('R8-Z the rule fires on exactly the four unresolved-classification shapes and no others',
  designCheck.filter(([, , , e]) => e).length === 4);

console.log('\n---- R9. the state derivation is total and availability is the last conclusion ----\n');

ok('R9-A PROVIDER_FAILED -> ANALYSIS_FAILED',
  deriveAnalysisState({ status: 'PROVIDER_FAILED', admission: null, confirmationRequired: false })
  === 'ANALYSIS_FAILED');
ok('R9-B FIRST_PASS_REFUSED -> ANALYSIS_REFUSED',
  deriveAnalysisState({ status: 'FIRST_PASS_REFUSED', admission: null, confirmationRequired: false })
  === 'ANALYSIS_REFUSED');
ok('R9-C COMPLETE + REFUSE -> ANALYSIS_REFUSED, never a generic success',
  deriveAnalysisState({ status: 'COMPLETE', admission: 'REFUSE', confirmationRequired: false })
  === 'ANALYSIS_REFUSED');
ok('R9-D COMPLETE + PRESERVE_UNRESOLVED -> ANALYSIS_UNRESOLVED',
  deriveAnalysisState({ status: 'COMPLETE', admission: 'PRESERVE_UNRESOLVED', confirmationRequired: false })
  === 'ANALYSIS_UNRESOLVED');
ok('R9-E PRESERVE_UNRESOLVED outranks a refused status rather than reading as a plain refusal',
  deriveAnalysisState({ status: 'FIRST_PASS_REFUSED', admission: 'PRESERVE_UNRESOLVED', confirmationRequired: false })
  === 'ANALYSIS_UNRESOLVED', 'RR-7 exists to keep the preserved truth visible');
ok('R9-F COMPLETE + ADMIT + no confirmation -> ANALYSIS_AVAILABLE',
  deriveAnalysisState({ status: 'COMPLETE', admission: 'ADMIT', confirmationRequired: false })
  === 'ANALYSIS_AVAILABLE');
ok('R9-G COMPLETE + ADMIT + confirmation -> ANALYSIS_AWAITING_CONFIRMATION',
  deriveAnalysisState({ status: 'COMPLETE', admission: 'ADMIT', confirmationRequired: true })
  === 'ANALYSIS_AWAITING_CONFIRMATION');

let threw = false;
try {
  deriveAnalysisState({ status: 'COMPLETE', admission: null, confirmationRequired: false });
} catch { threw = true; }
ok('R9-H COMPLETE with no admission disposition THROWS rather than defaulting to available',
  threw, 'no benign default is permitted');

ok('R9-I the eight §261 states are all representable and distinct',
  ANALYSIS_STATES.length === 8 && new Set(ANALYSIS_STATES).size === 8
  && ANALYSIS_STATES.includes('ANALYSIS_AWAITING_CONFIRMATION')
  && ANALYSIS_STATES.includes('ANALYSIS_CONFIRMED')
  && ANALYSIS_STATES.includes('ANALYSIS_OVERRIDDEN'));
ok('R9-J this slice can derive only the six machine states; the human two are unreachable here',
  MACHINE_DERIVABLE_ANALYSIS_STATES.length === 6
  && !MACHINE_DERIVABLE_ANALYSIS_STATES.includes('ANALYSIS_CONFIRMED')
  && !MACHINE_DERIVABLE_ANALYSIS_STATES.includes('ANALYSIS_OVERRIDDEN'));

console.log('\n---- R10. the producer vocabulary is closed, and pre-spend classification ----\n');

ok('R10-A the producer vocabulary is exactly two values',
  ANALYSIS_PRODUCERS.length === 2 && ANALYSIS_PRODUCERS.includes('client_supplied')
  && ANALYSIS_PRODUCERS.includes('server_authored'));
ok('R10-B a running execution is discovered as ALREADY_RUNNING and may not spend',
  classifyExistingExecution('ANALYSIS_RUNNING') === 'ALREADY_RUNNING'
  && !claimPermitsProviderSpend('ALREADY_RUNNING'));
ok('R10-C a completed execution may not spend again',
  classifyExistingExecution('ANALYSIS_AVAILABLE') === 'ALREADY_COMPLETED'
  && classifyExistingExecution('ANALYSIS_AWAITING_CONFIRMATION') === 'ALREADY_COMPLETED'
  && !claimPermitsProviderSpend('ALREADY_COMPLETED'));
ok('R10-D a transport failure is RETRYABLE: no semantic answer was ever obtained',
  classifyExistingExecution('ANALYSIS_FAILED') === 'ALREADY_FAILED_RETRYABLE');
ok('R10-E a refusal is TERMINAL: the provider answered and admission refused it',
  classifyExistingExecution('ANALYSIS_REFUSED') === 'ALREADY_FAILED_TERMINAL'
  && classifyExistingExecution('ANALYSIS_UNRESOLVED') === 'ALREADY_FAILED_TERMINAL'
  && !claimPermitsProviderSpend('ALREADY_FAILED_TERMINAL'),
  're-spending would be shopping for a different answer to the same question');
ok('R10-F only a fresh CLAIMED outcome permits provider spend',
  claimPermitsProviderSpend('CLAIMED') === true);

console.log('\n---- R11. the rule carries its own identity ----\n');
ok('R11-A every determination carries the rule version that produced it',
  r3a.ruleVersion === CONFIRMATION_RULE_VERSION
  && deriveConfirmationRequired(null).ruleVersion === CONFIRMATION_RULE_VERSION);
ok('R11-B the rule version names §261 and the boundary it enforces',
  CONFIRMATION_RULE_VERSION.includes('261') && CONFIRMATION_RULE_VERSION.includes('confirmation'));

console.log(`\n================ §261 confirmation rule: ${pass} passed, ${fail} failed`);
if (fail > 0) { console.log(`failures: ${failures.join(', ')}`); process.exit(1); }
