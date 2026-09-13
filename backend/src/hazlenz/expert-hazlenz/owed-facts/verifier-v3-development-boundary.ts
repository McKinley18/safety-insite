/**
 * EXPERT HAZLENZ -- VERIFIER-v3 DEVELOPMENT BOUNDARY. §170. DEFAULT OFF, AND OFF IS A TYPE.
 *
 * ==================== HOW THIS IS KEPT INACTIVE ====================
 *
 * `EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED` is declared `false` with a LITERAL type. TypeScript
 * itself carries the guarantee: no runtime value can make it true, no environment is consulted, and
 * there is nothing to misconfigure. The gate reads no configuration at all, which is stronger than
 * reading one and defaulting it off -- a default can be overridden by a deployment, and this cannot.
 *
 * There is no customer-facing toggle, and there is no code path from a credential's presence to
 * enablement, because nothing here knows what a credential is.
 *
 * ==================== WHAT IS AND IS NOT GATED ====================
 *
 * The deterministic machinery -- ledger, binding, coverage, question projection -- is PURE and
 * directly callable, which is what makes it testable. Calling it computes state; it contacts
 * nothing and decides nothing on the customer path.
 *
 * What the gate governs is the STAGE: attaching owed-fact coverage to a merged result, and
 * projecting owed facts into a verifier request. Under the current constant that stage returns an
 * inert result and attaches nothing.
 *
 * ==================== NO PROVIDER CALL EXISTS HERE ====================
 *
 * This module builds the PROJECTION a verifier request would carry. It does not send one, and it
 * imports nothing that could. Execution remains unauthorized.
 */

import type { AcceptableEvidence, OwedFact } from './owed-fact.types';
import { type OwedFactLedger, unresolvedFacts } from './owed-fact-ledger';
import type { TargetCoverageResult } from './owed-fact-binding';
import type { StructuralQuestion } from './structural-questions';

/**
 * THE GATE. A literal `false`.
 *
 * Changing this is a deliberate, reviewable, single-line act that a compiler will follow into every
 * branch that depends on it.
 */
export const EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED: false = false;

export const VERIFIER_V3_BOUNDARY_VERSION = 'hazlenz.expert.verifier-v3-boundary.v1' as const;

/** Recorded in code so the reason for inactivity is never inferred from its absence. */
export const VERIFIER_V3_INACTIVE_REASONS: readonly string[] = [
  'customer activation is blocked on human-authoritative silence-control truth, of which there are '
    + 'currently zero rows',
  'clarification evidence sufficiency requires remediation and remains a human-sampling obligation',
  'the customer-visible question surface is not designed and its burden is unmeasurable while no '
    + 'silence-control truth exists',
  'hosted verifier execution under this protocol is separately unauthorized',
];

export interface VerifierV3BoundaryState {
  readonly enabled: false;
  readonly version: typeof VERIFIER_V3_BOUNDARY_VERSION;
  readonly reasons: readonly string[];
  readonly readsConfiguration: false;
  readonly customerFacingToggleExists: false;
}

export function verifierV3BoundaryState(): VerifierV3BoundaryState {
  return {
    enabled: EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED,
    version: VERIFIER_V3_BOUNDARY_VERSION,
    reasons: VERIFIER_V3_INACTIVE_REASONS,
    readsConfiguration: false,
    customerFacingToggleExists: false,
  };
}

// ---------------------------------------------------------------- the gated stage

/** What the stage would attach to a merged result. Never produced while the gate is off. */
export interface OwedFactCoverageAttachment {
  readonly contractVersion: string;
  readonly owedFacts: readonly OwedFact[];
  readonly coverage: TargetCoverageResult;
  readonly questions: readonly StructuralQuestion[];
  readonly unresolvedLifeCriticalFactKeys: readonly string[];
}

export interface OwedFactStageResult {
  readonly attached: boolean;
  readonly attachment: OwedFactCoverageAttachment | null;
  readonly reason: string;
}

/**
 * The single entry point by which owed-fact coverage could reach a merged result.
 *
 * Under the current constant it returns `attached: false` and `attachment: null` on every input.
 * The branch below is not dead code kept for tidiness -- it is the shape the stage will take, held
 * behind a gate a reviewer can find by grepping one identifier.
 */
export function runOwedFactCoverageStage(
  input: {
    ledger: OwedFactLedger;
    coverage: TargetCoverageResult;
    questions: readonly StructuralQuestion[];
  },
): OwedFactStageResult {
  if (!EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED) {
    return {
      attached: false,
      attachment: null,
      reason: 'EXPERT_VERIFIER_V3_DEVELOPMENT_ENABLED is false; the owed-fact stage attaches '
        + 'nothing and the merged result is unchanged',
    };
  }
  /* istanbul ignore next -- unreachable while the gate is the literal false. */
  return {
    attached: true,
    attachment: {
      contractVersion: VERIFIER_V3_BOUNDARY_VERSION,
      owedFacts: input.ledger.facts,
      coverage: input.coverage,
      questions: input.questions,
      unresolvedLifeCriticalFactKeys: unresolvedFacts(input.ledger)
        .filter(f => f.priority === 'LIFE_CRITICAL').map(f => f.factKey),
    },
    reason: 'attached',
  };
}

// ---------------------------------------------------------------- verifier input projection

/**
 * The owed-fact shape a verifier request would carry. Deterministic and byte-testable.
 *
 * NOT projected, and asserted absent by the proof suite: human dispositions, pass/fail status,
 * historical success rates, expected questions, fixture labels, priority, source, or status. The
 * verifier is told what is unresolved and what would settle it -- nothing about how it is graded.
 */
export interface ProjectedOwedFact {
  readonly factKey: string;
  readonly affectedDecision: string;
  /**
   * Null for any fact that is not `UNRESOLVED`. `projectOwedFactsForVerifier` projects unresolved
   * facts only, so through that path this is always a string; the null exists so a direct
   * `projectOwedFact` call on a settled fact carries null rather than an invented sentence.
   */
  readonly whyUnresolved: string | null;
  readonly branchA: string;
  readonly branchB: string;
  readonly decisionDivergence: { readonly ifA: string; readonly ifB: string };
  readonly evidenceSpan: string;
  /** Present only when HazLenz holds a criterion from a permitted source. Null is normal. */
  readonly acceptableEvidence: ProjectedAcceptableEvidence | null;
}

export interface ProjectedAcceptableEvidence {
  readonly requirement: string;
  readonly examples: readonly string[];
  readonly insufficientExamples: readonly string[];
}

/**
 * Project one owed fact. Pure, total, and stable: the same fact projects to the same bytes every
 * time, which is what lets a pre-spend gate hash a request before it is sent.
 *
 * `provenance` is deliberately dropped: it governs whether the criterion may EXIST, and the
 * verifier has no use for it. Telling a model that a criterion came from a governed record invites
 * it to weigh criteria by source, which is not its job.
 */
export function projectOwedFact(f: OwedFact): ProjectedOwedFact {
  return {
    factKey: f.factKey,
    affectedDecision: f.affectedDecision,
    whyUnresolved: f.whyUnresolved,
    branchA: f.branchA,
    branchB: f.branchB,
    decisionDivergence: { ifA: f.decisionDivergence.ifA, ifB: f.decisionDivergence.ifB },
    evidenceSpan: f.evidenceSpan,
    acceptableEvidence: projectAcceptableEvidence(f.acceptableEvidence),
  };
}

export function projectAcceptableEvidence(
  e: AcceptableEvidence | null,
): ProjectedAcceptableEvidence | null {
  if (e === null) return null;
  return {
    requirement: e.requirement,
    examples: [...(e.examples ?? [])],
    insufficientExamples: [...(e.insufficientExamples ?? [])],
  };
}

/** Project the unresolved facts of a ledger, in admission order. */
export function projectOwedFactsForVerifier(l: OwedFactLedger): readonly ProjectedOwedFact[] {
  return unresolvedFacts(l)
    .slice()
    .sort((a, b) => l.admittedKeys.indexOf(a.factKey) - l.admittedKeys.indexOf(b.factKey))
    .map(projectOwedFact);
}

/**
 * Field names that must never appear in a projection. Asserted by the proof suite against the
 * serialised output rather than trusted.
 */
export const PROJECTION_FORBIDDEN_FIELDS: readonly string[] = [
  'disposition', 'status', 'priority', 'source', 'modelAuthored', 'provenance',
  'expectedQuestion', 'rowId', 'authoredClass', 'humanSemanticTarget', 'acceptableSelectors',
];
