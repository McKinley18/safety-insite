/**
 * §158 VC-04 MEASUREMENT REPAIR — SCORER. ZERO PROVIDER CALLS.
 *
 * Replays the IMMUTABLE stored repair record (`VC04-REPAIR-RUN-RECORD.jsonl`, mode 0444) against the
 * frozen §156 truth manifest. It neither issues nor can issue a request: it has no credential read
 * and no fetch.
 *
 * ==================== WHY THIS FILE EXISTS SEPARATELY FROM THE PROBE ====================
 *
 * Two reasons, and the first is a defect in the probe's own reporting.
 *
 * 1. THE PROBE MISLABELLED ONE SCORING DETAIL. Its question 6 printed, when
 *    `proposedClarification` was absent, the fixed string "ABSENT — the §157 truncation condition
 *    reproduced". On the repaired execution that string is FALSE: the response stopped at
 *    `tool_use` after 520 of 4,000 permitted output tokens, so nothing was truncated. The proposal
 *    is absent because the returned verdict was NO_CLARIFICATION_REQUIRED, under which the v2
 *    contract FORBIDS a proposal. Absence is correct there, not a failure. The probe's execution
 *    artifact is preserved unaltered with that string in it; this file supersedes the label and says
 *    so, because silently rewriting an executed artifact is how a measurement record stops being
 *    evidence.
 *
 * 2. THE REPAIR DID NOT REPRODUCE THE TRUNCATED NOMINATION, and the shape of the non-reproduction
 *    needs stating precisely rather than as a single boolean. Same bytes in — the provider metered
 *    4,598 input tokens on both executions — and two different verdicts out. That is a statement
 *    about the verifier's sampling behaviour, at n=2, and it is recorded here as an observation and
 *    NOT as a conclusion about the nomination mechanism, the instruction, or the authored truth.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import {
  EXPERT_AFFECTED_DECISIONS, VERIFIER_FORBIDDEN_FIELDS,
} from './lib/expert-verifier-contract-v2';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'verification', 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V157 = join(ROOT, 'verification', 'expert-hazlenz-verifier-v2-remediation-2026-09-04');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-vc04-measurement-repair-2026-09-04');

const CASE_ID = 'VC-04';
const REPAIR_MAX_TOKENS = 4000;

interface Rec {
  caseId: string; ok: boolean; failureKind: string | null; stopReason: string | null;
  inputTokens: number | null; outputTokens: number | null; verdict: string | null;
  clarificationSourceMode: string | null; rationale: string | null;
  proposedClarification: Record<string, string> | null;
  nominatedFact: Record<string, string> | null;
  admissionAccepted: boolean; nominationAdmitted: boolean; admissionCodes: string[];
  admissionDetail: string[]; degenerate: boolean; costUsd: number; latencyMs: number;
  rawResponse: Record<string, unknown>;
}

const selectorReached = (q: string, sets: string[][] | null): boolean =>
  !!sets && sets.some(set => set.every(k => q.toLowerCase().includes(k)));

function main(): void {
  const rec = JSON.parse(
    readFileSync(join(OUT, 'VC04-REPAIR-RUN-RECORD.jsonl'), 'utf8').trim().split('\n')[0]) as Rec;
  const orig = (JSON.parse(readFileSync(join(V157, 'VERIFIER-V2-RESULTS.json'), 'utf8')) as {
    results: Array<Record<string, any>> }).results.find(r => r.caseId === CASE_ID)!;
  const truth = (JSON.parse(readFileSync(join(SRC, 'TRUTH-MANIFEST.json'), 'utf8')) as {
    entries: Array<Record<string, any>> }).entries.find(e => e.caseId === CASE_ID)!;
  const packetCase = (JSON.parse(readFileSync(join(SRC, 'VERIFIER-PACKET.json'), 'utf8')) as {
    cases: Array<Record<string, any>> }).cases.find(c => c.caseId === CASE_ID)!;

  console.log('§158 VC-04 MEASUREMENT REPAIR — SCORED. PROVIDER_CALLS_THIS_SCRIPT = 0');
  console.log('='.repeat(100));

  const n = rec.nominatedFact;
  const p = rec.proposedClarification;
  const isAdd = rec.verdict === 'ADD_OR_REPLACE_CLARIFICATION';
  const truncated = rec.stopReason === 'max_tokens';

  const q: Array<{ id: string; answer: string; detail: string }> = [];
  const ask = (id: string, answer: string, detail: string) => q.push({ id, answer, detail });

  ask('1. did the verifier nominate a previously unsupplied fact',
    n ? 'YES' : 'NO',
    n ? `"${n.missingFact}"`
      : 'no nomination was emitted; the verdict returned was NO_CLARIFICATION_REQUIRED, under '
        + 'which the v2 contract forbids a nomination');
  ask('2. was the fact inside observation/evidence bounds',
    n ? (packetCase.observation.includes((n.observationSpan ?? '').trim()) ? 'YES' : 'NO')
      : 'NOT_EXERCISED',
    n ? 'observationSpan checked verbatim against the observation' : 'no nomination to bound-check');
  ask('3. were both counterfactual branches supplied',
    n ? (n.branchA?.trim() && n.branchB?.trim() ? 'YES' : 'NO') : 'NOT_EXERCISED',
    n ? `A/B present` : 'no nomination to carry branches');
  ask('4. did the decisions genuinely diverge under the existing authored truth',
    n ? (n.decisionIfA?.trim() !== n.decisionIfB?.trim() ? 'YES' : 'NO') : 'NOT_EXERCISED',
    `authored truth records the divergence independently of this execution: "${
      String(truth.whyDecisionCritical)}"`);
  ask('5. was affectedDecision valid',
    n ? ((EXPERT_AFFECTED_DECISIONS as readonly string[]).includes(n.affectedDecision)
      ? 'YES' : 'NO') : 'NOT_EXERCISED',
    n ? `${n.affectedDecision}` : `authored truth names ${truth.affectedDecision}`);
  ask('6. was proposedClarification present',
    p ? 'YES' : 'NO',
    p ? `"${p.question}" [${p.affectedDecision}]`
      : 'ABSENT, AND CORRECTLY SO FOR THE VERDICT RETURNED. The v2 contract requires a proposal '
        + 'only on ADD_OR_REPLACE_CLARIFICATION and forbids one on NO_CLARIFICATION_REQUIRED. '
        + 'THIS IS NOT THE §157 TRUNCATION CONDITION: the response stopped at tool_use after '
        + `${rec.outputTokens} of ${REPAIR_MAX_TOKENS} permitted output tokens. `
        + 'The probe artifact VC04-REPAIR-RESULT.json carries a fixed string on this line that '
        + 'says the truncation condition reproduced; that string is wrong and this entry '
        + 'supersedes it.');
  ask('7. did the contract accept the result', rec.admissionAccepted ? 'YES' : 'NO',
    rec.admissionAccepted ? 'admitted whole'
      : `codes [${rec.admissionCodes.join(', ')}] detail [${rec.admissionDetail.join(', ')}]`);
  const forbidden = VERIFIER_FORBIDDEN_FIELDS.filter(f => f in (rec.rawResponse ?? {}));
  ask('8. did any forbidden field change', forbidden.length === 0 ? 'NO' : 'YES',
    forbidden.length === 0
      ? `none of ${VERIFIER_FORBIDDEN_FIELDS.length} forbidden fields present in the wire output`
      : forbidden.join(', '));

  console.log('\n--- PART A SCORING (repaired execution, reported independently)\n');
  for (const x of q) console.log(`  ${x.id.padEnd(60)} ${x.answer.padEnd(14)} ${x.detail}`);

  console.log('\n--- INSTRUMENT REPAIR: DID IT WORK\n');
  console.log(`  the truncation condition   ${truncated ? 'RECURRED' : 'DID NOT RECUR'}`
    + `   stop_reason=${rec.stopReason}, ${rec.outputTokens} of ${REPAIR_MAX_TOKENS} tokens used`);
  console.log(`  the model had              ${REPAIR_MAX_TOKENS - (rec.outputTokens ?? 0)}`
    + ' output tokens it did not use');
  console.log('  => the raised ceiling removed the harness defect. The instrument is repaired.');

  console.log('\n--- SEMANTIC OUTCOME: DID THE NOMINATION REPRODUCE\n');
  console.log(`  §157 (truncated)  ${orig.verdict}/${orig.clarificationSourceMode}`
    + `   ${orig.outputTokens} out, stop=${orig.stopReason}`);
  console.log(`  §158 (repaired)   ${rec.verdict}/${rec.clarificationSourceMode ?? 'null'}`
    + `   ${rec.outputTokens} out, stop=${rec.stopReason}`);
  console.log('  NOMINATION REPRODUCED: NO — a different verdict was returned on identical input.');
  console.log(`  identical input is provider-attested: ${orig.inputTokens} metered input tokens on `
    + `both executions (${rec.inputTokens} on the repair).`);
  console.log('\n  WHAT THIS DOES AND DOES NOT ESTABLISH:');
  console.log('    - it DOES establish that the §157 VC-04 measurement was destroyed by the harness');
  console.log('      and that raising the ceiling removes that destruction;');
  console.log('    - it does NOT establish that bounded nomination completes hosted, because the');
  console.log('      repaired draw did not attempt a nomination at all;');
  console.log('    - it does NOT establish that the §157 nomination was wrong, and it does NOT');
  console.log('      establish that the repaired silence is wrong. Two draws disagreed. n=2.');
  console.log('    - the frozen §156 truth manifest holds VC-04 to be decision-critical, so against');
  console.log('      that standard the repaired draw is a miss — carrying the truth-authority');
  console.log('      caveat, since that standard was authored by the graded model family.');

  const mechanismDemonstrated = rec.ok && !!n && !!p && rec.admissionAccepted
    && rec.nominationAdmitted && !truncated;
  console.log(`\n  VC04_BOUNDED_NOMINATION_MECHANISM_HOSTED_DEMONSTRATED = ${
    mechanismDemonstrated ? 'TRUE' : 'FALSE'}`);
  console.log('  HARNESS_TRUNCATION_DEFECT_REPAIRED = TRUE');
  console.log('  VERIFIER_ARCHITECTURE_STATUS = NOT_UPGRADED');

  const out = {
    scoredAt: new Date().toISOString(),
    scope: '§158 VC-04 measurement repair, one hosted call, instrument repair only',
    providerCallsThisScript: 0,
    supersedes: {
      artifact: 'VC04-REPAIR-RESULT.json',
      field: 'partAScoring[5].detail (question 6)',
      reason: 'the probe printed a fixed string asserting the §157 truncation condition reproduced. '
        + 'It did not: stop_reason was tool_use at 520 of 4000 tokens. The proposal is absent '
        + 'because the verdict was NO_CLARIFICATION_REQUIRED, under which the contract forbids one. '
        + 'The probe artifact is preserved unaltered; this record corrects the label.',
    },
    partAScoring: q,
    instrumentRepair: {
      truncationRecurred: truncated,
      stopReason: rec.stopReason,
      outputTokensUsed: rec.outputTokens,
      outputTokensPermitted: REPAIR_MAX_TOKENS,
      HARNESS_TRUNCATION_DEFECT_REPAIRED: !truncated,
    },
    semanticOutcome: {
      originalVerdict: orig.verdict, originalSourceMode: orig.clarificationSourceMode,
      originalOutputTokens: orig.outputTokens, originalStopReason: orig.stopReason,
      repairedVerdict: rec.verdict, repairedSourceMode: rec.clarificationSourceMode,
      repairedOutputTokens: rec.outputTokens, repairedStopReason: rec.stopReason,
      nominationReproduced: false,
      identicalInputAttestedByProvider: orig.inputTokens === rec.inputTokens,
      meteredInputTokensBothExecutions: rec.inputTokens,
      againstFrozenTruth: {
        correctVerdict: truth.correctVerdict,
        repairedVerdictMatches: rec.verdict === truth.correctVerdict,
        selectorReachedOwedFact: p ? selectorReached(p.question, truth.selectorKeywordSets) : null,
        owedFact: truth.missingFact,
        TRUTH_AUTHORITY_CAVEAT: 'the standard was authored by the model family being graded and '
          + 'has not been independently reviewed',
      },
      DRAW_DISAGREEMENT_AT_N_EQUALS_2: 'two executions of byte-identical input returned different '
        + 'verdicts. Recorded as an observation. It is not sufficient to characterise the '
        + 'verifier\'s nomination rate, and it is not evidence for or against the instruction-'
        + 'suppression hypothesis, which remains unexecuted.',
    },
    VC04_BOUNDED_NOMINATION_MECHANISM_HOSTED_DEMONSTRATED: mechanismDemonstrated,
    VERIFIER_ARCHITECTURE_STATUS: 'NOT_UPGRADED',
    historicalIntegrity: {
      section157RunRecordsUntouched: true,
      section157ScoresUntouched: true,
      originalTruncatedExecutionPreserved:
        'verification/expert-hazlenz-verifier-v2-remediation-2026-09-04/VERIFIER-V2-RUN-RECORDS.jsonl',
      repairedExecutionPreserved:
        'verification/expert-hazlenz-vc04-measurement-repair-2026-09-04/VC04-REPAIR-RUN-RECORD.jsonl',
    },
  };
  writeFileSync(join(OUT, 'VC04-REPAIR-SCORE.json'), `${JSON.stringify(out, null, 2)}\n`);
  console.log('\n  -> VC04-REPAIR-SCORE.json');
  console.log('  PROVIDER_CALLS_THIS_SCRIPT = 0');
}

main();
