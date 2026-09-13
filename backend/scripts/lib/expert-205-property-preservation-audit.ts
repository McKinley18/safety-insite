/**
 * §205 -- RR-4: PROPERTY-FAITHFUL VERIFIER INPUT, AND THE O1-versus-O4 CONCLUSION.
 * DEVELOPMENT ONLY. ZERO PROVIDER CALLS. ZERO DATABASE OPERATIONS.
 *
 * ==================== THE INVARIANT ====================
 *
 *     NO DECISION-CRITICAL PROPERTY SEMANTIC MAY DISAPPEAR BEFORE VERIFIER REVIEW.
 *
 * §204 measured this eight times on axis Q. Seven facts returned `NO_OBSERVABLE_LOSS`; one --
 * SF-06's crane-brake load test -- returned `CLARIFICATION_INSUFFICIENCY`, where an explicit
 * temporal qualifier present in `missingFact` was absent from the projected `OwedFact` and the
 * clarification could then be answered YES while the declared property stayed open.
 *
 * ==================== WHY THIS AUDIT IS NOT A TEXT CLASSIFIER ====================
 *
 * The obvious implementation -- scan `missingFact` for temporal words, scan the surviving fields
 * for the same words, report a loss -- is the §160 semantic matcher wearing a different hat, and
 * §196 forbids deterministic code from deciding what a property means. It would also be wrong: a
 * qualifier can survive as different words, and identical words can carry a different qualifier.
 *
 * So the audit runs over PRODUCT-OWNER-DECLARED ANNOTATIONS on frozen fixtures. A fixture states
 * which qualifier classes its property depends on and which fields carry each one; the audit checks
 * that at least one field carrying each required class SURVIVES into the object the verifier
 * receives. That is a design-time structural check on a reviewed fixture, not a runtime inference
 * about model output, and it can only be run where a human has said what the property depends on.
 * `auditableAtRuntime` is `false` and says so.
 */

import {
  type DeclarationSidecar, type RetainedDeclarationRecord,
  addToSidecar, buildDeclarationRecord, owedPropertyFromSidecar,
} from './expert-201-owed-property-representation';
import type {
  StructuredUnresolvedFactDeclaration,
} from './expert-first-pass-owed-fact-projection';
import type { OwedFact } from '../../src/hazlenz/expert-hazlenz/owed-facts/owed-fact.types';

export const PROPERTY_PRESERVATION_AUDIT_205_VERSION =
  'hazlenz.expert.205.property-preservation-audit.v1' as const;

/**
 * The qualifier classes RR-4 names. Closed, so a fixture cannot invent a class and a suite counts
 * coverage rather than trusting a list.
 */
export const QUALIFIER_CLASSES = [
  'TEMPORAL',
  'BEFORE_AFTER_SEQUENCING',
  'CONJUNCTION',
  'ACTUAL_CONTROL_RESULT',
  'POINT_OR_LOCATION_OF_VERIFICATION',
  'EXPOSURE_CONDITION',
] as const;
export type QualifierClass = (typeof QUALIFIER_CLASSES)[number];

/**
 * The fields that actually reach the verifier, taken from the object §204 recorded as
 * "exactly what the verifier received". `missingFact` is deliberately absent -- that absence is the
 * thing under audit, not an oversight in this list.
 */
export const FIELDS_REACHING_THE_VERIFIER = [
  'affectedDecision', 'whyUnresolved', 'branchA', 'branchB',
  'decisionDivergence.ifA', 'decisionDivergence.ifB', 'evidenceSpan', 'acceptableEvidence',
] as const;
export type VerifierVisibleField = (typeof FIELDS_REACHING_THE_VERIFIER)[number];

/** The declaration-only field. Present at declaration time, absent from the verifier's object. */
export const DECLARATION_ONLY_FIELDS = ['missingFact', 'notEstablishedBecause', 'whyNecessaryNow',
  'declarationId', 'observationSourceId'] as const;

/**
 * One product-owner-reviewed annotation. `carriedBy` names EVERY field that carries the class, so
 * an audit can tell "survives in another field" from "survives only in `missingFact`".
 */
export interface QualifierAnnotation {
  readonly qualifier: QualifierClass;
  readonly carriedBy: readonly string[];
  /** Why this class is decision-critical for this property. Free text, product-owner authored. */
  readonly whyDecisionCritical: string;
}

export interface AnnotatedFactFixture {
  readonly fixtureId: string;
  readonly sourceRow: string;
  readonly declaration: StructuredUnresolvedFactDeclaration;
  readonly annotations: readonly QualifierAnnotation[];
  /** Recorded so the audit's conclusion can be checked against what the product owner actually said. */
  readonly section204AxisQVerdict: string | null;
}

export const PRESERVATION_OUTCOMES = [
  'SURVIVES_IN_VERIFIER_VISIBLE_FIELDS',
  'SURVIVES_ONLY_IN_DECLARATION_ONLY_FIELDS',
  'NOT_CARRIED_ANYWHERE',
] as const;
export type PreservationOutcome = (typeof PRESERVATION_OUTCOMES)[number];

export interface QualifierAuditRow {
  readonly fixtureId: string;
  readonly qualifier: QualifierClass;
  readonly outcome: PreservationOutcome;
  readonly survivingFields: readonly string[];
  /** True when the invariant is violated: the class reaches the verifier nowhere. */
  readonly invariantViolated: boolean;
}

export interface PropertyPreservationAudit {
  readonly version: typeof PROPERTY_PRESERVATION_AUDIT_205_VERSION;
  readonly rows: readonly QualifierAuditRow[];
  readonly violations: readonly QualifierAuditRow[];
  readonly invariantHolds: boolean;
  /** Stated so no reader mistakes this for something that can run on live model output. */
  readonly auditableAtRuntime: false;
  readonly auditableAtRuntimeBecause: string;
}

const isVerifierVisible = (field: string): boolean =>
  (FIELDS_REACHING_THE_VERIFIER as readonly string[]).includes(field);

/** Run the audit over annotated fixtures. Total and pure; reads no prose for meaning. */
export function auditPropertyPreservation(
  fixtures: readonly AnnotatedFactFixture[],
): PropertyPreservationAudit {
  const rows: QualifierAuditRow[] = [];
  for (const f of fixtures) {
    for (const a of f.annotations) {
      const surviving = a.carriedBy.filter(isVerifierVisible);
      const outcome: PreservationOutcome = surviving.length > 0
        ? 'SURVIVES_IN_VERIFIER_VISIBLE_FIELDS'
        : a.carriedBy.length > 0
          ? 'SURVIVES_ONLY_IN_DECLARATION_ONLY_FIELDS'
          : 'NOT_CARRIED_ANYWHERE';
      rows.push({
        fixtureId: f.fixtureId,
        qualifier: a.qualifier,
        outcome,
        survivingFields: surviving,
        invariantViolated: outcome !== 'SURVIVES_IN_VERIFIER_VISIBLE_FIELDS',
      });
    }
  }
  const violations = rows.filter(r => r.invariantViolated);
  return {
    version: PROPERTY_PRESERVATION_AUDIT_205_VERSION,
    rows,
    violations,
    invariantHolds: violations.length === 0,
    auditableAtRuntime: false,
    auditableAtRuntimeBecause:
      'the audit consumes product-owner-declared qualifier annotations. Deciding at runtime which '
      + 'qualifier classes a model-authored property depends on would be the §160 semantic matcher, '
      + 'which this programme retired and §196 forbids. RR-4 is therefore enforced by the R2 '
      + 'instruction at declaration time and checked here at design time, never inferred in flight.',
  };
}

// ================================================================ O1 versus O4

export const REPRESENTATION_CONCLUSION_205 = {
  baseline: 'O1_UNCHANGED',
  /** The product owner's standing direction, recorded so the conclusion cannot quietly exceed it. */
  productOwnerDirection:
    'Do NOT mutate canonical OwedFact merely because dedicated missingFact was absent from '
    + 'projection. Preserve O1 as the baseline. O4 may be considered ONLY as a small '
    + 'verifier-facing semantic sidecar if it provides material explicitness/reviewability benefit '
    + 'without changing authority boundaries or requiring deterministic semantic reconstruction.',
  section204Evidence: {
    factsAdjudicatedOnAxisQ: 8,
    noObservableLoss: 7,
    consequentialLoss: 1,
    consequentialLossCase: 'SF-06 / U09 — CLARIFICATION_INSUFFICIENCY',
    discriminatingTestsThatCameBackClean: [
      'U16 (the conjunctive row\'s second fact) Q=NO_OBSERVABLE_LOSS',
      'U19 (the only FP.EXPOSURE fact) Q=NO_OBSERVABLE_LOSS and M=CORRECT',
    ],
  },
  /**
   * The load-bearing argument, and it is not the ratio.
   *
   * Six of the eight §204 defect mechanisms (F1, F2, F4, F5, F7, F8) originate BEFORE projection —
   * in the declaration or the clarification wording. A representation change reaches none of them.
   * F6 is deterministic policy. Only F3 has a projection component, and the recorded product-owner
   * reasoning locates that fact's operative harm in the clarification, not in the missing field.
   */
  whyNotAMutation: [
    'F1, F2, F4, F7 are first-pass declaration defects — answered by the R2 instruction (§205).',
    'F3(clarification half) and F5 are clarification-wording defects — answered by RR-4/RR-5 in R2.',
    'F8 is a structural contract defect — answered by RR-7 preservation (§205).',
    'F6 is deterministic priority policy — RR-6, diagnostic only, D14 open.',
    'That leaves F3\'s projection half: one fact in eight, whose own record bars generalization.',
  ],
  conclusion: 'O1_RETAINED_AS_BASELINE',
  /**
   * O4 is not adopted in this slice, and the reason is a measured one rather than a preference:
   * after the R2 remediation the qualifier classes RR-4 names are required to be carried by
   * verifier-visible fields at declaration time, so the sidecar would duplicate content that is
   * already reaching the verifier. Its remaining benefit is reviewability — a human tracing a fact
   * back to its declaration — which is a real benefit and a weak one relative to its cost.
   */
  o4Disposition: 'AVAILABLE_NOT_ADOPTED',
  o4Costs: [
    'a second store that can disagree with the OwedFact it annotates',
    'migration and hash-pin consequence on every consumer that reads the projection',
    'a new place for a fact to exist without existing in the ledger',
  ],
  o4Benefits: [
    'a reviewer can reach the verbatim declaration from a factKey without re-reading the run log',
    'axis Q becomes directly measurable rather than reconstructed from the packet',
  ],
  o4RevisitTrigger:
    'a second consequential axis-Q loss in the fresh acceptance cohort, OR a recorded reviewer '
    + 'difficulty attributable to the missing back-reference. Either would move O4 from '
    + 'AVAILABLE_NOT_ADOPTED to adopted; neither exists on the §204 record.',
} as const;

/**
 * Build the O4 sidecar for a fact WITHOUT adopting it, so the cost claim above is measured rather
 * than asserted. Delegates entirely to §201's machinery — nothing is reimplemented here.
 */
export function buildO4SidecarForComparison(
  entries: readonly {
    readonly fact: OwedFact;
    readonly declaration: StructuredUnresolvedFactDeclaration;
  }[],
): { sidecar: DeclarationSidecar; records: readonly RetainedDeclarationRecord[] } {
  let sidecar: DeclarationSidecar = Object.freeze({});
  const records: RetainedDeclarationRecord[] = [];
  for (const e of entries) {
    const record = buildDeclarationRecord({
      factKey: e.fact.factKey,
      declaration: e.declaration,
      stage: 'FIRST_PASS_MODEL',
      owedProperty: e.declaration.missingFact,
    });
    sidecar = addToSidecar(sidecar, record);
    records.push(record);
  }
  return { sidecar, records };
}

/** Read-back helper used by the suite to show O4 would resolve, at the cost stated above. */
export function o4ResolvesProperty(sidecar: DeclarationSidecar, factKey: string): string | null {
  return owedPropertyFromSidecar(sidecar, factKey);
}

/** Asserted by the suite as literals. */
export function propertyPreservationEffect(): {
  providerCalls: 0; databaseOperations: 0;
  mutatesOwedFact: false; inferssQualifiersFromProse: false; adoptsO4: false;
} {
  return {
    providerCalls: 0, databaseOperations: 0,
    mutatesOwedFact: false, inferssQualifiersFromProse: false, adoptsO4: false,
  };
}
