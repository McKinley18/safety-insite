/**
 * §156 EXPERT HAZLENZ -- THE VERIFIER INSTRUCTION. DEVELOPMENT PROTOTYPE ONLY.
 *
 * The smallest general instruction that implements the §155 verifier contract. It is a SECOND-PASS
 * instruction and has nothing to do with the v13 first-pass prompt, which is frozen and untouched.
 *
 * ==================== WHAT IS DELIBERATELY ABSENT ====================
 *
 * No fixture wording. No row identifier. No domain vocabulary from any evaluation case -- no
 * autoclave, no cooling hold, no spray booth, no flame-failure device. No answer key. No quota, no
 * expected ratio of questions to silences, and no hint about how often either answer should occur.
 * A grep of this file for any of those terms returns nothing, and §156's pre-spend gate asserts it.
 *
 * The instruction asks four general questions and nothing else:
 *
 *   1. what unresolved fact, if any, remains?
 *   2. would resolving it change a decision being made now?
 *   3. does an existing question already address it?
 *   4. retain, add or replace, omit, or abstain?
 *
 * ==================== THE ONE THING IT INSISTS ON ====================
 *
 * That "an unresolved fact exists" and "a question is warranted" are DIFFERENT FINDINGS. A verifier
 * that cannot say "yes, something is unresolved, and no, do not ask" would manufacture a question on
 * every case it is sent, and §155 measured that the trigger sends it a population where roughly half
 * of the retained unknowns are correctly left alone. Saying so plainly is the difference between a
 * verifier and a question generator.
 */

export const EXPERT_VERIFIER_INSTRUCTION_VERSION =
  'hazlenz.expert.verifier-instruction.v1' as const;

export const EXPERT_VERIFIER_SYSTEM_PROMPT: string = [
  'You are reviewing ONE decision that another safety analysis already made: whether to ask a',
  'clarifying question about something the observation left unresolved.',
  '',
  'You are given an observation of a workplace, whatever governed regulatory evidence was supplied',
  'with it, the result of a deterministic hazard engine, the first-pass analysis, and the specific',
  'unresolved facts that analysis left open. Your jurisdiction is EXACTLY ONE THING: whether the',
  'clarification set is right. You do not re-analyse the hazards.',
  '',
  'WORK THROUGH FOUR QUESTIONS IN ORDER.',
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
  '4. DECIDE. Return exactly one verdict:',
  '',
  '   VERIFIED_AS_IS',
  '     The first pass asked a question that reaches the decision-changing fact, or it correctly',
  '     asked nothing.',
  '',
  '   ADD_OR_REPLACE_CLARIFICATION',
  '     A fact that would change what is done now is not asked about. Supply the question.',
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
  'YOU MAY NOT: add, remove or rewrite hazard candidates; change the deterministic result; cite or',
  'quote a regulation; add cross-hazard insights or disagreements; or rewrite the analysis. If you',
  'return any of those, the whole verdict is discarded.',
  '',
  'There is no expected number of questions and no expected number of silences. Judge each case on',
  'its own facts.',
].join('\n');

/** The user-message body for one case. Contains only what the packet carries. */
export function buildVerifierUserPrompt(input: {
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
  unresolvedFacts: Array<{ ref: string; kind: string; text: string }>;
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
  if (input.unresolvedFacts.length === 0) {
    lines.push('(none were identified — the first pass returned an entirely empty analysis)');
  }
  for (const f of input.unresolvedFacts) lines.push(`- ${f.ref}: ${f.text}`);
  lines.push('');
  lines.push('Return your verdict as JSON matching the required schema.');
  return lines.join('\n');
}

/** The response schema. Deliberately narrow: the contract's authority surface and nothing more. */
export const VERIFIER_RESPONSE_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['verdict', 'rationale', 'aboutUnresolvedFactRef', 'proposedClarification'],
  properties: {
    verdict: {
      type: 'string',
      enum: ['VERIFIED_AS_IS', 'ADD_OR_REPLACE_CLARIFICATION', 'NO_CLARIFICATION_REQUIRED',
        'ABSTAIN'],
    },
    rationale: { type: 'string' },
    aboutUnresolvedFactRef: {
      type: ['string', 'null'],
      description: 'Which supplied unresolved fact this verdict concerns, or null.',
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
  },
} as const;
