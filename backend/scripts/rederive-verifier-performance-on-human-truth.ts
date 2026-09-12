/**
 * §159 VERIFIER PERFORMANCE RE-DERIVATION ON HUMAN-REVIEWED TRUTH. ZERO PROVIDER CALLS.
 *
 * Re-derives the §156 (v1) and §157 (v2) verifier gates over ONLY the rows a human has dispositioned,
 * applying each row's exclusions per denominator.
 *
 * ==================== WHAT THIS DOES NOT DO ====================
 *
 * It does not touch `VERIFIER-SCORES.json` or `VERIFIER-V2-SCORES.json`. Those record what was
 * measured under the standard in force at the time and stay exactly as executed, HS-H1 included. This
 * writes a NEW measure with a NEW name, to be reported BESIDE the originals rather than instead of
 * them. `docs/VERIFIER-TRUTH-DENOMINATOR-POLICY.md` requires that, and the reason is that editing a
 * historical figure to match a later adjudication destroys the record of the adjudication having been
 * needed.
 *
 * ==================== WHY IT REFUSES TO RUN ON A PARTIAL LEDGER ====================
 *
 * A row with no disposition is not thereby valid. If this script computed a figure over "the rows
 * reviewed so far", the number would silently mean something different every time a disposition
 * landed, and the first such number would be the one that got quoted. So it refuses while any
 * load-bearing row is undispositioned, and says which.
 *
 * ==================== THE RETIRED SELECTOR SCORER ====================
 *
 * §161: `B_SELECTOR_ACCURACY_KEYWORD_SCORER_PROSPECTIVE_AUTHORITY = RETIRED`. The keyword-set matcher
 * is not fit for purpose as an authoritative prospective semantic scorer -- §160 FINDING 1 measured
 * that on three of the four REQUIRED cases the authored keyword set is satisfied by the OBSERVATION
 * TEXT itself, so a question echoing the observation scored as reaching the owed fact.
 *
 * This file therefore REFUSES TO EMIT `B_selectorAccuracy` rather than silently computing a weaker
 * number under the same name. No replacement scorer is authorized: disable before replacing.
 *
 * The retirement is PROSPECTIVE ONLY. `score-expert-verifier-accuracy.ts` and
 * `score-expert-verifier-v2.ts` reproduce the historical figures and are deliberately NOT touched.
 *
 * ==================== ADMISSION, PER §161 ====================
 *
 * Observation-only truth is admissible -- governed evidence is not mandatory unless the claimed
 * decision distinction itself turns on regulatory interpretation, and deterministic support is not
 * mandatory at all. But a row enters a prospective semantic measure only when a human has recorded
 * ALL SIX conditions true. Five of six is not admission, an unrecorded condition counts as not
 * established, and a row with no disposition is not thereby valid.
 *
 * ==================== COUNTS, NOT PERCENTAGES ====================
 *
 * Removing HS-H1 leaves two decision-critical draws over two rows. A percentage computed on that is
 * a ratio of small integers wearing a lab coat. Any denominator below `PERCENTAGE_FLOOR` is printed
 * as a bare count and the script refuses to render a percentage for it.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ROOT = join(__dirname, '..', '..');
const V = join(ROOT, 'verification');
const SRC = join(V, 'expert-hazlenz-verifier-accuracy-2026-09-03');
const V157 = join(V, 'expert-hazlenz-verifier-v2-remediation-2026-09-04');
const REPAIR = join(V, 'expert-hazlenz-vc04-measurement-repair-2026-09-04');
const OUT = join(V, 'expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04');

/**
 * Both default to the live artifacts. The overrides exist ONLY so the refusal gates below can be
 * proven by execution against synthetic ledgers -- an unexercised gate is not a gate. They never
 * cause the live ledger or the live output to be written by a test.
 */
const LEDGER_PATH = process.env.REDERIVE_LEDGER_PATH ?? join(OUT, 'ROW-TRUTH-DISPOSITIONS.json');
const OUT_DIR = process.env.REDERIVE_OUT_DIR ?? OUT;

/** Below this denominator size a rate is not reported, only a count. */
const PERCENTAGE_FLOOR = 10;

/** §161, product owner, 2026-09-04. PROSPECTIVE authority only; historical figures are untouched. */
const B_SELECTOR_ACCURACY_KEYWORD_SCORER_PROSPECTIVE_AUTHORITY = 'RETIRED' as const;
const OBSERVATION_ONLY_TRUTH_ALLOWED = true;

/** All six must be recorded true by a human. Conjunctive: five of six is not admission. */
const OBSERVATION_ONLY_TRUTH_REQUIREMENTS = [
  'HUMAN_REVIEWED',
  'FACT_GENUINELY_UNRESOLVED',
  'PLAUSIBLE_ALTERNATIVE_STATES',
  'MATERIAL_CURRENT_DECISION_DIVERGENCE',
  'NECESSARY_NOW',
  'SEMANTIC_SELECTOR_MATCH_NOT_KEYWORD_OVERLAP',
] as const;

interface LedgerRow {
  rowId: string; authoredClass: string; disposition: string | null;
  dispositionedBy: string | null; dispositionedAt: string | null;
  excludeFromDenominators: string[] | null; note: string | null;
  /** §161 admission record: every key of OBSERVATION_ONLY_TRUTH_REQUIREMENTS, set by a human. */
  observationOnlyTruthAdmission?: Record<string, boolean> | null;
}

const readJson = <T>(p: string): T => JSON.parse(readFileSync(p, 'utf8')) as T;

/**
 * §161 admission. Conjunctive over all six conditions, and a MISSING key is treated exactly as
 * `false` -- an unrecorded condition has not been established.
 */
function admit(r: LedgerRow): { admitted: boolean; missing: string[] } {
  const rec = r.observationOnlyTruthAdmission ?? {};
  const missing = OBSERVATION_ONLY_TRUTH_REQUIREMENTS.filter(k => rec[k] !== true);
  return { admitted: missing.length === 0, missing: [...missing] };
}

/**
 * RETIRED (§161). Kept as a named stub so any future caller fails loudly rather than quietly
 * reintroducing keyword overlap as a score. It is never reachable on the emitting path.
 */
function selectorReachedRETIRED(): never {
  throw new Error('B_selectorAccuracy keyword scorer is RETIRED for prospective use (§161). '
    + 'No replacement scorer is authorized. Refuse to emit the figure instead.');
}

function main(): void {
  const ledgerPath = LEDGER_PATH;
  if (!existsSync(ledgerPath)) {
    console.log('ROW-TRUTH-DISPOSITIONS.json not found. Run '
      + 'build-verifier-row-truth-reconciliation-2026-09-04.ts first.');
    process.exit(1);
  }
  const ledger = readJson<{ rows: LedgerRow[]; allowedDispositions: string[] }>(ledgerPath);
  const key = readJson<{ key: Array<{ caseId: string; draw: string; rowId: string }> }>(
    join(SRC, 'SEALED-CASE-KEY.json')).key;
  const truth = readJson<{ entries: Array<Record<string, any>> }>(
    join(SRC, 'TRUTH-MANIFEST.json')).entries;

  console.log('§159 VERIFIER PERFORMANCE RE-DERIVATION ON HUMAN-REVIEWED TRUTH');
  console.log('='.repeat(100));

  // ---- the gate: every row must carry a human disposition.
  const undispositioned = ledger.rows.filter(r => !r.disposition);
  const invalid = ledger.rows.filter(r => r.disposition
    && !ledger.allowedDispositions.includes(r.disposition));

  console.log('\n--- DISPOSITION LEDGER\n');
  for (const r of ledger.rows) {
    console.log(`  ${r.rowId.padEnd(7)} ${r.authoredClass.padEnd(10)} `
      + `${(r.disposition ?? 'AWAITING_HUMAN_ADJUDICATION').padEnd(46)}`
      + `${r.dispositionedBy ? `${r.dispositionedBy} ${r.dispositionedAt}` : ''}`);
    if (r.excludeFromDenominators?.length) {
      console.log(`          excluded from: ${r.excludeFromDenominators.join(', ')}`);
    }
    const a = admit(r);
    console.log(`          §161 admission: ${a.admitted ? 'ADMITTED (all six recorded)'
      : `NOT ADMITTED — unrecorded: ${a.missing.join(', ')}`}`);
  }

  if (invalid.length) {
    console.log(`\n  INVALID DISPOSITION on ${invalid.map(r => r.rowId).join(', ')}. `
      + `Allowed: ${ledger.allowedDispositions.join(', ')}`);
    process.exit(1);
  }
  if (undispositioned.length) {
    console.log(`\n  ${ledger.rows.length - undispositioned.length} of ${ledger.rows.length} rows `
      + 'dispositioned.');
    console.log('\n  REFUSING TO COMPUTE. A row with no disposition is not thereby valid, and a');
    console.log('  figure over "the rows reviewed so far" would mean something different each time a');
    console.log('  disposition landed.');
    console.log(`\n  AWAITING HUMAN ADJUDICATION: ${undispositioned.map(r => r.rowId).join(', ')}`);
    console.log('  Packets: verification/expert-hazlenz-verifier-row-truth-reconciliation-2026-09-04/');
    console.log('\n  VERIFIER_REDERIVATION_BLOCKED — HUMAN_TRUTH_RECONCILIATION_INCOMPLETE');
    console.log('  PROVIDER_CALLS_THIS_SCRIPT = 0');
    process.exit(2);
  }

  // ---- §161 ADMISSION GATE. Conjunctive over all six, applied after the disposition gate.
  const notAdmitted = ledger.rows.filter(r => !admit(r).admitted
    && !(r.excludeFromDenominators ?? []).includes('A_decisionCriticalRecall'));
  if (notAdmitted.length > 0) {
    console.log(`\n  OBSERVATION_ONLY_TRUTH_ALLOWED = ${OBSERVATION_ONLY_TRUTH_ALLOWED}, and all `
      + `${OBSERVATION_ONLY_TRUTH_REQUIREMENTS.length} conditions are required TOGETHER.`);
    console.log('  An unrecorded condition counts as NOT ESTABLISHED. Five of six is not admission.');
    for (const r of notAdmitted) {
      console.log(`    ${r.rowId}: unrecorded ${admit(r).missing.join(', ')}`);
    }
    console.log('\n  Required per-row shape: ROW-TRUTH-DISPOSITIONS.TEMPLATE.json');
    console.log('\n  VERIFIER_REDERIVATION_BLOCKED — OBSERVATION_ONLY_TRUTH_ADMISSION_INCOMPLETE');
    console.log('  PROVIDER_CALLS_THIS_SCRIPT = 0');
    process.exit(3);
  }

  // ---- everything below runs only on a complete ledger.
  const truthById = new Map(truth.map(t => [t.caseId, t]));
  const rowByCase = new Map(key.map(k => [k.caseId, k.rowId]));
  const ledgerByRow = new Map(ledger.rows.map(r => [r.rowId, r]));
  const excluded = (caseId: string, denom: string): boolean => {
    const r = ledgerByRow.get(rowByCase.get(caseId)!);
    return !!r?.excludeFromDenominators?.includes(denom);
  };

  const v1 = readJson<{ results: Array<Record<string, any>> }>(join(SRC, 'VERIFIER-RESULTS.json'));
  const v2 = readJson<{ results: Array<Record<string, any>> }>(
    join(V157, 'VERIFIER-V2-RESULTS.json'));
  const repaired = existsSync(join(REPAIR, 'VC04-REPAIR-RESULT.json'))
    ? readJson<{ repairedExecution: Record<string, any> }>(
      join(REPAIR, 'VC04-REPAIR-RESULT.json')).repairedExecution : null;

  /**
   * The two arms record contract admission under DIFFERENT KEYS: §156 v1 wrote `boundaryAccepted`,
   * §157 v2 wrote `admissionAccepted`. Reading only the v2 key made `executionValid` false for every
   * v1 record and silently zeroed the whole v1 denominator. Each arm therefore names its own field.
   */
  const arms: Array<{ name: string; results: Array<Record<string, any>>; acceptedKey: string }> = [
    { name: 'v1 (§156)', results: v1.results, acceptedKey: 'boundaryAccepted' },
    { name: 'v2 (§157)', results: v2.results, acceptedKey: 'admissionAccepted' },
  ];

  const report: Record<string, unknown> = {};
  for (const arm of arms) {
    const rows = arm.results.map(r => {
      const t = truthById.get(r.caseId)!;
      const p = r.proposedClarification as Record<string, string> | null;
      return { ...r, caseId: r.caseId as string, truth: t, rowId: rowByCase.get(r.caseId)!,
        exact: r.verdict === t.correctVerdict,
        semantic: r.verdict === t.correctVerdict
          || (t.semanticallyEquivalentVerdicts as string[]).includes(r.verdict),
        // §161: the keyword scorer is RETIRED for prospective use and no substitute is authorized,
        // so this stays null and B is not emitted at all.
        selectorOk: null as boolean | null,
        executionValid: Boolean(r.ok && !r.degenerate && r[arm.acceptedKey] === true) };
    });

    const inDenom = (denom: string, extra: (x: typeof rows[number]) => boolean) =>
      rows.filter(x => x.truth.inPrimaryDenominator && x.executionValid
        && !excluded(x.caseId, denom) && extra(x));

    const critical = inDenom('A_decisionCriticalRecall',
      x => x.truth.correctVerdict === 'ADD_OR_REPLACE_CLARIFICATION');
    const selector = inDenom('B_selectorAccuracy',
      x => x.truth.correctVerdict === 'ADD_OR_REPLACE_CLARIFICATION');
    const silence = inDenom('C_legitimateSilenceSpecificity',
      x => x.truth.correctVerdict === 'NO_CLARIFICATION_REQUIRED');

    const fmt = (n: number, d: number, rowIds: string[]) => {
      // A zero denominator is not a measurement of zero. Say so rather than printing "0/0".
      if (d === 0) return 'INSUFFICIENT — denominator is zero, no figure exists';
      const distinct = [...new Set(rowIds)];
      const base = `${n}/${d} over ${distinct.length} distinct row${distinct.length === 1 ? '' : 's'}`
        + ` (${distinct.join(', ') || 'none'})`;
      return d >= PERCENTAGE_FLOOR ? `${base} — ${((n / d) * 100).toFixed(1)}%`
        : `${base} — COUNT ONLY, denominator below ${PERCENTAGE_FLOOR}`;
    };

    console.log(`\n--- ${arm.name}, RE-DERIVED ON HUMAN-REVIEWED TRUTH\n`);
    console.log(`  A. decision-critical recall     `
      + fmt(critical.filter(x => x.semantic).length, critical.length, critical.map(x => x.rowId)));
    console.log('  B. selector accuracy            RETIRED (§161) — NOT EMITTED. The keyword scorer');
    console.log('                                     is not fit for purpose as a prospective '
      + 'semantic scorer');
    console.log(`                                     and no replacement is authorized. `
      + `${selector.length} case(s) would have been eligible.`);
    console.log(`  C. legitimate-silence specificity `
      + fmt(silence.filter(x => x.semantic).length, silence.length, silence.map(x => x.rowId)));

    report[arm.name] = {
      A_decisionCriticalRecall: critical.length === 0 ? 'INSUFFICIENT — denominator is zero'
        : `${critical.filter(x => x.semantic).length}/${critical.length}`,
      A_distinctRows: [...new Set(critical.map(x => x.rowId))],
      B_selectorAccuracy: 'RETIRED_NOT_EMITTED — B_SELECTOR_ACCURACY_KEYWORD_SCORER_PROSPECTIVE_'
        + 'AUTHORITY = RETIRED (§161). No replacement scorer is authorized.',
      B_eligibleCasesHadItBeenEmitted: selector.map(x => x.caseId),
      B_distinctRows: [...new Set(selector.map(x => x.rowId))],
      C_legitimateSilenceSpecificity: silence.length === 0 ? 'INSUFFICIENT — denominator is zero'
        : `${silence.filter(x => x.semantic).length}/${silence.length}`,
      C_distinctRows: [...new Set(silence.map(x => x.rowId))],
      excludedCases: arm.results.map(r => r.caseId)
        .filter(c => ['A_decisionCriticalRecall', 'B_selectorAccuracy',
          'C_legitimateSilenceSpecificity'].some(d => excluded(c, d))),
      percentagesSuppressedBelow: PERCENTAGE_FLOOR,
    };
  }

  if (repaired) {
    console.log('\n--- §158 VC-04 MEASUREMENT REPAIR, REPORTED SEPARATELY\n');
    console.log(`  the repaired draw returned ${repaired.verdict} and is NOT folded into either arm:`);
    console.log('  it is a second draw of one case, not a replacement for the §157 execution, and');
    console.log('  the two disagreed on byte-identical input.');
    report['section158Repair'] = { verdict: repaired.verdict,
      foldedIntoArms: false,
      reason: 'a second draw of one case is not a replacement for the first; both are preserved' };
  }

  const out = {
    derivedAt: new Date().toISOString(),
    measure: 'hazlenz.expert.verifier.human-reviewed-subset.v1',
    RELATIONSHIP_TO_HISTORICAL_SCORES: 'A NEW MEASURE REPORTED BESIDE THE ORIGINALS. '
      + 'VERIFIER-SCORES.json (§156) and VERIFIER-V2-SCORES.json (§157) are UNTOUCHED and remain the '
      + 'record of what was measured under the standard in force at the time.',
    dispositionLedger: ledger.rows,
    gates: report,
    reportingRule: `denominators below ${PERCENTAGE_FLOOR} are reported as counts, never as rates`,
    policy161: {
      B_SELECTOR_ACCURACY_KEYWORD_SCORER_PROSPECTIVE_AUTHORITY,
      OBSERVATION_ONLY_TRUTH_ALLOWED,
      OBSERVATION_ONLY_TRUTH_REQUIREMENTS,
      admissionIsConjunctive: true,
      unrecordedConditionCountsAs: 'NOT_ESTABLISHED',
      historicalSelectorFiguresUnchanged: '§156 B 1/3 and §157 B 1/3 stand, immutable',
      historicalScorersNotEdited: ['score-expert-verifier-accuracy.ts', 'score-expert-verifier-v2.ts'],
      replacementScorerAuthorized: false,
    },
  };
  writeFileSync(join(OUT_DIR, 'REDERIVED-HUMAN-TRUTH-SCORES.json'),
    `${JSON.stringify(out, null, 2)}\n`);
  console.log('\n  -> REDERIVED-HUMAN-TRUTH-SCORES.json');
  console.log('  HISTORICAL SCORES UNTOUCHED.');
  console.log('  PROVIDER_CALLS_THIS_SCRIPT = 0');
}

main();
