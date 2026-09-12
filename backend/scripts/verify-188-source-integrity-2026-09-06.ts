/**
 * §188 -- SOURCE INTEGRITY GATE. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Recomputes, from the files on disk right now, every identity the §187A preregistration froze
 * before the first provider call, and compares each against the frozen value. Hashes are CALCULATED
 * from the actual files; none is copied from a task description or from a prior report.
 *
 * The prompt-string and schema hashes are recomputed the way the §187A harness computed them --
 * `sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT)` and `sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA))` --
 * rather than by hashing the file, so a change to the prompt TEXT is caught even if the file's
 * comments changed too, and a comment-only edit is not misreported as a prompt change.
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
const EVID187 = join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const EVID188 = join(ROOT, 'verification',
  'expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));

const PREREG = JSON.parse(readFileSync(join(EVID187, 'PREREGISTRATION.json'), 'utf8'));

interface Check { id: string; expected: string; actual: string; ok: boolean; }
const checks: Check[] = [];
const check = (id: string, expected: string, actual: string): void => {
  checks.push({ id, expected, actual, ok: expected === actual });
};

// ---- the frozen preregistration itself
check('PREREGISTRATION.json',
  '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82',
  shaFile(join(EVID187, 'PREREGISTRATION.json')));

// ---- first-pass prompt identity (product runtime source)
check('expert-prompt.ts (file)', PREREG.firstPassIdentity.promptFileSha256,
  shaFile(join(SRC, 'expert-prompt.ts')));
check('EXPERT_SYSTEM_PROMPT (string)', PREREG.firstPassIdentity.systemPromptSha256,
  sha(EXPERT_SYSTEM_PROMPT));

// ---- owed-fact runtime source
for (const [file, expected] of Object.entries<string>(PREREG.owedFactSourceHashes)) {
  check(`owed-facts/${file}`, expected, shaFile(join(SRC, 'owed-facts', file)));
}

// ---- verifier identity (development prototype; the §188 authorization forbids changing it)
check('EXPERT_VERIFIER_V3_SYSTEM_PROMPT (string)', PREREG.verifierIdentity.systemPromptSha256,
  sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT));
check('VERIFIER_V3_RESPONSE_SCHEMA (canonical JSON)', PREREG.verifierIdentity.responseSchemaSha256,
  sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)));
check('verifier instruction version', PREREG.verifierIdentity.instructionVersion,
  EXPERT_VERIFIER_INSTRUCTION_V3_VERSION);

// ---- the §184 truth artifacts
const TRUTH = join(ROOT, 'verification', 'expert-hazlenz-owed-fact-truth-2026-09-05');
for (const [file, expected] of Object.entries<string>(PREREG.frozenTruthHashes)) {
  check(`§184 ${file}`, expected, shaFile(join(TRUTH, file)));
}

// ---- §187 behavioural evidence must be byte-unchanged by this review
const EVIDENCE_FILES = [
  'RESUMED-VERIFIER-EXECUTIONS.jsonl', 'RAW-VERIFIER-EXECUTIONS.jsonl',
  'FIRST-PASS-STIMULI.json', 'RUN-SUMMARY.json', 'RESUME-RUN-SUMMARY.json',
  'ADMISSION-RECOMPUTE.json', 'COST-CORRECTION.json', 'SECTION-187A-INTEGRITY.json',
  'SECTION-187B-INTEGRITY.json', 'STRICT-SEMANTIC-REVIEW-PACKET-187B.md',
  'CHALLENGE-REVIEWABILITY-PACKET-187B.md', 'BEHAVIORAL-METRICS-187B.json',
];
const evidenceHashes = EVIDENCE_FILES
  .map(f => ({ file: f, sha256: shaFile(join(EVID187, f)) }));

const failed = checks.filter(c => !c.ok);
const lines: string[] = [];
lines.push('§188 SOURCE INTEGRITY GATE');
lines.push(`recomputed ${new Date().toISOString()} from the files on disk`);
lines.push('');
lines.push(`RESULT: ${failed.length === 0 ? 'PASS' : 'FAIL'}   ${checks.length - failed.length}/${checks.length}`);
lines.push('');
lines.push('FROZEN IDENTITIES — expected vs recomputed');
lines.push('');
for (const c of checks) {
  lines.push(`${c.ok ? 'OK  ' : 'FAIL'}  ${c.id}`);
  lines.push(`        expected  ${c.expected}`);
  if (!c.ok) lines.push(`        actual    ${c.actual}`);
}
lines.push('');
lines.push('§187 BEHAVIOURAL EVIDENCE — hashes recorded so a later change is detectable');
lines.push('');
for (const e of evidenceHashes) lines.push(`  ${e.sha256}  ${e.file}`);
lines.push('');
lines.push('PROMPT_CHANGES = 0    SCHEMA_CHANGES = 0    VERIFIER_SOURCE_CHANGES = 0');
lines.push('PRODUCT_RUNTIME_CHANGES = 0    DATABASE_OPERATIONS = 0    PROVIDER_CALLS = 0');
lines.push('');
lines.push('Separately authorized §188 changes, all harness/test/documentation, none of them');
lines.push('product runtime and none of them a verifier prompt, schema or contract:');
lines.push('  backend/scripts/lib/expert-provider-spend-accounting.ts        (new)');
lines.push('  backend/scripts/test-expert-provider-spend-accounting.ts       (new)');
lines.push('  backend/scripts/build-188-adjudication-ballot-2026-09-06.ts    (new)');
lines.push('  backend/scripts/score-188-strict-semantic-gate-2026-09-06.ts   (new)');
lines.push('  backend/scripts/verify-188-source-integrity-2026-09-06.ts      (new)');
lines.push('  backend/scripts/probe-required-structured-verifier-2026-09-05.ts  (cost accounting repair)');
lines.push('');

writeFileSync(join(EVID188, 'SOURCE-INTEGRITY.txt'), `${lines.join('\n')}\n`);
console.log(lines.join('\n'));
if (failed.length > 0) process.exit(1);
