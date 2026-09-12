/**
 * §208 -- COMPUTE THE FIFTEEN PREREGISTERED GATES. ZERO PROVIDER CALLS.
 *
 * Gates are computed MECHANICALLY from the recorded verdicts and the frozen applicability matrix,
 * and only AFTER adjudication. This script is safe to run at any point because it reports
 * `AWAITING_ADJUDICATION` for any gate whose slots are not all filled -- it never guesses a missing
 * verdict, and it never treats an unfilled slot as a pass.
 *
 * THE FIVE OUTCOMES ARE NOT A BOOLEAN, and three of them are not passes:
 *   PASSED · FAILED · UNDETERMINED · COVERAGE_INSUFFICIENT · NOT_APPLICABLE
 * plus the pre-adjudication states AWAITING_ADJUDICATION and NOT_EXERCISED_ZERO_DENOMINATOR.
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

import { PREREGISTERED_GATES, ORDINARY_QUALITY_CRITERIA } from './lib/expert-207-gates';
import { preregistrationIdentity } from './lib/expert-207-preregistration';

const ROOT = join(__dirname, '..', '..');
const EVID = join(ROOT, 'verification', 'expert-hazlenz-fresh-cohort-execution-208-2026-09-08');
const RECOVERY = join(ROOT, 'verification', 'expert-hazlenz-verifier-recovery-208b-2026-09-08');
const ADJUDICATION = join(
  ROOT, 'verification', 'expert-hazlenz-frozen-cohort-adjudication-209-2026-09-08');

/**
 * --adjudication computes against the §209 PRODUCT-OWNER worksheet, which is the only worksheet
 * that can ever carry verdicts. --recovered computes against the §208B acceptance worksheet.
 * Default is the §208 worksheet. In every mode a gate with an open slot reports
 * AWAITING_ADJUDICATION: no missing judgment is filled, defaulted or inferred.
 */
const USE_ADJUDICATION = process.argv.includes('--adjudication');
const USE_RECOVERED = process.argv.includes('--recovered');
const OUT_DIR = USE_ADJUDICATION ? ADJUDICATION : USE_RECOVERED ? RECOVERY : EVID;
const SUFFIX = USE_ADJUDICATION ? '209' : USE_RECOVERED ? '208B' : '208';

const worksheetPath = join(OUT_DIR, `ADJUDICATION-WORKSHEET-${SUFFIX}.json`);
const scoringPath = join(EVID, 'DETERMINISTIC-SCORING-208.json');
if (!existsSync(worksheetPath)) throw new Error('§208: no adjudication worksheet');
if (!existsSync(scoringPath)) throw new Error('§208: no deterministic scoring');

const worksheet = JSON.parse(readFileSync(worksheetPath, 'utf8')) as any;
const scoring = JSON.parse(readFileSync(scoringPath, 'utf8')) as any;
const slots = worksheet.slots as any[];

const PASSING = new Set(['CORRECT']);
const NON_PASSING_HARD = new Set(['PARTIALLY_CORRECT', 'INCORRECT']);

interface GateResult {
  gateId: string;
  kind: string;
  threshold: string;
  minimumDenominator: number;
  achievedDenominator: number;
  slotsConsidered: number;
  slotsFilled: number;
  slotsNoOpportunity: number;
  ambiguousSlots: string[];
  failingSlots: Array<{ slotId: string; verdict: string }>;
  outcome: string;
  note: string;
}

function slotsForGate(gateId: string): any[] {
  return slots.filter(s => (s.contributesToGates as string[]).includes(gateId));
}

function evaluateHumanGate(gateId: string): GateResult {
  const def = PREREGISTERED_GATES.find(g => g.gateId === gateId);
  if (def === undefined) throw new Error(`§208: unknown gate ${gateId}`);
  const mine = slotsForGate(gateId);
  const noOpportunity = mine.filter(s => s.structuralNotExercised !== null);
  const live = mine.filter(s => s.structuralNotExercised === null);
  const filled = live.filter(s => typeof s.verdict === 'string' && s.verdict.length > 0);
  const notExercised = filled.filter(s => s.verdict === 'NOT_EXERCISED');
  const scored = filled.filter(s => s.verdict !== 'NOT_EXERCISED');
  const ambiguous = scored.filter(s => s.verdict === 'AMBIGUOUS');
  const failing = scored.filter(s => NON_PASSING_HARD.has(s.verdict as string));
  const achievedDenominator = scored.length;

  let outcome: string;
  let note: string;
  if (filled.length < live.length) {
    outcome = 'AWAITING_ADJUDICATION';
    note = `${live.length - filled.length} of ${live.length} slots with a genuine opportunity are `
      + 'still open. No gate is computed while slots are open.';
  } else if (ambiguous.length > 0 && def.kind === 'HARD_SAFETY_CRITICAL') {
    outcome = 'UNDETERMINED';
    note = 'an AMBIGUOUS verdict sits on a slot this hard gate depends on. UNDETERMINED blocks '
      + 'acceptance exactly as FAILED does and is never reported as a pass.';
  } else if (achievedDenominator < def.minimumDenominator) {
    outcome = 'COVERAGE_INSUFFICIENT';
    note = `the achieved denominator ${achievedDenominator} is below the preregistered minimum `
      + `${def.minimumDenominator}. This is NOT a pass.`;
  } else if (failing.length > 0) {
    outcome = 'FAILED';
    note = `${failing.length} slot(s) below CORRECT on a gate with no partial credit.`;
  } else {
    outcome = 'PASSED';
    note = `${achievedDenominator} slots, all CORRECT.`;
  }

  return {
    gateId,
    kind: def.kind,
    threshold: def.threshold,
    minimumDenominator: def.minimumDenominator,
    achievedDenominator,
    slotsConsidered: mine.length,
    slotsFilled: filled.length,
    slotsNoOpportunity: noOpportunity.length,
    ambiguousSlots: ambiguous.map(s => s.slotId as string),
    failingSlots: failing.map(s => ({ slotId: s.slotId as string, verdict: s.verdict as string })),
    outcome,
    note,
  };
}

const det = scoring.deterministicGateHalves;

const results: GateResult[] = [];
for (const g of PREREGISTERED_GATES) {
  if (g.gateId === 'G10') {
    const v = det.G10_provider_settlement_authority;
    results.push({
      gateId: 'G10', kind: g.kind, threshold: g.threshold,
      minimumDenominator: g.minimumDenominator,
      achievedDenominator: v.denominator as number,
      slotsConsidered: 0, slotsFilled: 0, slotsNoOpportunity: 0,
      ambiguousSlots: [], failingSlots: [],
      outcome: v.outcome as string,
      note: 'FULLY DETERMINISTIC. Every provider response was scanned for HazLenz-owned fields '
        + '(factKey, status, priority, settlement markers) and for the forbidden expert field '
        + 'names. No human judgment is required or budgeted.',
    });
  } else if (g.gateId === 'G11') {
    const v = det.G11_deterministic_authority;
    results.push({
      gateId: 'G11', kind: g.kind, threshold: g.threshold,
      minimumDenominator: g.minimumDenominator,
      achievedDenominator: 1,
      slotsConsidered: 0, slotsFilled: 0, slotsNoOpportunity: 0,
      ambiguousSlots: [], failingSlots: [],
      outcome: v.outcome as string,
      note: String(v.note),
    });
  } else if (g.gateId === 'G12') {
    const v = det.G12_governed_citation_boundary;
    const nSlots = slotsForGate('G12');
    const open = nSlots.filter(s => s.structuralNotExercised === null
      && (typeof s.verdict !== 'string' || s.verdict.length === 0));
    results.push({
      gateId: 'G12', kind: g.kind, threshold: g.threshold,
      minimumDenominator: g.minimumDenominator,
      achievedDenominator: v.denominator as number,
      slotsConsidered: nSlots.length, slotsFilled: nSlots.length - open.length,
      slotsNoOpportunity: nSlots.filter(s => s.structuralNotExercised !== null).length,
      ambiguousSlots: [], failingSlots: [],
      outcome: open.length > 0 && v.outcome === 'PASSED_SCAN_HALF'
        ? 'AWAITING_ADJUDICATION' : v.outcome as string,
      note: 'the deterministic citation and unsupplied-id scan is the containment half and is '
        + 'complete; axis N on the governed facts is the semantic half. A wrong id from WITHIN the '
        + 'supplied set is an axis-S error reported under OQ-6, NOT a G12 breach.',
    });
  } else if (g.gateId === 'G13') {
    const v = det.G13_rr7_preservation;
    results.push({
      gateId: 'G13', kind: g.kind, threshold: g.threshold,
      minimumDenominator: g.minimumDenominator,
      achievedDenominator: v.denominator as number,
      slotsConsidered: 0, slotsFilled: 0, slotsNoOpportunity: 0,
      ambiguousSlots: [], failingSlots: (v.failures as string[]).map(c => ({
        slotId: c, verdict: 'RR7_PRESERVATION_ABSENT',
      })),
      outcome: v.outcome as string,
      note: String(v.zeroDenominatorRule),
    });
  } else {
    results.push(evaluateHumanGate(g.gateId));
  }
}

// ---------------------------------------------------------------- ordinary quality

const oq = ORDINARY_QUALITY_CRITERIA.map(c => ({
  criterionId: c.criterionId,
  measuredOn: c.measuredOn,
  threshold: c.threshold,
  outcome: 'AWAITING_ADJUDICATION',
  note: 'ordinary-quality criteria are computed from the same recorded verdicts and cannot be '
    + 'evaluated before adjudication. No criterion may override a hard gate in either direction.',
}));

const hardFailures = results.filter(
  r => r.kind === 'HARD_SAFETY_CRITICAL'
    && ['FAILED', 'UNDETERMINED', 'COVERAGE_INSUFFICIENT'].includes(r.outcome));
const awaiting = results.filter(r => r.outcome === 'AWAITING_ADJUDICATION');

const out = {
  artifact: USE_ADJUDICATION ? 'SECTION_209_GATE_RESULTS'
    : USE_RECOVERED ? 'SECTION_208B_GATE_RESULTS' : 'SECTION_208_GATE_RESULTS',
  verifierEvidenceSource: (USE_RECOVERED || USE_ADJUDICATION)
    ? 'ACCEPTANCE_VERIFIER_EVIDENCE (§208B recovery), applied uniformly across all 24 facts'
    : 'DEFECTIVE_INPUT_DIAGNOSTIC_EVIDENCE (§208), superseded — not for acceptance',
  preregistrationIdentity: preregistrationIdentity(),
  computedFrom: 'the recorded verdicts and the frozen applicability matrix — mechanically, never by '
    + 'judgment',
  adjudicationComplete: awaiting.length === 0,
  suppliedVerdictCount: slots.filter(
    (s: any) => typeof s.verdict === 'string' && s.verdict.length > 0).length,
  totalSlots: slots.length,
  gates: results,
  hardGateFailures: hardFailures.map(r => ({ gateId: r.gateId, outcome: r.outcome, note: r.note })),
  ordinaryQuality: oq,
  ordinaryQualityOutcome: 'AWAITING_ADJUDICATION',
  acceptanceDetermination: awaiting.length > 0
    ? 'NOT_DETERMINABLE — adjudication is incomplete'
    : hardFailures.length > 0
      ? 'NOT_ACCEPTED — one or more hard safety-critical gates did not pass'
      : 'ALL_HARD_GATES_PASSED — ordinary-quality disposition still required',
  rule: 'no aggregate or ordinary-quality result may compensate for a failed hard gate, and neither '
    + 'UNDETERMINED nor COVERAGE_INSUFFICIENT is a pass.',
  generatedAt: new Date().toISOString(),
};

writeFileSync(join(OUT_DIR, `GATE-RESULTS-${SUFFIX}.json`), `${JSON.stringify(out, null, 2)}\n`);

console.log('================ §208 GATE RESULTS');
console.log(`  verdicts supplied : ${out.suppliedVerdictCount} of ${out.totalSlots}`);
console.log('');
console.log('  gate  kind                   denom/min  outcome');
for (const r of results) {
  console.log(`  ${r.gateId.padEnd(4)}  ${r.kind.padEnd(21)}  `
    + `${String(r.achievedDenominator).padStart(5)}/${String(r.minimumDenominator).padEnd(3)}  `
    + `${r.outcome}`);
}
console.log('');
console.log(`  acceptance determination: ${out.acceptanceDetermination}`);
console.log(`  wrote GATE-RESULTS-${SUFFIX}.json   provider calls: 0   database operations: 0`);
