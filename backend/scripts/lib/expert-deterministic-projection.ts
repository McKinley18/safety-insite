/**
 * DIAGNOSTIC-ONLY PROTOTYPE -- deterministic -> Expert state projection (§116).
 *
 * ==================== THIS FILE IS NOT PRODUCTION ====================
 *
 * It lives under `scripts/`, is imported by exactly one diagnostic harness, and is wired into no
 * controller, service, module, provider or customer path. It exists to make the §115/D-127
 * hypothesis `DETERMINISTIC_DECISION_NOT_PROJECTED_TO_EXPERT` testable at $0.00 before any
 * contract change is proposed. Nothing here may be promoted without its own authorization.
 *
 * ==================== THE GAP THIS PROTOTYPES ====================
 *
 * `buildExpertUserPrompt` renders `input.deterministicFindings` as a list of POSITIVE findings, and
 * renders the empty case as "(none -- the deterministic engine established no finding)". There is
 * no way to express the third thing the deterministic layer actually knows:
 *
 *      "this family WAS evaluated, and it resolved to NOT_APPLICABLE, for this reason."
 *
 * For R6 the production engine resolves `29 CFR 1910.212(a)(1)` to `NOT_APPLICABLE` at 0.96 with
 * `moving or accessible energy = CONTRADICTED`, and Expert is shown none of it. It sees only
 * `lockout_tagout / CONTROLLED` and is then told by prompt instruction 1 to raise any hazard "NOT
 * already in the deterministic findings above".
 *
 * ==================== TWO DESIGN CONSTRAINTS, BOTH LOAD-BEARING ====================
 *
 * 1. THE PROJECTION IS CITATION-FREE, AND THAT IS NOT AN OVERSIGHT.
 *    `FORBIDDEN_EXPERT_FIELD_NAMES` includes `citation`/`cfr`, and `CITATION_SHAPED_PATTERN`
 *    refuses `\d{2} CFR \d+` ANYWHERE in Expert output including prose. `ApplicabilityDecision`
 *    carries `citation: '29 CFR 1910.212(a)(1)'`. Projecting it would hand the model a citation and
 *    invite it to echo one back -- and the normalizer would then reject the ENTIRE analysis. The
 *    projection therefore carries the Expert taxonomy family and never the citation, the bundle, or
 *    the source. A projection that made Expert output un-normalizable would be worse than the gap.
 *
 * 2. IT IS STRUCTURED, NOT PROSE.
 *    `controllingFacts` carries the deterministic layer's OWN named predicates and their statuses,
 *    so Expert can see WHICH predicate decided the disposition rather than being handed a sentence
 *    to agree with. `moving or accessible energy = CONTRADICTED` is the whole R6 answer, and it is
 *    checkable against the observation rather than persuasive.
 */

import type { ExpertConditionState } from '../../src/safescope-v2/expert-hazlenz/expert-contract.types';

/**
 * What the deterministic layer concluded about ONE hazard family.
 *
 * `NOT_APPLICABLE` is the member that does not exist anywhere in the current Expert input, and it
 * is the reason this type exists. `EXPERT_CONDITION_STATES` has no member meaning "evaluated and
 * excluded" -- `NEGATED` is the nearest and means something else (a hazard asserted then negated),
 * so this prototype deliberately uses its OWN vocabulary rather than overloading the Expert one.
 * Whether the two should be unified is a contract decision, recorded as open.
 */
export type DeterministicDisposition = 'ACTIVE' | 'CONTROLLED' | 'NOT_APPLICABLE' | 'UNKNOWN';

export interface DeterministicControllingFact {
  /** The deterministic layer's own predicate name, verbatim. */
  fact: string;
  status: 'SUPPORTED' | 'NOT_SUPPORTED' | 'CONTRADICTED' | 'UNKNOWN' | 'NOT_APPLICABLE';
}

export interface DeterministicFamilyDisposition {
  /** Expert taxonomy family. NEVER a citation. */
  hazardFamily: string;
  disposition: DeterministicDisposition;
  isActionable: boolean;
  /** The engine's own confidence in this disposition. */
  confidence: number;
  /** The named predicates that produced the disposition, with their statuses. */
  controllingFacts: DeterministicControllingFact[];
  /** One citation-free sentence. Derived, never invented per-fixture. */
  rationale: string;
  /** Verbatim spans of the observation that established the controlling state facts. */
  evidenceQuotes: string[];
  /** Where this row came from, so a forged row is distinguishable from a derived one. */
  provenance: 'DERIVED_FROM_PRODUCTION_ENGINE' | 'CONSTRUCTED_FOR_DIAGNOSTIC';
}

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

/** `ApplicabilityDecision.status` -> the projected disposition. */
function toDisposition(status: string): DeterministicDisposition {
  switch (status) {
    case 'NOT_APPLICABLE': return 'NOT_APPLICABLE';
    case 'CONTRADICTED': return 'NOT_APPLICABLE';
    case 'SUPPORTED': return 'ACTIVE';
    default: return 'UNKNOWN';
  }
}

/**
 * Build a citation-free, one-sentence rationale from the decision's OWN predicate statuses.
 *
 * Deliberately derived rather than hand-written per family: a hand-written R6 sentence would be
 * exactly the "manually forge an R6-only answer" this phase's authorization forbids.
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
 * THE PREDICATE-JUSTIFICATION GUARD. Added after the first A/B run measured why it is needed.
 *
 * `evidence-foundation.ts` computes `notApplicable = guardPresent || energySafe` and passes it to
 * `decision()`, which SHORT-CIRCUITS: `status = notApplicable ? 'NOT_APPLICABLE' : ...` is decided
 * BEFORE the predicate statuses are consulted. A decision can therefore read `NOT_APPLICABLE` at
 * confidence 0.96 while every one of its own `requiredPredicates` reads `SUPPORTED`. Measured on
 * fixture `V4` (a second energy source still connected to live shop air):
 *
 *      status = NOT_APPLICABLE (0.96)
 *        general-industry jurisdiction = SUPPORTED
 *        machine guard condition       = SUPPORTED
 *        moving or accessible energy   = SUPPORTED     <-- says the hazard IS present
 *        current condition             = SUPPORTED
 *
 * That is an internally contradictory determination, and run 1 measured the cost of projecting it:
 * `V4`'s `machine_guarding` candidate, present 3/3 in the baseline arm, disappeared 3/3 under
 * projection. It is the ONLY genuine suppression the A/B produced.
 *
 * So the projection refuses to carry an exclusion that the decision's own predicates do not
 * support. An exclusion is projectable only when at least one required predicate is actually
 * CONTRADICTED -- which is what "the observation affirmatively rules this out" means. When no
 * predicate is contradicted the row is DROPPED and Expert simply sees what it sees today.
 *
 * This is a guard on the PROTOTYPE PROJECTION, not a change to `evidence-foundation.ts`. The
 * underlying engine defect is real, pre-existing, on a customer-authoritative surface, and is
 * reported rather than repaired here -- it needs its own authorization and its own safety analysis.
 */
export function isExclusionPredicateJustified(
  status: string,
  requiredPredicates: ReadonlyArray<{ name: string; status: string }>,
): boolean {
  if (status !== 'NOT_APPLICABLE' && status !== 'CONTRADICTED') return true;
  return requiredPredicates.some(p => p.status === 'CONTRADICTED');
}

/**
 * Project real `ApplicabilityDecision`s into the Expert-facing disposition rows.
 *
 * `decisions` must be the genuine output of `applyEvidenceFoundation`. Rows whose family cannot be
 * mapped into the Expert taxonomy are dropped, not guessed; so are exclusions the decision's own
 * predicates do not justify (see `isExclusionPredicateJustified`).
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

/**
 * Render the projection as the prompt block Expert would see.
 *
 * ==================== WHY THE OVERRIDE RULE IS STATED HERE ====================
 *
 * The architectural principle this phase was given is that Expert must NOT become a rubber stamp.
 * A block that only announced the deterministic conclusion would invite exactly that. So the block
 * states, in the same breath, the ONE thing that licenses an override and what it must contain --
 * the challenged disposition, the exact observation evidence, and the concrete current pathway the
 * deterministic rationale does not cover. Expert keeps its disagreement authority and is told how
 * to exercise it, rather than being told to defer.
 */
export function renderDeterministicDispositionBlock(
  rows: readonly DeterministicFamilyDisposition[],
): string {
  if (rows.length === 0) return '';
  const lines: string[] = [];
  lines.push('DETERMINISTIC FAMILY ASSESSMENTS ALREADY PERFORMED');
  lines.push('  These families were EVALUATED by the deterministic engine. This is different from a');
  lines.push('  family it never considered — do not treat an assessment below as a gap you must fill.');
  for (const r of rows) {
    lines.push(`  - ${r.hazardFamily}: ${r.disposition}`
      + `${r.isActionable ? ', actionable' : ', not actionable'}, confidence ${r.confidence}`);
    lines.push(`      why: ${r.rationale}`);
    for (const f of r.controllingFacts) lines.push(`      controlling fact: ${f.fact} = ${f.status}`);
    for (const q of r.evidenceQuotes) lines.push(`      established by: "${q}"`);
  }
  lines.push('');
  lines.push('  HOW TO USE THESE. You are a reviewer of these assessments, NOT a rubber stamp.');
  lines.push('  - If you agree, do not restate the assessment as a new candidate of the same family.');
  lines.push('  - You MAY still add a DIFFERENT hazard family the engine did not assess.');
  lines.push('  - You MAY override any assessment above, including a NOT_APPLICABLE one, and you');
  lines.push('    should whenever the observation supports it. An override is not discouraged and');
  lines.push('    high deterministic confidence is not a reason to withhold one.');
  lines.push('  - To override, your candidate must set relationshipToDeterministic to');
  lines.push('    CONTRADICTS_DETERMINISTIC and must name, in its reasoning, the CONCRETE CURRENT');
  lines.push('    FACT stated in the observation that the deterministic rationale does not cover —');
  lines.push('    for example a worker stated to be exposed right now, a second uncontrolled energy');
  lines.push('    source, or a control the observation itself says failed. Quote it.');
  lines.push('  - What is NOT an override: restating the physical fact the engine already weighed,');
  lines.push('    or a consequence that would only follow under a condition you supplied yourself.');
  return lines.join('\n');
}
