/**
 * §207 -- THE IMMUTABLE PREREGISTRATION RECORD AND ITS IDENTITY.
 *
 * ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS. NOTHING IS EXECUTED FROM THIS FILE.
 *
 * ==================== WHAT THE IDENTITY IS FOR ====================
 *
 * The identity exists to make ONE claim checkable rather than assertable: THAT THE EXPECTATIONS
 * WERE FIXED BEFORE THE OUTPUT EXISTED. It does that in three ways at once, and all three are
 * needed because any one alone is defeatable:
 *
 *   1. THE PAYLOAD IS CANONICALISED AND HASHED. Key order and whitespace cannot vary, so the same
 *      content always produces the same digest and any content change produces a different one.
 *   2. THE DIGEST IS PINNED IN CODE, in `expert-207-execution-gate.ts`, separately from the record
 *      file. Editing the record alone breaks the comparison; editing the pin alone breaks it too.
 *   3. THE PAYLOAD CARRIES NO TIMESTAMP. Re-running the freeze reproduces the digest exactly, so a
 *      reader can verify the frozen record from the source rather than trusting a stored string.
 *
 * The `frozenAt` timestamp lives in the ENVELOPE, outside the hashed payload, precisely so that its
 * presence cannot be used to explain away a digest mismatch.
 *
 * WHAT THE IDENTITY DOES NOT DO: it does not make the specification correct, and it does not
 * substitute for the product-owner review. A frozen unreviewed specification executed against is
 * the §199 mistake with a hash on top. The execution gate holds a separate blocker for the review.
 */

import { createHash } from 'crypto';

import {
  FROZEN_TRUTH_CASES, TRUTH_PROVENANCE, TRUTH_SPECIFICATION_207_VERSION,
  expectedProjectedFactCount, governedCaseIds, safetyCriticalCaseIds, safetyCriticalFactIds,
  zeroDeclarationCaseIds,
} from './expert-207-truth-specification';
import {
  AXIS_AMENDMENTS, GATES_207_VERSION, GATES_ARE_PREREGISTERED, HARD_GATE_IDS,
  INSTRUMENT_DEVIATION, ORDINARY_QUALITY_CRITERIA, ORDINARY_QUALITY_RULE, PREREGISTERED_GATES,
  adjudicationPlan, gateApplicabilityMatrix, instrumentBudget, unreachableGateIds,
} from './expert-207-gates';
import {
  ADJUDICATION_PROTOCOL, AMBIGUITY_PROTOCOL, COST_BASIS, EXPECTED_EVIDENCE_ARTIFACTS,
  FAILURE_RULES, PROTOCOLS_207_VERSION, RETRY_POLICY, RUN_INVARIANTS, callPlan, spendPlan,
} from './expert-207-protocols';

export const PREREGISTRATION_207_VERSION = 'hazlenz.expert.207.preregistration.v1' as const;

/** The only directory the §207 freeze may write into, and the record's file name. */
export const SECTION_207_DIR = 'expert-hazlenz-fresh-cohort-preregistration-207-2026-09-08' as const;
export const PREREGISTRATION_FILE = 'PREREGISTRATION-207.json' as const;

export const TRUTH_SPECIFICATION_STATES = [
  'DRAFT_NOT_REVIEWED',
  'PRODUCT_OWNER_REVIEWED',
  'FROZEN_BEFORE_PROVIDER_EXECUTION',
] as const;
export type TruthSpecificationState = (typeof TRUTH_SPECIFICATION_STATES)[number];

/**
 * §207 IS the freeze. §205 left this at DRAFT_NOT_REVIEWED and the §206 report named it as one of
 * the two remaining blockers.
 *
 * NOTE WHAT THIS STATE DOES AND DOES NOT ASSERT. It asserts that the content is fixed and
 * identity-pinned before any fresh-cohort call. It does NOT assert that a product owner has read
 * it: that is `PRODUCT_OWNER_REVIEW`, tracked separately below and enforced separately by the
 * execution gate. The two were deliberately separated because collapsing them would let the freeze
 * manufacture the review.
 */
export const TRUTH_SPECIFICATION_STATE: TruthSpecificationState = 'FROZEN_BEFORE_PROVIDER_EXECUTION';

export const PRODUCT_OWNER_REVIEW = {
  /** Set true ONLY by a recorded product-owner act, never by an agent and never by the freeze. */
  recorded: false,
  whatItRequires: [
    'the product owner reads the 24 frozen cases and the expectations attached to them',
    'every disagreement is recorded BEFORE execution, as an amendment with a new identity',
    'the two axis amendments AM-1 and AM-2, and the 159 -> 174 judgment consequence, are accepted '
    + 'or reversed explicitly',
    'the ordinary-quality criteria and their thresholds are accepted or replaced',
    'the closest frozen calls are read directly: AC-06 (a missing inspection record held NOT to be '
    + 'a decision-critical gap) and AC-02 P3 (a genuinely unknown electrical inspection date held '
    + 'NOT to be decision-critical)',
  ],
  whyItIsSeparateFromTheFreeze:
    'freezing fixes the content; reviewing decides whether the content is right. §199 executed '
    + 'against AI-assisted, product-owner-unreviewed expectations and could not use them as truth. '
    + 'A frozen unreviewed specification would repeat that with better bookkeeping.',
} as const;

/** Cleared by §206 on 2026-09-08. Recorded here as an input, not re-asserted. */
export const GOVERNED_TRANSPORT_SMOKE = {
  passed: true,
  evidence: 'verification/expert-hazlenz-governed-transport-smoke-206-2026-09-08/SMOKE-REPORT-206.md',
  establishes: 'transport, grammar separation and contract usability only',
  doesNotEstablish: 'any semantic capability of Expert HazLenz',
} as const;

// ---------------------------------------------------------------- decisions recorded by §207

export const SECTION_207_RULINGS = {
  D08: {
    ruling: 'CLOSED',
    inFavourOf: 'THE CURRENT ARCHITECTURE',
    governingRule: 'MODEL AUTHORS SEMANTIC SAFETY CONTENT',
    deterministicCodeMay: [
      'validate', 'reject', 'refuse admission', 'preserve unresolved truth',
      'normalize representation without semantic change',
      'project valid model-authored declarations',
    ],
    deterministicCodeMustNot: [
      'invent missing semantic content',
      'reconstruct semantics from generated prose',
      'repair missing branch meaning',
      'infer decision divergence',
      'recreate the retired semantic matcher',
    ],
    reopensOnlyIf:
      'later acceptance evidence demonstrates a concrete architectural contradiction. Gate G11 is '
      + 'the run-time expression of this ruling; a G11 failure reopens D08.',
    evidenceBase:
      '§204 at 120/120 (6 of 8 defect mechanisms originate before projection); §205 §7; §206 '
      + 'introduced no contrary evidence',
  },
  D15: {
    ruling: 'CLOSED',
    outcome: ['O1_RETAINED', 'O4_AVAILABLE_NOT_ADOPTED'],
    o2AndO5: 'NOT_EVIDENCE_SUPPORTED',
    rationale: [
      '§205\'s qualifier audit found no demonstrated preservation defect requiring canonical '
      + 'representation mutation — five annotated qualifier classes across five fixtures, zero '
      + 'violations',
      'O4 was built and exercised rather than dismissed; it works, and its remaining benefit after '
      + 'the R2 instruction is reviewability, which is real but weak against a second store that '
      + 'can disagree with the OwedFact it annotates',
      '§206 introduced no contrary evidence',
    ],
    revisitTrigger:
      'a second consequential axis-Q loss in the fresh cohort, OR a recorded reviewer difficulty '
      + 'attributable to the missing back-reference. RETAINED AND LIVE — the fresh cohort is the '
      + 'first opportunity for either to occur.',
    explicitlyNot:
      'O4 is not adopted merely because it has been implemented successfully.',
  },
  D14: {
    ruling: 'OPEN',
    unchangedBy207: true,
    note:
      'D14 remains open until fresh cohort execution and human adjudication are complete. RR-6 / E3 '
      + 'stays RECOMMENDED_NOT_AUTHORIZED. No escalation policy is activated or tuned by §207, and '
      + 'U02 is not used as a development-set fitting target. Gate G15 is measurement only and its '
      + 'small denominator is written into the gate.',
  },
  T1_LEDGER: {
    ruling: 'PRESERVED',
    note:
      'the append-only leg-aware execution ledger is required by the §207 protocols and the §206 '
      + 'executor defect (LOCAL_SMOKE_EXECUTOR_GUARD_DEFECT) is not reclassified.',
  },
} as const;

// ---------------------------------------------------------------- canonicalisation

/**
 * Deterministic JSON: object keys sorted, arrays in their declared order, no insignificant
 * whitespace. Arrays are NOT sorted — order is content here (branch partitions, protocol steps).
 */
export function canonicalise(value: unknown): string {
  const walk = (v: unknown): unknown => {
    if (v === null || typeof v !== 'object') return v;
    if (Array.isArray(v)) return v.map(walk);
    const src = v as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const k of Object.keys(src).sort()) out[k] = walk(src[k]);
    return out;
  };
  return JSON.stringify(walk(value));
}

export function sha256Hex(text: string): string {
  return createHash('sha256').update(text, 'utf8').digest('hex');
}

// ---------------------------------------------------------------- the payload

/**
 * The hashed content. TIMESTAMP-FREE BY CONSTRUCTION: re-running the freeze must reproduce the
 * digest, or the digest proves nothing that a reader can check.
 */
export function preregistrationPayload(): Record<string, unknown> {
  return {
    artifact: 'SECTION_207_FRESH_COHORT_PREREGISTRATION',
    versions: {
      preregistration: PREREGISTRATION_207_VERSION,
      truthSpecification: TRUTH_SPECIFICATION_207_VERSION,
      gates: GATES_207_VERSION,
      protocols: PROTOCOLS_207_VERSION,
    },
    truthProvenance: TRUTH_PROVENANCE,
    truthSpecificationState: TRUTH_SPECIFICATION_STATE,
    productOwnerReview: PRODUCT_OWNER_REVIEW,
    governedTransportSmoke: GOVERNED_TRANSPORT_SMOKE,
    rulings: SECTION_207_RULINGS,
    cohort: {
      caseCount: FROZEN_TRUTH_CASES.length,
      expectedProjectedFacts: expectedProjectedFactCount(),
      safetyCriticalCaseIds: safetyCriticalCaseIds(),
      safetyCriticalFactIds: safetyCriticalFactIds(),
      zeroDeclarationCaseIds: zeroDeclarationCaseIds(),
      governedCaseIds: governedCaseIds(),
      cases: FROZEN_TRUTH_CASES,
    },
    adjudication: {
      plan: adjudicationPlan(),
      axisAmendments: AXIS_AMENDMENTS,
      instrumentBudget: instrumentBudget(),
      instrumentDeviation: INSTRUMENT_DEVIATION,
      protocol: ADJUDICATION_PROTOCOL,
      ambiguity: AMBIGUITY_PROTOCOL,
    },
    gates: {
      arePreregistered: GATES_ARE_PREREGISTERED,
      hardGateIds: HARD_GATE_IDS,
      definitions: PREREGISTERED_GATES,
      applicabilityMatrix: gateApplicabilityMatrix(),
      unreachableGateIds: unreachableGateIds(),
      ordinaryQualityRule: ORDINARY_QUALITY_RULE,
      ordinaryQualityCriteria: ORDINARY_QUALITY_CRITERIA,
    },
    execution: {
      callPlan: callPlan(),
      costBasis: COST_BASIS,
      spendPlan: spendPlan(),
      failureRules: FAILURE_RULES,
      retryPolicy: RETRY_POLICY,
      runInvariants: RUN_INVARIANTS,
      expectedEvidenceArtifacts: EXPECTED_EVIDENCE_ARTIFACTS,
    },
  };
}

export function preregistrationIdentity(): string {
  return sha256Hex(canonicalise(preregistrationPayload()));
}

export interface PreregistrationRecord {
  readonly envelope: {
    readonly artifact: 'SECTION_207_FRESH_COHORT_PREREGISTRATION';
    readonly payloadSha256: string;
    readonly canonicalisation: string;
    readonly frozenAt: string;
    readonly frozenBy: string;
    readonly authoredBy: string;
    readonly note: string;
  };
  readonly payload: Record<string, unknown>;
}

export function buildPreregistrationRecord(frozenAtIso: string): PreregistrationRecord {
  const payload = preregistrationPayload();
  return {
    envelope: {
      artifact: 'SECTION_207_FRESH_COHORT_PREREGISTRATION',
      payloadSha256: sha256Hex(canonicalise(payload)),
      canonicalisation:
        'sha256 over JSON with object keys sorted recursively, array order preserved, no '
        + 'insignificant whitespace. The envelope is NOT hashed.',
      frozenAt: frozenAtIso,
      frozenBy: 'PRODUCT_OWNER_SECTION_207_DIRECTIVE',
      authoredBy: 'EXECUTING_AGENT_UNDER_SECTION_207_AUTHORIZATION',
      note:
        'the payload is timestamp-free, so re-running the freeze reproduces payloadSha256 exactly. '
        + 'frozenAt is in the envelope so its presence cannot explain away a digest mismatch.',
    },
    payload,
  };
}

export type VerificationCode =
  | 'RECORD_MISSING'
  | 'RECORD_UNREADABLE'
  | 'ENVELOPE_MALFORMED'
  | 'PAYLOAD_DIGEST_MISMATCH'
  | 'IDENTITY_DOES_NOT_MATCH_SOURCE'
  | 'VERIFIED';

export interface VerificationResult {
  readonly code: VerificationCode;
  readonly detail: string;
  readonly recordedDigest: string | null;
  readonly recomputedDigest: string | null;
  readonly sourceIdentity: string;
}

/**
 * Verify a loaded record against itself AND against the source modules. Both comparisons are
 * needed: the first catches an edited payload, the second catches a record that is internally
 * consistent but no longer describes the specification the code contains.
 */
export function verifyPreregistrationRecord(raw: unknown): VerificationResult {
  const sourceIdentity = preregistrationIdentity();
  if (raw === null || typeof raw !== 'object') {
    return {
      code: 'RECORD_UNREADABLE',
      detail: 'the preregistration record is not a JSON object',
      recordedDigest: null, recomputedDigest: null, sourceIdentity,
    };
  }
  const rec = raw as { envelope?: unknown; payload?: unknown };
  const env = rec.envelope as { payloadSha256?: unknown } | undefined;
  if (env === undefined || typeof env.payloadSha256 !== 'string'
    || rec.payload === null || typeof rec.payload !== 'object') {
    return {
      code: 'ENVELOPE_MALFORMED',
      detail: 'the record must carry an envelope with a string payloadSha256 and an object payload',
      recordedDigest: null, recomputedDigest: null, sourceIdentity,
    };
  }
  const recomputed = sha256Hex(canonicalise(rec.payload));
  if (recomputed !== env.payloadSha256) {
    return {
      code: 'PAYLOAD_DIGEST_MISMATCH',
      detail:
        'the record\'s payload does not hash to the digest the record carries. The payload has been '
        + 'edited since it was frozen.',
      recordedDigest: env.payloadSha256, recomputedDigest: recomputed, sourceIdentity,
    };
  }
  if (recomputed !== sourceIdentity) {
    return {
      code: 'IDENTITY_DOES_NOT_MATCH_SOURCE',
      detail:
        'the record is internally consistent but does not describe the specification the §207 '
        + 'modules currently contain. Either the record or the source has changed since the freeze.',
      recordedDigest: env.payloadSha256, recomputedDigest: recomputed, sourceIdentity,
    };
  }
  return {
    code: 'VERIFIED',
    detail: 'the record hashes to its own digest and to the source specification',
    recordedDigest: env.payloadSha256, recomputedDigest: recomputed, sourceIdentity,
  };
}

export function preregistrationEffect(): {
  providerCalls: 0; databaseOperations: 0; anythingIsExecuted: false; cohortIsAuthorized: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0, anythingIsExecuted: false, cohortIsAuthorized: false,
  };
}
