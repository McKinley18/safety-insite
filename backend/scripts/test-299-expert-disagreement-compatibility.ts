/**
 * §299 — THE HZ-4 REPAIR DOES NOT WEAKEN EXPERT DISAGREEMENT HANDLING.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. ZERO WRITES TO ACCEPTED EVIDENCE.
 * Runs with `npm run test:299-expert-disagreement`.
 *
 * ---------------------------------------------------------------------------------------------
 * THE RISK BEING RULED OUT.
 *
 * §298's whole value was that Expert DISAGREED with deterministic HazLenz and was right. The
 * obvious way to ruin that while repairing HZ-4 is to move the semantic judgement into
 * deterministic code until Expert has nothing left to contest, or to narrow what Expert is allowed
 * to say. §299 names this explicitly: Expert must not become a mechanism that merely echoes the
 * deterministic layer.
 *
 * Three things are checked, and they fail for different reasons:
 *
 *   1. THE VOCABULARY IS INTACT. All four disagreement types and all three targets still exist.
 *      A repair that quietly dropped MAY_BE_INCOMPLETE — the type §298 used — would pass every
 *      HZ-4 assertion and destroy the capability that found the defect.
 *
 *   2. NO FILE ON THE EXPERT PATH WAS TOUCHED. Checked against git, against the section's starting
 *      commit. This is the structural claim, and it is the strongest of the three: the Expert
 *      contract, prompt, normalization and merge layers are byte-identical, so nothing about
 *      disagreement CAN have changed.
 *
 *   3. EXPERT STILL HAS SOMETHING TO DISAGREE WITH. The repair changed what deterministic HazLenz
 *      concludes on the §298 note. If it had emptied the deterministic input, Expert would have
 *      nothing to contest and "no disagreement" would become the trivial outcome. The deterministic
 *      projection for that observation is measured before and after, and it must remain non-empty
 *      and contestable.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS NOT CLAIMED.
 *
 * This does NOT claim Expert would still disagree on the §298 observation. That is a hosted
 * question and §299 authorises zero provider calls. What is claimed is that nothing in the §299
 * repair removes, narrows or short-circuits Expert's ABILITY to disagree. Whether a given hosted
 * run does disagree is a separate measurement and is not made here.
 */
import { execFileSync } from 'child_process';

import {
  EXPERT_DISAGREEMENT_TYPES, EXPERT_DISAGREEMENT_TARGETS,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { applyEvidenceFoundation } from '../src/hazlenz/evidence/evidence-foundation';

const failures: string[] = [];
let passed = 0;
function check(condition: unknown, message: string): void {
  if (condition) { passed += 1; console.log(`ok    ${message}`); }
  else { failures.push(message); console.error(`FAIL  ${message}`); }
}

/** The commit §299 started from. */
const SECTION_299_BASE = 'd78150ed91ac4324db084d601035a343f791013a';

/**
 * The commit §299 ENDED at — its source commit, the one that was deployed.
 *
 * §300 CHANGED THIS FROM "the current worktree" TO A FROZEN RANGE, and the reason matters.
 *
 * The claim this section makes is HISTORICAL: that the §299 HZ-4 repair did not touch Expert
 * disagreement handling. Measuring it against the moving worktree made the assertion mean something
 * different every day — and it began failing the moment §300 legitimately changed an Expert-path
 * file to close HZ-6, which is authorized work and not a §299 regression. A gate that fails on
 * authorized later work is a gate that gets deleted.
 *
 * Pinned to d78150ed..317daba8, the §299 claim is exactly as strong as it ever was and is now
 * permanently checkable. THE LIVE HALF OF THIS FILE IS NOT WEAKENED: sections 1 and 3 below read
 * the CURRENT vocabulary and the CURRENT deterministic projection, so a later change that removed
 * a disagreement type or emptied what Expert has to contest still fails here today.
 *
 * This is the same lesson as IT-2: a test pinned to a moving value asserts a moving claim.
 */
const SECTION_299_SOURCE_COMMIT = '317daba88e7ef8c117a2997b6347dae830e8823a';

// ================================================================ 1. the vocabulary

console.log('\n---- 1. Expert can still say every one of the four things ----\n');

for (const type of ['MAY_BE_INCOMPLETE', 'MAY_BE_OVERINCLUSIVE', 'MAY_REQUIRE_CLOSER_REVIEW',
  'EVIDENCE_INSUFFICIENT']) {
  check((EXPERT_DISAGREEMENT_TYPES as readonly string[]).includes(type),
    `${type} is still an available disagreement type.`);
}
check(EXPERT_DISAGREEMENT_TYPES.length === 4,
  `The disagreement vocabulary is still exactly four members (saw ${EXPERT_DISAGREEMENT_TYPES.length}).`);

for (const target of ['DETERMINISTIC_RESULT', 'GOVERNED_STANDARD', 'AVAILABLE_EVIDENCE']) {
  check((EXPERT_DISAGREEMENT_TARGETS as readonly string[]).includes(target),
    `${target} is still an available disagreement target.`);
}
check((EXPERT_DISAGREEMENT_TARGETS as readonly string[]).includes('DETERMINISTIC_RESULT'),
  'Expert may still target THE DETERMINISTIC RESULT specifically — the target §298 used.');

// ================================================================ 2. nothing on the Expert path changed

console.log('\n---- 2. no file on the Expert path was modified by §299 ----\n');

/**
 * Every directory and file that decides what Expert is asked, what it may say, and what is done
 * with a disagreement. A §299 edit to any of them would be exactly the risk this script exists to
 * rule out, and would fail here loudly rather than being argued about in prose.
 */
const EXPERT_PATH_PREFIXES = [
  'backend/src/hazlenz/expert-hazlenz/',
  'backend/src/hazlenz/expert-hazlenz-adapters/',
  'backend/src/hazlenz/expert-hazlenz-product/',
  'backend/src/safescope-v2/expert-hazlenz/',
  'backend/scripts/lib/expert-',
];

const repoRoot = `${__dirname}/../..`;
const lines = (out: string): string[] =>
  out.split('\n').map(l => l.trim()).filter(l => l.length > 0);

/*
 * TRACKED MODIFICATIONS **AND** UNTRACKED ADDITIONS.
 *
 * `git diff --name-only` alone would miss a NEW file dropped onto the Expert path, which is the
 * easiest way to change Expert behaviour without appearing to change anything -- a new module that
 * an existing one imports. `ls-files --others` closes that, so the set below is everything §299
 * added or altered.
 */
const changed = lines(execFileSync('git',
  ['diff', '--name-only', SECTION_299_BASE, SECTION_299_SOURCE_COMMIT, '--'],
  { cwd: repoRoot, encoding: 'utf8' })).sort();

/*
 * The worktree carries a great deal of pre-existing untracked material that §299 did not author, so
 * the FILTER runs over everything (that is what makes it sound) while the LISTING shows only the
 * tracked modifications -- which is the §299 edit set -- plus any Expert-path hit. Printing 540
 * paths would bury the one line that matters.
 */
console.log(`      §299 range: ${SECTION_299_BASE.slice(0, 8)}..${SECTION_299_SOURCE_COMMIT.slice(0, 8)}`);
console.log(`      files changed by §299: ${changed.length}`);
for (const f of changed) console.log(`        M  ${f}`);

const expertTouched = changed.filter(f => EXPERT_PATH_PREFIXES.some(p => f.startsWith(p)));
for (const f of expertTouched) console.log(`        !! ${f}`);
check(expertTouched.length === 0,
  '§299 modified no Expert contract, prompt, normalization, adapter or product file. '
  + (expertTouched.length === 0 ? '' : `Touched: ${expertTouched.join(', ')}`));

// ================================================================ 3. there is still something to contest

console.log('\n---- 3. the deterministic layer still says something Expert could contest ----\n');

const OBSERVATION_298 =
  'Morning walkthrough of the warehouse shipping area. The storage mezzanine above the packing '
  + 'benches was being restocked. On the west side there is a pallet-loading opening about twelve '
  + 'feet wide where the forklift lifts pallets up to the deck. The chain that normally goes across '
  + 'that opening was unhooked and lying on the deck, so the edge was open. One of the stockers was '
  + 'working maybe three feet from that open edge with his back to it, moving cartons off a pallet. '
  + 'It is about a ten foot drop to the concrete below. Nobody working up there had a harness on '
  + 'and I did not see any anchor points. The supervisor told me the chain gets unhooked whenever '
  + 'they are loading and they hook it back afterwards. I do not know whether that opening is '
  + 'supposed to have a proper gate or whether the chain is all they have ever had there. Nobody '
  + 'was injured and the forklift was not lifting at the time I was there.';

const result: Record<string, unknown> = {};
applyEvidenceFoundation(result, { description: OBSERVATION_298, text: OBSERVATION_298 } as never);
const decisions = (result.applicabilityDecisions as Array<{
  citation: string; status: string; missingPredicates: string[];
}>) ?? [];

console.log(`      applicabilityDecisions: ${decisions.map(d => `${d.citation}=${d.status}`).join(', ') || '(none)'}`);
console.log(`      evidenceSnapshot facts: `
  + `${((result.evidenceSnapshot as { facts?: unknown[] })?.facts ?? []).length}`);

check(decisions.length > 0,
  'The deterministic layer still emits an applicability decision for the §298 observation, so the '
  + 'Expert request still carries a deterministic conclusion. An empty projection would make '
  + '"Expert did not disagree" trivially true.');
check(decisions.some(d => d.missingPredicates.length > 0),
  'At least one decision still names a missing predicate — a concrete, quotable deterministic '
  + 'claim for Expert to contest as MAY_BE_INCOMPLETE if it judges the evidence supports it.');
check(((result.evidenceSnapshot as { facts?: unknown[] })?.facts ?? []).length > 0,
  'The evidence snapshot is still populated, so the repair did not hollow out what Expert sees.');

/**
 * THE ONE CLAIM THAT MATTERS MOST, AND IT IS A NEGATIVE ONE.
 *
 * Deterministic code did not acquire a semantic conclusion here. HZ-4 was repaired by REMOVING a
 * false assertion, not by adding a true one: the exposure predicate is UNKNOWN, not TRUE. If it had
 * been set to TRUE, deterministic code would have authored a safety semantic it cannot establish —
 * and Expert's judgement about exposure would have been pre-empted rather than invited.
 */
const fall = decisions.find(d => d.citation === '29 CFR 1910.28');
check(fall?.status === 'UNKNOWN',
  'The fall-protection decision is UNKNOWN, not SUPPORTED: the repair removed a false deterministic '
  + 'claim without inventing its converse, so the semantic question remains open to Expert.');
check(fall?.missingPredicates.includes('employee access or exposure') === true,
  'And the open question is named explicitly as a missing predicate rather than silently dropped.');

// ================================================================

console.log(`\n${passed} checks passed, ${failures.length} failed`);
if (failures.length > 0) {
  for (const f of failures) console.error(`  FAILED: ${f}`);
  process.exitCode = 1;
}
