import type { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import type { ExpertAnalysisExecution } from './expert-analysis-execution.entity';
import type { AnalysisState } from './expert-analysis-authority';
import type { ExpertExecutionOutcome, } from './expert-analysis-execution.service';
import type { ExpertSettlementOutcome } from './expert-analysis.service';
import type { EffectiveDecision } from './expert-effective-decision';

/**
 * §262 — THE PRODUCT-SAFE REPRESENTATION OF A SERVER-AUTHORED EXPERT ANALYSIS.
 *
 * ---------------------------------------------------------------------------------------------
 * THE CLIENT IS TOLD THE CONFIRMATION REQUIREMENT; IT NEVER HAS TO INFER IT.
 *
 * `confirmationRequired` is returned as the stored boolean, and `authorityStatement` says the same
 * thing in words the interface can render without deriving anything. A client that reads only the
 * state string, only the boolean, or only the sentence reaches the same conclusion — because a
 * requirement that has to be reconstructed from a state name is a requirement some client will
 * eventually reconstruct wrongly, and the failure would be silent approval.
 *
 * ---------------------------------------------------------------------------------------------
 * WORDS THIS FILE MAY NOT USE FOR AN UNCONFIRMED CONCLUSION.
 *
 * §262 forbids labelling an awaiting-confirmation analysis approved, final, settled or completed.
 * The statements below say what is true instead: the analysis exists, it may be reviewed, and its
 * operational conclusion is not yet settled by a person. `ANALYSIS_UNRESOLVED` and
 * `ANALYSIS_REFUSED` are likewise stated as what they are, because §260 section 12 names showing a
 * refused execution as ordinary output the worst thing this product could do.
 *
 * ---------------------------------------------------------------------------------------------
 * WHAT IS DELIBERATELY ABSENT.
 *
 * The raw provider payload, both legs. It is persisted on the execution record so that what the
 * provider returned can be compared with what deterministic HazLenz admitted, and it is not served
 * merely because it is stored. What the client receives is the ADMITTED, PROJECTED analysis — the
 * representation that crossed admission — under `analysis`.
 */
export const EXPERT_ANALYSIS_RESPONSE_VERSION = 'hazlenz.expert.262.response.v1' as const;

/**
 * One sentence per state, and no state without one. A map rather than a chain of conditionals so
 * that a state added later fails to compile instead of falling through to a benign default.
 */
const AUTHORITY_STATEMENT: Readonly<Record<AnalysisState, string>> = {
  ANALYSIS_RUNNING:
    'An Expert analysis is in progress for this observation. No result is available yet.',
  ANALYSIS_FAILED:
    'The Expert layer could not be reached, so it produced no analysis. This is not a finding that '
    + 'there are no hazards. The deterministic analysis is unaffected.',
  ANALYSIS_REFUSED:
    'The Expert layer answered and the answer did not meet the contract, so it was refused in full '
    + 'and no part of it is shown. The deterministic analysis is unaffected.',
  ANALYSIS_UNRESOLVED:
    'The Expert output was refused, and the unresolved facts it stated for itself have been '
    + 'preserved. No operational conclusion is being offered.',
  ANALYSIS_AVAILABLE:
    'This Expert analysis is available for review. No human confirmation of its operational '
    + 'conclusion is required.',
  ANALYSIS_AWAITING_CONFIRMATION:
    'This Expert analysis is available for review, and its operational conclusion requires a '
    + 'person to confirm it before it is acted on. It has not been confirmed.',
  ANALYSIS_CONFIRMED:
    'A person confirmed this Expert analysis\'s operational conclusion as authored.',
  ANALYSIS_OVERRIDDEN:
    'A person replaced this Expert analysis\'s operational conclusion.',
};

export interface ExpertAnalysisResponse {
  readonly responseVersion: typeof EXPERT_ANALYSIS_RESPONSE_VERSION;
  readonly outcome: ExpertExecutionOutcome['outcome'];
  readonly executionId: string;
  readonly executionState: string;
  readonly analysisState: AnalysisState | null;
  readonly confirmationRequired: boolean;
  readonly authorityStatement: string;
  readonly analysisId: string | null;
  readonly producer: string | null;
  /** The ADMITTED representation. Never the raw provider payload. */
  readonly analysis: Record<string, unknown> | null;
  readonly provenance: {
    readonly candidateIdentity: string | null;
    readonly contractVersion: string | null;
    readonly entryVersion: string | null;
    readonly admissionVersion: string | null;
    readonly projectionVersion: string | null;
    readonly confirmationRuleVersion: string | null;
    readonly admission: string | null;
    readonly verifierReached: boolean;
    readonly verifierFactKey: string | null;
    readonly verifierNotReachedBecause: string | null;
    readonly requestedAt: string | null;
    readonly completedAt: string | null;
  };
  readonly failure: { readonly kind: string; readonly detail: string } | null;
  /**
   * §262 preserves §261's deliberate decision: an Expert result awaiting confirmation does not
   * become an operational conclusion downstream. Stated in the response so no client believes a
   * finding was created.
   */
  readonly findingsReconciled: false;
}

export function toExpertAnalysisResponse(
  result: ExpertExecutionOutcome,
): ExpertAnalysisResponse {
  const execution: ExpertAnalysisExecution = result.execution;
  const analysis: HazLenzAnalysis | null = result.analysis;
  const state = (analysis?.analysisState ?? null) as AnalysisState | null;
  const effectiveState: AnalysisState =
    state ?? (execution.executionState as AnalysisState);

  return {
    responseVersion: EXPERT_ANALYSIS_RESPONSE_VERSION,
    outcome: result.outcome,
    executionId: execution.id,
    executionState: execution.executionState,
    analysisState: state,
    // The STORED value, never recomputed here. §261 computes it once at persistence time precisely
    // so that a later rule change cannot alter what an earlier reviewer was asked, and recomputing
    // it on read would undo that in the one place a reviewer actually looks.
    confirmationRequired: analysis?.confirmationRequired ?? false,
    authorityStatement: AUTHORITY_STATEMENT[effectiveState],
    analysisId: analysis?.id ?? null,
    producer: analysis?.producer ?? null,
    analysis: analysis ? (analysis.resultSnapshot as Record<string, unknown>) : null,
    provenance: {
      candidateIdentity: execution.candidateIdentity,
      contractVersion: execution.contractVersion,
      entryVersion: execution.entryVersion,
      admissionVersion: execution.admissionVersion,
      projectionVersion: execution.projectionVersion,
      confirmationRuleVersion: execution.confirmationRuleVersion,
      admission: execution.admission,
      verifierReached: execution.verifierReached,
      verifierFactKey: execution.verifierFactKey,
      verifierNotReachedBecause: execution.verifierNotReachedBecause,
      requestedAt: execution.createdAt ? execution.createdAt.toISOString() : null,
      completedAt: execution.completedAt ? execution.completedAt.toISOString() : null,
    },
    failure: execution.failureKind === null || execution.failureKind === undefined
      ? null
      : { kind: execution.failureKind, detail: execution.failureDetail ?? '' },
    findingsReconciled: false,
  };
}


// ================================================================ §264 settlement

/**
 * §264 — WHAT A REVIEWER'S CLIENT GETS BACK AFTER SETTLING A CLASSIFICATION.
 *
 * IT CARRIES BOTH SIDES, ALWAYS. §264 requires the later frontend to render the original-versus-
 * effective distinction without reconstructing authority semantics, so every entry states what
 * HazLenz claimed, what the human settled, and whether those differ. A client that renders only
 * `effectiveClassification` is still correct; a client that wants to show the disagreement has the
 * data without asking a second question.
 *
 * THE EFFECTIVE DECISION IS SERVER-DERIVED AND INCLUDED WHOLE. It is the same value every future
 * downstream consumer will read, so the client and the server cannot form different opinions about
 * whether a conclusion is settled.
 *
 * THE RAW EXPERT OUTPUT IS NOT HERE, and neither is the analysis snapshot: this is the response to
 * a DECISION, not a re-read of the analysis. The analysis is unchanged and can be read where it
 * always could.
 */
export const EXPERT_SETTLEMENT_RESPONSE_VERSION = 'hazlenz.expert.264.settlement-response.v1' as const;

export interface ExpertSettlementResponse {
  readonly responseVersion: typeof EXPERT_SETTLEMENT_RESPONSE_VERSION;
  /** `SETTLED` for the decision that took effect, `REPLAYED` for a retry of that same request. */
  readonly outcome: ExpertSettlementOutcome['outcome'];
  readonly analysisId: string;
  readonly analysisState: AnalysisState;
  readonly previousAnalysisState: 'ANALYSIS_AWAITING_CONFIRMATION';
  readonly decision: string;
  readonly conclusionChanged: boolean;
  readonly reviewId: string;
  readonly reviewedByUserId: string;
  readonly reviewedAt: string;
  readonly rationale: string;
  readonly entries: readonly {
    readonly refKind: string;
    readonly ref: string;
    readonly expertClassification: string;
    readonly effectiveClassification: string;
    readonly changedByHuman: boolean;
  }[];
  /** The server-derived authority. The client never reconstructs this. */
  readonly effectiveDecision: EffectiveDecision;
  readonly provenance: {
    readonly producer: string;
    readonly expertExecutionId: string | null;
    /** The Expert proposal is untouched by settlement; this is where it still lives. */
    readonly expertResultUnmodified: true;
  };
  /** §264 activates no downstream consumer. Stated so no client infers otherwise. */
  readonly findingsReconciled: false;
  readonly authorityStatement: string;
}

export function toExpertSettlementResponse(
  result: ExpertSettlementOutcome,
  effective: EffectiveDecision,
): ExpertSettlementResponse {
  const analysis = result.analysis;
  return {
    responseVersion: EXPERT_SETTLEMENT_RESPONSE_VERSION,
    outcome: result.outcome,
    analysisId: analysis.id,
    analysisState: analysis.analysisState,
    previousAnalysisState: 'ANALYSIS_AWAITING_CONFIRMATION',
    decision: result.review.decision,
    conclusionChanged: result.settledEntries.some(entry => entry.changed),
    reviewId: result.review.id,
    reviewedByUserId: result.review.reviewedByUserId,
    reviewedAt: result.review.createdAt.toISOString(),
    rationale: result.review.rationale,
    entries: result.settledEntries.map(entry => ({
      refKind: entry.refKind,
      ref: entry.ref,
      expertClassification: entry.expertClassification,
      effectiveClassification: entry.humanClassification,
      changedByHuman: entry.changed,
    })),
    effectiveDecision: effective,
    provenance: {
      producer: analysis.producer,
      expertExecutionId: analysis.expertExecutionId,
      expertResultUnmodified: true,
    },
    findingsReconciled: false,
    authorityStatement: effective.statement,
  };
}
