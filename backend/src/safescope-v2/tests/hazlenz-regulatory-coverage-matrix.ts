// The InSite v1.0 REGULATORY COVERAGE MATRIX — hazard family × jurisdiction.
//
// Phase 4 of "Authoritative Regulatory Source Acquisition + Governed Corpus Expansion".
//
// This is deliberately NOT a citation-count matrix. The unit is a HazLenz hazard family in one
// declared jurisdiction, because that is the unit a customer experiences: "the engine found this
// hazard on my site — does it name the rule that governs it here?"
//
// Every cell names the provision that governs the family in that regime, and its status. A family
// that OSHA and MSHA regulate through structurally different provisions is recorded as two
// different answers, never as one citation reused across regimes.

export type CellStatus =
  | 'GOVERNED_COMPLETE'
  | 'SOURCE_ACQUIRED_NOT_GOVERNED'
  | 'AUTHORITATIVE_SOURCE_REQUIRED'
  | 'CONTEXT_DEPENDENT'
  | 'NO_STANDARD_APPLICABLE'
  | 'OUT_OF_V1_SCOPE'
  | 'UNVERIFIED';

export interface CoverageCell {
  citations: string[];
  status: CellStatus;
  note?: string;
}

export interface CoverageRow {
  family: string;
  oshaGeneralIndustry: CoverageCell;
  oshaConstruction: CoverageCell;
  msha: CoverageCell;
  /** Does selecting the right provision require context the observation may not carry? */
  applicabilityRequiresContext: boolean;
  /** Does the engine need to ask before a specific provision is defensible? */
  clarificationRequired: boolean;
  /** Does a finding-level rule exist today (evidence-foundation.ts)? */
  findingSupported: boolean;
}

const G = (citations: string[], note?: string): CoverageCell => ({ citations, status: 'GOVERNED_COMPLETE', note });
const NA = (note: string): CoverageCell => ({ citations: [], status: 'NO_STANDARD_APPLICABLE', note });
const REQ = (note: string): CoverageCell => ({ citations: [], status: 'AUTHORITATIVE_SOURCE_REQUIRED', note });

export const V1_COVERAGE_MATRIX: CoverageRow[] = [
  // ---- families already governed before this phase -----------------------
  { family: 'lockout_tagout',
    oshaGeneralIndustry: G(['29 CFR 1910.147']), oshaConstruction: G(['29 CFR 1926.417'], 'via the general-industry duty; construction LOTO is 1926.417 for electrical and 1926.702 for concrete equipment'),
    msha: G(['30 CFR 56.12016', '30 CFR 56.14105']),
    applicabilityRequiresContext: true, clarificationRequired: false, findingSupported: true },
  { family: 'electrical',
    oshaGeneralIndustry: G(['29 CFR 1910.303', '29 CFR 1910.303(b)(1)']), oshaConstruction: G(['29 CFR 1926.416(a)(1)']),
    msha: G(['30 CFR 56.12016']),
    applicabilityRequiresContext: true, clarificationRequired: false, findingSupported: true },
  { family: 'machine_guarding',
    oshaGeneralIndustry: G(['1910.212(a)(1)', '1910.219']), oshaConstruction: G(['29 CFR 1926.300(b)(2)']),
    msha: G(['30 CFR 56.14107(a)', '30 CFR 57.14107(a)']),
    applicabilityRequiresContext: false, clarificationRequired: false, findingSupported: true },
  { family: 'fall_protection',
    oshaGeneralIndustry: G(['29 CFR 1910.28']), oshaConstruction: G(['29 CFR 1926.501', '29 CFR 1926.451(g)(1)']),
    msha: G(['30 CFR 56.15005'], 'safety belts and lines; MSHA has no general fall-protection duty equivalent to 1926.501'),
    applicabilityRequiresContext: true, clarificationRequired: false, findingSupported: true },
  { family: 'excavation_trenching',
    oshaGeneralIndustry: NA('29 CFR 1910 has no trenching subpart; excavation work is construction'),
    oshaConstruction: G(['29 CFR 1926.652(a)(1)']),
    msha: G(['30 CFR 56.3200'], 'ground control; MSHA regulates highwall and bank stability rather than trench protective systems'),
    applicabilityRequiresContext: true, clarificationRequired: false, findingSupported: true },
  { family: 'hazard_communication',
    oshaGeneralIndustry: G(['29 CFR 1910.1200']), oshaConstruction: G(['29 CFR 1926.59']), msha: G(['30 CFR 47.41(a)']),
    applicabilityRequiresContext: false, clarificationRequired: false, findingSupported: true },
  { family: 'silica_respirable_dust',
    oshaGeneralIndustry: G(['29 CFR 1910.1053'], 'ACQUIRED 2026-08-28'),
    oshaConstruction: G(['29 CFR 1926.1153']), msha: G(['30 CFR 56.5005']),
    applicabilityRequiresContext: true, clarificationRequired: true, findingSupported: true },
  { family: 'noise_exposure',
    oshaGeneralIndustry: G(['29 CFR 1910.95']), oshaConstruction: G(['29 CFR 1926.52']), msha: G(['30 CFR 62.120', '30 CFR 62.130']),
    applicabilityRequiresContext: true, clarificationRequired: true, findingSupported: true },
  { family: 'emergency_egress',
    oshaGeneralIndustry: G(['29 CFR 1910.36']), oshaConstruction: G(['29 CFR 1926.34(a)']),
    msha: G(['30 CFR 56.4530'], 'ACQUIRED 2026-08-28; narrower than 1910.36 — number of exits for fire escape only'),
    applicabilityRequiresContext: false, clarificationRequired: false, findingSupported: true },
  { family: 'powered_industrial_trucks',
    oshaGeneralIndustry: G(['29 CFR 1910.178(p)(1)']), oshaConstruction: G(['29 CFR 1926.602(a)(9)(ii)']),
    msha: G(['30 CFR 56.9100(a)', '30 CFR 56.14132', '30 CFR 56.14132(b)(1)']),
    applicabilityRequiresContext: true, clarificationRequired: false, findingSupported: true },
  { family: 'confined_space',
    oshaGeneralIndustry: G(['29 CFR 1910.146']), oshaConstruction: G(['29 CFR 1926.1204'], 'ACQUIRED 2026-08-28'),
    msha: NA('MSHA metal/nonmetal has no permit-required confined space programme standard; exposure is regulated through 30 CFR 56.5005 airborne contaminants and 30 CFR 56.16002 bins and hoppers'),
    applicabilityRequiresContext: true, clarificationRequired: true, findingSupported: false },
  { family: 'personal_protective_equipment',
    oshaGeneralIndustry: G(['29 CFR 1910.132(a)', '29 CFR 1910.133'], '1910.133 ACQUIRED 2026-08-28'),
    oshaConstruction: G(['29 CFR 1926.95(a)', '29 CFR 1926.102'], '1926.102 ACQUIRED 2026-08-28'),
    msha: G(['30 CFR 56.15006', '30 CFR 56.15004'], '56.15004 ACQUIRED 2026-08-28'),
    applicabilityRequiresContext: false, clarificationRequired: false, findingSupported: false },

  // ---- families acquired by this phase -----------------------------------
  { family: 'hot_work',
    oshaGeneralIndustry: G(['29 CFR 1910.252'], 'ACQUIRED 2026-08-28'),
    oshaConstruction: G(['29 CFR 1926.352'], 'ACQUIRED 2026-08-28'),
    msha: G(['30 CFR 56.4100', '30 CFR 56.14213'], 'ACQUIRED 2026-08-28; MSHA regulates the ignition source and welding shielding, not a fire watch'),
    applicabilityRequiresContext: true, clarificationRequired: false, findingSupported: false },
  { family: 'fire_explosion',
    oshaGeneralIndustry: G(['29 CFR 1910.157'], 'ACQUIRED 2026-08-28'),
    oshaConstruction: G(['29 CFR 1926.150'], 'ACQUIRED 2026-08-28'),
    msha: G(['30 CFR 56.4100'], 'ACQUIRED 2026-08-28'),
    applicabilityRequiresContext: true, clarificationRequired: true, findingSupported: false },
  { family: 'compressed_gas',
    oshaGeneralIndustry: G(['29 CFR 1910.253', '29 CFR 1910.101'], 'ACQUIRED 2026-08-28'),
    oshaConstruction: G(['29 CFR 1926.350'], 'ACQUIRED 2026-08-28'),
    msha: G(['30 CFR 56.16005', '30 CFR 56.16006'], 'ACQUIRED 2026-08-28'),
    applicabilityRequiresContext: false, clarificationRequired: false, findingSupported: false },
  { family: 'respiratory_protection',
    oshaGeneralIndustry: G(['29 CFR 1910.134'], 'ACQUIRED 2026-08-28'),
    oshaConstruction: G(['29 CFR 1926.103'], 'ACQUIRED 2026-08-28; adopts 1910.134 by reference'),
    msha: G(['30 CFR 56.5005'], 'ACQUIRED 2026-08-28'),
    applicabilityRequiresContext: true, clarificationRequired: true, findingSupported: false },
  { family: 'ventilation_air_quality',
    oshaGeneralIndustry: G(['29 CFR 1910.94'], 'ACQUIRED 2026-08-28; operation-specific, not a general duty to ventilate'),
    oshaConstruction: G(['29 CFR 1926.353'], 'ACQUIRED 2026-08-28'),
    msha: G(['30 CFR 56.5005', '30 CFR 56.14213'], 'ACQUIRED 2026-08-28'),
    applicabilityRequiresContext: true, clarificationRequired: true, findingSupported: false },
  { family: 'material_handling_storage',
    oshaGeneralIndustry: G(['29 CFR 1910.176'], 'ACQUIRED 2026-08-28'),
    oshaConstruction: G(['29 CFR 1926.250'], 'ACQUIRED 2026-08-28'),
    msha: G(['30 CFR 56.16001'], 'ACQUIRED 2026-08-28'),
    applicabilityRequiresContext: false, clarificationRequired: false, findingSupported: false },
  { family: 'cranes_rigging_hoisting',
    oshaGeneralIndustry: G(['29 CFR 1910.179', '29 CFR 1910.184'], 'ACQUIRED 2026-08-28'),
    oshaConstruction: G(['29 CFR 1926.251', '29 CFR 1926.1425'], 'ACQUIRED 2026-08-28'),
    msha: G(['30 CFR 56.16007'], 'ACQUIRED 2026-08-28'),
    applicabilityRequiresContext: true, clarificationRequired: false, findingSupported: false },
  { family: 'suspended_loads',
    oshaGeneralIndustry: G(['29 CFR 1910.184'], 'ACQUIRED 2026-08-28; keep-clear duty at (c)(9)'),
    oshaConstruction: G(['29 CFR 1926.1425'], 'ACQUIRED 2026-08-28'),
    msha: G(['30 CFR 56.16009'], 'ACQUIRED 2026-08-28; absolute, with no fall-zone exception'),
    applicabilityRequiresContext: false, clarificationRequired: false, findingSupported: false },

  // ---- families deliberately left uncovered ------------------------------
  { family: 'environmental_release',
    oshaGeneralIndustry: G(['29 CFR 1910.120'], 'ACQUIRED 2026-08-28; paragraph (q) emergency response, and only where the release was not incidental'),
    oshaConstruction: G(['29 CFR 1926.65'], 'ACQUIRED 2026-08-28'),
    msha: NA('MSHA regulates hazardous material storage at 30 CFR 56.16003 rather than emergency response to releases'),
    applicabilityRequiresContext: true, clarificationRequired: true, findingSupported: false },
  { family: 'traffic_control',
    oshaGeneralIndustry: NA('no general-industry pedestrian/vehicle separation standard; addressed through 1910.176(a) aisles and 1910.178 truck operation'),
    oshaConstruction: G(['29 CFR 1926.201'], 'ACQUIRED 2026-08-28; requirements incorporated by reference to MUTCD Part 6'),
    msha: G(['30 CFR 56.9100(a)']),
    applicabilityRequiresContext: true, clarificationRequired: true, findingSupported: false },
  { family: 'hydraulic_pneumatic_energy',
    oshaGeneralIndustry: G(['29 CFR 1910.147'], 'stored fluid-power energy is governed by the hazardous-energy standard'),
    oshaConstruction: G(['29 CFR 1926.417'], 'via the hazardous-energy duty'),
    msha: G(['30 CFR 56.14105']),
    applicabilityRequiresContext: true, clarificationRequired: false, findingSupported: false },
  { family: 'ground_control',
    oshaGeneralIndustry: NA('no general-industry analogue'), oshaConstruction: G(['29 CFR 1926.652(a)(1)'], 'protective systems'),
    msha: G(['30 CFR 56.3200']),
    applicabilityRequiresContext: true, clarificationRequired: false, findingSupported: true },
];

/** Totals, derived rather than restated, so the matrix cannot drift from its own summary. */
export function matrixTotals() {
  const cells = V1_COVERAGE_MATRIX.flatMap(row => [row.oshaGeneralIndustry, row.oshaConstruction, row.msha]);
  const byStatus: Record<string, number> = {};
  for (const cell of cells) byStatus[cell.status] = (byStatus[cell.status] || 0) + 1;
  return {
    families: V1_COVERAGE_MATRIX.length,
    cells: cells.length,
    byStatus,
    familiesWithFindingRule: V1_COVERAGE_MATRIX.filter(r => r.findingSupported).length,
    familiesWithoutFindingRule: V1_COVERAGE_MATRIX.filter(r => !r.findingSupported).length,
  };
}
