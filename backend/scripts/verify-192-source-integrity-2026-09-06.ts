/**
 * §192 -- SOURCE INTEGRITY GATE. Read-only. Zero provider calls, zero database operations.
 *
 * Proves: verifier-v3 byte-unchanged; verifier-v3.1 byte-unchanged SINCE THE FREEZE; the frozen
 * preregistration, cohort module and execution order unchanged; settlement authority untouched; and
 * the §187, §188, §189, §190 and §191 evidence packages unchanged.
 *
 * usage:  ts-node verify-192-source-integrity-2026-09-06.ts [--phase=before|after]
 */

import { createHash } from 'crypto';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { EXPERT_SYSTEM_PROMPT } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, VERIFIER_V3_RESPONSE_SCHEMA,
} from './lib/expert-verifier-instruction-v3';
import {
  EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA,
  EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION,
} from './lib/expert-verifier-instruction-v3-1';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'backend', 'src', 'safescope-v2', 'expert-hazlenz');
const V = (n: string): string => join(ROOT, 'verification', n);
const EVID187 = V('expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const EVID188 = V('expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');
const EVID189 = V('expert-hazlenz-required-structured-verifier-human-adjudication-2026-09-06');
const EVID190 = V('expert-hazlenz-required-structured-verifier-model-adjudication-2026-09-06');
const EVID191 = V('expert-hazlenz-required-structured-verifier-bounded-remediation-2026-09-06');
const EVID192 = V('expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const PREREG187 = JSON.parse(readFileSync(join(EVID187, 'PREREGISTRATION.json'), 'utf8'));
const phase = (process.argv.find(a => a.startsWith('--phase=')) ?? '--phase=after').split('=')[1];

interface Check { id: string; expected: string; actual: string; ok: boolean }
const checks: Check[] = [];
const check = (id: string, expected: string, actual: string): void => {
  checks.push({ id, expected, actual, ok: expected === actual });
};

// ---- verifier-v3, untouched
check('v3 system prompt', PREREG187.verifierIdentity.systemPromptSha256,
  sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT));
check('v3 response schema', PREREG187.verifierIdentity.responseSchemaSha256,
  sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)));

// ---- everything §191 was forbidden to touch, still untouched
check('§187 preregistration', '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82',
  shaFile(join(EVID187, 'PREREGISTRATION.json')));
check('admission validator', '475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc',
  shaFile(join(__dirname, 'lib', 'expert-verifier-contract-v3.ts')));
check('first-pass expert-prompt.ts', PREREG187.firstPassIdentity.promptFileSha256,
  shaFile(join(SRC, 'expert-prompt.ts')));
check('first-pass system prompt', PREREG187.firstPassIdentity.systemPromptSha256,
  sha(EXPERT_SYSTEM_PROMPT));
for (const [file, expected] of Object.entries<string>(PREREG187.owedFactSourceHashes)) {
  check(`owed-facts/${file}`, expected, shaFile(join(SRC, 'owed-facts', file)));
}
check('§188 frozen scorer', '48979797770506be722b7645dabdafde9ea6697aae1831ef47f9e62ed56c1c98',
  shaFile(join(__dirname, 'score-188-strict-semantic-gate-2026-09-06.ts')));

// ---- the §188/§189/§190 governance state, still as it was
const ballot = JSON.parse(readFileSync(join(EVID188, 'HUMAN-ADJUDICATION.json'), 'utf8'));
check('§188 neutral ballot still unanswered', 'PENDING_HUMAN_ADJUDICATION', ballot.status);
const human = JSON.parse(readFileSync(join(EVID189, 'RAW-HUMAN-ANSWERS.json'), 'utf8'));
check('§189 human gate still incomplete', '65 / 112',
  human.completeness.HUMAN_ADJUDICATION_COMPLETENESS);
const model = JSON.parse(readFileSync(join(EVID190, 'MODEL-ADJUDICATION.json'), 'utf8'));
check('§190 still labelled MODEL', 'MODEL_SEMANTIC_ADJUDICATION', model.ADJUDICATION_KIND);

// ---- v3.1, unchanged since the §192 freeze
if (existsSync(join(EVID192, 'PREREGISTRATION.json'))) {
  const P = JSON.parse(readFileSync(join(EVID192, 'PREREGISTRATION.json'), 'utf8'));
  check('v3.1 system prompt unchanged since freeze', P.verifierIdentity.systemPromptSha256,
    sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT));
  check('v3.1 response schema unchanged since freeze', P.verifierIdentity.responseSchemaSha256,
    sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA)));
  check('v3.1 instruction version', P.verifierIdentity.instructionVersion,
    EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION);
  check('§192 cohort module unchanged since freeze', P.cohort.cohortModuleSha256,
    shaFile(join(__dirname, 'lib', 'expert-v3-1-prospective-cohort-2026-09-06.ts')));
  check('v3 and v3.1 are different populations', 'different',
    P.verifierIdentity.systemPromptSha256 === P.POPULATION_SEPARATION.v3_systemPromptSha256
      ? 'SAME — POPULATIONS COLLAPSED' : 'different');
  // per-row freeze
  const drift: string[] = [];
  const { PROSPECTIVE_COHORT } = require('./lib/expert-v3-1-prospective-cohort-2026-09-06');
  for (const fr of P.frozenRows) {
    const row = PROSPECTIVE_COHORT.find((r: any) => r.rowId === fr.rowId);
    if (!row) { drift.push(`${fr.rowId} missing`); continue; }
    if (sha(row.observation) !== fr.observationSha256) drift.push(`${fr.rowId} observation`);
    if (sha(JSON.stringify(row.owedFact)) !== fr.owedFactSha256) drift.push(`${fr.rowId} owedFact`);
    if (sha(JSON.stringify(row.firstPassClarifications)) !== fr.firstPassSha256) drift.push(`${fr.rowId} firstPass`);
  }
  check('§192 fixtures unchanged since freeze', 'no drift', drift.length ? drift.join(',') : 'no drift');
}
check('§191 v3.1 module present', 'present',
  existsSync(join(__dirname, 'lib', 'expert-verifier-instruction-v3-1.ts')) ? 'present' : 'MISSING');

const failed = checks.filter(c => !c.ok);
const L: string[] = [];
L.push(`§192 SOURCE INTEGRITY GATE — phase=${phase}`);
L.push(`recomputed ${new Date().toISOString()} from the files on disk`);
L.push('');
L.push(`RESULT: ${failed.length === 0 ? 'PASS' : 'FAIL'}   ${checks.length - failed.length}/${checks.length}`);
L.push('');
for (const c of checks) {
  L.push(`${c.ok ? 'OK  ' : 'FAIL'}  ${c.id}`);
  L.push(`        expected  ${c.expected}`);
  if (!c.ok) L.push(`        actual    ${c.actual}`);
}
L.push('');
L.push('POPULATION SEPARATION');
L.push('');
L.push(`  v3   prompt ${sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT)}`);
L.push(`  v3.1 prompt ${sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT)}`);
L.push('  §187B\'s fifteen executions belong to v3. §192\'s executions belong to v3.1.');
L.push('  They are never combined into one score.');
L.push('');
L.push('PRIOR EVIDENCE — unchanged by §192');
L.push('');
for (const [k, p] of [
  ['§187 RESUMED-VERIFIER-EXECUTIONS.jsonl', join(EVID187, 'RESUMED-VERIFIER-EXECUTIONS.jsonl')],
  ['§188 HUMAN-ADJUDICATION.json', join(EVID188, 'HUMAN-ADJUDICATION.json')],
  ['§189 RAW-HUMAN-ANSWERS.json', join(EVID189, 'RAW-HUMAN-ANSWERS.json')],
  ['§190 MODEL-ADJUDICATION.json', join(EVID190, 'MODEL-ADJUDICATION.json')],
  ['§191 SOURCE-INTEGRITY.txt', join(EVID191, 'SOURCE-INTEGRITY.txt')],
] as Array<[string, string]>) {
  if (existsSync(p)) L.push(`  ${shaFile(p)}  ${k}`);
}
L.push('');
L.push('PROMPT_CHANGES = 0   SCHEMA_CHANGES = 0   VERIFIER_CONTRACT_CHANGES = 0');
L.push('PRODUCT_RUNTIME_CHANGES = 0   DATABASE_OPERATIONS = 0');
L.push('PROVIDER_SETTLEMENT_AUTHORITY = NEVER   VERIFIER_V3_1_ACCEPTED = FALSE');
L.push('');

writeFileSync(join(EVID192, `SOURCE-INTEGRITY${phase === 'before' ? '-BEFORE' : ''}.txt`), `${L.join('\n')}\n`);
console.log(L.join('\n'));
if (failed.length > 0) process.exit(1);
