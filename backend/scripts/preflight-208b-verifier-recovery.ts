/**
 * §208B -- OFFLINE PREFLIGHT. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * Constructs all 24 verifier requests through the SAME assembly path the executor uses and proves
 * each one before anything is transmitted. The §208B authorization is explicit: "Do not use
 * provider calls to debug request assembly." Everything checkable offline is checked offline.
 *
 * The load-bearing proof is the last one: THE ALL-EMPTY-CANDIDATE-BLOCK DEFECT CANNOT RECUR. It is
 * proved three ways — the assembled candidate count per request, the identity of the candidate
 * block as it renders into the transmitted prompt, and two guards inside the assembly path that
 * throw rather than transmit a "(none raised)" block on a case that produced candidates.
 */

import { writeFileSync } from 'fs';
import { join } from 'path';

import {
  AUTHORIZATION_REFERENCE, RECOVERY_208B_VERSION, SECTION_208_VERIFIER_SCHEMA_SHA256,
  assembleVerifierRequests, extractCandidateBlock, loadFirstPass, preRunIdentityChecks,
  readCandidates, section208Dir,
} from './lib/expert-208b-verifier-recovery';

const ROOT = join(__dirname, '..', '..');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-verifier-recovery-208b-2026-09-08');

console.log('================ §208B OFFLINE PREFLIGHT (zero provider calls)');
console.log(`  recovery version : ${RECOVERY_208B_VERSION}`);
console.log(`  authorization    : ${AUTHORIZATION_REFERENCE}`);
console.log('');

const checks = preRunIdentityChecks(ROOT);
console.log('  ---- pre-run identity checks');
for (const c of checks) {
  console.log(`  ${c.held ? 'PASS' : 'FAIL'}  ${c.id.padEnd(5)} ${c.statement}`);
  if (!c.held) console.log(`        expected=${c.expected}  actual=${c.actual}`);
}

const requests = assembleVerifierRequests(ROOT);
const firstPass = loadFirstPass(ROOT);

console.log('');
console.log('  ---- the 24 assembled verifier requests');
console.log('  #   case    factKey(28)                    cand clar  candBlock(12)  userPrompt(12)  bytes');
let emptyBlocks = 0;
for (const r of requests) {
  const block = extractCandidateBlock(r.userPrompt);
  if (block === '(none raised)') emptyBlocks += 1;
  console.log(`  ${String(r.ordinal).padStart(2)}  ${r.caseId}  `
    + `${r.factKey.slice(0, 28).padEnd(28)} ${String(r.candidateCount).padStart(4)} `
    + `${String(r.clarificationCount).padStart(4)}  ${r.candidateBlockIdentity.slice(0, 12)}  `
    + `${r.userPromptIdentity.slice(0, 12)}  ${String(Buffer.byteLength(r.userPrompt, 'utf8')).padStart(5)}`);
}

// ---------------------------------------------------------------- the proofs

const proofs: { id: string; held: boolean; statement: string; measured: string }[] = [];
const prove = (id: string, held: boolean, statement: string, measured: string): void => {
  proofs.push({ id, held, statement, measured });
};

prove('P1', requests.length === 24,
  'exactly 24 verifier requests, one per admitted OwedFact', `${requests.length}`);
prove('P2', new Set(requests.map(r => r.caseId)).size === 20,
  'the 24 facts come from the 20 cases that admitted one',
  `${new Set(requests.map(r => r.caseId)).size} cases`);
prove('P3', new Set(requests.map(r => r.factKey)).size === requests.length,
  'every owed-fact identity is distinct', `${new Set(requests.map(r => r.factKey)).size} distinct`);
prove('P4', requests.every(r => r.owedFactIdentity.length === 64),
  'every request records its exact frozen OwedFact identity', 'all 64-hex');
prove('P5', requests.every(r => r.candidateSetIdentity.length === 64),
  'every request records its exact candidate-set identity', 'all 64-hex');

const totalCandidates = firstPass.reduce((n, f) => n + readCandidates(f.parsed).length, 0);
const assembledCandidates = requests.reduce((n, r) => n + r.candidateCount, 0);
prove('P6', totalCandidates === 49,
  'all 49 persisted hazard-candidate records are readable', `${totalCandidates}`);

// Per CASE (not per request): a case with N facts assembles the same block N times, so the
// per-request sum double-counts multi-fact cases. Compare per case instead.
const perCaseAssembled = new Map<string, number>();
for (const r of requests) perCaseAssembled.set(r.caseId, r.candidateCount);
const perCasePersisted = new Map<string, number>();
for (const f of firstPass) perCasePersisted.set(f.caseId, readCandidates(f.parsed).length);
const mismatched = [...perCaseAssembled.entries()]
  .filter(([caseId, n]) => perCasePersisted.get(caseId) !== n)
  .map(([caseId]) => caseId);
prove('P7', mismatched.length === 0,
  'every request carries EXACTLY the candidate records its case persisted — none added, none dropped',
  mismatched.length === 0 ? 'all match' : `mismatched: ${mismatched.join(', ')}`);

prove('P8', emptyBlocks === 0,
  'NO assembled request renders "(none raised)" — the §208 defect-3 signature cannot recur',
  `${emptyBlocks} empty blocks across ${requests.length} requests`);
prove('P9', requests.every(r => r.candidateCount > 0),
  'every one of the 24 requests carries at least one candidate',
  `min ${Math.min(...requests.map(r => r.candidateCount))}, max ${Math.max(...requests.map(r => r.candidateCount))}`);
prove('P10', new Set(requests.map(r => r.schemaIdentity)).size === 1
  && requests[0].schemaIdentity === SECTION_208_VERIFIER_SCHEMA_SHA256,
  'the verifier schema is identical to the one §208 transmitted',
  requests[0].schemaIdentity.slice(0, 16));
prove('P11', new Set(requests.map(r => r.systemPromptIdentity)).size === 1,
  'one verifier system prompt across all 24 requests, unchanged',
  requests[0].systemPromptIdentity.slice(0, 16));
prove('P12', new Set(requests.map(r => r.wrapperIdentity)).size === 1
  && !JSON.stringify(requests[0].toolBlock).includes('"strict"'),
  'one provider wrapper identity, carrying NO strict flag (the §199 envelope)',
  requests[0].wrapperIdentity.slice(0, 16));
prove('P13', new Set(requests.map(r => r.userPromptIdentity)).size === requests.length,
  'every user prompt is distinct — no request was assembled twice',
  `${new Set(requests.map(r => r.userPromptIdentity)).size} distinct`);
prove('P14', requests.every(r => r.firstPassRawIdentity.length === 64),
  'every request records the identity of the persisted first-pass response it reuses',
  'all 64-hex');
prove('P15', requests.filter(r => r.governedSourceIds.length > 0).length === 1
  && requests.find(r => r.governedSourceIds.length > 0)?.caseId === 'AC-22',
  'governed evidence reaches the verifier only on AC-22, the one governed case with an admitted fact',
  requests.filter(r => r.governedSourceIds.length > 0).map(r => r.caseId).join(',') || 'none');

console.log('');
console.log('  ---- proofs');
for (const p of proofs) {
  console.log(`  ${p.held ? 'PASS' : 'FAIL'}  ${p.id.padEnd(4)} ${p.statement}`);
  console.log(`        measured: ${p.measured}`);
}

const failures = [...checks.filter(c => !c.held), ...proofs.filter(p => !p.held)].length;

const record = {
  artifact: 'SECTION_208B_OFFLINE_PREFLIGHT',
  recoveryVersion: RECOVERY_208B_VERSION,
  authorizationReference: AUTHORIZATION_REFERENCE,
  providerCalls: 0,
  databaseOperations: 0,
  section208EvidenceDir: section208Dir(ROOT),
  identityChecks: checks,
  proofs,
  requests: requests.map(r => ({
    ordinal: r.ordinal,
    caseId: r.caseId,
    declarationId: r.declarationId,
    factKey: r.factKey,
    analysisId: r.analysisId,
    firstPassRawIdentity: r.firstPassRawIdentity,
    firstPassParsedIdentity: r.firstPassParsedIdentity,
    projectionIdentity: r.projectionIdentity,
    owedFactIdentity: r.owedFactIdentity,
    candidateCount: r.candidateCount,
    candidateSetIdentity: r.candidateSetIdentity,
    candidateBlockIdentity: r.candidateBlockIdentity,
    clarificationCount: r.clarificationCount,
    systemPromptIdentity: r.systemPromptIdentity,
    userPromptIdentity: r.userPromptIdentity,
    userPromptBytes: Buffer.byteLength(r.userPrompt, 'utf8'),
    schemaIdentity: r.schemaIdentity,
    wrapperIdentity: r.wrapperIdentity,
    governedSourceIds: r.governedSourceIds,
  })),
  generatedAt: new Date().toISOString(),
};

require('fs').mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'PREFLIGHT-208B.json'), `${JSON.stringify(record, null, 2)}\n`);

console.log('');
console.log(`  wrote ${join(OUT, 'PREFLIGHT-208B.json')}`);
console.log(`================ ${failures === 0 ? 'PREFLIGHT CLEAN' : `${failures} FAILURES`}`);
console.log('provider calls: 0   database operations: 0   human verdicts written: 0');
process.exit(failures === 0 ? 0 : 1);
