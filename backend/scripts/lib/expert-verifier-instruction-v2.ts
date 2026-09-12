/**
 * §157 EXPERT HAZLENZ -- VERIFIER INSTRUCTION v2. DEVELOPMENT PROTOTYPE ONLY.
 *
 * v1 is left BYTE-UNCHANGED as §156 evidence. v2 adds ONE step and changes nothing else.
 *
 * The added step is B below: after judging the facts it was handed, the verifier asks whether ONE
 * OTHER fact -- not among them -- is the one that actually controls the decision. §156 measured why
 * this step is needed: on both HS-H1 draws the verifier reasoned competently about the fact it was
 * given and never asked whether that was the right fact to be reasoning about.
 *
 * ==================== WHAT IS STILL ABSENT, AND IS CHECKED ====================
 *
 * No fixture wording, no row identifier, no domain vocabulary from any evaluation case, no answer
 * key, no quota, no expected ratio. The pre-spend gate greps this string for the evaluation set's
 * domains and refuses to spend if any appears.
 *
 * ==================== THE INSTRUCTION THIS DELIBERATELY IS NOT ====================
 *
 *   NOT "look for anything else wrong."      That is a fresh hazard analysis with a different name,
 *                                            and the verifier has no authority to perform one.
 *   NOT "find a missing fact."               That presumes one exists and manufactures a question on
 *                                            every case, destroying the 7-of-7 specificity §156
 *                                            established -- which is the only part of the verifier
 *                                            that currently works.
 *
 * It is a NARROW, GUARDED question with a burden of proof attached: nominate at most one fact, and
 * prove the divergence in the same two-branch terms every other verdict is held to.
 */

export const EXPERT_VERIFIER_INSTRUCTION_V2_VERSION =
  'hazlenz.expert.verifier-instruction.v2' as const;

export const EXPERT_VERIFIER_V2_SYSTEM_PROMPT: string = [
  'You are reviewing ONE decision that another safety analysis already made: whether to ask a',
  'clarifying question about something the observation left unresolved.',
  '',
  'You are given an observation of a workplace, whatever governed regulatory evidence was supplied',
  'with it, the result of a deterministic hazard engine, the first-pass analysis, and the specific',
  'unresolved facts that analysis left open. Your jurisdiction is EXACTLY ONE THING: whether the',
  'clarification set is right. You do not re-analyse the hazards.',
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
  '5. DECIDE. Return exactly one verdict:',
  '',
  '   VERIFIED_AS_IS',
  '     The first pass asked a question that reaches the decision-changing fact, or it correctly',
  '     asked nothing.',
  '',
  '   ADD_OR_REPLACE_CLARIFICATION',
  '     A fact that would change what is done now is not asked about. Supply the question, and say',
  '     whether it came from a SUPPLIED_FACT or from a NOMINATED_FACT of your own.',
  '',
  '   NO_CLARIFICATION_REQUIRED',
  '     Something is genuinely unresolved AND the answer would not change what is done now. This is',
  '     an assertion, and it is a normal, frequent and correct answer. Asking anyway costs a real',
  '     person real time and buries the questions that matter.',
  '',
  '   ABSTAIN',
  '     You cannot tell which of the above holds. This asserts nothing. Use it when you genuinely',
  '     cannot decide -- never as a softer way of saying the situation is fine, because those are',
  '     different statements and they are recorded differently.',
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
  'There is no expected number of questions, no expected number of silences, and no expected number',
  'of nominations. Judge each case on its own facts.',
].join('\n');

/** The v2 response schema. One nomination object, never a list. */
export const VERIFIER_V2_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'rationale', 'aboutUnresolvedFactRef', 'clarificationSourceMode',
    'proposedClarification', 'nominatedFact'],
  properties: {
    verdict: {
      type: 'string',
      enum: ['VERIFIED_AS_IS', 'ADD_OR_REPLACE_CLARIFICATION', 'NO_CLARIFICATION_REQUIRED',
        'ABSTAIN'],
    },
    rationale: { type: 'string' },
    aboutUnresolvedFactRef: { type: ['string', 'null'] },
    clarificationSourceMode: {
      type: ['string', 'null'],
      enum: ['SUPPLIED_FACT', 'NOMINATED_FACT', null],
      description: 'Required on ADD_OR_REPLACE_CLARIFICATION, null otherwise.',
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
    nominatedFact: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: ['missingFact', 'observationSpan', 'notEstablishedBecause', 'affectedDecision',
        'branchA', 'decisionIfA', 'branchB', 'decisionIfB', 'whyNecessaryNow'],
      description: 'At most one. Present ONLY when clarificationSourceMode is NOMINATED_FACT.',
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
  },
} as const;
