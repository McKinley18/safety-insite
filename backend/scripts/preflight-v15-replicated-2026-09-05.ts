/**
 * §179 PRE-SPEND PREFLIGHT. ZERO PROVIDER CALLS.
 *
 * Everything the authorization requires to be true before the first of thirty hosted calls, checked
 * against the live tree rather than against a recorded belief about it. Any failure exits non-zero
 * and no provider call is made.
 *
 *   1  frozen instrument, truth and the ten row texts
 *   2  frozen §178 v15 identity — version, system-prompt hash, prompt FILE hash
 *   3  scorer and normalizer byte-unchanged
 *   4  extraction / persistence properties, driven through the REAL deriveRowRecord
 *   5  the frozen preregistration and its execution order
 *
 * Section 4 is the one that earns its keep. §175 attempt 1 spent ten calls and measured nothing
 * because the probe read a field the provider result does not carry, and every row read as zero
 * clarifications — which silently scored every SILENCE row correct for free. These checks drive the
 * same exported function the run will use, with synthetic payloads whose answers are known.
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';

import {
  deriveRowRecord, analysisStateFor, loadFrozenRows,
} from './probe-balanced-clarification-hosted-2026-09-05';
import {
  buildExecutionOrder, validateExecutionOrder, EXECUTIONS_PER_ROW, PLANNED_INVOCATIONS,
  CALL_CEILING, SPEND_CEILING_USD, RETRIES,
} from './probe-v15-replicated-clarification-2026-09-05';
import { buildExpertAnalysisInputFromAnalysis } from '../src/hazlenz/expert-hazlenz/expert-input-constructor';
import { EXPERT_ANALYSIS_CONTRACT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_SYSTEM_PROMPT, EXPERT_PROMPT_VERSION } from '../src/hazlenz/expert-hazlenz/expert-prompt';

const ROOT = join(__dirname, '..', '..');
const INSTR = join(ROOT, 'verification', 'expert-hazlenz-balanced-clarification-instrument-2026-09-05');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-v15-replicated-clarification-validation-2026-09-05');

const sha = (s: string) => createHash('sha256').update(s).digest('hex');
const shaFile = (p: string) => sha(readFileSync(p, 'utf8'));

let failures = 0;
const check = (name: string, ok: boolean, detail = ''): void => {
  if (!ok) failures += 1;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? `  [${detail}]` : ''}`);
};

// ---------------------------------------------------------------- 1. frozen instrument and truth
console.log('--- 1. frozen instrument and truth');
const frozen = JSON.parse(readFileSync(join(INSTR, 'FROZEN-ROW-HASHES.json'), 'utf8'));
const pkt = JSON.parse(readFileSync(join(INSTR, 'BLINDED-HUMAN-REVIEW-PACKET.json'), 'utf8'));
const truth = JSON.parse(readFileSync(join(INSTR, 'HUMAN-ADJUDICATION-RECORD.json'), 'utf8'));

check('1.1 review packet hash unchanged since the §174 freeze',
  shaFile(join(INSTR, 'BLINDED-HUMAN-REVIEW-PACKET.json'))
    === frozen.REVIEW_PACKET_HASH['BLINDED-HUMAN-REVIEW-PACKET.json']);
const truthSha = shaFile(join(INSTR, 'HUMAN-ADJUDICATION-RECORD.json'));
check('1.2 truth record hash unchanged', truthSha.startsWith('4412990912bef4e9'), truthSha.slice(0, 16));
let drift = 0;
for (const r of pkt.rows) {
  if (sha(r.TEXT) !== frozen.rowTextHashes[r.REVIEW_ROW_ID].rowTextSha256) drift += 1;
}
check('1.3 all ten row texts unchanged', drift === 0, `${drift} drifted`);
const EXPECTED_TRUTH: Record<string, boolean> = {
  'HR-01': true, 'HR-02': false, 'HR-03': false, 'HR-04': true, 'HR-05': false,
  'HR-06': true, 'HR-07': false, 'HR-08': true, 'HR-09': true, 'HR-10': false,
};
check('1.4 ten verdicts match the authorization exactly',
  truth.rows.every((r: any) => r.HUMAN_CLARIFICATION_REQUIRED === EXPECTED_TRUTH[r.REVIEW_ROW_ID]));
check('1.5 five REQUIRED and five SILENCE',
  Object.values(EXPECTED_TRUTH).filter(Boolean).length === 5
  && Object.values(EXPECTED_TRUTH).filter(v => !v).length === 5);
check('1.6 AI-assistance disclosure preserved on the truth record',
  truth.AI_ASSISTED_HUMAN_VERDICT_GENERATION === true
  && truth.MODEL_ADJUDICATED_ROWS === 0 && truth.PROVIDER_ADJUDICATED_ROWS === 0);

// ---------------------------------------------------------------- 2. frozen §178 v15 identity
console.log('\n--- 2. frozen §178 v15 identity');
const promptFileSha = shaFile(join(ROOT, 'backend/src/hazlenz/expert-hazlenz/expert-prompt.ts'));
check('2.1 EXPERT_PROMPT_VERSION is v15',
  EXPERT_PROMPT_VERSION === 'hazlenz.expert.prompt.v15', EXPERT_PROMPT_VERSION);
check('2.2 SYSTEM_PROMPT_SHA256 reproduces the §178 value',
  sha(EXPERT_SYSTEM_PROMPT) === '20979d90c0fe0b81843d75edeb1c7d01c637f95ad76be877e6ea44d390b42979',
  sha(EXPERT_SYSTEM_PROMPT).slice(0, 16));
check('2.3 prompt FILE hash reproduces the §178 value — no edit after the recorded v15 hash',
  promptFileSha === 'bfe564c25515cabf5149d9629aa9aa58ea2287dd8691dc338a2f9ec47fd0f694',
  promptFileSha.slice(0, 16));

// ---------------------------------------------------------------- 3. scorer and normalizer
console.log('\n--- 3. scorer and normalizer unchanged');
const PINNED: Array<[string, string]> = [
  ['expert-measure-scorers.ts', '3c916b110ffd6188f977d2741fa5572f487ecf85ad9904b3b9e23f8b46137fae'],
  ['expert-normalization.ts', '606dd1a7d468eecf00de773fd322f2018b00888dc18544c7894f4e5b0082d4ae'],
  ['expert-authority-merge.ts', '9c4fa19663da947bcf17a451d629bf6a703b7e68e56ccca6a443f3196e25809d'],
  ['expert-contract.types.ts', '456d736f2fb291cc405494b19e9380e82f5a2904b0c692ea02911374d6dc7e8a'],
  ['expert-runner.ts', '26dac3049b2203750492fa5368c7cff76b19054166fbdc42d1770e206aeb6736'],
];
for (const [file, want] of PINNED) {
  const got = shaFile(join(ROOT, 'backend/src/hazlenz/expert-hazlenz', file));
  check(`3.x ${file} byte-identical to its §178 value`, got === want, got.slice(0, 16));
}

// ---------------------------------------------------------------- 4. extraction and persistence
console.log('\n--- 4. extraction / persistence, through the REAL deriveRowRecord (zero calls)');
const rows = loadFrozenRows();
const row = rows.find(r => r.id === 'HR-01')!;
const VOCAB = ['confined_space', 'conveyors', 'fire_explosion', 'guarding_interlocks', 'machine_guarding', 'suspended_loads'];
const input = buildExpertAnalysisInputFromAnalysis(analysisStateFor(row, VOCAB));
const tel = { latencyMs: 1, promptTokens: 10, outputTokens: 20, computedCostUsd: 0.001 };

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

const A = deriveRowRecord({ ok: true, raw: { ...base, outcome: 'ANALYZED', decisionCriticalClarifications: [{
  clarificationId: 'C1', question: QUESTION,
  whyItMatters: 'If it was not tested the safeguard state is unestablished and the dryer may need to come out of service; if it was, the finding is limited to housekeeping.',
  evidenceGap: 'the certificate records a nozzle change and filter clean but no flame test',
  affectedDecision: 'REQUIRED_CONTROL', criticality: 'BLOCKING',
}] } }, input, row, tel);
check('4.1 normalizeExpertOutput is used and returns VALID', A.normalizationState === 'VALID', String(A.normalizationState));
check('4.2 decisionCriticalClarifications is the field read', A.clarificationCount === 1, String(A.clarificationCount));
check('4.3 the exact clarification prose is retained verbatim', A.clarifications[0]?.question === QUESTION);
check('4.4 affectedDecision and criticality are retained',
  A.clarifications[0]?.affectedDecision === 'REQUIRED_CONTROL' && A.clarifications[0]?.criticality === 'BLOCKING');
check('4.5 a valid emitting execution is not a contract failure', A.contractFailure === false);

const B = deriveRowRecord({ ok: true, raw: { ...base, outcome: 'NOTHING_TO_ADD' } }, input, row, tel);
const BA = deriveRowRecord({ ok: true, raw: { ...base, outcome: 'ANALYZED' } }, input, row, tel);
check('4.6 NOTHING_TO_ADD stays distinguishable from ANALYZED',
  B.declaredOutcome === 'NOTHING_TO_ADD' && BA.declaredOutcome === 'ANALYZED'
  && B.clarificationCount === 0 && BA.clarificationCount === 0);

const C = deriveRowRecord({ ok: true, raw: { ...base, outcome: 'NOT_A_REAL_OUTCOME' } }, input, row, tel);
check('4.7 a REJECTED normalization becomes CONTRACT_FAILURE',
  C.normalizationState === 'REJECTED' && C.contractFailure === true, String(C.normalizationState));
check('4.8 a rejected execution can never be scored as silence',
  !(C.contractFailure === false && C.clarificationCount === 0));
check('4.9 normalization issues are preserved, not discarded', (C.normalizationIssues ?? []).length > 0,
  (C.normalizationIssues ?? []).map((i: any) => i.code).join(','));

const D = deriveRowRecord({ ok: false, kind: 'PROVIDER_ERROR' }, input, row, null);
check('4.10 a provider failure is a contract failure and not silence',
  D.ok === false && D.contractFailure === true && D.failureKind === 'PROVIDER_ERROR');

check('4.11 raw provider output is captured on the record, including on rejection',
  A.rawProviderOutput !== null && C.rawProviderOutput !== null
  && (C.rawProviderOutput as any).outcome === 'NOT_A_REAL_OUTCOME');
const runnerSrc = readFileSync(join(__dirname, 'probe-v15-replicated-clarification-2026-09-05.ts'), 'utf8');
const iAppend = runnerSrc.indexOf('appendFileSync(runFile');
const iScore = runnerSrc.indexOf('const silPass');
check('4.12 the record is fsynced to disk BEFORE any aggregate is computed',
  iAppend > 0 && iScore > iAppend && runnerSrc.indexOf('fsyncSync(fd)') < iScore,
  `append@${iAppend} score@${iScore}`);
check('4.13 the run scores through the REAL derivation, not a copy',
  runnerSrc.includes("deriveRowRecord, analysisStateFor, loadFrozenRows,")
  && runnerSrc.includes('const base = deriveRowRecord(res, input, row, t);'));
check('4.14 strict REQUIRED recall is not computed anywhere in the runner',
  runnerSrc.includes("REQUIRED_STRICT_PASS: 'PENDING_HUMAN_ADJUDICATION'")
  && !/strictPass\s*=/.test(runnerSrc));

// ---------------------------------------------------------------- 5. preregistration and order
console.log('\n--- 5. frozen preregistration and execution order');
const preregPath = join(EVID, 'PRE-SPEND-PREREGISTRATION-V15.json');
check('5.1 the preregistration exists and was written before any call', existsSync(preregPath));
const prereg = JSON.parse(readFileSync(preregPath, 'utf8'));
check('5.2 preregistration hash', shaFile(preregPath) === '8ea7e8499d1eda68616af937be250bb3cf25c01bf434b90f44bcbe7a4e6870f9',
  shaFile(preregPath).slice(0, 16));
check('5.3 it pins the v15 identity this tree reproduces',
  prereg['2_prompt_identity'].promptVersion === EXPERT_PROMPT_VERSION
  && prereg['2_prompt_identity'].systemPromptSha256 === sha(EXPERT_SYSTEM_PROMPT)
  && prereg['2_prompt_identity'].promptFileSha256 === promptFileSha);
check('5.4 it pins all ten frozen row hashes',
  prereg['4_frozen_rows'].length === 10
  && prereg['4_frozen_rows'].every((r: any) => r.textSha256 === frozen.rowTextHashes[r.id].rowTextSha256));
check('5.5 executions per row is 3 and planned invocations is 30',
  prereg['6_executions_per_row'] === EXECUTIONS_PER_ROW && EXECUTIONS_PER_ROW === 3
  && prereg['11_caps'].plannedInvocations === PLANNED_INVOCATIONS && PLANNED_INVOCATIONS === 30);
check('5.6 caps are 36 calls and $3.00, with retries counting against the call cap',
  prereg['11_caps'].hardProviderInvocationCap === CALL_CEILING && CALL_CEILING === 36
  && prereg['11_caps'].dollarHardCapUsd === SPEND_CEILING_USD && SPEND_CEILING_USD === 3
  && prereg['10_retry_policy'].retries === RETRIES && RETRIES === 0);

const rowIds = rows.map(r => r.id);
const recomputed = buildExecutionOrder(rowIds, sha(EXPERT_SYSTEM_PROMPT));
const frozenOrder = prereg['7_execution_order'].frozenOrder;
check('5.7 the frozen order reproduces deterministically from the identity alone',
  JSON.stringify(recomputed) === JSON.stringify(frozenOrder));
const orderCheck = validateExecutionOrder(frozenOrder, rowIds);
check('5.8 every row occurs exactly three times with replicates 1, 2, 3 and no consecutive repeat',
  orderCheck.ok, orderCheck.problems.join('; '));
check('5.9 the order is interleaved, not row-consecutive',
  !rowIds.some(id => {
    const pos = frozenOrder.filter((o: any) => o.rowId === id).map((o: any) => o.sequencePosition);
    return pos.length === 3 && pos[1] === pos[0] + 1 && pos[2] === pos[1] + 1;
  }));
check('5.10 the causal boundary is preregistered, not added afterwards',
  Array.isArray(prereg['13_causal_boundary'].notEstablishable)
  && prereg['13_causal_boundary'].notEstablishable.includes('CAUSAL_EFFECT_SIZE_V14_TO_V15'));
check('5.11 the success criteria are preregistered with the HR-04 target at >= 2/3',
  String(prereg['12_success_criteria'].HR04_strictPass).startsWith('>= 2/3'));

console.log(`\n${failures === 0 ? 'PREFLIGHT PASSED' : `PREFLIGHT FAILED (${failures})`} — provider calls made: 0`);
if (failures > 0) process.exit(1);
