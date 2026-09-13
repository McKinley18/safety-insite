/**
 * §166 EXPERT HAZLENZ -- VERIFIER INSTRUCTION v3. EXPLICIT FACT BINDING. DEVELOPMENT PROTOTYPE ONLY.
 * NOT REACHABLE FROM PRODUCTION. NOT ENABLED. ZERO PROVIDER CALLS.
 *
 * v1 and v2 are left BYTE-UNCHANGED. They are the instructions §156, §157, §158 and §163 were
 * executed under, and those results stay attached to the exact protocol that produced them. v3 is a
 * NEW PROSPECTIVE PROTOCOL and rescores nothing.
 *
 * ==================== WHAT v3 IS FOR, AND WHAT IT IS NOT ====================
 *
 * §165 proved mechanically that the frozen v2 contract CANNOT EXPRESS the manipulation the §164
 * falsification experiment exists to test: an additive verdict -- one that binds a supplied owed
 * fact AND carries a nomination alongside it -- is refused with
 * `NOMINATION_PRESENT_WITHOUT_NOMINATED_SOURCE_MODE`, the schema has no field in which to declare a
 * binding, and the instruction contains no binding step. That is the whole reason v3 exists.
 *
 * **v3 IS A REPRESENTATIONAL CHANGE.** It does not redesign the verifier's substantive safety
 * reasoning. Steps 1, 2 and 3 are byte-identical to v2. The "THE ANSWER IS USUALLY NO, AND NO IS A
 * GOOD ANSWER" prior is byte-identical to v2. The two shapes that look decision-critical and are
 * not, the one that looks settled and is not, the nomination proof burden, the authority
 * restrictions and the "no expected number" closing are all byte-identical to v2.
 *
 * `expert-verifier-v2-v3-diff.ts` proves that claim rather than asserting it: it diffs the two
 * strings line by line, requires every changed line to carry an explicit classification, and refuses
 * to report if any changed line is unclassified.
 *
 * ==================== THE THREE THINGS v3 ADDS ====================
 *
 *   1. `bindingFactKey` -- a clarification may declare that it answers ONE supplied owed fact, by
 *      copying that fact's key exactly. Closed-set membership, checked by string equality.
 *   2. AN ADDITIVE NOMINATION MAY COEXIST WITH A BINDING. Under v2 a clarification was EITHER
 *      supplied OR nominated; under v3 it may be both, which is precisely what falsifier C measures.
 *   3. `owedFactDeclarations` -- every supplied fact gets one explicit line:
 *      `BOUND_BY_CLARIFICATION`, `STILL_UNRESOLVED`, or `CHALLENGE_FACT_VALIDITY`.
 *
 * ==================== THE BOUNDARY ON THE THIRD ONE ====================
 *
 * A challenge is a REQUEST FOR ARBITRATION, never a settlement. There is deliberately no
 * `FACT_NOT_DECISION_CRITICAL = true` the model can assert to clear the ledger, because that would
 * hand the evaluated component authority over its own coverage -- the exact thing §164 classified
 * `DO_NOT_AUTOMATE`. A challenged fact stays `UNRESOLVED`, the coverage warning stays live, and the
 * reason is persisted for a human. HazLenz owns every state transition.
 */

export const EXPERT_VERIFIER_INSTRUCTION_V3_VERSION =
  'hazlenz.expert.verifier-instruction.v3' as const;

export const EXPERT_VERIFIER_V3_SYSTEM_PROMPT: string = [
  'You are reviewing ONE decision that another safety analysis already made: whether to ask a',
  'clarifying question about something the observation left unresolved.',
  '',
  'You are given an observation of a workplace, whatever governed regulatory evidence was supplied',
  'with it, the result of a deterministic hazard engine, the first-pass analysis, and the specific',
  'unresolved facts that analysis left open. Your jurisdiction is EXACTLY ONE THING: whether the',
  'clarification set is right. You do not re-analyse the hazards.',
  '',
  'EACH UNRESOLVED FACT YOU ARE GIVEN CARRIES A factKey. Those keys are fixed, and they are the only',
  'way to refer to those facts. Copy a key exactly when you use one: a key you invent, abbreviate or',
  'respell is not a key, and a verdict carrying one is discarded whole.',
  '',
  'WORK THROUGH THE STEPS IN ORDER.',
  '',
  '1. WHAT IS ACTUALLY UNRESOLVED. Read the observation for what it states, not for what it',
  '   implies. A fact is unresolved when the text does not establish it -- not when the text',
  '   establishes something you would like to know more about, and not when a stated fact is merely',
  '   uncomfortable. If the observation states a condition, that condition is established.',
  '',
  '2. WOULD THE ANSWER CHANGE WHAT IS DONE NOW. This is the whole question, and it is a test with',
  '   two branches. Take the unresolved fact and answer it BOTH WAYS. If the two answers lead to',
  '   the SAME thing being done at this workplace today -- the same controls, the same corrective',
  '   action, the same decision to continue or to stop -- then the fact does not matter to this',
  '   decision, however interesting it is. If one answer means work continues and the other means',
  '   work stops now, or means a different control is required, then it matters.',
  '',
  '   TWO SHAPES THAT LOOK DECISION-CRITICAL AND ARE NOT:',
  '     - MAGNITUDE. How long, how often, how many, how large. These scale exposure. They select a',
  '       different action only when a stated threshold turns on them. If every control the',
  '       magnitude would govern is already stated present and in use, the answer changes nothing.',
  '     - A DETAIL WITH ITS CONTROL ALREADY IN PLACE. If the observation states the control that',
  '       answers the contingency either way, the contingency is not a decision.',
  '',
  '   AND ONE THAT LOOKS SETTLED AND IS NOT:',
  '     - A CONTROL THAT CANNOT BE SEEN IS NOT A CONTROL THAT WAS CHECKED. An obstructed sightline,',
  '       a completed job nobody watched, an alarm that did not sound: each is equally consistent',
  '       with the control working and with it having failed. If the two are consistent with the',
  '       same observation and lead to different actions, the fact is unresolved and it matters.',
  '',
  '3. IS IT ALREADY ASKED. If the first pass emitted a question that would actually reach the fact',
  '   in step 2, the work is done. A question that reaches a DIFFERENT unresolved fact does not',
  '   count, however well posed it is: the test is whether an answer to the question as written',
  '   would settle the fact that changes the decision.',
  '',
  '4. NOW ASK ONE MORE QUESTION, AND ASK IT HONESTLY.',
  '',
  '   The unresolved facts you were handed came from the first-pass analysis. They are what it',
  '   NOTICED it did not know. An analysis can be entirely reasonable about the fact it noticed and',
  '   still have missed the one that actually governs the decision -- and if that has happened, every',
  '   step above will have reasoned correctly about the wrong thing.',
  '',
  '   So ask: IS THERE ONE OTHER FACT, NOT AMONG THOSE SUPPLIED, WHOSE ANSWER IS NECESSARY TO',
  '   DETERMINE A SAFETY, REGULATORY OR REQUIRED-CONTROL DECISION BEING MADE AT THIS WORKPLACE NOW?',
  '',
  '   >>> THE ANSWER IS USUALLY NO, AND NO IS A GOOD ANSWER. Most observations contain many facts',
  '   >>> nobody wrote down, and almost none of them change what is done. You are not looking for',
  '   >>> something wrong, you are not completing the analysis, and you are not improving it. You',
  '   >>> are checking for ONE specific failure: that the decision turns on a fact nobody raised.',
  '',
  '   DO NOT nominate a fact because information is missing, because severity could be calculated',
  '   more precisely, because documentation could be more complete, because another control might',
  '   conceivably exist, because an inspector could gather more evidence, because a candidate was',
  '   left at INSUFFICIENT_EVIDENCE, because the first-pass analysis is empty or uncertain, or',
  '   because the fact is interesting. NONE of those is a reason. The ONLY reason is that answering',
  '   it one way and the other way leads to DIFFERENT THINGS BEING DONE TODAY.',
  '',
  '   If you do nominate, you may nominate EXACTLY ONE fact, and you must prove it:',
  '     - quote the span of the OBSERVATION, copied word for word, that leaves the fact open;',
  '     - say why that span leaves it open rather than settling it;',
  '     - state one plausible answer, and what is done today under it;',
  '     - state the other plausible answer, and what is done today under it;',
  '     - those two must be DIFFERENT, and if you cannot make them different, do not nominate;',
  '     - say why the answer is needed now rather than at a later review.',
  '',
  '   A nominated fact must not require inventing a hazard the observation does not support.',
  '',
  '   A NOMINATION IS ADDED TO THE FACTS YOU WERE GIVEN. It never replaces one and never answers',
  '   one. You may nominate at the same time as answering a supplied fact, and doing both is the',
  '   right answer whenever both are genuinely needed now.',
  '',
  '5. DECIDE. Return exactly one verdict:',
  '',
  '   VERIFIED_AS_IS',
  '     The first pass asked a question that reaches the decision-changing fact, or it correctly',
  '     asked nothing.',
  '',
  '   ADD_OR_REPLACE_CLARIFICATION',
  '     A fact that would change what is done now is not asked about. Supply the question. If it',
  '     answers one of the facts you were given, put that fact\'s key in bindingFactKey. You may ALSO',
  '     nominate one fact of your own in the same answer.',
  '',
  '   NO_CLARIFICATION_REQUIRED',
  '     Something is genuinely unresolved AND the answer would not change what is done now. This is',
  '     an assertion, and it is a normal, frequent and correct answer. Asking anyway costs a real',
  '     person real time and buries the questions that matter.',
  '',
  '     THIS VERDICT RESOLVES NOTHING. It says only that YOU propose no question. It does not mark',
  '     any fact you were given as answered, and it never removes one from the list.',
  '',
  '   ABSTAIN',
  '     You cannot tell which of the above holds. This asserts nothing. Use it when you genuinely',
  '     cannot decide -- never as a softer way of saying the situation is fine, because those are',
  '     different statements and they are recorded differently.',
  '',
  '6. NOW ACCOUNT FOR EVERY FACT YOU WERE GIVEN, ONE LINE EACH, BY ITS factKey.',
  '',
  '   This is bookkeeping, not a second judgement. For each fact say exactly one of:',
  '',
  '   BOUND_BY_CLARIFICATION',
  '     The question you are supplying answers THIS fact. At most one fact may carry this, and its',
  '     key must be the key you put in bindingFactKey.',
  '',
  '   STILL_UNRESOLVED',
  '     You are not answering this fact. That is a normal and frequent answer, and it is the right',
  '     one whenever you are unsure. The fact stays open.',
  '',
  '   CHALLENGE_FACT_VALIDITY',
  '     You believe this fact should not have been raised: the observation already settles it, or',
  '     answering it either way leads to the same thing being done today. Give your reason.',
  '     THIS IS A REQUEST, NOT A DECISION. The fact stays open until it is reviewed, and nothing',
  '     you write here removes it.',
  '',
  '   Every key must appear exactly once. A fact you do not mention is not thereby handled.',
  '',
  '   AND ONE FACT DOES NOT COVER ANOTHER. Answering the fact keyed A leaves the fact keyed B',
  '   exactly where it was, however closely related the two sound.',
  '',
  'WHEN YOU ADD OR REPLACE A QUESTION it must be answerable by someone standing at that workplace,',
  'it must name the fact rather than gesture at the topic, and it must be the fact whose answer',
  'changes the action. State which decision it affects, using exactly one of: HAZARD_EXISTENCE,',
  'HAZARD_SEVERITY, EXPOSURE, APPLICABILITY, REQUIRED_CONTROL, REGULATORY_INTERPRETATION.',
  '',
  'YOU MAY NOT: add, remove or rewrite hazard candidates; change a candidate state; change the',
  'deterministic result; cite or quote a regulation; alter risk or corrective actions; add',
  'cross-hazard insights or disagreements; or rewrite the analysis. A nominated fact changes ONE',
  'thing and one thing only -- which clarification is asked. If you return any of the above, the',
  'whole verdict is discarded.',
  '',
  'YOU ALSO MAY NOT mark a supplied fact answered by any route other than bindingFactKey. Saying in',
  'your reasoning that a fact is covered does not cover it.',
  '',
  'There is no expected number of questions, no expected number of silences, and no expected number',
  'of nominations. Judge each case on its own facts.',
  '',
  'There is no expected number of bindings and no expected number of challenges either.',
].join('\n');

/** The declaration each supplied owed fact must receive. Frozen. */
export const OWED_FACT_DECLARATIONS_V3 = [
  'BOUND_BY_CLARIFICATION', 'STILL_UNRESOLVED', 'CHALLENGE_FACT_VALIDITY',
] as const;
export type OwedFactDeclarationV3 = (typeof OWED_FACT_DECLARATIONS_V3)[number];

/**
 * v3 source modes. v2's two members are preserved and ONE is added for the shape v2 could not
 * express. The mode is derived-but-declared: the contract checks it against the actual presence of
 * `bindingFactKey` and `nominatedFact`, so it cannot disagree with the payload.
 */
export const CLARIFICATION_SOURCE_MODES_V3 = [
  'SUPPLIED_FACT',
  'NOMINATED_FACT',
  'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION',
] as const;
export type ClarificationSourceModeV3 = (typeof CLARIFICATION_SOURCE_MODES_V3)[number];

/**
 * The v3 response schema. Two new fields against v2, one removed.
 *
 * REMOVED: `aboutUnresolvedFactRef`. `bindingFactKey` is its strict successor -- same purpose, but
 * checked against a closed set rather than accepted as free text. Keeping both would give the model
 * two ways to say the same thing and the contract two things to reconcile, which is how a binding
 * gets asserted in one field and denied in the other.
 */
export const VERIFIER_V3_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'rationale', 'clarificationSourceMode', 'proposedClarification',
    'bindingFactKey', 'nominatedFact', 'owedFactDeclarations'],
  properties: {
    verdict: {
      type: 'string',
      enum: ['VERIFIED_AS_IS', 'ADD_OR_REPLACE_CLARIFICATION', 'NO_CLARIFICATION_REQUIRED',
        'ABSTAIN'],
    },
    rationale: { type: 'string' },
    clarificationSourceMode: {
      type: ['string', 'null'],
      enum: ['SUPPLIED_FACT', 'NOMINATED_FACT', 'SUPPLIED_FACT_WITH_ADDITIVE_NOMINATION', null],
      description: 'Required on ADD_OR_REPLACE_CLARIFICATION, null otherwise. Must agree with '
        + 'which of bindingFactKey and nominatedFact are present.',
    },
    proposedClarification: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: ['question', 'whyItMatters', 'affectedDecision', 'evidenceGap'],
      properties: {
        question: { type: 'string' },
        whyItMatters: { type: 'string' },
        affectedDecision: {
          type: 'string',
          enum: ['HAZARD_EXISTENCE', 'HAZARD_SEVERITY', 'EXPOSURE', 'APPLICABILITY',
            'REQUIRED_CONTROL', 'REGULATORY_INTERPRETATION'],
        },
        evidenceGap: { type: 'string' },
      },
    },
    bindingFactKey: {
      type: ['string', 'null'],
      description: 'The factKey of the supplied unresolved fact this question answers, copied '
        + 'EXACTLY. Must be one of the supplied keys. Null when the question answers no supplied '
        + 'fact.',
    },
    nominatedFact: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: ['missingFact', 'observationSpan', 'notEstablishedBecause', 'affectedDecision',
        'branchA', 'decisionIfA', 'branchB', 'decisionIfB', 'whyNecessaryNow'],
      description: 'At most one, ever. ADDITIVE: it may accompany a bindingFactKey and never '
        + 'replaces a supplied fact.',
      properties: {
        missingFact: { type: 'string' },
        observationSpan: {
          type: 'string',
          description: 'Copied WORD FOR WORD from the observation. Checked by exact match.',
        },
        notEstablishedBecause: { type: 'string' },
        affectedDecision: {
          type: 'string',
          enum: ['HAZARD_EXISTENCE', 'HAZARD_SEVERITY', 'EXPOSURE', 'APPLICABILITY',
            'REQUIRED_CONTROL', 'REGULATORY_INTERPRETATION'],
        },
        branchA: { type: 'string' },
        decisionIfA: { type: 'string', description: 'What is done TODAY if branchA holds.' },
        branchB: { type: 'string' },
        decisionIfB: {
          type: 'string',
          description: 'What is done TODAY if branchB holds. MUST DIFFER from decisionIfA.',
        },
        whyNecessaryNow: { type: 'string' },
      },
    },
    owedFactDeclarations: {
      type: 'array',
      description: 'EXACTLY ONE ENTRY PER SUPPLIED FACT, in any order. Every supplied key appears '
        + 'once and no other key appears at all.',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['factKey', 'declaration', 'challengeReason'],
        properties: {
          factKey: { type: 'string', description: 'Copied EXACTLY from the supplied fact.' },
          declaration: {
            type: 'string',
            enum: ['BOUND_BY_CLARIFICATION', 'STILL_UNRESOLVED', 'CHALLENGE_FACT_VALIDITY'],
          },
          challengeReason: {
            type: ['string', 'null'],
            description: 'Required for CHALLENGE_FACT_VALIDITY, null otherwise. A challenge is a '
              + 'REQUEST for review and never settles the fact.',
          },
        },
      },
    },
  },
} as const;

/**
 * The v3 user-prompt builder.
 *
 * Byte-identical to `buildVerifierUserPrompt` (v1/v2) except for the final block, which now prints
 * each unresolved fact's `factKey` and its two-branch structure so the verifier can bind to it.
 *
 * WHAT IS DELIBERATELY NOT PRINTED, and is asserted by the harness pre-spend gate: no row identity,
 * no REQUIRED/FORBIDDEN label, no expected selector, no human disposition, no historical outcome,
 * no pass/fail state, no scoring vocabulary. The supplied facts are TASK STATE, not grading truth.
 */
export interface V3SuppliedOwedFact {
  readonly factKey: string;
  readonly affectedDecision: string;
  readonly whyUnresolved: string;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionDivergence: { readonly ifA: string; readonly ifB: string };
  /** Included only where the bounded architecture already requires a verbatim span. */
  readonly evidenceSpan?: string;
}

export function buildVerifierV3UserPrompt(input: {
  caseId: string;
  observation: string;
  jurisdiction: string;
  governedEvidence: unknown[];
  deterministic: { familiesEmitted: string[]; lifeCriticalFindingKeys: string[] };
  firstPass: {
    candidates: Array<{ candidateKey: string; hazardFamily: string;
      assertedConditionState: string; evidenceBasis: string; reasoning: string }>;
    clarifications: Array<{ clarificationId: string; question: string; affectedDecision: string }>;
    uncertainty: string[];
    summary: string;
  };
  owedFacts: readonly V3SuppliedOwedFact[];
}): string {
  const lines: string[] = [];
  lines.push(`CASE ${input.caseId}`);
  lines.push(`JURISDICTION: ${input.jurisdiction}`);
  lines.push('');
  lines.push('OBSERVATION');
  lines.push(input.observation);
  lines.push('');
  lines.push('GOVERNED REGULATORY EVIDENCE SUPPLIED WITH THIS OBSERVATION');
  lines.push(input.governedEvidence.length === 0
    ? '(none was supplied)'
    : JSON.stringify(input.governedEvidence, null, 2));
  lines.push('');
  lines.push('DETERMINISTIC HAZARD ENGINE RESULT');
  lines.push(`hazard families emitted: ${input.deterministic.familiesEmitted.join(', ') || '(none)'}`);
  lines.push('life-critical finding keys: '
    + `${input.deterministic.lifeCriticalFindingKeys.join(', ') || '(none)'}`);
  lines.push('');
  lines.push('FIRST-PASS ANALYSIS — HAZARD CANDIDATES');
  if (input.firstPass.candidates.length === 0) lines.push('(none raised)');
  for (const c of input.firstPass.candidates) {
    lines.push(`- ${c.candidateKey} [${c.hazardFamily}] state=${c.assertedConditionState}`);
    if (c.evidenceBasis) lines.push(`    basis: ${c.evidenceBasis}`);
    if (c.reasoning) lines.push(`    reasoning: ${c.reasoning}`);
  }
  lines.push('');
  lines.push('FIRST-PASS ANALYSIS — CLARIFICATIONS ASKED');
  if (input.firstPass.clarifications.length === 0) lines.push('(none asked)');
  for (const q of input.firstPass.clarifications) {
    lines.push(`- [${q.affectedDecision}] ${q.question}`);
  }
  lines.push('');
  lines.push('FIRST-PASS ANALYSIS — STATED UNCERTAINTY');
  if (input.firstPass.uncertainty.length === 0) lines.push('(none stated)');
  for (const u of input.firstPass.uncertainty) lines.push(`- ${u}`);
  lines.push('');
  lines.push('FIRST-PASS ANALYSIS — SUMMARY');
  lines.push(input.firstPass.summary || '(none)');
  lines.push('');
  lines.push('UNRESOLVED FACTS IDENTIFIED FOR YOUR REVIEW');
  lines.push('Each carries a factKey. Account for EVERY key in owedFactDeclarations, and copy any');
  lines.push('key you use exactly as written here.');
  if (input.owedFacts.length === 0) {
    lines.push('(none were identified — the first pass returned an entirely empty analysis)');
  }
  for (const f of input.owedFacts) {
    lines.push('');
    lines.push(`  factKey: ${f.factKey}`);
    lines.push(`    affects: ${f.affectedDecision}`);
    lines.push(`    unresolved because: ${f.whyUnresolved}`);
    if (f.evidenceSpan) lines.push(`    observation span: ${f.evidenceSpan}`);
    lines.push(`    one possible answer: ${f.branchA}`);
    lines.push(`      what is done today under it: ${f.decisionDivergence.ifA}`);
    lines.push(`    the other possible answer: ${f.branchB}`);
    lines.push(`      what is done today under it: ${f.decisionDivergence.ifB}`);
  }
  lines.push('');
  lines.push('Return your verdict as JSON matching the required schema.');
  return lines.join('\n');
}
