// The InSite v1.0 REGULATORY COVERAGE MANIFEST.
//
// Phase 2 of "HazLenz Deterministic Standards Architecture + Coverage Closure".
//
// This file is the DENOMINATOR for every standards-coverage claim InSite makes.
// Without it, "standards coverage" has no defined meaning: a percentage over an
// unstated corpus is not a measurement.
//
// It is authored from what the repository and the product surfaces actually
// declare, not from what would be convenient:
//
//   * `INSPECTION_REGULATORY_CONTEXTS` (backend/src/inspection/inspection.entity.ts)
//     and `REGULATORY_CONTEXT_OPTIONS` (frontend-next/lib/canonicalWorkflowApi.ts)
//     both declare exactly three supported regimes, and the frontend states that
//     "new inspections require an explicit context" with `unknown` retained only
//     "for legacy and incomplete records".
//   * The governed source set (backend/src/standards/releases/governed-source-set.ts)
//     derives the authoritative record set from two version-controlled artifacts:
//     `SAFESCOPE_CURATED_STANDARDS` (8 records) and `STANDARDS_INTELLIGENCE_SEED`
//     (35 unique citations); merged, it is 35 governed records.
//   * `evidence-foundation.ts` carries a SECOND, code-resident rule set that
//     produces the citations attached to customer FINDINGS.
//
// Status vocabulary, as required by the phase contract:
//
//   SUPPORTED_AND_GOVERNED   the regime is offered to customers AND the governed
//                            source set carries reviewed records for it.
//   SUPPORTED_WITH_FALLBACK  the regime is offered, but customer-facing citations
//                            come wholly or partly from a path that is not the
//                            governed corpus.
//   KNOWN_GAP                a hazard family InSite recognises and materialises as
//                            a finding, for which no standard is produced.
//   OUT_OF_SCOPE             deliberately not claimed for v1.0.
//   UNVERIFIED               could not be executed or measured under this
//                            authorization.

export type CoverageStatus =
  | 'SUPPORTED_AND_GOVERNED'
  | 'SUPPORTED_WITH_FALLBACK'
  | 'KNOWN_GAP'
  | 'OUT_OF_SCOPE'
  | 'UNVERIFIED';

export interface JurisdictionEntry {
  id: string;
  label: string;
  /** The regulatory scope the product advertises for this option. */
  declaredScope: string;
  corpusSource: string;
  includedScope: string[];
  exclusions: string[];
  effectiveDate: string;
  provenance: string;
  normalizationStatus: string;
  governedReleaseStatus: string;
  runtimeAvailability: string;
  matchingMechanism: string;
  status: CoverageStatus;
  governedRecordCount: number;
  notes: string;
}

export const V1_JURISDICTIONS: JurisdictionEntry[] = [
  {
    id: 'osha-general-industry',
    label: 'OSHA — General Industry',
    declaredScope: '29 CFR 1910',
    corpusSource: 'governed source set (SAFESCOPE_CURATED_STANDARDS + STANDARDS_INTELLIGENCE_SEED)',
    includedScope: ['29 CFR 1910 — selected sections only'],
    exclusions: [
      'the great majority of 29 CFR 1910; the governed set names 13 general-industry sections',
      'no subpart-complete coverage of any part',
    ],
    effectiveDate: 'release federal-core-2026-07-30.1',
    provenance: 'version-controlled repository artifacts with registry keys, authority tier and allowed use',
    normalizationStatus: 'normalized through standards-intelligence-projection',
    governedReleaseStatus: 'provisional; 35/35 mechanically_validated, 0/35 reviewer_approved',
    runtimeAvailability: 'materializes via `npm run seed:safescope-standards` (measured)',
    matchingMechanism: 'ApplicableStandardsService.suggest() over standards_master, jurisdiction-gated',
    status: 'SUPPORTED_WITH_FALLBACK',
    governedRecordCount: 13,
    notes:
      'Customer FINDING citations do not come from this corpus at all; they come from the ' +
      'code-resident rule set in evidence-foundation.ts. The corpus feeds the analysis-level ' +
      'suggestion path only.',
  },
  {
    id: 'osha-construction',
    label: 'OSHA — Construction',
    declaredScope: '29 CFR 1926',
    corpusSource: 'governed source set',
    includedScope: ['29 CFR 1926 — selected sections only'],
    exclusions: [
      'the great majority of 29 CFR 1926; the governed set names 11 construction sections',
      'no subpart-complete coverage of any part',
    ],
    effectiveDate: 'release federal-core-2026-07-30.1',
    provenance: 'version-controlled repository artifacts',
    normalizationStatus: 'normalized through standards-intelligence-projection',
    governedReleaseStatus: 'provisional; 0/35 reviewer_approved',
    runtimeAvailability: 'materializes via `npm run seed:safescope-standards` (measured)',
    matchingMechanism: 'ApplicableStandardsService.suggest() over standards_master, jurisdiction-gated',
    status: 'SUPPORTED_WITH_FALLBACK',
    governedRecordCount: 11,
    notes: 'Same finding-level caveat as general industry.',
  },
  {
    id: 'msha',
    label: 'MSHA',
    declaredScope: '30 CFR mining',
    corpusSource: 'governed source set',
    includedScope: ['30 CFR 47, 56, 57, 62 — selected sections only'],
    exclusions: [
      'coal (30 CFR 75 and 77) carries NO governed record, although the retrieval layer recognises those part numbers',
      'the great majority of 30 CFR; the governed set names 11 mining sections',
    ],
    effectiveDate: 'release federal-core-2026-07-30.1',
    provenance: 'version-controlled repository artifacts',
    normalizationStatus: 'normalized through standards-intelligence-projection',
    governedReleaseStatus: 'provisional; 0/35 reviewer_approved',
    runtimeAvailability: 'materializes via `npm run seed:safescope-standards` (measured)',
    matchingMechanism: 'ApplicableStandardsService.suggest() over standards_master, jurisdiction-gated',
    status: 'SUPPORTED_WITH_FALLBACK',
    governedRecordCount: 11,
    notes:
      'Metal/non-metal surface (part 56) is the only MSHA area with meaningful record density. ' +
      'A coal inspection would receive no governed citation.',
  },
  {
    id: 'unknown',
    label: 'Regulatory context not established',
    declaredScope: 'legacy and incomplete records only',
    corpusSource: 'n/a',
    includedScope: [],
    exclusions: ['not offered for new inspections'],
    effectiveDate: 'n/a',
    provenance: 'n/a',
    normalizationStatus: 'n/a',
    governedReleaseStatus: 'n/a',
    runtimeAvailability: 'n/a',
    matchingMechanism:
      'finding-level rules emit conditional candidates across all three regimes; the DB-backed ' +
      'analysis-level path returns NOTHING (measured root cause: the +15 in-scope bonus in ' +
      'ApplicableStandardsService is what clears the score>=10 admission threshold, and it cannot ' +
      'apply when no site type is resolved)',
    status: 'KNOWN_GAP',
    governedRecordCount: 0,
    notes:
      'The accepted product contract requires an explicit context for new inspections, so this ' +
      'state is reachable through legacy records and the raw classify API rather than the ' +
      'shipping inspection flow.',
  },
];

/** Hazard families InSite materialises as findings, and whether a standard reaches that finding. */
export interface FamilyCoverageEntry {
  family: string;
  status: CoverageStatus;
  findingLevelRule: boolean;
  governedCorpusRecord: string[];
  note: string;
}

export const V1_FAMILY_COVERAGE: FamilyCoverageEntry[] = [
  { family: 'lockout_tagout', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: true,
    governedCorpusRecord: ['29 CFR 1910.147', '30 CFR 56.12016', '30 CFR 56.14105'], note: 'matched in measurement' },
  { family: 'electrical', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: true,
    governedCorpusRecord: ['29 CFR 1910.303', '29 CFR 1926.416(a)(1)', '30 CFR 56.12016'], note: 'matched in measurement' },
  { family: 'machine_guarding', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: true,
    governedCorpusRecord: ['1910.212(a)(1)', '29 CFR 1926.300(b)(2)', '30 CFR 56.14107(a)'], note: 'matched in measurement' },
  { family: 'fall_protection', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: true,
    governedCorpusRecord: ['29 CFR 1910.28', '29 CFR 1926.501', '29 CFR 1926.451(g)(1)'], note: 'matched in measurement' },
  { family: 'excavation_trenching', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: true,
    governedCorpusRecord: ['29 CFR 1926.652(a)(1)'], note: 'construction only; correctly excluded under general industry' },
  { family: 'hazard_communication', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: true,
    governedCorpusRecord: ['29 CFR 1910.1200', '29 CFR 1926.59', '30 CFR 47.41(a)'], note: 'matched in measurement' },
  { family: 'silica_respirable_dust', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: true,
    governedCorpusRecord: ['29 CFR 1926.1153'], note: 'construction only' },
  { family: 'noise_exposure', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: true,
    governedCorpusRecord: ['29 CFR 1910.95', '29 CFR 1926.52', '30 CFR 62.120', '30 CFR 62.130'], note: 'not exercised by the corpus' },
  { family: 'emergency_egress', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: true,
    governedCorpusRecord: ['29 CFR 1910.36', '29 CFR 1926.34(a)'], note: 'not exercised by the corpus' },
  { family: 'powered_industrial_trucks', status: 'SUPPORTED_WITH_FALLBACK', findingLevelRule: true,
    governedCorpusRecord: ['29 CFR 1910.178(p)(1)', '30 CFR 56.9100(a)', '29 CFR 1926.602(a)(9)(ii)'],
    note: 'corpus record exists; the finding-level rule did not match it on the corpus rows' },
  { family: 'confined_space', status: 'SUPPORTED_WITH_FALLBACK', findingLevelRule: false,
    governedCorpusRecord: ['29 CFR 1910.146'], note: 'CORPUS RECORD EXISTS BUT NO FINDING-LEVEL RULE — repairable without new source material' },
  { family: 'personal_protective_equipment', status: 'SUPPORTED_WITH_FALLBACK', findingLevelRule: false,
    governedCorpusRecord: ['29 CFR 1910.132(a)', '29 CFR 1926.95(a)', '30 CFR 56.15006'], note: 'CORPUS RECORD EXISTS BUT NO FINDING-LEVEL RULE — repairable without new source material' },
  { family: 'material_handling_storage', status: 'KNOWN_GAP', findingLevelRule: false,
    governedCorpusRecord: [], note: 'no governed record; 1910.176 / 1926.250 absent — AUTHORITATIVE_SOURCE_REQUIRED' },
  { family: 'hot_work', status: 'KNOWN_GAP', findingLevelRule: false,
    governedCorpusRecord: [], note: 'no governed record; 1910.252 / 1926.352 absent — AUTHORITATIVE_SOURCE_REQUIRED' },
  { family: 'fire_explosion', status: 'KNOWN_GAP', findingLevelRule: false,
    governedCorpusRecord: [], note: 'no governed record; 1910.157 / 1926.150 absent — AUTHORITATIVE_SOURCE_REQUIRED' },
  { family: 'compressed_gas', status: 'KNOWN_GAP', findingLevelRule: false,
    governedCorpusRecord: [], note: 'no governed record; 1910.101/253 absent — AUTHORITATIVE_SOURCE_REQUIRED' },
  { family: 'respiratory_protection', status: 'KNOWN_GAP', findingLevelRule: false,
    governedCorpusRecord: [], note: 'no governed record; 1910.134 / 1926.103 absent — AUTHORITATIVE_SOURCE_REQUIRED' },
  { family: 'ventilation_air_quality', status: 'KNOWN_GAP', findingLevelRule: false,
    governedCorpusRecord: [], note: 'no governed record — AUTHORITATIVE_SOURCE_REQUIRED' },
  { family: 'cranes_rigging_hoisting', status: 'KNOWN_GAP', findingLevelRule: false,
    governedCorpusRecord: [], note: 'no governed record; 1910.179/184, 1926.1400-series absent — AUTHORITATIVE_SOURCE_REQUIRED (1926.1425 is emitted by a code rule with no corpus record behind it)' },
  { family: 'suspended_loads', status: 'KNOWN_GAP', findingLevelRule: false,
    governedCorpusRecord: [], note: 'no governed record — AUTHORITATIVE_SOURCE_REQUIRED' },
  { family: 'environmental_release', status: 'KNOWN_GAP', findingLevelRule: false,
    governedCorpusRecord: [], note: 'no governed record; 1910.120 absent — AUTHORITATIVE_SOURCE_REQUIRED' },
  { family: 'hydraulic_pneumatic_energy', status: 'SUPPORTED_WITH_FALLBACK', findingLevelRule: false,
    governedCorpusRecord: ['29 CFR 1910.147'], note: 'the required group also accepts lockout_tagout, whose record exists' },
  { family: 'traffic_control', status: 'SUPPORTED_AND_GOVERNED', findingLevelRule: false,
    governedCorpusRecord: ['30 CFR 56.9100(a)'], note: 'scored NO_STANDARD_APPLICABLE for the OSHA rows, which is correct' },
];

/** What the DB-backed analysis-level path could and could not be proven to do. */
export const RUNTIME_VERIFICATION = {
  standardsMasterMaterialization: 'VERIFIED — 35 records, manifest 14a34fea…, via npm run seed:safescope-standards',
  governedReleaseFinalization: 'VERIFIED — federal-core-2026-07-30.1, provisional, 35 mechanically_validated',
  reviewerApproval: 'UNVERIFIED — 0 of 35 records are reviewer_approved, so no record can present as APPROVED_GOVERNED_CONTENT',
  jurisdictionFiltering: 'VERIFIED — measured zero cross-jurisdiction citation leakage in all three regimes',
  analysisLevelSuggestions: 'KNOWN_GAP — returns nothing when no site type is resolved; returns correctly ranked results when one is',
  knowledgeChunkCorpus: 'UNVERIFIED — safescope_knowledge_chunks is empty in both the development and the disposable database',
  productionLegacyCorpus: 'UNVERIFIED — documented at 2,390 eCFR rows with NULL source_key; not reachable from this authorization',
} as const;
