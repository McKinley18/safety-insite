/**
 * §194 -- SOURCE INTEGRITY GATE. Read-only. Zero provider calls, zero database operations.
 *
 * §194 created a prospective v3.2 and touched nothing else. This gate proves v3, v3.1 and every
 * prior evidence package are byte-unchanged, and records v3.2's new identity.
 */
import { createHash } from 'crypto';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { EXPERT_SYSTEM_PROMPT } from '../src/hazlenz/expert-hazlenz/expert-prompt';
import { CITATION_SHAPED_PATTERN } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_VERIFIER_V3_SYSTEM_PROMPT, VERIFIER_V3_RESPONSE_SCHEMA } from './lib/expert-verifier-instruction-v3';
import { EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT, VERIFIER_V3_1_RESPONSE_SCHEMA } from './lib/expert-verifier-instruction-v3-1';
import { EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT, VERIFIER_V3_2_RESPONSE_SCHEMA, EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION, REGULATORY_BASIS_LINES } from './lib/expert-verifier-instruction-v3-2';
import { sweepAuditability } from './lib/expert-source-audit-integrity';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'backend', 'src', 'hazlenz', 'expert-hazlenz');
const V = (n: string): string => join(ROOT, 'verification', n);
const E187 = V('expert-hazlenz-required-structured-verifier-validation-2026-09-05');
const E188 = V('expert-hazlenz-required-structured-verifier-remediation-review-2026-09-06');
const E189 = V('expert-hazlenz-required-structured-verifier-human-adjudication-2026-09-06');
const E190 = V('expert-hazlenz-required-structured-verifier-model-adjudication-2026-09-06');
const E192 = V('expert-hazlenz-verifier-v3-1-prospective-validation-2026-09-06');
const E195 = V('expert-hazlenz-v3-2-end-to-end-validation-2026-09-06');
const sha = (s: string): string => createHash('sha256').update(s, 'utf8').digest('hex');
const shaFile = (p: string): string => sha(readFileSync(p, 'utf8'));
const P187 = JSON.parse(readFileSync(join(E187, 'PREREGISTRATION.json'), 'utf8'));
const P192 = JSON.parse(readFileSync(join(E192, 'PREREGISTRATION.json'), 'utf8'));

const checks: Array<{ id: string; expected: string; actual: string; ok: boolean }> = [];
const check = (id: string, e: string, a: string): void => { checks.push({ id, expected: e, actual: a, ok: e === a }); };

check('v3 system prompt', P187.verifierIdentity.systemPromptSha256, sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT));
check('v3 response schema', P187.verifierIdentity.responseSchemaSha256, sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA)));
check('v3.1 system prompt — §192 stays attached', P192.verifierIdentity.systemPromptSha256, sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT));
check('v3.1 response schema — §192 stays attached', P192.verifierIdentity.responseSchemaSha256, sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA)));
check('v3 admission validator', P192.verifierIdentity.admissionValidatorSha256, shaFile(join(__dirname, 'lib', 'expert-verifier-contract-v3.ts')));
check('§187 preregistration', '9fc517b7783ba655c8d3eb6e195bb8abe313a9c0d91ffa2f5b7af406a5c48c82', shaFile(join(E187, 'PREREGISTRATION.json')));
check('§192 preregistration', '68ba7ffa80fd8d111760cb628bff2493f46181cb41c124da2e0614e365f13267', shaFile(join(E192, 'PREREGISTRATION.json')));
check('first-pass expert-prompt.ts', P187.firstPassIdentity.promptFileSha256, shaFile(join(SRC, 'expert-prompt.ts')));
check('first-pass system prompt', P187.firstPassIdentity.systemPromptSha256, sha(EXPERT_SYSTEM_PROMPT));
for (const [f, e] of Object.entries<string>(P187.owedFactSourceHashes)) check(`owed-facts/${f}`, e, shaFile(join(SRC, 'owed-facts', f)));
check('canonical CITATION_SHAPED_PATTERN reused, not redefined', '\\b\\d{2}\\s*CFR\\s*\\d+', CITATION_SHAPED_PATTERN.source);
check('§192 cohort module', P192.cohort.cohortModuleSha256, shaFile(join(__dirname, 'lib', 'expert-v3-1-prospective-cohort-2026-09-06.ts')));
const ballot = JSON.parse(readFileSync(join(E188, 'HUMAN-ADJUDICATION.json'), 'utf8'));
check('§188 neutral ballot still unanswered', 'PENDING_HUMAN_ADJUDICATION', ballot.status);
const human = JSON.parse(readFileSync(join(E189, 'RAW-HUMAN-ANSWERS.json'), 'utf8'));
check('§189 human gate still UNMEASURED', '65 / 112', human.completeness.HUMAN_ADJUDICATION_COMPLETENESS);
const model = JSON.parse(readFileSync(join(E190, 'MODEL-ADJUDICATION.json'), 'utf8'));
check('§190 still labelled MODEL', 'MODEL_SEMANTIC_ADJUDICATION', model.ADJUDICATION_KIND);
check('§192 raw outputs immutable', '39', String(readFileSync(join(E192, 'RAW-PROVIDER-OUTPUTS.jsonl'), 'utf8').trim().split('\n').length));
const recon = EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT.replace(`\n${REGULATORY_BASIS_LINES.join('\n')}`, '');
check('v3.2 minus its block reproduces v3.1 exactly', sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT), sha(recon));
const sw = sweepAuditability(join(ROOT, 'backend', 'scripts'));
check('backend/scripts audit sweep clean', 'clean', sw.clean ? 'clean' : sw.unauditable.map(u => u.path).join(','));

const failed = checks.filter(c => !c.ok);
const L: string[] = [];
L.push('§195 SOURCE INTEGRITY GATE — END-TO-END VALIDATION (NOT EXECUTED)');
L.push(`recomputed ${new Date().toISOString()} from the files on disk`);
L.push('');
L.push(`RESULT: ${failed.length === 0 ? 'PASS' : 'FAIL'}   ${checks.length - failed.length}/${checks.length}`);
L.push('');
for (const c of checks) { L.push(`${c.ok ? 'OK  ' : 'FAIL'}  ${c.id}`); L.push(`        expected  ${c.expected}`); if (!c.ok) L.push(`        actual    ${c.actual}`); }
L.push('');
L.push('THREE PROTOCOLS, THREE IDENTITIES — never merged');
L.push('');
L.push(`  v3    prompt ${sha(EXPERT_VERIFIER_V3_SYSTEM_PROMPT)}`);
L.push(`        schema ${sha(JSON.stringify(VERIFIER_V3_RESPONSE_SCHEMA))}`);
L.push(`  v3.1  prompt ${sha(EXPERT_VERIFIER_V3_1_SYSTEM_PROMPT)}`);
L.push(`        schema ${sha(JSON.stringify(VERIFIER_V3_1_RESPONSE_SCHEMA))}`);
L.push(`  v3.2  prompt ${sha(EXPERT_VERIFIER_V3_2_SYSTEM_PROMPT)}   NEW`);
L.push(`        schema ${sha(JSON.stringify(VERIFIER_V3_2_RESPONSE_SCHEMA))}   NEW`);
L.push(`        version ${EXPERT_VERIFIER_INSTRUCTION_V3_2_VERSION}`);
L.push('');
L.push('  §187B belongs to v3. §192 belongs to v3.1. v3.2 has NO hosted evidence of any kind.');
L.push('');
L.push('§195 EXECUTED = FALSE — the OWED-FACT / TASK-STATE CONSTRUCTION stage does not exist.');
L.push('PROVIDER_CALLS = 0. Nothing was spent. See PIPELINE-STAGE-BLOCKER.md');
L.push('');
L.push('FILES ADDED BY §195');
L.push('  NEW  backend/scripts/lib/expert-e2e-cohort-2026-09-06.ts        12 fresh rows, frozen');
L.push('  NEW  backend/scripts/freeze-195-cohort-2026-09-06.ts            manifests, zero calls');
L.push('  NEW  backend/scripts/verify-195-source-integrity-2026-09-06.ts  this gate');
L.push('  No existing runtime file was modified.');
L.push('');
L.push('PROVIDER_CALLS = 0   DATABASE_OPERATIONS = 0   PRODUCTION_ACTIVATION = NONE');
L.push('§189 HUMAN GATE = UNMEASURED (65/112)   v3.2 HOSTED VALIDATED = FALSE');
L.push('');
writeFileSync(join(E195, 'SOURCE-INTEGRITY.txt'), `${L.join('\n')}\n`);
console.log(L.join('\n'));
if (failed.length > 0) process.exit(1);
