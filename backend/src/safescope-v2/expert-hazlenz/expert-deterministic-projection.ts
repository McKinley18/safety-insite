/**
 * EXPERT HAZLENZ -- deterministic -> Expert family-disposition projection. PRODUCTION.
 *
 * §119. This is the PROMOTION of the prototype at `scripts/lib/expert-deterministic-projection.ts`,
 * whose behaviour was hosted-confirmed in §118/D-130 (baseline R6 0/3 clean vs projected R6 3/3
 * clean, all six anti-rubber-stamp controls preserved, zero routing misses in either arm). The
 * meaning is unchanged: this file exists to move the accepted design onto the permanent path, NOT
 * to redesign it. Any behavioural difference from the prototype is a defect of this promotion.
 *
 * ==================== THE GAP THIS CLOSES ====================
 *
 * `buildExpertUserPrompt` renders `deterministicFindings` as a list of POSITIVE findings, with
 * "(none -- the deterministic engine established no finding)" for the empty case. There was no
 * third shape, so a family the engine EVALUATED AND EXCLUDED rendered identically to a family it
 * never considered. For R6 the engine resolves `29 CFR 1910.212(a)(1)` to `NOT_APPLICABLE` at 0.96
 * because `moving or accessible energy = CONTRADICTED`, and Expert was shown none of it -- while
 * prompt instruction 1 told it to raise any hazard "NOT already in the deterministic findings
 * above". §118 measured the consequence and the repair.
 *
 * ==================== IT DOES NOT DUPLICATE THE DETERMINISTIC ENGINE ====================
 *
 * `projectDeterministicDispositions` is a pure PROJECTION over decisions the deterministic layer
 * already produced (`applyEvidenceFoundation` -> `result.applicabilityDecisions`). It evaluates no
 * predicate, reads no observation text, and reaches no applicability conclusion of its own. The
 * parameter is structural rather than an `ApplicabilityDecision` import so this module stays free
 * of a dependency on the evidence foundation -- the caller supplies what it already has.
 *
 * ==================== CITATION-FREE BY NECESSITY ====================
 *
 * See `DeterministicFamilyDisposition` in the contract: `CITATION_SHAPED_PATTERN` refuses
 * `\d{2} CFR \d+` anywhere in Expert OUTPUT including prose, so projecting the decision's citation
 * would invite an echo that gets the whole analysis rejected. The family-label -> Expert-family map
 * below is what keeps the projection citation-free, and an unmapped family is DROPPED rather than
 * guessed at.
 */

import type {
  DeterministicControllingFact, DeterministicDisposition, DeterministicFamilyDisposition,
} from './expert-contract.types';

/**
 * Map the deterministic engine's regulatory `family` label onto the Expert hazard taxonomy.
 *
 * Explicit and small on purpose. A silent fallback would let an unmapped family be projected under
 * a wrong name, which is exactly the failure a projection must not introduce -- so an unmapped
 * family returns null and is DROPPED from the projection rather than guessed at.
 */
const FAMILY_LABEL_TO_EXPERT_FAMILY: ReadonlyArray<[RegExp, string]> = [
  [/machine guarding/i, 'machine_guarding'],
  [/hazardous energy control|lockout/i, 'lockout_tagout'],
  [/live electrical parts|electrical/i, 'electrical'],
  [/confined space/i, 'confined_space'],
  [/fall protection|fall arrest/i, 'fall_protection'],
  [/hazard communication|chemical/i, 'chemical_exposure'],
  [/powered industrial truck|mobile equipment|traffic/i, 'mobile_equipment'],
];

export function toExpertFamily(deterministicFamilyLabel: string): string | null {
  for (const [pattern, family] of FAMILY_LABEL_TO_EXPERT_FAMILY) {
    if (pattern.test(deterministicFamilyLabel)) return family;
  }
  return null;
}

/** Decision `status` -> the projected disposition. */
function toDisposition(status: string): DeterministicDisposition {
  switch (status) {
    case 'NOT_APPLICABLE': return 'NOT_APPLICABLE';
    case 'CONTRADICTED': return 'NOT_APPLICABLE';
    case 'SUPPORTED': return 'ACTIVE';
    default: return 'UNKNOWN';
  }
}

/**
 * THE PREDICATE-JUSTIFICATION GUARD.
 *
 * `evidence-foundation.ts`'s `decision()` resolves `status = notApplicable ? 'NOT_APPLICABLE' : ...`
 * BEFORE the predicate statuses are consulted, so a decision could historically read
 * `NOT_APPLICABLE` at 0.96 while its own `requiredPredicates` all read `SUPPORTED`. §117/D-129
 * repaired the machine-guarding instance of that, and §116 measured the cost of projecting such a
 * decision: fixture `V4`'s `machine_guarding` candidate, present 3/3 in the baseline arm,
 * disappeared 3/3 under an unguarded projection.
 *
 * This guard is retained on the permanent path even though §117 fixed the known instance, because
 * it is a general invariant and cheap: an exclusion is projectable only when at least one required
 * predicate is actually `CONTRADICTED` -- which is what "the observation affirmatively rules this
 * out" means. Where no predicate is contradicted the row is DROPPED and Expert sees exactly what it
 * saw before the projection existed. It never repairs the engine; it declines to relay an
 * incoherent determination.
 */
export function isExclusionPredicateJustified(
  status: string,
  requiredPredicates: ReadonlyArray<{ name: string; status: string }>,
): boolean {
  if (status !== 'NOT_APPLICABLE' && status !== 'CONTRADICTED') return true;
  return requiredPredicates.some(p => p.status === 'CONTRADICTED');
}

/**
 * Build the one-sentence rationale from the decision's OWN predicate statuses.
 *
 * Deliberately DERIVED rather than hand-written per family: a hand-written sentence would make the
 * projection a place where a human opinion could enter the model's input unchallenged, and would
 * not survive the engine changing its mind.
 */
function buildRationale(
  disposition: DeterministicDisposition,
  controllingFacts: DeterministicControllingFact[],
): string {
  const contradicted = controllingFacts.filter(f => f.status === 'CONTRADICTED').map(f => f.fact);
  const unknown = controllingFacts.filter(f => f.status === 'UNKNOWN').map(f => f.fact);
  if (disposition === 'NOT_APPLICABLE') {
    return contradicted.length
      ? `The deterministic layer evaluated this family and excluded it: the observation affirmatively `
        + `contradicts ${contradicted.map(f => `"${f}"`).join(' and ')}, so the conditions this family `
        + `protects against are not established as present.`
      : 'The deterministic layer evaluated this family and found its material threshold not met.';
  }
  if (disposition === 'UNKNOWN') {
    return `The deterministic layer evaluated this family and could not settle it: `
      + `${unknown.map(f => `"${f}"`).join(' and ')} ${unknown.length === 1 ? 'is' : 'are'} undetermined `
      + `on the stated facts.`;
  }
  if (disposition === 'CONTROLLED') {
    return 'The deterministic layer evaluated this family and found the condition present but controlled '
      + 'by a stated, verified control.';
  }
  return 'The deterministic layer evaluated this family and found it supported by the stated facts.';
}

/**
 * Project real deterministic applicability decisions into the Expert-facing disposition rows.
 *
 * `decisions` must be the genuine output of the deterministic layer -- in production,
 * `result.applicabilityDecisions` from `applyEvidenceFoundation`. Rows whose family cannot be
 * mapped into the Expert taxonomy are dropped, not guessed; so are exclusions the decision's own
 * predicates do not justify (see `isExclusionPredicateJustified`).
 *
 * Every row is stamped `DERIVED_FROM_PRODUCTION_ENGINE`. A caller that needs a constructed row for
 * a diagnostic must build it explicitly and stamp it `CONSTRUCTED_FOR_DIAGNOSTIC`; this function
 * never produces one, so a forged disposition cannot be mistaken for a derived one.
 */
export function projectDeterministicDispositions(
  decisions: ReadonlyArray<{
    family: string; status: string; confidence: number;
    requiredPredicates: ReadonlyArray<{ name: string; status: string }>;
  }>,
  evidenceQuotesByFamily: Readonly<Record<string, string[]>> = {},
): DeterministicFamilyDisposition[] {
  const rows: DeterministicFamilyDisposition[] = [];
  for (const d of decisions) {
    const hazardFamily = toExpertFamily(d.family);
    if (hazardFamily === null) continue;
    if (!isExclusionPredicateJustified(d.status, d.requiredPredicates)) continue;
    const disposition = toDisposition(d.status);
    const controllingFacts = d.requiredPredicates.map(p => ({
      fact: p.name, status: p.status as DeterministicControllingFact['status'],
    }));
    rows.push({
      hazardFamily,
      disposition,
      isActionable: disposition === 'ACTIVE',
      confidence: d.confidence,
      controllingFacts,
      rationale: buildRationale(disposition, controllingFacts),
      evidenceQuotes: evidenceQuotesByFamily[hazardFamily] ?? [],
      provenance: 'DERIVED_FROM_PRODUCTION_ENGINE',
    });
  }
  return rows;
}
