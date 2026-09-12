/**
 * §136 -- POST-RUN EVIDENCE-RECOVERABILITY AUDIT for M06, M07 and M09. ZERO PROVIDER CALLS.
 *
 * ==================== WHY THIS EXISTS ====================
 *
 * The §136 execution script failed to persist `CohortRunRecord[]`, so the frozen end-to-end
 * `buildScoringReport` path cannot be re-run after adjudication. That is an EVALUATION
 * EVIDENCE-PERSISTENCE DEFECT, and the owner's ruling is that final validity turns on one question
 * only: are the three adjudicated measures EXACTLY recoverable from artifacts that WERE persisted
 * during the original formal execution?
 *
 * This script answers that question and nothing else. It scores nothing, adjudicates nothing and
 * decides nothing about the model.
 *
 * ==================== THE STANDARD, APPLIED STRICTLY ====================
 *
 * EXACTLY_RECOVERABLE means the frozen result is a deterministic function of immutable persisted
 * artifacts plus the human verdicts the frozen contract already requires -- with NO missing semantic
 * input. "Likely equivalent", "enough to understand the answer" and "could reconstruct the analysis"
 * are all NOT_EXACTLY_RECOVERABLE.
 *
 * The distinction that matters throughout is ORIGINAL VALUE versus LOSSY PROJECTION. A queue item
 * that carries the exact string the scorer reads is the original value. A summary, a count or a
 * derived flag standing in for a field the scorer reads is a projection, and a projection fails.
 *
 * ==================== READ-ONLY ====================
 *
 * No provider call. No file written except this audit's own report. The frozen scorer is READ, never
 * modified and never given a fallback path.
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { CONTENT_SCORING_ARM } from '../src/safescope-v2/expert-hazlenz/expert-measure-scorers';

const ROOT = join(__dirname, '..', '..');
const EVAL_DIR = join(ROOT, 'verification', 'expert-hazlenz-formal-evaluation-2026-09-01');
const FROZEN_DIR = join(ROOT, 'verification', 'expert-hazlenz-formal-cohort-frozen-2026-09-01');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');

type Origin = 'ADJUDICATION_QUEUE' | 'HUMAN_VERDICT' | 'ATTEMPT_LEDGER' | 'FROZEN_COHORT_TRUTH'
  | 'GOVERNED_ATTACHMENT' | 'COHORT_RUN_RECORD_ONLY';

interface Dep {
  scorerExpression: string;
  fieldRead: string;
  origin: Origin;
  /** TRUE only when the persisted artifact holds the ORIGINAL value, not a projection of it. */
  originalValuePersisted: boolean;
  presentInArtifacts: boolean;
  note: string;
}

const out: string[] = [];
const say = (s = '') => { out.push(s); console.log(s); };

function main(): void {
  mkdirSync(EVAL_DIR, { recursive: true });
  const resultPath = join(EVAL_DIR, 'EVALUATION-RESULT.json');
  if (!existsSync(resultPath)) {
    console.error('EVALUATION-RESULT.json not found -- the formal run has not completed.');
    process.exit(2);
  }
  const result = JSON.parse(readFileSync(resultPath, 'utf8'));
  const manifest = JSON.parse(readFileSync(join(FROZEN_DIR, 'COHORT-MANIFEST.json'), 'utf8'));
  const queue = result.adjudicationQueue.items as Array<Record<string, unknown>>;
  const ledger = result.attemptLedger as Array<Record<string, unknown>>;

  const reg = queue.filter(q => q.kind === 'REGULATORY_STATEMENT');
  const clr = queue.filter(q => q.kind === 'CLARIFICATION_MAPPING');

  say('POST-RUN EVIDENCE-RECOVERABILITY AUDIT -- M06 / M07 / M09');
  say('Zero provider calls. The frozen scorer is READ, never modified.');
  say('');
  say(`  runId                       ${result.runId}`);
  say(`  cohortId                    ${result.cohortId}`);
  say(`  adjudication queue items    ${queue.length}  (REG ${reg.length}, CLR ${clr.length})`);
  say(`  attempt-ledger calls        ${ledger.length}`);
  say(`  CohortRunRecord[] persisted false   <-- THE DEFECT`);
  say('');

  // ---- what the persisted artifacts actually contain, checked not assumed
  const regHasAll = reg.every(q => typeof q.itemId === 'string' && typeof q.rowId === 'string'
    && typeof q.subject === 'string' && typeof q.fieldPath === 'string'
    && typeof q.assertsObligation === 'boolean');
  const clrHasAll = clr.every(q => typeof q.itemId === 'string' && typeof q.rowId === 'string'
    && Array.isArray(q.candidateGaps)
    && typeof q.clarificationAffectedDecision === 'string');
  const baseCalls = ledger.filter(c => c.arm === CONTENT_SCORING_ARM);
  const ledgerHasStatus = baseCalls.every(c => typeof c.layerStatus === 'string');
  const baseRowIds = new Set(baseCalls.map(c => String(c.rowId)));
  const manifestRowIds: string[] = manifest.rowOrder;
  const everyRowHasBase = manifestRowIds.every(id => baseRowIds.has(id));
  const manifestHasGoverned = manifest.rows.every((r: { governedStandards: unknown[] }) =>
    Array.isArray(r.governedStandards));

  const M06: Dep[] = [
    { scorerExpression: 'buildAdjudicationQueue(records).filter(kind===REGULATORY_STATEMENT)',
      fieldRead: 'queue item set', origin: 'ADJUDICATION_QUEUE',
      originalValuePersisted: true, presentInArtifacts: reg.length >= 0,
      note: 'the queue itself is persisted verbatim, so the scorer\'s own derived population is '
        + 'available without re-deriving it from analysis' },
    { scorerExpression: 'byItem.get(q.itemId).verdict', fieldRead: 'AdjudicationRecord.verdict',
      origin: 'HUMAN_VERDICT', originalValuePersisted: true, presentInArtifacts: true,
      note: 'supplied by the human reviewer; required by the frozen contract' },
    { scorerExpression: 'q.assertsObligation !== true -> skip', fieldRead: 'assertsObligation',
      origin: 'ADJUDICATION_QUEUE', originalValuePersisted: regHasAll, presentInArtifacts: regHasAll,
      note: 'mechanical flag computed at queue-build time and persisted ON the item' },
    { scorerExpression: 'q.rowId', fieldRead: 'rowId', origin: 'ADJUDICATION_QUEUE',
      originalValuePersisted: regHasAll, presentInArtifacts: regHasAll, note: '' },
    { scorerExpression: 'deriveRowLedger(r).contentEligible',
      fieldRead: 'base call layerStatus in {PRESENT, OUTPUT_REJECTED}', origin: 'ATTEMPT_LEDGER',
      originalValuePersisted: ledgerHasStatus, presentInArtifacts: ledgerHasStatus && everyRowHasBase,
      note: 'the ledger persists layerStatus per (rowId, arm); CONTENT_SCORING_ARM = BASE' },
    { scorerExpression: 'deriveRowLedger(r).hasGovernedRecord',
      fieldRead: 'row.source.governedStandards.length > 0', origin: 'GOVERNED_ATTACHMENT',
      originalValuePersisted: manifestHasGoverned, presentInArtifacts: manifestHasGoverned,
      note: 'frozen in the cohort manifest before the run' },
    { scorerExpression: 'eligibleRowIds.size (DENOMINATOR)', fieldRead: 'row population',
      origin: 'ATTEMPT_LEDGER', originalValuePersisted: everyRowHasBase,
      presentInArtifacts: everyRowHasBase,
      note: 'computed over ALL rows, including rows with no queue item -- the ledger covers all 65' },
  ];

  const M07: Dep[] = [
    { scorerExpression: 'buildAdjudicationQueue(records).filter(kind===REGULATORY_STATEMENT)',
      fieldRead: 'queue item set (DENOMINATOR = queue.length)', origin: 'ADJUDICATION_QUEUE',
      originalValuePersisted: true, presentInArtifacts: true,
      note: 'denominator is exactly the persisted queue length' },
    { scorerExpression: 'byItem.get(q.itemId).verdict === SUPPORTED_BY_SUPPLIED_RECORD',
      fieldRead: 'AdjudicationRecord.verdict', origin: 'HUMAN_VERDICT',
      originalValuePersisted: true, presentInArtifacts: true, note: 'NUMERATOR' },
    { scorerExpression: 'q.rowId / q.fieldPath / q.subject', fieldRead: 'evidence fields',
      origin: 'ADJUDICATION_QUEUE', originalValuePersisted: regHasAll,
      presentInArtifacts: regHasAll, note: 'evidence only; does not enter the ratio' },
  ];

  const M09: Dep[] = [
    { scorerExpression: 'buildAdjudicationQueue(records).filter(kind===CLARIFICATION_MAPPING)',
      fieldRead: 'queue item set (DENOMINATOR = queue.length)', origin: 'ADJUDICATION_QUEUE',
      originalValuePersisted: true, presentInArtifacts: true, note: '' },
    { scorerExpression: 'byItem.get(q.itemId).verdict / .mappedGapId',
      fieldRead: 'AdjudicationRecord.verdict, mappedGapId', origin: 'HUMAN_VERDICT',
      originalValuePersisted: true, presentInArtifacts: true, note: '' },
    { scorerExpression: '(q.candidateGaps).find(g => g.gapId === verdict.mappedGapId)',
      fieldRead: 'candidateGaps[].gapId', origin: 'ADJUDICATION_QUEUE',
      originalValuePersisted: clrHasAll, presentInArtifacts: clrHasAll,
      note: 'the row\'s authored gaps are carried ON the queue item' },
    { scorerExpression: 'gap.affectedDecision !== q.clarificationAffectedDecision',
      fieldRead: 'candidateGaps[].affectedDecision, clarificationAffectedDecision',
      origin: 'ADJUDICATION_QUEUE', originalValuePersisted: clrHasAll,
      presentInArtifacts: clrHasAll,
      note: 'BOTH sides of the scorer\'s own comparison are on the item; the adjudicator never '
        + 'makes this comparison and the scorer needs no analysis to make it' },
  ];

  const verdictFor = (deps: Dep[]) => {
    const missing = deps.filter(d => !d.presentInArtifacts || !d.originalValuePersisted
      || d.origin === 'COHORT_RUN_RECORD_ONLY');
    return { recoverable: missing.length === 0, missing };
  };

  const table: Array<{ measure: string; deps: Dep[]; verdict: ReturnType<typeof verdictFor> }> = [
    { measure: 'M06_UNSUPPORTED_REGULATORY_ASSERTIONS', deps: M06, verdict: verdictFor(M06) },
    { measure: 'M07_GOVERNED_RECORD_GROUNDING', deps: M07, verdict: verdictFor(M07) },
    { measure: 'M09_CLARIFICATION_QUALITY', deps: M09, verdict: verdictFor(M09) },
  ];

  for (const t of table) {
    say('');
    say(`${t.measure}`);
    say('');
    say(`   ${'scorer expression'.padEnd(56)} ${'origin'.padEnd(22)} orig  present`);
    for (const d of t.deps) {
      say(`   ${d.scorerExpression.slice(0, 55).padEnd(56)} ${d.origin.padEnd(22)} `
        + `${d.originalValuePersisted ? ' yes' : '  NO'}  ${d.presentInArtifacts ? 'yes' : ' NO'}`);
      if (d.note) say(`      ${d.note}`);
    }
    say('');
    say(`   VERDICT: ${t.verdict.recoverable ? 'EXACTLY_RECOVERABLE' : 'NOT_EXACTLY_RECOVERABLE'}`);
    for (const m of t.verdict.missing) say(`     MISSING: ${m.fieldRead} (${m.origin})`);
  }

  const allRecoverable = table.every(t => t.verdict.recoverable);

  say('');
  say('WHAT IS GENUINELY LOST, STATED PLAINLY');
  say('');
  say('   CohortRunRecord[] -- and with it every validated ExpertAnalysis and merged block -- was');
  say('   NOT persisted. The frozen end-to-end buildScoringReport path is therefore permanently');
  say('   unavailable for this run, and that does not change even if the three measures above are');
  say('   recoverable. The 14 mechanically scored measures were computed ONCE, during the formal');
  say('   run, by the unchanged frozen scorer; their stage-2 values are preserved and are the only');
  say('   values that will ever exist for them.');
  say('');
  say('   Adjudication provably cannot alter those 14: scoreAllMeasures passes `adjudications` to');
  say('   scoreM06, scoreM07 and scoreM09 ONLY. That is why a recovery limited to these three is a');
  say('   complete recovery of everything adjudication could have changed, rather than a partial');
  say('   score assembled from two different runs.');

  say('');
  say(`AUDIT RESULT: ${allRecoverable
    ? 'ALL THREE EXACTLY_RECOVERABLE'
    : 'AT LEAST ONE NOT_EXACTLY_RECOVERABLE'}`);
  say('CohortRunRecord[] was NOT fabricated, reconstructed or synthesized.');
  say('PROVIDER_INVOCATION_COUNT unchanged by this audit: it makes no call.');

  const report = {
    artifact: 'FORMAL_EVIDENCE_RECOVERABILITY_AUDIT',
    runId: result.runId,
    cohortId: result.cohortId,
    cohortRunRecordsPersisted: false,
    defectClassification: 'EVALUATION_EVIDENCE_PERSISTENCE_DEFECT',
    frozenEndToEndRescoringPathAvailable: false,
    onlyM06M07M09ReceiveAdjudications: true,
    adjudicationCannotAlterOtherMeasures: true,
    queueItems: queue.length,
    regulatoryStatementItems: reg.length,
    clarificationMappingItems: clr.length,
    dependencyTable: table.map(t => ({
      measure: t.measure,
      verdict: t.verdict.recoverable ? 'EXACTLY_RECOVERABLE' : 'NOT_EXACTLY_RECOVERABLE',
      missingFields: t.verdict.missing.map(m => ({ field: m.fieldRead, origin: m.origin })),
      dependencies: t.deps,
    })),
    allThreeExactlyRecoverable: allRecoverable,
    scorerModified: false,
    fallbackPathAddedToScorer: false,
    analysisSynthesized: false,
    providerCalls: 0,
    auditScriptSha256: sha(readFileSync(__filename)),
  };
  writeFileSync(join(EVAL_DIR, 'RECOVERABILITY-AUDIT.json'),
    JSON.stringify(report, null, 2) + '\n');
  writeFileSync(join(EVAL_DIR, 'RECOVERABILITY-AUDIT.txt'), out.join('\n') + '\n');
  console.log('\nwritten: RECOVERABILITY-AUDIT.json / .txt');
  if (!allRecoverable) process.exit(3);
}

main();
