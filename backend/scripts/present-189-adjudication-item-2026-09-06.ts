/**
 * §189 -- PRESENT ONE ADJUDICATION ITEM. Read-only. Zero provider calls, zero database operations.
 *
 * Prints the frozen material for one adjudication slot group, exactly as the §188 neutral ballot
 * carries it, so the reviewer sees the evidence rather than a summary of it.
 *
 * ==================== THE BLINDNESS REQUIREMENT ====================
 *
 * This presenter deliberately does NOT print: any aggregate, any running count, any per-row status,
 * any scorer consequence, any headroom, any remediation recommendation, and any terminal. The §188
 * ballot carries `scorerConsequence` per outcome and it is suppressed here on purpose -- a reviewer
 * who can see what an answer does to the score is adjudicating outcome-aware.
 *
 * It prints no recommended answer, because there is none to print. This model does not hold one.
 *
 * usage:  ts-node present-189-adjudication-item-2026-09-06.ts <adjudicationId>
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const EVID188 = join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');

const ballot = JSON.parse(readFileSync(join(EVID188, 'HUMAN-ADJUDICATION.json'), 'utf8'));
const id = process.argv[2];
const item = ballot.items.find((i: any) => i.adjudicationId === id);
if (!item) {
  console.error(`no such adjudicationId: ${id}`);
  console.error(`available: ${ballot.items.map((i: any) => i.adjudicationId).join(' ')}`);
  process.exit(1);
}

const rule = (s: string): void => console.log(`\n${'='.repeat(78)}\n${s}\n${'='.repeat(78)}`);

rule(`${item.adjudicationId}    sequence position ${item.sequencePosition} of 15`);

console.log('\n--- OBSERVATION (frozen) ---\n');
console.log(item.observation);

console.log('\n--- THE OWED FACT SUPPLIED TO THIS EXECUTION (frozen) ---\n');
const f = item.suppliedOwedFact;
console.log(`factKey            ${f.factKey}`);
console.log(`affectedDecision   ${f.affectedDecision}`);
console.log(`unresolved because ${f.whyUnresolved}`);
console.log(`observation span   ${f.evidenceSpan}`);
console.log(`one answer         ${f.branchA}`);
console.log(`  today under it   ${f.decisionDivergence.ifA}`);
console.log(`the other answer   ${f.branchB}`);
console.log(`  today under it   ${f.decisionDivergence.ifB}`);

console.log('\n--- FIRST-PASS CLARIFICATIONS ALREADY ASKED (frozen) ---\n');
if (item.firstPassAskedNothing) {
  console.log('(none — the first pass asked nothing on this row)');
} else {
  for (const q of item.firstPassClarificationsAsked) {
    console.log(`[${q.affectedDecision}] ${q.question}`);
  }
}

console.log('\n--- THE PROVIDER RESPONSE BEING JUDGED (verbatim) ---\n');
const p = item.providerOutput;
console.log(`verdict                  ${p.verdict}`);
console.log(`clarificationSourceMode  ${p.clarificationSourceMode}`);
console.log(`bindingFactKey           ${p.bindingFactKey}`);
console.log(`proposedClarification    ${p.proposedClarification === null ? 'null' : JSON.stringify(p.proposedClarification, null, 2)}`);
console.log(`nominatedFact            ${p.nominatedFact === null ? 'null' : JSON.stringify(p.nominatedFact, null, 2)}`);
console.log(`owedFactDeclarations     ${JSON.stringify(p.owedFactDeclarations)}`);
console.log('\nrationale, verbatim:\n');
console.log(p.rationale);
if (p.challengeReasons && p.challengeReasons.length > 0) {
  console.log('\nchallenge reason, verbatim:\n');
  for (const r of p.challengeReasons) console.log(r);
}

console.log('\n--- MECHANICAL FACTS (determined without adjudication) ---\n');
console.log(`corrected contract admission   ${item.mechanical.correctedAdmission}`);
if (item.mechanical.correctedAdmissionCodes.length > 0) {
  console.log(`refusal codes                  ${item.mechanical.correctedAdmissionCodes.join(', ')}`);
}
console.log(`wrong supplied key declared    ${item.mechanical.wrongKeyDeclared}`);
console.log(`settlement performed           ${item.mechanical.settlementPerformed}`);
if (item.mechanical.note) console.log(`\nnote: ${item.mechanical.note}`);

console.log('\n--- THE FROZEN QUESTIONS FOR THIS EXECUTION ---\n');
for (const [axis, slot] of Object.entries<any>(item.adjudication.axes)) {
  console.log(`${axis}`);
  console.log(`   ${slot.question}`);
  console.log(`   allowed: ${slot.allowedOutcomes.join(' | ')}\n`);
}
console.log('STRICT_SEMANTIC_VERDICT');
console.log(`   ${item.adjudication.STRICT_SEMANTIC_VERDICT.question}`);
console.log(`   allowed: ${item.adjudication.STRICT_SEMANTIC_VERDICT.allowedOutcomes.join(' | ')}\n`);
if (item.adjudication.HR04_CATEGORY) {
  console.log('HR04_CATEGORY');
  console.log(`   ${item.adjudication.HR04_CATEGORY.question}`);
  for (const c of item.adjudication.HR04_CATEGORY.categories) {
    console.log(`   ${c.category} — ${c.text}`);
  }
}
console.log('\nNo aggregate, no running count, no per-row status, no scorer consequence and no');
console.log('recommended answer is printed. That suppression is deliberate.\n');
