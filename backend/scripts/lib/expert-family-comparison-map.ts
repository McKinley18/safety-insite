/**
 * §153 EXPERT HAZLENZ -- THE FAMILY COMPARISON MAP. DEVELOPMENT INSTRUMENT ONLY.
 *
 * ==================== THE DEFECT THIS CLOSES, AND WHY §151'S REPAIR FAILED ====================
 *
 * §150 disclosed a family-alias defect (class D): authored truth said `suspended_loads`, the
 * deterministic engine emitted `cranes_hoists`, and union coverage read 6/7 for a hazard that WAS
 * covered. §151 "closed" it with a `CANONICAL_DETERMINISTIC_FAMILIES` list and a linter check.
 *
 * **§152 proved that repair wrong.** The list was populated with EXPERT-side names -- `machine_guarding`,
 * `confined_space_entry`, `material_handling_storage` -- and the linter passed because the list
 * matched the names the author used, not the names the engine emits. Coverage read 4/9 and was not
 * interpretable.
 *
 * ==================== THE ACTUAL FINDING, AND IT IS NOT AN ALIAS PROBLEM ====================
 *
 * Measured across every run record in §147-§152, the two sides are not one vocabulary with drift.
 * **They are two intentionally different taxonomies:**
 *
 *      DETERMINISTIC   29 families observed, sourced from the decomposition service's `domainId`
 *                      routing vocabulary -- `guarding_interlocks`, `conveyors`, `confined_space`,
 *                      `ground_control`, `slips_trips_falls`, `rigging_lifting`, ...
 *      EXPERT          29 families observed, sourced from each row's `allowedHazardFamilies` --
 *                      `machine_guarding`, `confined_space_entry`, `lockout_tagout`, `thermal_burn`,
 *                      `lone_working`, ...
 *      SHARED          12
 *      DETERMINISTIC-ONLY 17     EXPERT-ONLY 17
 *
 * The engine routes an observation fragment to a RESPONSE DOMAIN; Expert names a HAZARD FAMILY from a
 * per-row allowed vocabulary. Those are different jobs, and neither is canonical for the other.
 *
 *   >>> SO THIS MODULE DOES NOT DECLARE A CANONICAL VOCABULARY. It declares an EXPLICIT, DIRECTIONAL
 *   >>> COMPARISON MAP and reports what it cannot map, which is the thing §151 should have built.
 *
 * ==================== WHAT IS AND IS NOT CHANGED ====================
 *
 *   >>> NO PRODUCTION FAMILY IS RENAMED. Deterministic HazLenz is untouched. The Expert contract is
 *   >>> untouched. This module exists only so a DEVELOPMENT coverage diagnostic can compare two
 *   >>> vocabularies honestly instead of counting a covered hazard as a miss.
 *
 * Every entry below is justified from OBSERVED behaviour in the §147-§152 run records, not from an
 * authored assumption -- which is exactly the discipline §151 skipped.
 */

export const FAMILY_COMPARISON_MAP_VERSION =
  'hazlenz.expert.family-comparison-map.v1' as const;

/**
 * Deterministic families observed emitted by the engine across §147-§152 run records.
 *
 * This is a MEASURED list, not an authored one. A family absent here is not thereby impossible; it
 * is merely unobserved, and `classifyFamilyPair` reports that rather than guessing.
 */
export const OBSERVED_DETERMINISTIC_FAMILIES = [
  'atmospheric_hazard', 'chemical_transfer', 'combustible_dust', 'compressed_gas', 'confined_space',
  'conveyors', 'cranes_hoists', 'emergency_egress', 'environmental_spill', 'excavation_trenching',
  'fall_protection', 'fire_protection', 'first_aid_medical', 'ground_control', 'guarding_interlocks',
  'hazcom', 'hot_work', 'hydraulic_pneumatic_energy', 'machine_guarding', 'material_handling',
  'mobile_equipment', 'powered_industrial_trucks', 'pressure_systems', 'respiratory_protection',
  'rigging_lifting', 'slips_trips_falls', 'suspended_loads', 'training_competency',
  'ventilation_air_quality',
] as const;

/** Expert families observed emitted across the same records. */
export const OBSERVED_EXPERT_FAMILIES = [
  'atmospheric_hazard', 'chemical_inhalation_contact', 'chemical_release', 'combustible_dust',
  'confined_space_entry', 'electrical', 'emergency_equipment', 'excavation_trenching',
  'fall_protection', 'fire_explosion', 'hazcom', 'hot_work', 'lockout_tagout', 'lone_working',
  'machine_guarding', 'material_handling_storage', 'mobile_equipment', 'noise_exposure',
  'personal_protective_equipment', 'pressure_systems', 'respiratory_protection',
  'silica_respirable_dust', 'suspended_loads', 'thermal_burn', 'traffic_control',
  'training_procedure_supervision', 'ventilation_air_quality', 'walking_working_surfaces',
  'welding_fumes',
] as const;

/**
 * EXPERT family -> the deterministic families that would count as covering the same hazard.
 *
 * DIRECTIONAL and deliberately so: the question a coverage diagnostic asks is *"the truth says this
 * Expert-side family is present; did EITHER layer cover it?"* A deterministic family with no Expert
 * counterpart is not a defect, it is a routing domain Expert does not use.
 *
 * Every mapping is justified. Where two names are the same word they are omitted -- identity is
 * handled by `classifyFamilyPair` -- so this table holds only the CROSS-VOCABULARY cases.
 */
export const EXPERT_TO_DETERMINISTIC: Readonly<Record<string, readonly string[]>> = {
  // §150 RB-C1: truth said suspended_loads, the engine emitted cranes_hoists for one crane lift.
  suspended_loads: ['suspended_loads', 'cranes_hoists', 'rigging_lifting'],
  // §152 HS-E1: truth said machine_guarding, the engine routes guarding to guarding_interlocks.
  machine_guarding: ['machine_guarding', 'guarding_interlocks', 'conveyors'],
  // The engine's confined-space domain is the space; Expert's family is the entry.
  confined_space_entry: ['confined_space'],
  // Expert separates the energy-control act; the engine routes it to the guarding/interlock domain.
  lockout_tagout: ['guarding_interlocks', 'hydraulic_pneumatic_energy', 'conveyors'],
  material_handling_storage: ['material_handling', 'powered_industrial_trucks'],
  walking_working_surfaces: ['slips_trips_falls', 'ground_control', 'fall_protection'],
  chemical_release: ['chemical_transfer', 'environmental_spill', 'compressed_gas'],
  chemical_inhalation_contact: ['hazcom', 'ventilation_air_quality', 'respiratory_protection'],
  fire_explosion: ['fire_protection', 'hot_work', 'combustible_dust'],
  // §152 HS-C1: truth said emergency_equipment on an MRI screening row; the engine's nearest
  // domains are egress and first aid. Recorded because it is a WEAK mapping -- see WEAK_MAPPINGS.
  emergency_equipment: ['emergency_egress', 'first_aid_medical', 'fire_protection'],
  training_procedure_supervision: ['training_competency'],
  thermal_burn: ['first_aid_medical'],
  silica_respirable_dust: ['respiratory_protection', 'ventilation_air_quality'],
  welding_fumes: ['ventilation_air_quality', 'respiratory_protection', 'hot_work'],
  traffic_control: ['mobile_equipment', 'powered_industrial_trucks'],
  noise_exposure: [],
  electrical: [],
  lone_working: [],
  personal_protective_equipment: [],
};

/**
 * Mappings whose semantic distance is real, flagged so a diagnostic can report them separately.
 *
 * §152's `emergency_equipment` -> `emergency_egress` is the case that forced this: the two overlap
 * on emergency provision and differ on everything else, and quietly counting one as the other would
 * repeat §151's mistake in the opposite direction.
 */
export const WEAK_MAPPINGS: readonly string[] = [
  'emergency_equipment', 'thermal_burn', 'traffic_control',
];

/**
 * Expert families with NO deterministic counterpart at all.
 *
 * These are the families where the engine has no routing domain, so "covered by neither layer" is
 * arithmetically guaranteed if Expert misses them. A coverage diagnostic must say so rather than
 * present the miss as symmetric.
 */
export const EXPERT_ONLY_NO_DETERMINISTIC_ROUTE: readonly string[] =
  Object.entries(EXPERT_TO_DETERMINISTIC).filter(([, v]) => v.length === 0).map(([k]) => k);

export type FamilyPairClass =
  | 'IDENTICAL'
  | 'MAPPED'
  | 'MAPPED_WEAK'
  | 'NO_DETERMINISTIC_ROUTE'
  | 'UNMAPPED';

/**
 * Classify one Expert family against one deterministic family.
 *
 * `UNMAPPED` is a first-class answer and is never silently treated as a mismatch: it means the map
 * has nothing to say, which a reader must see rather than have decided for them.
 */
export function classifyFamilyPair(
  expertFamily: string, deterministicFamily: string,
): FamilyPairClass {
  if (expertFamily === deterministicFamily) return 'IDENTICAL';
  const mapped = EXPERT_TO_DETERMINISTIC[expertFamily];
  if (mapped === undefined) return 'UNMAPPED';
  if (mapped.length === 0) return 'NO_DETERMINISTIC_ROUTE';
  if (!mapped.includes(deterministicFamily)) return 'UNMAPPED';
  return WEAK_MAPPINGS.includes(expertFamily) ? 'MAPPED_WEAK' : 'MAPPED';
}

/** Does any deterministic family emitted on this row cover the truth-present Expert family? */
export function deterministicCovers(
  truthFamily: string, deterministicEmitted: readonly string[],
): { covered: boolean; via: string | null; strength: FamilyPairClass | null } {
  for (const d of deterministicEmitted) {
    const cls = classifyFamilyPair(truthFamily, d);
    if (cls === 'IDENTICAL' || cls === 'MAPPED' || cls === 'MAPPED_WEAK') {
      return { covered: true, via: d, strength: cls };
    }
  }
  return { covered: false, via: null, strength: null };
}

/**
 * The union-coverage diagnostic, recomputed honestly.
 *
 * Reports THREE numbers rather than one, because §152 proved a single ratio hides the difference
 * between a real miss, a vocabulary mismatch and a family Expert alone can ever cover.
 */
export function unionCoverage(
  rows: ReadonlyArray<{ rowId: string; truthPresent: readonly string[];
    deterministicEmitted: readonly string[]; expertEmitted: readonly string[] }>,
): {
  version: string;
  truthPresentTotal: number;
  coveredByEither: number;
  coveredByExpertOnly: number;
  coveredByDeterministicViaMap: number;
  coveredViaWeakMappingOnly: number;
  missedByBoth: Array<{ rowId: string; family: string; expertHasNoDeterministicRoute: boolean }>;
  perRow: Array<{ rowId: string; family: string; covered: boolean; by: string; via: string | null;
    strength: FamilyPairClass | null }>;
} {
  let total = 0, either = 0, expertOnly = 0, detViaMap = 0, weakOnly = 0;
  const missed: Array<{ rowId: string; family: string; expertHasNoDeterministicRoute: boolean }> = [];
  const perRow: Array<{ rowId: string; family: string; covered: boolean; by: string;
    via: string | null; strength: FamilyPairClass | null }> = [];

  for (const r of rows) {
    for (const fam of r.truthPresent) {
      total += 1;
      const byExpert = r.expertEmitted.includes(fam);
      const det = deterministicCovers(fam, r.deterministicEmitted);
      if (byExpert) {
        either += 1; expertOnly += det.covered ? 0 : 1;
        perRow.push({ rowId: r.rowId, family: fam, covered: true, by: 'EXPERT',
          via: null, strength: null });
      } else if (det.covered) {
        either += 1; detViaMap += 1;
        if (det.strength === 'MAPPED_WEAK') weakOnly += 1;
        perRow.push({ rowId: r.rowId, family: fam, covered: true, by: 'DETERMINISTIC',
          via: det.via, strength: det.strength });
      } else {
        missed.push({ rowId: r.rowId, family: fam,
          expertHasNoDeterministicRoute: EXPERT_ONLY_NO_DETERMINISTIC_ROUTE.includes(fam) });
        perRow.push({ rowId: r.rowId, family: fam, covered: false, by: 'NEITHER',
          via: null, strength: null });
      }
    }
  }
  return {
    version: FAMILY_COMPARISON_MAP_VERSION,
    truthPresentTotal: total,
    coveredByEither: either,
    coveredByExpertOnly: expertOnly,
    coveredByDeterministicViaMap: detViaMap,
    coveredViaWeakMappingOnly: weakOnly,
    missedByBoth: missed,
    perRow,
  };
}
