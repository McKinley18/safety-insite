/**
 * §135 -- REVALIDATE THE 65-ROW CANDIDATE AND FREEZE IT.
 *
 * ==================== THE ORDER MATTERS ====================
 *
 * The execution budget is repaired FIRST and proven by `test:expert-execution-budget` (66/0, zero
 * provider requests). Only then is the cohort revalidated and frozen, because §134 refused to freeze
 * an object whose budget could not actually be enforced and nothing about that refusal has been
 * waived -- the condition was met.
 *
 * ==================== REVALIDATE, DO NOT RESELECT ====================
 *
 * The instrumentation changed; the cohort must not. This script re-derives the selection from the
 * SAME shared rule and asserts the selection-order sha256 still equals the value §134 recorded. A
 * drift there would mean the repairs moved the cohort, which is exactly what must not happen, and it
 * fails the freeze rather than quietly re-recording a new hash.
 *
 * ==================== CONFINEMENT ====================
 *
 * No provider request -- the harness runs DISABLED and `PROVIDER_INVOCATION_COUNT` is asserted zero.
 * No reserve opened. No semantic authoring. No governed record modified or approved. No scorer
 * threshold, class minimum or measurement field touched. `P4_PRESPEND_AUTHORIZATION` stays FALSE:
 * freezing an object is not authorization to spend it.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createHash } from 'crypto';
import {
  classifyRow, truthOnlyStrings, validateCohortRow, COHORT_CASE_CLASSES,
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import {
  evaluateComposition, REQUIRED_CLASS_MINIMUMS, MEASURED_COST_MODEL, RECOMMENDED_CALL_TOPOLOGY,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-composition';
import { buildExpertUserPrompt, EXPERT_SYSTEM_PROMPT, EXPERT_PROMPT_VERSION } from
  '../src/hazlenz/expert-hazlenz/expert-prompt';
import {
  EXPERT_INPUT_CONTRACT_VERSION, EXPERT_ANALYSIS_CONTRACT_VERSION, EXPERT_VALIDATOR_VERSION,
} from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { EXPERT_MEASUREMENT_CONTRACT_VERSION } from
  '../src/hazlenz/expert-hazlenz/expert-measurement-contract';
import { EXPERT_SCORER_VERSION } from
  '../src/hazlenz/expert-hazlenz/expert-measure-scorers';
import { COHORT_SIZE_POLICY_V2, assertFrozenOriginUnchanged } from './lib/expert-cohort-size-policy';
import {
  FORMAL_EXECUTION_BUDGET, WORST_CASE_REQUEST_USD, assertBudgetInternallyConsistent,
  RETRY_EXHAUSTION_CLASSIFICATIONS,
} from './lib/expert-execution-budget';
import {
  buildPool, select, selectionOrder, SOURCE_RANK, SECONDARY_PRIORITY,
} from './lib/expert-cohort-65-selection';
import {
  runFormalCohort, providerInvocationCount, resetProviderInvocationCount,
  EXPERT_COHORT_HARNESS_VERSION,
} from './lib/expert-cohort-harness';

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'verification', 'expert-hazlenz-formal-cohort-frozen-2026-09-01');
const sha = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const shaFile = (p: string) => sha(fs.readFileSync(p));

/** Recorded by §134. The cohort must still hash to this after the budget repairs. */
const RECORDED_SELECTION_SHA =
  'ee57d5dad456b9009d46ba8d9b0a5b34aba9bb4044bbb66e18c96b4d450032d0';
const SNAPSHOT_SHA = 'a2c5dc324ded4fee8689982785682cec0f21c4ed0ce2b1128afd8f902c4d5cd3';

const out: string[] = [];
function say(s = ''): void { out.push(s); console.log(s); }
let blockers: string[] = [];
function require_(label: string, ok: boolean, detail = ''): boolean {
  say(`   ${ok ? 'OK      ' : 'BLOCKER '} ${label.padEnd(52)} ${detail}`);
  if (!ok) blockers.push(`${label}${detail ? ' -- ' + detail : ''}`);
  return ok;
}

interface GovernedRecord {
  citation: string; citationKey: string; title: string; approvedText: string;
  reviewState: string; releaseId: string; recordChecksum: string;
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i += 1) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i += 1; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
    else if (c !== '\r') field += c;
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

/** §126's mapping. `mechanically_validated` is NOT review and never upgrades. */
function backingStateFor(reviewState: string, approvedText: string): string {
  if (reviewState === 'reviewer_approved') {
    return approvedText.trim().length > 0 ? 'APPROVED_EXACT' : 'APPROVED_NO_TEXT';
  }
  return 'UNAPPROVED_RECORD';
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT, { recursive: true });
  resetProviderInvocationCount();

  say('FORMAL EXPERT HAZLENZ COHORT -- REVALIDATION AND FREEZE');
  say('§135. Execution budget repaired and proven first. No provider request. Nothing spent.');
  say('');

  // ============================================================ 1. budget enforceable
  say('1. THE FROZEN EXECUTION BUDGET IS ENFORCEABLE');
  say('');
  let budgetConsistent = true;
  try { assertBudgetInternallyConsistent(); } catch (e) {
    budgetConsistent = false; say(`   ${(e as Error).message}`);
  }
  require_('budget internally consistent', budgetConsistent,
    `195 + 20 = 215, and 215 x $${WORST_CASE_REQUEST_USD.toFixed(6)} = `
    + `$${(215 * WORST_CASE_REQUEST_USD).toFixed(2)}`);
  require_('PLANNED_LOGICAL_CALLS = 195',
    FORMAL_EXECUTION_BUDGET.plannedLogicalCalls === 195);
  require_('GLOBAL_RETRY_REQUEST_BUDGET = 20',
    FORMAL_EXECUTION_BUDGET.globalRetryRequestBudget === 20);
  require_('HARD_PROVIDER_REQUEST_CEILING = 215',
    FORMAL_EXECUTION_BUDGET.hardProviderRequestCeiling === 215);
  require_('HARD_SPEND_CEILING_USD = 22.36',
    FORMAL_EXECUTION_BUDGET.hardSpendCeilingUsd === 22.36);
  require_('max one retry per logical call, unchanged',
    FORMAL_EXECUTION_BUDGET.maxRetriesPerLogicalCall === 1);
  require_('retry causes are the six already implemented',
    FORMAL_EXECUTION_BUDGET.retryCauses.length === 6,
    FORMAL_EXECUTION_BUDGET.retryCauses.join(', '));
  say('');
  say('   Enforcement is proven by scripts/test-expert-execution-budget.ts, which exercises the real');
  say('   runner and the real harness against a scripted no-network provider. It is a REGRESSION');
  say('   suite, not a demonstration: it fails if any of the four repairs is undone.');

  // ============================================================ 2. size policy
  say('');
  say('2. SIZE POLICY');
  say('');
  let originIntact = true;
  try { assertFrozenOriginUnchanged(); } catch { originIntact = false; }
  require_('frozen §122 origin policy still reads 60/60/48', originIntact);
  require_('amended targetRows = 65', COHORT_SIZE_POLICY_V2.targetRows === 65);
  require_('amended hardCeiling = 65', COHORT_SIZE_POLICY_V2.hardCeiling === 65);
  require_('MINIMUM_DEFENSIBLE_ROWS unchanged at 48',
    COHORT_SIZE_POLICY_V2.minimumDefensibleRows === 48);

  // ============================================================ 3. revalidate selection
  say('');
  say('3. REVALIDATE THE EXISTING CANDIDATE -- NO RESELECTION');
  say('');
  const pool = buildPool();
  const sel = select(pool, COHORT_SIZE_POLICY_V2.targetRows);
  require_('selection produced no deficits', sel.deficits.length === 0, sel.deficits.join('; '));
  const order = selectionOrder(sel.selected);
  const selectionSha = sha(order);
  require_('row count = 65', sel.selected.length === 65, String(sel.selected.length));
  require_('SELECTION HASH DID NOT DRIFT', selectionSha === RECORDED_SELECTION_SHA,
    `${selectionSha.slice(0, 16)}... vs recorded ${RECORDED_SELECTION_SHA.slice(0, 16)}...`);
  require_('forced structure unchanged (3 / 17 / 45)',
    sel.bucketSizes.both === 3 && sel.bucketSizes.owedOnly === 17
    && sel.bucketSizes.forbiddenOnly === 45,
    `${sel.bucketSizes.both} / ${sel.bucketSizes.owedOnly} / ${sel.bucketSizes.forbiddenOnly}`);

  // Reproducibility, re-proven after the repairs.
  const again = select([...pool].reverse(), COHORT_SIZE_POLICY_V2.targetRows);
  require_('still reproducible from a reordered pool',
    selectionOrder(again.selected) === order);

  const truthSha = sha(JSON.stringify(sel.selected.map(p => p.row.truth)));
  say(`   truth-key hash                                        ${truthSha}`);

  // ============================================================ 4. governed attachment
  say('');
  say('4. GOVERNED-RECORD ATTACHMENT -- UNCHANGED RULE');
  say('');
  const SNAPSHOT = path.join(os.homedir(), 'Desktop', 'governed-snapshot.csv');
  const snapBuf = fs.readFileSync(SNAPSHOT);
  const snapSha = sha(snapBuf);
  require_('snapshot identity matches §126', snapSha === SNAPSHOT_SHA, snapSha.slice(0, 16) + '...');
  const csv = parseCsv(snapBuf.toString('utf8'));
  const header = csv[0];
  const col = (n: string) => header.indexOf(n);
  const records: GovernedRecord[] = csv.slice(1).map(r => ({
    citation: r[col('citation')], citationKey: r[col('citationKey')], title: r[col('title')],
    approvedText: r[col('approved_text')], reviewState: r[col('reviewState')],
    releaseId: r[col('releaseId')], recordChecksum: r[col('recordChecksum')],
  }));
  require_('64 records, review state untouched',
    records.length === 64 && new Set(records.map(r => r.reviewState)).size === 1,
    [...new Set(records.map(r => r.reviewState))].join(','));

  const G = REQUIRED_CLASS_MINIMUMS.GOVERNED_RECORD_SUPPLIED.minimum;
  const sortedRecords = [...records].sort((a, b) =>
    a.citationKey < b.citationKey ? -1 : a.citationKey > b.citationKey ? 1 : 0);
  const attachment: Array<{ rowId: string; citationKey: string; recordChecksum: string;
    backingState: string }> = [];
  const finalRows: FormalCohortRow[] = sel.selected.map((p, i) => {
    if (i >= G) return p.row;
    const rec = sortedRecords[i];
    const backingState = backingStateFor(rec.reviewState, rec.approvedText);
    attachment.push({ rowId: p.row.source.rowId, citationKey: rec.citationKey,
      recordChecksum: rec.recordChecksum, backingState });
    return { ...p.row, source: { ...p.row.source, governedStandards: [{
      citation: rec.citation, title: rec.title,
      approvedText: rec.approvedText, backingState }] } };
  });
  const attachmentSha = sha(JSON.stringify(attachment));
  require_('40 records attached', attachment.length === G, String(attachment.length));
  require_('no APPROVED_* state was invented',
    attachment.every(a => a.backingState === 'UNAPPROVED_RECORD'));
  say(`   attachment mapping hash                               ${attachmentSha}`);

  // ============================================================ 5. composition
  say('');
  say('5. COMPOSITION -- BY THE AUTHORITATIVE CLASSIFIER');
  say('');
  const problems = finalRows.flatMap(validateCohortRow);
  require_('row contract: 0 problems', problems.length === 0,
    problems.slice(0, 3).map(p => `${p.rowId}:${p.code}`).join(','));
  const missRecallRows = sel.selected.filter(p => p.missRecallOpportunity).length;
  const comp = evaluateComposition(finalRows,
    { DETERMINISTIC_MISS_RECALL_OPPORTUNITY: missRecallRows }, 'minimum');
  const counts: Record<string, number> = {
    DETERMINISTIC_MISS_RECALL_OPPORTUNITY: missRecallRows };
  for (const r of finalRows) for (const c of classifyRow(r)) counts[c] = (counts[c] ?? 0) + 1;
  require_('evaluateComposition: 0 gaps', comp.gaps.length === 0,
    comp.gaps.map(g => `${g.caseClass} -${g.shortfall}`).join(','));
  say('');
  say(`   ${'class'.padEnd(38)} ${'req'.padStart(5)} ${'have'.padStart(5)} ${'margin'.padStart(7)}`);
  for (const [c, r] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    const n = counts[c] ?? 0;
    say(`   ${c.padEnd(38)} ${String(r.minimum).padStart(5)} ${String(n).padStart(5)} `
      + `${String(n - r.minimum).padStart(7)}`);
  }

  // ============================================================ 6. dry run
  say('');
  say('6. DISABLED DRY RUN THROUGH THE REAL PERMANENT PATH');
  say('');
  const disabled = await runFormalCohort(finalRows, {
    mode: 'DISABLED', callCeiling: 0, spendCeilingUsd: 0,
    arms: [...RECOMMENDED_CALL_TOPOLOGY.arms],
    processId: 'proc-freeze-65', nowIso: '2026-09-01T00:00:00.000Z',
  });
  let leaks = 0;
  for (const b of disabled.requestsBuilt) {
    const row = finalRows.find(r => r.source.rowId === b.rowId)!;
    const rendered = `${EXPERT_SYSTEM_PROMPT}\n${buildExpertUserPrompt(b.input)}\n${JSON.stringify(b.input)}`;
    for (const secret of truthOnlyStrings(row)) if (rendered.includes(secret)) leaks += 1;
  }
  require_('195 requests constructed (65 rows x 3 arms)',
    disabled.requestsBuilt.length === 195, String(disabled.requestsBuilt.length));
  require_('TRUTH_LEAK = 0', leaks === 0, String(leaks));
  require_('PROVIDER_INVOCATION_COUNT = 0', providerInvocationCount() === 0,
    String(providerInvocationCount()));
  require_('zero provider requests attempted',
    disabled.accounting.providerRequestsAttempted === 0);

  // ============================================================ 7. identity
  say('');
  say('7. EXECUTION IDENTITY, BOUND INTO THE MANIFEST');
  say('');
  const identity = {
    provider: 'anthropic',
    model: 'claude-sonnet-5',
    promptVersion: EXPERT_PROMPT_VERSION,
    inputContract: EXPERT_INPUT_CONTRACT_VERSION,
    analysisContract: EXPERT_ANALYSIS_CONTRACT_VERSION,
    validator: EXPERT_VALIDATOR_VERSION,
    scorer: EXPERT_SCORER_VERSION,
    measurementContract: EXPERT_MEASUREMENT_CONTRACT_VERSION,
    rowContract: FORMAL_COHORT_ROW_CONTRACT_VERSION,
    harness: EXPERT_COHORT_HARNESS_VERSION,
    projection: 'expert-deterministic-projection.ts (§119, promoted to the permanent path)',
    projectionPermanentPath: 'ENABLED',
  };
  for (const [k, v] of Object.entries(identity)) say(`   ${k.padEnd(30)} ${String(v)}`);
  say('');
  say('   The model is BOUND, not inherited. The harness refuses to issue a request when the');
  say('   provider\'s qualified model differs from the manifest\'s, so EXPERT_ANTHROPIC_MODEL can no');
  say('   longer redirect a formal run. Proven by G.1-G.5 of the execution-budget regression.');

  const promptSha = sha(EXPERT_SYSTEM_PROMPT);
  const hashes = {
    gauntletSourceV1: shaFile(path.join(ROOT, 'safescope-data', 'gauntlets',
      'safescope-gauntlet.source.v1.json')),
    gauntletSeed: shaFile(path.join(ROOT, 'safescope-data', 'gauntlets',
      'safescope-gauntlet.seed.json')),
    realismPackUntouched: shaFile(path.join(ROOT, 'safescope-data', 'benchmarks',
      'safescope-field-realism-pack-v2.v1.json')),
    frozenSupplementalPolicy: shaFile(path.join(ROOT, 'backend', 'scripts', 'lib',
      'expert-cohort-supplemental-policy.ts')),
    governedSnapshot: snapSha,
    systemPrompt: promptSha,
    truthKeys: truthSha,
    governedAttachment: attachmentSha,
    selectionOrder: selectionSha,
  };

  // ============================================================ 8. freeze
  say('');
  say('8. FREEZE DECISION');
  say('');
  if (blockers.length > 0) {
    say('   NOT FROZEN. Blockers:');
    for (const b of blockers) say(`     ${b}`);
    fs.writeFileSync(path.join(OUT, 'FREEZE.txt'), out.join('\n') + '\n');
    say('');
    say('FORMAL_COHORT_FREEZE_BLOCKED');
    process.exit(3);
  }

  const contentSha = sha(JSON.stringify({
    selectionOrder: order, truthSha, attachmentSha, identity,
    budget: FORMAL_EXECUTION_BUDGET, sizePolicy: COHORT_SIZE_POLICY_V2.version,
  }));
  const cohortId = `hazlenz.expert.formal.cohort.65.v1+${contentSha.slice(0, 12)}`;

  const manifest = {
    artifact: 'FORMAL_EXPERT_COHORT_FROZEN',
    cohortId,
    contentSha256: contentSha,
    frozenAtUtc: '2026-09-01T00:00:00Z',
    rowCount: finalRows.length,
    rowOrder: finalRows.map(r => r.source.rowId),
    selectionSha256: selectionSha,
    selectionRule: {
      canonicalOrder: 'source provenance rank, then rowId ascending',
      sourceRank: SOURCE_RANK,
      classPriority: SECONDARY_PRIORITY,
      forcedStructure: sel.bucketSizes,
      forcedBy: '65 = |R| >= |OWED| + |FORBIDDEN| - |both| >= 20 + 48 - 3',
      phases: ['take every OWED-and-FORBIDDEN row (forced)',
        'close each class deficit in frozen class order with the next canonical row',
        'fill each bucket to its forced size in canonical order'],
      reproducibleFromFrozenInputs: true,
    },
    rows: finalRows.map((r, i) => ({
      index: i, rowId: r.source.rowId, source: sel.selected[i].source,
      classes: classifyRow(r),
      missRecallOpportunity: sel.selected[i].missRecallOpportunity,
      truth: r.truth, governedStandards: r.source.governedStandards,
    })),
    sourceProvenance: Object.fromEntries(SOURCE_RANK.map(s =>
      [s, sel.selected.filter(p => p.source === s).length])),
    d86ReserveProvenance: {
      openedAtUtc: '2026-09-01T17:04:34Z',
      scope: 'D86_GAUNTLET_OFFSETS_2_AND_3_ONLY',
      partitionRule: 'D-86: scenarioId CMP ascending, 0-based, m=4, i%4===offset',
      rowsExposed: 74, eligible: 16, usedInCohort:
        sel.selected.filter(p => p.source.startsWith('D-86')).length,
      record: 'verification/expert-hazlenz-d86-reserved-open-2026-09-01/OPENING-RECORD.txt',
      irreversible: true,
    },
    classCounts: counts,
    classMinimums: REQUIRED_CLASS_MINIMUMS,
    unconstrainedClasses: COHORT_CASE_CLASSES.filter(c => !(c in REQUIRED_CLASS_MINIMUMS)),
    governedAttachment: { rule: 'records sorted by citationKey ASCENDING, paired by index to the '
      + 'first 40 rows of the frozen row order', mappingSha256: attachmentSha, mapping: attachment,
      snapshotSha256: snapSha, recordCount: records.length,
      reviewerApprovedGovernedRecords: 0,
      reportedLimitation: 'REVIEWER_APPROVED_GOVERNED_RECORDS = 0; no APPROVED_EXACT backing state '
        + 'is exercisable. A reported limitation, never promoted to a gate.',
      familyRelevanceMatching: false,
      familyRelevanceNote: 'the snapshot carries no hazard-family column; inventing a '
        + 'citation-to-family mapping would author contract that does not exist' },
    executionIdentity: identity,
    executionBudget: {
      plannedLogicalCalls: FORMAL_EXECUTION_BUDGET.plannedLogicalCalls,
      globalRetryRequestBudget: FORMAL_EXECUTION_BUDGET.globalRetryRequestBudget,
      hardProviderRequestCeiling: FORMAL_EXECUTION_BUDGET.hardProviderRequestCeiling,
      hardSpendCeilingUsd: FORMAL_EXECUTION_BUDGET.hardSpendCeilingUsd,
      maxRetriesPerLogicalCall: FORMAL_EXECUTION_BUDGET.maxRetriesPerLogicalCall,
      retryCauses: FORMAL_EXECUTION_BUDGET.retryCauses,
      costMethodology: FORMAL_EXECUTION_BUDGET.costMethodology,
      worstCaseRequestUsd: WORST_CASE_REQUEST_USD,
      requestCeilingEnforcementFormula:
        FORMAL_EXECUTION_BUDGET.requestCeilingEnforcementFormula,
      spendCeilingEnforcementFormula: FORMAL_EXECUTION_BUDGET.spendCeilingEnforcementFormula,
      retryBudgetEnforcementFormula: FORMAL_EXECUTION_BUDGET.retryBudgetEnforcementFormula,
      noMidRunChange: FORMAL_EXECUTION_BUDGET.noMidRunChange,
      ceilingDoesNotAuthorize: FORMAL_EXECUTION_BUDGET.ceilingDoesNotAuthorize,
    },
    stopConditions: [
      'providerRequestsAttempted + 1 > 215 -- checked BEFORE every request, initial and retry',
      'spendUsd + worstCaseRequestUsd > $22.36 -- checked BEFORE every request',
      'retryRequestsAttempted + 1 > 20 -- checked BEFORE every retry request',
      'callsAttempted + 1 > 195 -- the logical-call ceiling',
      'provider or qualified model differs from the frozen identity -- checked BEFORE the first '
        + 'request; the run does not start',
      'a cohort row fails freeze-time validation -- the run stops before any request is built',
    ],
    retryExhaustionClassification: RETRY_EXHAUSTION_CLASSIFICATIONS,
    costModel: {
      source: MEASURED_COST_MODEL.source,
      inputUsdPerMillionTokens: MEASURED_COST_MODEL.inputUsdPerMillionTokens,
      outputUsdPerMillionTokens: MEASURED_COST_MODEL.outputUsdPerMillionTokens,
      observedMeanCostUsd: MEASURED_COST_MODEL.observedMeanCostUsd,
      expectedMeanUsd195: Number((195 * MEASURED_COST_MODEL.observedMeanCostUsd).toFixed(2)),
      worstCaseUsd215: Number((215 * WORST_CASE_REQUEST_USD).toFixed(2)),
    },
    hashes,
    truthLeak: 0,
    providerInvocationCount: 0,
    formalCohortSpent: false,
    p4PrespendAuthorization: false,
    cohortStatus: 'FROZEN',
  };

  const manifestPath = path.join(OUT, 'COHORT-MANIFEST.json');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  const manifestSha = shaFile(manifestPath);
  fs.writeFileSync(path.join(OUT, 'COHORT-MANIFEST.sha256'),
    `${manifestSha}  COHORT-MANIFEST.json\n`);

  say(`   COHORT_ID          ${cohortId}`);
  say(`   contentSha256      ${contentSha}`);
  say(`   MANIFEST_SHA256    ${manifestSha}`);
  say('');
  say('   COHORT_STATUS             = FROZEN');
  say('   PROVIDER_INVOCATION_COUNT = 0');
  say('   FORMAL_COHORT_SPENT       = FALSE');
  say('   P4_PRESPEND_AUTHORIZATION = FALSE');
  say('');
  say('   Freezing is not authorization to spend. A later P4 authorization must name the cohort id,');
  say('   195 planned logical calls, a global retry budget of 20, a hard provider-request ceiling of');
  say('   215 and a hard spend ceiling of $22.36 before the first hosted request.');
  say('');
  say('FORMAL_EXPERT_COHORT_FROZEN -- EXPLICIT_P4_EXECUTION_AUTHORIZATION_REQUIRED');

  fs.writeFileSync(path.join(OUT, 'FREEZE.txt'), out.join('\n') + '\n');
  console.log(`\nwritten to verification/expert-hazlenz-formal-cohort-frozen-2026-09-01/`);
}

main().catch(e => { console.error(e); process.exit(1); });
