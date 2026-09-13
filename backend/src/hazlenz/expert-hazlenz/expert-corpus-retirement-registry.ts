/**
 * EXPERT HAZLENZ -- the authoritative CORPUS RETIREMENT REGISTRY. §125.
 *
 * ==================== WHY THIS EXISTS ====================
 *
 * `EVALUATION_CORPUS_POLICY.closed` in the frozen evaluation plan names only two retired items:
 * `GAUNTLET_OFFSET_1` and `REALISM_OFFSET_0`. It OMITS `GAUNTLET_OFFSET_0` and `REALISM_OFFSET_3`,
 * both retired by the Run 1 sealed acceptance recorded in blueprint §61. §123 read that list, drew
 * the reasonable conclusion that offset 0 was undesignated, and proposed reopening it. §124 caught
 * that against the blueprint's own retirement record.
 *
 * A summary list that under-reports retirements is a trap that will be walked into again. This
 * registry is the overlay that makes it impossible to walk into quietly.
 *
 * ==================== WHAT IT IS AND IS NOT ====================
 *
 * It is a GOVERNANCE OVERLAY. It records what material exists, how it partitions, what state each
 * partition is in, and what evidence puts it there. It introduces NO scoring semantics, defines no
 * measure, and touches no threshold.
 *
 * It does NOT amend the frozen evaluation plan. The plan file is a frozen authority and
 * `test:expert-nocall-harness` asserts `closed.length === 4`; repairing that list is a governance act
 * with its own authorization. Until then this registry is the fuller record, and
 * `assertMayOpen()` consults BOTH and FAILS CLOSED on any conflict.
 *
 * ==================== FAIL CLOSED, ALWAYS ====================
 *
 * `assertMayOpen()` refuses unless BOTH sources agree the material is openable. Unknown material is
 * refused. Material the registry calls RETIRED is refused even if the plan's `closed` list omits it
 * -- which is exactly the §124 case. Material the plan calls closed is refused even if the registry
 * were somehow to disagree. There is no argument order in which a retired stride becomes openable.
 */

import { EVALUATION_CORPUS_POLICY } from './expert-evaluation-plan';

export const RETIREMENT_REGISTRY_VERSION = 'hazlenz.expert.corpus.retirement.v1' as const;

export const CORPUS_STATUSES = ['CLOSED', 'RESERVED', 'RETIRED', 'DEVELOPMENT', 'OPENED'] as const;
export type CorpusStatus = (typeof CORPUS_STATUSES)[number];

export interface CorpusPartitionRecord {
  /** The exact artifact this partition belongs to. */
  namespace: string;
  /** sha256 of that artifact, so an identity claim is checkable rather than asserted. */
  corpusSha256: string;
  /** How the artifact divides. Null when the artifact is used whole. */
  partitionRule: string | null;
  /** The partition's identity within the namespace. `null` means the whole artifact. */
  partitionId: string | null;
  status: CorpusStatus;
  /** What put it in that state. A status with no evidence is not a status. */
  evidence: string;
  /** The blueprint section or decision that records it. */
  decisionSource: string;
  /** The one field that actually governs behaviour. */
  mayEverReopen: boolean;
  reopenRule: string;
}

/**
 * Every partition of every corpus the Expert evaluation programme touches, with its state.
 *
 * The gauntlet source rule is D-86 verbatim: sort `scenarioId` by CMP (UTF-8 byte-wise ascending,
 * no case folding, no collation, no normalization), 0-based index, `m = 4`, `i % 4 === k`,
 * `k = parseInt(sha256.slice(-8),16) % 4`. For `a95e5480…22f0adb4` that is `k = 0`, giving 38 rows
 * and partitions 38/38/37/37 -- reproduced live in §124 as an exact match.
 */
export const CORPUS_RETIREMENT_REGISTRY: readonly CorpusPartitionRecord[] = [
  // ---------------- gauntlet source pool, four-way partition
  {
    namespace: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
    corpusSha256: 'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',
    partitionRule: 'D-86: sort scenarioId CMP ascending, 0-based, m=4, i%4===k; k=0; sizes 38/38/37/37',
    partitionId: 'GAUNTLET_OFFSET_0',
    status: 'RETIRED',
    evidence:
      'Blueprint §61, L3 FINAL SINGLE-USE SEALED ACCEPTANCE (2026-08-25). Header: '
      + 'HOLDOUT_SPENT = TRUE, GAUNTLET_OFFSET_0 = RETIRED, REALISM_OFFSET_3 = RETIRED. Terminal: '
      + 'L3_ACCEPTANCE_INVALID -- PROVIDER_CALLABILITY_FAILURE_AFTER_SPEND. The corpus was spent and '
      + 'the measurement was NOT obtained.',
    decisionSource: '§61 (Run 1). OMITTED from EVALUATION_CORPUS_POLICY.closed -- see this file\'s header.',
    mayEverReopen: false,
    reopenRule:
      'A FAILED ACCEPTANCE RUN SPENDS THE STRIDE. IT DOES NOT RETURN IT. The opened stride is retired '
      + 'permanently; it never becomes a development, tuning or regression set.',
  },
  {
    namespace: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
    corpusSha256: 'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',
    partitionRule: 'D-86: i%4===1',
    partitionId: 'GAUNTLET_OFFSET_1',
    status: 'RETIRED',
    evidence:
      'Run 2 sealed acceptance. Header: RUN2_HOLDOUT_SPENT = TRUE, GAUNTLET_OFFSET_1 = RETIRED, '
      + 'REALISM_OFFSET_0 = RETIRED. Terminal: L3_ACCEPTANCE_FAILED. The corpus was spent and the '
      + 'measurement WAS obtained.',
    decisionSource: '§66-era Run 2. Present in EVALUATION_CORPUS_POLICY.closed.',
    mayEverReopen: false,
    reopenRule: 'Same as offset 0: a spent stride is retired permanently.',
  },
  {
    namespace: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
    corpusSha256: 'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',
    partitionRule: 'D-86: i%4===2',
    partitionId: 'GAUNTLET_OFFSET_2',
    status: 'OPENED',
    evidence:
      'OPENED 2026-09-01T17:04:34Z under the product-owner OPTION B authorization, to close the '
      + 'measured FORBIDDEN_FAMILY_NEGATIVE_CONTROL supply shortfall (44 open against a frozen '
      + 'minimum of 48). 37 rows exposed; 8 ELIGIBLE under the frozen §122 rule and all 8 are '
      + 'forbidden-family negative controls -- which MATCHES the 8 §124 had counted from LABEL '
      + 'METADATA ONLY, without reading any observation. Source artifact sha256 unchanged across '
      + 'the read. No provider saw any row: PROVIDER_INVOCATION_COUNT = 0.',
    decisionSource:
      'EVALUATION_CORPUS_POLICY.reserved, opened by the 2026-09-01 OPTION B authorization. '
      + 'Record: verification/expert-hazlenz-d86-reserved-open-2026-09-01/OPENING-RECORD.txt',
    mayEverReopen: true,
    reopenRule:
      'SPENT. Already open to THIS exam -- the Expert formal cohort -- and committed to it. It may '
      + 'never be opened for a different exam, and the single use it was reserved for is now used.',
  },
  {
    namespace: 'safescope-data/gauntlets/safescope-gauntlet.source.v1.json',
    corpusSha256: 'a95e54809c41b3eb88ea35de133c5576e63c921944ca4724597852f922f0adb4',
    partitionRule: 'D-86: i%4===3',
    partitionId: 'GAUNTLET_OFFSET_3',
    status: 'OPENED',
    evidence:
      'OPENED 2026-09-01T17:04:34Z alongside offset 2, under the same OPTION B authorization. 37 '
      + 'rows exposed; 8 ELIGIBLE under the frozen §122 rule and all 8 are forbidden-family '
      + 'negative controls -- MATCHING the 8 counted from label metadata only. Source artifact '
      + 'sha256 unchanged across the read. PROVIDER_INVOCATION_COUNT = 0.',
    decisionSource:
      'EVALUATION_CORPUS_POLICY.reserved, opened by the 2026-09-01 OPTION B authorization. '
      + 'Record: verification/expert-hazlenz-d86-reserved-open-2026-09-01/OPENING-RECORD.txt',
    mayEverReopen: true,
    reopenRule:
      'SPENT. Already open to THIS exam and committed to it; never openable for a different one.',
  },

  // ---------------- field realism pack, four-way partition
  {
    namespace: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
    corpusSha256: '6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',
    partitionRule: 'D-86 D-B: canonical identifier `id`, whole 117-row population, m=4; k='
      + 'parseInt("5231a9cb",16)%4 = 3, giving 29 rows',
    partitionId: 'REALISM_OFFSET_3',
    status: 'RETIRED',
    evidence: 'Blueprint §61 Run 1: REALISM_OFFSET_3 = RETIRED, alongside GAUNTLET_OFFSET_0.',
    decisionSource: '§61 (Run 1). OMITTED from EVALUATION_CORPUS_POLICY.closed.',
    mayEverReopen: false,
    reopenRule: 'A spent stride is retired permanently.',
  },
  {
    namespace: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
    corpusSha256: '6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',
    partitionRule: 'D-86 D-B: m=4, k=0',
    partitionId: 'REALISM_OFFSET_0',
    status: 'RETIRED',
    evidence: 'Run 2: REALISM_OFFSET_0 = RETIRED, alongside GAUNTLET_OFFSET_1.',
    decisionSource: 'Run 2. Present in EVALUATION_CORPUS_POLICY.closed.',
    mayEverReopen: false,
    reopenRule: 'A spent stride is retired permanently.',
  },
  {
    namespace: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
    corpusSha256: '6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',
    partitionRule: 'D-86 D-B: m=4, k=1',
    partitionId: 'REALISM_OFFSET_1',
    status: 'RESERVED',
    evidence:
      'Never opened. Contributes ZERO negative-control capability structurally: the pack carries NO '
      + 'hazard-family field at all, and its `forbiddenTerms` are citations and phrases rather than '
      + 'families, so family truth cannot be derived from it under the frozen precedence rules.',
    decisionSource: 'EVALUATION_CORPUS_POLICY.reserved; capability measured in §123.',
    mayEverReopen: true,
    reopenRule: 'Opened ONCE, for one pre-registered exam.',
  },
  {
    namespace: 'safescope-data/benchmarks/safescope-field-realism-pack-v2.v1.json',
    corpusSha256: '6f6897f11aa3b174b2863fad4edc895625e0a3d27e1318dbd2371dcd5231a9cb',
    partitionRule: 'D-86 D-B: m=4, k=2',
    partitionId: 'REALISM_OFFSET_2',
    status: 'RESERVED',
    evidence: 'Never opened. Same zero negative-control capability as offset 1.',
    decisionSource: 'EVALUATION_CORPUS_POLICY.reserved',
    mayEverReopen: true,
    reopenRule: 'Opened ONCE, for one pre-registered exam.',
  },

  // ---------------- whole-artifact records
  {
    namespace: 'safescope-data/gauntlets/safescope-gauntlet.seed.json',
    corpusSha256: '49aa40fdcc507d549f22b59c9791823c3f1196034543df1746c8eb5d857b73fe',
    partitionRule: null,
    partitionId: null,
    status: 'OPENED',
    evidence:
      'Opened ONCE in §122 for the Expert formal cohort -- eligibility classification and truth-key '
      + 'authoring only. Byte-unchanged since. NO provider has ever seen it: 0 of 100 scenarioIds and '
      + '0 of 98 distinctive observation fragments appear in any prior artifact (§123).',
    decisionSource: '§122 opening record; §123 open-once verification.',
    mayEverReopen: true,
    reopenRule:
      'Already open to THIS exam. It is committed to the Expert formal cohort and may not be '
      + 're-opened for a different exam.',
  },
  {
    namespace: 'safescope-data/benchmarks/safescope-field-validation-dataset.v1.json',
    corpusSha256: 'a66e680b79076c636e3d81c8f0776c207a0709e83b0faa2febfcae45ccdf2db2',
    partitionRule: 'five-way stride i%5, 200 scenarios, six families',
    partitionId: 'ALL_FIVE_STRIDES',
    status: 'RETIRED',
    evidence:
      'Blueprint §36.10 CURRENT_FIELD_CORPUS_EXHAUSTED_FOR_FRESH_EVALUATION: all five strides opened '
      + '-- i%5===0 L3-2b, 1 L3-2e, 2 L3-2c, 3 L3-2f, 4 L3-2d. "No prior field scenario may be reused '
      + 'as fresh evidence."',
    decisionSource: '§36.10 PROTECTED_DECISION',
    mayEverReopen: false,
    reopenRule: 'Exhausted. Any further semantic quality phase must identify a genuinely new source.',
  },
  {
    namespace: 'hazlenz-l3-sealed-acceptance-2026-08-25 (Run 1) and hazlenz-l3-run2-sealed-acceptance-2026-08-25 (Run 2, 93 rows)',
    corpusSha256: 'recorded in the respective verification directories',
    partitionRule: null,
    partitionId: null,
    status: 'CLOSED',
    evidence: 'Both single-use acceptance holdouts were SPENT. Re-scoring them would measure '
      + 'memorization of a published result.',
    decisionSource: 'EVALUATION_CORPUS_POLICY.closed; §61 and the Run 2 section.',
    mayEverReopen: false,
    reopenRule: 'Burnt.',
  },
  {
    namespace: 'backend/src/hazlenz/tests/hazlenz-decomposition-precision-corpus.ts',
    corpusSha256: '1e61840ad534d75d68e38abf5877975fa660620549e6927899ce6e9e0f3ef77e',
    partitionRule: null,
    partitionId: 'POPULATION_A and POPULATION_B',
    status: 'DEVELOPMENT',
    evidence:
      'Frozen 2026-08-27 deterministic-engine evaluation corpus, authored before any Expert provider '
      + 'output existed and never shown to any provider. Unlimited re-use. Recorded caveat: the '
      + 'deterministic engine was measured against it, so it is a POOR source of M01 recall '
      + 'opportunities and the supplemental policy forbids using it for that.',
    decisionSource: '§122 supplemental construction policy (cc69d28e…).',
    mayEverReopen: true,
    reopenRule: 'Development material: unlimited re-use, and never a source of a gate result.',
  },
  {
    namespace: 'backend/src/hazlenz/expert-hazlenz/fixtures/ (no-call-scenarios and the §104-§119 diagnostic fixtures)',
    corpusSha256: 'per-file; see the frozen hash lists',
    partitionRule: null,
    partitionId: null,
    status: 'DEVELOPMENT',
    evidence: 'EVALUATION_CORPUS_POLICY.development. These HAVE been shown to providers across '
      + '§104-§119, so they are contaminated for evaluation purposes and may never produce a gate result.',
    decisionSource: 'EVALUATION_CORPUS_POLICY.development',
    mayEverReopen: true,
    reopenRule: 'Unlimited re-use for mechanics; never a source of a gate result.',
  },
];

// ---------------------------------------------------------------- the fail-closed guard

export interface OpenVerdict {
  allowed: boolean;
  partitionId: string | null;
  registryStatus: CorpusStatus | 'UNKNOWN';
  planSaysClosed: boolean;
  reason: string;
}

/**
 * Consult BOTH the frozen evaluation policy and this registry. Refuse unless both agree.
 *
 * The three refusal paths, each of which has already been needed:
 *   - the registry says RETIRED and the plan's list omits it            -> REFUSE (the §124 case)
 *   - the plan's `closed` list names it and the registry is silent      -> REFUSE
 *   - neither source knows the material                                 -> REFUSE
 */
export function assertMayOpen(partitionId: string): OpenVerdict {
  const record = CORPUS_RETIREMENT_REGISTRY.find(r => r.partitionId === partitionId);
  const planClosedText = EVALUATION_CORPUS_POLICY.closed.join(' | ');
  const planSaysClosed = planClosedText.includes(partitionId);

  if (!record) {
    return {
      allowed: false, partitionId, registryStatus: 'UNKNOWN', planSaysClosed,
      reason: 'UNKNOWN material is refused. Material with no recorded provenance cannot be proven '
        + 'unspent, and an unprovable claim fails closed.',
    };
  }
  if (!record.mayEverReopen) {
    return {
      allowed: false, partitionId, registryStatus: record.status, planSaysClosed,
      reason: `REFUSED: ${record.status}. ${record.reopenRule} Evidence: ${record.evidence}`,
    };
  }
  if (planSaysClosed) {
    return {
      allowed: false, partitionId, registryStatus: record.status, planSaysClosed,
      reason: 'REFUSED: the frozen evaluation policy names this material as CLOSED even though the '
        + 'registry believes it reopenable. A conflict between the two sources FAILS CLOSED.',
    };
  }
  return {
    allowed: true, partitionId, registryStatus: record.status, planSaysClosed,
    reason: `Permitted: ${record.status}. ${record.reopenRule}`,
  };
}

/** Every partition that may never be reopened, for reporting. */
export function permanentlyRetiredPartitions(): string[] {
  return CORPUS_RETIREMENT_REGISTRY
    .filter(r => !r.mayEverReopen)
    .map(r => r.partitionId ?? r.namespace);
}

/**
 * The discrepancies between the frozen plan's summary list and this registry.
 *
 * Reported rather than silently reconciled, because the plan file is frozen and repairing it is a
 * governance act. An empty result would mean the plan had been amended.
 */
export function planListDiscrepancies(): string[] {
  const planText = EVALUATION_CORPUS_POLICY.closed.join(' | ');
  return CORPUS_RETIREMENT_REGISTRY
    .filter(r => r.status === 'RETIRED' && r.partitionId && !planText.includes(r.partitionId))
    .map(r => `${r.partitionId} is RETIRED per ${r.decisionSource} but is absent from `
      + 'EVALUATION_CORPUS_POLICY.closed');
}
