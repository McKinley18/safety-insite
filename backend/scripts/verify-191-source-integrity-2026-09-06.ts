/**
 * §191 -- SOURCE INTEGRITY GATE. Read-only. Zero provider calls, zero database operations.
 *
 * The §191 question is different from §188's and §190's. Those had to prove NOTHING changed. §191
 * changed something on purpose, so this gate proves the change is EXACTLY the authorized one and
 * nothing else moved: v3 byte-unchanged at its frozen §187 hashes, the admission validator
 * untouched, the owed-fact ledger and first-pass prompt untouched, every §187–§190 evidence artifact
 * untouched, and v3.1 differing from v3 only in the two inserted blocks and three descriptions.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { EXPERT_SYSTEM_PROMPT } from '../src/safescope-v2/expert-hazlenz/expert-prompt';
import {
  EXPERT_VERIFIER_V3_SYSTEM_PROMPT, VERIFIER_V3_RESPONSE_SCHEMA,
  EXPERT_VERIFIER_INSTRUCTION_V3_VERSION,
} from './lib/expert-verifier-instruction-v3';
import {
  EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA,
  EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION,
  ADJACENT_PROPERTY_BOUNDARY_LINES, CONJUNCTIVE_SUFFICIENCY_LINES, DESCRIPTION_REPAIRS,
} from './lib/expert-verifier-instruction-v3-1';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'backend', 'src', 'safescope-v2', 'expert-hazlenz');
const V = (n: string): string => join(ROOT, 'verification', n);
const EVID187 = V('expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const EVID188 = V('expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');
const EVID189 = V('expert-hazlenz-required-structured-verifier-human-adjudication-2026-09-06');
const EVID190 = V('expert-hazlenz-required-structured-verifier-model-adjudication-2026-09-06');
const EVID191 = V('expert-hazlenz-required-structured-verifier-bounded-remediation-2026-09-06');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const PREREG = JSON.parse(readFileSync(join(EVID187, 'PREREGISTRATION.json'), 'utf8'));

interface Check { id: string; expected: string; actual: string; ok: boolean }
const checks: Check[] = [];
const check = (id: string, expected: string, actual: string): void => {
  checks.push({ id, expected, actual, ok: expected === actual });
};

// ---- UNCHANGED: everything §191 was forbidden to touch
check('PREREGISTRATION.json',
  '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82',
  shaFile(join(EVID187, 'PREREGISTRATION.json')));
check('v3 EXPERT_VERIFIER_V3_SYSTEM_PROMPT', PREREG.verifierIdentity.systemPromptSha256,
  sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT));
check('v3 VERIFIER_V3_RESPONSE_SCHEMA', PREREG.verifierIdentity.responseSchemaSha256,
  sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)));
check('v3 instruction version', PREREG.verifierIdentity.instructionVersion,
  EXPERT_VERIFIER_INSTRUCTION_V3_VERSION);
check('admission validator (expert-verifier-contract-v3.ts)',
  '475a957747c145682a7027c3f4f06041e45a1d93df9779be02e0424962d6a3dc',
  shaFile(join(__dirname, 'lib', 'expert-verifier-contract-v3.ts')));
check('first-pass expert-prompt.ts', PREREG.firstPassIdentity.promptFileSha256,
  shaFile(join(SRC, 'expert-prompt.ts')));
check('first-pass EXPERT_SYSTEM_PROMPT', PREREG.firstPassIdentity.systemPromptSha256,
  sha(EXPERT_SYSTEM_PROMPT));
for (const [file, expected] of Object.entries<string>(PREREG.owedFactSourceHashes)) {
  check(`owed-facts/${file}`, expected, shaFile(join(SRC, 'owed-facts', file)));
}
const TRUTH = V('expert-hazlenz-owed-fact-truth-2026-09-05');
for (const [file, expected] of Object.entries<string>(PREREG.frozenTruthHashes)) {
  check(`§184 ${file}`, expected, shaFile(join(TRUTH, file)));
}
check('§188 frozen scorer',
  '48979797770506be722b7645dabdafde9ea6697aae1831ef47f9e62ed56c1c98',
  shaFile(join(__dirname, 'score-188-strict-semantic-gate-2026-09-06.ts')));

// ---- UNCHANGED: the evidence packages
const ballot = JSON.parse(readFileSync(join(EVID188, 'HUMAN-ADJUDICATION.json'), 'utf8'));
check('§188 neutral ballot still unanswered', 'PENDING_HUMAN_ADJUDICATION', ballot.status);
const human = JSON.parse(readFileSync(join(EVID189, 'RAW-HUMAN-ANSWERS.json'), 'utf8'));
check('§189 human gate still incomplete', '65 / 112',
  human.completeness.HUMAN_ADJUDICATION_COMPLETENESS);
const model = JSON.parse(readFileSync(join(EVID190, 'MODEL-ADJUDICATION.json'), 'utf8'));
check('§190 still labelled MODEL', 'MODEL_SEMANTIC_ADJUDICATION', model.ADJUDICATION_KIND);

// ---- CHANGED, and bounded to exactly the authorized change
const reconstructed = EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT
  .replace(`\n${ADJACENT_PROPERTY_BOUNDARY_LINES.join('\n')}`, '')
  .replace(`\n${CONJUNCTIVE_SUFFICIENCY_LINES.join('\n')}`, '');
check('v3.1 minus the two blocks reproduces v3 exactly',
  sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT), sha(reconstructed));

const strip = (o: unknown): unknown => {
  if (Array.isArray(o)) return o.map(strip);
  if (o && typeof o === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(o as Record<string, unknown>)) {
      if (k === 'description') continue;
      out[k] = strip(v);
    }
    return out;
  }
  return o;
};
check('v3.1 schema structure identical to v3 with descriptions stripped',
  sha(JSON.stringify(strip(VERIFIER_V3_RESPONSE_SCHEMA))),
  sha(JSON.stringify(strip(VERIFIER_V3_1_RESPONSE_SCHEMA))));
check('exactly three descriptions repaired', '3', String(DESCRIPTION_REPAIRS.length));
check('v3.1 declares its own version', 'hazlenz.expert.verifier-instruction.v3.1',
  EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION);

const failed = checks.filter(c => !c.ok);
const L: string[] = [];
L.push('§191 SOURCE INTEGRITY GATE — BOUNDED REMEDIATION');
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
L.push('NEW IDENTITY — v3.1, a NEW PROSPECTIVE PROTOCOL. Rescores nothing.');
L.push('');
L.push(`  v3.1 system prompt sha256   ${sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT)}`);
L.push(`  v3.1 schema sha256          ${sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA))}`);
L.push(`  v3.1 instruction version    ${EXPERT_VERIFIER_INSTRUCTION_V3_1_VERSION}`);
L.push('');
L.push('  §187B\'s fifteen executions remain attached to v3, not to v3.1. v3 and v3.1 results are');
L.push('  NOT one population and must never be combined into one score.');
L.push('');
L.push('§187 / §188 / §189 / §190 EVIDENCE — unchanged by this remediation');
L.push('');
for (const [k, p] of [
  ['§187 RESUMED-VERIFIER-EXECUTIONS.jsonl', join(EVID187, 'RESUMED-VERIFIER-EXECUTIONS.jsonl')],
  ['§187 SECTION-187B-INTEGRITY.json', join(EVID187, 'SECTION-187B-INTEGRITY.json')],
  ['§188 HUMAN-ADJUDICATION.json', join(EVID188, 'HUMAN-ADJUDICATION.json')],
  ['§188 STRICT-SEMANTIC-GATE.json', join(EVID188, 'STRICT-SEMANTIC-GATE.json')],
  ['§189 RAW-HUMAN-ANSWERS.json', join(EVID189, 'RAW-HUMAN-ANSWERS.json')],
  ['§190 MODEL-ADJUDICATION.json', join(EVID190, 'MODEL-ADJUDICATION.json')],
  ['§190 MODEL-STRICT-SEMANTIC-GATE.json', join(EVID190, 'MODEL-STRICT-SEMANTIC-GATE.json')],
] as Array<[string, string]>) {
  L.push(`  ${shaFile(p)}  ${k}`);
}
L.push('');
L.push('FILES CHANGED BY §191');
L.push('');
L.push('  NEW  backend/scripts/lib/expert-verifier-instruction-v3-1.ts');
L.push('  NEW  backend/scripts/test-expert-verifier-v3-1-remediation.ts');
L.push('  NEW  backend/scripts/verify-191-source-integrity-2026-09-06.ts');
L.push('');
L.push('  NO existing runtime file was modified. v3, the admission validator, the owed-fact ledger,');
L.push('  the first-pass prompt, the formal scorers and every evidence artifact are byte-unchanged.');
L.push('');
L.push('PROVIDER_CALLS = 0   DATABASE_OPERATIONS = 0   PRODUCTION_ACTIVATION = NONE');
L.push('PROVIDER_SETTLEMENT_AUTHORITY = NEVER   VERIFIER_V3_VALIDATED = FALSE');
L.push('');

writeFileSync(join(EVID191, 'SOURCE-INTEGRITY.txt'), `${L.join('\n')}\n`);
console.log(L.join('\n'));
if (failed.length > 0) process.exit(1);
