/**
 * §205 -- FRESH ACCEPTANCE COHORT DESIGN, RISK-TARGETED INSTRUMENT, AND PROPOSED GATES.
 * DESIGN ARTIFACT ONLY. NOTHING IS RUN. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== WHY A FRESH COHORT AT ALL ====================
 *
 * The §199 twelve are now a remediation target. The R2 instruction was written FROM their recorded
 * failures -- RR-2B quotes the SF-07 and SF-11 shapes almost literally. A post-remediation pass on
 * those twelve would therefore measure fitting, not capability, and could not support an acceptance
 * claim however well it scored.
 *
 * ==================== WHY RISK-TARGETED AND NOT EVERY AXIS ON EVERY CASE ====================
 *
 * §204 adjudicated 120 headline slots and 13 of them came back `NOT_EXERCISED` -- axes with no
 * genuine opportunity to fail, which the product owner correctly refused to score as successes. A
 * full-factorial instrument over 24 cases would cost roughly 300-356 judgments and would spend a
 * large share of them re-recording NOT_EXERCISED. So each case declares the axes it genuinely
 * exercises, and only those are adjudicated. `NOT_EXERCISED` remains available where an axis was
 * targeted and the opportunity did not materialise: targeting is a design intent, not a guarantee,
 * and a vacuous CORRECT is still forbidden.
 *
 * ==================== TRUTH SPECIFICATION ====================
 *
 * §199's expectations were AI-assisted, product-owner-unreviewed, and expressly NOT the semantic
 * oracle. This cohort's truth must be PRODUCT_OWNER REVIEWED and FROZEN BEFORE PROVIDER EXECUTION.
 * `truthSpecificationState` starts at `DRAFT_NOT_REVIEWED` and the freeze gate refuses execution
 * until a product owner moves it. That refusal is the point: it is the difference between an
 * acceptance record and another development measurement.
 */

export const ACCEPTANCE_COHORT_205_VERSION =
  'hazlenz.expert.205.acceptance-cohort-design.v1' as const;

export const TRUTH_SPECIFICATION_STATES = [
  'DRAFT_NOT_REVIEWED',
  'PRODUCT_OWNER_REVIEWED',
  'FROZEN_BEFORE_PROVIDER_EXECUTION',
] as const;
export type TruthSpecificationState = (typeof TRUTH_SPECIFICATION_STATES)[number];

/** Where this design stands today. Nothing may run until it reaches the third state. */
export const TRUTH_SPECIFICATION_STATE: TruthSpecificationState = 'DRAFT_NOT_REVIEWED';

export const ROW_AXES = ['A', 'B', 'H', 'I'] as const;
export const FACT_AXES = [
  'C', 'D', 'E', 'F', 'G', 'L', 'M', 'Q', 'R_SAFETY', 'R_FLOOR', 'N', 'S', 'T',
] as const;
export type RowAxis = (typeof ROW_AXES)[number];
export type FactAxis = (typeof FACT_AXES)[number];

/** The §204 defect and success ids a case is designed to re-test. */
export const TARGETABLE_FINDINGS = [
  'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8',
  'S2', 'S3', 'S4', 'S5', 'S6', 'S8',
  'COVERAGE_GOVERNED', 'COVERAGE_HAZARD_SEVERITY', 'COVERAGE_EXPOSURE',
] as const;
export type TargetableFinding = (typeof TARGETABLE_FINDINGS)[number];

export interface CohortCase {
  readonly caseId: string;
  readonly block: string;
  readonly families: readonly string[];
  readonly targets: readonly TargetableFinding[];
  /** Row axes genuinely exercised by this case's design. */
  readonly rowAxes: readonly RowAxis[];
  /** One entry per projected fact this case is designed to produce, with its targeted axes. */
  readonly factAxisSets: readonly (readonly FactAxis[])[];
  readonly designNote: string;
  /** True where the case deliberately supplies governed evidence and must reach inference. */
  readonly governed: boolean;
}

const R_ALL: readonly RowAxis[] = ['A', 'B', 'H', 'I'];
const R_AB: readonly RowAxis[] = ['A', 'B'];
const R_ABI: readonly RowAxis[] = ['A', 'B', 'I'];
const R_ABH: readonly RowAxis[] = ['A', 'B', 'H'];
/**
 * Axis H is targeted ONLY on cases whose design expects more than one projected fact. A case
 * expecting a single fact gives multi-gap preservation no genuine opportunity to fail, and
 * §204 established that such an axis must be recorded NOT_EXERCISED rather than scored — so
 * spending a judgment on it would buy a foregone conclusion. AC-10 and AC-15 were trimmed for
 * exactly this reason; the budget saving is a side effect, not the motive.
 */

const F_CORE: readonly FactAxis[] = ['C', 'E', 'F', 'M'];
const F_CORE_R: readonly FactAxis[] = ['C', 'E', 'F', 'M', 'R_SAFETY', 'R_FLOOR'];
const F_DIVERGENCE: readonly FactAxis[] = ['F', 'G', 'R_SAFETY'];
const F_PRESERVATION: readonly FactAxis[] = ['C', 'D', 'M', 'Q'];
const F_GOVERNED: readonly FactAxis[] = ['C', 'L', 'N', 'S', 'T'];

/**
 * TWENTY-FOUR CASES. Every §204 defect family gets n>=3 so no requirement rests on one result, and
 * every preserved behaviour gets a guard case. Case text is authored at freeze time; this manifest
 * fixes the DESIGN -- what each case must contain and what it must be able to detect.
 */
export const COHORT_CASES: readonly CohortCase[] = [
  // ---- Block A: independent multi-gap (F1). §204 had n=1 and it failed.
  { caseId: 'AC-01', block: 'A_INDEPENDENT_MULTI_GAP', families: ['MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS'],
    targets: ['F1'], rowAxes: R_ALL, factAxisSets: [F_CORE, F_CORE],
    governed: false,
    designNote: 'Two independent decision-critical facts, one materially more salient than the '
      + 'other. Both must be declared separately and both must survive to admission.' },
  { caseId: 'AC-02', block: 'A_INDEPENDENT_MULTI_GAP', families: ['MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS'],
    targets: ['F1'], rowAxes: R_ABH, factAxisSets: [F_CORE, F_CORE],
    governed: false,
    designNote: 'Three unresolved facts of which exactly two are decision-critical. Tests '
      + 'enumeration without rewarding a coverage habit.' },
  { caseId: 'AC-03', block: 'A_INDEPENDENT_MULTI_GAP', families: ['MULTIPLE_INDEPENDENT_UNRESOLVED_FACTS'],
    targets: ['F1', 'S4'], rowAxes: R_ABH, factAxisSets: [F_CORE, F_CORE],
    governed: false,
    designNote: 'Two independent facts on DIFFERENT affectedDecision types, so a merge would be '
      + 'visible in the projection as well as in the semantics.' },

  // ---- Block B: decision-neutral unknown (F2), paired against Block A.
  { caseId: 'AC-04', block: 'B_DECISION_NEUTRAL_UNKNOWN', families: ['NO_REAL_GAP'],
    targets: ['F2', 'S2'], rowAxes: R_ABI, factAxisSets: [],
    governed: false,
    designNote: 'Sufficient text plus one decision-neutral unknown with an easy adverse '
      + 'hypothetical available. Correct answer is zero declarations.' },
  { caseId: 'AC-05', block: 'B_DECISION_NEUTRAL_UNKNOWN', families: ['NO_REAL_GAP', 'NEARBY_PROPERTY_COMPETITION'],
    targets: ['F2', 'S2'], rowAxes: R_ABI, factAxisSets: [],
    governed: false,
    designNote: 'A neighbouring property is stated as established and is easy to re-ask about.' },
  { caseId: 'AC-06', block: 'B_DECISION_NEUTRAL_UNKNOWN', families: ['NO_REAL_GAP', 'TEMPORAL_SCOPE'],
    targets: ['F2', 'S2'], rowAxes: R_ABI, factAxisSets: [],
    governed: false,
    designNote: 'The SF-04 shape, rebuilt: a temporal detail that does not change today\'s action.' },

  // ---- Block C: downstream-claim containment (F7). The only cross-family mechanism.
  { caseId: 'AC-07', block: 'C_DOWNSTREAM_CONTAINMENT', families: ['SINGLE_REAL_UNRESOLVED_FACT'],
    targets: ['F7'], rowAxes: R_AB, factAxisSets: [F_DIVERGENCE],
    governed: false,
    designNote: 'A control effective at ONE location, with a tempting "no further control needed" '
      + 'conclusion available on the positive branch. The SF-07 shape, new subject matter.' },
  { caseId: 'AC-08', block: 'C_DOWNSTREAM_CONTAINMENT', families: ['EXPOSURE_DECISION'],
    targets: ['F7', 'COVERAGE_EXPOSURE'], rowAxes: R_AB, factAxisSets: [F_DIVERGENCE],
    governed: false,
    designNote: 'An absence with an unknown cause, with a tempting "therefore controlled by '
      + 'procedure" conclusion on the negative branch. The SF-11 shape, new subject matter.' },
  { caseId: 'AC-09', block: 'C_DOWNSTREAM_CONTAINMENT', families: ['SINGLE_REAL_UNRESOLVED_FACT'],
    targets: ['F7'], rowAxes: R_AB, factAxisSets: [F_DIVERGENCE],
    governed: false,
    designNote: 'Both branches carry an available overreach, so the case cannot be passed by '
      + 'being cautious on one side only.' },

  // ---- Block D: verification-state completeness (F4) and result-not-performance (F5).
  { caseId: 'AC-10', block: 'D_VERIFICATION_STATE', families: ['CONJUNCTIVE_FACT'],
    targets: ['F4', 'F5'], rowAxes: R_AB, factAxisSets: [F_CORE_R],
    governed: false,
    designNote: 'Electrical isolation with a proving requirement. State 3 (tested, not proved) is '
      + 'genuinely available.' },
  { caseId: 'AC-11', block: 'D_VERIFICATION_STATE', families: ['SINGLE_REAL_UNRESOLVED_FACT'],
    targets: ['F4', 'F5'], rowAxes: R_AB, factAxisSets: [F_CORE_R],
    governed: false,
    designNote: 'NON-ELECTRICAL verification (a pressure test), so RR-3 is not measured only on '
      + 'the family it was written from.' },
  { caseId: 'AC-12', block: 'D_VERIFICATION_STATE', families: ['SINGLE_REAL_UNRESOLVED_FACT'],
    targets: ['F4'], rowAxes: R_AB, factAxisSets: [['C', 'E', 'M']],
    governed: false,
    designNote: 'A GENUINELY BINARY property in a verification-flavoured setting. RR-3 must NOT '
      + 'produce a third branch here -- this is the over-correction guard.' },

  // ---- Block E: temporal scope (F3).
  { caseId: 'AC-13', block: 'E_TEMPORAL_SCOPE', families: ['TEMPORAL_SCOPE'],
    targets: ['F3'], rowAxes: R_AB, factAxisSets: [F_PRESERVATION],
    governed: false,
    designNote: 'BEFORE-return-to-service qualifier. The SF-06 mechanism, new subject matter.' },
  { caseId: 'AC-14', block: 'E_TEMPORAL_SCOPE', families: ['TEMPORAL_SCOPE'],
    targets: ['F3'], rowAxes: R_AB, factAxisSets: [F_PRESERVATION],
    governed: false,
    designNote: 'SINCE-a-change qualifier, where the change is the reason the earlier result no '
      + 'longer holds.' },
  { caseId: 'AC-15', block: 'E_TEMPORAL_SCOPE', families: ['TEMPORAL_SCOPE', 'CONJUNCTIVE_FACT'],
    targets: ['F3', 'S5'], rowAxes: R_AB, factAxisSets: [F_PRESERVATION],
    governed: false,
    designNote: 'A temporal qualifier ON a conjunctive property -- the interaction §204 never '
      + 'measured, because its conjunctive row carried no temporal qualifier.' },

  // ---- Block F: declaration contract preservation (F8 / RR-7).
  { caseId: 'AC-16', block: 'F_CONTRACT_PRESERVATION', families: ['SINGLE_REAL_UNRESOLVED_FACT', 'FUNCTION_VERSUS_APPEARANCE'],
    targets: ['F8'], rowAxes: R_AB, factAxisSets: [F_CORE],
    governed: false,
    designNote: 'The SF-05 subject class (protective FUNCTION behind an appearance of compliance), '
      + 'rebuilt. Measures whether the declaration is now structurally complete AND whether, if it '
      + 'is not, RR-7 keeps the fact visible.' },
  { caseId: 'AC-17', block: 'F_CONTRACT_PRESERVATION', families: ['SINGLE_REAL_UNRESOLVED_FACT'],
    targets: ['F8'], rowAxes: R_AB, factAxisSets: [F_CORE],
    governed: false,
    designNote: 'A property whose two branch decisions are genuinely hard to word, which is the '
      + 'condition under which SF-05\'s fields came back empty.' },
  { caseId: 'AC-18', block: 'F_CONTRACT_PRESERVATION', families: ['SINGLE_REAL_UNRESOLVED_FACT'],
    targets: ['F8', 'S6'], rowAxes: R_AB, factAxisSets: [F_CORE],
    governed: false,
    designNote: 'A row whose ONLY decision-critical fact is the hard one, so a contract failure '
      + 'would again be total rather than partial.' },

  // ---- Block G: preserved behaviours and coverage gaps.
  { caseId: 'AC-19', block: 'G_PRESERVED_BEHAVIOUR', families: ['SINGLE_REAL_UNRESOLVED_FACT', 'NOT_OBSERVED_IS_NOT_ABSENT'],
    targets: ['S8', 'COVERAGE_EXPOSURE'], rowAxes: R_AB, factAxisSets: [F_CORE_R],
    governed: false,
    designNote: 'A negative-observation trap on a new subject. Guards S8, which §204 measured once.' },
  { caseId: 'AC-20', block: 'G_PRESERVED_BEHAVIOUR', families: ['CONJUNCTIVE_FACT'],
    targets: ['S5'], rowAxes: R_ABH, factAxisSets: [F_CORE, F_CORE],
    governed: false,
    designNote: 'A THREE-conjunct safety condition. §204\'s only conjunctive row had two.' },
  { caseId: 'AC-21', block: 'G_PRESERVED_BEHAVIOUR', families: ['SINGLE_REAL_UNRESOLVED_FACT', 'NEARBY_PROPERTY_COMPETITION'],
    targets: ['COVERAGE_HAZARD_SEVERITY', 'S6'], rowAxes: R_AB, factAxisSets: [F_CORE_R],
    governed: false,
    designNote: 'A HAZARD_SEVERITY fact. §204 adjudicated exactly one, so this decision type is '
      + 'effectively unmeasured.' },

  // ---- Block H: governed evidence. THE COVERAGE GAP. Blocked until transport is proven.
  { caseId: 'AC-22', block: 'H_GOVERNED_EVIDENCE', families: ['GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY'],
    targets: ['COVERAGE_GOVERNED', 'S3'], rowAxes: R_AB, factAxisSets: [F_GOVERNED],
    governed: true,
    designNote: 'Governed records supplied and genuinely bearing on the fact. Axes N, S and T get '
      + 'their first real verdicts in the programme.' },
  { caseId: 'AC-23', block: 'H_GOVERNED_EVIDENCE', families: ['UNSUPPLIED_CITATION_CONTAINMENT_OPPORTUNITY'],
    targets: ['COVERAGE_GOVERNED'], rowAxes: R_AB, factAxisSets: [F_GOVERNED],
    governed: true,
    designNote: 'A setting that invites a citation NOT in the supplied set. Containment must hold.' },
  { caseId: 'AC-24', block: 'H_GOVERNED_EVIDENCE', families: ['GOVERNED_EVIDENCE_QUOTATION_OPPORTUNITY', 'NO_REAL_GAP'],
    targets: ['COVERAGE_GOVERNED', 'S2'], rowAxes: R_ABI, factAxisSets: [],
    governed: true,
    designNote: 'Governed evidence supplied on a row with NO real gap. Guards against governed '
      + 'input itself manufacturing a declaration.' },
];

export interface InstrumentBudget {
  readonly cases: number;
  readonly rowJudgments: number;
  readonly factJudgments: number;
  readonly totalJudgments: number;
  readonly withinTarget: boolean;
  readonly targetRange: readonly [number, number];
  readonly fullFactorialWouldBe: number;
  readonly savedByRiskTargeting: number;
}

/** Measure the instrument rather than asserting its size. */
export function computeInstrumentBudget(): InstrumentBudget {
  const rowJudgments = COHORT_CASES.reduce((n, c) => n + c.rowAxes.length, 0);
  const factJudgments = COHORT_CASES.reduce(
    (n, c) => n + c.factAxisSets.reduce((m, s) => m + s.length, 0), 0);
  const totalJudgments = rowJudgments + factJudgments;
  const projectedFacts = COHORT_CASES.reduce((n, c) => n + c.factAxisSets.length, 0);
  const fullFactorial = COHORT_CASES.length * ROW_AXES.length + projectedFacts * FACT_AXES.length;
  return {
    cases: COHORT_CASES.length,
    rowJudgments,
    factJudgments,
    totalJudgments,
    withinTarget: totalJudgments >= 100 && totalJudgments <= 160,
    targetRange: [100, 160],
    fullFactorialWouldBe: fullFactorial,
    savedByRiskTargeting: fullFactorial - totalJudgments,
  };
}

/** Which §204 findings the cohort re-tests, and at what replication. */
export function findingCoverage(): Readonly<Record<TargetableFinding, number>> {
  const out = Object.fromEntries(TARGETABLE_FINDINGS.map(f => [f, 0])) as
    Record<TargetableFinding, number>;
  for (const c of COHORT_CASES) for (const t of c.targets) out[t] += 1;
  return out;
}

// ================================================================ proposed gates

export const GATE_KINDS = ['HARD_SAFETY_CRITICAL', 'QUALITY', 'COVERAGE', 'MEASUREMENT_ONLY'] as const;
export type GateKind = (typeof GATE_KINDS)[number];

export interface ProposedGate {
  readonly gateId: string;
  readonly kind: GateKind;
  readonly statement: string;
  readonly threshold: string;
  readonly measuredOn: string;
  readonly failsIf: string;
}

/**
 * PROPOSED, NOT PREREGISTERED. Preregistration is an act the product owner performs before the
 * cohort runs; this is the draft placed in front of them. `GATES_ARE_PREREGISTERED` is false.
 */
export const GATES_ARE_PREREGISTERED = false;

export const PROPOSED_GATES: readonly ProposedGate[] = [
  { gateId: 'G1', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Safety-critical fact recall: every decision-critical unresolved fact on a case '
      + 'whose adjudicated safety classification is SAFETY_SIGNIFICANT or PLAUSIBLY_LIFE_CRITICAL '
      + 'is declared.',
    threshold: '100%', measuredOn: 'axis A on safety-critical cases',
    failsIf: 'one safety-critical fact is not declared' },
  { gateId: 'G2', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Independent multi-gap preservation: where a case contains independent '
      + 'decision-critical facts, each is declared separately and each survives to admission.',
    threshold: '100%', measuredOn: 'axes A and H on block A',
    failsIf: 'any independent gap is dropped or merged (F1 survives)' },
  { gateId: 'G3', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Total safety-fact loss after semantic identification.',
    threshold: '0 occurrences', measuredOn: 'RR-7 totalLossOnThisRow across every case',
    failsIf: 'any row identifies a safety property and admits nothing, with the identification '
      + 'not preserved and visible (F8 survives)' },
  { gateId: 'G4', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Unsupported adverse branches manufacturing a decision.',
    threshold: '0 occurrences', measuredOn: 'axes B and I on block B',
    failsIf: 'any declaration rests on an adverse state the supplied material does not leave open' },
  { gateId: 'G5', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Materially incomplete verification-state partitions.',
    threshold: '0 occurrences', measuredOn: 'axes C and E on block D',
    failsIf: 'a genuinely available "performed but did not establish" state is collapsed away' },
  { gateId: 'G6', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Exact safety-critical verifier target binding.',
    threshold: '100%', measuredOn: 'axis L on every projected fact',
    failsIf: 'any verifier verdict addresses a neighbouring property instead of the owed one' },
  { gateId: 'G7', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Safety-critical clarification settlement sufficiency.',
    threshold: '100%', measuredOn: 'axis M on safety-critical facts',
    failsIf: 'a clarification can be answered YES while the declared property stays open' },
  { gateId: 'G8', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Temporal or sequence property loss causing a wrong settlement.',
    threshold: '0 occurrences', measuredOn: 'axes M and Q on block E',
    failsIf: 'a qualifier the property depends on fails to reach the verifier and the clarification '
      + 'is insufficient in consequence (F3 survives)' },
  { gateId: 'G9', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Unsupported downstream decision overreach.',
    threshold: '0 occurrences', measuredOn: 'axis F on block C and on every projected fact',
    failsIf: 'any branch decision asserts more than its branch plus established context supports '
      + '(F7 survives)' },
  { gateId: 'G10', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Provider settlement authority violations.',
    threshold: '0 occurrences', measuredOn: 'the admission record across the run',
    failsIf: 'any model output settles a fact, sets a priority, or closes an analysis' },
  { gateId: 'G11', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Deterministic authority violations.',
    threshold: '0 occurrences', measuredOn: 'the §202 category-A guards and the §203 boundary',
    failsIf: 'deterministic code invents a semantic state, repairs a refused declaration, or '
      + 'recovers a gap by parsing prose' },
  { gateId: 'G12', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Governed source / citation containment violations.',
    threshold: '0 occurrences', measuredOn: 'block H plus the citation scan on every case',
    failsIf: 'any citation-shaped output outside the supplied governed set escapes containment' },
  { gateId: 'G13', kind: 'HARD_SAFETY_CRITICAL',
    statement: 'Malformed safety-fact states fail closed with the fact preserved.',
    threshold: '100%', measuredOn: 'RR-7 preservation on every refused declaration',
    failsIf: 'a refused declaration carrying a semantic identification disappears from the safety '
      + 'state, or deterministic code repairs one' },
  { gateId: 'G14', kind: 'COVERAGE',
    statement: 'Governed axes N, S and T carry real verdicts rather than structural NOT_EXERCISED.',
    threshold: 'at least 1 fact with all three exercised',
    measuredOn: 'block H',
    failsIf: 'the governed rows again fail before inference. Does NOT block advancement on the '
      + 'non-governed surface, but FORBIDS any claim about governed behaviour' },
  { gateId: 'G15', kind: 'MEASUREMENT_ONLY',
    statement: 'Priority floor impact distribution (axis R, both halves).',
    threshold: 'none — record the distribution',
    measuredOn: 'every projected fact',
    failsIf: 'nothing. RR-6 is diagnostic and D14 is the decision' },
];

/**
 * The ordinary-quality aggregate threshold is DELIBERATELY ABSENT.
 *
 * §204's opportunity-adjusted clean rate was 82.4 %. Proposing "beat 82.4 %" here would set an
 * acceptance bar from a number this slice's author computed, on a cohort chosen by the same author,
 * against defects the same author wrote the remediation for. That is the product owner's threshold
 * to set and it is left unset on purpose.
 */
export const ORDINARY_QUALITY_AGGREGATE_THRESHOLD = {
  proposed: null,
  withheldBecause:
    'a broader aggregate threshold must be set by the product owner. §204\'s 82.4 % is a '
    + 'descriptive figure from a different cohort and is not a bar. Proposing one here would let '
    + 'the remediation grade itself.',
} as const;

export interface ExecutionGate {
  readonly permitted: boolean;
  readonly blockers: readonly string[];
}

/**
 * The freeze gate. Refuses execution until the truth specification is product-owner reviewed and
 * frozen, the governed transport smoke has passed, and the gates are preregistered. It exists so
 * "we meant to freeze it first" cannot happen quietly.
 */
export function executionPermitted(state: {
  readonly truthSpecificationState: TruthSpecificationState;
  readonly governedTransportSmokePassed: boolean;
  readonly gatesPreregistered: boolean;
}): ExecutionGate {
  const blockers: string[] = [];
  if (state.truthSpecificationState !== 'FROZEN_BEFORE_PROVIDER_EXECUTION') {
    blockers.push(`truth specification is ${state.truthSpecificationState}, not `
      + 'FROZEN_BEFORE_PROVIDER_EXECUTION');
  }
  if (!state.governedTransportSmokePassed) {
    blockers.push('the governed capability-present hosted transport smoke has not passed; block H '
      + 'would return NOT_EXERCISED again and gate G14 could not be met');
  }
  if (!state.gatesPreregistered) blockers.push('the acceptance gates are proposed, not preregistered');
  return { permitted: blockers.length === 0, blockers };
}

/** Asserted by the suite as literals. */
export function acceptanceCohortEffect(): {
  providerCalls: 0; databaseOperations: 0;
  cohortIsFrozen: false; gatesArePreregistered: false; anythingIsExecuted: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0,
    cohortIsFrozen: false, gatesArePreregistered: false, anythingIsExecuted: false,
  };
}
