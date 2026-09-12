/**
 * §198 -- THE SUPERSEDED-CLAIM REGISTER. DEVELOPMENT ONLY. ZERO PROVIDER CALLS.
 *
 * ==================== WHY A REGISTER AND NOT AN EDIT ====================
 *
 * A frozen evidence package records what was believed and proven ON THE DAY, and it stays exactly
 * as it was. But a REGRESSION SUITE has to track the architecture that actually ships, or it stops
 * being a regression suite. Those two obligations pull in opposite directions the moment a later
 * slice falsifies an earlier claim.
 *
 * This module is where they are reconciled. Each entry names, as data:
 *
 *   HISTORICAL_ASSERTION   what an earlier section asserted, quoted, with its case id
 *   WHAT_WAS_OBSERVED      the evidence that falsified it, with the section that produced it
 *   CURRENT_ARCHITECTURE   what ships now, and why it is not merely a workaround
 *   EVIDENCE_PRESERVED     confirmation that the historical package was not edited
 *
 * The suite reads it so a superseded case cannot be quietly deleted; the evidence document renders
 * it so a reader is not left comparing two packages by hand. There is exactly one definition.
 *
 * ==================== WHAT THIS IS NOT ====================
 *
 * Not a mechanism for softening an inconvenient result. An entry may only be added when a LATER
 * OBSERVATION falsified an EARLIER CLAIM, and it must name that observation. A claim that is merely
 * unfashionable, or that a later author would have phrased differently, does not belong here.
 */

export const SUPERSEDED_CLAIM_REGISTER_VERSION = 'hazlenz.expert.superseded-claims.v1' as const;

export interface SupersededClaim {
  readonly claimId: string;
  readonly assertedBy: string;
  readonly assertedOn: string;
  /** The claim as it was written, quoted. Never paraphrased into something easier to retire. */
  readonly historicalAssertion: string;
  readonly historicalImplementation: string;
  readonly status: 'SUPERSEDED_BY_SECTION_198';
  readonly supersededBy: string;
  readonly supersededBecause: string;
  readonly whatWasObserved: string;
  readonly currentArchitecture: string;
  readonly whatStillHolds: string;
  /** True when the earlier evidence package is byte-unchanged. Asserted, not assumed. */
  readonly historicalEvidencePreserved: boolean;
  readonly historicalEvidencePath: string;
  readonly prospectiveRegressionCase: string;
}

/**
 * §196 case K3. The only entry, and the register exists because of it.
 */
export const K3_HISTORICAL_ASSERTION: SupersededClaim = {
  claimId: 'SECTION_196_K3_TRANSPORT_LAYER',
  assertedBy: '§196 case K3',
  assertedOn: '2026-09-06',
  historicalAssertion:
    'with no governed evidence supplied, the wire schema forbids naming one at all — '
    + '"transport refuses it, and the boundary refuses it again"',
  historicalImplementation:
    'governedEvidenceSourceIds carried `maxItems: 0` whenever the supplied governed set was empty',
  status: 'SUPERSEDED_BY_SECTION_198',
  supersededBy: '§198 capability omission (product-owner Option B)',
  supersededBecause:
    'the claimed transport layer did not exist on the hosted path. §197 sent that exact schema to '
    + 'the provider twelve times and every request was rejected with HTTP 400 BEFORE INFERENCE — '
    + '"tools.0.custom: For \'array\' type, property \'maxItems\' is not supported". The transport '
    + 'did not refuse the id; it refused the entire request. §196 tested the schema as a DOCUMENT '
    + 'and the claim was true of the document; it was never true of the request.',
  whatWasObserved:
    '§197: 12 provider calls attempted, 0 completed, 0 output tokens, $0.00 actual spend, identical '
    + 'error on all twelve. Established offline by rebuilding all twelve request bodies and '
    + 'keyword-diffing them against v15\'s schema: exactly one keyword is introduced by vNext, and '
    + 'it is `maxItems`.',
  currentArchitecture:
    'when the supplied governed set is empty the property is OMITTED ENTIRELY — absent from '
    + '`properties`, absent from `required`, and the instruction describing it is absent from the '
    + 'system prompt. This is STRONGER than a bounded field rather than a workaround for one: a '
    + 'bounded field still tells the model the capability exists and relies on a keyword the '
    + 'provider may not honour, while an absent field cannot be populated by a compliant producer '
    + 'at all and is refused by `additionalProperties: false` at the transport and by '
    + '`DECLARATION_FORBIDDEN_FIELDS` at the boundary.',
  whatStillHolds:
    'BOUNDARY_REFUSES_UNSUPPLIED_SOURCE_ID. §196 cases K1 and K2 are untouched and still pass: the '
    + 'projection refuses a governed sourceId that was not supplied, deterministically, by exact '
    + 'set membership. The safety property never depended on the transport layer that turned out '
    + 'not to exist.',
  historicalEvidencePreserved: true,
  historicalEvidencePath:
    'verification/expert-hazlenz-structured-first-pass-owed-facts-2026-09-06/ — TEST-OUTPUT.txt '
    + 'still records the original 91/91 run including the original K3 line, and no file in that '
    + 'package was edited by §197 or §198',
  prospectiveRegressionCase:
    '§196 suite case K3 now asserts the CURRENT architecture (property omitted, no maxItems '
    + 'anywhere) and case K3b asserts that this register records the supersession',
};

export const SUPERSEDED_CLAIMS: readonly SupersededClaim[] = [K3_HISTORICAL_ASSERTION];

/**
 * What survived, stated separately so a reader does not infer that a superseded claim means a
 * superseded protection. Asserted by the §198 suite against live modules.
 */
export const CLAIMS_THAT_STILL_HOLD = {
  BOUNDARY_REFUSES_UNSUPPLIED_SOURCE_ID: {
    holds: true,
    supportedBy: '§196 cases K1 and K2, unchanged and still passing',
    mechanism: 'exact set membership against the supplied governed sourceIds in '
      + 'projectDeclaredOwedFacts; no fuzzy match, no nearest neighbour',
  },
  ZERO_SOURCE_CASE_IS_STRONGER_NOT_WEAKER: {
    holds: true,
    supportedBy: '§198 cases A and B',
    mechanism: 'CAPABILITY OMISSION rather than maxItems=0 transport enforcement',
  },
  SECTION_196_OTHER_CASES_UNAFFECTED: {
    holds: true,
    note: 'the projection, identity computation, provenance totality, multi-gap isolation, the '
      + 'citation reuse rule and the reconstruction invariants are untouched by this correction',
  },
} as const;
