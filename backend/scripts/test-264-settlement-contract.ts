/**
 * §264 — THE SETTLEMENT CONTRACT AND THE EFFECTIVE-DECISION DERIVATION. TIER 1.
 *
 * ZERO DATABASE OPERATIONS, ZERO PROVIDER CALLS. Both units under test are pure functions, which is
 * why they can be driven directly: the authority boundary they encode is a product invariant, and it
 * must be checkable without a server, a request or a reviewer.
 */
import {
  CLASSIFICATION_FOR_DRIVER_ROLE, HUMAN_CLASSIFICATIONS, SETTLEMENT_DECISIONS,
  resolveConfirmationSubject, settleEntries, validateReplacements,
  type SubjectEntry,
} from '../src/hazlenz/expert-hazlenz-product/expert-settlement-contract';
import {
  deriveEffectiveDecision,
} from '../src/hazlenz/expert-hazlenz-product/expert-effective-decision';
import {
  CONFIRMATION_RULE_VERSION,
} from '../src/hazlenz/expert-hazlenz-product/expert-confirmation-rule';
import type {
  AnalysisState,
} from '../src/hazlenz/expert-hazlenz-product/expert-analysis-authority';

let pass = 0; let fail = 0; const failures: string[] = [];
const ok = (id: string, cond: boolean, d = ''): void => {
  if (cond) { pass++; console.log(`ok    ${id}${d ? '  [' + d + ']' : ''}`); }
  else { fail++; failures.push(id); console.log(`FAIL  ${id}${d ? '  [' + d + ']' : ''}`); }
};
const threw = (fn: () => unknown): Error | null => {
  try { fn(); return null; } catch (error) { return error as Error; }
};

/** A posture the §239 projection would have produced, carrying one trigger and one non-trigger. */
const posture = (over: Record<string, unknown> = {}) => ({
  posture: 'CONTINUE_WITH_CONTROLS',
  requiredBy: [
    {
      refKind: 'HAZARD_CANDIDATE', ref: 'drive-stored-energy',
      driverRole: 'ESTABLISHED_CONDITION_REQUIRING_CONTROLS',
    },
    {
      refKind: 'UNRESOLVED_DECLARATION', ref: 'decl-stored-energy-state',
      driverRole: 'UNRESOLVED_RESPONSE_OR_FOLLOW_UP',
    },
  ],
  ...over,
});

function main(): void {
  console.log('---- S1. the subject is the triggering entries and nothing else ----\n');
  const resolved = resolveConfirmationSubject(posture(), CONFIRMATION_RULE_VERSION);
  ok('S1-A the subject resolves', resolved.ok);
  if (!resolved.ok) { report(); return; }
  ok('S1-B exactly the ONE triggering entry is the subject, not every driver',
    resolved.entries.length === 1, `${resolved.entries.length} entries`);
  ok('S1-C it is identified by the refKind:ref pair the analysis already carries',
    resolved.entries[0].refKind === 'UNRESOLVED_DECLARATION'
    && resolved.entries[0].ref === 'decl-stored-energy-state');
  ok('S1-D the claim is stated in product language, never as the internal driver role',
    resolved.entries[0].expertClassification === 'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES');
  ok('S1-E the established-condition driver is NOT put in front of a human',
    !resolved.entries.some(e => e.ref === 'drive-stored-energy'));

  console.log('\n---- S2. a drifted rule version refuses rather than re-deriving ----\n');
  const drifted = resolveConfirmationSubject(posture(), 'hazlenz.expert.confirmation-required.999');
  ok('S2-A a subject is not produced under a rule version this build does not implement',
    !drifted.ok && drifted.code === 'CONFIRMATION_RULE_VERSION_DRIFTED',
    drifted.ok ? 'resolved' : drifted.code);
  ok('S2-B a null persisted version also refuses',
    !resolveConfirmationSubject(posture(), null).ok);

  console.log('\n---- S3. an unreadable or empty posture refuses ----\n');
  ok('S3-A no posture refuses',
    !resolveConfirmationSubject(null, CONFIRMATION_RULE_VERSION).ok);
  const unreadable = resolveConfirmationSubject(
    { posture: 'NOT_A_POSTURE', requiredBy: [] }, CONFIRMATION_RULE_VERSION);
  ok('S3-B a posture outside the closed vocabulary refuses',
    !unreadable.ok && unreadable.code === 'POSTURE_UNREADABLE',
    unreadable.ok ? 'resolved' : unreadable.code);
  const noTrigger = resolveConfirmationSubject(
    posture({ posture: 'STOP', requiredBy: [] }), CONFIRMATION_RULE_VERSION);
  ok('S3-C a posture with no triggering entry refuses rather than presenting an empty question',
    !noTrigger.ok && noTrigger.code === 'NO_SUBJECT_ENTRIES',
    noTrigger.ok ? 'resolved' : noTrigger.code);

  console.log('\n---- S4. the override contract is closed ----\n');
  const subject: SubjectEntry[] = [...resolved.entries];
  ok('S4-A a change with no replacement is refused',
    !validateReplacements(subject, []).ok);
  const foreign = validateReplacements(subject, [{
    refKind: 'HAZARD_CANDIDATE', ref: 'drive-stored-energy',
    classification: 'CONTROLS_WHETHER_WORK_CONTINUES',
  }]);
  ok('S4-B a reference the analysis does not ask about is refused',
    !foreign.ok && foreign.code === 'REPLACEMENT_NOT_A_SUBJECT_ENTRY',
    foreign.ok ? 'accepted' : foreign.code);
  const badValue = validateReplacements(subject, [{
    refKind: 'UNRESOLVED_DECLARATION', ref: 'decl-stored-energy-state',
    classification: 'SOMETHING_ELSE',
  }]);
  ok('S4-C a value outside the two-member vocabulary is refused, not coerced',
    !badValue.ok && badValue.code === 'REPLACEMENT_CLASSIFICATION_NOT_IN_VOCABULARY',
    badValue.ok ? 'accepted' : badValue.code);
  const noop = validateReplacements(subject, [{
    refKind: 'UNRESOLVED_DECLARATION', ref: 'decl-stored-energy-state',
    classification: 'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES',
  }]);
  ok('S4-D a "change" that changes nothing is refused, so no false disagreement is recorded',
    !noop.ok && noop.code === 'REPLACEMENT_CHANGES_NOTHING',
    noop.ok ? 'accepted' : noop.code);
  const duplicated = validateReplacements(subject, [
    { refKind: 'UNRESOLVED_DECLARATION', ref: 'decl-stored-energy-state', classification: 'CONTROLS_WHETHER_WORK_CONTINUES' },
    { refKind: 'UNRESOLVED_DECLARATION', ref: 'decl-stored-energy-state', classification: 'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES' },
  ]);
  ok('S4-E a duplicated reference is refused rather than last-one-wins',
    !duplicated.ok && duplicated.code === 'REPLACEMENT_DUPLICATED',
    duplicated.ok ? 'accepted' : duplicated.code);
  const good = validateReplacements(subject, [{
    refKind: 'UNRESOLVED_DECLARATION', ref: 'decl-stored-energy-state',
    classification: 'CONTROLS_WHETHER_WORK_CONTINUES',
  }]);
  ok('S4-F a genuine change is accepted', good.ok);

  console.log('\n---- S5. both sides are carried into the settled record ----\n');
  const confirmed = settleEntries(subject, []);
  ok('S5-A a confirmation records the human value equal to the Expert value, and changed=false',
    confirmed[0].expertClassification === confirmed[0].humanClassification
    && confirmed[0].changed === false);
  const changed = settleEntries(subject, good.ok ? good.changed : []);
  ok('S5-B a change records BOTH the Expert claim and the human replacement',
    changed[0].expertClassification === 'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES'
    && changed[0].humanClassification === 'CONTROLS_WHETHER_WORK_CONTINUES'
    && changed[0].changed === true);

  console.log('\n---- S6. the effective decision is total and never manufactures a conclusion ----\n');
  const unsettled: AnalysisState[] = [
    'ANALYSIS_RUNNING', 'ANALYSIS_FAILED', 'ANALYSIS_REFUSED', 'ANALYSIS_UNRESOLVED',
    'ANALYSIS_AWAITING_CONFIRMATION',
  ];
  for (const state of unsettled) {
    const decision = deriveEffectiveDecision({ analysisState: state, settlement: null });
    ok(`S6 ${state} yields no settled conclusion`,
      decision.settledForUse === false && decision.humanSettled === false
      && decision.entries.length === 0 && decision.source.startsWith('NONE_'),
      decision.source);
  }
  const available = deriveEffectiveDecision({
    analysisState: 'ANALYSIS_AVAILABLE', settlement: null,
  });
  ok('S6-F ANALYSIS_AVAILABLE is settled without a human, under the existing authority rules',
    available.settledForUse === true && available.humanSettled === false
    && available.source === 'EXPERT_ADMITTED_NO_CONFIRMATION_REQUIRED');
  ok('S6-G awaiting confirmation says it is neither confirmed nor rejected',
    /not confirmed and it is not rejected/i.test(
      deriveEffectiveDecision({
        analysisState: 'ANALYSIS_AWAITING_CONFIRMATION', settlement: null,
      }).statement));
  ok('S6-H a failed execution never reads as "no hazards"',
    /not a finding that there are no hazards/i.test(
      deriveEffectiveDecision({ analysisState: 'ANALYSIS_FAILED', settlement: null }).statement));

  const settlement = {
    entries: changed, reviewedByUserId: '00000000-0000-4000-8000-00000000abcd',
    createdAt: new Date('2026-09-12T00:00:00.000Z'),
  };
  const confirmedDecision = deriveEffectiveDecision({
    analysisState: 'ANALYSIS_CONFIRMED',
    settlement: { ...settlement, decision: 'classification_confirmed', entries: confirmed },
  });
  ok('S6-I a confirmed analysis is settled by a human and uses the confirmed conclusion',
    confirmedDecision.settledForUse && confirmedDecision.humanSettled
    && confirmedDecision.source === 'HUMAN_CONFIRMED_AS_AUTHORED'
    && confirmedDecision.entries[0].effectiveClassification
      === confirmedDecision.entries[0].expertClassification);
  const overriddenDecision = deriveEffectiveDecision({
    analysisState: 'ANALYSIS_OVERRIDDEN',
    settlement: { ...settlement, decision: 'classification_changed' },
  });
  ok('S6-J an overridden analysis uses the HUMAN replacement as the effective value',
    overriddenDecision.source === 'HUMAN_REPLACED'
    && overriddenDecision.entries[0].effectiveClassification === 'CONTROLS_WHETHER_WORK_CONTINUES'
    && overriddenDecision.entries[0].expertClassification
      === 'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES'
    && overriddenDecision.entries[0].changedByHuman === true);
  ok('S6-K the Expert proposal is still readable from the effective decision itself',
    overriddenDecision.entries[0].expertClassification
      === 'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES');
  ok('S6-L the reviewer and timestamp are carried',
    overriddenDecision.reviewer?.userId === settlement.reviewedByUserId
    && overriddenDecision.reviewer?.at === '2026-09-12T00:00:00.000Z');

  const orphan = threw(() => deriveEffectiveDecision({
    analysisState: 'ANALYSIS_CONFIRMED', settlement: null,
  }));
  ok('S6-M a settled STATE with no settlement RECORD aborts rather than yielding a conclusion',
    orphan !== null && /carries no settlement record/i.test(orphan.message));

  console.log('\n---- S7. the vocabularies are closed and mutually consistent ----\n');
  ok('S7-A exactly two human classifications exist', HUMAN_CLASSIFICATIONS.length === 2);
  ok('S7-B exactly two settlement decisions exist', SETTLEMENT_DECISIONS.length === 2);
  ok('S7-C the driver-role map covers exactly the two trigger roles and no others',
    Object.keys(CLASSIFICATION_FOR_DRIVER_ROLE).length === 2);
  ok('S7-D the map is injective, so the answer space has not collapsed',
    new Set(Object.values(CLASSIFICATION_FOR_DRIVER_ROLE)).size === 2);

  report();
}

function report(): void {
  console.log(`\n================ §264 settlement contract: ${pass} passed, ${fail} failed`);
  console.log(JSON.stringify({ providerCalls: 0, databaseOperations: 0, passed: pass, failed: fail }));
  if (fail > 0) { console.log(`failures: ${failures.join(', ')}`); process.exit(1); }
}

main();
