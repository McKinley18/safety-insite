/**
 * §207 -- PREREGISTRATION SUITE. Asserts that the frozen truth specification, the preregistered
 * gates, the frozen protocols and the identity-pinned record are well-formed, mutually consistent,
 * reversible to §205, and that the execution gate REFUSES an absent, tampered, drifted or
 * unauthorized run.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS EXECUTED.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

import { COHORT_CASES } from './lib/expert-205-acceptance-cohort';
import {
  FROZEN_TRUTH_CASES, PROPERTY_STATUSES, SAFETY_CLASSIFICATIONS, TRUTH_PROVENANCE,
  expectedProjectedFactCount, governedCaseIds, safetyCriticalFactIds, truthSpecificationEffect,
  zeroDeclarationCaseIds,
} from './lib/expert-207-truth-specification';
import {
  AXIS_AMENDMENTS, GATES_ARE_PREREGISTERED, HARD_GATE_IDS, INSTRUMENT_DEVIATION,
  ORDINARY_QUALITY_CRITERIA, ORDINARY_QUALITY_RULE, PREREGISTERED_GATES, adjudicationPlan,
  gateApplicabilityMatrix, gatesEffect, instrumentBudget, reconstruct205AxisSets,
  unreachableGateIds,
} from './lib/expert-207-gates';
import {
  ADJUDICATION_PROTOCOL, AMBIGUITY_PROTOCOL, COST_BASIS, EXPECTED_EVIDENCE_ARTIFACTS, FAILURE_RULES,
  RETRY_POLICY, RUN_INVARIANTS, callPlan, protocolsSelfCheck, spendPlan,
} from './lib/expert-207-protocols';
import {
  PRODUCT_OWNER_REVIEW, TRUTH_SPECIFICATION_STATE, buildPreregistrationRecord, canonicalise,
  preregistrationEffect, preregistrationIdentity, preregistrationPayload, sha256Hex,
  verifyPreregistrationRecord,
} from './lib/expert-207-preregistration';
import {
  EXPECTED_PREREGISTRATION_IDENTITY, cohortExecutionPermitted, executionGateEffect,
  preregistrationPath,
} from './lib/expert-207-execution-gate';

let passed = 0;
let failed = 0;
function ok(id: string, condition: boolean, detail = ''): void {
  if (condition) { passed += 1; console.log(`  PASS  ${id}${detail ? ` -- ${detail}` : ''}`); }
  else { failed += 1; console.log(`  FAIL  ${id}${detail ? ` -- ${detail}` : ''}`); }
}
const section = (t: string): void => console.log(`\n---------------- ${t}`);

const repoRoot = join(__dirname, '..', '..');

// ================================================================ 1. truth specification

section('1. FROZEN TRUTH SPECIFICATION');

ok('TRUTH.twenty-four-cases', FROZEN_TRUTH_CASES.length === 24,
  `${FROZEN_TRUTH_CASES.length} cases`);
ok('TRUTH.ids-unique',
  new Set(FROZEN_TRUTH_CASES.map(c => c.caseId)).size === FROZEN_TRUTH_CASES.length);
ok('TRUTH.case-ids-match-the-205-manifest',
  FROZEN_TRUTH_CASES.map(c => c.caseId).join(',') === COHORT_CASES.map(c => c.caseId).join(','),
  'the specification fills in the §205 design; it does not replace it with a different cohort');

ok('TRUTH.provenance-declares-it-is-the-oracle',
  TRUTH_PROVENANCE.USED_AS_THE_SEMANTIC_ORACLE === true
  && TRUTH_PROVENANCE.AUTHORED_BEFORE_ANY_FRESH_COHORT_PROVIDER_EXECUTION === true,
  'unlike §197/§199, whose truth was expressly NOT the oracle');
ok('TRUTH.provenance-does-not-claim-human-authoring',
  TRUTH_PROVENANCE.FULLY_INDEPENDENT_HUMAN_AUTHORING === false
  && TRUTH_PROVENANCE.PRODUCT_OWNER_REVIEWED === false,
  'authorship is agent-side and the file says so');
ok('TRUTH.never-an-automatic-matcher',
  TRUTH_PROVENANCE.neverUseAs.includes('automatic comparison target'),
  'D08 forbids reconstructing the retired semantic matcher');

for (const c of FROZEN_TRUTH_CASES) {
  const elements =
    c.caseId.length > 0
    && c.purpose.length > 40
    && c.failureFamiliesExercised.length > 0
    && c.observation.length > 200
    && c.establishedByTheText.length > 0
    && c.notEstablishedByTheText.length > 0
    && c.jurisdiction.length > 0
    && c.expectedProperties.length > 0
    && c.temporalOrSequenceRequirements !== undefined
    && c.containmentAndAuthorityExpectation.length >= 4
    && (SAFETY_CLASSIFICATIONS as readonly string[]).includes(c.caseSafetyClassification)
    && c.designIntent.length > 40;
  ok(`TRUTH.${c.caseId}.carries-every-frozen-element`, elements);
}

ok('TRUTH.every-property-status-is-in-the-closed-vocabulary',
  FROZEN_TRUTH_CASES.every(c => c.expectedProperties.every(
    p => (PROPERTY_STATUSES as readonly string[]).includes(p.status))));
ok('TRUTH.every-case-names-at-least-one-decision-critical-property',
  FROZEN_TRUTH_CASES.every(c => c.expectedProperties.some(p => p.decisionCritical)),
  'including the zero-declaration cases, whose decision-critical property is RESOLVED');

ok('TRUTH.expected-fact-count-matches-declared-range',
  FROZEN_TRUTH_CASES.every(c =>
    c.expectedOwedFacts.length >= c.expectedOwedFactCount.min
    && c.expectedOwedFacts.length <= c.expectedOwedFactCount.max));
ok('TRUTH.fact-count-matches-the-205-axis-sets',
  FROZEN_TRUTH_CASES.every(c => {
    const s = COHORT_CASES.find(x => x.caseId === c.caseId);
    return s !== undefined && s.factAxisSets.length === c.expectedOwedFacts.length;
  }),
  `${expectedProjectedFactCount()} frozen facts against the §205 fact slots`);

ok('TRUTH.fact-ids-unique',
  (() => {
    const ids = FROZEN_TRUTH_CASES.flatMap(c => c.expectedOwedFacts.map(f => f.factId));
    return new Set(ids).size === ids.length;
  })());

ok('TRUTH.every-fact-states-what-changes-under-each-branch-state',
  FROZEN_TRUTH_CASES.every(c => c.expectedOwedFacts.every(
    f => f.decisionChangeUnderEachState.length === f.acceptableBranchPartition.length
      && f.decisionChangeUnderEachState.every(d => d.decisionToday.length > 20))),
  'a partition without a decision per state cannot test material divergence');
ok('TRUTH.every-fact-freezes-prohibited-decision-claims',
  FROZEN_TRUTH_CASES.every(c => c.expectedOwedFacts.every(f => f.prohibitedDecisionClaims.length > 0)),
  'F7 is human-adjudicated, so its boundary must be frozen per fact rather than judged at scoring time');
ok('TRUTH.every-fact-freezes-what-would-settle-it',
  FROZEN_TRUTH_CASES.every(c => c.expectedOwedFacts.every(
    f => f.acceptableEvidenceToSettle.length > 0 && f.clarificationMustEstablish.length > 30)));
ok('TRUTH.every-fact-freezes-neighbouring-properties',
  FROZEN_TRUTH_CASES.every(c => c.expectedOwedFacts.every(
    f => f.unacceptableNeighbouringProperties.length > 0)),
  'axis C substitution is preregistered, not judged ad hoc');
ok('TRUTH.every-case-freezes-at-least-one-false-gap-trap',
  FROZEN_TRUTH_CASES.every(c => c.falseGapTraps.length > 0));

// independence must be mutual, and never self-referential
{
  const factCase = new Map<string, string>();
  for (const c of FROZEN_TRUTH_CASES) for (const f of c.expectedOwedFacts) factCase.set(f.factId, c.caseId);
  let mutual = true;
  let selfRef = false;
  for (const c of FROZEN_TRUTH_CASES) {
    for (const f of c.expectedOwedFacts) {
      if (f.independentOf.includes(f.factId)) selfRef = true;
      for (const other of f.independentOf) {
        const partner = c.expectedOwedFacts.find(x => x.factId === other);
        if (partner === undefined || !partner.independentOf.includes(f.factId)) mutual = false;
        if (!f.mayNotBeCollapsedInto.includes(other)) mutual = false;
      }
    }
  }
  ok('TRUTH.independence-is-mutual-and-carries-a-no-merge-rule', mutual && !selfRef,
    'the F1 requirement is symmetric: A independent of B means B independent of A');
}

ok('TRUTH.zero-declaration-cases-carry-no-facts',
  zeroDeclarationCaseIds().every(id => {
    const c = FROZEN_TRUTH_CASES.find(x => x.caseId === id);
    return c !== undefined && c.expectedOwedFacts.length === 0 && !c.clarificationRequired;
  }),
  zeroDeclarationCaseIds().join(','));
ok('TRUTH.zero-declaration-cases-cover-block-B-and-a-governed-control',
  zeroDeclarationCaseIds().length === 4 && zeroDeclarationCaseIds().includes('AC-24'),
  'governed input must not itself manufacture a declaration');

ok('TRUTH.governed-cases-carry-a-governed-condition',
  governedCaseIds().every(id => {
    const c = FROZEN_TRUTH_CASES.find(x => x.caseId === id);
    return c !== null && c !== undefined && c.governed !== null
      && c.governed.suppliedSourceIds.length > 0
      && c.governed.records.length === c.governed.suppliedSourceIds.length
      && c.governed.authorityBoundary.length > 0
      && c.governed.requiresRestraint.length > 0
      && c.governed.prohibitedSourceOrCitationClaims.length > 0;
  }),
  governedCaseIds().join(','));
ok('TRUTH.non-governed-cases-declare-that-any-citation-is-out-of-set',
  FROZEN_TRUTH_CASES.filter(c => c.governed === null).every(
    c => c.containmentAndAuthorityExpectation.some(s => s.includes('no governed record is supplied'))));
ok('TRUTH.AC-22-has-one-bearing-record-and-one-off-point-record',
  (() => {
    const c = FROZEN_TRUTH_CASES.find(x => x.caseId === 'AC-22');
    if (c?.governed == null) return false;
    return c.governed.records.filter(r => r.bearsOnFactIds.length > 0).length === 1
      && c.governed.records.filter(r => r.bearsOnFactIds.length === 0).length === 1;
  })(),
  'axis S needs a real right answer and a real wrong one');
ok('TRUTH.AC-23-supplies-no-bearing-record',
  (() => {
    const c = FROZEN_TRUTH_CASES.find(x => x.caseId === 'AC-23');
    return c?.governed != null && c.governed.records.every(r => r.bearsOnFactIds.length === 0);
  })(),
  'the containment case must not be passable by binding a supplied record');
ok('TRUTH.governed-facts-do-not-depend-on-reading-a-citation',
  governedCaseIds().every(id => {
    const c = FROZEN_TRUTH_CASES.find(x => x.caseId === id);
    return c !== undefined && c.expectedOwedFacts.every(
      f => f.acceptableBranchPartition.every(b => !/\d+\s*CFR|§|section \d/i.test(b)));
  }),
  'the first pass sees governed text through redactCitationTokens, so truth may not depend on it');

// the over-correction guard and the three-state facts must be distinguishable
{
  const ac12 = FROZEN_TRUTH_CASES.find(c => c.caseId === 'AC-12');
  ok('TRUTH.AC-12-is-frozen-as-genuinely-binary',
    ac12 !== undefined && ac12.expectedOwedFacts[0].acceptableBranchPartition.length === 2
    && ac12.falseGapTraps.some(t => t.apparentGap.includes('THIRD branch')),
    'RR-3 is a test to apply, not a shape to impose');
  const threeState = FROZEN_TRUTH_CASES.filter(
    c => c.expectedOwedFacts.some(f => f.acceptableBranchPartition.length === 3)).map(c => c.caseId);
  ok('TRUTH.three-state-facts-are-frozen-where-state-3-is-real',
    threeState.join(',') === 'AC-10,AC-11,AC-15', threeState.join(','));
}

ok('TRUTH.conjunctive-facts-keep-every-conjunct',
  FROZEN_TRUTH_CASES.every(c => c.expectedOwedFacts.every(f => f.conjuncts.length >= 1)));
ok('TRUTH.a-three-conjunct-fact-exists',
  FROZEN_TRUTH_CASES.some(c => c.expectedOwedFacts.some(f => f.conjuncts.length === 3)),
  'S5: §204\'s only conjunctive row had two conjuncts');
ok('TRUTH.temporal-cases-freeze-an-essential-qualifier-on-every-fact',
  FROZEN_TRUTH_CASES.filter(c => c.block === 'E_TEMPORAL_SCOPE').every(
    c => c.temporalOrSequenceRequirements.length > 0
      && c.expectedOwedFacts.every(f => f.essentialQualifiers.length > 0)),
  'F3 is a qualifier-loss defect and the qualifier must be preregistered to be gradeable');

ok('TRUTH.safety-critical-facts-outnumber-ordinary-ones',
  safetyCriticalFactIds().length === 23 && expectedProjectedFactCount() === 24,
  `${safetyCriticalFactIds().length} of ${expectedProjectedFactCount()} facts are safety-critical`);

// ================================================================ 2. adjudication plan

section('2. FROZEN ADJUDICATION PLAN AND THE §205 ROUND TRIP');

const plan207 = adjudicationPlan();

{
  const reconstructed = reconstruct205AxisSets();
  const identical = reconstructed.every(r => {
    const s = COHORT_CASES.find(c => c.caseId === r.caseId);
    return s !== undefined && JSON.stringify(r.factAxisSets) === JSON.stringify(s.factAxisSets);
  });
  ok('PLAN.removing-the-amendments-reproduces-205-exactly', identical,
    '§207 extends the §205 manifest by construction; it does not edit a hash-recorded file');
}
ok('PLAN.row-axes-are-untouched',
  adjudicationPlan().every(p => {
    const s = COHORT_CASES.find(c => c.caseId === p.caseId);
    return s !== undefined && JSON.stringify(p.rowAxes) === JSON.stringify(s.rowAxes);
  }));
ok('PLAN.amendments-declare-a-gate-a-rationale-and-a-reversal-consequence',
  AXIS_AMENDMENTS.every(a => a.requiredByGate.length > 0 && a.rationale.length > 80
    && a.ifReversed.length > 40));

{
  const b = instrumentBudget();
  ok('PLAN.budget-is-measured-not-asserted', b.totalJudgments === b.rowJudgments + b.factJudgments,
    `${b.rowJudgments} row + ${b.factJudgments} fact = ${b.totalJudgments}`);
  ok('PLAN.budget-is-177', b.totalJudgments === 177);
  ok('PLAN.deviation-from-205-is-recorded-openly',
    b.section205Total === 159 && b.addedByAmendments === 18
    && INSTRUMENT_DEVIATION.section207Actual === b.totalJudgments
    && INSTRUMENT_DEVIATION.reversibleByProductOwner,
    `159 -> ${b.totalJudgments}, reversible, consequence stated`);
  ok('PLAN.this-is-not-a-return-to-the-full-factorial',
    b.totalJudgments < b.fullFactorialWouldBe / 2,
    `174 of ${b.fullFactorialWouldBe}`);
}

// ================================================================ 3. gates

section('3. PREREGISTERED GATES');

ok('GATES.are-preregistered', GATES_ARE_PREREGISTERED === true,
  '§205\'s counterpart constant was false; §207 is the preregistration act');
ok('GATES.fifteen-gates', PREREGISTERED_GATES.length === 15);
ok('GATES.thirteen-are-hard-safety-critical', HARD_GATE_IDS.length === 13, HARD_GATE_IDS.join(','));
ok('GATES.ids-unique',
  new Set(PREREGISTERED_GATES.map(g => g.gateId)).size === PREREGISTERED_GATES.length);
ok('GATES.every-gate-records-its-freeze-review',
  PREREGISTERED_GATES.every(g => g.freezeReview.length > 60),
  'the §207 act is a REVIEW of each proposal, not a copy of it');
ok('GATES.every-gate-states-a-denominator-and-a-minimum',
  PREREGISTERED_GATES.every(g => g.denominatorDescription.length > 10
    && Number.isInteger(g.minimumDenominator) && g.minimumDenominator >= 0));
ok('GATES.every-gate-is-reachable-from-at-least-one-case',
  unreachableGateIds().length === 0, 'a gate about nothing is not a gate');
ok('GATES.hard-gates-are-zero-failure-or-one-hundred-percent',
  PREREGISTERED_GATES.filter(g => g.kind === 'HARD_SAFETY_CRITICAL').every(
    g => /100%|0 |zero/i.test(g.threshold)));
ok('GATES.G13-states-what-an-empty-denominator-means',
  (() => {
    const g = PREREGISTERED_GATES.find(x => x.gateId === 'G13');
    return g !== undefined && g.minimumDenominator === 0
      && g.denominatorDescription.includes('NOT_EXERCISED rather than PASSED');
  })(),
  'a gate reporting PASSED on zero occurrences would be the vacuous-CORRECT failure at gate level');
ok('GATES.G5-gates-the-over-correction-direction-too',
  (() => {
    const g = PREREGISTERED_GATES.find(x => x.gateId === 'G5');
    return g !== undefined && g.failsIf.includes('AC-12');
  })(),
  'a gate that punishes only the collapse direction teaches the shape it says it is not teaching');
ok('GATES.G9-remains-human-adjudicated',
  (() => {
    const g = PREREGISTERED_GATES.find(x => x.gateId === 'G9');
    return g !== undefined && /HUMAN-ADJUDICATED AND STAYS THAT WAY/.test(g.freezeReview);
  })(),
  'no deterministic semantic matcher may be added for F7 — D08');
ok('GATES.G12-separates-a-mis-binding-from-a-containment-breach',
  (() => {
    const g = PREREGISTERED_GATES.find(x => x.gateId === 'G12');
    return g !== undefined && g.failsIf.includes('NOT A FAILURE OF THIS GATE');
  })());
ok('GATES.G15-carries-its-own-denominator-limit',
  (() => {
    const g = PREREGISTERED_GATES.find(x => x.gateId === 'G15');
    return g !== undefined && g.kind === 'MEASUREMENT_ONLY' && g.failsIf.includes('cannot carry D14');
  })(),
  'RR-6 is diagnostic; D14 is not ruled by this run');
ok('GATES.G1-applicability-keys-on-the-frozen-classification-not-an-adjudicated-axis',
  (() => {
    const g = PREREGISTERED_GATES.find(x => x.gateId === 'G1');
    return g !== undefined && g.freezeReview.includes('FROZEN per-case classification');
  })(),
  'a gate whose scope depends on a post-run measurement can be resized by the run');

{
  const matrix = gateApplicabilityMatrix();
  ok('GATES.matrix-covers-every-case', matrix.length === 24);
  ok('GATES.every-case-contributes-to-the-deterministic-gates',
    matrix.every(m => ['G3', 'G10', 'G11', 'G12', 'G13'].every(id => m.gateIds.includes(id))));
  ok('GATES.only-safety-critical-cases-are-in-G1',
    matrix.every(m =>
      m.gateIds.includes('G1') === (m.frozenClassification !== 'ORDINARY_NON_ESCALATING')));
  ok('GATES.G2-covers-exactly-the-multi-fact-cases',
    matrix.filter(m => m.gateIds.includes('G2')).map(m => m.caseId).join(',')
      === 'AC-01,AC-02,AC-03,AC-20');
  ok('GATES.G14-covers-exactly-the-governed-cases',
    matrix.filter(m => m.gateIds.includes('G14')).map(m => m.caseId).join(',')
      === governedCaseIds().join(','));
  const g6 = matrix.filter(m => m.gateIds.includes('G6')).length;
  ok('GATES.G6-denominator-is-real', g6 === 11 && instrumentBudget().totalJudgments === 177,
    `axis L on ${g6} cases / 15 facts — the reason AM-1 exists`);
  const g7Cases = matrix.filter(m => m.gateIds.includes('G7')).length;
  ok('GATES.G7-covers-every-safety-critical-fact',
    (() => {
      const withM = new Set(plan207.filter(p => p.factAxisSets.some(sset => sset.includes('M')))
        .flatMap(p => {
          const c = FROZEN_TRUTH_CASES.find(x => x.caseId === p.caseId);
          return (c?.expectedOwedFacts ?? []).map(f => f.factId);
        }));
      return safetyCriticalFactIds().every(id => withM.has(id));
    })(),
    `${g7Cases} cases; no safety-critical fact is left without a clarification slot — the reason AM-2 was widened to block C`);
}

// ================================================================ 4. ordinary quality

section('4. ORDINARY-QUALITY ACCEPTANCE RULE');

ok('OQ.no-headline-percentage', ORDINARY_QUALITY_RULE.aggregatePercentageThreshold === null
  && ORDINARY_QUALITY_RULE.form === 'EXPLICIT_CRITERIA_NOT_A_HEADLINE_PERCENTAGE');
ok('OQ.threshold-is-set-and-not-withheld', ORDINARY_QUALITY_CRITERIA.length >= 5,
  `${ORDINARY_QUALITY_CRITERIA.length} explicit criteria — §205 left this deliberately unset and §207 sets it`);
ok('OQ.cannot-override-a-hard-gate', ORDINARY_QUALITY_RULE.canOverrideAHardGate === false);
ok('OQ.not-tuned-to-history',
  ORDINARY_QUALITY_RULE.notTunedTo.some(s => s.includes('82.4%')),
  '§204\'s clean rate is a descriptive figure from a different cohort, not a bar');
ok('OQ.every-criterion-justifies-its-threshold-from-capability',
  ORDINARY_QUALITY_CRITERIA.every(c => c.justification.length > 120 && c.threshold.length > 5));
ok('OQ.failure-cannot-be-waived-silently',
  ORDINARY_QUALITY_RULE.effectOfFailure.includes('cannot be waived silently'));
ok('OQ.small-denominator-criteria-say-so',
  ORDINARY_QUALITY_CRITERIA.filter(c => ['OQ-3', 'OQ-4'].includes(c.criterionId))
    .every(c => /denominator is only 3|denominator is 3/.test(c.justification)));

// ================================================================ 5. protocols

section('5. FROZEN EXECUTION AND ADJUDICATION PROTOCOLS');

{
  const p = callPlan();
  const s = spendPlan();
  ok('PROTO.call-plan-is-derived-from-the-cohort',
    p.firstPassCalls === 24 && p.verifierCallsExpected === 20 && p.governedStageCallsExpected === 2,
    `${p.expectedTotal} expected, ${p.structuralMax} structural max`);
  ok('PROTO.hard-ceiling-exceeds-the-structural-max', p.hardCallCeiling === 57);
  ok('PROTO.spend-ceiling-exceeds-the-worst-case',
    s.hardSpendCeilingUsd > s.ceilingScenarioUsd,
    `expected USD ${s.expectedUsd}, ceiling scenario USD ${s.ceilingScenarioUsd}, hard ceiling USD ${s.hardSpendCeilingUsd}`);
  ok('PROTO.verifier-cost-is-labelled-an-estimate',
    COST_BASIS.verifierAssumed.measured === false
    && COST_BASIS.firstPassMeasured.measured === true
    && COST_BASIS.governedStageMeasured.measured === true,
    '§206 measured two of the three legs and the third says so');
}

ok('PROTO.every-failure-class-has-a-rule', protocolsSelfCheck().everyFailureClassHasARule);
ok('PROTO.self-check-agrees-with-the-plan', protocolsSelfCheck().judgmentsMatchPlan);
ok('PROTO.a-structural-rejection-aborts-rather-than-adapting',
  (() => {
    const r = FAILURE_RULES.find(x => x.failureClass === 'TRANSPORT_STRUCTURAL');
    return r !== undefined && r.retry === 'ABORT_RUN'
      && r.gateConsequence.includes('NOT SIMPLIFIED, TRUNCATED OR NORMALISED');
  })(),
  'the §206 rule: nothing is rewritten to obtain acceptance');
ok('PROTO.a-provider-failure-never-becomes-a-semantic-verdict',
  FAILURE_RULES.filter(r => ['TRANSPORT_TRANSIENT', 'OUTPUT_TRUNCATED', 'OUTPUT_UNPARSEABLE']
    .includes(r.failureClass)).every(r => r.gateConsequence.includes('denominator')),
  'a case the provider never answered has no semantic result, not a bad one');
ok('PROTO.degenerate-output-is-adjudicated-not-retried',
  (() => {
    const r = FAILURE_RULES.find(x => x.failureClass === 'OUTPUT_DEGENERATE');
    return r !== undefined && r.retry === 'NO_RETRY';
  })(),
  'retrying it would be re-rolling until the answer improves');
ok('PROTO.a-zero-declaration-response-is-never-retried',
  (() => {
    const r = FAILURE_RULES.find(x => x.failureClass === 'NO_FAILURE');
    return r !== undefined && r.retry === 'NO_RETRY'
      && r.gateConsequence.includes('FORBIDDEN');
  })(),
  'retrying silence would systematically re-roll the four cases whose correct answer is silence');
ok('PROTO.retries-are-identical-bytes-only',
  RETRY_POLICY.identicalBytesOnly && RETRY_POLICY.maxPerCall === 1 && RETRY_POLICY.maxPerRun === 6
  && RETRY_POLICY.everyRetryIsLedgered);
ok('PROTO.unintended-replicates-are-preserved',
  RUN_INVARIANTS.unintendedReplicates.includes('UNINTENDED_BYTE_IDENTICAL_REPLICATE'),
  'the §206 ruling: never silently deleted, never reclassified, never used to inflate evidence');
ok('PROTO.zero-database-operations', RUN_INVARIANTS.databaseOperations === 0);

ok('PROTO.deterministic-scoring-is-never-a-suggested-verdict',
  ADJUDICATION_PROTOCOL.order[1].includes('NOT SHOWN AS A SUGGESTED VERDICT'));
ok('PROTO.attribution-is-product-owner-only',
  ADJUDICATION_PROTOCOL.attribution.startsWith('PRODUCT_OWNER'));
ok('PROTO.gates-are-computed-last', ADJUDICATION_PROTOCOL.order[3].includes('GATE COMPUTATION LAST'));
ok('PROTO.incremental-by-default-batched-only-on-authorization',
  ADJUDICATION_PROTOCOL.batching.includes('one review unit at a time')
  && ADJUDICATION_PROTOCOL.batching.includes('authorizes that mode explicitly'));

ok('AMBIG.ambiguous-is-never-a-pass', AMBIGUITY_PROTOCOL.ambiguousIsNeverAPass === true
  && AMBIGUITY_PROTOCOL.ambiguousOnAHardGateSlot.includes('UNDETERMINED blocks acceptance'));
ok('AMBIG.not-exercised-is-never-a-pass', AMBIGUITY_PROTOCOL.notExercisedIsNeverAPass === true
  && AMBIGUITY_PROTOCOL.notExercisedRules.some(r => r.includes('VACUOUS CORRECT IS FORBIDDEN')));
ok('AMBIG.not-exercised-reduces-a-hard-gate-denominator',
  AMBIGUITY_PROTOCOL.notExercisedRules.some(r => r.includes('COVERAGE_INSUFFICIENT')));
ok('AMBIG.provider-failure-not-exercised-is-counted-separately',
  AMBIGUITY_PROTOCOL.notExercisedRules.some(r => r.includes('NOT_EXERCISED_PROVIDER_FAILURE')));

ok('PROTO.evidence-artifacts-are-enumerated',
  EXPECTED_EVIDENCE_ARTIFACTS.length >= 8
  && EXPECTED_EVIDENCE_ARTIFACTS.some(a => a.file === 'CALL-LEDGER.jsonl')
  && EXPECTED_EVIDENCE_ARTIFACTS.some(a => a.file === 'GATE-RESULTS-207.json'));

// ================================================================ 6. preregistration identity

section('6. PREREGISTRATION IDENTITY');

ok('PREREG.state-is-frozen', TRUTH_SPECIFICATION_STATE === 'FROZEN_BEFORE_PROVIDER_EXECUTION');
ok('PREREG.product-owner-review-is-tracked-separately-and-is-NOT-recorded',
  PRODUCT_OWNER_REVIEW.recorded === false
  && PRODUCT_OWNER_REVIEW.whyItIsSeparateFromTheFreeze.includes('§199'),
  'collapsing the freeze and the review would let the freeze manufacture the review');

ok('PREREG.canonicalisation-is-key-order-independent',
  canonicalise({ b: 1, a: { d: 2, c: 3 } }) === canonicalise({ a: { c: 3, d: 2 }, b: 1 }));
ok('PREREG.canonicalisation-preserves-array-order',
  canonicalise({ a: [1, 2] }) !== canonicalise({ a: [2, 1] }),
  'array order is content here — branch partitions and protocol steps are ordered');
ok('PREREG.identity-is-stable-across-calls',
  preregistrationIdentity() === preregistrationIdentity());
ok('PREREG.payload-carries-no-timestamp',
  !/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(canonicalise(preregistrationPayload())),
  're-running the freeze must reproduce the digest, or the digest proves nothing checkable');
ok('PREREG.identity-changes-when-any-frozen-content-changes',
  (() => {
    const p = preregistrationPayload() as Record<string, unknown>;
    const mutated = { ...p, tampered: true };
    return sha256Hex(canonicalise(mutated)) !== preregistrationIdentity();
  })());
ok('PREREG.payload-contains-the-whole-frozen-specification',
  (() => {
    const p = preregistrationPayload() as Record<string, Record<string, unknown>>;
    return (p.cohort.cases as unknown[]).length === 24
      && (p.gates.definitions as unknown[]).length === 15
      && (p.gates.ordinaryQualityCriteria as unknown[]).length >= 5
      && (p.adjudication.plan as unknown[]).length === 24
      && p.rulings !== undefined && p.execution !== undefined;
  })());
ok('PREREG.rulings-record-D08-and-D15-closed-and-D14-open',
  (() => {
    const r = (preregistrationPayload() as Record<string, Record<string, Record<string, unknown>>>).rulings;
    return r.D08.ruling === 'CLOSED' && r.D15.ruling === 'CLOSED' && r.D14.ruling === 'OPEN';
  })());

{
  const record = buildPreregistrationRecord('2026-09-08T00:00:00.000Z');
  ok('PREREG.record-verifies-against-itself-and-the-source',
    verifyPreregistrationRecord(record).code === 'VERIFIED');
  ok('PREREG.frozenAt-is-outside-the-hashed-payload',
    record.envelope.payloadSha256
      === buildPreregistrationRecord('2099-01-01T00:00:00.000Z').envelope.payloadSha256,
    'so its presence cannot explain away a digest mismatch');
  ok('PREREG.a-tampered-payload-is-detected',
    (() => {
      const tampered = {
        envelope: record.envelope,
        payload: { ...record.payload, cohort: { caseCount: 1 } },
      };
      return verifyPreregistrationRecord(tampered).code === 'PAYLOAD_DIGEST_MISMATCH';
    })());
  ok('PREREG.a-self-consistent-but-drifted-record-is-detected',
    (() => {
      const drifted = { ...record.payload, cohort: { caseCount: 1 } };
      const rec = {
        envelope: { ...record.envelope, payloadSha256: sha256Hex(canonicalise(drifted)) },
        payload: drifted,
      };
      return verifyPreregistrationRecord(rec).code === 'IDENTITY_DOES_NOT_MATCH_SOURCE';
    })(),
    'a record and its own digest can be rewritten in one edit; the source comparison catches it');
  ok('PREREG.a-malformed-envelope-is-detected',
    verifyPreregistrationRecord({ payload: {} }).code === 'ENVELOPE_MALFORMED');
  ok('PREREG.a-non-object-record-is-detected',
    verifyPreregistrationRecord('not a record').code === 'RECORD_UNREADABLE');
}

{
  const path = preregistrationPath(repoRoot);
  let onDisk: unknown = null;
  let readable = true;
  try { onDisk = JSON.parse(readFileSync(path, 'utf8')) as unknown; } catch { readable = false; }
  ok('PREREG.the-frozen-record-exists-on-disk', readable, path);
  ok('PREREG.the-frozen-record-on-disk-verifies',
    readable && verifyPreregistrationRecord(onDisk).code === 'VERIFIED');
  ok('PREREG.the-pin-matches-the-frozen-record',
    EXPECTED_PREREGISTRATION_IDENTITY === preregistrationIdentity(),
    EXPECTED_PREREGISTRATION_IDENTITY);
}

// ================================================================ 7. execution gate refusal

section('7. THE EXECUTION GATE REFUSES — THIS IS THE PROOF');

const AUTHORIZED = {
  productOwnerReviewRecorded: true,
  cohortExecutionAuthorized: true,
  authorizationReference: 'HYPOTHETICAL-208-AUTHORIZATION',
};
const GOOD_RECORD = buildPreregistrationRecord('2026-09-08T00:00:00.000Z');

{
  const r = cohortExecutionPermitted({
    repoRoot, governedTransportSmokePassed: true,
    authorization: {
      productOwnerReviewRecorded: false, cohortExecutionAuthorized: false,
      authorizationReference: null,
    },
  });
  ok('GATE.refuses-today', !r.permitted, `${r.blockers.length} blockers`);
  ok('GATE.todays-blockers-are-the-two-product-owner-acts',
    r.blockers.length === 2
    && r.blockers.some(b => b.startsWith('PRODUCT_OWNER_REVIEW_NOT_RECORDED'))
    && r.blockers.some(b => b.startsWith('COHORT_EXECUTION_NOT_AUTHORIZED')),
    r.blockers.map(b => b.split(' ')[0]).join(' | '));
  for (const b of r.blockers) console.log(`        blocker: ${b.slice(0, 110)}...`);
}

ok('GATE.refuses-when-the-record-is-absent',
  (() => {
    const r = cohortExecutionPermitted({
      repoRoot: '/nonexistent-repo-root-for-207-proof',
      governedTransportSmokePassed: true, authorization: AUTHORIZED,
    });
    return !r.permitted && r.blockers.some(b => b.includes('missing or unreadable'));
  })());

ok('GATE.refuses-a-tampered-record',
  (() => {
    const r = cohortExecutionPermitted({
      repoRoot, governedTransportSmokePassed: true, authorization: AUTHORIZED,
      recordOverride: {
        envelope: GOOD_RECORD.envelope,
        payload: { ...GOOD_RECORD.payload, cohort: { caseCount: 1 } },
      },
    });
    return !r.permitted && r.blockers.some(b => b.includes('PAYLOAD_DIGEST_MISMATCH'));
  })());

ok('GATE.refuses-a-self-consistent-but-drifted-record',
  (() => {
    const drifted = { ...GOOD_RECORD.payload, cohort: { caseCount: 1 } };
    const r = cohortExecutionPermitted({
      repoRoot, governedTransportSmokePassed: true, authorization: AUTHORIZED,
      recordOverride: {
        envelope: { ...GOOD_RECORD.envelope, payloadSha256: sha256Hex(canonicalise(drifted)) },
        payload: drifted,
      },
    });
    return !r.permitted && r.blockers.some(b => b.includes('IDENTITY_DOES_NOT_MATCH_SOURCE'));
  })());

ok('GATE.refuses-when-the-pin-and-the-record-disagree',
  (() => {
    const r = cohortExecutionPermitted({
      repoRoot, governedTransportSmokePassed: true, authorization: AUTHORIZED,
      recordOverride: GOOD_RECORD, pinOverride: 'f'.repeat(64),
    });
    return !r.permitted && r.blockers.some(b => b.includes('does not match the expected identity'));
  })(),
  'the pin lives in a different file from the record, so one edit cannot satisfy both');

ok('GATE.refuses-an-unfrozen-truth-specification',
  (() => {
    const r = cohortExecutionPermitted({
      repoRoot, governedTransportSmokePassed: true, authorization: AUTHORIZED,
      recordOverride: GOOD_RECORD, truthSpecificationState: 'PRODUCT_OWNER_REVIEWED',
    });
    return !r.permitted && r.blockers.some(b => b.includes('not FROZEN_BEFORE_PROVIDER_EXECUTION'));
  })());

ok('GATE.refuses-without-the-governed-transport-smoke',
  (() => {
    const r = cohortExecutionPermitted({
      repoRoot, governedTransportSmokePassed: false, authorization: AUTHORIZED,
      recordOverride: GOOD_RECORD,
    });
    return !r.permitted && r.blockers.some(b => b.includes('transport smoke has not passed'));
  })());

ok('GATE.refuses-an-authorization-with-no-reference',
  (() => {
    const r = cohortExecutionPermitted({
      repoRoot, governedTransportSmokePassed: true, recordOverride: GOOD_RECORD,
      authorization: {
        productOwnerReviewRecorded: true, cohortExecutionAuthorized: true,
        authorizationReference: null,
      },
    });
    return !r.permitted && r.blockers.some(b => b.startsWith('COHORT_EXECUTION_NOT_AUTHORIZED'));
  })());

ok('GATE.permits-only-when-every-condition-is-met',
  (() => {
    const r = cohortExecutionPermitted({
      repoRoot, governedTransportSmokePassed: true, authorization: AUTHORIZED,
      recordOverride: GOOD_RECORD,
    });
    return r.permitted && r.blockers.length === 0;
  })(),
  'the gate is a gate, not a refusal — it opens on a recorded review plus a referenced authorization');

// ================================================================ 8. effects

section('8. EFFECTS');

{
  const t = truthSpecificationEffect();
  const g = gatesEffect();
  const p = preregistrationEffect();
  const e = executionGateEffect();
  ok('EFFECT.zero-provider-calls',
    t.providerCalls === 0 && g.providerCalls === 0 && p.providerCalls === 0 && e.providerCalls === 0);
  ok('EFFECT.zero-database-operations',
    t.databaseOperations === 0 && g.databaseOperations === 0
    && p.databaseOperations === 0 && e.databaseOperations === 0);
  ok('EFFECT.nothing-is-executed',
    !t.anythingIsExecuted && !g.anythingIsExecuted && !p.anythingIsExecuted && !e.anythingIsExecuted);
  ok('EFFECT.the-cohort-is-not-authorized',
    !p.cohortIsAuthorized && !e.cohortIsAuthorized);
  ok('EFFECT.no-semantic-comparison-is-automated', !t.compareToModelOutputAutomatically,
    'D08: deterministic code never compares model output against this specification');
}

console.log(`\n================ ${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
