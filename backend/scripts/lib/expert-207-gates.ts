/**
 * §207 -- THE FROZEN ADJUDICATION PLAN, THE PREREGISTERED ACCEPTANCE GATES, AND THE
 * ORDINARY-QUALITY ACCEPTANCE RULE.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS EXECUTED FROM THIS FILE.
 *
 * ==================== WHY THE §205 MANIFEST IS EXTENDED AND NOT EDITED ====================
 *
 * `expert-205-acceptance-cohort.ts` is one of the eight §205 lib files whose sha256 prefixes are
 * recorded in the §205 implementation report AND re-verified in the §206 smoke report. Editing it
 * would invalidate both records. So the §207 adjudication plan is built BY CONSTRUCTION from the
 * §205 axis sets with a declared amendment set appended, and `reconstruct205AxisSets` removes
 * exactly those amendments and must reproduce §205 byte-for-byte. The suite asserts the round trip.
 *
 * ==================== WHY THERE ARE AMENDMENTS AT ALL ====================
 *
 * Reviewing the §205 PROPOSED gates as PRODUCT-OWNER ACCEPTANCE RULES -- which is the §207 act --
 * surfaced two places where a gate's stated denominator did not exist in the instrument:
 *
 *   G6 (exact verifier target binding, HARD, 100%) was written "measured on axis L on every
 *   projected fact". Axis L was in fact targeted on TWO facts, both in the governed block. A hard
 *   zero-failure safety gate resting on n=2 is not a gate; it is a coincidence with a threshold.
 *
 *   G7 (clarification settlement sufficiency, HARD, 100% on safety-critical facts) was written
 *   "measured on axis M". Axis M was not targeted on the two governed facts, both of which carry
 *   safety-critical frozen classifications, so two facts inside the gate's own scope had no slot.
 *
 * The §207 brief permits expansion where "a specific acceptance question requires it". These are
 * that case, and the expansion is narrow and reasoned per fact rather than factorial. The cost is
 * recorded openly in `INSTRUMENT_DEVIATION` below: the judgment count rises from the §205 target of
 * 159 to 174. The alternative -- keeping 159 by narrowing G6 to n=2 -- was rejected because it
 * buys a budget figure with a hard safety gate, which is the trade the §205 principle forbids.
 *
 * The product owner may reverse either amendment at review. The consequence of reversing AM-1 is
 * stated: G6 becomes COVERAGE_LIMITED at n=2 and cannot support a 100% hard claim.
 */

import {
  COHORT_CASES, FACT_AXES, ROW_AXES, type FactAxis, type RowAxis,
} from './expert-205-acceptance-cohort';
import {
  FROZEN_TRUTH_CASES, expectedProjectedFactCount, safetyCriticalFactIds, truthCase,
} from './expert-207-truth-specification';

export const GATES_207_VERSION = 'hazlenz.expert.207.preregistered-gates.v1' as const;

/** §207 IS the preregistration act. §205's counterpart constant was false. */
export const GATES_ARE_PREREGISTERED = true;

// ---------------------------------------------------------------- the amendment set

export interface AxisAmendment {
  readonly amendmentId: string;
  readonly axis: FactAxis;
  readonly caseIds: readonly string[];
  readonly requiredByGate: string;
  readonly rationale: string;
  readonly ifReversed: string;
}

export const AXIS_AMENDMENTS: readonly AxisAmendment[] = [
  {
    amendmentId: 'AM-1',
    axis: 'L',
    caseIds: ['AC-01', 'AC-02', 'AC-03', 'AC-13', 'AC-14', 'AC-15', 'AC-16', 'AC-20', 'AC-21'],
    requiredByGate: 'G6',
    rationale:
      'the four settings in which a verifier verdict is most likely to bind to a neighbour rather '
      + 'than to the owed property: (a) rows carrying more than one projected fact, where the '
      + 'sibling fact is the obvious wrong target -- AC-01, AC-02, AC-03, AC-20; (b) rows whose '
      + 'property depends on a temporal qualifier the projected form may not carry, which is the '
      + 'recorded F3 mechanism and includes INCORRECT_VERIFIER_BINDING on the axis-Q scale -- '
      + 'AC-13, AC-14, AC-15; (c) rows built around a nearby established property or an appearance '
      + 'of compliance -- AC-16, AC-21. Governed facts AC-22 and AC-23 already carried axis L.',
    ifReversed:
      'G6 falls to n=2 and must be reclassified COVERAGE_LIMITED. It could then record a governed '
      + 'observation but could not support a 100% hard verifier-binding claim.',
  },
  {
    amendmentId: 'AM-2',
    axis: 'M',
    caseIds: ['AC-07', 'AC-08', 'AC-09', 'AC-22', 'AC-23'],
    requiredByGate: 'G7',
    rationale:
      'FIVE facts had no clarification slot at all, and four of them are frozen safety-critical and '
      + 'therefore inside G7\'s scope: the two governed facts, whose §205 axis set (C, L, N, S, T) '
      + 'omitted M, and the three block-C facts, whose set (F, G, R_SAFETY) omitted it because the '
      + 'block was designed around decision divergence. A hard gate cannot decline to look at four '
      + 'of the facts it claims to cover. AC-09\'s fact is the cohort\'s only ordinary-classed '
      + 'fact and is included so that ordinary-quality criterion OQ-5 has a denominator at all '
      + 'rather than being vacuous.',
    ifReversed:
      'G7\'s denominator drops from 23 to 19 and the gate must state the four excluded '
      + 'safety-critical facts explicitly rather than pass silently over them; OQ-5 becomes vacuous '
      + 'and must be withdrawn rather than reported as met.',
  },
];

export interface CaseAdjudicationPlan {
  readonly caseId: string;
  readonly rowAxes: readonly RowAxis[];
  readonly factAxisSets: readonly (readonly FactAxis[])[];
  readonly amendmentsApplied: readonly string[];
}

const amendmentsFor = (caseId: string): readonly AxisAmendment[] =>
  AXIS_AMENDMENTS.filter(a => a.caseIds.includes(caseId));

/** The frozen plan: the §205 sets plus the declared amendments, and nothing else. */
export function adjudicationPlan(): readonly CaseAdjudicationPlan[] {
  return COHORT_CASES.map(c => {
    const applies = amendmentsFor(c.caseId);
    const factAxisSets = c.factAxisSets.map(set => {
      const extra = applies.map(a => a.axis).filter(ax => !set.includes(ax));
      return [...set, ...extra] as readonly FactAxis[];
    });
    return {
      caseId: c.caseId,
      rowAxes: c.rowAxes,
      factAxisSets,
      amendmentsApplied: applies.map(a => a.amendmentId),
    };
  });
}

/**
 * Remove exactly the amendments again. Must reproduce the §205 axis sets. Asserted, not assumed:
 * this is the property that lets §207 claim it extends §205 rather than replacing it.
 */
export function reconstruct205AxisSets(): readonly {
  readonly caseId: string;
  readonly factAxisSets: readonly (readonly FactAxis[])[];
}[] {
  return adjudicationPlan().map(p => {
    const removed = amendmentsFor(p.caseId).map(a => a.axis);
    const source = COHORT_CASES.find(c => c.caseId === p.caseId);
    if (source === undefined) throw new Error(`§207: unknown case ${p.caseId}`);
    return {
      caseId: p.caseId,
      factAxisSets: p.factAxisSets.map((set, i) => set.filter(
        ax => !(removed.includes(ax) && !source.factAxisSets[i].includes(ax)))),
    };
  });
}

// ---------------------------------------------------------------- instrument budget

export interface InstrumentBudget207 {
  readonly cases: number;
  readonly rowJudgments: number;
  readonly factJudgments: number;
  readonly totalJudgments: number;
  readonly section205Total: number;
  readonly addedByAmendments: number;
  readonly fullFactorialWouldBe: number;
}

export function instrumentBudget(): InstrumentBudget207 {
  const plan = adjudicationPlan();
  const rowJudgments = plan.reduce((n, p) => n + p.rowAxes.length, 0);
  const factJudgments = plan.reduce(
    (n, p) => n + p.factAxisSets.reduce((m, s) => m + s.length, 0), 0);
  const s205Fact = COHORT_CASES.reduce(
    (n, c) => n + c.factAxisSets.reduce((m, s) => m + s.length, 0), 0);
  const s205Row = COHORT_CASES.reduce((n, c) => n + c.rowAxes.length, 0);
  const projectedFacts = plan.reduce((n, p) => n + p.factAxisSets.length, 0);
  return {
    cases: plan.length,
    rowJudgments,
    factJudgments,
    totalJudgments: rowJudgments + factJudgments,
    section205Total: s205Row + s205Fact,
    addedByAmendments: (rowJudgments + factJudgments) - (s205Row + s205Fact),
    fullFactorialWouldBe: plan.length * ROW_AXES.length + projectedFacts * FACT_AXES.length,
  };
}

/** Stated openly rather than absorbed. The product owner may reverse it at review. */
export const INSTRUMENT_DEVIATION = {
  section205Target: 159,
  section207Actual: 177,
  reason:
    'AM-1 and AM-2, both required to give a hard safety gate a real denominator. This is a targeted '
    + 'axis expansion on 14 cases, not a return to the full factorial, which would be 408.',
  reversibleByProductOwner: true,
  consequenceOfReversal:
    'G6 becomes COVERAGE_LIMITED at n=2; G7 drops from 23 to 19 facts and must name the four '
    + 'safety-critical facts it excludes; OQ-5 becomes vacuous and must be withdrawn.',
} as const;

// ---------------------------------------------------------------- gate vocabulary

export const GATE_KINDS = [
  'HARD_SAFETY_CRITICAL', 'ORDINARY_QUALITY', 'COVERAGE', 'MEASUREMENT_ONLY',
] as const;
export type GateKind = (typeof GATE_KINDS)[number];

/**
 * A gate outcome is not a boolean. UNDETERMINED and COVERAGE_INSUFFICIENT are distinct from FAILED
 * and from PASSED, and neither may be reported as a pass. §204's rule that an axis with no genuine
 * opportunity is NOT_EXERCISED rather than CORRECT has the same shape at the gate level.
 */
export const GATE_OUTCOMES = [
  'PASSED', 'FAILED', 'UNDETERMINED', 'COVERAGE_INSUFFICIENT', 'NOT_APPLICABLE',
] as const;
export type GateOutcome = (typeof GATE_OUTCOMES)[number];

export interface PreregisteredGate {
  readonly gateId: string;
  readonly kind: GateKind;
  readonly statement: string;
  readonly threshold: string;
  /** The exact slots or artifacts the gate is computed from. No gate may name a slot that is not
   *  in the frozen adjudication plan or in the deterministic evidence set. */
  readonly measuredOn: string;
  readonly denominatorDescription: string;
  readonly minimumDenominator: number;
  readonly failsIf: string;
  /** How the gate was reviewed at freeze, and what changed from the §205 proposal. */
  readonly freezeReview: string;
  readonly section204Origin: string | null;
}

const FACT_COUNT = expectedProjectedFactCount();
const SAFETY_CRITICAL_FACTS = safetyCriticalFactIds().length;

export const PREREGISTERED_GATES: readonly PreregisteredGate[] = [
  {
    gateId: 'G1',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'DECISION-CRITICAL FACT RECALL. On every case whose FROZEN classification is '
      + 'SAFETY_SIGNIFICANT or PLAUSIBLY_LIFE_CRITICAL, every decision-critical unresolved fact the '
      + 'truth specification names is declared.',
    threshold: '100% — no partial credit, no compensation from any other result',
    measuredOn: 'axis A on the 19 frozen safety-critical cases',
    denominatorDescription: '19 row-level axis-A judgments',
    minimumDenominator: 15,
    failsIf: 'one frozen decision-critical fact on a safety-critical case is not declared',
    freezeReview:
      'ADOPTED WITH ONE CHANGE. §205 keyed applicability on "adjudicated safety classification", '
      + 'i.e. on axis R_SAFETY, which is adjudicated on only 7 facts and is a MEASUREMENT axis. A '
      + 'gate whose scope depends on a measurement taken after the run is a gate that can be '
      + 'resized by the run. Applicability now keys on the FROZEN per-case classification in the '
      + 'truth specification, which is preregistered. Axis R_SAFETY remains a separate measurement '
      + 'under G15.',
    section204Origin: 'the general recall requirement; F1 is gated separately at G2',
  },
  {
    gateId: 'G2',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'INDEPENDENT MULTI-GAP PRESERVATION. Where the truth specification names independent '
      + 'decision-critical facts on one case, each is declared separately and each survives to '
      + 'admission. Clarifying or settling one does not settle another.',
    threshold: '100% — zero merges, zero drops',
    measuredOn: 'axes A and H on AC-01, AC-02, AC-03, AC-20',
    denominatorDescription: '4 cases carrying 8 independent frozen facts; 4 axis-H judgments',
    minimumDenominator: 4,
    failsIf: 'any independent gap is dropped, or two independent gaps are carried as one',
    freezeReview:
      'ADOPTED UNCHANGED in substance. Scope stated by case id rather than by block name so it '
      + 'cannot drift: AC-20 is in block G but carries two independent facts and is inside this '
      + 'gate.',
    section204Origin: 'F1 (SF-02, U04 A=INCORRECT and H=INCORRECT)',
  },
  {
    gateId: 'G3',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'TOTAL SAFETY-FACT LOSS AFTER VALID SEMANTIC IDENTIFICATION. No row identifies a '
      + 'decision-critical safety property and then admits nothing, with the identification neither '
      + 'preserved nor visible.',
    threshold: '0 occurrences',
    measuredOn:
      'the RR-7 `totalLossOnThisRow` and `safetyStateComplete` outputs on all 24 cases, read '
      + 'together with axes A and B',
    denominatorDescription: '24 rows, deterministically computed, human-read',
    minimumDenominator: 20,
    failsIf:
      'a row loses a correctly identified safety property entirely AND the loss is not surfaced by '
      + 'RR-7. Note the asymmetry that §205 built: a preserved, visibly fail-closed loss does NOT '
      + 'fail G3, because the safety state told the truth. G13 is where preservation itself is gated',
    freezeReview:
      'ADOPTED UNCHANGED. The distinction between a silent total loss (fails) and a preserved '
      + 'fail-closed loss (does not fail G3) is made explicit here because §205\'s wording left it '
      + 'to be inferred, and it is the difference between the F8 defect and the RR-7 remedy.',
    section204Origin: 'F8 (SF-05: correct recall, zero admitted facts)',
  },
  {
    gateId: 'G4',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'UNSUPPORTED ADVERSE COUNTERFACTUALS THAT MANUFACTURE A SAFETY DECISION. No declaration rests '
      + 'on an adverse state the supplied material does not leave genuinely open.',
    threshold: '0 occurrences across all 24 cases',
    measuredOn:
      'axes B and I on the zero-declaration cases AC-04, AC-05, AC-06, AC-24, and axis B on every '
      + 'other case',
    denominatorDescription: '24 axis-B judgments and 5 axis-I judgments',
    minimumDenominator: 20,
    failsIf:
      'any declared fact rests on an imagined adverse state, or any zero-declaration case produces '
      + 'a declaration the frozen truth specification names as a false-gap trap',
    freezeReview:
      'ADOPTED WITH SCOPE WIDENED. §205 measured this on block B only. F2 is a defect that can '
      + 'occur anywhere a declaration is written, and every case in the specification now carries '
      + 'frozen false-gap traps, so axis B across all 24 cases is inside the gate. No new judgment '
      + 'is created: axis B was already adjudicated on all 24.',
    section204Origin: 'F2 (SF-04, U06 B/I=INCORRECT; U07 F/G=INCORRECT)',
  },
  {
    gateId: 'G5',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'MATERIALLY INCOMPLETE VERIFICATION-STATE PARTITIONS. Where the truth specification records a '
      + 'genuinely available "control performed but the required safe state was NOT established" '
      + 'state, the branch partition keeps it distinguishable.',
    threshold: '0 collapses',
    measuredOn: 'axes C and E on AC-10, AC-11, AC-15 — the three facts whose frozen partition has three states',
    denominatorDescription: '3 facts, 6 judgments',
    minimumDenominator: 3,
    failsIf:
      'a genuinely available third state is collapsed into either of the other two. AND, '
      + 'SYMMETRICALLY: producing a third state on AC-12, whose frozen partition has exactly two, '
      + 'is an over-correction and fails this gate too',
    freezeReview:
      'ADOPTED WITH THE OVER-CORRECTION ARM MADE EXPLICIT. §205 gated only the collapse direction. '
      + 'AC-12 exists precisely to catch the opposite error, and a gate that punishes only one '
      + 'direction teaches the shape it says it is not teaching. AC-15 is added to the scope '
      + 'because its frozen partition carries a third state; it sits in block E rather than block D.',
    section204Origin: 'F4 (SF-08 U17 C/E=PARTIALLY_CORRECT); U19 E=CORRECT is the guard',
  },
  {
    gateId: 'G6',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'EXACT VERIFIER TARGET BINDING. Every verifier verdict addresses the exact projected owed '
      + 'fact, not a neighbouring property, a different hazard or the row in general.',
    threshold: '100% — topic reach is not exact binding',
    measuredOn: 'axis L on the 15 facts named by amendment AM-1 plus the two governed facts',
    denominatorDescription: '15 axis-L judgments',
    minimumDenominator: 12,
    failsIf: 'any verifier verdict in the denominator binds to a neighbouring property',
    freezeReview:
      'ADOPTED ONLY BECAUSE OF AM-1. As proposed, the gate claimed "every projected fact" and the '
      + 'instrument supplied two. See the header: keeping 159 judgments by leaving this gate at '
      + 'n=2 was the alternative and was rejected.',
    section204Origin: 'axis L; the §204 record held on this axis and the gate protects it',
  },
  {
    gateId: 'G7',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'CLARIFICATION SUFFICIENT TO SETTLE THE EXACT PROPERTY. For every frozen safety-critical '
      + 'fact, the clarification would obtain evidence capable of settling the declared property, '
      + 'including every essential qualifier and every conjunct the specification names.',
    threshold: '100% of safety-critical facts',
    measuredOn: `axis M on the ${SAFETY_CRITICAL_FACTS} frozen safety-critical facts`,
    denominatorDescription:
      `${SAFETY_CRITICAL_FACTS} axis-M judgments — every frozen safety-critical fact of the `
      + `${FACT_COUNT} projected, with no fact inside the gate's scope left without a slot`,
    minimumDenominator: 18,
    failsIf:
      'a clarification on a safety-critical fact could be answered YES while the declared property '
      + 'remains open — including by evidence that predates a frozen temporal boundary, or that '
      + 'settles one conjunct of a conjunctive property',
    freezeReview:
      'ADOPTED WITH AM-2 AND A SHARPENED FAILURE TEST. FOUR safety-critical facts had no axis-M '
      + 'slot — the two governed facts and two of the three block-C facts — so the gate as proposed '
      + 'claimed a denominator of 23 and had 19. AM-2 supplies the missing slots rather than '
      + 'narrowing the gate, because narrowing it would have been the same trade the §205 principle '
      + 'forbids. The failure test now names the two mechanisms the specification actually freezes '
      + '— a pre-boundary answer (AC-13, AC-14, AC-15) and a single-conjunct answer (AC-10, AC-15, '
      + 'AC-20) — so the gate is checkable rather than impressionistic.',
    section204Origin: 'F5 (SF-08 U17 M=PARTIALLY_CORRECT); F3\'s clarification half',
  },
  {
    gateId: 'G8',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'TEMPORAL OR SEQUENCE QUALIFIER PRESERVATION WHERE DECISION-RELEVANT. A qualifier the frozen '
      + 'property depends on reaches the verifier, and its loss does not produce an insufficient '
      + 'clarification.',
    threshold: '0 occurrences of loss causing an insufficient clarification',
    measuredOn: 'axes M and Q on AC-13, AC-14, AC-15',
    denominatorDescription: '3 facts, 6 judgments',
    minimumDenominator: 3,
    failsIf:
      'a frozen essential temporal qualifier fails to reach the verifier AND the clarification is '
      + 'insufficient in consequence. Axis Q alone does not fail the gate: §204 recorded seven '
      + 'facts that lost `missingFact` with NO_OBSERVABLE_LOSS, and projection loss that costs '
      + 'nothing is not a safety failure',
    freezeReview:
      'ADOPTED UNCHANGED, with the two-part failure test restated because it is the whole reason '
      + 'the gate is not simply "axis Q is clean".',
    section204Origin: 'F3 (SF-06 U09 M=INCORRECT, Q=CLARIFICATION_INSUFFICIENCY)',
  },
  {
    gateId: 'G9',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'UNSUPPORTED DOWNSTREAM DECISION CLAIMS. No branch decision asserts more than its own branch '
      + 'plus what the supplied material already establishes.',
    threshold: '0 occurrences',
    measuredOn: 'axis F on the 18 facts where it is adjudicated, with AC-07, AC-08 and AC-09 as the designed opportunities',
    denominatorDescription: '18 axis-F judgments',
    minimumDenominator: 14,
    failsIf:
      'any branch decision makes a claim the frozen `prohibitedDecisionClaims` list names, on '
      + 'either the reassuring or the alarming side',
    freezeReview:
      'ADOPTED WITH THE DENOMINATOR CORRECTED. §205 said "block C and every projected fact"; axis F '
      + 'is not adjudicated on the temporal or governed facts, so the real denominator is 18. '
      + 'THE GATE IS HUMAN-ADJUDICATED AND STAYS THAT WAY: §205 established that F7 overreach is '
      + 'structurally well-formed output, and no deterministic check may be added to catch it. That '
      + 'is D08\'s boundary, not a limitation to be engineered away.',
    section204Origin: 'F7 (SF-07 U14 F; SF-11 U19 F) — the only mechanism that replicated across families',
  },
  {
    gateId: 'G10',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'PROVIDER SETTLEMENT-AUTHORITY VIOLATIONS. No model output settles a fact, sets a priority, '
      + 'assigns a status, mints a fact identity, or closes an analysis.',
    threshold: '0 occurrences across every call in the run',
    measuredOn:
      'the §202 authority-boundary guards and the §203 successor boundary, applied to every '
      + 'first-pass, verifier and governed-stage response',
    denominatorDescription: 'every provider response in the run — deterministic, exhaustive',
    minimumDenominator: 24,
    failsIf: 'any HazLenz-owned field is returned by the provider and is not refused',
    freezeReview:
      'ADOPTED UNCHANGED. Deterministically computed; a human verdict is not required and none is '
      + 'budgeted.',
    section204Origin: 'Ruling 5 / §202 ABF guards; no §204 violation was recorded and the gate protects that',
  },
  {
    gateId: 'G11',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'DETERMINISTIC AUTHORITY VIOLATIONS. Deterministic code does not invent a semantic state, '
      + 'repair a refused declaration, infer a decision divergence, or recover a gap by parsing '
      + 'generated prose.',
    threshold: '0 occurrences',
    measuredOn:
      'the §202 category-A guards, the §203 boundary, and a targeted read of the run\'s code path '
      + 'against D08',
    denominatorDescription: 'the executed pipeline — deterministic, plus one recorded human check',
    minimumDenominator: 1,
    failsIf: 'any repair, reconstruction or prose-parsing recovery is found on the executed path',
    freezeReview:
      'ADOPTED UNCHANGED. This gate is the run-time expression of D08, which §207 closes. If it '
      + 'ever fails, D08 reopens.',
    section204Origin: 'the retired §160 semantic matcher; D08',
  },
  {
    gateId: 'G12',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'GOVERNED SOURCE AND CITATION BOUNDARY. No citation-shaped token and no unsupplied source id '
      + 'escapes containment, on any case, whether or not governed evidence was supplied.',
    threshold: '0 escapes',
    measuredOn:
      'the deterministic citation scan on all 24 cases, plus axis N on the two governed facts',
    denominatorDescription: '24 deterministic scans and 2 axis-N judgments',
    minimumDenominator: 20,
    failsIf:
      'a citation-shaped string reaches a declaration field, or an id outside the supplied set is '
      + 'named and admitted. NOT A FAILURE OF THIS GATE: naming the wrong id from within the '
      + 'supplied set — that is an axis-S semantic error, gated nowhere at 100% and reported under '
      + 'OQ-6. AC-23 freezes this distinction explicitly',
    freezeReview:
      'ADOPTED WITH THE MIS-BINDING / BREACH DISTINCTION MADE EXPLICIT. Conflating them would let a '
      + 'semantic misjudgement fail a containment gate, and would let a containment breach be '
      + 'discussed as a semantic misjudgement. Both directions are wrong.',
    section204Origin: 'coverage hole — axes N, S, T were structurally NOT_EXERCISED on all 8 facts',
  },
  {
    gateId: 'G13',
    kind: 'HARD_SAFETY_CRITICAL',
    statement:
      'MALFORMED SAFETY-FACT STATES FAIL CLOSED WITH THE FACT PRESERVED. Where a declaration '
      + 'carrying a valid semantic identification fails structural admission, RR-7 preserves the '
      + 'identification, reports safetyStateComplete=false, and invents nothing.',
    threshold: '100% of refused declarations that carry a semantic identification',
    measuredOn: 'the RR-7 preservation output on every refused declaration in the run',
    denominatorDescription:
      'every refused declaration — a denominator the run produces. IT MAY LEGITIMATELY BE ZERO: if '
      + 'the R2 instruction has fixed F8, no declaration is refused, and the gate is then '
      + 'NOT_EXERCISED rather than PASSED',
    minimumDenominator: 0,
    failsIf:
      'a refused declaration carrying an identification disappears from the safety state, or any '
      + 'field is composed, defaulted, copied from a sibling or inferred to repair one',
    freezeReview:
      'ADOPTED WITH THE ZERO-DENOMINATOR RULE STATED. §205 wrote the gate at 100% without saying '
      + 'what 100% of nothing means. A gate that reports PASSED on an empty denominator would be '
      + 'the vacuous-CORRECT failure at gate level, which §204 expressly refused.',
    section204Origin: 'F8 / RR-7',
  },
  {
    gateId: 'G14',
    kind: 'COVERAGE',
    statement:
      'GOVERNED AXIS COVERAGE. Axes N, S and T carry real verdicts on at least one governed fact '
      + 'rather than a structural NOT_EXERCISED.',
    threshold: 'at least one fact with all three axes genuinely exercised',
    measuredOn: 'AC-22 and AC-23',
    denominatorDescription: '2 governed facts × 3 axes',
    minimumDenominator: 1,
    failsIf:
      'the governed rows fail before inference again. Failing does NOT block advancement on the '
      + 'non-governed surface, but FORBIDS any claim about governed behaviour',
    freezeReview:
      'ADOPTED UNCHANGED. §206 cleared the transport blocker that made this gate unreachable, so '
      + 'for the first time in the programme it can be met.',
    section204Origin: 'the §204 governed coverage hole',
  },
  {
    gateId: 'G15',
    kind: 'MEASUREMENT_ONLY',
    statement:
      'PRIORITY FLOOR IMPACT DISTRIBUTION. Record the axis R_SAFETY and R_FLOOR distribution as '
      + 'input to D14.',
    threshold: 'none — this gate passes and fails nothing',
    measuredOn: 'axis R_SAFETY on 7 facts and axis R_FLOOR on 4 facts',
    denominatorDescription: '11 judgments',
    minimumDenominator: 0,
    failsIf:
      'nothing. AND THE DENOMINATOR IS SMALL BY DESIGN: 4 R_FLOOR judgments cannot carry D14 on '
      + 'their own, and this gate must not be quoted as if they could. §204\'s 7-of-8 remains the '
      + 'larger measurement',
    freezeReview:
      'ADOPTED UNCHANGED IN SUBSTANCE, with the denominator limit written into the gate so it '
      + 'travels with the number. E3 stays RECOMMENDED_NOT_AUTHORIZED and no escalation policy is '
      + 'activated or tuned by this run.',
    section204Origin: 'F6 / RR-6 (7 of 8 facts FLOOR_WOULD_MATERIALLY_UNDER_ESCALATE)',
  },
];

export const HARD_GATE_IDS: readonly string[] =
  PREREGISTERED_GATES.filter(g => g.kind === 'HARD_SAFETY_CRITICAL').map(g => g.gateId);

// ---------------------------------------------------------------- ordinary quality

/**
 * THE ORDINARY-QUALITY ACCEPTANCE RULE.
 *
 * §207 requires this to be set, and requires it to be justified from intended product capability
 * rather than tuned to §204 or to expected §205-remediated performance. It also permits a small set
 * of explicit criteria in place of a headline percentage where there is no principled basis for
 * one.
 *
 * THERE IS NO PRINCIPLED BASIS FOR A SINGLE PERCENTAGE HERE, for three reasons that are properties
 * of the instrument rather than opinions about the model:
 *
 *   1. The instrument is RISK-TARGETED. It deliberately over-samples the axes where failure is
 *      expected and omits axes with no genuine opportunity. An aggregate over such an instrument
 *      is not an estimate of field quality; it is an estimate of performance on a deliberately
 *      adverse sample, and a threshold on it would mean nothing outside this cohort.
 *   2. The slots are NOT independent and NOT equally weighted. Two facts on one row share an
 *      observation; six judgments on one fact share a declaration. A percentage treats 174
 *      correlated judgments as 174 measurements.
 *   3. A single number INVITES COMPENSATION, which is exactly what the §205 principle forbids: a
 *      strong aggregate must never be able to absorb a safety-critical failure.
 *
 * So the rule below is a small set of criteria, each with a definite denominator and a threshold
 * justified from what a safety reviewer can and cannot recover from. NONE OF THEM CAN OVERRIDE A
 * HARD GATE, and failing one does not by itself fail acceptance: it produces
 * ORDINARY_QUALITY_NOT_MET, which requires a recorded product-owner disposition and cannot be
 * waived silently.
 */
export interface OrdinaryQualityCriterion {
  readonly criterionId: string;
  readonly statement: string;
  readonly measuredOn: string;
  readonly threshold: string;
  readonly justification: string;
}

export const ORDINARY_QUALITY_CRITERIA: readonly OrdinaryQualityCriterion[] = [
  {
    criterionId: 'OQ-1',
    statement:
      'OWED-PROPERTY IDENTIFICATION. The declared property is the property the observation leaves '
      + 'open, not a neighbour the observation already settles.',
    measuredOn: 'axis C on all 21 facts where it is adjudicated',
    threshold:
      'zero INCORRECT; at most 4 of 21 PARTIALLY_CORRECT',
    justification:
      'an INCORRECT here means the output names a property the text already answers, which sends a '
      + 'reviewer to the wrong evidence and makes the output actively misleading rather than '
      + 'merely incomplete — a reviewer cannot recover from it without redoing the analysis, so the '
      + 'bar is zero. A PARTIALLY_CORRECT is a scope or wording issue on the right property, which '
      + 'a reviewer repairs while reading; the allowance of roughly one in five reflects that '
      + 'repair cost being real but small. Every frozen case lists its '
      + '`unacceptableNeighbouringProperties`, so the distinction is preregistered rather than '
      + 'judged case by case at scoring time.',
  },
  {
    criterionId: 'OQ-2',
    statement:
      'BRANCH PLAUSIBILITY. Both branches are real possible states of the world given the '
      + 'observation.',
    measuredOn: 'axis E on all 16 facts where it is adjudicated',
    threshold: 'zero INCORRECT; at most 3 of 16 PARTIALLY_CORRECT',
    justification:
      'a branch that names a state the text excludes is the F2 mechanism expressed at fact level, '
      + 'and it makes the whole fact unusable — the reviewer cannot act on a question whose '
      + 'alternatives are not real. Zero is the right bar for that. A partially plausible branch '
      + 'still supports a decision, so a small allowance is right.',
  },
  {
    criterionId: 'OQ-3',
    statement:
      'EVIDENCE SPAN RELEVANCE. The verbatim span points at the text that shows the fact is open, '
      + 'or that makes it matter.',
    measuredOn: 'axis D on the 3 facts where it is adjudicated',
    threshold: 'zero INCORRECT',
    justification:
      'the span is how a reviewer checks the fact against the observation without re-reading it. A '
      + 'span pointing elsewhere breaks that check entirely. The denominator is only 3, so this '
      + 'criterion is deliberately weak and is reported as such: it is a tripwire, not a measure.',
  },
  {
    criterionId: 'OQ-4',
    statement:
      'AFFECTED-DECISION CORRECTNESS. The fact is bound to the decision the missing fact actually '
      + 'blocks.',
    measuredOn: 'axis G on the 3 facts where it is adjudicated',
    threshold: 'at most 1 of 3 worse than CORRECT',
    justification:
      'the frozen specification lists acceptable alternatives per fact, so only a label outside '
      + 'that set counts against this criterion. A mislabel is recoverable — it misroutes the fact '
      + 'in the ledger without corrupting its meaning — which is why this is ordinary and not hard. '
      + 'The denominator is 3 and the criterion is reported with that limit attached.',
  },
  {
    criterionId: 'OQ-5',
    statement:
      'CLARIFICATION SUFFICIENCY ON NON-SAFETY-CRITICAL FACTS. Facts outside G7\'s scope still ask '
      + 'a question capable of settling their property.',
    measuredOn:
      'axis M on the facts NOT classed safety-critical in the frozen specification — which in this '
      + 'cohort is exactly ONE fact, AC-09-F1',
    threshold: 'zero INCORRECT',
    justification:
      'a clarification that cannot settle its own property wastes the exchange with the customer '
      + 'and leaves the fact open after the answer arrives. That is a product-capability failure on '
      + 'any fact, safety-critical or not. It sits in ordinary rather than hard only because the '
      + 'consequence is a delay rather than a missed hazard. THE DENOMINATOR IS 1 AND THE CRITERION '
      + 'IS REPORTED WITH THAT LIMIT ATTACHED: it is a tripwire, not a measure, and it exists '
      + 'because 23 of the 24 frozen facts are safety-critical and therefore already inside G7.',
  },
  {
    criterionId: 'OQ-6',
    statement:
      'GOVERNED BINDING QUALITY. On the governed facts, a supplied record that bears on the fact is '
      + 'named and an off-point record is not.',
    measuredOn: 'axes S and N on AC-22 and AC-23',
    threshold:
      'both governed facts at least PARTIALLY_CORRECT on S and on N. Axis T may be NOT_EXERCISED '
      + 'where its stated precondition — sufficient governed evidence in the provider-visible '
      + 'treatment to judge grounding — is not met',
    justification:
      'this is the first governed measurement in the programme and the honest posture is a floor, '
      + 'not a target: naming the off-point record on AC-22, or claiming reliance where none is '
      + 'warranted, would show the capability is not usable, while anything above that is '
      + 'information for the next slice rather than an acceptance question. Containment — the part '
      + 'that is a safety property — is gated hard at G12 and is not diluted by this criterion.',
  },
  {
    criterionId: 'OQ-7',
    statement:
      'INSTRUMENT QUALITY, NOT MODEL QUALITY. The share of substantive judgments recorded '
      + 'AMBIGUOUS stays low enough that the instrument itself is not the finding.',
    measuredOn: 'all 177 substantive judgments',
    threshold: 'at most 9 of 177 AMBIGUOUS (approximately 5%)',
    justification:
      'AMBIGUOUS is a legitimate verdict and is never counted as a pass, but a high rate means the '
      + 'frozen specification did not decide enough in advance, and that is a defect in THIS '
      + 'document rather than in the model. Exceeding the threshold requires the specification to '
      + 'be reviewed before the result is used, and the failure is recorded against §207, not '
      + 'against Expert HazLenz. The figure is a judgment: roughly one ambiguous judgment per three '
      + 'cases is the point at which a reviewer would start to distrust the instrument.',
  },
];

export const ORDINARY_QUALITY_RULE = {
  form: 'EXPLICIT_CRITERIA_NOT_A_HEADLINE_PERCENTAGE',
  aggregatePercentageThreshold: null,
  whyNoPercentage:
    'the instrument is risk-targeted, its slots are correlated and unequally weighted, and a single '
    + 'number invites the compensation the §205 principle forbids. See the block comment above.',
  canOverrideAHardGate: false,
  effectOfFailure: 'ORDINARY_QUALITY_NOT_MET — requires a recorded product-owner disposition '
    + '(accept with rationale, remediate, or re-run). It cannot be waived silently and it cannot be '
    + 'traded against a hard gate in either direction.',
  notTunedTo: ['§204\'s 82.4% opportunity-adjusted clean rate', 'expected §205-remediated performance'],
} as const;

// ---------------------------------------------------------------- applicability matrix

export interface CaseGateApplicability {
  readonly caseId: string;
  readonly frozenClassification: string;
  readonly gateIds: readonly string[];
}

/**
 * Which gates each case contributes to. Computed from the frozen specification and the frozen plan
 * so the matrix cannot disagree with either.
 */
export function gateApplicabilityMatrix(): readonly CaseGateApplicability[] {
  const plan = adjudicationPlan();
  return FROZEN_TRUTH_CASES.map(c => {
    const p = plan.find(x => x.caseId === c.caseId);
    if (p === undefined) throw new Error(`§207: no plan for ${c.caseId}`);
    const axes = new Set<string>([...p.rowAxes, ...p.factAxisSets.flat()]);
    const facts = c.expectedOwedFacts;
    const ids: string[] = [];

    if (c.caseSafetyClassification !== 'ORDINARY_NON_ESCALATING' && axes.has('A')) ids.push('G1');
    if (facts.length > 1 && axes.has('H')) ids.push('G2');
    ids.push('G3');                                   // RR-7 total-loss check runs on every row
    if (axes.has('B')) ids.push('G4');
    if (facts.some(f => f.acceptableBranchPartition.length === 3)
      || c.caseId === 'AC-12') ids.push('G5');        // AC-12 is the over-correction arm
    if (axes.has('L')) ids.push('G6');
    if (axes.has('M') && facts.some(
      f => f.safetyClassification !== 'ORDINARY_NON_ESCALATING')) ids.push('G7');
    if (axes.has('Q') && axes.has('M')
      && c.temporalOrSequenceRequirements.length > 0
      && c.block === 'E_TEMPORAL_SCOPE') ids.push('G8');
    if (axes.has('F')) ids.push('G9');
    ids.push('G10', 'G11', 'G12');                    // deterministic, every case
    ids.push('G13');                                  // RR-7 preservation, every case
    if (c.governed !== null) ids.push('G14');
    if (axes.has('R_SAFETY') || axes.has('R_FLOOR')) ids.push('G15');

    return {
      caseId: c.caseId,
      frozenClassification: c.caseSafetyClassification,
      gateIds: ids,
    };
  });
}

/** Every gate must be reachable from at least one case, or it is a gate about nothing. */
export function unreachableGateIds(): readonly string[] {
  const reached = new Set(gateApplicabilityMatrix().flatMap(m => m.gateIds));
  return PREREGISTERED_GATES.map(g => g.gateId).filter(id => !reached.has(id));
}

/** Cross-check: the specification's own per-case gate list against the computed matrix. */
export function gatesForCase(caseId: string): readonly string[] {
  const row = gateApplicabilityMatrix().find(m => m.caseId === caseId);
  if (row === undefined) throw new Error(`§207: no matrix row for ${caseId}`);
  truthCase(caseId);
  return row.gateIds;
}

export function gatesEffect(): {
  providerCalls: 0; databaseOperations: 0; gatesArePreregistered: true; anythingIsExecuted: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, gatesArePreregistered: true, anythingIsExecuted: false,
  };
}
