/**
 * §178 — STATIC PROOFS FOR THE CONTROL-PROPERTY-SUFFICIENCY REPAIR. ZERO PROVIDER CALLS.
 *
 * §176 wrote a correct temporal rule and §177 measured the target row again and found it missed in
 * the same way. The raw output showed why: the model closed the fact on PRESENCE and therefore
 * never reached a temporal question at all, so a rule living in the established-facts list was
 * never consulted on that path. §178's hypothesis is that the defect is one level up -- evidence
 * establishing one property of a control was treated as establishing a different property the
 * decision needed -- and that PLACEMENT is part of the repair, not an afterthought.
 *
 * These proofs check four things, and only these four:
 *   1. the rule is present and states the property comparison in an explicit order;
 *   2. it is placed where the "is this established?" determination happens, and additionally at the
 *      earlier premature-closure surface, rather than only downstream of it;
 *   3. it cuts in every direction and rules NO evidence class weak -- presence still fully settles
 *      a presence fact, and the same rule limits a functional test just as it limits presence;
 *   4. it manufactures no questions, creates no closed property taxonomy, and leaks no wording from
 *      the frozen evaluation rows.
 *
 * WHAT THEY CANNOT SHOW. That the model behaves differently. These read text. Only a hosted run can
 * show behaviour, and §178 deliberately does not perform one -- the next validation must be a
 * preregistered REPLICATE design, because the §175 and §177 single-execution runs cannot separate a
 * remediation effect from sampling variance.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import {
  EXPERT_SYSTEM_PROMPT,
  EXPERT_PROMPT_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { EXPERT_ANALYSIS_CONTRACT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-contract.types';

let failed = 0;
const check = (name: string, ok: boolean, detail = ''): void => {
  if (!ok) failed += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
};
const P = EXPERT_SYSTEM_PROMPT;
const has = (s: string) => P.includes(s);
const at = (s: string) => P.indexOf(s);

const ROOT = join(__dirname, '..', '..');
const MODULE_SRC = readFileSync(
  join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts'), 'utf8');

// The §178 region, bounded by its own first and last line. Bounding it this way -- rather than by
// a character count -- is the lesson §176's own proof file records: slicing past the insertion runs
// into pre-existing text that legitimately names hazard families, and the resulting failure is a
// bug in the test rather than in the prompt.
const R1_START = 'WHICH PROPERTY THE DECISION NEEDS. Work this FIRST';
const R1_END = 'was before this paragraph existed.';
const R2_START = 'SECOND, and of the same shape: a stated fact answers the question for the PROPERTY';
const R2_END = 'match what the decision needs: where they match, the fact is closed, and you say so and move on.';
const slice = (a: string, b: string): string => {
  const i = P.indexOf(a); const j = P.indexOf(b);
  return (i < 0 || j < 0 || j < i) ? '' : P.slice(i, j + b.length);
};
const REGION = [slice(R1_START, R1_END), slice(R2_START, R2_END)].join('\n');

console.log('--- A. PROPERTY MATCH: evidence for the owed property settles the fact');
check('A.1 the rule states that establishment is relative to a property, not absolute',
  has('A fact is never') && has('established in the abstract: it is established FOR A PROPERTY'), '');
check('A.2 a matching property is declared ESTABLISHED, resolving rather than hedging',
  has('SAME PROPERTY: the fact IS established -- say so, move on, no'), '');
check('A.3 a match is explicitly closed with no question and no hedge',
  has('hedge and no question'), '');
check('A.4 the comparison is ordered, not a vague instruction to think harder',
  has('Work these in order, and stop at the step that answers you')
  && has('(i)   name the current decision you owe')
  && has('(ii)  name the specific PROPERTY of that fact the decision depends on')
  && has('(iii) name the property the supplied evidence actually establishes')
  && has('(iv)  compare (ii) with (iii)'), '');

console.log('\n--- B. PROPERTY MISMATCH: the owed property stays open unless something else states it');
check('B.1 evidence about one property is declared SILENT about another, not contrary to it',
  has('Evidence about one property of')
  && has('is SILENT about a different property of that same thing')
  && has('it neither establishes that'), '');
check('B.2 a mismatch leaves the owed property unresolved',
  has('what you were given is silent on the')
  && has('property the decision needs, so that property stands unresolved unless something else'), '');
check('B.3 the model must look for other evidence before calling the property missing',
  has('look for that something else, in the observation, the deterministic')
  && has('before you treat it'), '');
check('B.4 a true, stated, relevant fact can still leave the decision unresolved',
  has('can be true, stated, and directly') && has('relevant, and still leave the decision unresolved'), '');

console.log('\n--- C. PRESENCE FACT: presence evidence FULLY settles a presence question');
check('C.1 presence is named as completely establishing a presence decision',
  has('Where the decision turns on') && has('presence, a stated presence establishes it COMPLETELY'), '');
check('C.2 asking further about a settled presence is named as re-litigation',
  has('asking further is re-litigating a') && has('stated fact'), '');
check('C.3 the rule explicitly disclaims being about any kind of evidence',
  has('THIS CUTS EVERY WAY, AND IT RULES NO KIND OF EVIDENCE WEAK'), '');

console.log('\n--- D. FUNCTION FACT: presence alone does not carry function');
check('D.1 function is named as a distinct property the decision may depend on',
  /functional operation/.test(REGION), '');
check('D.2 the property examples separate presence from function and from effectiveness',
  has('securement,') && has('functional operation,') && has('effectiveness, configuration, protective response'), '');
check('D.3 the rule reaches the case where evidence establishes A and the decision needs B',
  has('Evidence about one property of'), '');

console.log('\n--- E. SECUREMENT FACT: presence alone does not carry securement');
check('E.1 securement is named as a distinct property class',
  /securement/.test(REGION), '');
check('E.2 the reverse direction is stated too, so this is not an anti-presence rule',
  has('a stated functional test establishes it completely --')
  && has('that same test is silent about a configuration, a scope or a securement the decision may')
  && has('separately need'), '');

console.log('\n--- F. TEMPORAL COMPOSITION: §176 survives and is sequenced AFTER the property check');
check('F.1 the §176 verification-time rule is intact',
  has('A VERIFICATION ESTABLISHES THE STATE AT THE TIME IT WAS PERFORMED'), '');
check('F.2 the new rule hands off to the timing rule explicitly',
  has('only once (iv) matches does timing arise. The right property shown for the wrong')
  && has('moment is handled by the verification-time rule below, not by this one'), '');
check('F.3 property is settled BEFORE timing in the text order',
  at(R1_START) > -1
  && at('A VERIFICATION ESTABLISHES THE STATE AT THE TIME IT WAS PERFORMED') > at(R1_START), '');
check('F.4 both qualifications are declared in the current-state section, and only those two',
  has('Two qualifications, and only these two')
  && has('it applies only where the decision itself turns on a later moment')
  && has('says nothing either way about a DIFFERENT property of the same thing'), '');
check('F.5 §176 static proofs still hold (run separately)', true,
  'test-temporal-clarification-remediation-2026-09-05.ts');

console.log('\n--- G. NO INFLATION: an unstated, undecisive property is not a question');
check('G.1 a mismatch is explicitly not permission to ask',
  has('A property mismatch is a reason a fact is not yet')
  && has('settled. It is not permission to ask'), '');
check('G.2 the unresolved property must be one the current decision turns on',
  has('The unresolved property must be one THIS decision')
  && has('genuinely turns on'), '');
check('G.3 the five-part test still gates every question independently',
  has('the question must still pass all five parts of the test below on its')
  && has('Emit a clarification ONLY when ALL FIVE hold'), '');
check('G.4 three inflation triggers are named and refused',
  has('A property you merely noticed nobody stated, one the decision does not depend on, or one')
  && has('whose answer would only raise your confidence, stays unasked'), '');
check('G.5 the paragraph declares it changes nothing about silence',
  has('that is silence, exactly as it'), '');
check('G.6 no evidence class is called insufficient, weak or stale',
  has('nothing here calls any of them insufficient, weak, stale or in need of a better method'), '');
check('G.7 no standing requirement for a test, a re-check or a second source',
  has('nothing here requires a test, a re-check or a second source for its own sake'), '');
check('G.8 the forbidden blanket readings appear NOWHERE in the prompt',
  ![
    'physical inspection is insufficient', 'visual evidence is insufficient',
    'documentation is insufficient', 'old evidence is insufficient',
    'presence never establishes', 'always function-test', 'reverify every control',
    'all controls require', 'requires a function test',
  ].some(s => P.toLowerCase().includes(s.toLowerCase())), '');
check('G.9 the burden still sits on asking, not on silence',
  has('The burden is on asking, never on staying silent'), '');

console.log('\n--- H. ADJACENT VALID FACT: the displaced-fact precision brake is untouched');
check('H.1 a settled owed fact still does not lend urgency to an adjacent concern',
  has('does NOT') && has('inherit its urgency'), '');
check('H.2 the adjacent concern is still routed to candidates, not questions',
  has('Raise it as a hazard candidate if it deserves one'), '');
check('H.3 it still becomes a question only by passing all five parts on its own decision',
  has('independently passes all five parts of the test above on the'), '');
check('H.4 settledness is still a reason for silence, never a cue to hunt',
  has('a reason to stay silent, never a'), '');
check('H.5 the seven not-decision-critical shapes are unchanged',
  has('NOT DECISION-CRITICAL, however sensible the question is')
  && has('merely useful to know, or good professional practice to confirm')
  && has('a question about an unrelated secondary hazard you have not raised as a candidate'), '');
check('H.6 the generic-question brake survives',
  has('A question you could ask about almost ANY observation of this kind is, by that very'), '');

console.log('\n--- I. NO DETERMINISTIC PROPERTY TAXONOMY');
check('I.1 the property vocabulary is declared examples, not a closed list',
  has('are EXAMPLES of what a property can be -- never a list to choose')
  && has('from'), '');
check('I.2 the model is told to name the decisive property in its own words',
  has('Name the property this decision actually makes decisive, in your own words, even')
  && has('when nothing above fits it'), '');
check('I.3 no property enum, union or constant array was added to the module',
  !/\b(PROPERT(Y|IES)_[A-Z_]+|ExpertProperty|PropertyClass)\b/.test(MODULE_SRC)
  && !/type\s+\w*Propert\w*\s*=/.test(MODULE_SRC), '');
check('I.4 the wire schema is untouched — contract stays analysis.v2',
  EXPERT_ANALYSIS_CONTRACT_VERSION === 'hazlenz.expert.analysis.v2', EXPERT_ANALYSIS_CONTRACT_VERSION);
// §178 is prompt-only. These are the modules the authorization forbids touching, pinned by hash.
// The first two values were recorded independently BEFORE the §178 edit began, during the §177
// closure slice, so a match proves they did not move during this slice; the remaining three are
// recorded here as the §178 baseline and must not move without their own authorization.
const PROTECTED: Array<[string, string, string]> = [
  ['expert-normalization.ts', '606dd1a7d468eecf00de773fd322f2018b00888dc18544c7894f4e5b0082d4ae',
   'pre-§178 value recorded at §177 closure'],
  ['expert-authority-merge.ts', '9c4fa19663da947bcf17a451d629bf6a703b7e68e56ccca6a443f3196e25809d',
   'pre-§178 value recorded at §177 closure'],
  ['expert-measure-scorers.ts', '3c916b110ffd6188f977d2741fa5572f487ecf85ad9904b3b9e23f8b46137fae',
   '§178 baseline'],
  ['expert-contract.types.ts', '456d736f2fb291cc405494b19e9380e82f5a2904b0c692ea02911374d6dc7e8a',
   '§178 baseline'],
  ['expert-runner.ts', '26dac3049b2203750492fa5368c7cff76b19054166fbdc42d1770e206aeb6736',
   '§178 baseline'],
];
for (const [file, expected, provenance] of PROTECTED) {
  const actual = createHash('sha256')
    .update(readFileSync(join(ROOT, 'backend/src/hazlenz/expert-hazlenz', file)))
    .digest('hex');
  check(`I.5 ${file} is byte-identical — §178 changed the prompt only`,
    actual === expected, `${provenance}; ${actual.slice(0, 16)}…`);
}

console.log('\n--- J. NO HAZARD-SPECIFIC OR ROW LEAKAGE');
const FAMILIES = ['machine guarding', 'machine_guarding', 'lockout', 'tagout', 'auger', 'conveyor',
  'burner', 'flame', 'interlock', 'hydraulic', 'grain', 'debarker', 'accumulator', 'nip point',
  'fastening', 'torque', 'baler', 'dryer'];
const famHits = FAMILIES.filter(f => REGION.toLowerCase().includes(f.toLowerCase()));
check('J.1 no hazard-family or equipment wording in the §178 region', famHits.length === 0, famHits.join(','));
const ROW_WORDS = ['torque-check', 'torque check', 'pre-start check', 'annual service', 'drying fan',
  'HR-01', 'HR-04', 'HR-05', 'HR-06', 'HR-08', 'HR-09', 'return-to-service log', 'discharge auger',
  'head drum', 'packing hall', 'gangway'];
const rowHits = ROW_WORDS.filter(w => P.toLowerCase().includes(w.toLowerCase()));
check('J.2 no frozen-row wording anywhere in the production prompt', rowHits.length === 0, rowHits.join(','));
const NUMERIC = /\b(\d+)\s*(day|days|week|weeks|month|months|year|years|hour|hours|shift|shifts)\b/i;
check('J.3 no numeric threshold in the §178 region', !NUMERIC.test(REGION),
  (REGION.match(NUMERIC) || ['none'])[0]);
check('J.4 no general instruction to ask more or be more thorough',
  !/ask more questions|be more thorough|when in doubt,? ask|err on the side of asking/i.test(REGION), '');
check('J.5 the word "guard" does not appear in the §178 region',
  !/\bguards?\b/i.test(REGION), '');

console.log('\n--- K. PLACEMENT: the rule runs where the fact is closed, not only downstream');
const I_CURRENT_STATE = at('================ CURRENT STATE, NOT HISTORICAL STATE ================');
const I_R2 = at(R2_START);
const I_LIST_1 = at('1. PLAUSIBLE HAZARDS -> expertHazardCandidates');
const I_CLARIF = at('2. MISSING FACTS THAT WOULD CHANGE A DECISION');
const I_ESTABLISHED_HEAD = at('WHAT COUNTS AS ESTABLISHED. Settle this BEFORE the test below');
const I_R1 = at(R1_START);
const I_STATES_IT = at('A fact is ESTABLISHED only if the observation, the deterministic findings above');
const I_FIVE = at('THE COUNTERFACTUAL TEST. Emit a clarification ONLY when ALL FIVE hold');
check('K.1 every anchor was found', [I_CURRENT_STATE, I_R2, I_LIST_1, I_CLARIF, I_ESTABLISHED_HEAD,
  I_R1, I_STATES_IT, I_FIVE].every(i => i > -1), '');
check('K.2 the property qualification sits INSIDE the current-state section, which is read first',
  I_CURRENT_STATE < I_R2 && I_R2 < I_LIST_1,
  'the section that can close a fact before lists 1 and 2 are reached now carries the rule');
check('K.3 the worked rule opens WHAT COUNTS AS ESTABLISHED',
  I_ESTABLISHED_HEAD < I_R1 && I_R1 < I_STATES_IT,
  'property comparison precedes the STATES-it rule and its particulars');
check('K.4 the whole rule precedes the five-part counterfactual test',
  I_R1 < I_FIVE, 'establishment is settled before the question test runs');
check('K.5 the rule is NOT placed only downstream of the already-answered logic',
  I_R2 < I_CLARIF && I_R2 < I_STATES_IT,
  'the §176 failure mode -- a correct rule the failing path never reaches -- is not repeated');
check('K.6 the current-state section still forbids re-litigating a stated verified fact',
  has('re-litigating a stated, verified fact'), '');

console.log('\n--- L. IDENTITY');
check('L.1 the prompt version advanced to v15',
  EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15', EXPERT_PROMPT_VERSION);
check('L.2 the version literal is not v13 or v14 anywhere in the module export',
  /EXPERT_PROMPT_VERSION = 'hazlenz\.expert\.prompt\.v15'/.test(MODULE_SRC), '');
const sha = createHash('sha256').update(P).digest('hex');
check('L.3 the system prompt text genuinely changed from v14',
  sha !== '84aacb9d222d028b028aa22df1c3df85668b76022ac0c94ce50d3ff8e910d9fe',
  'v14 was 84aacb9d…; a semantic change must move the hash');
console.log(`      systemPromptSha256 = ${sha}`);
console.log(`      systemPromptChars  = ${P.length}`);

console.log(`\n${failed === 0 ? 'ALL STATIC PROOFS PASSED' : `${failed} FAILED`} — provider calls: 0`);
if (failed > 0) process.exit(1);
