/**
 * §168 EXPERT HAZLENZ -- NEUTRAL 12-PAIR HUMAN BINDING REVIEW PACKET. ZERO PROVIDER CALLS.
 *
 * ==================== WHAT THIS SCRIPT DOES AND DELIBERATELY DOES NOT DO ====================
 *
 * It BUILDS the packet a human reviewer adjudicates, and it ASSIGNS NOTHING. §164 classified "is a
 * binding truthful" as `REQUIRES_HUMAN_TRUTH`, and the standing rule on this programme is that the
 * neutral packet is built and the operation stops. Every disposition field in
 * `BINDING-ADJUDICATION-FORM.json` is emitted as `null`.
 *
 * ==================== THE NEUTRALITY REQUIREMENT, ENFORCED RATHER THAN INTENDED ====================
 *
 * §168 forbids showing the reviewer: the historical v2 outcome, any pass/fail label, the §167 scorer
 * result, an expected adjudication, per-draw success/failure status, or the model's self-assessment.
 *
 * `NEUTRALITY_FORBIDDEN_PATTERNS` greps the FINISHED packet for every one of those and refuses to
 * write it if any appears. A packet that leaks its own answer is not a review instrument, and §163
 * showed that a blinding claim asserted rather than checked is worth nothing.
 *
 * ONE DELIBERATE EXCLUSION, STATED SO IT IS NOT MISTAKEN FOR AN OVERSIGHT: the verifier's own
 * `rationale` is NOT presented. It is the model arguing for its own answer, which is precisely the
 * "model self-assessment" the authorization excludes, and a reviewer reading a persuasive rationale
 * before judging the question it defends is no longer judging the question. The rationale is
 * preserved verbatim in `RUN-RECORDS.jsonl` and can be consulted after a disposition is recorded.
 */

import { createHash } from 'crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  SUPPLIED_OWED_FACTS, OWED_TARGET_KEY, EXPECTED_FROZEN_REQUEST_SHA256,
} from './lib/expert-v3-experiment-cases-2026-09-04';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const S167 = join(V, 'expert-hazlenz-verifier-v3-scoped-falsification-2026-09-04');
const S163 = join(V, 'expert-hazlenz-verifier-draw-reliability-2026-09-04');
const S166 = join(V, 'expert-hazlenz-verifier-v3-binding-protocol-2026-09-04');
const PACKET = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03', 'VERIFIER-PACKET.json');
const OUT = join(V, 'expert-hazlenz-verifier-v3-human-binding-review-2026-09-04');

const sha256 = (s: string): string => createHash('sha256').update(s).digest('hex');
const sha256File = (p: string): string => sha256(readFileSync(p, 'utf8'));

interface Rec {
  rowId: string; caseId: string; draw: number; semanticRequestSha256: string;
  verdict: string | null; clarificationSourceMode: string | null; bindingFactKey: string | null;
  owedFactDeclarations: Array<{ factKey: string; declaration: string;
    challengeReason: string | null }> | null;
  proposedQuestion: string | null; proposedAffectedDecision: string | null;
  nominationPresent: boolean;
  nominatedFact: { missingFact: string; observationSpan: string; notEstablishedBecause: string;
    affectedDecision: string; branchA: string; decisionIfA: string; branchB: string;
    decisionIfB: string; whyNecessaryNow: string } | null;
  owedTargetStatusAfter: string | null; uncoveredFactKeys: string[];
  TARGET_COVERAGE_WARNING: boolean; customerQuestionCount: number;
  ledgerFactCountBefore: number; ledgerFactCountAfter: number;
  coverageTransitions: Array<{ factKey: string; from: string; to: string; authority: string }>;
}

const recs = readFileSync(join(S167, 'RUN-RECORDS.jsonl'), 'utf8').trim().split('\n')
  .map(l => JSON.parse(l) as Rec);
const packet = JSON.parse(readFileSync(PACKET, 'utf8')) as
{ cases: Array<{ caseId: string; observation: string }> };
const observationFor = (caseId: string): string =>
  packet.cases.find(c => c.caseId === caseId)!.observation;

/**
 * A question string is flagged COMPOUND when it structurally contains more than one interrogative
 * about more than one subject. Detected on punctuation and conjunction shape, NOT on meaning: the
 * flag tells the reviewer where to look and decides nothing.
 */
function compoundShape(q: string): { compound: boolean; markers: string[] } {
  const markers: string[] = [];
  if (/\band separately,/i.test(q)) markers.push('"and separately,"');
  if (/\?\s*\S/.test(q)) markers.push('more than one question mark');
  if (/\), and\b/i.test(q)) markers.push('parenthetical followed by ", and"');
  if (/\bor\b[^?]*\bor\b/i.test(q) && q.length > 220) markers.push('multiple disjunctions');
  return { compound: markers.length > 0, markers };
}

mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- §167 integrity proof

const integrity = {
  provedAt: new Date().toISOString(),
  statement: '§167 is frozen. Nothing in this operation rescored, reinterpreted or rewrote it. Any '
    + 'new interpretation produced by the human review is recorded separately as '
    + 'HUMAN_POSTHOC_ADJUDICATION.',
  section167: {
    'RUN-RECORDS.jsonl': sha256File(join(S167, 'RUN-RECORDS.jsonl')),
    'FROZEN-REQUESTS.json': sha256File(join(S167, 'FROZEN-REQUESTS.json')),
    'FALSIFICATION-SCORES.json': sha256File(join(S167, 'FALSIFICATION-SCORES.json')),
    'EXECUTION-ACCOUNTING.json': sha256File(join(S167, 'EXECUTION-ACCOUNTING.json')),
    'SCOPED-FALSIFICATION-RESULT.md': sha256File(join(S167, 'SCOPED-FALSIFICATION-RESULT.md')),
    'SCOPED-FALSIFICATION-SUMMARY.json': sha256File(join(S167, 'SCOPED-FALSIFICATION-SUMMARY.json')),
  },
  frozenRequestHashes: EXPECTED_FROZEN_REQUEST_SHA256,
  requestHashesStillMatchTheRunRecords: recs.every(
    r => r.semanticRequestSha256 === EXPECTED_FROZEN_REQUEST_SHA256[r.caseId]),
  recordCount: recs.length,
  section163Baseline: {
    'DRAW-RUN-RECORDS.jsonl': sha256File(join(S163, 'DRAW-RUN-RECORDS.jsonl')),
    recordCount: readFileSync(join(S163, 'DRAW-RUN-RECORDS.jsonl'), 'utf8').trim().split('\n').length,
    unchanged: sha256File(join(S163, 'DRAW-RUN-RECORDS.jsonl'))
      === '7e84cef427d8c12659d01b96bf992bf41fc42c1ed8a2f46ba6dc7ddef07d8399',
  },
  section166Protocol: {
    'VERIFIER-INSTRUCTION-V3.txt': sha256File(join(S166, 'VERIFIER-INSTRUCTION-V3.txt')),
    'VERIFIER-V3-RESPONSE-SCHEMA.json': sha256File(join(S166, 'VERIFIER-V3-RESPONSE-SCHEMA.json')),
    'V2-V3-SEMANTIC-DIFF.json': sha256File(join(S166, 'V2-V3-SEMANTIC-DIFF.json')),
  },
};
writeFileSync(join(OUT, 'SECTION-167-INTEGRITY-PROOF.json'),
  JSON.stringify(integrity, null, 2) + '\n');

// ---------------------------------------------------------------- the neutral packet

const md: string[] = [];
md.push('# Verifier-v3 — 12-pair human binding review packet');
md.push('');
md.push('**FOR HUMAN ADJUDICATION. Prepared §168, 2026-09-04. Zero provider calls.**');
md.push('');
md.push('Twelve clarification/owed-fact pairs produced by verifier protocol v3. For each pair the');
md.push('question to answer is whether the clarification **actually asks for the owed fact it');
md.push('declared it covers**. A declaration is not a proof, and no automated check in this');
md.push('repository can settle it.');
md.push('');
md.push('**This packet assigns no disposition.** Record answers in');
md.push('`BINDING-ADJUDICATION-FORM.json`, whose every verdict field is `null`.');
md.push('');
md.push('<!-- NEUTRALITY-DISCLOSURE-START -->');
md.push('## What is deliberately absent');
md.push('');
md.push('No historical v2 outcome, no pass/fail label, no scorer result, no expected adjudication,');
md.push('no per-draw success/failure status, and no model self-assessment. The verifier\'s own');
md.push('`rationale` is **excluded**: it is the model arguing for its own answer, and reading a');
md.push('persuasive defence before judging the thing it defends is not review. It is preserved');
md.push('verbatim in `../expert-hazlenz-verifier-v3-scoped-falsification-2026-09-04/RUN-RECORDS.jsonl`');
md.push('and may be consulted **after** a disposition is recorded.');
md.push('');
md.push('The `COMPOUND SHAPE` line is a structural flag on punctuation and conjunctions only. It');
md.push('marks where to look and decides nothing.');
md.push('<!-- NEUTRALITY-DISCLOSURE-END -->');
md.push('');
md.push('---');
md.push('');

for (const caseId of ['VC-08', 'VC-04']) {
  const obs = observationFor(caseId);
  const supplied = SUPPLIED_OWED_FACTS[caseId];
  md.push(`## Observation ${caseId}`);
  md.push('');
  md.push('> ' + obs);
  md.push('');
  md.push('### Owed fact supplied to the verifier');
  md.push('');
  for (const f of supplied) {
    md.push('```');
    md.push(`factKey:            ${f.factKey}`);
    md.push(`affectedDecision:   ${f.affectedDecision}`);
    md.push(`whyUnresolved:      ${f.whyUnresolved}`);
    md.push(`evidenceSpan:       ${f.evidenceSpan ?? '(none)'}`);
    md.push(`branchA:            ${f.branchA}`);
    md.push(`  decision if A:    ${f.decisionDivergence.ifA}`);
    md.push(`branchB:            ${f.branchB}`);
    md.push(`  decision if B:    ${f.decisionDivergence.ifB}`);
    md.push('```');
    md.push('');
  }
  md.push('---');
  md.push('');

  for (const r of recs.filter(x => x.caseId === caseId)) {
    const shape = compoundShape(r.proposedQuestion ?? '');
    md.push(`### PAIR ${r.caseId}-${r.draw}`);
    md.push('');
    md.push(`**bindingFactKey:** \`${r.bindingFactKey ?? '(none)'}\``);
    md.push('');
    md.push('**Proposed clarification, verbatim:**');
    md.push('');
    md.push('> ' + (r.proposedQuestion ?? '(none emitted)'));
    md.push('');
    md.push(`**affectedDecision:** \`${r.proposedAffectedDecision ?? '(none)'}\``);
    md.push('');
    md.push('**owedFactDeclarations:**');
    md.push('');
    for (const d of r.owedFactDeclarations ?? []) {
      md.push(`- \`${d.factKey}\` → \`${d.declaration}\``
        + (d.challengeReason ? ` — challenge reason: ${d.challengeReason}` : ''));
    }
    md.push('');
    if (r.nominationPresent && r.nominatedFact) {
      const n = r.nominatedFact;
      md.push('**Additive nomination present.** Its proof, verbatim:');
      md.push('');
      md.push('```');
      md.push(`missingFact:           ${n.missingFact}`);
      md.push(`observationSpan:       ${n.observationSpan}`);
      md.push(`notEstablishedBecause: ${n.notEstablishedBecause}`);
      md.push(`affectedDecision:      ${n.affectedDecision}`);
      md.push(`branchA:               ${n.branchA}`);
      md.push(`  decision if A:       ${n.decisionIfA}`);
      md.push(`branchB:               ${n.branchB}`);
      md.push(`  decision if B:       ${n.decisionIfB}`);
      md.push(`whyNecessaryNow:       ${n.whyNecessaryNow}`);
      md.push('```');
    } else {
      md.push('**Additive nomination:** none emitted.');
    }
    md.push('');
    md.push('**Resulting state**');
    md.push('');
    md.push('| | |');
    md.push('|---|---|');
    md.push(`| owed fact status after | \`${r.owedTargetStatusAfter}\` |`);
    md.push(`| coverage transitions | ${r.coverageTransitions.length === 0 ? 'none'
      : r.coverageTransitions.map(t => `\`${t.factKey.split(':').pop()}\` ${t.from} → ${t.to} `
        + `via ${t.authority}`).join('; ')} |`);
    md.push(`| ledger facts before → after | ${r.ledgerFactCountBefore} → ${r.ledgerFactCountAfter} |`);
    md.push(`| uncovered fact keys | ${r.uncoveredFactKeys.length === 0 ? 'none'
      : r.uncoveredFactKeys.map(k => `\`${k}\``).join(', ')} |`);
    md.push(`| TARGET_COVERAGE_WARNING | \`${String(r.TARGET_COVERAGE_WARNING)}\` |`);
    md.push(`| customer-visible question strings | ${r.customerQuestionCount} |`);
    md.push(`| COMPOUND SHAPE (structural flag only) | ${shape.compound
      ? `**flagged** — ${shape.markers.join('; ')}` : 'not flagged'} |`);
    md.push('');
    md.push('---');
    md.push('');
  }
}

md.push('## The six questions to answer for each pair');
md.push('');
md.push('| | question |');
md.push('|---|---|');
md.push('| A | Does the clarification actually ask for the supplied owed fact? |');
md.push('| B | Would an answer to the clarification resolve that owed fact? |');
md.push('| C | Is the `affectedDecision` appropriate? |');
md.push('| D | Does the clarification introduce an unsupported assumption? |');
md.push('| E | Does the question materially distort or narrow the owed fact? |');
md.push('| F | If compound, can each factual component be answered independently? |');
md.push('');
md.push('## Allowed dispositions, one per pair');
md.push('');
md.push('```');
md.push('BINDING_SEMANTICALLY_CORRECT');
md.push('BINDING_PARTIALLY_CORRECT');
md.push('BINDING_INCORRECT');
md.push('BINDING_AMBIGUOUS');
md.push('```');
md.push('');
md.push('Keyword or lexical similarity may not decide any of these, and the evaluated model may not');
md.push('adjudicate itself.');
md.push('');
md.push('Reviewer: ______________________  Date: ____________');
md.push('');

const packetText = md.join('\n');

// ---------------------------------------------------------------- neutrality enforcement

/**
 * The patterns target LABELS a reviewer could read an answer off, not English words.
 *
 * `correctly` is deliberately NOT a pattern: it appears inside verbatim provider questions
 * ("operating correctly"), which the reviewer must see in full. A guard that forced provider text
 * to be paraphrased would corrupt the thing being reviewed in order to pass a check.
 */
const NEUTRALITY_FORBIDDEN_PATTERNS: Array<[string, RegExp]> = [
  ['historical v2 outcome', /\b(3\/10|1\/10|7\/10|8\/10|4\/20|6\/6|12\/12)\b/],
  ['pass\\/fail label', /(?<![-\w])(PASS|FAIL|PASSED|FAILED)(?![-_\w])/],
  ['scorer result', /TARGET_REACHED|VALID_BUT_TARGET_DISPLACED|INVALID_WRONG_FACT|SETTLED_SILENCE/],
  ['scorer vocabulary', /semanticSuccess|modelReachedTargetCue|architectureBoundOwedKey|columnsAgree/],
  ['falsifier verdict', /FALSIFIER_[A-F]_TRIGGERED|CORE_BINDING_CLAIM_FALSIFIED/],
  ['per-draw outcome label',
    /\bdraw[^.\n]{0,20}\b(succeeded|failed|was (in)?correct|is (in)?correct)\b/i],
  ['outcome adjective applied to a pair', /\bthis (pair|draw|binding) (is|was) \w+/i],
  ['expected adjudication', /expected disposition|should be adjudicated|we believe|likely correct/i],
  ['section reference to prior result', /§16[357]/],
  ['human target text',
    /functional status\/effectiveness of the burner|rotor-guard interlock protective/],
  ['model self-assessment', /"?rationale"?\s*:/],
];
/**
 * The disclosure block names the very things it excludes, so scanning it would flag the sentence
 * that promises the flag will not appear. It is stripped by explicit delimiter — a bounded, visible
 * exclusion rather than a loosened pattern.
 */
const scannable = packetText.replace(
  /<!-- NEUTRALITY-DISCLOSURE-START -->[\s\S]*?<!-- NEUTRALITY-DISCLOSURE-END -->/g, '');
const leaks = NEUTRALITY_FORBIDDEN_PATTERNS
  .filter(([, re]) => re.test(scannable))
  .map(([n, re]) => `${n} — ${JSON.stringify((scannable.match(re) ?? [''])[0])}`);

if (leaks.length > 0) {
  console.error('NEUTRALITY_GUARD_TRIPPED — refusing to write a packet that leaks its own answer:');
  for (const l of leaks) console.error(`  ${l}`);
  process.exit(1);
}
writeFileSync(join(OUT, 'HUMAN-BINDING-REVIEW-PACKET.md'), packetText);

// ---------------------------------------------------------------- the unfilled form

const form = {
  formVersion: 'hazlenz.expert.v3-binding-adjudication.v1',
  createdAt: new Date().toISOString(),
  INSTRUCTIONS: 'A human reviewer fills `disposition` and the six answers for every pair. A pair '
    + 'left null is NOT thereby correct — absence of adjudication is not adjudication. No count in '
    + 'PHASE 6 may be computed while any pair is null.',
  allowedDispositions: ['BINDING_SEMANTICALLY_CORRECT', 'BINDING_PARTIALLY_CORRECT',
    'BINDING_INCORRECT', 'BINDING_AMBIGUOUS'],
  questions: {
    A: 'Does the clarification actually ask for the supplied owed fact?',
    B: 'Would an answer to the clarification resolve that owed fact?',
    C: 'Is the affectedDecision appropriate?',
    D: 'Does the clarification introduce an unsupported assumption?',
    E: 'Does the question materially distort or narrow the owed fact?',
    F: 'If compound, can each factual component be answered independently?',
  },
  adjudicationMayNotBeDecidedBy: ['keyword or lexical similarity', 'the evaluated model',
    'the §167 scorer output', 'agreement between the two §167 columns'],
  pairs: recs.map(r => ({
    pairId: `${r.caseId}-${r.draw}`,
    rowId: r.rowId,
    bindingFactKey: r.bindingFactKey,
    proposedQuestion: r.proposedQuestion,
    affectedDecision: r.proposedAffectedDecision,
    nominationPresent: r.nominationPresent,
    compoundShapeFlagged: compoundShape(r.proposedQuestion ?? '').compound,
    disposition: null,
    answers: { A: null, B: null, C: null, D: null, E: null, F: null },
    reviewerNote: null,
  })),
  reviewer: null,
  reviewedAt: null,
};
writeFileSync(join(OUT, 'BINDING-ADJUDICATION-FORM.json'), JSON.stringify(form, null, 2) + '\n');

console.log('§168 neutral review packet written');
console.log(`  ${OUT}`);
for (const f of ['HUMAN-BINDING-REVIEW-PACKET.md', 'BINDING-ADJUDICATION-FORM.json',
  'SECTION-167-INTEGRITY-PROOF.json']) {
  console.log(`    ${f}  ${sha256File(join(OUT, f)).slice(0, 24)}…`);
}
console.log(`\n  pairs: ${recs.length}`);
console.log(`  dispositions assigned by this script: 0 (all null)`);
console.log(`  neutrality patterns checked: ${NEUTRALITY_FORBIDDEN_PATTERNS.length}, 0 matches`);
console.log(`  compound-shape flagged pairs: `
  + recs.filter(r => compoundShape(r.proposedQuestion ?? '').compound)
    .map(r => `${r.caseId}-${r.draw}`).join(', '));
console.log(`  §167 integrity: request hashes still match records = `
  + `${integrity.requestHashesStillMatchTheRunRecords}; §163 baseline unchanged = `
  + `${integrity.section163Baseline.unchanged}`);
console.log('\nPROVIDER CALLS: 0   COST: $0.00');
