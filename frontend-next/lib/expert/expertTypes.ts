/**
 * §265 — THE SERVER'S EXPERT CONTRACT, AS THE BROWSER SEES IT.
 *
 * ---------------------------------------------------------------------------------------------
 * THESE ARE MIRRORS, NOT MODELS.
 *
 * Every field here exists on the server in
 * `backend/src/safescope-v2/expert-hazlenz-product/expert-analysis-response.ts`, and this file
 * adds nothing to it. In particular there is no client-side notion of "is this settled", "does
 * this need confirming" or "what is this asking me" — those are `effectiveDecision.settledForUse`,
 * `confirmationRequired` and `confirmationSubject`, all served, all authoritative.
 *
 * THE SHAPES ARE DELIBERATELY PERMISSIVE WHERE THE PAYLOAD IS JSONB. `analysis` is the admitted
 * Expert representation, stored and served whole so that structural identities survive. A client
 * that declared a strict type for it would be asserting a contract it does not own, and the first
 * contract change would produce a silent type lie rather than a visible absence. It is read
 * through narrow accessors in `expertPresentation.ts` instead, each of which states what it does
 * when the field is missing.
 */

/** The eight server states. Mirrored so an unexpected value is visible rather than assumed. */
export type ExpertAnalysisState =
  | "ANALYSIS_RUNNING"
  | "ANALYSIS_FAILED"
  | "ANALYSIS_REFUSED"
  | "ANALYSIS_UNRESOLVED"
  | "ANALYSIS_AVAILABLE"
  | "ANALYSIS_AWAITING_CONFIRMATION"
  | "ANALYSIS_CONFIRMED"
  | "ANALYSIS_OVERRIDDEN";

/** Server-derived. The client never constructs one of these. */
export type ExpertEffectiveDecision = {
  version: string;
  source: string;
  /** TRUE only where an operational conclusion may be acted on. Read, never computed. */
  settledForUse: boolean;
  humanSettled: boolean;
  entries: Array<{
    refKind: string;
    ref: string;
    expertClassification: string;
    effectiveClassification: string;
    changedByHuman: boolean;
  }>;
  reviewer: { userId: string; at: string } | null;
  /** The server's own sentence. Rendered verbatim; never paraphrased into something stronger. */
  statement: string;
};

/** What the reviewer is being asked, as the server derived it. */
export type ExpertConfirmationSubject = {
  resolvable: boolean;
  entries: Array<{ refKind: string; ref: string; expertClassification: string }>;
  refusalCode: string | null;
  statement: string;
};

export type ExpertAnswerOption = { value: string; label: string; detail: string };

export type ExpertAnalysisHistoryEntry = {
  analysisId: string;
  producer: string;
  analysisState: string;
  requestVersion: number;
  status: string;
  createdAt: string;
  humanSettled: boolean;
};

export type ExpertSettlementRecord = {
  reviewId: string;
  decision: string;
  reviewedByUserId: string;
  reviewedAt: string;
  rationale: string;
  entries: Array<{
    refKind: string;
    ref: string;
    expertClassification: string;
    effectiveClassification: string;
    changedByHuman: boolean;
  }>;
};

export type ExpertProvenance = {
  candidateIdentity: string | null;
  contractVersion: string | null;
  entryVersion: string | null;
  admissionVersion: string | null;
  projectionVersion: string | null;
  confirmationRuleVersion: string | null;
  admission: string | null;
  verifierReached: boolean;
  verifierNotReachedBecause: string | null;
  requestedAt: string | null;
  completedAt: string | null;
};

/** GET /inspections/observations/:id/expert-analyses/current */
export type ExpertAnalysisRead = {
  responseVersion: string;
  present: boolean;
  analysisId: string | null;
  analysisState: ExpertAnalysisState | null;
  producer: string | null;
  confirmationRequired: boolean;
  confirmationSubject: ExpertConfirmationSubject | null;
  answerOptions: ExpertAnswerOption[];
  effectiveDecision: ExpertEffectiveDecision | null;
  authorityStatement: string | null;
  analysis: Record<string, unknown> | null;
  settlement: ExpertSettlementRecord | null;
  provenance: ExpertProvenance | null;
  failure: { kind: string; detail: string } | null;
  history: ExpertAnalysisHistoryEntry[];
  findingsReconciled: false;
};

/** POST /inspections/observations/:id/expert-analyses */
export type ExpertAnalysisExecuted = {
  responseVersion: string;
  outcome: string;
  executionId: string;
  executionState: string;
  analysisState: ExpertAnalysisState | null;
  confirmationRequired: boolean;
  confirmationSubject: ExpertConfirmationSubject | null;
  effectiveDecision: ExpertEffectiveDecision;
  authorityStatement: string;
  analysisId: string | null;
  producer: string | null;
  analysis: Record<string, unknown> | null;
  provenance: ExpertProvenance;
  failure: { kind: string; detail: string } | null;
  findingsReconciled: false;
};

/** POST .../expert-analyses/:analysisId/settlement */
export type ExpertSettlementResult = {
  responseVersion: string;
  outcome: string;
  analysisId: string;
  analysisState: ExpertAnalysisState;
  previousAnalysisState: string;
  decision: string;
  conclusionChanged: boolean;
  reviewId: string;
  reviewedByUserId: string;
  reviewedAt: string;
  rationale: string;
  entries: Array<{
    refKind: string;
    ref: string;
    expertClassification: string;
    effectiveClassification: string;
    changedByHuman: boolean;
  }>;
  effectiveDecision: ExpertEffectiveDecision;
  authorityStatement: string;
  findingsReconciled: false;
};
