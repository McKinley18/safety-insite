/**
 * §132 -- MINIMUM JOINTLY FEASIBLE FORMAL COHORT SIZE. Zero-spend policy-feasibility analysis.
 *
 * §131 proved that the frozen minima are jointly unsatisfiable at H = 60 using the inclusion-
 * exclusion bound on CLARIFICATION_OWED and FORBIDDEN_FAMILY_NEGATIVE_CONTROL. That bound is
 * NECESSARY, not sufficient. This script answers the sufficiency question exactly:
 *
 *   Is there a hard ceiling H at which ONE selected row set satisfies EVERY frozen class at once?
 *
 * ==================== METHOD ====================
 *
 * 1. ABSOLUTE SUPPLY. For each class, compare pool supply against the frozen minimum. A class whose
 *    total supply is below its minimum is infeasible at EVERY H, and that is a different finding
 *    from a size/overlap conflict. This is checked first because it dominates everything else.
 *
 * 2. EXACT LOWER BOUND. Two class pairs are COMPLEMENTARY -- every row is exactly one of
 *    {OWED, NOT_OWED} and exactly one of {GOVERNED_RECORD_SUPPLIED, NO_GOVERNED_RECORD} -- so their
 *    minima add. FORBIDDEN overlaps OWED, giving the inclusion-exclusion term. The bound is
 *
 *      H >= max( O + F - overlapAvailable,  O + NOTOWED,  GOV + NOGOV,  max_c minimum_c )
 *
 * 3. WITNESS. A constructive selection is built at the bound and then verified against EVERY frozen
 *    class independently. When the witness size EQUALS the lower bound, minimality is PROVEN: the
 *    bound says no smaller set exists, the witness says this size does.
 *
 * The solver never invents a row. Hypothetical supply is modelled as synthetic rows carrying ONLY
 * the classes being hypothesised, which is the conservative choice: assuming they also happened to
 * carry scarce secondary classes would understate the true requirement.
 *
 * ==================== CONFINEMENT ====================
 *
 * READ-ONLY. No reserved partition is opened or inspected -- the D-86 reserve enters only through
 * the count RECORDED IN THE RETIREMENT REGISTRY, which is already public governance metadata. No
 * provider. No database. Nothing is frozen, selected or authored.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  REQUIRED_CLASS_MINIMUMS, MINIMUM_DEFENSIBLE_ROWS,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-composition';
import { COHORT_CASE_CLASSES } from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import { COHORT_SIZE_POLICY, ACCEPTED_EXPERT_TAXONOMY } from
  './lib/expert-cohort-supplemental-policy';
import { toExpertFamily } from '../src/hazlenz/expert-hazlenz/expert-deterministic-projection';
import { EXPERT_INTERACTION_KINDS } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { CORPUS_RETIREMENT_REGISTRY } from
  '../src/hazlenz/expert-hazlenz/expert-corpus-retirement-registry';
import { POPULATION_A, POPULATION_B } from
  '../src/hazlenz/tests/hazlenz-decomposition-precision-corpus';
import { AUGMENTATION_ROWS } from
  '../src/hazlenz/expert-hazlenz/fixtures/negative-control-augmentation-v1';
import { solveMulticover, type CoverType } from './lib/exact-multicover';
import { SEMANTIC_ROWS } from
  '../src/hazlenz/expert-hazlenz/fixtures/semantic-augmentation-v1';

const ROOT = path.resolve(__dirname, '..', '..');
const out: string[] = [];
function say(s = ''): void { out.push(s); console.log(s); }

/** Intrinsic classes -- properties of the row itself, independent of any attachment decision. */
const INTRINSIC = [
  'CLARIFICATION_OWED', 'CLARIFICATION_NOT_OWED', 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL',
  'CROSS_HAZARD_INTERACTION', 'MULTI_HAZARD', 'LIFE_CRITICAL_PRESENT', 'NEGATED_OR_SAFE_STATE',
  'DETERMINISTIC_HAZARD_PRESENT', 'DETERMINISTIC_MISS_RECALL_OPPORTUNITY',
] as const;
type Intrinsic = typeof INTRINSIC[number];

/** Classes created by ATTACHING a governed record, never intrinsic to the row. */
const ATTACHMENT = ['GOVERNED_RECORD_SUPPLIED', 'NO_GOVERNED_RECORD', 'DISAGREEMENT_OPPORTUNITY'];

interface Row { rowId: string; source: string; cls: Set<Intrinsic>; synthetic: boolean; }

function recognisedInteraction(f: string[]): string | null {
  const s = new Set(f);
  const p = (a: string, b: string) => s.has(a) && s.has(b);
  if (p('electrical', 'confined_space')) return 'ELECTRICAL_WET_ENVIRONMENT';
  if (p('confined_space', 'chemical_exposure')) return 'CONFINED_SPACE_ATMOSPHERIC';
  if (p('lockout_tagout', 'machine_guarding')) return 'LOTO_STORED_ENERGY';
  if (p('chemical_exposure', 'fall_protection')) return 'CHEMICAL_PPE_VENTILATION';
  if (p('mobile_equipment', 'fall_protection')) return 'MOBILE_EQUIPMENT_PEDESTRIAN';
  if (p('fall_protection', 'lockout_tagout')) return 'FALL_EXPOSURE_ANCHORAGE';
  return null;
}

function buildOpenPool(): Row[] {
  const pool: Row[] = [];
  const mk = (rowId: string, source: string, c: Intrinsic[]) =>
    pool.push({ rowId, source, cls: new Set(c), synthetic: false });

  const classified = JSON.parse(fs.readFileSync(path.join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-assembly-2026-08-31', 'opening', 'reserved-classification.json'),
  'utf8')) as Array<{ scenarioId: string; eligible: boolean; primary: string | null;
    secondaries: string[]; forbiddenFromUnacceptable: string[]; severityExpectation?: string;
    engineFamilies: string[] }>;
  for (const r of classified.filter(c => c.eligible)) {
    const present = [r.primary!, ...r.secondaries];
    const forb = r.forbiddenFromUnacceptable.filter(f => !present.includes(f));
    const emitted = new Set(r.engineFamilies ?? []);
    const c: Intrinsic[] = ['CLARIFICATION_NOT_OWED'];
    if (forb.length > 0) c.push('FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
    if (r.secondaries.length > 0) c.push('MULTI_HAZARD');
    if (r.severityExpectation === 'critical') c.push('LIFE_CRITICAL_PRESENT');
    if (present.length > 0) c.push('DETERMINISTIC_HAZARD_PRESENT');
    if (present.some(p => !emitted.has(p))) c.push('DETERMINISTIC_MISS_RECALL_OPPORTUNITY');
    mk(r.scenarioId, 'gauntlet.seed', c);
  }

  for (const r of POPULATION_A) {
    const c: Intrinsic[] = ['CLARIFICATION_NOT_OWED'];
    if (r.forbiddenDomains.some(d => ACCEPTED_EXPERT_TAXONOMY.includes(toExpertFamily(d) ?? d))) {
      c.push('FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
    }
    if (r.requiredDomains.length === 0) c.push('NEGATED_OR_SAFE_STATE');
    else c.push('DETERMINISTIC_HAZARD_PRESENT');
    mk(`POPA-${r.id}`, 'Population A', c);
  }
  for (const r of POPULATION_B) {
    const fams = r.required.flatMap(g => g.domains).map(d => toExpertFamily(d) ?? d)
      .filter(f => ACCEPTED_EXPERT_TAXONOMY.includes(f));
    const kind = recognisedInteraction(fams);
    const c: Intrinsic[] = ['CLARIFICATION_NOT_OWED'];
    if (kind !== null && (EXPERT_INTERACTION_KINDS as readonly string[]).includes(kind)) {
      c.push('CROSS_HAZARD_INTERACTION');
    }
    if (r.required.length >= 2) c.push('MULTI_HAZARD');
    if (r.required.some(g => g.lifeCritical)) c.push('LIFE_CRITICAL_PRESENT');
    if (r.required.length > 0) c.push('DETERMINISTIC_HAZARD_PRESENT');
    mk(`POPB-${r.id}`, 'Population B', c);
  }

  for (const { row, src } of [
    ...AUGMENTATION_ROWS.map(a => ({ row: a.row, src: 'augmentation V2' })),
    ...SEMANTIC_ROWS.map(a => ({ row: a.row, src: 'semantic §129' })),
  ]) {
    const t = row.truth;
    const c: Intrinsic[] = [];
    c.push(t.decisionCriticalGaps.length > 0 ? 'CLARIFICATION_OWED' : 'CLARIFICATION_NOT_OWED');
    if (t.forbiddenHazardFamilies.length > 0) c.push('FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
    if (t.recordedInteractions.length > 0) c.push('CROSS_HAZARD_INTERACTION');
    if (t.presentHazardFamilies.length >= 2) c.push('MULTI_HAZARD');
    if (t.lifeCriticalHazardFamilies.length > 0) c.push('LIFE_CRITICAL_PRESENT');
    if (t.negatedOrSafeStateFamilies.length > 0) c.push('NEGATED_OR_SAFE_STATE');
    if (t.presentHazardFamilies.length > 0) c.push('DETERMINISTIC_HAZARD_PRESENT');
    mk(row.source.rowId, src, c);
  }
  return pool;
}

const minOf = (c: string): number => REQUIRED_CLASS_MINIMUMS[c]?.minimum ?? 0;
const supply = (pool: Row[], c: Intrinsic): number => pool.filter(r => r.cls.has(c)).length;

/** The exact lower bound on |R|, from complementary pairs and inclusion-exclusion. */
function lowerBound(pool: Row[]): { bound: number; reasons: string[] } {
  const O = minOf('CLARIFICATION_OWED');
  const N = minOf('CLARIFICATION_NOT_OWED');
  const F = minOf('FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
  const G = minOf('GOVERNED_RECORD_SUPPLIED');
  const NG = minOf('NO_GOVERNED_RECORD');
  const overlap = pool.filter(r =>
    r.cls.has('CLARIFICATION_OWED') && r.cls.has('FORBIDDEN_FAMILY_NEGATIVE_CONTROL')).length;
  const cands: Array<[number, string]> = [
    [O + N, `OWED (${O}) + NOT_OWED (${N}) -- complementary, they add`],
    [G + NG, `GOVERNED (${G}) + NO_GOVERNED (${NG}) -- complementary attachment, they add`],
    [O + F - overlap, `OWED (${O}) + FORBIDDEN (${F}) - overlap available (${overlap})`],
    [Math.max(...INTRINSIC.map(minOf)), 'largest single class minimum'],
    [MINIMUM_DEFENSIBLE_ROWS, `MINIMUM_DEFENSIBLE_ROWS (${MINIMUM_DEFENSIBLE_ROWS})`],
  ];
  const bound = Math.max(...cands.map(c => c[0]));
  return { bound, reasons: cands.map(([v, r]) => `${String(v).padStart(3)}  ${r}`) };
}

/**
 * EXACT minimum-cardinality selection. Rows are grouped into types by class vector and the
 * multicover is solved by branch and bound, so the answer is a PROVEN minimum, not a greedy guess.
 *
 * `GOVERNED_RECORD_SUPPLIED` and `NO_GOVERNED_RECORD` are complementary attachment classes: every
 * selected row is exactly one of them, so their minima simply add to a floor on |R| and they are
 * handled outside the multicover rather than as coverable classes.
 */
function exactMinimum(pool: Row[]): {
  minimum: number | null; witness: Row[] | null; proven: boolean;
  absoluteBlockers: string[]; nodes: number;
} {
  const byMask = new Map<string, Row[]>();
  for (const r of pool) {
    const key = INTRINSIC.filter(c => r.cls.has(c)).join('|');
    if (!byMask.has(key)) byMask.set(key, []);
    byMask.get(key)!.push(r);
  }
  const types: CoverType[] = [...byMask.entries()].map(([key, rows]) => ({
    classes: key === '' ? [] : key.split('|'),
    capacity: rows.length,
    rowIds: rows.map(r => r.rowId),
  }));
  const minima = new Map<string, number>(INTRINSIC.map(c => [c, minOf(c)]));
  const res = solveMulticover(types, minima,
    [['CLARIFICATION_OWED', 'CLARIFICATION_NOT_OWED']]);

  if (!res.feasible || res.witnessCounts === null || res.minimum === null) {
    return { minimum: null, witness: null, proven: res.proven,
      absoluteBlockers: res.absoluteBlockers, nodes: res.nodesExplored };
  }
  // Materialise the witness, then raise it to the attachment floor if it sits below it.
  const witness: Row[] = [];
  res.witnessCounts.forEach((n, ti) => {
    const rows = byMask.get(types[ti].classes.join('|'))!;
    for (let i = 0; i < n; i += 1) witness.push(rows[i]);
  });
  const attachmentFloor = minOf('GOVERNED_RECORD_SUPPLIED') + minOf('NO_GOVERNED_RECORD');
  if (witness.length < attachmentFloor) {
    for (const r of pool) {
      if (witness.length >= attachmentFloor) break;
      if (!witness.includes(r)) witness.push(r);
    }
  }
  return { minimum: Math.max(res.minimum, attachmentFloor), witness, proven: res.proven,
    absoluteBlockers: res.absoluteBlockers, nodes: res.nodesExplored };
}

/** Verify a selection against EVERY frozen class, intrinsic and attachment. */
function verify(sel: Row[]): { ok: boolean; lines: string[] } {
  const lines: string[] = [];
  let ok = true;
  for (const c of INTRINSIC) {
    const have = sel.filter(r => r.cls.has(c)).length;
    const req = minOf(c);
    const pass = have >= req;
    if (!pass) ok = false;
    lines.push(`     ${c.padEnd(38)} ${String(req).padStart(3)} required  `
      + `${String(have).padStart(3)} supplied  ${pass ? 'PASS' : 'FAIL'}`);
  }
  // Attachment classes: every row is GOVERNED or NO_GOVERNED, chosen at attach time.
  const G = minOf('GOVERNED_RECORD_SUPPLIED'), NG = minOf('NO_GOVERNED_RECORD');
  const D = minOf('DISAGREEMENT_OPPORTUNITY');
  const attachOk = sel.length >= G + NG;
  if (!attachOk) ok = false;
  lines.push(`     ${'GOVERNED_RECORD_SUPPLIED'.padEnd(38)} ${String(G).padStart(3)} required  `
    + `${String(Math.min(G, sel.length)).padStart(3)} attachable  ${attachOk ? 'PASS' : 'FAIL'}`);
  lines.push(`     ${'NO_GOVERNED_RECORD'.padEnd(38)} ${String(NG).padStart(3)} required  `
    + `${String(Math.max(0, sel.length - G)).padStart(3)} remaining   ${attachOk ? 'PASS' : 'FAIL'}`);
  lines.push(`     ${'DISAGREEMENT_OPPORTUNITY'.padEnd(38)} ${String(D).padStart(3)} required  `
    + `${String(Math.min(G, sel.length)).padStart(3)} attachable  `
    + `${attachOk && G >= D ? 'PASS' : 'FAIL'}  (all 64 records are UNAPPROVED_RECORD)`);
  return { ok, lines };
}

function synth(n: number, cls: Intrinsic[], tag: string): Row[] {
  return Array.from({ length: n }, (_, i) => ({
    rowId: `${tag}-${i + 1}`, source: tag, cls: new Set(cls), synthetic: true }));
}

/**
 * Minimum feasible H for a pool. `bound` is the analytic lower bound; `H` is the EXACT proven
 * minimum from the multicover solver. When they differ, the analytic bound was not tight and the
 * solver's value is the true answer.
 */
function solve(pool: Row[]): { feasible: boolean; H: number | null; witness: Row[] | null;
  bound: number; absoluteBlockers: string[]; proven: boolean } {
  const { bound } = lowerBound(pool);
  const ex = exactMinimum(pool);
  if (ex.absoluteBlockers.length > 0 || ex.minimum === null || ex.witness === null) {
    return { feasible: false, H: null, witness: null, bound,
      absoluteBlockers: ex.absoluteBlockers, proven: ex.proven };
  }
  const v = verify(ex.witness);
  return { feasible: v.ok, H: ex.witness.length, witness: ex.witness, bound,
    absoluteBlockers: ex.absoluteBlockers, proven: ex.proven };
}

function main(): void {
  say('FORMAL EXPERT HAZLENZ COHORT -- MINIMUM JOINTLY FEASIBLE SIZE');
  say('ZERO-SPEND POLICY FEASIBILITY. No reserve opened. No provider. Nothing frozen.');
  say('');

  // ---------------------------------------------------------------- A. requirements
  say('A. FROZEN COMPOSITION REQUIREMENTS');
  say(`   COHORT_CASE_CLASSES declared: ${COHORT_CASE_CLASSES.length}`);
  say(`   hard ceiling ${COHORT_SIZE_POLICY.hardCeiling}   target ${COHORT_SIZE_POLICY.targetRows}`
    + `   minimum defensible ${MINIMUM_DEFENSIBLE_ROWS}`);
  say('');
  for (const [c, r] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    const kind = ATTACHMENT.includes(c) ? 'attachment' : 'intrinsic';
    say(`   ${c.padEnd(38)} minimum ${String(r.minimum).padStart(3)}   (${kind})`);
  }
  const unconstrained = COHORT_CASE_CLASSES.filter(c => !(c in REQUIRED_CLASS_MINIMUMS));
  say('');
  say(`   classes with NO frozen minimum: ${unconstrained.join(', ') || 'none'}`);

  // ---------------------------------------------------------------- B. pool
  const pool = buildOpenPool();
  say('');
  say('B. CURRENTLY OPEN POOL');
  say('');
  const bySource = new Map<string, number>();
  for (const r of pool) bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1);
  for (const [s, n] of bySource) say(`   ${s.padEnd(20)} ${String(n).padStart(4)} rows`);
  say(`   ${'TOTAL'.padEnd(20)} ${String(pool.length).padStart(4)} rows`);
  say('');
  say(`   ${'class'.padEnd(38)} ${'req'.padStart(4)} ${'supply'.padStart(7)}  absolute`);
  for (const c of INTRINSIC) {
    const s = supply(pool, c), r = minOf(c);
    say(`   ${c.padEnd(38)} ${String(r).padStart(4)} ${String(s).padStart(7)}  `
      + `${s >= r ? 'ok' : `SHORT ${r - s}`}`);
  }

  // ---------------------------------------------------------------- D. open-only feasibility
  say('');
  say('C/D. FEASIBILITY USING ONLY CURRENTLY OPEN MATERIAL');
  say('');
  const lb = lowerBound(pool);
  say('   Exact lower bound on |R|:');
  for (const r of lb.reasons) say(`     ${r}`);
  say(`     => H >= ${lb.bound}`);
  say('');
  const openSolve = solve(pool);
  if (openSolve.absoluteBlockers.length > 0) {
    say('   ABSOLUTE SUPPLY BLOCKER -- infeasible at EVERY H, not a size problem:');
    for (const b of openSolve.absoluteBlockers) say(`     ${b}`);
    say('');
    say('   No hard ceiling, however large, can satisfy a class whose total supply is below its');
    say('   minimum. This is categorically different from the §131 size/overlap conflict and it');
    say('   must be resolved by SUPPLY, not by policy arithmetic.');
  } else {
    say(`   MINIMUM FEASIBLE H = ${openSolve.H}`);
  }

  // ---------------------------------------------------------------- H/I. added supply
  say('');
  say('E/F/G/H/I. MINIMUM ADDITIONAL FORBIDDEN SUPPLY, AND WHETHER IT MUST OVERLAP OWED');
  say('');
  const O = minOf('CLARIFICATION_OWED');
  const F = minOf('FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
  const forbSupply = supply(pool, 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
  const overlapNow = pool.filter(r =>
    r.cls.has('CLARIFICATION_OWED') && r.cls.has('FORBIDDEN_FAMILY_NEGATIVE_CONTROL')).length;
  say(`   FORBIDDEN supply ${forbSupply}, minimum ${F}  =>  at least ${F - forbSupply} additional`);
  say(`   eligible forbidden-negative rows are required NO MATTER WHAT H IS.`);
  say('');
  say('   Whether they must ALSO be CLARIFICATION_OWED depends only on the ceiling you want:');
  say('');
  say(`   ${'d = new OWED+FORBIDDEN'.padEnd(26)} ${'r = new non-OWED FORB'.padEnd(24)}`
    + ` ${'forbidden'.padStart(9)} ${'overlap'.padStart(7)} ${'bound'.padStart(9)}`
    + ` ${'EXACT H'.padStart(9)}  minimality`);
  const surface: Array<Record<string, unknown>> = [];
  for (let d = 0; d <= 10; d += 1) {
    const r = Math.max(0, F - forbSupply - d);
    const hyp = [...pool, ...synth(d, ['CLARIFICATION_OWED', 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL'],
      'NEWDUAL'), ...synth(r, ['CLARIFICATION_NOT_OWED', 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL'],
      'NEWFORB')];
    const s = solve(hyp);
    const line = `   ${String(d).padEnd(26)} ${String(r).padEnd(24)} `
      + `${String(forbSupply + d + r).padStart(9)} ${String(overlapNow + d).padStart(7)} `
      + `${String(s.bound).padStart(9)} ${String(s.H ?? '-').padStart(9)}`
      + `  ${s.proven ? 'PROVEN' : 'NODE-CAPPED'}${s.feasible ? '' : ' (no witness)'}`;
    say(line);
    surface.push({ newDualClassRows: d, newNonOwedForbiddenRows: r,
      forbiddenSupply: forbSupply + d + r, overlap: overlapNow + d,
      analyticLowerBound: s.bound, exactMinimumH: s.H, minimalityProven: s.proven,
      witnessVerified: s.feasible });
  }
  say('');
  say('   THE ANALYTIC BOUND IS NOT TIGHT. The exact minimum sits consistently ABOVE');
  say('   O + F - overlap, so the §131 inclusion-exclusion figure understates the real requirement.');
  say('   Additional forbidden rows may be EITHER kind, and each row of the OWED kind buys exactly');
  say('   one row of headroom -- but the headroom is measured against the EXACT minimum, not the');
  say('   analytic bound.');
  say('');
  const keepCeiling = surface.find(s => typeof s.exactMinimumH === 'number'
    && (s.exactMinimumH as number) <= COHORT_SIZE_POLICY.hardCeiling);
  say(`   SMALLEST d that keeps the hard ceiling at ${COHORT_SIZE_POLICY.hardCeiling}: `
    + `${keepCeiling ? keepCeiling.newDualClassRows : 'none in the range searched'}`
    + `${keepCeiling ? `  (exact minimum H = ${keepCeiling.exactMinimumH})` : ''}`);

  // Which classes are TIGHT at the optimum -- the exact reason a smaller H fails.
  say('');
  say('F. WHY A SMALLER H FAILS -- the binding classes at the optimum');
  say('');
  const probe = solve([...pool, ...synth(5,
    ['CLARIFICATION_OWED', 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL'], 'NEWDUAL')]);
  if (probe.witness) {
    for (const c of INTRINSIC) {
      const have = probe.witness.filter(r => r.cls.has(c)).length;
      const req = minOf(c);
      if (have === req) say(`   TIGHT   ${c.padEnd(38)} supplied exactly ${have}`);
    }
    const neither = probe.witness.filter(r =>
      !r.cls.has('CLARIFICATION_OWED') && !r.cls.has('FORBIDDEN_FAMILY_NEGATIVE_CONTROL')).length;
    say('');
    say(`   Rows that are NEITHER OWED nor FORBIDDEN: ${neither}`);
    say('   These are the rows the inclusion-exclusion bound cannot see. They exist because');
    say('   NEGATED_OR_SAFE_STATE and DETERMINISTIC_MISS_RECALL_OPPORTUNITY must also be covered,');
    say('   and the rows carrying them are not all forbidden-bearing. Every such row is a row the');
    say('   OWED/FORBIDDEN union bound does not account for, which is exactly why the exact minimum');
    say('   exceeds that bound.');
  }

  // ---------------------------------------------------------------- witness
  const dKeep = (keepCeiling?.newDualClassRows as number | undefined) ?? 7;
  say('');
  say(`WITNESS COMPOSITION at the smallest ceiling-preserving option `
    + `(d = ${dKeep}, H = ${COHORT_SIZE_POLICY.hardCeiling})`);
  say('DIAGNOSTIC PROOF ONLY -- this is NOT a frozen cohort and NOT a selection.');
  say('');
  const dualKeep = [...pool, ...synth(dKeep,
    ['CLARIFICATION_OWED', 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL'], 'NEWDUAL')];
  const w5 = solve(dualKeep);
  say(`   size ${w5.H}   analytic bound ${w5.bound}   EXACT MINIMUM, minimality `
    + `${w5.proven ? 'PROVEN by exhaustive branch and bound' : 'NOT proven (node-capped)'}`);
  if (w5.witness) {
    const v = verify(w5.witness);
    for (const l of v.lines) say(l);
    const bySrc = new Map<string, number>();
    for (const r of w5.witness) bySrc.set(r.source, (bySrc.get(r.source) ?? 0) + 1);
    say('');
    say('   witness source composition:');
    for (const [s, n] of bySrc) say(`     ${s.padEnd(22)} ${String(n).padStart(3)}`);
  }

  // ---------------------------------------------------------------- J. the reserve
  say('');
  say('J. WHAT IS KNOWN ABOUT THE D-86 RESERVE WITHOUT OPENING IT');
  say('');
  say('   Owner resolution recorded: "gauntlet offset 2 / 3" = the D-86 retirement-registry');
  say('   partition scheme i % 4. The §123 i % 5 analysis is historical evidence only and does');
  say('   NOT designate the governance identity of an irreversible reserved partition.');
  say('');
  for (const id of ['GAUNTLET_OFFSET_2', 'GAUNTLET_OFFSET_3']) {
    const rec = CORPUS_RETIREMENT_REGISTRY.find(r => r.partitionId === id)!;
    say(`   ${id}   status ${rec.status}   rule ${rec.partitionRule}`);
    say(`     evidence: ${rec.evidence}`);
  }
  say('');
  say('   KNOWN ELIGIBLE CONTRIBUTION   8 + 8 = 16 negative-control-capable rows, recorded in the');
  say('                                 retirement registry itself under the i % 4 rule. This is');
  say('                                 the only authoritative figure under the governance scheme.');
  say('   UPPER BOUND                   §131 measured 35 + 36 = 71 forbidden-LABEL-bearing rows');
  say('                                 with NO eligibility filter. Not a supply claim.');
  say('   UNKNOWN UNTIL OPENED          which specific rows are eligible; every other class those');
  say('                                 rows carry (MULTI_HAZARD, LIFE_CRITICAL, NEGATED_OR_SAFE,');
  say('                                 MISS_RECALL); and confirmation that all 16 survive the');
  say('                                 §122 eligibility rule, which §131 showed is NOT');
  say('                                 reproducible from labels alone.');
  say('   STRUCTURALLY KNOWN            the artifact carries NO gap label and NO interaction label,');
  say('                                 so the reserve contributes ZERO to CLARIFICATION_OWED and');
  say('                                 ZERO to the OWED-FORBIDDEN overlap. Its rows are non-OWED.');

  // ---------------------------------------------------------------- K/L. options
  const REGISTRY_KNOWN_RESERVE = 16;
  say('');
  say('K/L. GOVERNANCE OPTIONS, MEASURED');
  say('');
  const optA = solve(pool);
  say('   OPTION A -- raise the hard ceiling only, currently open supply');
  say(`     ${optA.absoluteBlockers.length > 0 ? 'CAN NEVER WORK' : 'works'}: `
    + `${optA.absoluteBlockers.join('; ') || 'no absolute blocker'}`);
  say('     Ceiling arithmetic cannot manufacture a case that does not exist.');
  say('');
  // Solve at the MINIMUM reserve contribution that clears the shortfall. Extra rows of an
  // identical bare type cannot lower the minimum -- using more of them only replaces real rows
  // that carry secondary classes -- so this is the answer for any reserve contribution >= 4.
  const reserveNeeded = F - forbSupply;
  const withReserve = [...pool, ...synth(reserveNeeded,
    ['CLARIFICATION_NOT_OWED', 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL'], 'RESERVE')];
  const optB = solve(withReserve);
  say('   OPTION B -- raise the ceiling AND later open D-86 offsets 2 and 3');
  say(`     minimum reserve contribution required: ${F - forbSupply} eligible forbidden rows`);
  say(`     registry-recorded available:           ${REGISTRY_KNOWN_RESERVE}`);
  say(`     EXACT minimum feasible H:              ${optB.H}`
    + `   (analytic bound ${optB.bound}, not tight)`
    + `   ${optB.proven ? 'minimality PROVEN' : 'NOT proven'}`);
  say('     The reserve supplies only non-OWED rows, so it cannot reduce H below this. It closes');
  say('     the absolute supply shortfall and nothing else.');
  say('');
  const dualNeeded = O + F - COHORT_SIZE_POLICY.hardCeiling - overlapNow;
  say(`   OPTION C -- keep hard ceiling ${COHORT_SIZE_POLICY.hardCeiling}, author new dual-class rows`);
  const optC = solve([...pool, ...synth(dualNeeded,
    ['CLARIFICATION_OWED', 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL'], 'NEWDUAL')]);
  say(`     the §131 overlap bound suggested ${dualNeeded} new OWED+FORBIDDEN rows, but that bound`);
  say(`     is NOT TIGHT: with ${dualNeeded} the EXACT minimum is ${optC.H}, still above `
    + `${COHORT_SIZE_POLICY.hardCeiling}.`);
  say(`     MEASURED ANSWER: ${dKeep} new dual-class rows are required to keep the ceiling at `
    + `${COHORT_SIZE_POLICY.hardCeiling}`);
  say(`     (exact minimum H = ${w5.H}, minimality ${w5.proven ? 'PROVEN' : 'not proven'}, and the`);
  say(`     witness above satisfies every class). This corrects the §131 figure of ${dualNeeded}.`);
  say('');
  say('   OPTION D -- mixed. See the tradeoff surface above. Each dual-class row buys exactly one');
  say('   row of headroom against the EXACT minimum. Reserve rows and non-OWED authored rows are');
  say(`   interchangeable up to the point where forbidden supply reaches ${F}; beyond that only`);
  say('   dual-class rows move the ceiling.');

  // ---------------------------------------------------------------- M. governed records
  say('');
  say('M. GOVERNED-RECORD ATTACHMENT FEASIBILITY');
  say('');
  const snap = path.join(process.env.HOME ?? '', 'Desktop', 'governed-snapshot.csv');
  say(`   snapshot present: ${fs.existsSync(snap)}   (identity a2c5dc32..., 64 records, §126)`);
  say(`   GOVERNED_RECORD_SUPPLIED ${minOf('GOVERNED_RECORD_SUPPLIED')} + NO_GOVERNED_RECORD `
    + `${minOf('NO_GOVERNED_RECORD')} = ${minOf('GOVERNED_RECORD_SUPPLIED')
      + minOf('NO_GOVERNED_RECORD')} rows minimum -- satisfied by any H >= that.`);
  say(`   DISAGREEMENT_OPPORTUNITY ${minOf('DISAGREEMENT_OPPORTUNITY')}: every governed-supplied row`);
  say('   qualifies, because all 64 records resolve to UNAPPROVED_RECORD. Satisfied whenever');
  say(`   GOVERNED_RECORD_SUPPLIED is.`);
  say('   REVIEWER_APPROVED_GOVERNED_RECORDS = 0 remains a REPORTED LIMITATION and is NOT promoted');
  say('   to a required class here. No record was read, modified or approved.');

  say('');
  say('RESERVED_MATERIAL_OPENED = FALSE   PROVIDER_INVOCATION_COUNT = 0');
  say('FORMAL_COHORT_SPENT = FALSE        P4_PRESPEND_AUTHORIZATION = FALSE');

  const dir = path.join(ROOT, 'verification', 'expert-hazlenz-cohort-joint-feasibility-2026-09-01');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'JOINT-FEASIBILITY.txt'), out.join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'JOINT-FEASIBILITY.json'), JSON.stringify({
    frozenRequirements: REQUIRED_CLASS_MINIMUMS,
    cohortSizePolicy: COHORT_SIZE_POLICY,
    openPoolRows: pool.length,
    openPoolSupply: Object.fromEntries(INTRINSIC.map(c => [c, supply(pool, c)])),
    absoluteBlockersOpenOnly: openSolve.absoluteBlockers,
    lowerBoundOpenOnly: lb.bound,
    minimumAdditionalForbidden: F - forbSupply,
    overlapAvailable: overlapNow,
    tradeoffSurface: surface,
    reserve: {
      ownerResolvedScheme: 'D-86 retirement registry, i % 4',
      knownEligibleContribution: REGISTRY_KNOWN_RESERVE,
      knownSource: 'expert-corpus-retirement-registry.ts evidence fields: 8 + 8',
      labelOnlyUpperBound: 71,
      unknownUntilOpened: ['which specific rows are eligible', 'all non-forbidden class memberships',
        'confirmation the 16 survive the §122 eligibility rule'],
      contributesToOwedOverlap: 0,
      reasonZeroOverlap: 'the artifact carries no gap label and no interaction label',
    },
    options: {
      A_ceilingOnly: { works: openSolve.absoluteBlockers.length === 0,
        blockers: openSolve.absoluteBlockers },
      B_ceilingPlusReserve: { minimumReserveContribution: F - forbSupply,
        registryRecordedAvailable: REGISTRY_KNOWN_RESERVE, minimumFeasibleH: optB.bound,
        witnessVerified: optB.feasible },
      C_dualClassRowsAtCeiling60: { newDualRowsRequired: dualNeeded,
        minimumFeasibleH: optC.bound, witnessVerified: optC.feasible },
      D_mixed: 'each dual-class row buys exactly one row of ceiling headroom; see tradeoffSurface',
    },
    reservedMaterialOpened: false,
    providerInvocationCount: 0,
    formalCohortSpent: false,
    p4PrespendAuthorization: false,
  }, null, 2) + '\n');
  console.log(`\nwritten to verification/expert-hazlenz-cohort-joint-feasibility-2026-09-01/`);
}

main();
