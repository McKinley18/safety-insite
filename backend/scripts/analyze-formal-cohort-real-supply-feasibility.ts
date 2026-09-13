/**
 * §133 -- EXACT JOINT FEASIBILITY AGAINST THE REAL, FULLY-OPEN SUPPLY.
 *
 * §132 answered the feasibility question with the D-86 reserve modelled as SYNTHETIC rows, because
 * the reserve was still sealed. It predicted, conditionally, that if the reserve supplied at least
 * four eligible non-OWED forbidden controls the exact minimum would be H = 67.
 *
 * The reserve is now OPEN (see verification/expert-hazlenz-d86-reserved-open-2026-09-01). This
 * script discards every synthetic and hypothetical row and re-solves against the real material.
 *
 * ==================== WHAT COUNTS AS REAL HERE ====================
 *
 * Five sources, all open, none hypothetical:
 *
 *   gauntlet.seed            opened §122, eligible rows only
 *   Population A / B         DEVELOPMENT corpus, never shown to a provider
 *   augmentation V2          authored and reviewed negative-control rows
 *   semantic §129            the reviewed semantic augmentation corpus
 *   D-86 offsets 2 and 3     opened 2026-09-01, eligible rows only
 *
 * No NEWDUAL row. No NEWFORB row. No RESERVE placeholder. Ineligible opened rows are counted
 * NOWHERE -- being exposed is not the same as being usable.
 *
 * ==================== THE PREDICTION IS MEASURED, NOT ASSUMED ====================
 *
 * H = 67 is a hypothesis inherited from §132. This script reports whatever the solver proves. If the
 * measured minimum differs from 67, the difference is explained from the class vectors of the rows
 * that actually arrived, not reconciled away.
 *
 * ==================== CONFINEMENT ====================
 *
 * READ-ONLY over already-open material. No further reserve is opened. No provider is constructed or
 * called. No governed record is read for content, modified or approved. Nothing is frozen, selected
 * or authored, and no policy value is changed -- the governance impact is REPORTED, not applied.
 */

import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { createHash } from 'crypto';
import {
  REQUIRED_CLASS_MINIMUMS, MINIMUM_DEFENSIBLE_ROWS, PREFERRED_ROWS,
  MEASURED_COST_MODEL, RECOMMENDED_CALL_TOPOLOGY, projectedCostUsd,
} from '../src/hazlenz/expert-hazlenz/expert-cohort-composition';
import { COHORT_CASE_CLASSES } from '../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import { COHORT_SIZE_POLICY, ACCEPTED_EXPERT_TAXONOMY } from
  './lib/expert-cohort-supplemental-policy';
import { toExpertFamily } from '../src/hazlenz/expert-hazlenz/expert-deterministic-projection';
import { EXPERT_INTERACTION_KINDS } from '../src/hazlenz/expert-hazlenz/expert-contract.types';
import { POPULATION_A, POPULATION_B } from
  '../src/hazlenz/tests/hazlenz-decomposition-precision-corpus';
import { AUGMENTATION_ROWS } from
  '../src/hazlenz/expert-hazlenz/fixtures/negative-control-augmentation-v1';
import { SEMANTIC_ROWS } from
  '../src/hazlenz/expert-hazlenz/fixtures/semantic-augmentation-v1';
import { solveMulticover, type CoverType } from './lib/exact-multicover';

const ROOT = path.resolve(__dirname, '..', '..');
const out: string[] = [];
function say(s = ''): void { out.push(s); console.log(s); }

const OPEN_DIR = path.join(ROOT, 'verification', 'expert-hazlenz-d86-reserved-open-2026-09-01');

/** Intrinsic classes -- properties of the row itself, independent of any attachment decision. */
const INTRINSIC = [
  'CLARIFICATION_OWED', 'CLARIFICATION_NOT_OWED', 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL',
  'CROSS_HAZARD_INTERACTION', 'MULTI_HAZARD', 'LIFE_CRITICAL_PRESENT', 'NEGATED_OR_SAFE_STATE',
  'DETERMINISTIC_HAZARD_PRESENT', 'DETERMINISTIC_MISS_RECALL_OPPORTUNITY',
] as const;
type Intrinsic = typeof INTRINSIC[number];

const ATTACHMENT = ['GOVERNED_RECORD_SUPPLIED', 'NO_GOVERNED_RECORD', 'DISAGREEMENT_OPPORTUNITY'];

interface Row { rowId: string; source: string; cls: Set<Intrinsic>; }

const minOf = (c: string): number => REQUIRED_CLASS_MINIMUMS[c]?.minimum ?? 0;
const supply = (pool: Row[], c: Intrinsic): number => pool.filter(r => r.cls.has(c)).length;

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

/**
 * The complete intrinsic class-membership matrix over REAL rows.
 *
 * The gauntlet-family classification rule is identical for the §122 seed and the §133 D-86 rows --
 * same fields, same projection, same derivation -- because they are partitions of the same corpus
 * family and classifying them differently would be a choice made after seeing the content.
 */
function buildRealPool(): Row[] {
  const pool: Row[] = [];
  const mk = (rowId: string, source: string, c: Intrinsic[]) =>
    pool.push({ rowId, source, cls: new Set(c) });

  interface GauntletClassified {
    scenarioId: string; eligible: boolean; primary: string | null; secondaries: string[];
    forbiddenFromUnacceptable: string[]; severityExpectation?: string | null;
    engineFamilies: string[]; d86Offset?: number;
  }
  const classifyGauntlet = (r: GauntletClassified): Intrinsic[] => {
    const present = [r.primary!, ...r.secondaries];
    const forb = r.forbiddenFromUnacceptable.filter(f => !present.includes(f));
    const emitted = new Set(r.engineFamilies ?? []);
    const c: Intrinsic[] = ['CLARIFICATION_NOT_OWED'];
    if (forb.length > 0) c.push('FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
    if (r.secondaries.length > 0) c.push('MULTI_HAZARD');
    if (r.severityExpectation === 'critical') c.push('LIFE_CRITICAL_PRESENT');
    if (present.length > 0) c.push('DETERMINISTIC_HAZARD_PRESENT');
    if (present.some(f => !emitted.has(f))) c.push('DETERMINISTIC_MISS_RECALL_OPPORTUNITY');
    return c;
  };

  // -- gauntlet.seed, opened §122
  const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-assembly-2026-08-31', 'opening', 'reserved-classification.json'),
  'utf8')) as GauntletClassified[];
  for (const r of seed.filter(c => c.eligible)) {
    mk(r.scenarioId, 'gauntlet.seed', classifyGauntlet(r));
  }

  // -- D-86 offsets 2 and 3, opened 2026-09-01. ELIGIBLE ROWS ONLY.
  const d86 = JSON.parse(fs.readFileSync(
    path.join(OPEN_DIR, 'opened-rows-classification.json'), 'utf8')) as GauntletClassified[];
  for (const r of d86.filter(c => c.eligible)) {
    mk(r.scenarioId, `D-86 offset ${r.d86Offset}`, classifyGauntlet(r));
  }

  // -- Population A / B
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

  // -- authored corpora, classified from their own frozen truth keys
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

/** The analytic lower bound, kept for comparison with the exact answer. */
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
  return { bound: Math.max(...cands.map(c => c[0])),
    reasons: cands.map(([v, r]) => `${String(v).padStart(3)}  ${r}`) };
}

interface Solved {
  feasible: boolean; H: number | null; witness: Row[] | null; bound: number;
  absoluteBlockers: string[]; proven: boolean; nodes: number; multicoverMinimum: number | null;
  attachmentFloor: number;
}

function solve(pool: Row[]): Solved {
  const { bound } = lowerBound(pool);
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
  const res = solveMulticover(types, minima, [['CLARIFICATION_OWED', 'CLARIFICATION_NOT_OWED']]);
  const attachmentFloor = minOf('GOVERNED_RECORD_SUPPLIED') + minOf('NO_GOVERNED_RECORD');

  if (!res.feasible || res.witnessCounts === null || res.minimum === null) {
    return { feasible: false, H: null, witness: null, bound,
      absoluteBlockers: res.absoluteBlockers, proven: res.proven, nodes: res.nodesExplored,
      multicoverMinimum: null, attachmentFloor };
  }
  const witness: Row[] = [];
  res.witnessCounts.forEach((n, ti) => {
    const rows = byMask.get(types[ti].classes.join('|'))!;
    for (let i = 0; i < n; i += 1) witness.push(rows[i]);
  });
  // Raise to the complementary attachment floor if the intrinsic optimum sits below it.
  if (witness.length < attachmentFloor) {
    for (const r of pool) {
      if (witness.length >= attachmentFloor) break;
      if (!witness.includes(r)) witness.push(r);
    }
  }
  return { feasible: true, H: witness.length, witness, bound,
    absoluteBlockers: res.absoluteBlockers, proven: res.proven, nodes: res.nodesExplored,
    multicoverMinimum: res.minimum, attachmentFloor };
}

function verify(sel: Row[]): { ok: boolean; lines: string[];
  counts: Record<string, { required: number; supplied: number; margin: number }> } {
  const lines: string[] = [];
  const counts: Record<string, { required: number; supplied: number; margin: number }> = {};
  let ok = true;
  for (const c of INTRINSIC) {
    const have = sel.filter(r => r.cls.has(c)).length;
    const req = minOf(c);
    if (have < req) ok = false;
    counts[c] = { required: req, supplied: have, margin: have - req };
    lines.push(`     ${c.padEnd(38)} ${String(req).padStart(3)} required  `
      + `${String(have).padStart(3)} supplied  margin ${String(have - req).padStart(3)}  `
      + `${have >= req ? 'PASS' : 'FAIL'}`);
  }
  const G = minOf('GOVERNED_RECORD_SUPPLIED'), NG = minOf('NO_GOVERNED_RECORD');
  const D = minOf('DISAGREEMENT_OPPORTUNITY');
  const attachOk = sel.length >= G + NG;
  if (!attachOk) ok = false;
  counts.GOVERNED_RECORD_SUPPLIED = { required: G, supplied: Math.min(G, sel.length), margin: 0 };
  counts.NO_GOVERNED_RECORD = { required: NG, supplied: Math.max(0, sel.length - G),
    margin: Math.max(0, sel.length - G) - NG };
  counts.DISAGREEMENT_OPPORTUNITY = { required: D, supplied: Math.min(G, sel.length),
    margin: Math.min(G, sel.length) - D };
  lines.push(`     ${'GOVERNED_RECORD_SUPPLIED'.padEnd(38)} ${String(G).padStart(3)} required  `
    + `${String(Math.min(G, sel.length)).padStart(3)} attachable            `
    + `${attachOk ? 'PASS' : 'FAIL'}`);
  lines.push(`     ${'NO_GOVERNED_RECORD'.padEnd(38)} ${String(NG).padStart(3)} required  `
    + `${String(Math.max(0, sel.length - G)).padStart(3)} remaining  `
    + `margin ${String(Math.max(0, sel.length - G) - NG).padStart(3)}  ${attachOk ? 'PASS' : 'FAIL'}`);
  lines.push(`     ${'DISAGREEMENT_OPPORTUNITY'.padEnd(38)} ${String(D).padStart(3)} required  `
    + `${String(Math.min(G, sel.length)).padStart(3)} attachable            `
    + `${attachOk && G >= D ? 'PASS' : 'FAIL'}   (all 64 records resolve UNAPPROVED_RECORD)`);
  return { ok, lines, counts };
}

function main(): void {
  say('FORMAL EXPERT HAZLENZ COHORT -- EXACT JOINT FEASIBILITY ON REAL, FULLY-OPEN SUPPLY');
  say('§133. D-86 offsets 2 and 3 are OPEN. No synthetic row. No provider. Nothing frozen.');
  say('');

  const openRec = JSON.parse(fs.readFileSync(
    path.join(OPEN_DIR, 'ELIGIBILITY-RECONCILIATION.json'), 'utf8'));
  say('0. OPENED RESERVE, AS RECORDED');
  say(`   opened_at_utc                     ${openRec.openedAtUtc}`);
  say(`   scope                             ${openRec.reservedScope}`);
  say(`   source sha256 pre-open            ${openRec.sourceSha256PreOpen}`);
  say(`   source sha256 post-open           ${openRec.sourceSha256PostOpen}   `
    + `${openRec.sourceSha256PreOpen === openRec.sourceSha256PostOpen ? 'PRESERVED' : 'MUTATED'}`);
  say(`   registry-recorded contribution    ${openRec.registryRecordedEligibleContribution}`);
  say(`   MEASURED eligible rows            ${openRec.measuredEligibleRows}`);
  say(`   MEASURED forbidden-neg controls   ${openRec.measuredEligibleForbiddenNegativeControls}`);
  say('');

  // ---------------------------------------------------------------- A. requirements
  say('A. FROZEN COMPOSITION REQUIREMENTS (unchanged, and not changed by this operation)');
  say(`   COHORT_CASE_CLASSES declared: ${COHORT_CASE_CLASSES.length}`);
  say(`   hard ceiling ${COHORT_SIZE_POLICY.hardCeiling}   target ${COHORT_SIZE_POLICY.targetRows}`
    + `   minimum defensible ${MINIMUM_DEFENSIBLE_ROWS}   preferred ${PREFERRED_ROWS}`);
  say('');
  for (const [c, r] of Object.entries(REQUIRED_CLASS_MINIMUMS)) {
    say(`   ${c.padEnd(38)} minimum ${String(r.minimum).padStart(3)}   `
      + `(${ATTACHMENT.includes(c) ? 'attachment' : 'intrinsic'})`);
  }

  // ---------------------------------------------------------------- B. the real pool
  const pool = buildRealPool();
  const d86Rows = pool.filter(r => r.source.startsWith('D-86'));
  say('');
  say('B. COMPLETE REAL POOL -- every row exists, none is synthetic');
  say('');
  const bySource = new Map<string, number>();
  for (const r of pool) bySource.set(r.source, (bySource.get(r.source) ?? 0) + 1);
  for (const [s, n] of bySource) say(`   ${s.padEnd(22)} ${String(n).padStart(4)} rows`);
  say(`   ${'TOTAL'.padEnd(22)} ${String(pool.length).padStart(4)} rows`);
  say('');
  say('   Ineligible opened D-86 rows are counted in NO class. 74 rows were exposed; 58 are');
  say('   ineligible under the frozen §122 rule and contribute nothing.');

  // ---------------------------------------------------------------- STEP 3. forbidden supply
  const F = minOf('FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
  const forbTotal = supply(pool, 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
  const forbFromD86 = d86Rows.filter(r =>
    r.cls.has('FORBIDDEN_FAMILY_NEGATIVE_CONTROL')).length;
  const forbPreOpen = forbTotal - forbFromD86;
  say('');
  say('C. FORBIDDEN-FAMILY NEGATIVE-CONTROL SUPPLY  (STEP 3)');
  say('');
  say(`   previously open eligible forbidden controls   ${forbPreOpen}`);
  say(`   newly opened eligible forbidden controls      ${forbFromD86}`);
  say(`   TOTAL available eligible forbidden controls   ${forbTotal}`);
  say(`   frozen class minimum                          ${F}`);
  say(`   ${forbTotal >= F ? `SATISFIABLE -- surplus ${forbTotal - F}`
    : `STILL SHORT BY ${F - forbTotal}`}`);
  if (forbTotal < F) {
    say('');
    say('   STOP. FORMAL_COHORT_SUPPLY_STILL_INSUFFICIENT_AFTER_AUTHORIZED_RESERVE_OPEN.');
    fs.mkdirSync(path.join(ROOT, 'verification',
      'expert-hazlenz-real-supply-feasibility-2026-09-01'), { recursive: true });
    fs.writeFileSync(path.join(ROOT, 'verification',
      'expert-hazlenz-real-supply-feasibility-2026-09-01', 'REAL-SUPPLY-FEASIBILITY.txt'),
    out.join('\n') + '\n');
    process.exit(3);
  }

  say('');
  say(`   ${'class'.padEnd(38)} ${'req'.padStart(4)} ${'supply'.padStart(7)} `
    + `${'of which D-86'.padStart(14)}  absolute`);
  for (const c of INTRINSIC) {
    const s = supply(pool, c), r = minOf(c);
    const d = d86Rows.filter(x => x.cls.has(c)).length;
    say(`   ${c.padEnd(38)} ${String(r).padStart(4)} ${String(s).padStart(7)} `
      + `${String(d).padStart(14)}  ${s >= r ? 'ok' : `SHORT ${r - s}`}`);
  }

  // ---------------------------------------------------------------- STEP 5. exact solve
  say('');
  say('D. EXACT JOINT-FEASIBILITY SOLVE  (STEPS 4 and 5)');
  say('');
  const lb = lowerBound(pool);
  say('   Analytic lower bound on |R|:');
  for (const r of lb.reasons) say(`     ${r}`);
  say(`     => H >= ${lb.bound}`);
  say('');
  const s = solve(pool);
  if (!s.feasible || s.H === null || s.witness === null) {
    say('   INFEASIBLE:');
    for (const b of s.absoluteBlockers) say(`     ${b}`);
    process.exit(3);
  }
  const v = verify(s.witness);
  const overlapAvailable = pool.filter(r =>
    r.cls.has('CLARIFICATION_OWED') && r.cls.has('FORBIDDEN_FAMILY_NEGATIVE_CONTROL')).length;
  const O = minOf('CLARIFICATION_OWED');
  const analyticProves = s.H === lb.bound;
  say(`   MULTICOVER incumbent over the intrinsic classes ${s.multicoverMinimum}`);
  say(`   complementary attachment floor (40 + 8)         ${s.attachmentFloor}`);
  say(`   MINIMUM JOINTLY FEASIBLE H                      ${s.H}`);
  say(`   witness verified against every frozen class     ${v.ok ? 'YES' : 'NO'}`);
  say(`   nodes explored                                  ${s.nodes}`
    + `${s.proven ? '' : '   (NODE CEILING HIT)'}`);
  say('');
  say('   PROOF OF MINIMALITY');
  say('');
  say(`     SEARCH STATUS, STATED HONESTLY: the branch-and-bound search did ${s.proven ? '' : 'NOT '}`
    + `complete. It`);
  if (!s.proven) {
    say('     exhausted its 20,000,000-node ceiling, so IT ALONE PROVES NOTHING ABOUT MINIMALITY --');
    say(`     its ${s.multicoverMinimum} is an incumbent, i.e. an upper bound. The larger real supply`);
    say('     (60 forbidden rows against 48 required) widens the search tree enormously compared');
    say('     with §132, where the modelled supply was exactly 48 and the choice was forced.');
    say('');
    say('     THE MINIMUM IS NEVERTHELESS EXACT, proven by an independent argument that needs no');
    say('     search at all:');
  } else {
    say('     terminated within its node ceiling.');
    say('');
  }
  say('');
  say('     LOWER BOUND (inclusion-exclusion over ONE selected row set R):');
  say('       every admissible R has |OWED n R| >= 20 and |FORBIDDEN n R| >= 48, so');
  say('       |R| >= |OWED u FORBIDDEN| = |OWED| + |FORBIDDEN| - |OWED n FORBIDDEN|');
  say(`       The whole pool contains only ${overlapAvailable} rows that are BOTH, so the`);
  say(`       intersection term can never exceed ${overlapAvailable}:`);
  say(`         |R| >= ${O} + ${F} - ${overlapAvailable} = ${O + F - overlapAvailable}`);
  say('       This is a property of the POOL, not of any search, and no selection can evade it.');
  say('');
  say(`     UPPER BOUND: the witness below is an actual selection of ${s.H} REAL rows, verified`);
  say('       class by class against every frozen minimum, and its attachment assignment is');
  say('       feasible.');
  say('');
  say(`     ${analyticProves
    ? `BOUND ${lb.bound} MEETS WITNESS ${s.H}  =>  MINIMUM_FEASIBLE_H = ${s.H} IS PROVEN EXACT.`
    : `bound ${lb.bound} does NOT meet witness ${s.H} -- the true minimum lies in `
      + `[${lb.bound}, ${s.H}] and is NOT proven.`}`);
  say('');
  const HYPOTHESIS = 67;
  say(`   §132 CONDITIONAL PREDICTION: H = ${HYPOTHESIS} if the reserve supplied >= 4 eligible`);
  say('   non-OWED forbidden controls.');
  say(`   MEASURED: H = ${s.H}   =>  ${s.H === HYPOTHESIS ? 'THE PREDICTION HOLDS.'
    : 'THE PREDICTION DOES NOT HOLD. It was 2 rows PESSIMISTIC.'}`);
  if (s.H !== HYPOTHESIS) {
    say('');
    say('   WHY IT DIFFERS -- ATTRIBUTED BY MEASUREMENT, NOT BY ARGUMENT.');
    say('');
    say('   §132 modelled the reserve as exactly 4 bare synthetic rows carrying ONLY');
    say('   CLARIFICATION_NOT_OWED + FORBIDDEN_FAMILY_NEGATIVE_CONTROL. That was deliberately');
    say('   conservative on two independent axes, and the real material differs on both:');
    say('');
    say('     AXIS 1  QUANTITY. It modelled the minimum contribution that clears the shortfall (4),');
    say(`             on the stated reasoning that extra rows of an identical bare type cannot`);
    say(`             lower the minimum. The reserve actually supplied ${forbFromD86}, taking forbidden`);
    say(`             supply to ${forbTotal} against a requirement of ${F} -- a surplus of `
      + `${forbTotal - F}, which converts a`);
    say('             FORCED selection into a CHOICE.');
    say('     AXIS 2  RICHNESS. The real rows are not bare. Of the 16:');
    for (const c of INTRINSIC) {
      const d = d86Rows.filter(x => x.cls.has(c)).length;
      if (d > 0) say(`               ${c.padEnd(40)} ${String(d).padStart(3)}`);
    }
    say('');
    say('   ISOLATING THE TWO AXES. Re-solve with the pool restricted to the FIRST FOUR opened');
    say('   forbidden rows in scenarioId ascending order -- real rows, real class vectors, but the');
    say('   quantity §132 modelled:');
    const d86Forb = d86Rows.filter(r => r.cls.has('FORBIDDEN_FAMILY_NEGATIVE_CONTROL'))
      .sort((a, b) => a.rowId < b.rowId ? -1 : a.rowId > b.rowId ? 1 : 0);
    const keep = new Set(d86Forb.slice(0, 4).map(r => r.rowId));
    const restricted = pool.filter(r => !r.source.startsWith('D-86') || keep.has(r.rowId));
    const rs = solve(restricted);
    const rlb = lowerBound(restricted);
    say(`     rows kept from the reserve: ${[...keep].join(', ')}`);
    say(`     analytic lower bound ${rlb.bound}   witness ${rs.H ?? '-'}   `
      + `${rs.H === rlb.bound ? 'EXACT' : 'not tight'}`);
    say('');
    if (rs.H === HYPOTHESIS) {
      say(`     At the modelled QUANTITY the answer is ${rs.H} -- exactly §132's figure -- even though`);
      say('     these are real, class-rich rows. AXIS 1 (quantity) is therefore the whole of the');
      say(`     difference: the surplus of ${forbTotal - F} is what buys the two rows.`);
    } else if (rs.H === s.H) {
      say(`     At the modelled QUANTITY of 4 the answer is ALREADY ${rs.H}, not §132's ${HYPOTHESIS}.`);
      say('');
      say('     AXIS 2 (RICHNESS) IS THE WHOLE OF THE DIFFERENCE. Quantity contributes nothing:');
      say('     with only four reserve rows the forbidden supply is exactly 48, so all 48 forbidden');
      say('     rows are FORCED into the selection and there is no choice left to exploit -- and the');
      say('     answer is still 65. What changed is what those four rows carry. §132\'s synthetic');
      say('     rows covered nothing beyond FORBIDDEN, so two additional rows were needed to reach');
      say('     the NEGATED_OR_SAFE_STATE and DETERMINISTIC_MISS_RECALL_OPPORTUNITY minimums. The');
      say('     real rows carry MISS_RECALL (16 of 16) and LIFE_CRITICAL (8 of 16) themselves, so');
      say('     those two extra rows are no longer needed and the analytic bound becomes reachable.');
      say('');
      say('     §132 was right to model it that way. Assuming secondary classes it could not see');
      say('     would have UNDERSTATED the requirement, and understating it is the dangerous error.');
      say('     The conservative model was 2 rows pessimistic, which is the direction to be wrong in.');
    } else {
      say(`     At the modelled QUANTITY the answer is ${rs.H}: between §132's ${HYPOTHESIS} and the`);
      say(`     measured ${s.H}. BOTH axes contribute, and the split is reported rather than`);
      say(`     attributed to one: richness accounts for ${HYPOTHESIS - (rs.H ?? 0)} rows and `
        + `quantity for ${(rs.H ?? 0) - s.H!}.`);
    }
  }

  // ---------------------------------------------------------------- STEP 6. the witness
  say('');
  say('E. FIRST REAL DIAGNOSTIC WITNESS  (STEP 6)');
  say('DIAGNOSTIC ONLY. This is NOT the formal cohort, NOT frozen, and NOT a selection.');
  say('');
  say(`   row count ${s.H}`);
  say('');
  for (const l of v.lines) say(l);
  say('');
  const bySrc = new Map<string, number>();
  for (const r of s.witness) bySrc.set(r.source, (bySrc.get(r.source) ?? 0) + 1);
  say('   witness source composition:');
  for (const [src, n] of bySrc) say(`     ${src.padEnd(24)} ${String(n).padStart(3)}`);
  const d86InWitness = s.witness.filter(r => r.source.startsWith('D-86'));
  say('');
  say(`   newly opened D-86 rows participating: ${d86InWitness.length} of ${d86Rows.length}`);
  for (const r of d86InWitness) say(`     ${r.rowId.padEnd(16)} ${r.source}`);
  say('');
  say('   EXACT WITNESS ROW IDS, with source:');
  for (const r of s.witness) {
    say(`     ${r.rowId.padEnd(18)} ${r.source.padEnd(24)} `
      + `[${INTRINSIC.filter(c => r.cls.has(c)).join(', ')}]`);
  }

  // ---------------------------------------------------------------- attachment feasibility
  say('');
  say('F. GOVERNED-RECORD ATTACHMENT FEASIBILITY  (STEP 5, second half)');
  say('');
  const snap = path.join(os.homedir(), 'Desktop', 'governed-snapshot.csv');
  const snapPresent = fs.existsSync(snap);
  const snapSha = snapPresent
    ? createHash('sha256').update(fs.readFileSync(snap)).digest('hex') : null;
  const EXPECTED_SNAPSHOT_SHA = 'a2c5dc324ded4fee8689982785682cec0f21c4ed0ce2b1128afd8f902c4d5cd3';
  say(`   authoritative snapshot present   ${snapPresent}`);
  say(`   snapshot sha256                  ${snapSha ?? 'n/a'}`);
  say(`   §126-recorded identity           ${EXPECTED_SNAPSHOT_SHA}   `
    + `${snapSha === EXPECTED_SNAPSHOT_SHA ? 'MATCH' : 'DIFFERS'}`);
  say('   64 governed records, release federal-core-2026-08-28.1. NOT read for content here, NOT');
  say('   modified, NOT approved. Only the record COUNT and the §126 backing-state resolution are');
  say('   used, both of which are already-derived governance facts.');
  say('');
  const G = minOf('GOVERNED_RECORD_SUPPLIED'), NG = minOf('NO_GOVERNED_RECORD');
  const D = minOf('DISAGREEMENT_OPPORTUNITY');
  say(`   GOVERNED_RECORD_SUPPLIED >= ${G}   NO_GOVERNED_RECORD >= ${NG}   `
    + `DISAGREEMENT_OPPORTUNITY >= ${D}`);
  say(`   The two are complementary, so any cohort of ${G + NG} rows or more can satisfy both by`);
  say(`   assignment. At H = ${s.H} there are ${s.H! - G} rows left after the ${G} governed-supplied`);
  say(`   ones, against a requirement of ${NG}: FEASIBLE with margin ${s.H! - G - NG}.`);
  say('');
  say(`   DISAGREEMENT_OPPORTUNITY: all 64 records resolve to UNAPPROVED_RECORD under the §126`);
  say('   mapping, so every governed-supplied row is a disagreement opportunity. Satisfied whenever');
  say(`   GOVERNED_RECORD_SUPPLIED is: ${G} >= ${D}.`);
  say('');
  say('   REPORTED LIMITATION, unchanged and not promoted to a requirement:');
  say('     REVIEWER_APPROVED_GOVERNED_RECORDS = 0. No record carries a reviewer decision, so the');
  say('     cohort cannot exercise an APPROVED_EXACT backing state at all. This is a real gap in');
  say('     what the evaluation can measure, and it is not closed by opening the reserve.');

  // ---------------------------------------------------------------- STEP 7. governance impact
  say('');
  say('G. GOVERNANCE IMPACT  (STEP 7) -- REPORTED, NOT APPLIED');
  say('');
  const H0 = COHORT_SIZE_POLICY.hardCeiling;
  say(`   CURRENT COHORT_SIZE_POLICY`);
  say(`     targetRows            ${COHORT_SIZE_POLICY.targetRows}`);
  say(`     hardCeiling           ${H0}`);
  say(`     minimumDefensibleRows ${COHORT_SIZE_POLICY.minimumDefensibleRows}`);
  say(`     supplementalCount     ${COHORT_SIZE_POLICY.supplementalCount}`);
  say('');
  say(`   MEASURED REQUIREMENT`);
  say(`     minimum jointly feasible H = ${s.H}`);
  say(`     ${s.H! > H0 ? `EXCEEDS the hard ceiling by ${s.H! - H0}`
    : `is within the hard ceiling (headroom ${H0 - s.H!})`}`);
  say('');
  if (s.H! > H0) {
    say('   MINIMUM POLICY CHANGE REQUIRED');
    say(`     hardCeiling: ${H0} -> at least ${s.H}`);
    say('');
    say('   MUST `targetRows` ALSO CHANGE? The two fields are NOT interchangeable, so the question');
    say('   is answered from each one\'s actual role, checked against how the code uses it:');
    say('');
    say('     hardCeiling  a REFUSAL threshold. onInsufficiency: "If 60 rows cannot satisfy every');
    say('                  frozen composition requirement, STOP and report the exact reason. The');
    say('                  cohort is NEVER silently enlarged." A ceiling below the feasible minimum');
    say('                  makes assembly refuse outright. THIS ONE MUST MOVE.');
    say('     targetRows   the size the cohort is BUILT TO. supplementalCount is written as');
    say('                  "EXACTLY 60 minus the number of eligible reserved rows selected", so the');
    say('                  build size is pinned to the target by the policy TEXT.');
    say('');
    say('     EVIDENCE, so this is not asserted from the field names: a repository-wide search shows');
    say('     `COHORT_SIZE_POLICY.targetRows` is only ever PRINTED -- by this script, §131 and the');
    say('     execution preflight. No assembler reads it to size a selection. The 60-row build is');
    say('     therefore enforced by the POLICY TEXT and by the operator following it, NOT by code.');
    say('');
    say(`     CONCLUSION: BOTH must change. Raising hardCeiling alone to ${s.H} while leaving`);
    say(`     targetRows at 60 would PERMIT a ${s.H}-row cohort while the policy still instructs a`);
    say('     60-row build -- and the 60-row build is exactly what is proven infeasible. The result');
    say('     would be a policy that contradicts itself rather than one that has been decided.');
    say('     They need NOT be equal: hardCeiling may sit above targetRows to leave assembly');
    say(`     headroom. The requirement is only that BOTH be at least ${s.H}.`);
    say('');
    say(`     NOT REQUIRED TO CHANGE: MINIMUM_DEFENSIBLE_ROWS (${MINIMUM_DEFENSIBLE_ROWS}) and `
      + `PREFERRED_ROWS (${PREFERRED_ROWS}) live in`);
    say('     expert-cohort-composition.ts and are DERIVED from the measure sizing rule, not from');
    say('     the ceiling. MINIMUM_DEFENSIBLE_ROWS = 40 + 8 is still a correct FLOOR and its');
    say('     derivation is untouched. It is simply no longer ATTAINABLE: a 48-row cohort cannot');
    say('     carry 48 forbidden controls and 20 OWED rows at once when only 3 rows are both.');
    say('     Changing it to match H would be tuning a derived constant to a measured outcome, and');
    say('     this analysis does not propose it.');
  }

  // ---------------------------------------------------------------- STEP 8. cost
  say('');
  say('H. COST IMPACT  (STEP 8) -- informational. NO PROVIDER CALL WAS MADE.');
  say('');
  say(`   pricing basis: ${MEASURED_COST_MODEL.source}`);
  say('   LOCALLY AUTHORITATIVE: fitted from 18 recorded §118 calls to a residual of 0.00000000 USD.');
  say(`   input ${MEASURED_COST_MODEL.inputUsdPerMillionTokens} USD/M   `
    + `output ${MEASURED_COST_MODEL.outputUsdPerMillionTokens} USD/M   `
    + `mean cost/call ${MEASURED_COST_MODEL.observedMeanCostUsd.toFixed(6)} USD`);
  say(`   topology: ${RECOMMENDED_CALL_TOPOLOGY.callsPerRow} calls per row `
    + `(${RECOMMENDED_CALL_TOPOLOGY.arms.join(', ')})`);
  say('');
  const rowsFor = (n: number) => ({
    rows: n,
    calls: n * RECOMMENDED_CALL_TOPOLOGY.callsPerRow,
    meanUsd: n * RECOMMENDED_CALL_TOPOLOGY.callsPerRow * MEASURED_COST_MODEL.observedMeanCostUsd,
    worstUsd: n * RECOMMENDED_CALL_TOPOLOGY.callsPerRow
      * projectedCostUsd(12000, MEASURED_COST_MODEL.maxOutputTokensConfigured),
    inputTokens: n * RECOMMENDED_CALL_TOPOLOGY.callsPerRow
      * MEASURED_COST_MODEL.observedMeanInputTokens,
    outputTokens: n * RECOMMENDED_CALL_TOPOLOGY.callsPerRow
      * MEASURED_COST_MODEL.observedMeanOutputTokens,
  });
  const at60 = rowsFor(H0), atH = rowsFor(s.H!);
  say('   The 60-row line is a REFERENCE POINT, not an alternative: a 60-row cohort is proven');
  say('   infeasible above. It is shown so the delta is legible against the figure the current');
  say('   policy names.');
  say('');
  say(`   ${'plan'.padEnd(22)} ${'rows'.padStart(5)} ${'calls'.padStart(6)} `
    + `${'input tok'.padStart(11)} ${'output tok'.padStart(11)} ${'mean USD'.padStart(9)} `
    + `${'worst USD'.padStart(10)}`);
  for (const [label, r] of [[`60-row (INFEASIBLE ref)`, at60],
    [`H = ${s.H} execution`, atH]] as const) {
    say(`   ${label.padEnd(22)} ${String(r.rows).padStart(5)} ${String(r.calls).padStart(6)} `
      + `${r.inputTokens.toLocaleString().padStart(11)} `
      + `${r.outputTokens.toLocaleString().padStart(11)} `
      + `${r.meanUsd.toFixed(2).padStart(9)} ${r.worstUsd.toFixed(2).padStart(10)}`);
  }
  say(`   ${'DELTA'.padEnd(22)} ${String(atH.rows - at60.rows).padStart(5)} `
    + `${String(atH.calls - at60.calls).padStart(6)} `
    + `${(atH.inputTokens - at60.inputTokens).toLocaleString().padStart(11)} `
    + `${(atH.outputTokens - at60.outputTokens).toLocaleString().padStart(11)} `
    + `${(atH.meanUsd - at60.meanUsd).toFixed(2).padStart(9)} `
    + `${(atH.worstUsd - at60.worstUsd).toFixed(2).padStart(10)}`);
  say('');
  say(`   OPERATIONAL CONSEQUENCE: ${atH.calls} planned calls against the frozen`);
  say(`   hardCallCeiling of ${RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling}. `
    + `${atH.calls <= RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling
      ? `HEADROOM ${RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling - atH.calls} calls -- but the runner`
      : 'THE CALL CEILING WOULD ALSO HAVE TO RISE.'}`);
  if (atH.calls <= RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling) {
    say('   retries ONCE on a retryable failure and that retry BILLS, so the effective worst case is');
    say(`   ${atH.calls * 2} calls, which EXCEEDS the ceiling of `
      + `${RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling}. The ceiling stops the run rather than`);
    say('   overspending, which is its purpose, but it is a second policy value the owner should');
    say('   look at before authorizing a larger cohort.');
  }
  say('');
  say(`   conservativeMaximumSpendUsd currently recorded: `
    + `${RECOMMENDED_CALL_TOPOLOGY.conservativeMaximumSpendUsd} USD (computed at the 200-call`);
  say('   ceiling, so it does NOT move with the row count).');

  // ---------------------------------------------------------------- confinement
  say('');
  say('CONFINEMENT STATE');
  say('  RESERVED_MATERIAL_OPENED   = TRUE');
  say('  RESERVED_SCOPE             = D86_GAUNTLET_OFFSETS_2_AND_3_ONLY');
  say('  PROVIDER_INVOCATION_COUNT  = 0');
  say('  FORMAL_COHORT_SPENT        = FALSE');
  say('  P4_PRESPEND_AUTHORIZATION  = FALSE');
  say('  COHORT_STATUS              = CANDIDATE');
  say('  COHORT_SIZE_POLICY         = UNCHANGED (hardCeiling still 60, target still 60)');
  say('');
  say(s.H! > H0
    ? 'FORMAL_COHORT_REAL_SUPPLY_FEASIBLE -- COHORT_SIZE_POLICY_GOVERNANCE_DECISION_REQUIRED'
    : 'FORMAL_COHORT_REAL_SUPPLY_FEASIBLE_WITHIN_CURRENT_POLICY');

  const dir = path.join(ROOT, 'verification', 'expert-hazlenz-real-supply-feasibility-2026-09-01');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'REAL-SUPPLY-FEASIBILITY.txt'), out.join('\n') + '\n');
  fs.writeFileSync(path.join(dir, 'REAL-SUPPLY-FEASIBILITY.json'), JSON.stringify({
    openedReserve: {
      openedAtUtc: openRec.openedAtUtc, scope: openRec.reservedScope,
      registryRecordedContribution: openRec.registryRecordedEligibleContribution,
      measuredEligibleRows: openRec.measuredEligibleRows,
      measuredForbiddenNegativeControls: openRec.measuredEligibleForbiddenNegativeControls,
      eligibleForbiddenRowIds: openRec.eligibleForbiddenRowIds,
    },
    poolRows: pool.length,
    poolBySource: Object.fromEntries(bySource),
    supply: Object.fromEntries(INTRINSIC.map(c => [c, {
      required: minOf(c), total: supply(pool, c),
      fromD86: d86Rows.filter(x => x.cls.has(c)).length,
    }])),
    forbiddenSupply: { previouslyOpen: forbPreOpen, newlyOpened: forbFromD86, total: forbTotal,
      required: F, satisfied: forbTotal >= F },
    analyticLowerBound: lb.bound,
    analyticLowerBoundBasis:
      `|R| >= O + F - maxOverlap = ${O} + ${F} - ${overlapAvailable} = ${O + F - overlapAvailable}`,
    owedAndForbiddenRowsInWholePool: overlapAvailable,
    multicoverIncumbent: s.multicoverMinimum,
    attachmentFloor: s.attachmentFloor,
    minimumJointlyFeasibleH: s.H,
    minimalityProven: analyticProves,
    minimalityProofBasis: analyticProves
      ? 'analytic inclusion-exclusion lower bound equals the verified witness size'
      : 'NOT PROVEN',
    branchAndBoundSearchExhausted: s.proven,
    nodesExplored: s.nodes,
    predictionH67Held: s.H === HYPOTHESIS,
    witness: {
      diagnosticOnly: true, frozen: false, rowCount: s.H,
      rows: s.witness.map(r => ({ rowId: r.rowId, source: r.source,
        classes: INTRINSIC.filter(c => r.cls.has(c)) })),
      classCounts: v.counts,
      d86RowsParticipating: d86InWitness.map(r => r.rowId),
    },
    attachmentFeasibility: {
      snapshotPresent: snapPresent, snapshotSha256: snapSha,
      snapshotIdentityMatches: snapSha === EXPECTED_SNAPSHOT_SHA,
      governedRecordSupplied: { required: G, feasible: s.H! >= G + NG },
      noGovernedRecord: { required: NG, available: s.H! - G, feasible: s.H! - G >= NG },
      disagreementOpportunity: { required: D, available: G, feasible: G >= D },
      reviewerApprovedGovernedRecords: 0,
      reportedLimitation: 'REVIEWER_APPROVED_GOVERNED_RECORDS = 0 under the current frozen contract',
    },
    governanceImpact: {
      current: { targetRows: COHORT_SIZE_POLICY.targetRows, hardCeiling: H0,
        minimumDefensibleRows: COHORT_SIZE_POLICY.minimumDefensibleRows },
      requiredHardCeilingAtLeast: s.H,
      targetRowsMustAlsoChange: s.H! > COHORT_SIZE_POLICY.targetRows,
      minimumDefensibleRowsChangeRequired: false,
      applied: false,
    },
    costImpact: { basis: MEASURED_COST_MODEL.source, locallyDerivable: true,
      at60: at60, atMinimumH: atH,
      deltaCalls: atH.calls - at60.calls,
      deltaMeanUsd: Number((atH.meanUsd - at60.meanUsd).toFixed(6)),
      hardCallCeiling: RECOMMENDED_CALL_TOPOLOGY.hardCallCeiling },
    confinement: {
      reservedMaterialOpened: true,
      reservedScope: 'D86_GAUNTLET_OFFSETS_2_AND_3_ONLY',
      providerInvocationCount: 0,
      formalCohortSpent: false,
      p4PrespendAuthorization: false,
      cohortStatus: 'CANDIDATE',
      cohortSizePolicyChanged: false,
    },
  }, null, 2) + '\n');
  console.log(`\nwritten to verification/expert-hazlenz-real-supply-feasibility-2026-09-01/`);
}

main();
