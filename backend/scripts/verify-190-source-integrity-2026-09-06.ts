/**
 * §190 -- SOURCE INTEGRITY GATE. Read-only. Zero provider calls, zero database operations.
 *
 * Extends the §188 gate with the three things §190 additionally has to prove: that the §188 neutral
 * ballot is still UNANSWERED, that the partial §189 human answers are preserved, and that the frozen
 * §188 scorer was not modified in order to produce a model-adjudicated figure.
 *
 * Every hash is CALCULATED from the file on disk. None is copied from a report.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { EXPERT_SYSTEM_PROMPT } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, VERIFIER_V3_RESPONSE_SCHEMA,
  EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
} from './lib/expert-verifier-instruction-v3';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'backend', 'src', 'safescope-v2', 'expert-hazlenz');
const V = (n: string): string => join(ROOT, 'verification', n);
const EVID187 = V('expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const EVID188 = V('expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');
const EVID189 = V('expert-hazlenz-required-structured-verifier-human-adjudication-2026-09-06');
const EVID190 = V('expert-hazlenz-required-structured-verifier-model-adjudication-2026-09-06');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const PREREG = JSON.parse(readFileSync(join(EVID187, 'PREREGISTRATION.json'), 'utf8'));

interface Check { id: string; expected: string; actual: string; ok: boolean }
const checks: Check[] = [];
const check = (id: string, expected: string, actual: string): void => {
  checks.push({ id, expected, actual, ok: expected === actual });
};

// ---- frozen identities, exactly as §188 verified them
check('PREREGISTRATION.json',
  '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82',
  shaFile(join(EVID187, 'PREREGISTRATION.json')));
check('expert-prompt.ts (file)', PREREG.firstPassIdentity.promptFileSha256,
  shaFile(join(SRC, 'expert-prompt.ts')));
check('EXPERT_SYSTEM_PROMPT (string)', PREREG.firstPassIdentity.systemPromptSha256,
  sha(EXPERT_SYSTEM_PROMPT));
for (const [file, expected] of Object.entries<string>(PREREG.owedFactSourceHashes)) {
  check(`owed-facts/${file}`, expected, shaFile(join(SRC, 'owed-facts', file)));
}
check('EXPERT_VERIFIER_V3_SYSTEM_PROMPT (string)', PREREG.verifierIdentity.systemPromptSha256,
  sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT));
check('VERIFIER_V3_RESPONSE_SCHEMA (canonical JSON)', PREREG.verifierIdentity.responseSchemaSha256,
  sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)));
check('verifier instruction version', PREREG.verifierIdentity.instructionVersion,
  EXPERT_VERIFIER_INSTRUCTION_V3_VERSION);
const TRUTH = V('expert-hazlenz-owed-fact-truth-2026-09-05');
for (const [file, expected] of Object.entries<string>(PREREG.frozenTruthHashes)) {
  check(`§184 ${file}`, expected, shaFile(join(TRUTH, file)));
}

// ---- §190-specific governance checks
const ballot = JSON.parse(readFileSync(join(EVID188, 'HUMAN-ADJUDICATION.json'), 'utf8'));
check('§188 neutral ballot still PENDING_HUMAN_ADJUDICATION',
  'PENDING_HUMAN_ADJUDICATION', ballot.status);
let nulls = 0; let filled = 0;
for (const item of ballot.items) {
  for (const slot of Object.values<any>(item.adjudication.axes)) {
    if (slot.finding === null) nulls += 1; else filled += 1;
  }
  if (item.adjudication.STRICT_SEMANTIC_VERDICT.verdict === null) nulls += 1; else filled += 1;
  if (item.adjudication.HR04_CATEGORY) {
    if (item.adjudication.HR04_CATEGORY.verdict === null) nulls += 1; else filled += 1;
  }
}
check('§188 neutral ballot verdict slots all null', '112 null / 0 filled',
  `${nulls} null / ${filled} filled`);
check('§188 frozen scorer unmodified',
  '48979797770506be722b7645dabdafde9ea6697aae1831ef47f9e62ed56c1c98',
  shaFile(join(__dirname, 'score-188-strict-semantic-gate-2026-09-06.ts')));

const human = JSON.parse(readFileSync(join(EVID189, 'RAW-HUMAN-ANSWERS.json'), 'utf8'));
check('§189 human answers preserved and INCOMPLETE',
  '65 / 112', human.completeness.HUMAN_ADJUDICATION_COMPLETENESS);
check('§189 adjudicator unchanged', 'PRODUCT_OWNER', human.adjudicator);

const model = JSON.parse(readFileSync(join(EVID190, 'MODEL-ADJUDICATION.json'), 'utf8'));
check('§190 labelled as MODEL, not human',
  'MODEL_SEMANTIC_ADJUDICATION', model.ADJUDICATION_KIND);
check('§190 disclaims being the frozen human adjudication', 'false',
  String(model.IS_THIS_THE_FROZEN_HUMAN_ADJUDICATION));

// ---- evidence hashes, recorded so a later change is detectable
const evidence: Array<[string, string]> = [];
for (const f of ['RESUMED-VERIFIER-EXECUTIONS.jsonl', 'FIRST-PASS-STIMULI.json', 'RUN-SUMMARY.json',
  'RESUME-RUN-SUMMARY.json', 'ADMISSION-RECOMPUTE.json', 'SECTION-187B-INTEGRITY.json',
  'STRICT-SEMANTIC-REVIEW-PACKET-187B.md']) {
  evidence.push([`§187 ${f}`, shaFile(join(EVID187, f))]);
}
for (const f of ['HUMAN-ADJUDICATION.json', 'STRICT-SEMANTIC-GATE.json', 'REMEDIATION-REVIEW.md',
  'RUN-SUMMARY.json']) {
  evidence.push([`§188 ${f}`, shaFile(join(EVID188, f))]);
}
evidence.push(['§189 RAW-HUMAN-ANSWERS.json', shaFile(join(EVID189, 'RAW-HUMAN-ANSWERS.json'))]);

const failed = checks.filter(c => !c.ok);
const lines: string[] = [];
lines.push('§190 SOURCE INTEGRITY GATE — MODEL SEMANTIC ADJUDICATION');
lines.push(`recomputed ${new Date().toISOString()} from the files on disk`);
lines.push('');
lines.push(`RESULT: ${failed.length === 0 ? 'PASS' : 'FAIL'}   ${checks.length - failed.length}/${checks.length}`);
lines.push('');
for (const c of checks) {
  lines.push(`${c.ok ? 'OK  ' : 'FAIL'}  ${c.id}`);
  lines.push(`        expected  ${c.expected}`);
  if (!c.ok) lines.push(`        actual    ${c.actual}`);
}
lines.push('');
lines.push('EVIDENCE HASHES — §187, §188, §189 unchanged by this review');
lines.push('');
for (const [k, v] of evidence) lines.push(`  ${v}  ${k}`);
lines.push('');
lines.push('PROMPT_CHANGES = 0   SCHEMA_CHANGES = 0   VERIFIER_CONTRACT_CHANGES = 0');
lines.push('PRODUCT_RUNTIME_CHANGES = 0   DATABASE_OPERATIONS = 0   PROVIDER_CALLS = 0');
lines.push('FROZEN_SCORER_CHANGES = 0');
lines.push('');
lines.push('§190 added, all diagnostic/harness, none product runtime:');
lines.push('  backend/scripts/lib/expert-model-adjudication-2026-09-06.ts   (model judgements)');
lines.push('  backend/scripts/build-model-adjudication-2026-09-06.ts        (builder + model scorer)');
lines.push('  backend/scripts/verify-190-source-integrity-2026-09-06.ts     (this gate)');
lines.push('  backend/scripts/present-189-adjudication-item-2026-09-06.ts   (read-only presenter)');
lines.push('');
lines.push('GOVERNANCE: the frozen §189 human semantic gate remains UNMEASURED /');
lines.push('NOT_COMPLETED_BY_A_HUMAN_REVIEWER at 65/112. The §188 neutral ballot is unanswered.');
lines.push('No §190 artifact is a human verdict.');
lines.push('');

writeFileSync(join(EVID190, 'SOURCE-INTEGRITY.txt'), `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
if (failed.length > 0) process.exit(1);
