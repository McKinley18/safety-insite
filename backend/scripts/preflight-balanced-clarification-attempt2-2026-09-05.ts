/**
 * §175 ATTEMPT-2 PRE-SPEND PREFLIGHT. ZERO PROVIDER CALLS.
 *
 * Attempt 1 spent ten calls and measured nothing because the probe read a field the provider result
 * does not carry. This preflight exists so that failure cannot repeat silently: it drives the REAL
 * exported `deriveRowRecord` -- the same function attempt 2 will use on live responses -- with
 * synthetic payloads whose correct answers are known in advance.
 *
 * It tests a duplicate of nothing. If this file passes and the run still measures zero, the zero is
 * the model's.
 *
 *   A  a valid payload carrying ONE clarification  -> count 1, exact question recovered
 *   B  an explicit NOTHING_TO_ADD                  -> distinguished from ANALYZED
 *   C  a malformed payload                         -> CONTRACT_FAILURE, never silence
 *   D  raw output present on the record BEFORE any derived figure is computed
 *
 * Any failure aborts with a non-zero exit and no provider call is made.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import { deriveRowRecord, analysisStateFor, loadFrozenRows } from './probe-balanced-clarification-hosted-2026-09-05';
import { buildExpertAnalysisInputFromAnalysis } from '../src/safescope-v2/expert-hazlenz/expert-input-constructor';
import { EXPERT_ANALYSIS_CONTRACT_VERSION } from '../src/safescope-v2/expert-hazlenz/expert-contract.types';

const INSTR = join(__dirname, '..', '..', 'verification', 'expert-hazlenz-balanced-clarification-instrument-2026-09-05');
const PREREG = join(__dirname, '..', '..', 'verification', 'expert-hazlenz-balanced-hosted-validation-2026-09-05', 'PRE-SPEND-PREREGISTRATION.json');
const EXPECTED_PREREG_SHA = '397aed8f73cf47de7a585878d2cea97104ca4918d22ea84ed48b3e6d3cecc508';

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
let failures = 0;
const check = (name: string, ok: boolean, detail: string): void => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
};

// ---------------------------------------------------------------- 1. frozen state
const frozen = JSON.parse(readFileSync(join(INSTR, 'FROZEN-ROW-HASHES.json'), 'utf8'));
const pkt = JSON.parse(readFileSync(join(INSTR, 'BLINDED-HUMAN-REVIEW-PACKET.json'), 'utf8'));
const truth = JSON.parse(readFileSync(join(INSTR, 'HUMAN-ADJUDICATION-RECORD.json'), 'utf8'));

console.log('--- 1. frozen instrument and truth');
check('1.1 review packet hash unchanged',
  sha(readFileSync(join(INSTR, 'BLINDED-HUMAN-REVIEW-PACKET.json'), 'utf8'))
    === frozen.REVIEW_PACKET_HASH['BLINDED-HUMAN-REVIEW-PACKET.json'], '');
const truthSha = sha(readFileSync(join(INSTR, 'HUMAN-ADJUDICATION-RECORD.json'), 'utf8'));
check('1.2 truth record hash unchanged', truthSha.startsWith('4412990912bef4e9'), truthSha.slice(0, 16));
let rowDrift = 0;
for (const r of pkt.rows) {
  if (sha(r.TEXT) !== frozen.rowTextHashes[r.REVIEW_ROW_ID].rowTextSha256) rowDrift += 1;
}
check('1.3 all ten row texts unchanged', rowDrift === 0, `${rowDrift} drifted`);
const EXPECTED: Record<string, boolean> = {
  'HR-01': true, 'HR-02': false, 'HR-03': false, 'HR-04': true, 'HR-05': false,
  'HR-06': true, 'HR-07': false, 'HR-08': true, 'HR-09': true, 'HR-10': false,
};
const truthMatches = truth.rows.every((r: any) => r.HUMAN_CLARIFICATION_REQUIRED === EXPECTED[r.REVIEW_ROW_ID]);
check('1.4 ten verdicts match the authorization exactly', truthMatches, '');
check('1.5 AI-assistance disclosure preserved',
  truth.INDEPENDENCE_DISCLOSURE?.AI_ASSISTED_HUMAN_VERDICT_GENERATION === true
  && truth.INDEPENDENCE_DISCLOSURE?.FULLY_INDEPENDENT_HUMAN_ADJUDICATION === false, '');

console.log('\n--- 2. original preregistration');
const preregSha = sha(readFileSync(PREREG, 'utf8'));
check('2.1 §175 preregistration hash unchanged', preregSha === EXPECTED_PREREG_SHA, preregSha.slice(0, 16));

// ---------------------------------------------------------------- 3. synthetic preflight
console.log('\n--- 3. synthetic preflight against the REAL deriveRowRecord (zero provider calls)');
const rows = loadFrozenRows();
const row = rows.find(r => r.id === 'HR-01')!;
const VOCAB = ['confined_space', 'conveyors', 'fire_explosion', 'guarding_interlocks', 'machine_guarding', 'suspended_loads'];
const input = buildExpertAnalysisInputFromAnalysis(analysisStateFor(row, VOCAB));

const base = {
  contractVersion: EXPERT_ANALYSIS_CONTRACT_VERSION,
  analysisId: 'HR-01',
  expertHazardCandidates: [] as unknown[],
  decisionCriticalClarifications: [] as unknown[],
  crossHazardInsights: [] as unknown[],
  disagreements: [] as unknown[],
  expertExplanation: 'The certificate does not record a flame test on the burner.',
  uncertainty: { overallConfidence: 'MEDIUM', drivers: ['no flame test recorded'] },
};

const QUESTION = 'Was the burner flame-failure device function-tested at the Monday service?';

// --- A. one clarification is read, and read exactly
const A = deriveRowRecord(
  { ok: true, raw: { ...base, outcome: 'ANALYZED', decisionCriticalClarifications: [{
    clarificationId: 'C1', question: QUESTION,
    whyItMatters: 'If it was not tested the safeguard state is unestablished and the dryer may need to come out of service; if it was, the finding is limited to housekeeping.',
    evidenceGap: 'the certificate records a nozzle change and filter clean but no flame test',
    affectedDecision: 'REQUIRED_CONTROL', criticality: 'BLOCKING',
  }] } },
  input, row, { latencyMs: 1, promptTokens: 10, outputTokens: 20, computedCostUsd: 0.001 });
check('A.1 normalization VALID', A.normalizationState === 'VALID', String(A.normalizationState));
check('A.2 clarification count is 1', A.clarificationCount === 1, String(A.clarificationCount));
check('A.3 the exact question is recovered verbatim', A.clarifications[0]?.question === QUESTION, '');
check('A.4 not marked a contract failure', A.contractFailure === false, '');

// --- B. an explicit NOTHING_TO_ADD is distinguishable from an ANALYZED with no clarification
const B = deriveRowRecord({ ok: true, raw: { ...base, outcome: 'NOTHING_TO_ADD' } },
  input, row, { latencyMs: 1, promptTokens: 10, outputTokens: 5, computedCostUsd: 0.001 });
const BA = deriveRowRecord({ ok: true, raw: { ...base, outcome: 'ANALYZED' } },
  input, row, { latencyMs: 1, promptTokens: 10, outputTokens: 5, computedCostUsd: 0.001 });
check('B.1 NOTHING_TO_ADD normalizes VALID', B.normalizationState === 'VALID', String(B.normalizationState));
check('B.2 declared outcome recorded as NOTHING_TO_ADD', B.declaredOutcome === 'NOTHING_TO_ADD', String(B.declaredOutcome));
check('B.3 ANALYZED recorded as ANALYZED', BA.declaredOutcome === 'ANALYZED', String(BA.declaredOutcome));
check('B.4 the two are distinguishable despite both carrying zero clarifications',
  B.declaredOutcome !== BA.declaredOutcome && B.clarificationCount === 0 && BA.clarificationCount === 0, '');

// --- C. a malformed payload is a CONTRACT FAILURE and is never silence
const C = deriveRowRecord({ ok: true, raw: { ...base, outcome: 'NOT_A_REAL_OUTCOME' } },
  input, row, { latencyMs: 1, promptTokens: 10, outputTokens: 5, computedCostUsd: 0.001 });
check('C.1 malformed payload is REJECTED', C.normalizationState === 'REJECTED', String(C.normalizationState));
check('C.2 flagged as a contract failure', C.contractFailure === true, '');
check('C.3 normalization issues are preserved, not discarded', (C.normalizationIssues ?? []).length > 0,
  (C.normalizationIssues ?? []).map((i: any) => i.code).join(','));
check('C.4 a rejected row is NOT scorable as a silence pass',
  !(C.contractFailure === false && C.clarificationCount === 0), 'rejection must not read as silence');

// --- D. raw output is on the record before any derived figure exists
check('D.1 raw provider output is persisted on the record', C.rawProviderOutput !== null && A.rawProviderOutput !== null, '');
check('D.2 raw is retained even when normalization REJECTS the payload',
  C.rawProviderOutput !== null && (C.rawProviderOutput as any).outcome === 'NOT_A_REAL_OUTCOME', '');
const src = readFileSync(join(__dirname, 'probe-balanced-clarification-hosted-2026-09-05.ts'), 'utf8');
const iAppend = src.indexOf('appendFileSync(runFile');
const iScore = src.indexOf('const silCorrect');
check('D.3 the record is written to disk BEFORE any aggregate figure is computed',
  iAppend > 0 && iScore > iAppend, `append@${iAppend} score@${iScore}`);
check('D.4 raw is captured inside deriveRowRecord, not after scoring',
  src.indexOf('rawProviderOutput') < iScore, '');

console.log(`\n${failures === 0 ? 'PREFLIGHT PASSED' : `PREFLIGHT FAILED (${failures})`} — provider calls made: 0`);
if (failures > 0) process.exit(1);
