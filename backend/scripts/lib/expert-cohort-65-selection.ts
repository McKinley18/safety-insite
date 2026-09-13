/**
 * EXPERT HAZLENZ -- the DETERMINISTIC 65-ROW COHORT SELECTION. §134, extracted in §135.
 *
 * Extracted so assembly and freeze read the SAME rule from one place. Two copies of a selection rule
 * is how a frozen cohort quietly stops matching the rule that is supposed to reproduce it.
 *
 * ==================== THE STRUCTURE IS FORCED, NOT CHOSEN ====================
 *
 * At |R| = 65 the composition is not a preference. Every admissible R has |OWED n R| >= 20 and
 * |FORBIDDEN n R| >= 48, and the whole pool holds only 3 rows that are both, so
 *
 *     65 = |R| >= |OWED n R| + |FORBIDDEN n R| - |both n R| >= 20 + 48 - 3 = 65
 *
 * Equality holds throughout, which forces exactly 3 both / 17 OWED-only / 45 FORBIDDEN-only / 0
 * neither. The rule below only decides WHICH, and it decides by frozen orderings alone.
 */

import * as fs from 'fs';
import * as path from 'path';
import {
  FORMAL_COHORT_ROW_CONTRACT_VERSION, classifyRow, type FormalCohortRow,
} from '../../src/hazlenz/expert-hazlenz/expert-cohort-contract';
import { REQUIRED_CLASS_MINIMUMS } from
  '../../src/hazlenz/expert-hazlenz/expert-cohort-composition';
import { toExpertFamily } from
  '../../src/hazlenz/expert-hazlenz/expert-deterministic-projection';
import { AUGMENTATION_ROWS } from
  '../../src/hazlenz/expert-hazlenz/fixtures/negative-control-augmentation-v1';
import { SEMANTIC_ROWS } from
  '../../src/hazlenz/expert-hazlenz/fixtures/semantic-augmentation-v1';
import { POPULATION_A } from '../../src/hazlenz/tests/hazlenz-decomposition-precision-corpus';
import { ACCEPTED_EXPERT_TAXONOMY } from './expert-cohort-supplemental-policy';
import { runDeterministicSide } from './expert-cohort-harness';

const ROOT = path.resolve(__dirname, '..', '..', '..');

/** The order in which each source was admitted to the formal cohort programme. */
export const SOURCE_RANK: readonly string[] = [
  'gauntlet.seed',        // §122, the first source opened for this cohort
  'Population A',         // §122, the declared supplemental source, admitted in the same phase
  'augmentation V2',      // §125
  'semantic §129',        // §129
  'D-86 offset 2',        // §133
  'D-86 offset 3',        // §133
];

/**
 * The declaration order of `REQUIRED_CLASS_MINIMUMS` in the frozen composition contract, filtered to
 * the intrinsic classes still free after the forced structure. Read out of the frozen contract
 * rather than retyped, so it cannot be quietly reordered to change which rows get picked.
 */
export const SECONDARY_PRIORITY: readonly string[] = Object.keys(REQUIRED_CLASS_MINIMUMS).filter(c =>
  !['GOVERNED_RECORD_SUPPLIED', 'NO_GOVERNED_RECORD', 'DISAGREEMENT_OPPORTUNITY',
    'CLARIFICATION_OWED', 'CLARIFICATION_NOT_OWED', 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL'].includes(c));

/**
 * §122 forbids the precision corpus as a source of M01 recall opportunity: the deterministic engine
 * was MEASURED against it, so a "miss" there would measure the corpus rather than the engine. The
 * engine still runs over those rows; only the flag is suppressed, so the suppression is visible.
 */
export const M01_INELIGIBLE_SOURCES: readonly string[] = ['Population A'];

export interface PoolRow {
  row: FormalCohortRow;
  source: string;
  sourceRank: number;
  missRecallOpportunity: boolean;
  classes: Set<string>;
}

export interface GauntletClassified {
  scenarioId: string; eligible: boolean; primary: string | null; secondaries: string[];
  forbiddenFromUnacceptable: string[]; severityExpectation?: string | null; observation: string;
  engineFamilies: string[]; d86Offset?: number;
  engineStates: Array<{ domainId: string; conditionState: string | null;
    correctionStatus: string | null; evidenceGaps: string[] }>;
}

/**
 * The §122 mechanical builder, UNCHANGED and copied field for field.
 *
 * The D-86 partitions and `gauntlet.seed` are partitions of the same corpus family; classifying them
 * by different rules would be a choice made after seeing the content.
 */
export function toCandidateRow(r: GauntletClassified): FormalCohortRow {
  const present = [r.primary!, ...r.secondaries];
  const forbidden = r.forbiddenFromUnacceptable.filter(f => !present.includes(f));
  const defensible = ACCEPTED_EXPERT_TAXONOMY.filter(f =>
    !present.includes(f) && !forbidden.includes(f));
  const negated = Array.from(new Set(
    r.engineStates
      .filter(s => s.conditionState === 'HISTORICAL' || s.conditionState === 'SAFE_VERIFIED')
      .map(s => toExpertFamily(s.domainId) ?? s.domainId)
      .filter(f => ACCEPTED_EXPERT_TAXONOMY.includes(f))));
  const lifeCritical = r.severityExpectation === 'critical' ? [r.primary!] : [];
  return {
    contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
    source: {
      rowId: r.scenarioId,
      observation: r.observation,
      inspectionContext: { location: null, task: null },
      jurisdiction: 'osha-general-industry',
      allowedHazardFamilies: [...ACCEPTED_EXPERT_TAXONOMY],
      governedStandards: [],
      answeredClarifications: [],
      supplementaryContext: [],
    },
    truth: {
      presentHazardFamilies: present,
      defensibleHazardFamilies: defensible,
      forbiddenHazardFamilies: forbidden,
      negatedOrSafeStateFamilies: negated,
      lifeCriticalHazardFamilies: lifeCritical,
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        'Mechanical candidate row from the opened reserve. Present and forbidden families are '
        + 'corpus labels mapped through the frozen toExpertFamily; defensible is the remainder of '
        + 'the accepted taxonomy, meaning the corpus said neither required nor unacceptable; '
        + "negated/safe-state is read from the deterministic engine's own condition states. "
        + 'Semantic truth fields are deliberately EMPTY -- this is a candidate, not a frozen key.',
    },
  };
}

/**
 * Project one Population A row into the frozen row contract.
 *
 * A MECHANICAL projection of an already-frozen corpus through a mapping the §122 supplemental policy
 * ALREADY DECLARES -- `SUPPLEMENTAL_PRIORITY` states outright that for
 * `FORBIDDEN_FAMILY_NEGATIVE_CONTROL`, "Any eligible Population A row: `forbiddenDomains` IS the
 * negative control". Nothing is judged and no truth is authored.
 *
 * Domains outside the accepted taxonomy are DROPPED rather than approximated, exactly as §132/§133
 * counted them.
 */
export function toPopulationARow(r: { id: string; category: string; observation: string;
  requiredDomains: string[]; forbiddenDomains: string[]; allowedDomains: string[] }): FormalCohortRow {
  const inTax = (d: string) => {
    const f = toExpertFamily(d) ?? d;
    return ACCEPTED_EXPERT_TAXONOMY.includes(f) ? f : null;
  };
  const present = Array.from(new Set(r.requiredDomains.map(inTax)
    .filter((f): f is string => f !== null)));
  const forbidden = Array.from(new Set(r.forbiddenDomains.map(inTax)
    .filter((f): f is string => f !== null))).filter(f => !present.includes(f));
  const defensible = ACCEPTED_EXPERT_TAXONOMY.filter(f =>
    !present.includes(f) && !forbidden.includes(f));
  return {
    contractVersion: FORMAL_COHORT_ROW_CONTRACT_VERSION,
    source: {
      rowId: `POPA-${r.id}`,
      observation: r.observation,
      inspectionContext: { location: null, task: null },
      jurisdiction: 'osha-general-industry',
      allowedHazardFamilies: [...ACCEPTED_EXPERT_TAXONOMY],
      governedStandards: [],
      answeredClarifications: [],
      supplementaryContext: [],
    },
    truth: {
      presentHazardFamilies: present,
      defensibleHazardFamilies: defensible,
      forbiddenHazardFamilies: forbidden,
      // NOT derived. §122's rule for this class requires reading the text for a negated, historical
      // or verified-safe form, which is a Level-3 judgment no assembly step is authorized to make.
      negatedOrSafeStateFamilies: [],
      // The precision corpus carries life-criticality on Population B groups only, never on A.
      lifeCriticalHazardFamilies: [],
      decisionCriticalGaps: [],
      recordedInteractions: [],
      authoringRationale:
        `Mechanical projection of frozen precision-corpus Population A row ${r.id} `
        + `(${r.category}) through the §122 supplemental policy. present = requiredDomains, `
        + 'forbidden = forbiddenDomains, both mapped through the frozen toExpertFamily and '
        + 'restricted to the accepted taxonomy; defensible is the remainder. No semantic field is '
        + 'authored: the corpus was frozen 2026-08-27, before any Expert provider output existed.',
    },
  };
}

/**
 * The pool of REAL cohort rows.
 *
 * POPULATION_B is STRUCTURALLY EXCLUDED, not omitted by choice: its rows carry no `forbiddenDomains`
 * and no decision-critical gaps, so they are neither OWED nor FORBIDDEN and the forced structure
 * admits none of them.
 */
export function buildPool(): PoolRow[] {
  const pool: PoolRow[] = [];
  const add = (row: FormalCohortRow, source: string) => {
    const det = runDeterministicSide(row);
    const emitted = new Set(det.familiesEmitted);
    const engineMissed = row.truth.presentHazardFamilies.some(f => !emitted.has(f));
    const missRecall = engineMissed && !M01_INELIGIBLE_SOURCES.includes(source);
    const classes = new Set<string>(classifyRow(row));
    if (missRecall) classes.add('DETERMINISTIC_MISS_RECALL_OPPORTUNITY');
    pool.push({ row, source, sourceRank: SOURCE_RANK.indexOf(source),
      missRecallOpportunity: missRecall, classes });
  };

  const seed = JSON.parse(fs.readFileSync(path.join(ROOT, 'verification',
    'expert-hazlenz-formal-cohort-assembly-2026-08-31', 'opening', 'reserved-classification.json'),
  'utf8')) as GauntletClassified[];
  for (const r of seed.filter(c => c.eligible)) add(toCandidateRow(r), 'gauntlet.seed');

  const d86 = JSON.parse(fs.readFileSync(path.join(ROOT, 'verification',
    'expert-hazlenz-d86-reserved-open-2026-09-01', 'opened-rows-classification.json'),
  'utf8')) as GauntletClassified[];
  for (const r of d86.filter(c => c.eligible)) add(toCandidateRow(r), `D-86 offset ${r.d86Offset}`);

  for (const a of POPULATION_A) add(toPopulationARow(a), 'Population A');
  for (const a of AUGMENTATION_ROWS) add(a.row, 'augmentation V2');
  for (const s of SEMANTIC_ROWS) add(s.row, 'semantic §129');

  return pool;
}

/** Source rank, then rowId ascending. Both frozen; neither derived from row content. */
export function canonical(a: PoolRow, b: PoolRow): number {
  if (a.sourceRank !== b.sourceRank) return a.sourceRank - b.sourceRank;
  return a.row.source.rowId < b.row.source.rowId ? -1
    : a.row.source.rowId > b.row.source.rowId ? 1 : 0;
}

const has = (r: PoolRow, c: string) => r.classes.has(c);
const minOf = (c: string) => REQUIRED_CLASS_MINIMUMS[c]?.minimum ?? 0;

export interface SelectionResult {
  selected: PoolRow[];
  deficits: string[];
  bucketSizes: { both: number; owedOnly: number; forbiddenOnly: number };
}

/**
 * Phase 0  take every OWED-and-FORBIDDEN row. All are required; there is no choice.
 * Phase 1  in the frozen class-priority order, close each remaining class deficit with the next
 *          canonical row that carries the class and whose bucket still has room.
 * Phase 2  fill each bucket to its forced size in canonical order.
 *
 * Nothing consults an observation, a difficulty estimate or a model behaviour.
 */
export function select(pool: PoolRow[], targetRows: number): SelectionResult {
  const O = minOf('CLARIFICATION_OWED');
  const F = minOf('FORBIDDEN_FAMILY_NEGATIVE_CONTROL');
  const owed = (r: PoolRow) => has(r, 'CLARIFICATION_OWED');
  const forb = (r: PoolRow) => has(r, 'FORBIDDEN_FAMILY_NEGATIVE_CONTROL');

  const both = pool.filter(r => owed(r) && forb(r)).sort(canonical);
  const owedOnly = pool.filter(r => owed(r) && !forb(r)).sort(canonical);
  const forbOnly = pool.filter(r => !owed(r) && forb(r)).sort(canonical);

  const nBoth = both.length;
  const nOwedOnly = O - nBoth;
  const nForbOnly = F - nBoth;
  const deficits: string[] = [];
  if (nBoth + nOwedOnly + nForbOnly !== targetRows) {
    deficits.push(`forced structure ${nBoth} + ${nOwedOnly} + ${nForbOnly} = `
      + `${nBoth + nOwedOnly + nForbOnly} does not equal targetRows ${targetRows}`);
  }
  if (owedOnly.length < nOwedOnly) {
    deficits.push(`OWED-not-FORBIDDEN pool has ${owedOnly.length}, needs ${nOwedOnly}`);
  }
  if (forbOnly.length < nForbOnly) {
    deficits.push(`FORBIDDEN-not-OWED pool has ${forbOnly.length}, needs ${nForbOnly}`);
  }
  if (deficits.length > 0) {
    return { selected: [], deficits,
      bucketSizes: { both: nBoth, owedOnly: nOwedOnly, forbiddenOnly: nForbOnly } };
  }

  const chosen = new Set<PoolRow>(both);
  const roomIn = (r: PoolRow): boolean => {
    if (owed(r) && forb(r)) return false;
    const bucket = owed(r) ? owedOnly : forbOnly;
    const cap = owed(r) ? nOwedOnly : nForbOnly;
    return bucket.filter(x => chosen.has(x)).length < cap;
  };
  const count = (c: string) => [...chosen].filter(r => has(r, c)).length;

  for (const cls of SECONDARY_PRIORITY) {
    const need = minOf(cls);
    for (const r of [...owedOnly, ...forbOnly].sort(canonical)) {
      if (count(cls) >= need) break;
      if (chosen.has(r) || !has(r, cls) || !roomIn(r)) continue;
      chosen.add(r);
    }
  }

  for (const [bucket, cap] of [[owedOnly, nOwedOnly], [forbOnly, nForbOnly]] as const) {
    for (const r of bucket) {
      if (bucket.filter(x => chosen.has(x)).length >= cap) break;
      if (!chosen.has(r)) chosen.add(r);
    }
  }

  return {
    selected: [...chosen].sort(canonical),
    deficits: [],
    bucketSizes: { both: nBoth, owedOnly: nOwedOnly, forbiddenOnly: nForbOnly },
  };
}

/** The row order, as one string. Its sha256 is the selection identity. */
export function selectionOrder(rows: PoolRow[]): string {
  return rows.map(r => r.row.source.rowId).join('|');
}
