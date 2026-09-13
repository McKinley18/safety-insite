/**
 * §261 — PRODUCER AUTHORITY AND THE EXPLICIT PRODUCT ANALYSIS STATE.
 *
 * TWO CLOSED VOCABULARIES AND ONE DETERMINISTIC DERIVATION. Nothing here is free text, nothing is
 * inferred from prose, and nothing a client sends can reach any of it.
 *
 * ---------------------------------------------------------------------------------------------
 * THE PRODUCER DISCRIMINATOR IS THE TRUST BOUNDARY, MADE EXPLICIT IN DATA.
 *
 * The deterministic HazLenz path is honest about what it is: the frontend calls
 * /safescope-v2/classify, holds the result client-side, and later posts that snapshot back for
 * persistence with a hardcoded `engineVersion`. The server does not establish that the snapshot it
 * stores equals the analysis it previously returned. That is ACCEPTABLE for the deterministic
 * advisory path and it must never become the authority for Expert.
 *
 * So the discriminator records which of the two it was, and the two values mean different things:
 *
 *   client_supplied  — the row's content arrived in a request body. It may be a faithful copy of
 *                      what the server computed; the server does not claim to know.
 *   server_authored  — the row's content was produced inside a server-owned execution the server
 *                      itself initiated, under an execution record it created before any spend.
 *
 * SERVER-AUTHORED PROVENANCE CANNOT BE CONFERRED BY METADATA. Setting `engineVersion`, a candidate
 * identity, a producer value, a confirmation state or any other field on a client-supplied
 * snapshot does not make it server-authored, and no code path exists that does so. Provenance
 * arises only from having actually run the server-owned path. This is why `producer` is assigned in
 * exactly two places in the codebase — the legacy persistence path writes `client_supplied`, the
 * Expert service writes `server_authored` — and never from a DTO.
 *
 * HISTORICAL ROWS ARE `client_supplied` BECAUSE THAT IS WHAT THEY ARE. Every row in
 * `hazlenz_analyses` today was written by the snapshot-posting path. The migration's backfill
 * therefore states a fact rather than a convenience. Nothing is retrospectively promoted, and if a
 * row's provenance had been genuinely unknown the honest value would still have been
 * `client_supplied` — the weaker claim — never `server_authored`.
 */
export const ANALYSIS_PRODUCERS = ['client_supplied', 'server_authored'] as const;
export type AnalysisProducer = (typeof ANALYSIS_PRODUCERS)[number];

/**
 * ---------------------------------------------------------------------------------------------
 * THE PRODUCT ANALYSIS STATE, frozen by §260 section 7.
 *
 * WHY A NEW FIELD RATHER THAN REUSING SOMETHING. `advisoryStatus` is fixed at `advisory` and means
 * "this layer advises, it does not decide" — a permanent property of the product, not a lifecycle.
 * `status` means current/superseded, which is about revision, not authority. `human_reviews.decision`
 * means a reviewer accepted or rejected a FINDING; reusing it for classification confirmation would
 * destroy the distinction between "a human reviewed this finding" and "a human settled the
 * operational classification". Overloading any of the three would make the missing state
 * unrepresentable while appearing to represent it, which is worse than not having it.
 *
 * THE STATE THE PRODUCT DOES NOT HAVE TODAY IS ANALYSIS_AWAITING_CONFIRMATION: the analysis exists
 * and may be presented AS ANALYSIS, while its consequential operational conclusion is not yet
 * settled by the product. Silence is never confirmation; the absence of a decision renders as this
 * state and never as either answer.
 *
 * NAMING NOTE — a documented mechanical equivalence, not a divergence. The §261 authorization lists
 * the admitted-and-settled state as ANALYSIS_AVAILABLE_NO_CONFIRMATION_REQUIRED. §260 froze it as
 * ANALYSIS_AVAILABLE. This module uses the FROZEN §260 name, because the "no confirmation required"
 * half of the longer name is not an independent fact: it is exactly the persisted
 * `confirmationRequired = false`, stored on the same row and derived by the same rule in the same
 * transaction. The pair (ANALYSIS_AVAILABLE, confirmationRequired = false) is therefore
 * semantically identical to ANALYSIS_AVAILABLE_NO_CONFIRMATION_REQUIRED, and the pair
 * (ANALYSIS_AWAITING_CONFIRMATION, confirmationRequired = true) is the only other admitted shape
 * the derivation can produce. Encoding the flag twice — once in the state name and once in the
 * column — would create two places to disagree, which is the defect class §253 was about. The
 * eight distinct states §261 requires are all representable, and no state is collapsed.
 */
export const ANALYSIS_STATES = [
  /** The execution record exists and no authoritative result has been persisted yet. */
  'ANALYSIS_RUNNING',
  /** The provider was not callable: transport failure, timeout, credits. Not a semantic answer. */
  'ANALYSIS_FAILED',
  /** The provider answered and deterministic admission refused the whole output. */
  'ANALYSIS_REFUSED',
  /** Admission refused while RR-7 preserved unresolved truth the model itself supplied. */
  'ANALYSIS_UNRESOLVED',
  /** Admitted, and the confirmation rule determined no confirmation is required. */
  'ANALYSIS_AVAILABLE',
  /** Admitted, and the confirmation rule required a human to settle the classification. */
  'ANALYSIS_AWAITING_CONFIRMATION',
  /** A human confirmed the classification as authored. Reached in a later slice. */
  'ANALYSIS_CONFIRMED',
  /** A human replaced the classification. Reached in a later slice. */
  'ANALYSIS_OVERRIDDEN',
] as const;
export type AnalysisState = (typeof ANALYSIS_STATES)[number];

/**
 * The states a §261 derivation may produce. ANALYSIS_CONFIRMED and ANALYSIS_OVERRIDDEN are
 * reachable only through a human action, which is slice 6 and is NOT implemented here — so nothing
 * in this slice may assign them, and the set is stated rather than left implicit.
 */
export const MACHINE_DERIVABLE_ANALYSIS_STATES: readonly AnalysisState[] = [
  'ANALYSIS_RUNNING', 'ANALYSIS_FAILED', 'ANALYSIS_REFUSED', 'ANALYSIS_UNRESOLVED',
  'ANALYSIS_AVAILABLE', 'ANALYSIS_AWAITING_CONFIRMATION',
];

/**
 * The states in which a human must settle the classification before the analysis's operational
 * conclusion may be treated as authoritative. Consumed by the downstream authority guards in a
 * later slice; stated here so there is one definition rather than one per call site.
 */
export const STATES_PENDING_HUMAN_AUTHORITY: readonly AnalysisState[] = [
  'ANALYSIS_AWAITING_CONFIRMATION',
];

/**
 * The legacy deterministic path's state. A client-supplied snapshot is an advisory analysis that is
 * available for display and carries no server-authored operational conclusion, so there is nothing
 * for a human to confirm and no confirmation rule runs on it. It is NOT
 * ANALYSIS_AWAITING_CONFIRMATION: claiming a legacy row is awaiting a confirmation the product
 * never asks for would make the awaiting-confirmation state meaningless on the row where it
 * matters.
 */
export const CLIENT_SUPPLIED_ANALYSIS_STATE: AnalysisState = 'ANALYSIS_AVAILABLE';

/**
 * The deterministic outcome of one Expert execution, as the entry point reports it. Mirrors
 * `ExpertHazLenzResult`'s `status` and `admission` without importing the entry point, so this
 * module stays a pure vocabulary and the state derivation can be tested on literals.
 */
export interface ExpertOutcomeForState {
  readonly status: 'COMPLETE' | 'FIRST_PASS_REFUSED' | 'PROVIDER_FAILED';
  readonly admission: 'ADMIT' | 'REFUSE' | 'PRESERVE_UNRESOLVED' | null;
  readonly confirmationRequired: boolean;
}

/**
 * THE STATE DERIVATION. Total over the outcome vocabulary, and deliberately ordered so that
 * availability is the LAST thing it can conclude.
 *
 * A user must never see a generic successful analysis when the authoritative server result was
 * refused — §260 section 12 names this the single most important rule in the product table. The
 * ordering below is what enforces it: transport failure, then whole-output refusal, then preserved
 * unresolved truth, and only an explicit ADMIT reaches the two available states. There is no
 * default branch that resolves an unrecognised combination to something benign; an unrecognised
 * combination throws, because a state this function cannot derive is a defect in the layer above
 * and must not be papered over with a plausible-looking value.
 */
export function deriveAnalysisState(outcome: ExpertOutcomeForState): AnalysisState {
  if (outcome.status === 'PROVIDER_FAILED') return 'ANALYSIS_FAILED';
  if (outcome.admission === 'PRESERVE_UNRESOLVED') return 'ANALYSIS_UNRESOLVED';
  if (outcome.status === 'FIRST_PASS_REFUSED' || outcome.admission === 'REFUSE') {
    return 'ANALYSIS_REFUSED';
  }
  if (outcome.status === 'COMPLETE' && outcome.admission === 'ADMIT') {
    return outcome.confirmationRequired ? 'ANALYSIS_AWAITING_CONFIRMATION' : 'ANALYSIS_AVAILABLE';
  }
  // COMPLETE with a null admission is not a success the product can render: the admission layer
  // did not reach a disposition, so no one has established the output is admissible.
  throw new Error('EXPERT_ANALYSIS_STATE_261_ABORT: no state is derivable for status '
    + `${outcome.status} with admission ${String(outcome.admission)}; the entry point reported a `
    + 'combination this derivation does not recognise and no benign default is permitted');
}

/** TRUE when the state means an authoritative Expert result exists that may be shown as analysis. */
export function analysisStateCarriesExpertContent(state: AnalysisState): boolean {
  return state === 'ANALYSIS_AVAILABLE' || state === 'ANALYSIS_AWAITING_CONFIRMATION'
    || state === 'ANALYSIS_CONFIRMED' || state === 'ANALYSIS_OVERRIDDEN';
}

// ================================================================ execution lifecycle

/**
 * THE EXECUTION RECORD'S OWN STATE, drawn from the SAME vocabulary as the analysis state.
 *
 * One vocabulary rather than two, because the execution and the analysis it produces describe the
 * same event from two sides, and two parallel enums would invite them to disagree. An execution
 * only ever occupies the machine-derivable subset: a human confirming a classification changes the
 * ANALYSIS's authority, not the fact of the execution that produced it.
 */
export type ExpertExecutionState = Extract<AnalysisState,
  'ANALYSIS_RUNNING' | 'ANALYSIS_FAILED' | 'ANALYSIS_REFUSED' | 'ANALYSIS_UNRESOLVED'
  | 'ANALYSIS_AVAILABLE' | 'ANALYSIS_AWAITING_CONFIRMATION'>;

/**
 * WHAT A DUPLICATE REQUEST DISCOVERS. Returned by the pre-spend claim so a caller can act on a
 * collision WITHOUT calling the provider. The whole point of the mechanism is that this is decided
 * before any money is spent.
 */
export const EXECUTION_CLAIM_OUTCOMES = [
  /** No execution existed under this identity. This caller owns it and may proceed to spend. */
  'CLAIMED',
  /** An execution under this identity is in flight. The caller must not spend. */
  'ALREADY_RUNNING',
  /** An execution under this identity already produced an authoritative result. */
  'ALREADY_COMPLETED',
  /**
   * An execution under this identity failed in a way that MAY be retried: the provider was not
   * callable, so no semantic answer was ever obtained.
   */
  'ALREADY_FAILED_RETRYABLE',
  /**
   * An execution under this identity failed in a way that must NOT be retried: the provider DID
   * answer and deterministic admission refused it. Re-spending would be shopping for a different
   * answer to the same question, which is exactly what a fail-closed refusal exists to prevent.
   */
  'ALREADY_FAILED_TERMINAL',
] as const;
export type ExecutionClaimOutcome = (typeof EXECUTION_CLAIM_OUTCOMES)[number];

/**
 * How an existing execution's persisted state classifies a duplicate request. Deterministic, and
 * derived from the state alone — never from an attempt counter, a timestamp or a retry policy.
 * §260 froze the adapter's classified retry policy and this does not re-implement it: this answers
 * only "may this identity be executed again at all".
 */
export function classifyExistingExecution(state: ExpertExecutionState): ExecutionClaimOutcome {
  switch (state) {
    case 'ANALYSIS_RUNNING':
      return 'ALREADY_RUNNING';
    case 'ANALYSIS_FAILED':
      return 'ALREADY_FAILED_RETRYABLE';
    case 'ANALYSIS_REFUSED':
    case 'ANALYSIS_UNRESOLVED':
      return 'ALREADY_FAILED_TERMINAL';
    case 'ANALYSIS_AVAILABLE':
    case 'ANALYSIS_AWAITING_CONFIRMATION':
      return 'ALREADY_COMPLETED';
    default: {
      // Exhaustiveness is enforced by the type, so this is unreachable rather than defensive. It
      // throws instead of returning a permissive value because the only safe answer to "I cannot
      // classify this execution" is to refuse to spend again.
      const unreachable: never = state;
      throw new Error(`EXPERT_EXECUTION_261_ABORT: unclassified execution state ${String(unreachable)}`);
    }
  }
}

/** TRUE when a claim outcome means this caller may proceed to a provider call. */
export function claimPermitsProviderSpend(outcome: ExecutionClaimOutcome): boolean {
  return outcome === 'CLAIMED';
}
