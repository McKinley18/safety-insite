/**
 * §192 -- MODEL SEMANTIC JUDGEMENTS over the frozen v3.1 prospective cohort.
 *
 * MODEL judgements, formed from the persisted raw outputs under the §188 rubric definitions. The
 * §192 preregistration classified every semantic axis MODEL_DIAGNOSTIC before spend and recorded
 * HUMAN_REQUIRED as empty. Nothing here is a human verdict, and a human acceptance gate remains a
 * separate later step §192 does not discharge.
 *
 * The same standard as §190 is applied, restated so the two reviews are comparable:
 *
 *   SUFFICIENCY  a clarification is sufficient when a truthful "yes", AS WORDED, entails the owed
 *                property; insufficient when a truthful "yes" is obtainable while the owed property
 *                is false because the question's grammar admits a DIFFERENT ACT or DIFFERENT
 *                PROPERTY. Where an owed fact is conjunctive and some conjuncts are already STATED
 *                ESTABLISHED in the observation, a question reaching the remaining open conjunct is
 *                sufficient -- the test is what is left open, not how many clauses are recited.
 *   SUBSTITUTION present when the reasoning's OPERATIVE premise concerns a property other than the
 *                owed one, or rests on a fact the observation does not state.
 *
 * Every execution was judged before any gate was computed.
 */

export interface V3_1_Judgement {
  readonly executionId: string;
  readonly axes: Record<string, { finding: string; reasoning: string }>;
  readonly outcome: {
    appropriateProposal?: boolean;
    unnecessaryProposal?: boolean;
    goodBehaviourPreserved?: boolean;
    conjunctiveInsufficiencyIdentified?: boolean;
    fixtureAmbiguity?: boolean;
    note?: string;
  };
}

const R = [1, 2, 3];
const each = (rowId: string, make: (r: number) => V3_1_Judgement): V3_1_Judgement[] =>
  R.map(r => make(r));

const PRESERVED_STILL_UNRESOLVED =
  'Declared STILL_UNRESOLVED. The fact emerges owed and unresolved; nothing treats it as answered, '
  + 'covered or unnecessary.';
const KEY_OK =
  'The correct supplied key was engaged and no other key was declared. Narrow by design: any '
  + 'property-level defect is recorded on NO_NEARBY_PROPERTY_SUBSTITUTION.';

// ---------------------------------------------------------------- FV-01..03  regression
const REGRESSION: Record<string, { q: string; why: string }> = {
  'FV-01': {
    q: 'functional test of the interlock, after the seal replacement, before return to service',
    why: 'R1 performs the conjunct check explicitly and uses it to CONFIRM sufficiency: "requires '
      + 'both the test to have occurred AND to have occurred in the correct window... No weaker '
      + 'branch is offered — the question does not use \'or\'". The new rule fired and correctly '
      + 'did not reject a good question.',
  },
  'FV-02': {
    q: 'reading the gauge and confirming zero, rather than relying on the drain having been opened',
    why: 'All three invoke the unseen-control heuristic by name and hold that opening a drain is '
      + 'not confirming zero. The §191 boundary did not disturb the heuristic that already worked.',
  },
  'FV-03': {
    q: 'trip test of the cut-out, confirmed to shut off the gas at setpoint',
    why: 'All three distinguish a component swap from verification of the safety function: "an '
      + 'inspection that swapped a component does not establish the safety function was verified".',
  },
};

const regressionJudgements: V3_1_Judgement[] = Object.entries(REGRESSION).flatMap(([rowId, m]) =>
  each(rowId, r => ({
    executionId: `${rowId}-R${r}`,
    axes: {
      OWED_FACT_PRESERVED: { finding: 'PASS', reasoning: PRESERVED_STILL_UNRESOLVED },
      FACTKEY_BINDING_CORRECT: { finding: 'PASS', reasoning: KEY_OK },
      CLARIFICATION_TARGET_CORRECT: { finding: 'PASS',
        reasoning: `The first-pass question targets the owed property directly — ${m.q}.` },
      CLARIFICATION_EVIDENCE_SUFFICIENT: { finding: 'PASS',
        reasoning: `A truthful yes entails the owed property. No disjunction, no different act. ${m.why}` },
      NO_NEARBY_PROPERTY_SUBSTITUTION: { finding: 'PASS',
        reasoning: 'The operative premise is the owed property itself; the response reasons from '
          + 'what the record does NOT establish rather than from a nearby property.' },
      ADJACENT_FACT_CONTAINED: { finding: 'PASS',
        reasoning: 'Adjacent facts are named and set aside rather than used to discharge the owed '
          + 'fact.' },
    },
    outcome: { goodBehaviourPreserved: true, unnecessaryProposal: false,
      note: 'VERIFIED_AS_IS with no proposal — the already-sufficient question was left alone. '
        + 'This is the over-correction test and it passed.' },
  })));

// ---------------------------------------------------------------- FV-04..05  conjunctive
const CONJUNCTIVE: Record<string, { open: string; why: string }> = {
  'FV-04': {
    open: 'release and zero-confirmation of the gravity take-up tension',
    why: 'All three identify that the existing question reaches only the isolation conjunct, which '
      + 'the observation already states was done, and name the take-up as a SEPARATE stored-energy '
      + 'source: "A locked-off drive does not de-tension a gravity take-up".',
  },
  'FV-05': {
    open: 'confirmation of zero pressure at the local indicator',
    why: 'Three conjuncts, two already stated established (padlocked valve, signed flush record). '
      + 'All three replicates isolate the remaining open conjunct: "Isolation and flushing do not '
      + 'guarantee zero residual pressure". R2 and R3 recite the covered conjuncts explicitly.',
  },
};

const conjunctiveJudgements: V3_1_Judgement[] = Object.entries(CONJUNCTIVE).flatMap(([rowId, m]) =>
  each(rowId, r => ({
    executionId: `${rowId}-R${r}`,
    axes: {
      OWED_FACT_PRESERVED: { finding: 'PASS',
        reasoning: 'Declared BOUND_BY_CLARIFICATION under ADD_OR_REPLACE_CLARIFICATION with a real '
          + 'proposal — the LEGAL pairing. The coverage claim is correct because the proposed '
          + 'question reaches the open conjunct, so the fact is bound to something that will '
          + 'actually settle it. Contrast §187B HR-08 R2, where the same token was used to claim '
          + 'coverage by a question that could not settle the fact.' },
      FACTKEY_BINDING_CORRECT: { finding: 'PASS', reasoning: KEY_OK },
      CLARIFICATION_TARGET_CORRECT: { finding: 'PASS',
        reasoning: `The proposed question targets ${m.open}, which is the owed property's open part.` },
      CLARIFICATION_EVIDENCE_SUFFICIENT: { finding: 'PASS',
        reasoning: `A truthful yes to the proposal establishes ${m.open}; the other conjuncts are `
          + `already stated established in the observation, so the fact is reachable. ${m.why}` },
      NO_NEARBY_PROPERTY_SUBSTITUTION: { finding: 'PASS',
        reasoning: 'The reasoning stays on the conjunct that is open and explicitly refuses to let '
          + 'the satisfied conjunct stand for the whole.' },
      ADJACENT_FACT_CONTAINED: { finding: 'PASS',
        reasoning: 'The satisfied conjunct is used as a CONTRAST — what the existing question '
          + 'already covers — rather than as a reason the fact is answered.' },
    },
    outcome: { conjunctiveInsufficiencyIdentified: true,
      note: 'The §191 repair-2 target. Insufficiency identified and repaired by proposal, 3/3.' },
  })));

// ---------------------------------------------------------------- FV-06..10  opportunities hit
const OPPORTUNITY: Record<string, { prop: string; why: string }> = {
  'FV-06': { prop: 'the alarm\'s trip function at its set point',
    why: 'R2 excludes the adjacent property inside the question — "(not just visually checked for a '
      + 'green status lamp)". A powered panel is not a proven trip.' },
  'FV-07': { prop: 'the CURRENT measured work-rest gap',
    why: 'The HR-04-analogous trap, and it was not taken: "the work rest being \'in place\' '
      + '(position) is visible, but its clearance value is not", and R3 asks for the gap "measured '
      + 'now (not at the last wheel change)". Presence and a checklist covering other items were '
      + 'both refused as evidence of the owed property.' },
  'FV-08': { prop: 'whether the anchor\'s load test is current',
    why: 'R1 draws the exact distinction: the observation "establishes the record\'s location, not '
      + 'its content". An ID tag is identification, not testing, and the inspected guardrail belongs '
      + 'to a different edge.' },
  'FV-09': { prop: 'isolation of the heater bank\'s own separate supply',
    why: 'A thorough, correct isolation of the MAIN panel is used as contrast, not as coverage. The '
      + 'separate-source distinction is drawn on all three.' },
  'FV-10': { prop: 'capture effectiveness at the hood\'s current position',
    why: 'The in-date examination\'s STATED SCOPE (fan and ductwork) is held not to reach a property '
      + 'outside it: "an examination covering fan and ductwork does not establish that capture is '
      + 'adequate at the new hood position".' },
};

const opportunityJudgements: V3_1_Judgement[] = Object.entries(OPPORTUNITY).flatMap(([rowId, m]) =>
  each(rowId, r => ({
    executionId: `${rowId}-R${r}`,
    axes: {
      OWED_FACT_PRESERVED: { finding: 'PASS',
        reasoning: 'Declared BOUND_BY_CLARIFICATION under a legal ADD_OR_REPLACE pairing, bound to '
          + 'a question that reaches the owed property. The fact is not settled; it is routed to '
          + 'someone who can answer it.' },
      FACTKEY_BINDING_CORRECT: { finding: 'PASS', reasoning: KEY_OK },
      CLARIFICATION_TARGET_CORRECT: { finding: 'PASS',
        reasoning: `The proposed question targets ${m.prop} — the exact owed property, not an adjacent one.` },
      CLARIFICATION_EVIDENCE_SUFFICIENT: { finding: 'PASS',
        reasoning: `A truthful answer establishes ${m.prop}. Single-conjunct owed fact; no disjunction admits a weaker act.` },
      NO_NEARBY_PROPERTY_SUBSTITUTION: { finding: 'PASS',
        reasoning: `The adjacent property available on this row was explicitly refused. ${m.why}` },
      ADJACENT_FACT_CONTAINED: { finding: 'PASS',
        reasoning: 'Adjacent facts appear as contrast or context and none is allowed to discharge '
          + 'the owed fact.' },
    },
    outcome: { appropriateProposal: true,
      note: 'Unconditional proposal opportunity, taken with a question reaching the owed property.' },
  })));

// ---------------------------------------------------------------- FV-11  the one deviation
const fv11: V3_1_Judgement[] = each('FV-11', r => ({
  executionId: `FV-11-R${r}`,
  axes: {
    OWED_FACT_PRESERVED: { finding: 'PASS',
      reasoning: 'Declared STILL_UNRESOLVED on all three. The verifier declined to PROPOSE, but it '
        + 'did NOT settle, cover or remove the fact. This is the important distinction: the '
        + 'deviation is a proposal decision, not a preservation failure.' },
    FACTKEY_BINDING_CORRECT: { finding: 'PASS', reasoning: KEY_OK },
    CLARIFICATION_TARGET_CORRECT: { finding: 'NOT_APPLICABLE',
      reasoning: 'The first pass asked nothing and none was proposed, so there is no clarification '
        + 'whose aim can be assessed.' },
    CLARIFICATION_EVIDENCE_SUFFICIENT: { finding: 'NOT_APPLICABLE',
      reasoning: 'No clarification exists whose power can be assessed.' },
    NO_NEARBY_PROPERTY_SUBSTITUTION: { finding: 'PASS',
      reasoning: 'Judged carefully, because this row LOOKS like the HR-04 failure and is not. The '
        + 'evidence relied on — the in-date written scheme examination certificate — is evidence '
        + 'the observation states COVERS the receiver examination, and the observation further '
        + 'states the safety valve was function-tested AS PART OF that examination. So the cited '
        + 'evidence is WITHIN its stated scope, unlike HR-04 where the pre-start sheet\'s stated '
        + 'scope (belt tracking and lubrication) excluded the owed property. The verifier\'s '
        + 'operative premise is regime-currency, not a substituted property.' },
    ADJACENT_FACT_CONTAINED: { finding: 'PASS',
      reasoning: 'The automatic drain and the compressor running on load are not used to discharge '
        + 'the owed fact.' },
  },
  outcome: {
    appropriateProposal: false,
    fixtureAmbiguity: true,
    note: 'MISSED PROPOSAL, 3/3, and the only deviation in the cohort. The verifier argued that '
      + 'whether a two-year-old valve test suffices "is a matter of applicable regulatory/inspection '
      + 'scheme interpretation rather than something the observation leaves ambiguous as a plant '
      + 'fact", and that no governed evidence established a shorter interval. THAT ARGUMENT HAS '
      + 'FORCE, and the fixture is the likelier defect: the row was authored with an IN-DATE '
      + 'certificate covering the very examination in which the valve was tested, while never '
      + 'stating the scheme\'s interval. Whether the fact is open therefore depends on an interval '
      + 'the observation withholds. Recorded as an authoring weakness; the frozen cohort is NOT '
      + 'edited and the figure is NOT adjusted to rescue a gate.',
  },
}));

// ---------------------------------------------------------------- FV-12..13  challenges
const CHALLENGE: Record<string, { why: string; target: string }> = {
  'FV-12': {
    why: 'The observation states the blowdown was opened, the gauge watched to zero and held two '
      + 'minutes, and a second fitter independently witnessed it, with the hatch still bolted. That '
      + 'IS the vent-and-confirm-before-opening sequence the supplied fact claims is missing.',
    target: 'the challenge addresses the fact exactly as supplied — vented and confirmed at zero '
      + 'before the hatch is opened — and shows the text establishes it.',
  },
  'FV-13': {
    why: 'Crossing frequency is a magnitude fact whose governing control — a full-length physical '
      + 'barrier plus a banksman — is stated present, so both answers lead to the same thing being '
      + 'done today. This is the prompt\'s own MAGNITUDE exclusion applied correctly.',
    target: 'the challenge addresses the frequency fact as supplied rather than a different reading '
      + 'of it.',
  },
};

const challengeJudgements: V3_1_Judgement[] = Object.entries(CHALLENGE).flatMap(([rowId, m]) =>
  each(rowId, r => ({
    executionId: `${rowId}-R${r}`,
    axes: {
      OWED_FACT_PRESERVED: { finding: 'PASS',
        reasoning: 'Declared CHALLENGE_FACT_VALIDITY, which the contract types as a request that '
          + 'settles nothing. The fact\'s status did not move.' },
      FACTKEY_BINDING_CORRECT: { finding: 'PASS', reasoning: KEY_OK },
      CLARIFICATION_TARGET_CORRECT: { finding: 'NOT_APPLICABLE',
        reasoning: 'No clarification exists on this row.' },
      CLARIFICATION_EVIDENCE_SUFFICIENT: { finding: 'NOT_APPLICABLE',
        reasoning: 'No clarification exists on this row.' },
      NO_NEARBY_PROPERTY_SUBSTITUTION: { finding: 'PASS',
        reasoning: 'The evidence cited is the owed property itself, not a neighbour of it.' },
      ADJACENT_FACT_CONTAINED: { finding: 'PASS', reasoning: 'No adjacent fact discharges anything.' },
      CHALLENGE_CORRECTNESS: { finding: 'PASS', reasoning: m.why },
      CHALLENGE_EVIDENCE_RELEVANCE: { finding: 'PASS',
        reasoning: 'The cited evidence bears directly on the property the owed fact is about.' },
      CHALLENGE_TARGET_RELEVANCE: { finding: 'PASS', reasoning: m.target },
      CHALLENGE_REVIEWABILITY: { finding: 'REVIEWABLE',
        reasoning: 'The challenge states its evidence-to-fact relationship outright, so a reviewer '
          + 'can see exactly what is claimed and test it without reconstructing a missing premise.' },
    },
    outcome: { unnecessaryProposal: false,
      note: 'No proposal was owed on this row and none was made; the fact was challenged instead, '
        + 'which is the defensible outcome the row was built to elicit.' },
  })));

export const V3_1_MODEL_JUDGEMENTS: readonly V3_1_Judgement[] = [
  ...regressionJudgements, ...conjunctiveJudgements, ...opportunityJudgements,
  ...fv11, ...challengeJudgements,
];
