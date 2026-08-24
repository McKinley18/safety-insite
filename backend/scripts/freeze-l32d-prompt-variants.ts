/**
 * L3-2d -- freezes the HISTORICAL system prompts so post-repair ablations compare against the real
 * thing rather than a paraphrase.
 *
 * The pre-repair ablation recovered the L3-2b text by inverting the L3-2c edits and recorded its
 * sha256. Once L3-2d edits the live prompt that inversion no longer applies, so this program walks
 * the chain backwards once -- v4 -> v3 (invert the L3-2d edits) -> v2 (invert the L3-2c edits) --
 * and writes both out. `ablate-l32d-prompt.ts` re-verifies them against the recorded hashes and
 * refuses to run on a mismatch.
 *
 * Every anchor is asserted, so a silent partial inversion is impossible.
 *
 * Run: npx ts-node scripts/freeze-l32d-prompt-variants.ts
 */
import { writeFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { L3_SYSTEM_PROMPT } from '../src/safescope-v2/reasoning-l3/reasoning-prompt';

const V4 = L3_SYSTEM_PROMPT;

// ---- invert the L3-2d edits to recover v3 (the L3-2c prompt)
const D_RUNG_NEW = [
  '                      This rung has a required output shape -- see ASKING A QUESTION below.',
  '  UNKNOWN             you cannot classify it even as insufficient.',
  '',
  'A NEGATION GOVERNS ONLY ITS OWN CLAUSE. "There was no water on the floor of the wash bay, and the',
  'supply cord has its jacket cut back to bare copper" contains a negated clause AND a hard fact. The',
  'fact is ACTIVE; the negation says nothing whatever about it. Read EVERY clause and classify from',
  'the one that carries a condition. A safe clause never cancels an unsafe one, and returning no',
  'candidate because the sentence happened to open with "no" is one of the worst errors you can make.',
  '',
].join('\n');
const C_RUNG_OLD = [
  '                      THIS BRANCH HAS A REQUIRED OUTPUT SHAPE. Whenever you land here because the',
  '                      observation reports only how something LOOKED or SEEMED to the observer, or',
  '                      hedges the only fact it contains ("may be cut", "might be damaged",',
  '                      "struck me as odd", "did not look right"), you MUST emit a candidate for the',
  '                      hazard family you suspect, with conditionState INSUFFICIENT_EVIDENCE and a',
  '                      filled-in `clarification`. An empty hazardCandidates list here is WRONG: it',
  '                      says you have nothing to ask about when in fact you have a specific question.',
  '                      The candidate asserts no hazard. It records what you suspect and what you',
  '                      need in order to decide.',
  '  UNKNOWN             you cannot classify it even as insufficient.',
  '',
].join('\n');

const D_CLAR_NEW = [
  'ASKING A QUESTION -- AND WHEN NOT TO.',
  '`clarification` is a field on a hazard candidate, so a question needs a candidate to hang on.',
  '',
  'ASK when the ladder lands on INSUFFICIENT_EVIDENCE or UNKNOWN because one missing fact would change',
  'one of these four things:',
  '  - whether a hazard exists at all;      - the condition state;',
  '  - which hazard family applies;         - whether the situation is high-consequence.',
  'Then you MUST emit a candidate for the hazard family you suspect, with conditionState',
  'INSUFFICIENT_EVIDENCE and a filled-in `clarification`: the missing fact, the decision it changes,',
  'at least two branches it could resolve to, and the question to ask. An empty hazardCandidates list',
  'is WRONG here -- it says you have nothing to ask about when you have a specific question. The',
  'candidate asserts no hazard; it records what you suspect and what you need in order to decide.',
  '',
  'DO NOT ASK when the ladder reached ACTIVE, CONTROLLED, CORRECTED, NEGATED, HYPOTHETICAL or',
  'REMOVED_FROM_SERVICE. Those states mean the decision IS ALREADY MADE, and such a candidate MUST',
  'carry `clarification: null`. It does not matter that more could be learned -- which solvent it was,',
  'who removed the guard, how long it has been like that, how deep the accumulation is, whether it',
  'might fail later. A question that would only refine an answer you can already give is noise, and a',
  'question hung on a hazard you have already classified is worse than noise: it tells the inspector',
  'you are unsure when you are not.',
].join('\n');
const C_CLAR_OLD = [
  'WHEN TO ASK A CLARIFICATION. Fill in `clarification` when, and only when, one missing fact would',
  'change one of these four things:',
  '  - whether a hazard exists at all;',
  '  - the condition state;',
  '  - which hazard family applies;',
  '  - whether the situation is high-consequence.',
  'Say what fact is missing, which decision it changes, at least two branches it could resolve to,',
  'and the question to ask. The INSUFFICIENT_EVIDENCE rung above is where this happens most often.',
  'Do NOT ask when the observation already answers the question, and do NOT ask for detail that would',
  'only refine an answer you can already give. A question that changes no decision is noise, and a',
  'question attached to a hazard you can already classify is noise too.',
].join('\n');

const D_IMP_NEW = [
  'is never ACTIVE. Take INSUFFICIENT_EVIDENCE and follow ASKING A QUESTION below -- a candidate with',
  'a clarification, not an empty answer.',
].join('\n');
const C_IMP_OLD = [
  'is never ACTIVE. Take the INSUFFICIENT_EVIDENCE rung above, WITH its required candidate and',
  'clarification -- not an empty answer.',
].join('\n');

let v3 = V4;
for (const [a, b] of [[D_RUNG_NEW, C_RUNG_OLD], [D_CLAR_NEW, C_CLAR_OLD], [D_IMP_NEW, C_IMP_OLD]] as const) {
  if (!v3.includes(a)) throw new Error(`v3 inversion anchor missing: ${a.slice(0, 60)}`);
  v3 = v3.replace(a, b);
}

// ---- invert the L3-2c edits to recover v2 (the L3-2b prompt)
const C_BLOCK = C_RUNG_OLD.split('\n').slice(0, 9).join('\n');
const B_IMP = 'is never ACTIVE. Choose INSUFFICIENT_EVIDENCE or UNKNOWN.';
const C_IMP2 = C_IMP_OLD;
const C_CLAR_TAIL = [
  'Say what fact is missing, which decision it changes, at least two branches it could resolve to,',
  'and the question to ask. The INSUFFICIENT_EVIDENCE rung above is where this happens most often.',
  'Do NOT ask when the observation already answers the question, and do NOT ask for detail that would',
  'only refine an answer you can already give. A question that changes no decision is noise, and a',
  'question attached to a hazard you can already classify is noise too.',
].join('\n');
const B_CLAR_TAIL = [
  'A subjective impression with no supporting fact is the clearest case: say what fact is missing,',
  'which decision it changes, at least two branches it could resolve to, and the question to ask.',
  '',
  'A QUESTION STILL NEEDS A CANDIDATE TO HANG ON. `clarification` is a field on a hazard candidate,',
  'so when you have a real question, emit the candidate for the hazard family you suspect with',
  'conditionState INSUFFICIENT_EVIDENCE and put the clarification on it. Do NOT return an empty',
  'hazardCandidates list when you have a specific question to ask -- an empty list says you have',
  'nothing to ask about. A candidate in INSUFFICIENT_EVIDENCE asserts no hazard; it records what you',
  'suspect and what you need in order to decide.',
  'Do NOT ask when the observation already answers the question, and do NOT ask for detail that would',
  'only refine an answer you can already give. A question that changes no decision is noise.',
].join('\n');

let v2 = v3.replace('\n' + C_BLOCK, '');
v2 = v2.replace(C_IMP2, B_IMP);
v2 = v2.replace(C_CLAR_TAIL, B_CLAR_TAIL);

const h = (x: string) => createHash('sha256').update(x).digest('hex');
const out = { v2_l32b: v2, v3_l32c: v3 };
console.log(JSON.stringify({ v2: h(v2), v3: h(v3), v4: h(V4), lines: { v2: v2.split('\n').length, v3: v3.split('\n').length, v4: V4.split('\n').length } }, null, 2));
writeFileSync(join(__dirname, '..', 'src/safescope-v2/reasoning-l3/eval/prompt-variants-frozen.json'), JSON.stringify(out, null, 2) + '\n');
