import type { HazLenzAnalysis } from '../../inspection/entities/hazlenz-analysis.entity';
import type { ExpertAnalysisExecution } from './expert-analysis-execution.entity';
import type { AnalysisState } from './expert-analysis-authority';
import type { ExpertExecutionOutcome, } from './expert-analysis-execution.service';
import type { ExpertAnalysisReadModel, ExpertSettlementOutcome } from './expert-analysis.service';
import type { EffectiveDecision } from './expert-effective-decision';
import type { SubjectResolution } from './expert-settlement-contract';

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

/**
 * §265 — THE CONFIRMATION SUBJECT, AS THE CLIENT RECEIVES IT.
 *
 * THE QUESTION IS THE SERVER'S AND THE CLIENT ONLY RENDERS IT. `entries` are the named
 * `refKind:ref` pairs the confirmation rule actually fired on, each carrying what HazLenz claimed
 * in the two-member product vocabulary. A client cannot compute this list — it would have to
 * implement the confirmation rule over a posture to do so — and §265 requires that it never try.
 *
 * A SUBJECT THAT CANNOT BE ESTABLISHED IS NAMED, NOT EMPTIED. `resolvable: false` with a refusal
 * code is a different fact from "there is nothing to confirm", and only one of them means the
 * confirm control must not be offered. Collapsing them into an empty array is how a reviewer ends
 * up pressing Confirm on a question nobody can prove was asked.
 */
export interface ExpertConfirmationSubject {
  readonly resolvable: boolean;
  readonly entries: readonly {
    readonly refKind: string;
    readonly ref: string;
    readonly expertClassification: string;
  }[];
  readonly refusalCode: string | null;
  /** Plain language for the interface. Never a code on its own. */
  readonly statement: string;
}

/** The two values a reviewer may answer with, served so the client never hardcodes a vocabulary. */
export const CONFIRMATION_ANSWER_OPTIONS: readonly {
  readonly value: string; readonly label: string; readonly detail: string;
}[] = [
  {
    value: 'CONTROLS_WHETHER_WORK_CONTINUES',
    label: 'It decides whether work continues',
    detail: 'Work does not simply continue until this is resolved.',
  },
  {
    value: 'DOES_NOT_CONTROL_WHETHER_WORK_CONTINUES',
    label: 'It is a follow-up',
    detail: 'It still needs resolving, but it does not decide whether work continues now.',
  },
];

export function toConfirmationSubject(
  resolution: SubjectResolution | null,
): ExpertConfirmationSubject | null {
  if (resolution === null) return null;
  if (!resolution.ok) {
    return {
      resolvable: false,
      entries: [],
      refusalCode: resolution.code,
      statement: 'This analysis needs a person to settle its operational conclusion, and the '
        + 'product cannot currently establish exactly what it is asking. No decision can be '
        + 'recorded against it until that is resolved.',
    };
  }
  return {
    resolvable: true,
    entries: resolution.entries.map(entry => ({
      refKind: entry.refKind,
      ref: entry.ref,
      expertClassification: entry.expertClassification,
    })),
    refusalCode: null,
    statement: resolution.entries.length === 1
      ? 'HazLenz classified one unresolved item. Confirm whether it decides if work continues.'
      : `HazLenz classified ${resolution.entries.length} unresolved items. Confirm whether each `
        + 'decides if work continues.',
  };
}

export interface ExpertAnalysisResponse {
  readonly responseVersion: typeof EXPERT_ANALYSIS_RESPONSE_VERSION;
  readonly outcome: ExpertExecutionOutcome['outcome'];
  readonly executionId: string;
  readonly executionState: string;
  readonly analysisState: AnalysisState | null;
  readonly confirmationRequired: boolean;
  /**
   * §265. WHAT THE REVIEWER IS BEING ASKED, WHEN ANYTHING IS. Null where `confirmationRequired` is
   * false — there is no question — and a named refusal where the subject cannot be established.
   */
  readonly confirmationSubject: ExpertConfirmationSubject | null;
  /**
   * §265. THE SERVER-DERIVED AUTHORITY, SERVED ON THE EXECUTION RESPONSE TOO.
   *
   * §264 returned it only from the settlement route, which left the client that had just executed
   * an analysis with a state name and no answer to "may this be acted on". Every such client would
   * have derived one. It is the same value the downstream consumer reads, so the browser and the
   * server cannot form different opinions about whether a conclusion is settled.
   */
  readonly effectiveDecision: EffectiveDecision;
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
  effective: EffectiveDecision,
  subject: SubjectResolution | null,
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
    confirmationSubject: analysis?.confirmationRequired ? toConfirmationSubject(subject) : null,
    effectiveDecision: effective,
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


// ================================================================ §265 read

/**
 * §265 — WHAT THE FRONTEND READS, AND WHY IT IS A DIFFERENT SHAPE FROM THE EXECUTION RESPONSE.
 *
 * ---------------------------------------------------------------------------------------------
 * IT ANSWERS "WHAT IS TRUE NOW", NOT "WHAT DID THAT REQUEST DO".
 *
 * The execution response describes an act — an outcome, an execution id, a failure. This describes
 * a STATE, and it is what the interface renders on a fresh page load, after a retry, and after a
 * settlement. `present: false` is a first-class answer: this observation has no server-authored
 * Expert analysis, which is not an error and is not "no hazards".
 *
 * ---------------------------------------------------------------------------------------------
 * IT CARRIES THE SETTLEMENT AND THE PROPOSAL SEPARATELY, ALWAYS.
 *
 * `analysis` is the Expert proposal exactly as it was admitted — settlement never rewrites it —
 * and `settlement` is the human decision. A client rendering "HazLenz proposed X / the reviewer
 * decided Y" reads two fields; it never subtracts one from the other, and it can never present the
 * human value as something HazLenz authored.
 *
 * ---------------------------------------------------------------------------------------------
 * THE HISTORY DISTINGUISHES THE TWO TRUST BOUNDARIES, AND DOES NOT REWRITE THE OLDER ONE.
 *
 * Legacy rows are `client_supplied`: the server does not establish that what it stored equals what
 * it returned. Expert rows are `server_authored`. §265 requires that distinction to remain visible
 * rather than be normalised away, so `producer` is served per row and nothing back-fills it.
 *
 * The raw provider payload is absent here for the same reason it is absent from the execution
 * response: it is stored for comparison, not served because it is stored.
 */
export const EXPERT_ANALYSIS_READ_RESPONSE_VERSION = 'hazlenz.expert.265.read-response.v1' as const;

export interface ExpertAnalysisHistoryEntry {
  readonly analysisId: string;
  readonly producer: string;
  readonly analysisState: string;
  readonly requestVersion: number;
  readonly status: string;
  readonly createdAt: string;
  readonly humanSettled: boolean;
}

export interface ExpertAnalysisReadResponse {
  readonly responseVersion: typeof EXPERT_ANALYSIS_READ_RESPONSE_VERSION;
  /** FALSE means no server-authored Expert analysis exists here. Not an error, not "no hazards". */
  readonly present: boolean;
  readonly analysisId: string | null;
  readonly analysisState: AnalysisState | null;
  readonly producer: string | null;
  readonly confirmationRequired: boolean;
  readonly confirmationSubject: ExpertConfirmationSubject | null;
  readonly answerOptions: typeof CONFIRMATION_ANSWER_OPTIONS;
  readonly effectiveDecision: EffectiveDecision | null;
  readonly authorityStatement: string | null;
  /** The ADMITTED Expert proposal. Unchanged by any settlement. Never the raw provider payload. */
  readonly analysis: Record<string, unknown> | null;
  readonly settlement: {
    readonly reviewId: string;
    readonly decision: string;
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
  } | null;
  readonly provenance: {
    readonly candidateIdentity: string | null;
    readonly contractVersion: string | null;
    readonly entryVersion: string | null;
    readonly admissionVersion: string | null;
    readonly projectionVersion: string | null;
    readonly confirmationRuleVersion: string | null;
    readonly admission: string | null;
    readonly verifierReached: boolean;
    readonly verifierNotReachedBecause: string | null;
    readonly requestedAt: string | null;
    readonly completedAt: string | null;
  } | null;
  readonly failure: { readonly kind: string; readonly detail: string } | null;
  readonly history: readonly ExpertAnalysisHistoryEntry[];
  readonly findingsReconciled: false;
}

export function toExpertAnalysisReadResponse(
  model: ExpertAnalysisReadModel,
  effective: EffectiveDecision | null,
): ExpertAnalysisReadResponse {
  const history: ExpertAnalysisHistoryEntry[] = model.history.map(row => ({
    analysisId: row.id,
    producer: row.producer,
    analysisState: row.analysisState,
    requestVersion: row.requestVersion,
    status: row.status,
    createdAt: row.createdAt ? row.createdAt.toISOString() : '',
    humanSettled: row.settlementReviewId !== null && row.settlementReviewId !== undefined,
  }));

  const analysis = model.analysis;
  if (analysis === null) {
    return {
      responseVersion: EXPERT_ANALYSIS_READ_RESPONSE_VERSION,
      present: false,
      analysisId: null,
      analysisState: null,
      producer: null,
      confirmationRequired: false,
      confirmationSubject: null,
      answerOptions: CONFIRMATION_ANSWER_OPTIONS,
      effectiveDecision: null,
      authorityStatement: null,
      analysis: null,
      settlement: null,
      provenance: null,
      failure: null,
      history,
      findingsReconciled: false,
    };
  }

  const execution = model.execution;
  const review = model.settlement;
  const conclusion = review?.reviewedConclusion as {
    entries?: {
      refKind: string; ref: string; expertClassification: string;
      humanClassification: string; changed: boolean;
    }[];
  } | null | undefined;

  return {
    responseVersion: EXPERT_ANALYSIS_READ_RESPONSE_VERSION,
    present: true,
    analysisId: analysis.id,
    analysisState: analysis.analysisState,
    producer: analysis.producer,
    // The STORED flag, never recomputed on read — the §261 guarantee, preserved on the one surface
    // a reviewer actually looks at.
    confirmationRequired: analysis.confirmationRequired,
    confirmationSubject: toConfirmationSubject(model.subject),
    answerOptions: CONFIRMATION_ANSWER_OPTIONS,
    effectiveDecision: effective,
    authorityStatement: AUTHORITY_STATEMENT[analysis.analysisState],
    analysis: analysis.resultSnapshot as Record<string, unknown>,
    settlement: review === null || review === undefined ? null : {
      reviewId: review.id,
      decision: review.decision,
      reviewedByUserId: review.reviewedByUserId,
      reviewedAt: review.createdAt.toISOString(),
      rationale: review.rationale,
      entries: (conclusion?.entries ?? []).map(entry => ({
        refKind: entry.refKind,
        ref: entry.ref,
        expertClassification: entry.expertClassification,
        effectiveClassification: entry.humanClassification,
        changedByHuman: entry.changed,
      })),
    },
    provenance: execution === null ? null : {
      candidateIdentity: execution.candidateIdentity,
      contractVersion: execution.contractVersion,
      entryVersion: execution.entryVersion,
      admissionVersion: execution.admissionVersion,
      projectionVersion: execution.projectionVersion,
      confirmationRuleVersion: execution.confirmationRuleVersion,
      admission: execution.admission,
      verifierReached: execution.verifierReached,
      verifierNotReachedBecause: execution.verifierNotReachedBecause,
      requestedAt: execution.createdAt ? execution.createdAt.toISOString() : null,
      completedAt: execution.completedAt ? execution.completedAt.toISOString() : null,
    },
    failure: execution?.failureKind === null || execution?.failureKind === undefined
      ? null
      : { kind: execution.failureKind, detail: execution.failureDetail ?? '' },
    history,
    findingsReconciled: false,
  };
}
