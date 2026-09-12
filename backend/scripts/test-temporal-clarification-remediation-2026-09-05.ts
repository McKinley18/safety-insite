/**
 * §176 — STATIC PROOFS FOR THE TEMPORAL-SUFFICIENCY CLARIFICATION REPAIR. ZERO PROVIDER CALLS.
 *
 * The §175 miss (HR-04) was not the model ignoring an instruction. It was the model FOLLOWING one:
 * `CURRENT STATE, NOT HISTORICAL STATE` tells it not to re-litigate a stated verification, and the
 * row stated one -- the fastenings had been torque-checked. What the prompt never said was that a
 * verification speaks for a TIME, and that the decision may depend on a different one.
 *
 * These proofs check the repair says that, generally, and that it did not buy recall by loosening
 * the precision rules around it. They are STATIC: they read the prompt text. A static proof cannot
 * show the model behaves differently -- only a hosted run can, and that is a separately authorized
 * operation. What these can show is that the rule is present, is general, and carries its brakes.
 */

import { EXPERT_SYSTEM_PROMPT, EXPERT_PROMPT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { createHash } from 'crypto';

let failed = 0;
const check = (name: string, ok: boolean, detail = ''): void => {
  if (!ok) failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
};
const P = EXPERT_SYSTEM_PROMPT;
const has = (s: string) => P.includes(s);

console.log('--- A. IMPLICIT TEMPORAL GAP: a prior positive verification is not automatically present truth');
check('A.1 a verification is scoped to the time it was performed',
  has('A VERIFICATION ESTABLISHES THE STATE AT THE TIME IT WAS PERFORMED'), '');
check('A.2 a positively stated fact can still be unestablished for this decision',
  has('positively stated and still not be established FOR THIS DECISION'), '');
check('A.3 the decisive moments are named without naming a hazard family',
  has('immediately before work, entry,') && has('energisation, exposure, or return to service'), '');
check('A.4 the model is told to compare the two moments explicitly',
  has('WHEN does the evidence') && has('WHEN the decision needs it to speak for')
  || has('WHEN does the decision need it to speak for?'), '');
check('A.5 matching moments are declared ESTABLISHED, so the rule resolves rather than hedges',
  has('the fact IS established -- say so and move on'), '');

console.log('\n--- B. EXPLICIT TEMPORAL GAP: prior behaviour is still represented');
check('B.1 the current-vs-past section survives intact',
  has('CURRENT STATE, NOT HISTORICAL STATE'), '');
check('B.2 re-litigating a stated verified fact is still forbidden',
  has('re-litigating a stated, verified fact'), '');
check('B.3 the remediation-closure rule still stands',
  has('do NOT raise a candidate or a clarification ABOUT'), '');
check('B.4 the qualification is explicitly bounded to later-moment decisions',
  has('it applies only where the decision itself turns on a later moment'), '');

console.log('\n--- C. EVIDENCE SUFFICIENCY: unchanged');
check('C.1 own inference still does not establish a fact',
  has('Your own inference does not establish'), '');
check('C.2 the assumed-worse-state rule survives',
  has('if you ASSUMED the worse of two possible states') && has('you assumed is NOT established'), '');
check('C.3 the resemblance rule survives', has('resemblance is a reason to ask, not an answer'), '');
check('C.4 the threshold-is-not-a-gap precision rule survives',
  has('A THRESHOLD IS NOT A GAP'), '');

console.log('\n--- D. PRECISION / DISPLACED VALID FACT');
check('D.1 a settled owed fact does not lend urgency to an adjacent concern',
  has('does NOT') && has('inherit its urgency'), '');
check('D.2 the adjacent concern is routed to candidates, not to questions',
  has('Raise it as a hazard candidate if it deserves one'), '');
check('D.3 it may still become a question only by passing the full test on its own decision',
  has('independently passes all five parts of the test above on the'), '');
check('D.4 settledness is named as a reason for silence, not a cue to hunt',
  has('a reason to stay silent, never a'), '');
check('D.5 the five-part counterfactual test is unchanged and still gates every question',
  has('Emit a clarification ONLY when ALL FIVE hold'), '');
check('D.6 the burden still sits on asking',
  has('The burden is on asking, never on staying silent'), '');

console.log('\n--- E. NO QUESTION-INFLATION');
check('E.1 the rule denies any age or interval reading',
  has('THIS IS ABOUT THE DECISION, NEVER ABOUT AGE'), '');
check('E.2 old evidence is explicitly declared fully established where the decision allows',
  has('performed long ago is FULLY ESTABLISHED'), '');
check('E.3 recency is explicitly denied as sufficient',
  has('performed minutes ago settles'), '');
check('E.4 three inflation triggers are named and forbidden',
  has('because a record is old') && has('because an interval has elapsed')
  && has('because re-checking would be good practice'), '');
check('E.5 no schedule or due-date reading is licensed',
  has('no schedule, due date or routine period makes evidence'), '');
check('E.6 "might have changed since" is explicitly not a reason',
  has('not a reason to ask whether anything') && has('might have changed since'), '');

console.log('\n--- F. NO DETERMINISTIC THRESHOLD, NO HAZARD-SPECIFIC WORDING, NO ROW LEAKAGE');
const NUMERIC_TIME = /\b(\d+)\s*(day|days|week|weeks|month|months|year|years|hour|hours|shift|shifts)\b/i;
// Each inserted region is bounded by its OWN first and last line. Slicing a fixed number of
// characters instead would run past the insertion into pre-existing text -- and the very next
// paragraph after insertion 2 is the existing generality disclaimer that NAMES hazard families
// ("not specific to machine guarding ... lockout/tagout"), which would fail F.3 for text §176
// never wrote. The bug that caused was in this test, not in the prompt.
const SPANS: Array<[string, string]> = [
  ['A VERIFICATION ESTABLISHES THE STATE AT THE TIME IT WAS PERFORMED',
   'AND the test below is then met in full;'],
  // §178 RE-ANCHOR, NOT A RELAXATION. §178 added a SECOND qualification of the same shape beside
  // this one (property, where §176's is time), so the sentence that opens the §176 region now reads
  // "Two qualifications, and only these two. FIRST, ...". The span still ends where §176's text
  // ends, so this file continues to prove §176's region and only §176's region -- the §178 text
  // that follows it is proved separately by test-control-property-sufficiency-2026-09-05.ts.
  ['Two qualifications, and only these two',
   'it applies only where the decision itself turns on a later moment.'],
  ['a DIFFERENT unresolved fact noticed while',
   'prompt to look for something else to ask.'],
];
const added = SPANS.map(x => x[0]);
const region = SPANS.map(([a, b]) => {
  const i = P.indexOf(a); const j = P.indexOf(b);
  return (i < 0 || j < 0 || j < i) ? '' : P.slice(i, j + b.length);
}).join('\n');
check('F.1 all three inserted regions are present', added.every(a => P.includes(a)), '');
check('F.2 no numeric time threshold in the inserted text', !NUMERIC_TIME.test(region),
  (region.match(NUMERIC_TIME) || ['none'])[0]);
const FAMILIES = ['machine guarding', 'machine_guarding', 'lockout', 'tagout', 'auger', 'guard fastening',
  'conveyor', 'burner', 'flame', 'interlock', 'hydraulic', 'grain', 'debarker', 'accumulator'];
const famHits = FAMILIES.filter(f => region.toLowerCase().includes(f.toLowerCase()));
check('F.3 no hazard-family-specific wording in the inserted text', famHits.length === 0, famHits.join(','));
const ROW_WORDS = ['torque-check', 'pre-start check', 'annual service', 'drying fan', 'HR-04', 'HR-05',
  'return-to-service log', 'discharge auger'];
const rowHits = ROW_WORDS.filter(w => P.toLowerCase().includes(w.toLowerCase()));
check('F.4 no §175 row wording anywhere in the production prompt', rowHits.length === 0, rowHits.join(','));
check('F.5 no instruction to ask more questions generally',
  !/ask more questions|be more thorough|when in doubt,? ask|err on the side of asking/i.test(region), '');

console.log('\n--- G. identity');
check('G.1 prompt version is the current authorized one (v13 at §176, v14 at §177, v15 at §178)',
  EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15', EXPERT_PROMPT_VERSION);
console.log(`      systemPromptSha256 = ${createHash('sha256').update(P).digest('hex')}`);

console.log(`\n${failed === 0 ? 'ALL STATIC PROOFS PASSED' : `${failed} FAILED`} — provider calls: 0`);
if (failed > 0) process.exit(1);
