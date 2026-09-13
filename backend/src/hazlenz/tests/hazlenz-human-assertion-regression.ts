/**
 * §277 / D-023 — HUMAN ASSERTION vs REGULATORY PREDICATE. Zero provider calls, no database.
 *
 * ==================== THE DISTINCTION THIS PINS ====================
 *
 * A generic review or confirmation action does NOT establish a previously unresolved
 * regulatory fact. A regulatory predicate may become human-settled ONLY when the user
 * explicitly asserts the underlying fact.
 *
 *   "Agree with finding"                  does NOT establish  machine energized = true
 *   "Yes, the machine was energized"      MAY establish it, provenance human_asserted
 *
 * Two different acts: accepting a CONCLUSION, and giving EVIDENCE about a PREDICATE. §276
 * found the product collapsing them in the other direction -- every engine-extracted fact
 * re-labelled `user_confirmation` whenever a reviewer re-ran an analysis. This is the same
 * boundary approached from the other side, and it has to hold in both.
 *
 * The cases below are D-023's own A, B, C and D.
 *
 * Run: npm run test:hazlenz-human-assertion
 */
import { applyEvidenceFoundation } from '../evidence/evidence-foundation';
import { humanAssertedPredicatesFrom, slugifyPredicate } from '../evidence/shared-evidence-facts';

let failures = 0;
let checks = 0;

function check(name: string, condition: boolean, detail?: unknown): void {
  checks += 1;
  if (condition) {
    console.log(`PASS ${name}`);
    return;
  }
  failures += 1;
  console.error(`FAIL ${name}`, detail !== undefined ? JSON.stringify(detail) : '');
}

/**
 * The observation states that a guard is missing and says NOTHING about energy or exposure,
 * so `moving or accessible energy` is genuinely UNKNOWN. It is the §276 P6 case.
 */
const OBSERVATION = 'The point of operation guard has been removed from the press brake in bay 2.';
const ENERGY_QUESTION = 'predicate-29-cfr-1910-212-a-1--moving-or-accessible-energy';
const GUARDING = '29 CFR 1910.212(a)(1)';

type Predicate = { name: string; status: string; provenance?: string; assertedFromQuestionId?: string };
type Decision = {
  citation: string; status: string; confidence: number;
  missingPredicates: string[]; requiredPredicates: Predicate[]; explanation: string;
};

function analyse(clarificationAnswers?: unknown[], extra: Record<string, unknown> = {}) {
  const result: Record<string, unknown> = {};
  applyEvidenceFoundation(result, {
    text: OBSERVATION,
    scopes: ['osha_general_industry'],
    ...(clarificationAnswers ? { clarificationAnswers } : {}),
    ...extra,
  } as never);
  const decisions = (result.applicabilityDecisions ?? []) as Decision[];
  const guarding = decisions.find((item) => item.citation === GUARDING);
  const facts = ((result.evidenceSnapshot ?? {}) as { facts?: Array<{ type: string; value: unknown; source: string }> }).facts ?? [];
  return { decisions, guarding, facts };
}

function predicateOf(decision: Decision | undefined, name: string) {
  return decision?.requiredPredicates.find((item) => item.name === name);
}

// =========================================================================================
// CASE A — UNRESOLVED FACT + GENERIC FINDING CONFIRMATION -> THE FACT REMAINS UNRESOLVED.
//
// Every shape of "I accept this" a caller could plausibly send. None of them names a fact,
// so none of them may settle one.
// =========================================================================================
console.log('--- A: generic confirmation does not establish a fact ---');

const baseline = analyse();
check('A0 the predicate starts genuinely unknown',
  predicateOf(baseline.guarding, 'moving or accessible energy')?.status === 'UNKNOWN',
  baseline.guarding?.requiredPredicates);
check('A0b and the decision is a candidate, not supported',
  baseline.guarding?.status === 'UNKNOWN' && baseline.guarding?.confidence === 0.45,
  [baseline.guarding?.status, baseline.guarding?.confidence]);

const genericConfirmations: Array<[string, unknown[]]> = [
  ['an "agree with finding" acceptance', [{ questionId: 'finding-confirmation', answer: 'Agree with finding' }]],
  ['a bare yes with no question named', [{ answer: 'Yes' }]],
  ['a review decision', [{ questionId: 'review', answer: 'confirmed' }]],
  ['a settlement-shaped acceptance', [{ questionId: 'classification_confirmed', answer: 'Yes' }]],
  ['an empty answer to the right question', [{ questionId: ENERGY_QUESTION, answer: '' }]],
];

for (const [label, answers] of genericConfirmations) {
  const { guarding } = analyse(answers);
  check(`A1 ${label} leaves the predicate UNKNOWN`,
    predicateOf(guarding, 'moving or accessible energy')?.status === 'UNKNOWN',
    guarding?.requiredPredicates);
  check(`A2 ${label} leaves the decision a candidate`,
    guarding?.status === 'UNKNOWN', [guarding?.status, guarding?.confidence]);
  check(`A3 ${label} claims no human provenance`,
    !guarding?.requiredPredicates.some((item) => item.provenance === 'human_asserted'),
    guarding?.requiredPredicates);
}

/**
 * The user-confirmed-facts channel is NOT a predicate assertion channel either. A caller
 * echoing the engine's own extraction back at it -- which is exactly what §276's D-022
 * found the browser doing on every re-run -- must not settle a regulatory predicate.
 */
const echoedFacts = analyse(undefined, {
  structuredObservation: {
    narrative: OBSERVATION,
    userConfirmedFacts: [{ field: 'guardState', value: 'absent_or_ineffective' }],
  },
});
check('A4 echoing engine-extracted facts back as user-confirmed settles no predicate',
  predicateOf(echoedFacts.guarding, 'moving or accessible energy')?.status === 'UNKNOWN',
  echoedFacts.guarding?.requiredPredicates);

// =========================================================================================
// CASE B — UNRESOLVED FACT + EXPLICIT FACTUAL CLARIFICATION ANSWER -> human_asserted.
// =========================================================================================
console.log('\n--- B: an explicit factual answer may establish the fact ---');

const asserted = analyse([{ questionId: ENERGY_QUESTION, answer: 'Yes' }]);
const assertedPredicate = predicateOf(asserted.guarding, 'moving or accessible energy');
check('B1 the named predicate becomes SUPPORTED', assertedPredicate?.status === 'SUPPORTED', assertedPredicate);
check('B2 with provenance human_asserted', assertedPredicate?.provenance === 'human_asserted', assertedPredicate);
check('B3 naming the question the person answered',
  assertedPredicate?.assertedFromQuestionId === ENERGY_QUESTION, assertedPredicate);
check('B4 the decision resolves from candidate to supported',
  asserted.guarding?.status === 'SUPPORTED' && asserted.guarding?.confidence === 0.96,
  [asserted.guarding?.status, asserted.guarding?.confidence]);
check('B5 nothing is left missing', (asserted.guarding?.missingPredicates ?? []).length === 0,
  asserted.guarding?.missingPredicates);

const denied = analyse([{ questionId: ENERGY_QUESTION, answer: 'No' }]);
const deniedPredicate = predicateOf(denied.guarding, 'moving or accessible energy');
check('B6 an explicit NO contradicts the predicate rather than supporting it',
  deniedPredicate?.status === 'CONTRADICTED', deniedPredicate);
check('B7 and still carries human provenance', deniedPredicate?.provenance === 'human_asserted', deniedPredicate);

/**
 * "Not sure" is an answer, and the honest one. It must leave the predicate UNKNOWN -- a
 * person declining to confirm a fact is not a person asserting it.
 */
const unsure = analyse([{ questionId: ENERGY_QUESTION, answer: 'Not sure' }]);
check('B8 "Not sure" leaves the predicate UNKNOWN',
  predicateOf(unsure.guarding, 'moving or accessible energy')?.status === 'UNKNOWN',
  unsure.guarding?.requiredPredicates);
check('B9 and claims no human settlement',
  predicateOf(unsure.guarding, 'moving or accessible energy')?.provenance === undefined);

/**
 * AN ASSERTION MAY NOT OVERTURN OBSERVED EVIDENCE. This is the limit that keeps the
 * mechanism safe in both directions: a predicate the observation already settled keeps what
 * was written down, whichever way the person answers.
 */
console.log('\n--- B: an assertion settles the unknown, never the observed ---');
const observedGuardMissing = analyse([{ questionId: 'predicate-29-cfr-1910-212-a-1--machine-guard-condition', answer: 'No' }]);
const guardCondition = predicateOf(observedGuardMissing.guarding, 'machine guard condition');
check('B10 a predicate the OBSERVATION established is not overturned by an answer',
  guardCondition?.status === 'SUPPORTED', guardCondition);
check('B11 and does not acquire human provenance', guardCondition?.provenance === undefined, guardCondition);

// =========================================================================================
// CASE C — A HUMAN OVERRIDE OF SEVERITY OR CORRECTIVE ACTION MUST NOT MOVE A PREDICATE.
//
// Severity and corrective action are decisions ABOUT a finding. They are not evidence about
// the world, and nothing in their vocabulary names a regulatory predicate.
// =========================================================================================
console.log('\n--- C: a severity or action override moves no predicate ---');

const severityOverrides: Array<[string, unknown[]]> = [
  ['a severity override', [{ questionId: 'risk-override', answer: 'Critical' }]],
  ['a matrix confirmation', [{ questionId: 'reviewer_confirmed', answer: 'severity 4 x likelihood 4 = 16' }]],
  ['a corrective-action confirmation', [{ questionId: 'corrective-action', answer: 'Confirmed' }]],
  ['an Expert settlement decision', [{ questionId: 'CONTROLS_WHETHER_WORK_CONTINUES', answer: 'Yes' }]],
];

for (const [label, answers] of severityOverrides) {
  const { guarding } = analyse(answers);
  check(`C1 ${label} leaves every predicate as the evidence left it`,
    predicateOf(guarding, 'moving or accessible energy')?.status === 'UNKNOWN'
    && !guarding?.requiredPredicates.some((item) => item.provenance === 'human_asserted'),
    guarding?.requiredPredicates);
}

/**
 * And an assertion about ONE predicate must not touch the others. A person answering about
 * energy has said nothing about jurisdiction or about the guard.
 */
const scoped = analyse([{ questionId: ENERGY_QUESTION, answer: 'Yes' }]);
const untouched = (scoped.guarding?.requiredPredicates ?? [])
  .filter((item) => item.name !== 'moving or accessible energy');
check('C2 an assertion about one predicate leaves the others without human provenance',
  untouched.every((item) => item.provenance === undefined), untouched);
check('C3 and does not change their statuses',
  untouched.every((item) => item.status === predicateOf(baseline.guarding, item.name)?.status),
  untouched.map((item) => [item.name, item.status]));

// =========================================================================================
// CASE D — PROVENANCE REMAINS VISIBLE AND AUDITABLE.
// =========================================================================================
console.log('\n--- D: the provenance is visible and auditable ---');

check('D1 the assertion is recorded as an evidence fact',
  asserted.facts.some((item) => item.type === 'humanAssertedPredicate'), asserted.facts.map((f) => f.type));
check('D2 under a source that is NOT user_confirmation',
  asserted.facts.some((item) => item.type === 'humanAssertedPredicate' && item.source === 'human_assertion'),
  asserted.facts.filter((f) => f.type === 'humanAssertedPredicate'));
check('D3 naming the question and the answer',
  asserted.facts.some((item) => item.type === 'humanAssertedPredicate'
    && String(item.value).includes(ENERGY_QUESTION) && String(item.value).endsWith('true')),
  asserted.facts.filter((f) => f.type === 'humanAssertedPredicate'));
check('D4 the decision SAYS a person settled a predicate, in the sentence a reviewer reads',
  /settled by an explicit answer from a person/.test(asserted.guarding?.explanation ?? ''),
  asserted.guarding?.explanation);
check('D5 and names which predicate',
  /moving or accessible energy/.test(asserted.guarding?.explanation ?? ''),
  asserted.guarding?.explanation);
check('D6 a decision with no assertion carries no such sentence',
  !/settled by an explicit answer/.test(baseline.guarding?.explanation ?? ''),
  baseline.guarding?.explanation);
check('D7 a generic confirmation leaves no human-assertion fact behind',
  !analyse([{ questionId: 'finding-confirmation', answer: 'Agree with finding' }])
    .facts.some((item) => item.type === 'humanAssertedPredicate'));

// =========================================================================================
// THE PARSER'S OWN BOUNDARY. Jurisdiction is one inspection-wide fact with its own
// consolidated question and its own resolution path; it is excluded here so two mechanisms
// never compete over one fact.
// =========================================================================================
console.log('\n--- the assertion channel excludes what it must ---');

check('E1 a jurisdiction predicate question is not routed through this channel',
  Object.keys(humanAssertedPredicatesFrom([
    { questionId: 'predicate-29-cfr-1910-212-a-1--general-industry-jurisdiction', answer: 'Yes' },
  ])).length === 0);
check('E2 the consolidated jurisdiction question is not either',
  Object.keys(humanAssertedPredicatesFrom([
    { questionId: 'jurisdiction', answer: 'OSHA General Industry' },
  ])).length === 0);
check('E3 a non-predicate question id is ignored',
  Object.keys(humanAssertedPredicatesFrom([{ questionId: 'machine-energy-state', answer: 'Running or operating' }])).length === 0);
check('E4 a predicate question IS recognised',
  Object.keys(humanAssertedPredicatesFrom([{ questionId: ENERGY_QUESTION, answer: 'Yes' }])).length === 1);
check('E5 the slugifier round-trips the predicate name the question id was built from',
  ENERGY_QUESTION.endsWith(`-${slugifyPredicate('moving or accessible energy')}`),
  slugifyPredicate('moving or accessible energy'));

console.log('\n' + '='.repeat(70));
console.log(`checks: ${checks}   failures: ${failures}`);
if (failures > 0) {
  console.error(
    'HazLenz human-assertion regression FAILED. D-023: a generic confirmation never '
    + 'establishes an unresolved regulatory fact; only an explicit answer about that named '
    + 'fact may, and only with human_asserted provenance attached.',
  );
  process.exit(1);
}
console.log('HazLenz human-assertion / regulatory-predicate regression: all invariants passed, 0 failed');
