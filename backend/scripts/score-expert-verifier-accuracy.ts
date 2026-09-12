/**
 * §156 EXPERT HAZLENZ -- VERIFIER ACCURACY SCORER. ZERO PROVIDER CALLS.
 *
 * SEPARATE FROM THE PROBE ON PURPOSE. The probe spends and stores; this reads what was stored. A
 * scorer that lived inside the probe could be adjusted and the probe re-run until the number moved,
 * and nothing in the artifacts would show it. This file is written BEFORE the hosted run.
 *
 * ==================== HOW A VERDICT IS SCORED ====================
 *
 *   EXACT      the verdict string equals the manifest's `correctVerdict`.
 *   SEMANTIC   the verdict is in the manifest's `semanticallyEquivalentVerdicts` for that case.
 *              Only the silence side has one: a first pass that asked nothing and was right can be
 *              reported as NO_CLARIFICATION_REQUIRED or as VERIFIED_AS_IS, and those state the same
 *              outcome. The clarification side has NONE -- nothing but ADD_OR_REPLACE repairs a
 *              missed decision-critical question.
 *   ABSTAIN    reported separately. It is never correct on a primary case; it counts as a failure
 *              to recover on the decision-critical side and is NOT counted as a manufactured
 *              question on the silence side, because abstaining does not burden anyone with a
 *              question. This convention is stated in the frozen manifest, not chosen here.
 *
 * SELECTOR SCORING IS AN AID, NOT A VERDICT. The keyword sets come from the frozen manifest, which
 * took them from the frozen v9 authored selectors. A match means the proposed question reaches the
 * authored fact; the VERBATIM question is printed beside every judgement so a human reads the text
 * rather than the flag.
 */

import { createHash } from 'crypto';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const OUT = join(__dirname, '..', '..', 'verification',
  'expert-hazlenz-verifier-accuracy-2026-09-03');

interface TruthEntry {
  caseId: string; inPrimaryDenominator: boolean; correctVerdict: string;
  semanticallyEquivalentVerdicts: string[]; missingFact: string | null;
  affectedDecision: string | null; acceptableSelectors: string[] | null;
  selectorKeywordSets: string[][] | null; exclusionReason: string | null;
}
interface ResultRow {
  caseId: string; ok: boolean; failureKind: string | null; verdict: string | null;
  rationale: string | null; aboutUnresolvedFactRef: string | null;
  proposedClarification: { question: string; whyItMatters: string; affectedDecision: string;
    evidenceGap: string } | null;
  boundaryAccepted: boolean; boundaryViolations: string[];
  degenerate: boolean; degenerateSignals: string[];
  inputTokens: number | null; outputTokens: number | null; latencyMs: number; costUsd: number;
}

const selectorReached = (question: string, sets: string[][] | null): boolean => {
  if (!sets) return false;
  const q = question.toLowerCase();
  return sets.some(set => set.every(k => q.includes(k)));
};

function main(): void {
  const truth = JSON.parse(readFileSync(join(OUT, 'TRUTH-MANIFEST.json'), 'utf8')) as {
    entries: TruthEntry[] };
  const run = JSON.parse(readFileSync(join(OUT, 'VERIFIER-RESULTS.json'), 'utf8')) as {
    accounting: Record<string, number>; identity: Record<string, string>; results: ResultRow[] };
  const key = JSON.parse(readFileSync(join(OUT, 'SEALED-CASE-KEY.json'), 'utf8')) as {
    key: Array<{ caseId: string; draw: string; rowId: string }> };

  const truthById = new Map(truth.entries.map(e => [e.caseId, e]));
  const keyById = new Map(key.key.map(k => [k.caseId, k]));

  console.log('§156 VERIFIER ACCURACY — SCORED AGAINST THE FROZEN TRUTH MANIFEST');
  console.log('='.repeat(100));
  console.log(`  packet   ${run.identity.packetSha256.slice(0, 24)}…`);
  console.log(`  truth    ${run.identity.truthManifestSha256.slice(0, 24)}…`);
  console.log(`  verifier ${run.identity.verifierInstruction} `
    + `${run.identity.verifierInstructionSha256.slice(0, 16)}…\n`);

  // ---- per case
  interface Scored extends ResultRow {
    draw: string; rowId: string; truth: TruthEntry;
    exact: boolean; semantic: boolean; abstained: boolean;
    selectorOk: boolean | null; affectedDecisionOk: boolean | null;
    executionValid: boolean;
  }
  const scored: Scored[] = run.results.map(r => {
    const t = truthById.get(r.caseId)!;
    const k = keyById.get(r.caseId)!;
    const v = r.verdict ?? 'NO_OUTPUT';
    const exact = v === t.correctVerdict;
    const semantic = exact || t.semanticallyEquivalentVerdicts.includes(v);
    const proposed = r.proposedClarification;
    return {
      ...r, draw: k.draw, rowId: k.rowId, truth: t,
      exact, semantic, abstained: v === 'ABSTAIN',
      selectorOk: t.selectorKeywordSets && proposed
        ? selectorReached(proposed.question, t.selectorKeywordSets) : null,
      affectedDecisionOk: t.affectedDecision && proposed
        ? proposed.affectedDecision === t.affectedDecision : null,
      executionValid: r.ok && !r.degenerate && r.boundaryAccepted,
    };
  });

  console.log('--- PER CASE\n');
  console.log('  case   verdict                        exact  sel  dec  primary  stored');
  for (const s of scored) {
    console.log(`  ${s.caseId}  ${(s.verdict ?? s.failureKind ?? 'NO_OUTPUT').padEnd(30)}`
      + `${(s.exact ? 'Y' : s.semantic ? '~' : 'N').padEnd(7)}`
      + `${(s.selectorOk === null ? '-' : s.selectorOk ? 'Y' : 'N').padEnd(5)}`
      + `${(s.affectedDecisionOk === null ? '-' : s.affectedDecisionOk ? 'Y' : 'N').padEnd(5)}`
      + `${(s.truth.inPrimaryDenominator ? 'yes' : 'EXCL').padEnd(9)}${s.draw} ${s.rowId}`);
  }

  // ---- primary metrics
  const primary = scored.filter(s => s.truth.inPrimaryDenominator);
  const valid = primary.filter(s => s.executionValid);
  const critical = valid.filter(s => s.truth.correctVerdict === 'ADD_OR_REPLACE_CLARIFICATION');
  const silence = valid.filter(s => s.truth.correctVerdict === 'NO_CLARIFICATION_REQUIRED');
  const pct = (n: number, d: number) => d === 0 ? 'NOT_EXERCISED' : `${n}/${d} (${((n / d) * 100).toFixed(1)}%)`;

  console.log('\n--- PRIMARY METRICS  (denominator frozen before spend)\n');
  console.log(`  primary cases                       ${primary.length}`);
  console.log(`  execution-valid                     ${valid.length}`
    + `   (non-degenerate, boundary-accepted)`);
  console.log(`  VERIFIER_EXACT_VERDICT_ACCURACY     ${pct(valid.filter(s => s.exact).length, valid.length)}`);
  console.log(`  VERIFIER_SEMANTIC_ACCURACY          ${pct(valid.filter(s => s.semantic).length, valid.length)}`);
  console.log(`  abstain rate                        ${pct(valid.filter(s => s.abstained).length, valid.length)}`);

  console.log('\n  DECISION-CRITICAL SIDE (a clarification is owed)');
  const recovered = critical.filter(s => s.semantic);
  console.log(`    cases                             ${critical.length}`);
  console.log(`    recall (ADD_OR_REPLACE returned)  ${pct(recovered.length, critical.length)}`);
  console.log(`    correct selector rate             ${pct(critical.filter(s => s.selectorOk === true).length, critical.length)}`);
  console.log(`    wrong selector rate               ${pct(critical.filter(s => s.selectorOk === false).length, critical.length)}`);
  console.log(`    correct affectedDecision          ${pct(critical.filter(s => s.affectedDecisionOk === true).length, critical.length)}`);
  console.log(`    FALSE NO_CLARIFICATION_REQUIRED   ${pct(critical.filter(s => s.verdict === 'NO_CLARIFICATION_REQUIRED').length, critical.length)}`);
  console.log(`    false VERIFIED_AS_IS              ${pct(critical.filter(s => s.verdict === 'VERIFIED_AS_IS').length, critical.length)}`);
  console.log(`    abstain                           ${pct(critical.filter(s => s.abstained).length, critical.length)}`);

  console.log('\n  LEGITIMATE-SILENCE SIDE (no clarification is owed)');
  const preserved = silence.filter(s => s.semantic);
  const manufactured = silence.filter(s => s.verdict === 'ADD_OR_REPLACE_CLARIFICATION');
  console.log(`    cases                             ${silence.length}`);
  console.log(`    FORBIDDEN_VERIFIER_SPECIFICITY    ${pct(preserved.length, silence.length)}`);
  console.log(`    false ADD_OR_REPLACE (a question manufactured)  ${pct(manufactured.length, silence.length)}`);
  console.log(`    false-positive question rate      ${pct(manufactured.length, silence.length)}`);
  console.log(`    abstain                           ${pct(silence.filter(s => s.abstained).length, silence.length)}`);

  // ---- confusion matrix
  const VERDICTS = ['VERIFIED_AS_IS', 'ADD_OR_REPLACE_CLARIFICATION', 'NO_CLARIFICATION_REQUIRED',
    'ABSTAIN'];
  console.log('\n--- CONFUSION MATRIX (primary, execution-valid). rows = truth, cols = returned\n');
  console.log('  truth \\ returned                 VERIFIED  ADD_OR_REPL  NO_CLAR_REQ  ABSTAIN');
  for (const t of ['ADD_OR_REPLACE_CLARIFICATION', 'NO_CLARIFICATION_REQUIRED']) {
    const row = valid.filter(s => s.truth.correctVerdict === t);
    const cells = VERDICTS.map(v => row.filter(s => s.verdict === v).length);
    console.log(`  ${t.padEnd(33)}${String(cells[0]).padStart(8)}${String(cells[1]).padStart(13)}`
      + `${String(cells[2]).padStart(13)}${String(cells[3]).padStart(9)}`);
  }

  // ---- the four excluded cases
  const excluded = scored.filter(s => !s.truth.inPrimaryDenominator);
  console.log('\n--- EXCLUDED FROM THE PRIMARY DENOMINATOR (reported, never scored)\n');
  for (const s of excluded) {
    console.log(`  ${s.caseId} (${s.draw} ${s.rowId})  returned ${s.verdict}`);
    console.log(`      why excluded: ${(s.truth.exclusionReason ?? '').slice(0, 150)}…`);
    if (s.proposedClarification) {
      console.log(`      proposed: "${s.proposedClarification.question}"`);
    }
  }

  // ---- known-miss detail, verbatim
  console.log('\n--- KNOWN-MISS RECOVERY, VERBATIM\n');
  for (const s of critical) {
    console.log(`  ${s.caseId} (${s.draw} ${s.rowId})  verdict ${s.verdict}`);
    console.log(`      owed: ${s.truth.missingFact}`);
    console.log(`      proposed: ${s.proposedClarification
      ? `"${s.proposedClarification.question}" [${s.proposedClarification.affectedDecision}]`
      : '(none)'}`);
    console.log(`      selector reaches the owed fact: `
      + `${s.selectorOk === null ? 'n/a' : s.selectorOk ? 'YES' : 'NO'}`);
    console.log(`      rationale: ${(s.rationale ?? '').slice(0, 200)}`);
  }

  // ---- execution anomalies
  const degenerate = scored.filter(s => s.degenerate);
  const rejected = scored.filter(s => !s.boundaryAccepted);
  console.log('\n--- EXECUTION\n');
  console.log(`  degenerate verifier outputs         ${degenerate.length}`
    + `${degenerate.length ? ` — ${degenerate.map(s => s.caseId).join(' ')}` : ''}`);
  console.log(`  boundary-rejected verdicts          ${rejected.length}`
    + `${rejected.length ? ` — ${rejected.map(s => `${s.caseId}:${s.boundaryViolations.join('/')}`).join(' ')}` : ''}`);

  // ---- observed cost and latency, replacing §155's assumption
  const toks = scored.filter(s => s.inputTokens !== null);
  const avgIn = toks.reduce((t, s) => t + (s.inputTokens ?? 0), 0) / (toks.length || 1);
  const avgOut = toks.reduce((t, s) => t + (s.outputTokens ?? 0), 0) / (toks.length || 1);
  const avgCost = scored.reduce((t, s) => t + s.costUsd, 0) / (scored.length || 1);
  const avgMs = scored.reduce((t, s) => t + s.latencyMs, 0) / (scored.length || 1);
  const FIRST_PASS_CALL_COST = 0.05006;
  const TRIGGER_RATE = 15 / 44;
  console.log('\n--- OBSERVED VERIFIER COST AND LATENCY (replaces §155\'s assumption)\n');
  console.log(`  average input tokens                ${avgIn.toFixed(0)}`);
  console.log(`  average output tokens               ${avgOut.toFixed(0)}`);
  console.log(`  average cost per verifier call      $${avgCost.toFixed(5)}`);
  console.log(`  as a share of a first-pass call     `
    + `${((avgCost / FIRST_PASS_CALL_COST) * 100).toFixed(1)}%   `
    + `(§155 ASSUMED 81% — this is the measurement)`);
  console.log(`  average latency                     ${avgMs.toFixed(0)}ms`);
  const per100 = 100 * TRIGGER_RATE;
  console.log(`  projected extra calls per 100       ${per100.toFixed(1)}`
    + '   (at the §155 development trigger frequency 15/44)');
  console.log(`  projected extra cost per 100        $${(per100 * avgCost).toFixed(2)}`
    + `   against a $${(100 * FIRST_PASS_CALL_COST).toFixed(2)} first-pass baseline`
    + `  = +${(((per100 * avgCost) / (100 * FIRST_PASS_CALL_COST)) * 100).toFixed(1)}%`);
  console.log('\n  15/44 trigger frequency and 4/48 degenerate frequency remain DEVELOPMENT');
  console.log('  OBSERVATIONS from sixteen rows and three draws. They are not production rates.');

  const out = {
    scoredAt: new Date().toISOString(),
    identity: run.identity,
    primary: {
      cases: primary.length, executionValid: valid.length,
      VERIFIER_EXACT_VERDICT_ACCURACY: `${valid.filter(s => s.exact).length}/${valid.length}`,
      VERIFIER_SEMANTIC_ACCURACY: `${valid.filter(s => s.semantic).length}/${valid.length}`,
      decisionCritical: {
        cases: critical.length,
        recall: `${recovered.length}/${critical.length}`,
        correctSelector: `${critical.filter(s => s.selectorOk === true).length}/${critical.length}`,
        correctAffectedDecision:
          `${critical.filter(s => s.affectedDecisionOk === true).length}/${critical.length}`,
        falseNoClarificationRequired:
          `${critical.filter(s => s.verdict === 'NO_CLARIFICATION_REQUIRED').length}/${critical.length}`,
        abstain: `${critical.filter(s => s.abstained).length}/${critical.length}`,
      },
      legitimateSilence: {
        cases: silence.length,
        FORBIDDEN_VERIFIER_SPECIFICITY: `${preserved.length}/${silence.length}`,
        falsePositiveQuestionRate: `${manufactured.length}/${silence.length}`,
        abstain: `${silence.filter(s => s.abstained).length}/${silence.length}`,
      },
    },
    excluded: excluded.map(s => ({ caseId: s.caseId, verdict: s.verdict,
      proposed: s.proposedClarification?.question ?? null })),
    perCase: scored.map(s => ({ caseId: s.caseId, draw: s.draw, rowId: s.rowId,
      truth: s.truth.correctVerdict, returned: s.verdict, exact: s.exact, semantic: s.semantic,
      selectorOk: s.selectorOk, affectedDecisionOk: s.affectedDecisionOk,
      proposedQuestion: s.proposedClarification?.question ?? null,
      rationale: s.rationale, inPrimary: s.truth.inPrimaryDenominator })),
    execution: {
      degenerateVerifierOutputs: degenerate.map(s => s.caseId),
      boundaryRejected: rejected.map(s => s.caseId),
    },
    observedCost: {
      averageInputTokens: Math.round(avgIn), averageOutputTokens: Math.round(avgOut),
      averageCostUsd: Number(avgCost.toFixed(6)),
      shareOfFirstPassCall: `${((avgCost / FIRST_PASS_CALL_COST) * 100).toFixed(1)}%`,
      averageLatencyMs: Math.round(avgMs),
      projectedExtraCallsPer100: Number(per100.toFixed(1)),
      projectedExtraCostPer100Usd: Number((per100 * avgCost).toFixed(4)),
      NOTE: '15/44 and 4/48 are development observations, not production rates.',
    },
  };
  const json = `${JSON.stringify(out, null, 2)}\n`;
  writeFileSync(join(OUT, 'VERIFIER-SCORES.json'), json);
  console.log(`\n  scores -> VERIFIER-SCORES.json  sha256 `
    + `${createHash('sha256').update(json).digest('hex').slice(0, 24)}…`);
  console.log('PROVIDER_CALLS_THIS_SCRIPT = 0');
  if (!existsSync(join(OUT, 'VERIFIER-RESULTS.json'))) process.exit(1);
}

main();
