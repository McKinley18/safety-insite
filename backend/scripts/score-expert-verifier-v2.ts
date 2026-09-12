/**
 * §157 EXPERT HAZLENZ -- VERIFIER v2 SCORER. ZERO PROVIDER CALLS.
 *
 * Written BEFORE the hosted run and kept separate from the probe, for the reason §156 gave: a scorer
 * inside the probe can be adjusted and the probe re-run until the number moves, and nothing in the
 * artifacts would show it.
 *
 * Scored against the SAME frozen §156 truth manifest, so v1 and v2 are compared on one standard.
 * That standard carries the §157 truth-authority caveat: it was authored by the same model family
 * being graded and has not been independently reviewed, so these are DEVELOPMENT figures.
 *
 * ==================== WHAT COUNTS AS AN HS-H1 RECOVERY ====================
 *
 * Not "a question was asked". The proposed question must reach the fact the frozen v9 authored truth
 * names, tested against that truth's own selector keyword sets. A different chamber-instrument
 * distractor is explicitly NOT recovery, and the verbatim text is printed so a human checks the flag.
 */

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const SRC = join(ROOT, 'verification', 'expert-hazlenz-verifier-accuracy-2026-09-03');
const OUT = join(ROOT, 'verification', 'expert-hazlenz-verifier-v2-remediation-2026-09-04');

interface TruthEntry {
  caseId: string; inPrimaryDenominator: boolean; correctVerdict: string;
  semanticallyEquivalentVerdicts: string[]; missingFact: string | null;
  affectedDecision: string | null; selectorKeywordSets: string[][] | null;
  exclusionReason: string | null;
}
interface V2Row {
  caseId: string; ok: boolean; failureKind: string | null; verdict: string | null;
  clarificationSourceMode: string | null; rationale: string | null;
  proposedClarification: Record<string, string> | null;
  nominatedFact: Record<string, string> | null;
  admissionAccepted: boolean; nominationAdmitted: boolean; admissionCodes: string[];
  degenerate: boolean; inputTokens: number | null; outputTokens: number | null;
  latencyMs: number; costUsd: number;
}

const selectorReached = (q: string, sets: string[][] | null): boolean => {
  if (!sets) return false;
  const s = q.toLowerCase();
  return sets.some(set => set.every(k => s.includes(k)));
};

function main(): void {
  const truth = (JSON.parse(readFileSync(join(SRC, 'TRUTH-MANIFEST.json'), 'utf8')) as {
    entries: TruthEntry[] }).entries;
  const run = JSON.parse(readFileSync(join(OUT, 'VERIFIER-V2-RESULTS.json'), 'utf8')) as {
    identity: Record<string, string>; accounting: Record<string, number>; results: V2Row[] };
  const key = (JSON.parse(readFileSync(join(SRC, 'SEALED-CASE-KEY.json'), 'utf8')) as {
    key: Array<{ caseId: string; draw: string; rowId: string }> }).key;
  const v1 = (JSON.parse(readFileSync(join(SRC, 'VERIFIER-SCORES.json'), 'utf8')) as {
    perCase: Array<{ caseId: string; returned: string }> }).perCase;

  const truthById = new Map(truth.map(t => [t.caseId, t]));
  const rowById = new Map(key.map(k => [k.caseId, `${k.draw} ${k.rowId}`]));
  const v1ById = new Map(v1.map(c => [c.caseId, c.returned]));

  console.log('§157 VERIFIER v2 — SCORED AGAINST THE FROZEN §156 TRUTH MANIFEST');
  console.log('='.repeat(100));
  console.log(`  contract    ${run.identity.verifierContract}`);
  console.log(`  instruction ${run.identity.verifierInstruction} `
    + `${run.identity.verifierInstructionSha256.slice(0, 16)}…`);
  console.log(`  truth       ${run.identity.truthManifestSha256.slice(0, 24)}…  (same standard v1 `
    + 'was scored on)\n');
  console.log('  DEVELOPMENT FIGURES. The standard was authored by the model family being graded and');
  console.log('  has not been independently reviewed — see docs/EXPERT-EVALUATION-TRUTH-AUTHORITY.md\n');

  interface Scored extends V2Row {
    row: string; truth: TruthEntry; exact: boolean; semantic: boolean; abstained: boolean;
    selectorOk: boolean | null; decisionOk: boolean | null; executionValid: boolean;
    v1Verdict: string | null;
  }
  const scored: Scored[] = run.results.map(r => {
    const t = truthById.get(r.caseId)!;
    const v = r.verdict ?? 'NO_OUTPUT';
    const proposed = r.proposedClarification;
    return {
      ...r, row: rowById.get(r.caseId) ?? '?', truth: t,
      exact: v === t.correctVerdict,
      semantic: v === t.correctVerdict || t.semanticallyEquivalentVerdicts.includes(v),
      abstained: v === 'ABSTAIN',
      selectorOk: t.selectorKeywordSets && proposed
        ? selectorReached(proposed.question, t.selectorKeywordSets) : null,
      decisionOk: t.affectedDecision && proposed
        ? proposed.affectedDecision === t.affectedDecision : null,
      executionValid: r.ok && !r.degenerate && r.admissionAccepted,
      v1Verdict: v1ById.get(r.caseId) ?? null,
    };
  });

  console.log('--- PER CASE   (v1 shown for comparison; v1 was NOT shown to the v2 verifier)\n');
  console.log('  case   v2 verdict / source mode                    exact sel dec adm  v1 verdict');
  for (const s of scored) {
    const mode = s.clarificationSourceMode ? `/${s.clarificationSourceMode}` : '';
    console.log(`  ${s.caseId}  ${`${s.verdict ?? s.failureKind}${mode}`.padEnd(45)}`
      + `${(s.exact ? 'Y' : s.semantic ? '~' : 'N').padEnd(6)}`
      + `${(s.selectorOk === null ? '-' : s.selectorOk ? 'Y' : 'N').padEnd(4)}`
      + `${(s.decisionOk === null ? '-' : s.decisionOk ? 'Y' : 'N').padEnd(4)}`
      + `${(s.admissionAccepted ? 'ok' : 'REF').padEnd(5)}${s.v1Verdict ?? ''}`);
  }

  const primary = scored.filter(s => s.truth.inPrimaryDenominator);
  const valid = primary.filter(s => s.executionValid);
  const critical = valid.filter(s => s.truth.correctVerdict === 'ADD_OR_REPLACE_CLARIFICATION');
  const silence = valid.filter(s => s.truth.correctVerdict === 'NO_CLARIFICATION_REQUIRED');
  const pct = (n: number, d: number) => d === 0 ? 'NOT_EXERCISED' : `${n}/${d} (${((n / d) * 100).toFixed(1)}%)`;

  console.log('\n--- PHASE 11 GATES\n');
  console.log(`  primary cases                       ${primary.length}`);
  console.log(`  execution-valid                     ${valid.length}`);
  console.log(`  exact verdict accuracy              ${pct(valid.filter(s => s.exact).length, valid.length)}`);
  console.log(`  semantic accuracy                   ${pct(valid.filter(s => s.semantic).length, valid.length)}`);
  console.log(`\n  A. DECISION-CRITICAL RECALL         ${pct(critical.filter(s => s.semantic).length, critical.length)}`);
  console.log(`  B. SELECTOR ACCURACY                ${pct(critical.filter(s => s.selectorOk === true).length, critical.length)}`);
  console.log(`     correct affectedDecision         ${pct(critical.filter(s => s.decisionOk === true).length, critical.length)}`);
  console.log(`     false NO_CLARIFICATION_REQUIRED  ${pct(critical.filter(s => s.verdict === 'NO_CLARIFICATION_REQUIRED').length, critical.length)}`);
  console.log(`  C. LEGITIMATE-SILENCE SPECIFICITY   ${pct(silence.filter(s => s.semantic).length, silence.length)}`);
  console.log(`     false ADD_OR_REPLACE             ${pct(silence.filter(s => s.verdict === 'ADD_OR_REPLACE_CLARIFICATION').length, silence.length)}`);

  const nominations = scored.filter(s => s.clarificationSourceMode === 'NOMINATED_FACT');
  const nomPrimary = nominations.filter(s => s.truth.inPrimaryDenominator);
  const falseNominations = nomPrimary.filter(
    s => s.truth.correctVerdict === 'NO_CLARIFICATION_REQUIRED');
  const trueNominations = nomPrimary.filter(
    s => s.truth.correctVerdict === 'ADD_OR_REPLACE_CLARIFICATION');
  console.log(`\n  D. NOMINATION COUNT                 ${nominations.length}/${scored.length}`
    + `   (primary ${nomPrimary.length}, excluded-case ${nominations.length - nomPrimary.length})`);
  console.log(`  E. NOMINATION ACCURACY              ${pct(trueNominations.filter(s => s.selectorOk === true).length, nomPrimary.length)}`
    + '   (nominations on a decision-critical case whose selector reaches the owed fact)');
  console.log(`  F. FALSE NOMINATION COUNT           ${falseNominations.length}`
    + '   (a nomination on a case where silence was right)');
  console.log(`  G. ABSTAIN COUNT                    ${scored.filter(s => s.abstained).length}`);
  console.log(`  H. BOUNDARY REJECTION COUNT         ${scored.filter(s => !s.admissionAccepted).length}`
    + `${scored.filter(s => !s.admissionAccepted).length
      ? ` — ${scored.filter(s => !s.admissionAccepted).map(s => `${s.caseId}:${s.admissionCodes.join('/')}`).join(' ')}` : ''}`);

  console.log('\n--- HS-H1, LOAD-BEARING\n');
  const hs = scored.filter(s => s.row.includes('HS-H1'));
  let hsRecovered = 0;
  for (const s of hs) {
    const reached = s.selectorOk === true;
    if (reached && s.verdict === 'ADD_OR_REPLACE_CLARIFICATION') hsRecovered += 1;
    console.log(`  ${s.caseId} (${s.row})   v1 ${s.v1Verdict}   ->   v2 ${s.verdict}`
      + `${s.clarificationSourceMode ? '/' + s.clarificationSourceMode : ''}`);
    console.log(`      owed fact: ${s.truth.missingFact}`);
    if (s.nominatedFact) {
      console.log(`      NOMINATED: ${s.nominatedFact.missingFact}`);
      console.log(`         branchA: ${s.nominatedFact.branchA} -> ${s.nominatedFact.decisionIfA}`);
      console.log(`         branchB: ${s.nominatedFact.branchB} -> ${s.nominatedFact.decisionIfB}`);
    }
    if (s.proposedClarification) {
      console.log(`      question: "${s.proposedClarification.question}"`
        + `  [${s.proposedClarification.affectedDecision}]`);
    }
    console.log(`      REACHES THE OWED FACT: ${reached ? 'YES' : 'NO'}`
      + `${reached ? '' : '  — a different fact is not recovery'}`);
  }
  console.log(`\n  HS-H1 RECOVERED: ${hsRecovered}/${hs.length}`);

  console.log('\n--- NOMINATIONS IN FULL\n');
  for (const s of nominations) {
    console.log(`  ${s.caseId} (${s.row})  truth=${s.truth.correctVerdict}`
      + `${s.truth.inPrimaryDenominator ? '' : ' [EXCLUDED CASE]'}`);
    console.log(`      fact: ${s.nominatedFact?.missingFact}`);
    console.log(`      span: "${(s.nominatedFact?.observationSpan ?? '').slice(0, 90)}"`);
    console.log(`      A: ${s.nominatedFact?.decisionIfA}`);
    console.log(`      B: ${s.nominatedFact?.decisionIfB}`);
    console.log(`      admitted: ${s.nominationAdmitted}`);
  }
  if (nominations.length === 0) console.log('  (none)');

  const toks = scored.filter(s => s.inputTokens !== null);
  const avgIn = toks.reduce((t, s) => t + (s.inputTokens ?? 0), 0) / (toks.length || 1);
  const avgOut = toks.reduce((t, s) => t + (s.outputTokens ?? 0), 0) / (toks.length || 1);
  const avgCost = scored.reduce((t, s) => t + s.costUsd, 0) / (scored.length || 1);
  const avgMs = scored.reduce((t, s) => t + s.latencyMs, 0) / (scored.length || 1);
  console.log('\n--- COST AND LATENCY\n');
  console.log(`  average input tokens   ${avgIn.toFixed(0)}   (v1 measured 3,681)`);
  console.log(`  average output tokens  ${avgOut.toFixed(0)}   (v1 measured 478)`);
  console.log(`  average cost per call  $${avgCost.toFixed(5)}   (v1 measured $0.01214)`);
  console.log(`  share of a first pass  ${((avgCost / 0.05006) * 100).toFixed(1)}%`);
  console.log(`  average latency        ${avgMs.toFixed(0)}ms   (v1 measured 6,110ms)`);
  console.log(`  per 100 analyses at the §155 trigger frequency 15/44: `
    + `${(100 * 15 / 44).toFixed(1)} extra calls, $${((100 * 15 / 44) * avgCost).toFixed(2)}`
    + `  = +${((((100 * 15 / 44) * avgCost) / (100 * 0.05006)) * 100).toFixed(1)}%`);
  console.log('\n  15/44 remains a DEVELOPMENT observation, not a production rate.');

  const out = {
    scoredAt: new Date().toISOString(), identity: run.identity,
    TRUTH_AUTHORITY_CAVEAT: 'Scored against a standard authored by the model family being graded, '
      + 'not independently reviewed. DEVELOPMENT EVIDENCE, NOT ACCEPTANCE EVIDENCE. See '
      + 'docs/EXPERT-EVALUATION-TRUTH-AUTHORITY.md',
    gates: {
      primaryCases: primary.length, executionValid: valid.length,
      exactAccuracy: `${valid.filter(s => s.exact).length}/${valid.length}`,
      semanticAccuracy: `${valid.filter(s => s.semantic).length}/${valid.length}`,
      A_decisionCriticalRecall: `${critical.filter(s => s.semantic).length}/${critical.length}`,
      B_selectorAccuracy: `${critical.filter(s => s.selectorOk === true).length}/${critical.length}`,
      C_legitimateSilenceSpecificity: `${silence.filter(s => s.semantic).length}/${silence.length}`,
      D_nominationCount: nominations.length,
      E_nominationAccuracy:
        `${trueNominations.filter(s => s.selectorOk === true).length}/${nomPrimary.length}`,
      F_falseNominationCount: falseNominations.length,
      G_abstainCount: scored.filter(s => s.abstained).length,
      H_boundaryRejectionCount: scored.filter(s => !s.admissionAccepted).length,
      HS_H1_RECOVERED: `${hsRecovered}/${hs.length}`,
    },
    perCase: scored.map(s => ({ caseId: s.caseId, row: s.row, truth: s.truth.correctVerdict,
      v1: s.v1Verdict, v2: s.verdict, sourceMode: s.clarificationSourceMode,
      exact: s.exact, semantic: s.semantic, selectorOk: s.selectorOk, decisionOk: s.decisionOk,
      admissionAccepted: s.admissionAccepted, admissionCodes: s.admissionCodes,
      question: s.proposedClarification?.question ?? null,
      nominatedFact: s.nominatedFact?.missingFact ?? null,
      inPrimary: s.truth.inPrimaryDenominator })),
    cost: { averageInputTokens: Math.round(avgIn), averageOutputTokens: Math.round(avgOut),
      averageCostUsd: Number(avgCost.toFixed(6)), averageLatencyMs: Math.round(avgMs),
      shareOfFirstPass: `${((avgCost / 0.05006) * 100).toFixed(1)}%` },
  };
  writeFileSync(join(OUT, 'VERIFIER-V2-SCORES.json'), `${JSON.stringify(out, null, 2)}\n`);
  console.log('\n  scores -> VERIFIER-V2-SCORES.json');
  console.log('PROVIDER_CALLS_THIS_SCRIPT = 0');
}

main();
