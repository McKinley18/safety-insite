/**
 * §299 / HZ-4 -- THE EXPOSURE-NEGATION REGRESSION FAMILY.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO WRITES TO ACCEPTED EVIDENCE.
 * Runs with `npm run test:299-person-negation`.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS BEING PROVEN, AND WHAT IS NOT.
 *
 * PROVEN: a negative person quantifier is resolved against the predicate it scopes over, so that
 * denying a CONTROL, an OUTCOME, or nothing in particular no longer denies EXPOSURE -- while a
 * genuine denial of presence or exposure still does. Both directions are asserted. A change that
 * simply stopped negating exposure altogether would fail the NEGATES half of this family, which is
 * the guard against repairing a safety defect by becoming uniformly more conservative.
 *
 * NOT PROVEN: that every English construction is classified correctly. This family is a
 * high-information contrast set over the four predicate senses, not a corpus. Cases whose sense is
 * genuinely unclear are asserted to stay UNRESOLVED rather than being assigned a convenient answer.
 *
 * ---------------------------------------------------------------------------------------------
 * THE §298 SENTENCE IS EXERCISED BUT NOT SPECIAL-CASED.
 *
 * It appears here as one member of the family, and `person-negation-semantics.ts` contains no
 * pattern derived from it. The family would pass with the sentence deleted, and the sentence would
 * fail against the pre-§299 expression along with every other CONTROL_USE and OUTCOME member.
 */
import {
  classifyPersonNegationClause, readPersonNegation,
  type PersonNegationSense,
} from '../src/hazlenz/evidence/person-negation-semantics';
import { buildEvidenceFacts } from '../src/hazlenz/evidence/shared-evidence-facts';

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string): void {
  if (condition) { passed += 1; console.log(`ok    ${message}`); }
  else { failures.push(message); console.error(`FAIL  ${message}`); }
}

/**
 * THE PRE-§299 EXPRESSION, HELD HERE VERBATIM AS THE CONTROL.
 *
 * Kept in the test rather than in production so the family can state, mechanically, which members
 * the old rule got wrong. It is never called by any product path.
 */
const LEGACY_NO_EXPOSURE =
  /\b(no (?:employee|worker|miner|laborer|person|one)s? (?:was |were |is |are )?(?:exposed|present|entered|working|using)|nobody|no one)\b/i;

interface Case {
  readonly text: string;
  readonly sense: PersonNegationSense;
  /** Whether a correct reading negates employee exposure. */
  readonly negates: boolean;
  readonly why: string;
}

// ============================================================ the family
//
// Grouped by the distinction each group exists to draw. Every group contains at least one member
// the pre-§299 expression classified wrongly and at least one it classified rightly, so the family
// measures a DISTINCTION rather than a direction.

const NOBODY_WEARING_PPE: Case[] = [
  { text: 'Nobody working up there had a harness on and I did not see any anchor points.',
    sense: 'CONTROL_USE', negates: false,
    why: 'The §298 sentence. "working up there" restricts which people; "had a harness on" is the '
      + 'predicate, and it denies a control.' },
  { text: 'Nobody was wearing a harness.', sense: 'CONTROL_USE', negates: false,
    why: 'Plainest form of the control denial.' },
  { text: 'No employees were wearing hearing protection in the grinding bay.',
    sense: 'CONTROL_USE', negates: false,
    why: 'Person-class quantifier, control predicate.' },
  { text: 'Nobody had a hard hat on beneath the suspended beam.',
    sense: 'CONTROL_USE', negates: false,
    why: 'A control denial in a sentence that also describes an overhead exposure.' },
];

const NOBODY_USING_FALL_PROTECTION: Case[] = [
  { text: 'No one had fall protection on.', sense: 'CONTROL_USE', negates: false,
    why: '"no one" is bare; the predicate names fall protection.' },
  { text: 'Nobody up on the mezzanine was tied off.', sense: 'CONTROL_USE', negates: false,
    why: 'The restrictor "up on the mezzanine" reads as a location and must not be taken for the '
      + 'predicate -- this is the precise mechanism of HZ-4.' },
  { text: 'Nobody was using fall protection while working near the edge.',
    sense: 'CONTROL_USE', negates: false,
    why: '"using" was a member of the pre-§299 anchored alternative, which made a control denial '
      + 'into an exposure denial even without the bare-word branch.' },
  { text: 'None of the workers were clipped in to the lifeline.',
    sense: 'CONTROL_USE', negates: false,
    why: '"none of the ..." is the same quantifier and was invisible to the old pattern.' },
];

const NOBODY_INJURED: Case[] = [
  { text: 'Nobody was injured and the forklift was not lifting at the time I was there.',
    sense: 'OUTCOME', negates: false,
    why: 'The second §298 sentence. An unharmed worker is still an exposed worker.' },
  { text: 'No employees were hurt when the panel came down.',
    sense: 'OUTCOME', negates: false, why: 'Harm denial with a person-class quantifier.' },
];

const NOBODY_STRUCK: Case[] = [
  { text: 'Nobody was struck by the falling load.', sense: 'OUTCOME', negates: false,
    why: 'A near miss is the paradigm case of exposure without harm.' },
  { text: 'Nobody was caught in the drive when it cycled.', sense: 'OUTCOME', negates: false,
    why: 'Outcome denial about a machine the people were evidently at.' },
];

const NOBODY_EXPOSED: Case[] = [
  { text: 'Nobody was exposed to the open edge at any point.',
    sense: 'PRESENCE_OR_EXPOSURE', negates: true,
    why: 'The intended sense. It must still negate, or the repair has become blanket conservatism.' },
  { text: 'No workers were exposed to the opening.',
    sense: 'PRESENCE_OR_EXPOSURE', negates: true, why: 'The anchored form the old pattern also caught.' },
  { text: 'Not a single employee was exposed during the lift.',
    sense: 'PRESENCE_OR_EXPOSURE', negates: true,
    why: '"not a single ..." is the same quantifier and the old pattern missed it entirely.' },
];

const NOBODY_PRESENT: Case[] = [
  { text: 'Nobody was present in the bay while the press was running.',
    sense: 'PRESENCE_OR_EXPOSURE', negates: true, why: 'Presence denial, bare quantifier.' },
  { text: 'Nobody entered the excavation.', sense: 'PRESENCE_OR_EXPOSURE', negates: true,
    why: 'A finite presence verb opens the predicate without any copula.' },
  { text: 'Nobody was in the trench at the time.', sense: 'PRESENCE_OR_EXPOSURE', negates: true,
    why: 'Prepositional presence.' },
];

const NO_EMPLOYEES_ON_THE_ELEVATED_SURFACE: Case[] = [
  { text: 'No employees were on the platform while the chain was down.',
    sense: 'PRESENCE_OR_EXPOSURE', negates: true,
    why: 'The §299 example of a legitimate exposure negation about an elevated surface.' },
  { text: 'No employees on the elevated surface.', sense: 'PRESENCE_OR_EXPOSURE', negates: true,
    why: 'Verbless note-taking style: with no finite verb there is no restrictor to skip.' },
  { text: 'None of the crew were on the roof during the storm.',
    sense: 'PRESENCE_OR_EXPOSURE', negates: true, why: 'Presence denial in the "none of" form.' },
];

const WORKERS_PRESENT_WITHOUT_THE_CONTROL: Case[] = [
  { text: 'Two stockers were working three feet from the open edge without harnesses.',
    sense: 'UNRESOLVED', negates: false,
    why: 'No negative person quantifier at all. Exposure must be left to the ordinary extractors '
      + 'and must certainly not be negated.' },
  { text: 'Workers were present without the named control.', sense: 'UNRESOLVED', negates: false,
    why: 'An affirmative presence statement containing the word "without"; nothing here is a '
      + 'person-quantifier negation.' },
];

const AMBIGUOUS_MUST_STAY_UNRESOLVED: Case[] = [
  { text: 'Nobody could tell me how long the chain had been down.',
    sense: 'UNRESOLVED', negates: false,
    why: 'An epistemic gap about the site\'s history. It says nothing about presence, control or harm.' },
  { text: 'Nobody was available to walk the area with me.',
    sense: 'UNRESOLVED', negates: false,
    why: 'Availability is not presence. Assigning it either way would be an invented semantic.' },
  { text: 'Nobody seemed concerned about the opening.', sense: 'UNRESOLVED', negates: false,
    why: 'An attitude report. The safe answer is to resolve nothing.' },
];

const ORDER_SENSITIVITY: Case[] = [
  { text: 'Nobody was on the platform wearing a harness.',
    sense: 'PRESENCE_OR_EXPOSURE', negates: true,
    why: 'The presence claim precedes the control noun, so this is a presence denial that happens '
      + 'to mention a control -- the mirror image of the §298 sentence, and it must not be '
      + 'mis-sorted into CONTROL_USE just because a control word occurs.' },
];

const FAMILY: ReadonlyArray<{ group: string; cases: readonly Case[] }> = [
  { group: 'nobody wearing PPE', cases: NOBODY_WEARING_PPE },
  { group: 'nobody using fall protection', cases: NOBODY_USING_FALL_PROTECTION },
  { group: 'nobody injured', cases: NOBODY_INJURED },
  { group: 'nobody struck', cases: NOBODY_STRUCK },
  { group: 'nobody exposed', cases: NOBODY_EXPOSED },
  { group: 'nobody present', cases: NOBODY_PRESENT },
  { group: 'no employees on the elevated surface', cases: NO_EMPLOYEES_ON_THE_ELEVATED_SURFACE },
  { group: 'workers present without the named control', cases: WORKERS_PRESENT_WITHOUT_THE_CONTROL },
  { group: 'ambiguous statements that must remain unresolved', cases: AMBIGUOUS_MUST_STAY_UNRESOLVED },
  { group: 'control mentioned after a genuine presence denial', cases: ORDER_SENSITIVITY },
];

// ============================================================ 1. the semantic classification

console.log('\n================ 1. the four predicate senses are told apart ================\n');

for (const { group, cases } of FAMILY) {
  console.log(`---- ${group} ----`);
  for (const c of cases) {
    const reading = readPersonNegation(c.text);
    const observed: PersonNegationSense = reading.clauses.length === 0
      ? 'UNRESOLVED' : reading.clauses[0].sense;
    check(observed === c.sense,
      `[${group}] sense ${c.sense} (saw ${observed}) -- ${c.text}`);
    check(reading.negatesEmployeeExposure === c.negates,
      `[${group}] ${c.negates ? 'negates' : 'preserves'} exposure -- ${c.why}`);
  }
  console.log('');
}

// ============================================================ 2. the family measures a distinction

console.log('================ 2. the family measures a distinction, not a direction ================\n');

const all = FAMILY.flatMap(g => g.cases);
const negating = all.filter(c => c.negates);
const preserving = all.filter(c => !c.negates);
check(negating.length >= 8, `The family contains ${negating.length} cases that MUST still negate exposure.`);
check(preserving.length >= 8, `The family contains ${preserving.length} cases that must NOT negate exposure.`);

const legacyWrong = all.filter(c => LEGACY_NO_EXPOSURE.test(c.text) !== c.negates);
check(legacyWrong.length > 0,
  `The pre-§299 expression is wrong on ${legacyWrong.length} of ${all.length} members, so the `
  + 'family distinguishes the repair from the defect rather than passing under both.');
for (const c of legacyWrong) console.log(`      pre-§299 wrong: ${c.text}`);

const legacyRight = all.filter(c => LEGACY_NO_EXPOSURE.test(c.text) === c.negates);
check(legacyRight.length > 0,
  `The pre-§299 expression is right on ${legacyRight.length} members, which are the ones the `
  + 'repair must not break.');

// ============================================================ 3. through the real extractor

console.log('\n================ 3. through the shipped buildEvidenceFacts() ================\n');

function exposureFact(text: string): { present: boolean; value: unknown; confidence: number } {
  const e = buildEvidenceFacts({ text } as never);
  const hit = e.facts.find(f => f.type === 'employeeExposure' && f.value === false);
  return { present: hit !== undefined, value: hit?.value, confidence: hit?.confidence ?? 0 };
}

for (const { group, cases } of FAMILY) {
  for (const c of cases) {
    const got = exposureFact(c.text);
    check(got.present === c.negates,
      `[${group}] buildEvidenceFacts ${c.negates ? 'asserts' : 'does not assert'} `
      + `employeeExposure=false -- ${c.text}`);
  }
}

// ============================================================ 4. the clause classifier in isolation

console.log('\n================ 4. the restrictor is never read as the predicate ================\n');

const restrictorCases: ReadonlyArray<[string, string, PersonNegationSense]> = [
  ['Nobody', 'Nobody working up there had a harness on', 'CONTROL_USE'],
  ['Nobody', 'Nobody on the deck was tied off', 'CONTROL_USE'],
  ['No employees', 'No employees working in the trench were wearing respirators', 'CONTROL_USE'],
  ['Nobody', 'Nobody was working in the trench', 'PRESENCE_OR_EXPOSURE'],
];
for (const [q, clause, expected] of restrictorCases) {
  const r = classifyPersonNegationClause(q, clause);
  check(r.sense === expected,
    `"${clause}" -> ${expected} (predicate read as "${r.predicate}", saw ${r.sense})`);
}

// ============================================================

console.log(`\n${passed} checks passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAILED: ${f}`);
  process.exitCode = 1;
}
