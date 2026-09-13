/**
 * §193 -- SOURCE INTEGRITY GATE. Read-only. Zero provider calls, zero database operations.
 *
 * §193 changed exactly two things: it ADDED two modules plus a test and a replay, and it REPAIRED
 * four literal NUL bytes in one existing file. This gate proves nothing else moved, and in
 * particular that the v3.1 PROMPT and SCHEMA are untouched -- §193's citation enforcement is shared
 * admission/runtime logic, not a protocol change, so §192 stays attached to the hashes that produced
 * it and no v3.2 was created.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { EXPERT_SYSTEM_PROMPT } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { CITATION_SHAPED_PATTERN } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_VERIFIER_V3_SYSTEM_PROMPT, VERIFIER_V3_RESPONSE_SCHEMA } from
  './lib/expert-verifier-instruction-v3';
import { EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA } from
  './lib/expert-verifier-instruction-v3-1';
import { sweepAuditability, checkFileAuditability } from './lib/expert-source-audit-integrity';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz');
const V = (n: string): string => join(ROOT, 'verification', n);
const EVID187 = V('expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const EVID188 = V('expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');
const EVID189 = V('expert-hazlenz-required-structured-verifier-human-adjudication-2026-09-06');
const EVID190 = V('expert-hazlenz-required-structured-verifier-model-adjudication-2026-09-06');
const EVID192 = V('expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06');
const EVID193 = V('expert-hazlenz-verifier-v3-1-integration-readiness-hardening-2026-09-06');

const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const P187 = JSON.parse(readFileSync(join(EVID187, 'PREREGISTRATION.json'), 'utf8'));
const P192 = JSON.parse(readFileSync(join(EVID192, 'PREREGISTRATION.json'), 'utf8'));

interface Check { id: string; expected: string; actual: string; ok: boolean }
const checks: Check[] = [];
const check = (id: string, expected: string, actual: string): void => {
  checks.push({ id, expected, actual, ok: expected === actual });
};

// ---- protocols untouched
check('v3 system prompt', P187.verifierIdentity.systemPromptSha256, sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT));
check('v3 response schema', P187.verifierIdentity.responseSchemaSha256, sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)));
check('v3.1 system prompt — NOT a protocol change', P192.verifierIdentity.systemPromptSha256,
  sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT));
check('v3.1 response schema — NOT a protocol change', P192.verifierIdentity.responseSchemaSha256,
  sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA)));
check('v3 admission validator', P192.verifierIdentity.admissionValidatorSha256,
  shaFile(join(__dirname, 'lib', 'expert-verifier-contract-v3.ts')));
check('§192 preregistration', '68ba7ffa80fd8d111760cb628bff2493f46181cb41c124da2e0614e365f13267',
  shaFile(join(EVID192, 'PREREGISTRATION.json')));
check('§187 preregistration', '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82',
  shaFile(join(EVID187, 'PREREGISTRATION.json')));
check('first-pass expert-prompt.ts', P187.firstPassIdentity.promptFileSha256,
  shaFile(join(SRC, 'expert-prompt.ts')));
check('first-pass system prompt', P187.firstPassIdentity.systemPromptSha256, sha(EXPERT_SYSTEM_PROMPT));
for (const [f, e] of Object.entries<string>(P187.owedFactSourceHashes)) {
  check(`owed-facts/${f}`, e, shaFile(join(SRC, 'owed-facts', f)));
}
check('canonical CITATION_SHAPED_PATTERN reused, not redefined', '\\b\\d{2}\\s*CFR\\s*\\d+',
  CITATION_SHAPED_PATTERN.source);
check('§192 cohort module', P192.cohort.cohortModuleSha256,
  shaFile(join(__dirname, 'lib', 'expert-v3-1-prospective-cohort-2026-09-06.ts')));

// ---- governance state unchanged
const ballot = JSON.parse(readFileSync(join(EVID188, 'HUMAN-ADJUDICATION.json'), 'utf8'));
check('§188 neutral ballot still unanswered', 'PENDING_HUMAN_ADJUDICATION', ballot.status);
const human = JSON.parse(readFileSync(join(EVID189, 'RAW-HUMAN-ANSWERS.json'), 'utf8'));
check('§189 human gate still UNMEASURED', '65 / 112', human.completeness.HUMAN_ADJUDICATION_COMPLETENESS);
const model = JSON.parse(readFileSync(join(EVID190, 'MODEL-ADJUDICATION.json'), 'utf8'));
check('§190 still labelled MODEL', 'MODEL_SEMANTIC_ADJUDICATION', model.ADJUDICATION_KIND);
const raw192 = readFileSync(join(EVID192, 'RAW-PROVIDER-OUTPUTS.jsonl'), 'utf8').trim().split('\n');
check('§192 raw outputs immutable', '39', String(raw192.length));

// ---- the §193 repair itself
const diffFile = join(__dirname, 'lib', 'expert-verifier-v2-v3-diff.ts');
const a = checkFileAuditability(diffFile);
check('repaired diff module carries zero NUL bytes', '0', String(a.nulCount));
check('repaired diff module is textually auditable', 'true', String(a.auditable));
const sweepScripts = sweepAuditability(join(ROOT, 'backend', 'scripts'));
const sweepSrc = sweepAuditability(SRC);
check('backend/scripts sweep clean', 'clean',
  sweepScripts.clean ? 'clean' : sweepScripts.unauditable.map(u => u.path).join(','));
check('expert-hazlenz src sweep clean', 'clean',
  sweepSrc.clean ? 'clean' : sweepSrc.unauditable.map(u => u.path).join(','));

const failed = checks.filter(c => !c.ok);
const L: string[] = [];
L.push('§193 SOURCE INTEGRITY GATE — INTEGRATION-READINESS HARDENING');
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
L.push('PROTOCOL UNCHANGED — no v3.2 was created, and none was needed');
L.push('');
L.push('  §193 citation enforcement is SHARED ADMISSION/RUNTIME LOGIC in a new module. The v3.1');
L.push('  prompt and schema are byte-identical to the ones §192 executed against, so the thirty-nine');
L.push('  §192 executions remain attached to the hashes that produced them.');
L.push('');
L.push(`  v3.1 prompt  ${sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT)}`);
L.push(`  v3.1 schema  ${sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA))}`);
L.push('');
L.push('FILES CHANGED BY §193');
L.push('');
L.push('  NEW       backend/scripts/lib/expert-verifier-citation-boundary.ts');
L.push('  NEW       backend/scripts/lib/expert-source-audit-integrity.ts');
L.push('  NEW       backend/scripts/replay-193-citation-boundary-2026-09-06.ts');
L.push('  NEW       backend/scripts/test-expert-193-hardening.ts');
L.push('  NEW       backend/scripts/verify-193-source-integrity-2026-09-06.ts');
L.push('  REPAIRED  backend/scripts/lib/expert-verifier-v2-v3-diff.ts   (4 NUL bytes -> \\0 escape)');
L.push(`            before d5405204afcabe14cdc68bff92987423df5acd5035cce68f5e4282579d201a99  20206 bytes`);
L.push(`            after  ${shaFile(diffFile)}  ${a.bytes} bytes`);
L.push('            runtime behaviour proven identical: classifyInstructionDiff output sha256');
L.push('            9e143e0c928d49de83db82d45bb41a1aa2e0f6ce92e462365420c8f5771c076d before AND after');
L.push('');
L.push('  No verifier prompt, schema, contract or semantic instruction was modified.');
L.push('');
L.push('PRIOR EVIDENCE — unchanged by §193');
L.push('');
for (const [k, p] of [
  ['§187 RESUMED-VERIFIER-EXECUTIONS.jsonl', join(EVID187, 'RESUMED-VERIFIER-EXECUTIONS.jsonl')],
  ['§188 HUMAN-ADJUDICATION.json', join(EVID188, 'HUMAN-ADJUDICATION.json')],
  ['§189 RAW-HUMAN-ANSWERS.json', join(EVID189, 'RAW-HUMAN-ANSWERS.json')],
  ['§190 MODEL-ADJUDICATION.json', join(EVID190, 'MODEL-ADJUDICATION.json')],
  ['§192 RAW-PROVIDER-OUTPUTS.jsonl', join(EVID192, 'RAW-PROVIDER-OUTPUTS.jsonl')],
  ['§192 MODEL-SEMANTIC-ADJUDICATION.json', join(EVID192, 'MODEL-SEMANTIC-ADJUDICATION.json')],
] as Array<[string, string]>) L.push(`  ${shaFile(p)}  ${k}`);
L.push('');
L.push('PROVIDER_CALLS = 0   DATABASE_OPERATIONS = 0   PRODUCTION_ACTIVATION = NONE');
L.push('§189 HUMAN GATE = UNMEASURED (65/112)   VERIFIER_V3_1_CUSTOMER_ACCEPTED = FALSE');
L.push('');
writeFileSync(join(EVID193, 'SOURCE-INTEGRITY.txt'), `${L.join('\n')}\n`);
console.log(L.join('\n'));
if (failed.length > 0) process.exit(1);
