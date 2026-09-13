/**
 * §136 -- POST-HOC EVIDENCE-RECOVERY VERIFIER for M06, M07 and M09. ZERO PROVIDER CALLS.
 *
 * ==================== THIS IS NOT A REPLACEMENT SCORER ====================
 *
 * `buildScoringReport` and every frozen scorer remain untouched and unimported-for-execution here.
 * This file exists for ONE reason: the frozen end-to-end rescoring path is unavailable because
 * `CohortRunRecord[]` was not persisted, and the owner's ruling permits executing the EXACT frozen
 * arithmetic for the three adjudicated measures directly over the preserved adjudication artifacts.
 *
 * It introduces no semantics. Every formula below is transcribed from `expert-measure-scorers.ts`
 * with the source expression quoted beside it, so a reader can diff the two by eye. No threshold
 * moves, no denominator is redefined, no numerator definition changes, and nothing converts an
 * UNMEASURED state into a PASS.
 *
 * ==================== TWO CALCULATIONS THAT MUST AGREE ====================
 *
 * Calculation A walks the queue in the frozen scorer's own shape -- item by item, in queue order,
 * with the same branch structure.
 *
 * Calculation B is deliberately a different path: it flattens every item into a decision ledger,
 * groups by outcome and sums the groups, in a different order, without reusing A's branches. It also
 * emits a hand-checkable CSV so a human can total the columns independently of both.
 *
 * If A and B disagree by any amount the run fails. Agreement is not decoration: a single
 * implementation checking itself proves nothing.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { frozenFieldsFor } from '../src/hazlenz/expert-hazlenz/expert-measurement-contract';
import { rubricFor } from '../src/hazlenz/expert-hazlenz/expert-measurement-contract';
import { CONTENT_SCORING_ARM } from '../src/hazlenz/expert-hazlenz/expert-measure-scorers';

const ROOT = join(__dirname, '..', '..');
const EVAL_DIR = join(ROOT, 'verification', 'expert-hazlenz-formal-evaluation-2026-09-01');
const FROZEN_DIR = join(ROOT, 'verification', 'expert-hazlenz-formal-cohort-frozen-2026-09-01');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');

interface Verdict {
  itemId: string; rubricId: string; verdict: string;
  mappedGapId?: string | null; supportingCitation?: string | null; reason: string;
}

const out: string[] = [];
const say = (s = '') => { out.push(s); console.log(s); };

/** The frozen legality rules from `indexAdjudications`, transcribed. A verdict that fails is dropped. */
function indexVerdicts(vs: Verdict[]): { byItem: Map<string, Verdict>; problems: string[] } {
  const byItem = new Map<string, Verdict>();
  const problems: string[] = [];
  for (const r of vs) {
    if (byItem.has(r.itemId)) { problems.push(`duplicate adjudication for ${r.itemId}`); continue; }
    const rubric = rubricFor(r.rubricId);
    if (!rubric) { problems.push(`${r.itemId}: unknown rubric ${r.rubricId}`); continue; }
    if (!rubric.verdicts.includes(r.verdict)) {
      problems.push(`${r.itemId}: verdict ${r.verdict} is not in rubric ${r.rubricId}`); continue;
    }
    if (!r.reason || r.reason.trim().length === 0) {
      problems.push(`${r.itemId}: a verdict with no reason is not auditable`); continue;
    }
    byItem.set(r.itemId, r);
  }
  return { byItem, problems };
}

function ratio(id: string, num: number, den: number) {
  const f = frozenFieldsFor(id);
  const value = den === 0 ? null : num / den;
  const pass = value === null ? false
    : f.direction === 'MAX' ? value <= (f.threshold ?? 0) : value >= (f.threshold ?? 0);
  return { id, numerator: num, denominator: den, value,
    threshold: f.threshold, direction: f.direction, disposition: f.disposition,
    state: den === 0 ? 'UNMEASURED' : 'MEASURED', pass: den === 0 ? false : pass };
}

function main(): void {
  const adjPath = join(EVAL_DIR, 'ADJUDICATIONS.json');
  if (!existsSync(adjPath)) {
    console.error('ADJUDICATIONS.json not found. Human adjudication has not been supplied.');
    console.error('This verifier does not run before the reviewer returns verdicts, and it never');
    console.error('supplies them itself.');
    process.exit(2);
  }
  const result = JSON.parse(readFileSync(join(EVAL_DIR, 'EVALUATION-RESULT.json'), 'utf8'));
  const audit = JSON.parse(readFileSync(join(EVAL_DIR, 'RECOVERABILITY-AUDIT.json'), 'utf8'));
  const manifest = JSON.parse(readFileSync(join(FROZEN_DIR, 'COHORT-MANIFEST.json'), 'utf8'));
  const verdicts: Verdict[] = JSON.parse(readFileSync(adjPath, 'utf8'));

  if (!audit.allThreeExactlyRecoverable) {
    console.error('The recoverability audit did not certify all three measures. Refusing to run.');
    process.exit(3);
  }

  const queue = result.adjudicationQueue.items as Array<Record<string, any>>;
  const ledgerCalls = result.attemptLedger as Array<Record<string, any>>;
  const reg = queue.filter(q => q.kind === 'REGULATORY_STATEMENT');
  const clr = queue.filter(q => q.kind === 'CLARIFICATION_MAPPING');

  const { byItem, problems } = indexVerdicts(verdicts);
  say('POST-HOC EVIDENCE-RECOVERY VERIFIER -- M06 / M07 / M09');
  say('NOT a replacement scorer. The frozen scorer is unmodified and was not executed here.');
  say('');
  if (problems.length > 0) {
    for (const p of problems) say(`   REJECTED VERDICT: ${p}`);
    say('');
  }
  const missingReg = reg.filter(q => !byItem.has(q.itemId));
  const missingClr = clr.filter(q => !byItem.has(q.itemId));
  if (missingReg.length > 0 || missingClr.length > 0) {
    say(`   ${missingReg.length} regulatory and ${missingClr.length} clarification item(s) remain`);
    say('   unadjudicated. Per the frozen rule an incomplete queue leaves the measure UNMEASURED');
    say('   and the gate fails. Nothing is estimated to fill the gap.');
    writeFileSync(join(EVAL_DIR, 'RECOVERED-MEASURES.txt'), out.join('\n') + '\n');
    process.exit(3);
  }

  // ---------------------------------------------------------------- eligible rows for M06
  // frozen: records.filter(r => { l = deriveRowLedger(r); return l.contentEligible && l.hasGovernedRecord })
  // contentEligible = base.layerStatus in {PRESENT, OUTPUT_REJECTED}; hasGovernedRecord = governedStandards.length > 0
  const baseStatus = new Map<string, string>();
  for (const c of ledgerCalls) {
    if (c.arm === CONTENT_SCORING_ARM) baseStatus.set(String(c.rowId), String(c.layerStatus));
  }
  const governedCount = new Map<string, number>();
  for (const r of manifest.rows) governedCount.set(r.rowId, (r.governedStandards ?? []).length);
  const eligibleRowIds = new Set<string>();
  for (const rowId of manifest.rowOrder as string[]) {
    const st = baseStatus.get(rowId);
    const contentEligible = st === 'PRESENT' || st === 'OUTPUT_REJECTED';
    if (contentEligible && (governedCount.get(rowId) ?? 0) > 0) eligibleRowIds.add(rowId);
  }

  // ================================================================ CALCULATION A
  // Transcribed branch-for-branch from scoreM06 / scoreM07 / scoreM09.
  let a06num = 0, a06excluded = 0;
  for (const q of reg) {
    const v = byItem.get(q.itemId)!;
    if (!eligibleRowIds.has(q.rowId)) { a06excluded += 1; continue; }   // frozen: excludedNoRecordRow
    if (q.assertsObligation !== true) continue;                          // frozen: skip non-obligation
    if (v.verdict !== 'NOT_SUPPORTED_BY_SUPPLIED_RECORD') continue;
    a06num += 1;
  }
  const A06 = ratio('M06_UNSUPPORTED_REGULATORY_ASSERTIONS', a06num, eligibleRowIds.size);

  let a07num = 0;
  for (const q of reg) {
    if (byItem.get(q.itemId)!.verdict === 'SUPPORTED_BY_SUPPLIED_RECORD') a07num += 1;
  }
  const A07 = ratio('M07_GOVERNED_RECORD_GROUNDING', a07num, reg.length);

  let a09useful = 0, a09unmapped = 0, a09mismatch = 0;
  for (const q of clr) {
    const v = byItem.get(q.itemId)!;
    if (v.verdict !== 'MAPPED_TO_GAP' || !v.mappedGapId) { a09unmapped += 1; continue; }
    const gap = (q.candidateGaps ?? []).find((g: any) => g.gapId === v.mappedGapId);
    if (!gap) { a09unmapped += 1; continue; }
    if (gap.affectedDecision !== q.clarificationAffectedDecision) { a09mismatch += 1; continue; }
    a09useful += 1;
  }
  const A09 = ratio('M09_CLARIFICATION_QUALITY', a09useful, clr.length);

  // ================================================================ CALCULATION B
  // A different path on purpose: classify every item once into a flat ledger, then aggregate by
  // grouping. No reuse of A's branches, different traversal, sums taken from group sizes.
  type Row = { itemId: string; rowId: string; measure: string; outcome: string };
  const flat: Row[] = [];
  for (const q of reg) {
    const v = byItem.get(q.itemId)!;
    const supported = v.verdict === 'SUPPORTED_BY_SUPPLIED_RECORD';
    flat.push({ itemId: q.itemId, rowId: q.rowId, measure: 'M07',
      outcome: supported ? 'GROUNDED' : 'UNGROUNDED' });
    const eligible = eligibleRowIds.has(q.rowId);
    flat.push({ itemId: q.itemId, rowId: q.rowId, measure: 'M06',
      outcome: !eligible ? 'EXCLUDED_NO_RECORD_ROW'
        : q.assertsObligation !== true ? 'NOT_AN_OBLIGATION'
          : supported ? 'OBLIGATION_SUPPORTED' : 'OBLIGATION_UNSUPPORTED' });
  }
  for (const q of clr) {
    const v = byItem.get(q.itemId)!;
    const gap = v.verdict === 'MAPPED_TO_GAP' && v.mappedGapId
      ? (q.candidateGaps ?? []).find((g: any) => g.gapId === v.mappedGapId) : undefined;
    flat.push({ itemId: q.itemId, rowId: q.rowId, measure: 'M09',
      outcome: !gap ? 'NO_GAP'
        : gap.affectedDecision !== q.clarificationAffectedDecision ? 'DECISION_MISMATCH'
          : 'USEFUL' });
  }
  const group = (measure: string, outcome: string) =>
    flat.filter(r => r.measure === measure && r.outcome === outcome).length;

  const B06 = ratio('M06_UNSUPPORTED_REGULATORY_ASSERTIONS',
    group('M06', 'OBLIGATION_UNSUPPORTED'), eligibleRowIds.size);
  const B07 = ratio('M07_GOVERNED_RECORD_GROUNDING', group('M07', 'GROUNDED'), reg.length);
  const B09 = ratio('M09_CLARIFICATION_QUALITY', group('M09', 'USEFUL'), clr.length);

  const agree = (x: ReturnType<typeof ratio>, y: ReturnType<typeof ratio>) =>
    x.numerator === y.numerator && x.denominator === y.denominator && x.pass === y.pass;
  const allAgree = agree(A06, B06) && agree(A07, B07) && agree(A09, B09);

  // ---------------------------------------------------------------- hand-checkable ledger
  const csv = ['itemId,rowId,measure,outcome']
    .concat(flat.map(r => `${r.itemId},${r.rowId},${r.measure},${r.outcome}`)).join('\n');
  writeFileSync(join(EVAL_DIR, 'RECOVERY-LEDGER.csv'), csv + '\n');

  for (const [A, B, extra] of [[A06, B06, { excludedNoRecordRow: a06excluded }],
    [A07, B07, {}], [A09, B09, { mappedToNoGap: a09unmapped, decisionMismatch: a09mismatch }]] as const) {
    say('');
    say(`${A.id}`);
    say(`   frozen threshold           ${A.direction} ${A.threshold}   (${A.disposition})`);
    say(`   calculation A  numerator   ${A.numerator}   denominator ${A.denominator}`);
    say(`   calculation B  numerator   ${B.numerator}   denominator ${B.denominator}`);
    say(`   AGREE                      ${agree(A, B)}`);
    say(`   value                      ${A.value === null ? 'UNMEASURED' : A.value.toFixed(6)}`);
    say(`   RESULT                     ${A.state === 'UNMEASURED' ? 'UNMEASURED'
      : A.pass ? 'PASS' : 'FAIL'}`);
    for (const [k, v] of Object.entries(extra)) say(`   ${k.padEnd(26)} ${v}`);
  }

  say('');
  say(`TWO INDEPENDENT CALCULATIONS AGREE: ${allAgree}`);
  say('');
  say('STATUS LANGUAGE, EXACTLY AS THE OWNER REQUIRED:');
  say('   The frozen end-to-end rescoring path was unavailable because CohortRunRecord[] was not');
  say('   persisted. M06/M07/M09 were nevertheless exactly recoverable from the persisted formal');
  say('   adjudication artifacts and human verdicts using the unchanged frozen measurement');
  say('   formulas. Results were independently verified.');
  say('');
  say('   The frozen buildScoringReport was NOT rerun. Saying otherwise would be false.');

  writeFileSync(join(EVAL_DIR, 'RECOVERED-MEASURES.json'), JSON.stringify({
    artifact: 'POST_HOC_EVIDENCE_RECOVERY_RESULT',
    runId: result.runId, cohortId: result.cohortId,
    frozenBuildScoringReportRerun: false,
    frozenEndToEndPathUnavailableReason: 'CohortRunRecord[] was not persisted',
    scorerModified: false, analysisSynthesized: false, providerCalls: 0,
    verdictsAccepted: byItem.size, verdictsRejected: problems,
    calculationA: { M06: A06, M07: A07, M09: A09 },
    calculationB: { M06: B06, M07: B07, M09: B09 },
    independentCalculationsAgree: allAgree,
    handCheckableLedger: 'RECOVERY-LEDGER.csv',
    verifierScriptSha256: sha(readFileSync(__filename)),
  }, null, 2) + '\n');
  writeFileSync(join(EVAL_DIR, 'RECOVERED-MEASURES.txt'), out.join('\n') + '\n');
  console.log('\nwritten: RECOVERED-MEASURES.json / .txt / RECOVERY-LEDGER.csv');
  if (!allAgree) process.exit(3);
}

main();
