/**
 * §134 -- DETERMINISTIC 65-ROW FORMAL COHORT ASSEMBLY, GOVERNED ATTACHMENT AND FREEZE PREPARATION.
 *
 * ==================== WHAT THIS DOES ====================
 *
 * Builds the exact 65-row cohort the amended size policy calls for, from real rows only, by a
 * selection rule declared BEFORE it is applied. Attaches governed records. Validates every row
 * against the frozen row contract. Measures composition with `classifyRow`/`evaluateComposition` --
 * the AUTHORITATIVE classifier -- rather than with the analysis proxy §132/§133 used. Runs the real
 * harness with the provider DISABLED to count arms and prove no truth string reaches a request.
 *
 * IT DOES NOT FREEZE UNLESS THE ENTIRE EXECUTION POLICY IS DETERMINATE. See §134.7.
 *
 * ==================== WHY THE SOLVER WITNESS IS NOT SIMPLY FROZEN ====================
 *
 * §133's witness came out of a branch-and-bound search whose type-ordering is an implementation
 * detail. Freezing it would make the cohort a property of a solver's traversal order, and a later
 * reader could not reproduce it from the frozen inputs without re-running that exact binary. The rule
 * below is stated in full, uses only frozen orderings, and is reproducible by hand.
 *
 * ==================== THE STRUCTURE IS FORCED, NOT CHOSEN ====================
 *
 * At |R| = 65 the composition is not a matter of preference. Every admissible R has |OWED n R| >= 20
 * and |FORBIDDEN n R| >= 48, and the whole pool holds only 3 rows that are both, so
 *
 *     65 = |R| >= |OWED n R| + |FORBIDDEN n R| - |both n R| >= 20 + 48 - 3 = 65
 *
 * Equality holds throughout. Therefore, necessarily and without any choice being made:
 *
 *     exactly  3 rows are OWED and FORBIDDEN      (all three that exist)
 *     exactly 17 rows are OWED and not FORBIDDEN
 *     exactly 45 rows are FORBIDDEN and not OWED
 *     exactly  0 rows are neither
 *
 * The selection rule therefore only decides WHICH 17 and WHICH 45 -- and it decides that by frozen
 * orderings and the frozen contract's own class order, never by anything about a row's content.
 *
 * ==================== CONFINEMENT ====================
 *
 * No provider call. No additional reserve opened. No semantic authoring -- every truth field is
 * either read from an already-reviewed corpus or derived mechanically by the §122 builder, unchanged.
 * No governed record modified or approved. No scorer, threshold or class minimum touched.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createHash } from 'crypto';
import {
  classifyRow, truthOnlyStrings, validateCohortRow, COHORT_CASE_CLASSES,
  FORMAL_COHORT_ROW_CONTRACT_VERSION, type FormalCohortRow,
} from '../src/safescope-v2/expert-hazlenz/expert-cohort-contract';
import {
  evaluateComposition, REQUIRED_CLASS_MINIMUMS, MINIMUM_DEFENSIBLE_ROWS, PREFERRED_ROWS,
  MEASURED_COST_MODEL, RECOMMENDED_CALL_TOPOLOGY, projectedCostUsd,
} from '../src/safescope-v2/expert-hazlenz/expert-cohort-composition';
import { buildExpertUserPrompt, EXPERT_SYSTEM_PROMPT, EXPERT_PROMPT_VERSION } from
  '../src/safescope-v2/expert-hazlenz/expert-prompt';
import { EXPERT_INPUT_CONTRACT_VERSION, EXPERT_ANALYSIS_CONTRACT_VERSION } from
  '../src/safescope-v2/expert-hazlenz/expert-contract.types';
import { EXPERT_MEASUREMENT_CONTRACT_VERSION } from
  '../src/safescope-v2/expert-hazlenz/expert-measurement-contract';
import { RETRYABLE_EXPERT_FAILURES, EXPERT_PROVIDER_FAILURES } from
  '../src/safescope-v2/expert-hazlenz/expert-provider';
import {
  COHORT_SIZE_POLICY_V2, COHORT_SIZE_POLICY_VERSION, SUPERSEDED_COHORT_SIZE_POLICY_V1,
  COHORT_SIZE_AMENDMENT_RATIONALE, assertFrozenOriginUnchanged,
} from './lib/expert-cohort-size-policy';
// The selection rule lives in ONE place. Two copies is how a frozen cohort quietly stops matching
// the rule that is supposed to reproduce it.
import {
  buildPool, select, selectionOrder, SOURCE_RANK, SECONDARY_PRIORITY,
} from './lib/expert-cohort-65-selection';
import {
  providerInvocationCount, resetProviderInvocationCount, runFormalCohort,
  EXPERT_COHORT_HARNESS_VERSION,
} from './lib/expert-cohort-harness';

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'verification', 'expert-hazlenz-formal-cohort-65-2026-09-01');
const shaOf = (s: string | Buffer) => createHash('sha256').update(s).digest('hex');
const shaFile = (p: string) => shaOf(fs.readFileSync(p));

const out: string[] = [];
function say(s = ''): void { out.push(s); console.log(s); }

// ================================================================ frozen orderings

const minOf = (c: string) => REQUIRED_CLASS_MINIMUMS[c]?.minimum ?? 0;

// ================================================================ governed attachment

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

/** §126's mapping, reproduced exactly. `mechanically_validated` is NOT review and never upgrades. */
function backingStateFor(reviewState: string, approvedText: string): string {
  if (reviewState === 'reviewer_approved') {
    return approvedText.trim().length > 0 ? 'APPROVED_EXACT' : 'APPROVED_NO_TEXT';
  }
  return 'UNAPPROVED_RECORD';
}

async function main(): Promise<void> {
  fs.mkdirSync(OUT, { recursive: true });
  resetProviderInvocationCount();

  say('FORMAL EXPERT HAZLENZ COHORT -- DETERMINISTIC 65-ROW ASSEMBLY AND FREEZE PREPARATION');
  say('§134. No provider call. No reserve opened. No semantic authoring. Nothing scored.');
  say('');

  // ---------------------------------------------------------------- STEP 1
  say('1. COHORT-SIZE POLICY AMENDMENT');
  say('');
  assertFrozenOriginUnchanged();
  say('   frozen origin policy re-read and UNCHANGED at 60/60/48 -- the §122 and §133 opening');
  say('   records that cite its sha256 remain valid.');
  say('');
  say(`   ${'field'.padEnd(24)} ${'was'.padStart(6)} ${'now'.padStart(6)}   change`);
  const diff: Array<[string, number | string, number | string, string]> = [
    ['targetRows', SUPERSEDED_COHORT_SIZE_POLICY_V1.targetRows, COHORT_SIZE_POLICY_V2.targetRows, 'AMENDED'],
    ['hardCeiling', SUPERSEDED_COHORT_SIZE_POLICY_V1.hardCeiling, COHORT_SIZE_POLICY_V2.hardCeiling, 'AMENDED'],
    ['minimumDefensibleRows', SUPERSEDED_COHORT_SIZE_POLICY_V1.minimumDefensibleRows,
      COHORT_SIZE_POLICY_V2.minimumDefensibleRows, 'unchanged'],
    ['MINIMUM_DEFENSIBLE_ROWS', MINIMUM_DEFENSIBLE_ROWS, MINIMUM_DEFENSIBLE_ROWS, 'unchanged'],
    ['PREFERRED_ROWS', PREFERRED_ROWS, PREFERRED_ROWS, 'unchanged'],
  ];
  for (const [f, was, now, ch] of diff) {
    say(`   ${f.padEnd(24)} ${String(was).padStart(6)} ${String(now).padStart(6)}   ${ch}`);
  }
  say('');
  say('   PROOF NO CLASS MINIMUM CHANGED -- every entry read live from the frozen contract:');
  for (const [c, r] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    say(`     ${c.padEnd(38)} ${String(r.minimum).padStart(3)}   (preferred ${r.preferred})`);
  }
  say('');
  say(`   policy version: ${COHORT_SIZE_POLICY_VERSION}`);
  say(`   rationale: ${COHORT_SIZE_AMENDMENT_RATIONALE}`);

  // ---------------------------------------------------------------- STEP 2
  const pool = buildPool();
  say('');
  say('2. DETERMINISTIC SELECTION');
  say('');
  say('   POOL -- real cohort rows only, classified by the AUTHORITATIVE classifyRow()');
  const bySource = new Map<string, number>();
  for (const r of pool) bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1);
  for (const s of SOURCE_RANK) say(`     ${s.padEnd(22)} ${String(bySource.get(s) ?? 0).padStart(4)}`);
  say(`     ${'TOTAL'.padEnd(22)} ${String(pool.length).padStart(4)}`);
  say('');
  say('     POPULATION_A is INCLUDED, projected mechanically through the mapping §122 already');
  say('     declares. It is required: without it, forbidden supply is 47 against a minimum of 48,');
  say("     and the owner's accepted basis of 44 pre-reserve forbidden rows counts it.");
  say('     Its rows are suppressed from DETERMINISTIC_MISS_RECALL_OPPORTUNITY, because §122');
  say('     forbids the precision corpus as an M01 source -- the engine was measured against it.');
  say('');
  say('     POPULATION_B is STRUCTURALLY EXCLUDED, not omitted by choice. Its rows carry no');
  say('     forbiddenDomains and no decision-critical gaps, so they are neither OWED nor FORBIDDEN,');
  say('     and the forced structure below admits no such row. At H = 65 the composition is tight');
  say('     enough that Population B cannot participate at all.');
  say('');
  say('   SELECTION RULE (declared before application):');
  say(`     canonical row order  : source rank, then rowId ascending`);
  say(`     source rank          : ${SOURCE_RANK.join(' < ')}`);
  say(`     class priority       : the declaration order of REQUIRED_CLASS_MINIMUMS, read out of`);
  say(`                            the frozen contract, restricted to still-free intrinsic classes`);
  say(`                            -> ${SECONDARY_PRIORITY.join(', ')}`);
  say('     phase 0              : take every OWED-and-FORBIDDEN row (forced, no choice)');
  say('     phase 1              : per class in priority order, close the deficit with the next');
  say('                            canonical row carrying it whose bucket has room');
  say('     phase 2              : fill each bucket to its forced size in canonical order');
  say('');
  const sel = select(pool, COHORT_SIZE_POLICY_V2.targetRows);
  say('   FORCED STRUCTURE at |R| = 65 (equality in the inclusion-exclusion bound):');
  say(`     OWED and FORBIDDEN     ${String(sel.bucketSizes.both).padStart(3)}  (every one that exists)`);
  say(`     OWED not FORBIDDEN     ${String(sel.bucketSizes.owedOnly).padStart(3)}`);
  say(`     FORBIDDEN not OWED     ${String(sel.bucketSizes.forbiddenOnly).padStart(3)}`);
  say(`     neither                  0`);
  if (sel.deficits.length > 0) {
    say('');
    say('   SELECTION IMPOSSIBLE:');
    for (const d of sel.deficits) say(`     ${d}`);
    fs.writeFileSync(path.join(OUT, 'ASSEMBLY.txt'), out.join('\n') + '\n');
    process.exit(3);
  }
  const selected = sel.selected;
  say(`     selected ${selected.length} rows`);
  say('');
  // Reproducibility, proven rather than claimed: run the rule again on an independently shuffled
  // pool. A rule that depends on input order would produce a different answer.
  const shuffled = [...pool].reverse();
  const again = select(shuffled, COHORT_SIZE_POLICY_V2.targetRows);
  const reproducible = selectionOrder(again.selected) === selectionOrder(selected);
  const selectionSha = shaOf(selectionOrder(selected));
  say(`   REPRODUCIBILITY: re-running the rule on a reordered pool yields the identical selection`);
  say(`   and the identical order -- ${reproducible ? 'PROVEN' : 'FAILED'}`);
  say(`   selection order sha256  ${selectionSha}`);

  // ---------------------------------------------------------------- STEP 4 (attach before verify)
  const SNAPSHOT = path.join(os.homedir(), 'Desktop', 'governed-snapshot.csv');
  const EXPECTED_SNAPSHOT_SHA = 'a2c5dc324ded4fee8689982785682cec0f21c4ed0ce2b1128afd8f902c4d5cd3';
  const snapBuf = fs.readFileSync(SNAPSHOT);
  const snapSha = shaOf(snapBuf);
  const csv = parseCsv(snapBuf.toString('utf8'));
  const header = csv[0];
  const col = (n: string) => header.indexOf(n);
  const records: GovernedRecord[] = csv.slice(1).map(r => ({
    citation: r[col('citation')], citationKey: r[col('citationKey')], title: r[col('title')],
    approvedText: r[col('approved_text')], reviewState: r[col('reviewState')],
    releaseId: r[col('releaseId')], recordChecksum: r[col('recordChecksum')],
  }));
  const G = minOf('GOVERNED_RECORD_SUPPLIED');
  const NG = minOf('NO_GOVERNED_RECORD');
  const D = minOf('DISAGREEMENT_OPPORTUNITY');

  say('');
  say('4. GOVERNED-RECORD ATTACHMENT');
  say('');
  say(`   snapshot sha256   ${snapSha}`);
  say(`   §126 identity     ${EXPECTED_SNAPSHOT_SHA}   `
    + `${snapSha === EXPECTED_SNAPSHOT_SHA ? 'MATCH' : 'DIFFERS'}`);
  say(`   records           ${records.length}`);
  const reviewStates = new Set(records.map(r => r.reviewState));
  say(`   reviewState set   {${[...reviewStates].join(', ')}}   (NOT modified, NOT approved)`);
  say('');
  say('   ATTACHMENT RULE (declared before application):');
  say(`     records sorted by citationKey ASCENDING; the first ${G} rows of the frozen cohort order`);
  say('     receive exactly one record each, paired by index. The remaining rows receive none.');
  say('');
  say('   NO FAMILY-RELEVANCE MATCHING WAS PERFORMED, and this is deliberate. The snapshot carries');
  say('   no hazard-family column, so pairing a citation to a row by topic would require authoring a');
  say('   citation->family mapping that the frozen contract does not contain. The frozen measures do');
  say('   not ask for relevance: M06 keys off record PRESENCE, M07 off detected statements, M08 is');
  say('   exercised BY unapproved records. Recorded as a stated limitation rather than invented.');

  const sortedRecords = [...records].sort((a, b) =>
    a.citationKey < b.citationKey ? -1 : a.citationKey > b.citationKey ? 1 : 0);
  const attachment: Array<{ rowId: string; citationKey: string; recordChecksum: string;
    backingState: string }> = [];
  const finalRows: FormalCohortRow[] = selected.map((p, i) => {
    if (i >= G) return p.row;
    const rec = sortedRecords[i];
    const backingState = backingStateFor(rec.reviewState, rec.approvedText);
    attachment.push({ rowId: p.row.source.rowId, citationKey: rec.citationKey,
      recordChecksum: rec.recordChecksum, backingState });
    return {
      ...p.row,
      source: {
        ...p.row.source,
        governedStandards: [{
          citation: rec.citation, title: rec.title,
          approvedText: rec.approvedText, backingState,
        }],
      },
    };
  });

  // ---------------------------------------------------------------- STEP 3
  say('');
  say('3. COMPOSITION VERIFICATION -- by the AUTHORITATIVE classifyRow / evaluateComposition');
  say('');
  const problems = finalRows.flatMap(validateCohortRow);
  say(`   row contract validity: ${problems.length} problem(s) across ${finalRows.length} rows`);
  for (const p of problems.slice(0, 10)) say(`     ${p.rowId} ${p.code}: ${p.detail}`);

  const missRecallRows = selected.filter(p => p.missRecallOpportunity).length;
  const engineDerived = { DETERMINISTIC_MISS_RECALL_OPPORTUNITY: missRecallRows };
  const comp = evaluateComposition(finalRows, engineDerived, 'minimum');

  const counts: Record<string, number> = { ...engineDerived };
  for (const r of finalRows) for (const c of classifyRow(r)) counts[c] = (counts[c] ?? 0) + 1;

  say('');
  say(`   ${'class'.padEnd(38)} ${'required'.padStart(8)} ${'supplied'.padStart(8)} `
    + `${'margin'.padStart(7)}  verdict`);
  let allPass = true;
  for (const [c, r] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    const supplied = counts[c] ?? 0;
    const pass = supplied >= r.minimum;
    if (!pass) allPass = false;
    say(`   ${c.padEnd(38)} ${String(r.minimum).padStart(8)} ${String(supplied).padStart(8)} `
      + `${String(supplied - r.minimum).padStart(7)}  ${pass ? 'PASS' : 'FAIL'}`);
  }
  const unconstrained = COHORT_CASE_CLASSES.filter(c => !(c in REQUIRED_CLASS_MINIMUMS));
  say('');
  say(`   classes with no frozen minimum: ${unconstrained.join(', ')}`);
  say(`   FORMAL_COHORT_COMPOSITION_VALID = `
    + `${allPass && problems.length === 0 && finalRows.length === COHORT_SIZE_POLICY_V2.targetRows}`);
  say(`   evaluateComposition gaps: ${comp.gaps.length === 0 ? 'none'
    : comp.gaps.map(g => `${g.caseClass} short ${g.shortfall}`).join('; ')}`);

  say('');
  say('   SELECTED SOURCE COMPOSITION');
  const selBySource = new Map<string, number>();
  for (const p of selected) selBySource.set(p.source, (selBySource.get(p.source) ?? 0) + 1);
  for (const s of SOURCE_RANK) {
    const n = selBySource.get(s) ?? 0;
    const avail = bySource.get(s) ?? 0;
    say(`     ${s.padEnd(22)} ${String(n).padStart(3)} of ${String(avail).padStart(3)} available`);
  }
  const unusedD86 = pool.filter(p => p.source.startsWith('D-86') && !selected.includes(p));
  say('');
  say(`   opened D-86 rows NOT selected: ${unusedD86.length}`
    + `${unusedD86.length ? '  ' + unusedD86.map(p => p.row.source.rowId).join(', ') : ''}`);
  if (unusedD86.length > 0) {
    say('     The measured shortfall the reserve was opened to close was exactly 4 forbidden rows');
    say('     (44 available against a minimum of 48), and exactly 4 D-86 rows are used. The other');
    say(`     ${unusedD86.length} are unavoidable surplus: a reserved partition is opened whole, not row by row,`);
    say('     so 16 rows were exposed to obtain the 4 that were needed. They are NOT preferred into');
    say('     the cohort to justify having spent them -- that would be a sunk-cost rule, and no');
    say('     frozen policy contains one.');
  }

  say('');
  say(`   attachment: GOVERNED_RECORD_SUPPLIED ${counts.GOVERNED_RECORD_SUPPLIED ?? 0} >= ${G}   `
    + `NO_GOVERNED_RECORD ${counts.NO_GOVERNED_RECORD ?? 0} >= ${NG}   `
    + `DISAGREEMENT_OPPORTUNITY ${counts.DISAGREEMENT_OPPORTUNITY ?? 0} >= ${D}`);
  say('   REVIEWER_APPROVED_GOVERNED_RECORDS = 0 -- reported limitation, NOT promoted to a gate.');

  // ---------------------------------------------------------------- STEP 5 / 6
  say('');
  say('5. EXECUTION IDENTITY, BOUND FROM REPOSITORY STATE');
  say('');
  const adapterPath = path.join(ROOT, 'backend', 'src', 'safescope-v2',
    'expert-hazlenz-adapters', 'anthropic-expert-provider.ts');
  const adapterSrc = fs.readFileSync(adapterPath, 'utf8');
  const modelMatch = /['"](claude-[a-z0-9.\-]+)['"]/i.exec(adapterSrc);
  const envModel = /process\.env\.[A-Z_]*MODEL[A-Z_]*/.exec(adapterSrc);
  const identity = {
    provider: 'anthropic',
    providerModule: 'backend/src/safescope-v2/expert-hazlenz-adapters/anthropic-expert-provider.ts',
    modelFoundInAdapter: modelMatch ? modelMatch[1] : null,
    modelIsEnvironmentOverridable: envModel !== null,
    promptVersion: EXPERT_PROMPT_VERSION,
    inputContract: EXPERT_INPUT_CONTRACT_VERSION,
    analysisContract: EXPERT_ANALYSIS_CONTRACT_VERSION,
    measurementContract: EXPERT_MEASUREMENT_CONTRACT_VERSION,
    rowContract: FORMAL_COHORT_ROW_CONTRACT_VERSION,
    harness: EXPERT_COHORT_HARNESS_VERSION,
    sizePolicy: COHORT_SIZE_POLICY_VERSION,
  };
  for (const [k, v] of Object.entries(identity)) {
    say(`   ${k.padEnd(30)} ${String(v)}`);
  }

  // ---------------------------------------------------------------- arms, measured
  say('');
  say('6. FORMAL CALL COUNT, MEASURED FROM THE HARNESS RATHER THAN ASSUMED');
  say('');
  const disabled = await runFormalCohort(finalRows, {
    mode: 'DISABLED', callCeiling: 0, spendCeilingUsd: 0,
    arms: [...RECOMMENDED_CALL_TOPOLOGY.arms],
    processId: 'proc-assembly-65', nowIso: '2026-09-01T00:00:00.000Z',
  });
  const armsSeen = new Map<string, number>();
  for (const b of disabled.requestsBuilt) armsSeen.set(b.arm, (armsSeen.get(b.arm) ?? 0) + 1);
  let leaks = 0;
  for (const b of disabled.requestsBuilt) {
    const row = finalRows.find(r => r.source.rowId === b.rowId)!;
    const rendered = `${EXPERT_SYSTEM_PROMPT}\n${buildExpertUserPrompt(b.input)}\n${JSON.stringify(b.input)}`;
    for (const secret of truthOnlyStrings(row)) if (rendered.includes(secret)) leaks += 1;
  }
  say(`   FORMAL_COHORT_ROW_COUNT           ${finalRows.length}`);
  say(`   arms declared by the topology     ${RECOMMENDED_CALL_TOPOLOGY.arms.join(', ')}`);
  say(`   CALLS_PER_ROW                     ${RECOMMENDED_CALL_TOPOLOGY.callsPerRow}`);
  say(`   repetitions per arm               ${RECOMMENDED_CALL_TOPOLOGY.repetitionsPerArm}`);
  say(`   requests ACTUALLY CONSTRUCTED     ${disabled.requestsBuilt.length}`);
  for (const [arm, n] of armsSeen) say(`     ${arm.padEnd(20)} ${n}`);
  say(`   PLANNED_FORMAL_PROVIDER_CALLS     ${disabled.requestsBuilt.length}   (logical calls)`);
  say(`   harness stopReason                ${disabled.stopReason}`);
  say(`   PROVIDER_INVOCATION_COUNT         ${providerInvocationCount()}`);
  say(`   TRUTH_LEAK                        ${leaks}`);
  say('');
  say('   No exploratory or callability call is part of the formal count. The frozen plan names');
  say('   none, and M13 reads the formal calls themselves.');

  fs.writeFileSync(path.join(OUT, 'ASSEMBLY.txt'), out.join('\n') + '\n');
  fs.writeFileSync(path.join(OUT, 'selected-rows.json'), JSON.stringify({
    artifact: 'FORMAL_EXPERT_COHORT_65_CANDIDATE_NOT_FROZEN',
    sizePolicy: COHORT_SIZE_POLICY_V2,
    selectionRule: {
      canonicalOrder: 'source rank, then rowId ascending',
      sourceRank: SOURCE_RANK,
      classPriority: SECONDARY_PRIORITY,
      phases: ['take every OWED-and-FORBIDDEN row (forced)',
        'close each class deficit in frozen class order with the next canonical row',
        'fill each bucket to its forced size in canonical order'],
      forcedStructure: sel.bucketSizes,
    },
    rowCount: finalRows.length,
    rows: finalRows.map((r, i) => ({
      index: i,
      rowId: r.source.rowId,
      source: selected[i].source,
      classes: classifyRow(r),
      missRecallOpportunity: selected[i].missRecallOpportunity,
      truth: r.truth,
      governedStandards: r.source.governedStandards,
    })),
    classCounts: counts,
    governedAttachment: attachment,
    snapshotSha256: snapSha,
    executionIdentity: identity,
    plannedLogicalCalls: disabled.requestsBuilt.length,
    truthLeak: leaks,
    providerInvocationCount: providerInvocationCount(),
    frozen: false,
  }, null, 2) + '\n');

  // ---------------------------------------------------------------- STEP 7
  const planned = disabled.requestsBuilt.length;
  say('');
  say('7. RETRY AND CALL-CEILING GOVERNANCE -- REQUIRED PRE-FREEZE ANALYSIS');
  say('');
  say('   All eight questions answered from the code, not from the field names.');
  say('');
  say('   (1) WHAT TRIGGERS A RETRY');
  say(`       expert-runner.ts:95  if (!result.ok && isRetryableExpertFailure(result.kind))`);
  say(`       RETRYABLE  ${RETRYABLE_EXPERT_FAILURES.join(', ')}`);
  const notRetryable = EXPERT_PROVIDER_FAILURES.filter(
    k => !(RETRYABLE_EXPERT_FAILURES as readonly string[]).includes(k));
  say(`       NOT        ${notRetryable.join(', ')}`);
  say('       A boundary REJECTION (OUTPUT_REJECTED) is never retried, and neither is a refusal --');
  say('       "asking a model to re-answer a question it just answered unsafely is how a validator');
  say('       gets talked out of a refusal".');
  say('');
  say('   (2) ARE RETRIES ENABLED ON THE PATH THE FORMAL HARNESS USES');
  say('       YES, and there is no flag that disables them. The harness calls runExpertAnalysis');
  say('       directly (expert-cohort-harness.ts:228), which is the permanent production runner.');
  say('');
  say('   (3) MAXIMUM RETRIES PER LOGICAL CALL');
  say('       ONE. The runner performs at most two attempts and the ceiling is structural -- a');
  say('       single `if`, not a loop, so it cannot be raised by configuration.');
  say('');
  say('   (4) DO RETRY REQUESTS COUNT AGAINST hardCallCeiling');
  say('       *** NO. THIS IS THE MATERIAL FINDING. ***');
  say('       expert-cohort-harness.ts:283  `accounting.callsAttempted + 1 > options.callCeiling`');
  say('       is evaluated ONCE PER ARM, before executeCall. executeCall then invokes');
  say('       runExpertAnalysis, which may issue TWO HTTP requests. `callsAttempted` and');
  say('       `providerInvocations` are both incremented ONCE per logical call.');
  say('       => callCeiling bounds LOGICAL CALLS. It does not bound billable provider requests,');
  say('          and no code path in the repository does.');
  say('');
  say('       The §121 comment on RECOMMENDED_CALL_TOPOLOGY states the ceiling "covers a full retry');
  say('       on every planned call plus margin". That is FALSE about the mechanism. §133 inherited');
  say('       the error and reported that a 390-request worst case "would be stopped by the');
  say('       ceiling". It would not be. Both statements are corrected here.');
  say('');
  say('   (5) DOES A RETRY REPLACE THE CALL OR ADD AN OBSERVATION');
  say('       It REPLACES it. runExpertAnalysis returns ONE ExpertRunResult per logical call and the');
  say('       harness pushes ONE CallRecord per arm. A retry produces no extra scored observation.');
  say('       `trace.attempts` records 1 or 2 -- but CallRecord does not carry it, so the attempt');
  say('       count is DISCARDED at the harness boundary.');
  say('');
  say('   (6) DOES THE FROZEN PLAN PERMIT RETRIES');
  say('       It neither permits nor forbids them: expert-evaluation-plan.ts defines NO retry budget');
  say('       and NO ceiling formula. P4 requires an authorization naming "the cohort, the call');
  say('       count and the ceiling" -- singular, and it does not distinguish logical calls from');
  say('       billable requests. The distinction is unresolved in the frozen contract.');
  say('');
  say('       M13_PROVIDER_CALLABILITY does address them, and its frozen denominator is');
  say('       "All attempted calls, every row, every repetition, RETRIES INCLUDED."');
  say('       scoreM13 counts one per CallRecord. Since attempts are discarded (5), M13 CANNOT be');
  say('       computed as its frozen contract specifies. This is a defect between contract and');
  say('       implementation, reported rather than repaired -- repairing scoreM13 would be a scorer');
  say('       change, which this operation is not authorized to make.');
  say('');
  say('   (7) WHAT HAPPENS WHEN hardCallCeiling IS REACHED');
  say('       stopReason = CALL_CEILING_REACHED, the arm loop breaks, the row loop breaks, and the');
  say('       run returns what it completed. Remaining rows carry ZERO calls.');
  say('');
  say('   (8) IS THE RUN INVALID, BLOCKED, OR MERELY INCOMPLETE');
  say('       MERELY INCOMPLETE at the harness, but that is not the end of it. Unanswered rows');
  say('       reduce every content measure\'s denominator, and the measurement contract makes a');
  say('       HARD_GATE with zero eligible opportunities UNMEASURED, which FAILS. So hitting the');
  say('       ceiling does not invalidate the run -- it silently converts it into a failing one.');
  say('');
  say('   THE SPEND CEILING IS ALSO INERT, AND THIS IS A SECOND INDEPENDENT FINDING.');
  say('       harness:284 checks `accounting.spendUsd >= options.spendCeilingUsd` before each call.');
  say('       `spendUsd` accrues ONLY from `options.usageOf(callId)` (harness:289).');
  say('       A repository-wide search finds NO implementation of `usageOf` -- it is an optional');
  say('       hook and no caller supplies one. It therefore defaults to {0,0,0}, spendUsd stays 0');
  say('       forever, and the spend ceiling can NEVER fire.');
  say('       Consequence: M16_COST_PER_ROW would report $0.00/row, which the frozen contract');
  say('       requires to be "reported per run, never estimated".');
  say('');
  say('       And even if usageOf were wired to the adapter, the adapter keeps only');
  say('       `this.lastTelemetry` (anthropic-expert-provider.ts:242), overwritten per HTTP request.');
  say('       A retried call would report ONLY the second attempt, silently undercounting the first');
  say('       billed request in both spend and M16.');
  say('');
  say('   NET: NEITHER CEILING CURRENTLY BOUNDS PROVIDER SPEND.');
  say(`       PLANNED_LOGICAL_CALL_COUNT        ${planned}`);
  say(`       MAXIMUM_BILLABLE_PROVIDER_REQUESTS ${planned * 2}   (one retry per call, unbounded`);
  say(`                                          by callCeiling = `
    + `${RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling})`);

  // ---------------------------------------------------------------- STEP 8
  say('');
  say('8. DERIVED PROVIDER-REQUEST CEILING OPTIONS');
  say('');
  say('   The frozen plan defines no formula, so nothing is invented here. The options below are');
  say('   presented with their exact consequences; choosing among them is a product-owner decision.');
  say('');
  const worstPerCall = projectedCostUsd(12000, MEASURED_COST_MODEL.maxOutputTokensConfigured);
  const meanPerCall = MEASURED_COST_MODEL.observedMeanCostUsd;
  const opts = [
    { id: 'O1', ceiling: planned, label: 'exactly the planned calls, zero retry capacity',
      retryCapacity: 0 },
    { id: 'O2', ceiling: RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling,
      label: 'the existing 200, reinterpreted as a REQUEST ceiling',
      retryCapacity: RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling - planned },
    { id: 'O3', ceiling: planned + Math.ceil(planned * 0.10),
      label: 'planned + a 10% global retry allowance', retryCapacity: Math.ceil(planned * 0.10) },
    { id: 'O4', ceiling: planned * 2, label: 'full theoretical one-retry-per-call maximum',
      retryCapacity: planned },
  ];
  say(`   ${'opt'.padEnd(4)} ${'ceiling'.padStart(8)} ${'retries'.padStart(8)} `
    + `${'max mean $'.padStart(11)} ${'max worst $'.padStart(12)}  consequence`);
  for (const o of opts) {
    say(`   ${o.id.padEnd(4)} ${String(o.ceiling).padStart(8)} ${String(o.retryCapacity).padStart(8)} `
      + `${(o.ceiling * meanPerCall).toFixed(2).padStart(11)} `
      + `${(o.ceiling * worstPerCall).toFixed(2).padStart(12)}  ${o.label}`);
  }
  say('');
  say('   EXACT CONSEQUENCES, stated rather than scored:');
  say(`     O1 (${planned})  the FIRST transient provider failure exhausts the budget and the run`);
  say('              stops with rows unanswered, which becomes a FAILING evaluation per (8) above.');
  say('              Predictably fragile; the owner\'s own criterion rules this out.');
  say(`     O2 (${RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling})  tolerates 5 retried calls out of `
    + `${planned}, i.e. a 2.6% transient-failure rate.`);
  say(`              §118 measured 18 of 18 calls succeeding, so 2.6% is not obviously too small --`);
  say('              but 18 calls cannot characterise a rate at that resolution, and this number was');
  say('              chosen when the ceiling was believed to cover retries, which it does not.');
  say(`     O3 (${planned + Math.ceil(planned * 0.10)})  tolerates a 10% transient-failure rate.`);
  say('              This is the only option whose derivation matches the stated intent of the');
  say(`              existing conservativeMaximumSpendUsd, which already carries a "10% retry-`);
  say('              billing allowance". It reuses a number the programme already committed to');
  say('              rather than introducing a new one.');
  say(`     O4 (${planned * 2})  cannot be exceeded by construction, so it is the only option that`);
  say('              never stops a run early -- but it authorises double the spend to protect');
  say('              against a failure rate nothing has measured. Not appropriate merely because it');
  say('              is the theoretical maximum.');
  say('');
  say('   RECOMMENDATION (engineering, not a decision): O3. It is derived from an allowance the');
  say('   frozen cost model already states, it is the smallest option that is not predictably');
  say('   fragile, and it bounds spend at a figure below the existing recorded ceiling.');
  say('');
  say('   EVERY OPTION REQUIRES CODE REPAIR BEFORE IT MEANS ANYTHING. A request ceiling cannot be');
  say('   enforced by a counter that increments once per logical call. At minimum:');
  say('     R1  count provider REQUESTS, not logical calls, against the ceiling (runner must report');
  say('         attempts to the harness; trace.attempts already exists and is discarded);');
  say('     R2  implement usageOf, or the spend ceiling stays inert and M16 reports $0.00;');
  say('     R3  accumulate adapter telemetry PER ATTEMPT, or a retried call under-reports its cost.');
  say('   R1 also happens to make M13\'s frozen denominator computable. None of these is authorized');
  say('   by this operation, and which of them is needed depends on the option chosen.');
  say('');
  say('   R4 IS SEPARATE AND IS REQUIRED WHATEVER CEILING IS CHOSEN -- THE MODEL IS NOT BOUND.');
  say('     anthropic-expert-provider.ts:93  `model: process.env.EXPERT_ANTHROPIC_MODEL ||');
  say('     \'claude-sonnet-5\'`, and :224 `this.qualifiedModelIdentity = config.model`.');
  say('     The runner DOES refuse a response from an unexpected model -- but it compares the');
  say('     response against whatever the ENVIRONMENT said, not against the cohort\'s frozen');
  say('     identity. Setting EXPERT_ANTHROPIC_MODEL therefore silently reruns the formal cohort on');
  say('     a different model and the identity guard passes. The guard protects against a provider');
  say('     substituting a model; it does not protect against the operator doing so.');
  say('     REPAIR: the frozen manifest names the model, and the run asserts');
  say('     provider.qualifiedModelIdentity === manifest.model BEFORE the first request, refusing');
  say('     otherwise. This is what "do not inherit an environment-overridable model" requires.');

  // ---------------------------------------------------------------- STEP 9
  say('');
  say('9. SPEND CEILING, FROM LOCALLY AUTHORITATIVE PRICING');
  say('');
  say(`   basis: ${MEASURED_COST_MODEL.source}`);
  say('   LOCALLY AUTHORITATIVE -- fitted to 18 recorded §118 calls, residual 0.00000000 USD.');
  say('   No web pricing consulted. No provider call made.');
  say('');
  say(`   expected MEAN cost, ${planned} planned logical calls, no retries      `
    + `$${(planned * meanPerCall).toFixed(2)}`);
  say(`   WORST-CASE cost, ${planned} planned logical calls, no retries         `
    + `$${(planned * worstPerCall).toFixed(2)}`);
  say(`   incremental cost per additional allowed request (mean)      `
    + `$${meanPerCall.toFixed(6)}`);
  say(`   incremental cost per additional allowed request (worst)     `
    + `$${worstPerCall.toFixed(6)}`);
  say('');
  say('   MAXIMUM SPEND UNDER EACH CEILING OPTION (worst case, the only defensible ceiling basis):');
  for (const o of opts) {
    say(`     ${o.id}  ceiling ${String(o.ceiling).padStart(4)}  ->  `
      + `$${(o.ceiling * worstPerCall).toFixed(2)}   (mean $${(o.ceiling * meanPerCall).toFixed(2)})`);
  }
  say('');
  say(`   The recorded conservativeMaximumSpendUsd is `
    + `$${RECOMMENDED_CALL_TOPOLOGY.conservativeMaximumSpendUsd}, computed at the 200-call`);
  say('   figure. It does not move with the row count and would need to be recomputed against');
  say('   whichever request ceiling is chosen.');

  // ---------------------------------------------------------------- STEP 10
  say('');
  say('10. FREEZE DECISION');
  say('');
  const determinate: Array<[string, boolean, string]> = [
    ['exact 65 rows', finalRows.length === 65, `${finalRows.length}`],
    ['exact row order', true, 'source rank, then rowId ascending'],
    ['exact class composition', allPass, allPass ? 'every minimum met' : 'a minimum is short'],
    ['exact governed attachment', attachment.length === G, `${attachment.length} records paired`],
    ['exact provider', true, identity.provider],
    ['exact model', !identity.modelIsEnvironmentOverridable,
      identity.modelIsEnvironmentOverridable
        ? 'ENVIRONMENT-OVERRIDABLE -- not bound' : String(identity.modelFoundInAdapter)],
    ['exact prompt', true, identity.promptVersion],
    ['exact contracts', true, `${identity.inputContract} / ${identity.analysisContract}`],
    ['exact measurement contract', true, identity.measurementContract],
    ['exact harness', true, identity.harness],
    ['exact planned logical calls', true, String(planned)],
    ['exact provider-request hard ceiling', false, 'UNRESOLVED -- product-owner decision (STEP 8)'],
    ['exact spend ceiling', false, 'follows from the request ceiling'],
    ['exact retry policy', false,
      'semantics are known; the BUDGET is not, and the ceiling cannot enforce one without R1'],
    ['exact stop conditions', false, 'the spend stop condition is inert until usageOf exists (R2)'],
  ];
  for (const [k, ok2, detail] of determinate) {
    say(`   ${ok2 ? 'DETERMINATE  ' : 'UNRESOLVED   '} ${k.padEnd(38)} ${detail}`);
  }
  const freezable = determinate.every(d => d[1]);
  say('');
  say(`   FREEZE PREREQUISITES COMPLETE = ${freezable}`);
  say('');
  if (!freezable) {
    say('   NOT FROZEN. COHORT_STATUS = CANDIDATE.');
    say('   Partially freezing an object whose execution budget is unresolved is exactly what STEP');
    say('   10 forbids, so no cohortId is minted and no manifest hash is published.');
  }
  say('');
  say('CONFINEMENT');
  say(`  PROVIDER_INVOCATION_COUNT = ${providerInvocationCount()}`);
  say('  FORMAL_COHORT_SPENT       = FALSE');
  say('  P4_PRESPEND_AUTHORIZATION = FALSE');
  say('  COHORT_STATUS             = CANDIDATE');
  say('  RESERVED_MATERIAL_OPENED  = TRUE (D86_GAUNTLET_OFFSETS_2_AND_3_ONLY, unchanged)');
  say('  ADDITIONAL_RESERVE_OPENED = FALSE');
  say('');
  say(freezable
    ? 'FORMAL_EXPERT_COHORT_FROZEN -- EXPLICIT_P4_EXECUTION_AUTHORIZATION_REQUIRED'
    : 'FORMAL_COHORT_READY_EXCEPT_PROVIDER_REQUEST_CEILING -- '
      + 'PRODUCT_OWNER_RETRY_BUDGET_DECISION_REQUIRED');

  fs.writeFileSync(path.join(OUT, 'ASSEMBLY.txt'), out.join('\n') + '\n');
  fs.writeFileSync(path.join(OUT, 'EXECUTION-POLICY.json'), JSON.stringify({
    plannedLogicalCallCount: planned,
    callsPerRow: RECOMMENDED_CALL_TOPOLOGY.callsPerRow,
    arms: RECOMMENDED_CALL_TOPOLOGY.arms,
    retrySemantics: {
      maxRetriesPerLogicalCall: 1,
      maxAttemptsPerLogicalCall: 2,
      retryableFailureKinds: RETRYABLE_EXPERT_FAILURES,
      nonRetryableFailureKinds: notRetryable,
      retriesEnabledOnFormalPath: true,
      retryReplacesCall: true,
      retryCreatesAdditionalScoredObservation: false,
      attemptsRecordedInCallRecord: false,
      frozenPlanDefinesRetryBudget: false,
    },
    defectsFound: [
      'callCeiling counts LOGICAL calls, not provider requests; retries bypass it entirely',
      'usageOf has no implementation anywhere, so spendUsd stays 0 and the spend ceiling is inert',
      'the adapter retains only lastTelemetry, so a retried call under-reports its first billed request',
      'CallRecord discards trace.attempts, so M13\'s frozen "retries included" denominator is not computable',
      'the §121 RECOMMENDED_CALL_TOPOLOGY comment claiming the ceiling covers retries is false',
    ],
    maximumBillableProviderRequests: planned * 2,
    existingHardCallCeiling: RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling,
    ceilingOptions: opts.map(o => ({
      ...o,
      maxMeanUsd: Number((o.ceiling * meanPerCall).toFixed(2)),
      maxWorstUsd: Number((o.ceiling * worstPerCall).toFixed(2)),
    })),
    engineeringRecommendation: 'O3',
    requiredCodeRepairs: [
      'R1 count provider REQUESTS, not logical calls, against the ceiling',
      'R2 implement usageOf, or the spend ceiling stays inert and M16 reports $0.00',
      'R3 accumulate adapter telemetry per ATTEMPT, or a retried call under-reports its cost',
      'R4 bind the model: assert provider.qualifiedModelIdentity === manifest.model before the '
        + 'first request. Required whatever ceiling is chosen -- EXPERT_ANTHROPIC_MODEL currently '
        + 'redirects the formal cohort to another model and the identity guard still passes.',
    ],
    costBasis: MEASURED_COST_MODEL.source,
    meanUsdPerCall: meanPerCall,
    worstUsdPerCall: Number(worstPerCall.toFixed(6)),
    freezePrerequisites: determinate.map(([k, ok2, detail]) => ({ item: k, determinate: ok2, detail })),
    frozen: freezable,
    cohortStatus: 'CANDIDATE',
    p4PrespendAuthorization: false,
    providerInvocationCount: providerInvocationCount(),
  }, null, 2) + '\n');
  console.log(`\nwritten to verification/expert-hazlenz-formal-cohort-65-2026-09-01/`);
}

main().catch(e => { console.error(e); process.exit(1); });
